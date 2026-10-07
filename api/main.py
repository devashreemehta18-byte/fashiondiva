import io
import os
import uuid
import numpy as np
import pandas as pd
from PIL import Image
from pathlib import Path
from typing import Optional, List, Dict
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from src.config import load_config
from src.data_prep import parse_polyvore_dataset
from src.embeddings import FeatureExtractor
from src.similarity import FAISSIndexManager
from src.category import CategoryDetector
from src.color import detect_dominant_color
from src.style import StyleClassifier
from src.color_theory import recommend_matching_colors
from src.compatibility import CompatibilityPredictor
from src.outfit_generator import OutfitGenerator
from api.database import init_db, save_favourite_outfit, get_favourite_outfits, delete_favourite_outfit

app = FastAPI(
    title="Fashion Compatibility Recommendation API",
    description="CLIP + FAISS + PyTorch compatibility engine for outfit recommendation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global lazy-loaded state
STATE = {}
TEMP_EMBEDDINGS = {}

def get_state():
    if "initialized" in STATE:
        return STATE

    print("Initializing FastAPI Recommendation Engine State...")
    config = load_config()
    
    # 1. Dataset metadata
    raw_dir = Path(config["dataset"]["raw_dir"])
    processed_dir = Path(config["dataset"]["processed_dir"])
    meta_path = Path(config["dataset"]["metadata_file"])
    
    if not meta_path.exists():
        df = parse_polyvore_dataset(raw_dir, processed_dir)
    else:
        df = pd.read_csv(meta_path)
        
    # 2. Extractor
    extractor = FeatureExtractor(
        model_type=config["model"]["type"],
        model_name=config["model"]["clip_model_name"],
        device=config["model"]["device"]
    )
    
    # 3. Embeddings
    save_dir = Path(config["embeddings"]["save_dir"])
    embeddings, item_ids = extractor.extract_dataset_embeddings(
        df, save_dir=save_dir, batch_size=config["model"]["batch_size"]
    )
    
    # 4. FAISS Manager
    faiss_mgr = FAISSIndexManager(index_dir=Path(config["indexes"]["save_dir"]))
    try:
        faiss_mgr.load_indexes()
    except Exception:
        faiss_mgr.build_indexes(embeddings, item_ids, df)
        
    # 5. Category & Style detector
    cat_detector = CategoryDetector()
    style_clf = StyleClassifier()
    
    # 6. Compatibility Model
    model_path = Path(config["compatibility_model"]["save_path"])
    compat_predictor = CompatibilityPredictor(
        model_path=model_path,
        embedding_dim=extractor.embedding_dim,
        device=extractor.device
    )
    if not model_path.exists():
        print("Compatibility model checkpoint not found. Training model...")
        compat_predictor.train_model(
            df, embeddings, item_ids, save_path=model_path, epochs=config["compatibility_model"]["epochs"]
        )

    # 7. Outfit Generator
    outfit_gen = OutfitGenerator(
        metadata_df=df,
        embeddings=embeddings,
        item_ids=item_ids,
        faiss_manager=faiss_mgr,
        compat_predictor=compat_predictor,
        weights=config["scoring"]["weights"]
    )

    init_db()

    STATE["config"] = config
    STATE["df"] = df
    STATE["extractor"] = extractor
    STATE["embeddings"] = embeddings
    STATE["item_ids"] = item_ids
    STATE["faiss_mgr"] = faiss_mgr
    STATE["cat_detector"] = cat_detector
    STATE["style_clf"] = style_clf
    STATE["compat_predictor"] = compat_predictor
    STATE["outfit_gen"] = outfit_gen
    STATE["initialized"] = True
    print("FastAPI Recommendation Engine Initialized Successfully!")
    return STATE

@app.on_event("startup")
async def startup_event():
    # Warm up state
    get_state()

# Static files for dataset images if needed
data_img_dir = Path("data/raw/images")
if data_img_dir.exists():
    app.mount("/images", StaticFiles(directory=str(data_img_dir)), name="images")

# Pydantic Schemas
class SimilarRequest(BaseModel):
    item_id: Optional[str] = None
    embedding_id: Optional[str] = None
    category: Optional[str] = None
    top_k: int = 5

class RecommendRequest(BaseModel):
    item_id: Optional[str] = None
    embedding_id: Optional[str] = None
    category: Optional[str] = None
    body_type: Optional[str] = None
    occasion: Optional[str] = None
    top_k: int = 5

class FavouriteRequest(BaseModel):
    outfit_id: str
    overall_compatibility: int
    items: List[Dict]

@app.get("/")
def read_root():
    return {
        "system": "Fashion Compatibility Recommendation System",
        "status": "online",
        "docs": "/docs"
    }

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyzes an uploaded clothing image:
    Returns category, dominant color swatch, style tags, matching colors, and temp embedding ID.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image (JPEG/PNG/WEBP)")
        
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image file too large (max 10MB)")

    try:
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {e}")

    st = get_state()
    extractor = st["extractor"]
    cat_detector = st["cat_detector"]
    style_clf = st["style_clf"]

    # 1. Extract embedding
    embedding = extractor.extract_image_embedding(pil_img)
    temp_id = f"temp_{uuid.uuid4().hex[:8]}"
    TEMP_EMBEDDINGS[temp_id] = embedding

    # 2. Category Detection
    category, cat_confidence, cat_probs = cat_detector.predict_zeroshot(pil_img, extractor)

    # 3. Color Detection
    color_info = detect_dominant_color(pil_img)

    # 4. Style Classification
    style_info = style_clf.predict_style(pil_img, extractor, top_k=2)

    # 5. Color harmony recommendations
    matching_colors = recommend_matching_colors(color_info["dominant_color"])

    return {
        "status": "success",
        "embedding_id": temp_id,
        "category": category,
        "category_confidence": round(cat_confidence, 3),
        "color": color_info,
        "style": style_info,
        "recommended_colors": matching_colors
    }

@app.post("/similar")
def find_similar_items(req: SimilarRequest):
    """
    Finds top-K visually similar items in FAISS index.
    """
    st = get_state()
    faiss_mgr = st["faiss_mgr"]
    df = st["df"]
    id_to_dict = df.set_index(df["item_id"].astype(str)).to_dict(orient="index")

    query_emb = None
    exclude_ids = []

    if req.item_id and req.item_id in st["outfit_gen"].id_to_idx:
        query_emb = st["outfit_gen"]._get_item_embedding(req.item_id)
        exclude_ids.append(req.item_id)
    elif req.embedding_id and req.embedding_id in TEMP_EMBEDDINGS:
        query_emb = TEMP_EMBEDDINGS[req.embedding_id]

    if query_emb is None:
        raise HTTPException(status_code=400, detail="Invalid item_id or embedding_id")

    hits = faiss_mgr.search_similar(
        query_vector=query_emb,
        category=req.category,
        top_k=req.top_k,
        exclude_ids=exclude_ids
    )

    results = []
    for item_id, sim_score in hits:
        if str(item_id) in id_to_dict:
            item_info = id_to_dict[str(item_id)].copy()
            item_info["similarity_score"] = round(sim_score, 3)
            results.append(item_info)

    return {"status": "success", "results": results}

@app.post("/recommend")
def recommend_outfits(req: RecommendRequest):
    """
    Generates Top-5 complete outfits with compatibility scores and slot recommendations.
    """
    st = get_state()
    outfit_gen = st["outfit_gen"]

    query_emb = None
    query_item_id = req.item_id
    category = req.category or "top"

    if req.item_id and req.item_id in outfit_gen.id_to_idx:
        query_emb = outfit_gen._get_item_embedding(req.item_id)
    elif req.embedding_id and req.embedding_id in TEMP_EMBEDDINGS:
        query_emb = TEMP_EMBEDDINGS[req.embedding_id]

    if query_emb is None:
        raise HTTPException(status_code=400, detail="Invalid item_id or embedding_id")

    # If query_item_id is not in index (e.g. user uploaded image), find nearest dataset item anchor
    if not query_item_id or query_item_id not in outfit_gen.id_to_idx:
        hits = st["faiss_mgr"].search_similar(query_emb, category=category, top_k=1)
        if hits:
            query_item_id = hits[0][0]
        else:
            query_item_id = st["item_ids"][0]

    top_outfits = outfit_gen.generate_top_outfits(
        query_item_id=query_item_id,
        query_category=category,
        num_outfits=req.top_k
    )

    slot_recs = outfit_gen.generate_recommendations_by_slot(
        query_item_id=query_item_id,
        query_embedding=query_emb,
        category=category,
        top_n=req.top_k
    )

    return {
        "status": "success",
        "anchor_item_id": query_item_id,
        "outfits": top_outfits,
        "recommendations_by_slot": slot_recs
    }

@app.post("/favourites")
def save_favourite(req: FavouriteRequest):
    outfit_dict = req.dict()
    saved = save_favourite_outfit(outfit_dict)
    return {"status": "success", "favourite": saved}

@app.get("/favourites")
def list_favourites():
    favs = get_favourite_outfits()
    return {"status": "success", "favourites": favs}

@app.delete("/favourites/{fav_id}")
def delete_favourite(fav_id: int):
    deleted = delete_favourite_outfit(fav_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Favourite outfit not found")
    return {"status": "success", "message": f"Favourite {fav_id} deleted."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
