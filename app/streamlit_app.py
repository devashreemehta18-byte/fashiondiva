import io
import os
import requests
import pandas as pd
from PIL import Image
from pathlib import Path
import streamlit as st

# Page Configuration
st.set_page_config(
    page_title="FashionDiva • AI Fashion Stylist & Compatibility Engine",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded"
)

API_URL = os.getenv("API_URL", "http://localhost:8000")

# Inject Custom Modern CSS
st.markdown("""
<style>
    /* Modern Styling */
    .main-title {
        font-family: 'Inter', sans-serif;
        font-weight: 800;
        font-size: 2.5rem;
        background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        color: #6b7280;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
    .stat-box {
        background-color: #ffffff;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        border: 1px solid #e5e7eb;
        text-align: center;
    }
    .color-swatch {
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        vertical-align: middle;
        margin-right: 8px;
    }
    .badge-compat {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.95rem;
        display: inline-block;
        box-shadow: 0 2px 5px rgba(16, 185, 129, 0.3);
    }
    .outfit-card {
        background: #ffffff;
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid #e2e8f0;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
        margin-bottom: 1.8rem;
    }
    .item-card {
        border-radius: 12px;
        background: #f8fafc;
        padding: 0.8rem;
        border: 1px solid #f1f5f9;
        text-align: center;
    }
</style>
""", unsafe_allow_html=True)

# App Header
st.markdown('<div class="main-title">👗 Polyvore Fashion Compatibility Recommender</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Upload a clothing item to discover complementary outfits, style analysis & color harmony rules.</div>', unsafe_allow_html=True)

# Navigation
sidebar = st.sidebar
sidebar.title("Navigation")
page = sidebar.radio("Go to", ["🏠 Recommendation Dashboard", "💖 Saved Favourites", "📊 System Info & Dataset Stats"])

# Direct internal module imports as fallback if API is starting
try:
    from src.config import load_config
    from src.embeddings import FeatureExtractor
    from src.similarity import FAISSIndexManager
    from src.category import CategoryDetector
    from src.color import detect_dominant_color
    from src.style import StyleClassifier
    from src.color_theory import recommend_matching_colors
    from src.compatibility import CompatibilityPredictor
    from src.outfit_generator import OutfitGenerator
    from api.database import save_favourite_outfit, get_favourite_outfits, delete_favourite_outfit
    LOCAL_ENGINE_AVAILABLE = True
except Exception as e:
    LOCAL_ENGINE_AVAILABLE = False

@st.cache_resource
def load_local_engine():
    if not LOCAL_ENGINE_AVAILABLE:
        return None
    config = load_config()
    raw_dir = Path(config["dataset"]["raw_dir"])
    processed_dir = Path(config["dataset"]["processed_dir"])
    meta_path = Path(config["dataset"]["metadata_file"])
    
    if not meta_path.exists():
        from src.data_prep import parse_polyvore_dataset
        df = parse_polyvore_dataset(raw_dir, processed_dir)
    else:
        df = pd.read_csv(meta_path)
        
    extractor = FeatureExtractor(
        model_type=config["model"]["type"],
        model_name=config["model"]["clip_model_name"],
        device=config["model"]["device"]
    )
    save_dir = Path(config["embeddings"]["save_dir"])
    embeddings, item_ids = extractor.extract_dataset_embeddings(
        df, save_dir=save_dir, batch_size=config["model"]["batch_size"]
    )
    faiss_mgr = FAISSIndexManager(index_dir=Path(config["indexes"]["save_dir"]))
    try:
        faiss_mgr.load_indexes()
    except Exception:
        faiss_mgr.build_indexes(embeddings, item_ids, df)
        
    cat_detector = CategoryDetector()
    style_clf = StyleClassifier()
    model_path = Path(config["compatibility_model"]["save_path"])
    compat_predictor = CompatibilityPredictor(
        model_path=model_path,
        embedding_dim=extractor.embedding_dim,
        device=extractor.device
    )
    outfit_gen = OutfitGenerator(
        metadata_df=df,
        embeddings=embeddings,
        item_ids=item_ids,
        faiss_manager=faiss_mgr,
        compat_predictor=compat_predictor,
        weights=config["scoring"]["weights"]
    )
    return {
        "df": df,
        "extractor": extractor,
        "faiss_mgr": faiss_mgr,
        "cat_detector": cat_detector,
        "style_clf": style_clf,
        "compat_predictor": compat_predictor,
        "outfit_gen": outfit_gen
    }

if page == "🏠 Recommendation Dashboard":
    st.subheader("1. Upload Clothing Item")
    
    col_upload, col_preview = st.columns([1, 1])
    uploaded_file = None
    
    with col_upload:
        file_input = st.file_uploader("Upload clothing photo (JPG / PNG / WEBP)", type=["jpg", "jpeg", "png", "webp"])
        if file_input:
            uploaded_file = file_input
        else:
            st.info("💡 Tip: Upload a top, shirt, dress, jacket, pants, or shoes photo!")
            
    if uploaded_file:
        pil_img = Image.open(uploaded_file).convert("RGB")
        with col_preview:
            st.image(pil_img, caption="Uploaded Input Item", width=220)
            
        st.markdown("---")
        st.subheader("2. AI Style & Color Analysis")
        
        engine = load_local_engine()
        if engine:
            extractor = engine["extractor"]
            cat_detector = engine["cat_detector"]
            style_clf = engine["style_clf"]
            outfit_gen = engine["outfit_gen"]
            faiss_mgr = engine["faiss_mgr"]
            
            with st.spinner("Extracting CLIP embeddings & running feature analysis..."):
                query_emb = extractor.extract_image_embedding(pil_img)
                category, cat_conf, _ = cat_detector.predict_zeroshot(pil_img, extractor)
                color_info = detect_dominant_color(pil_img)
                style_info = style_clf.predict_style(pil_img, extractor)
                matching_colors = recommend_matching_colors(color_info["dominant_color"])

            # Analysis metrics row
            c1, c2, c3 = st.columns(3)
            with c1:
                st.markdown(f"**Detected Category:** `{category.capitalize()}`")
                st.caption(f"Confidence: {cat_conf * 100:.1f}%")
            with c2:
                hex_c = color_info['hex']
                dom_c = color_info['dominant_color'].capitalize()
                st.markdown(
                    f"**Dominant Color:** <span class='color-swatch' style='background-color:{hex_c};'></span> **{dom_c}** (`{hex_c}`)",
                    unsafe_allow_html=True
                )
            with c3:
                top_style = style_info['top_style'].capitalize()
                st.markdown(f"**Style Aesthetic:** `{top_style}`")
                for s in style_info['styles']:
                    st.caption(f"{s['style'].capitalize()}: {s['confidence']*100:.0f}%")

            # Color theory recommendations
            st.markdown("##### 🎨 Recommended Matching Colors")
            swatch_cols = st.columns(len(matching_colors))
            for i, rec in enumerate(matching_colors):
                with swatch_cols[i]:
                    st.markdown(f"**{rec['color'].capitalize()}**")
                    st.caption(f"{rec['harmony_type']}")
                    st.caption(f"Score: {int(rec['score']*100)}%")

            st.markdown("---")
            st.subheader("3. Visually Similar Items")
            hits = faiss_mgr.search_similar(query_emb, category=category, top_k=5)
            sim_cols = st.columns(5)
            for i, (item_id, sim_score) in enumerate(hits):
                item = outfit_gen.item_dict.get(str(item_id))
                if item and i < 5:
                    with sim_cols[i]:
                        img_p = item.get("image_path")
                        if img_p and Path(img_p).exists():
                            st.image(img_p, use_container_width=True)
                        st.caption(f"{item.get('title', item_id)}")
                        st.caption(f"Similarity: {sim_score * 100:.0f}%")

            st.markdown("---")
            st.subheader("4. Top-5 Complete Outfit Recommendations")
            
            # Find nearest dataset item as query anchor
            anchor_hits = faiss_mgr.search_similar(query_emb, category=category, top_k=1)
            anchor_id = anchor_hits[0][0] if anchor_hits else engine["df"]["item_id"].iloc[0]
            
            outfits = outfit_gen.generate_top_outfits(
                query_item_id=str(anchor_id),
                query_category=category,
                num_outfits=5
            )

            for outfit_idx, outfit in enumerate(outfits):
                st.markdown(f"""
                <div class="outfit-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                        <h4 style="margin:0;">Outfit Option #{outfit_idx + 1}</h4>
                        <span class="badge-compat">✨ {outfit['overall_compatibility']}% Compatible</span>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                item_cols = st.columns(len(outfit["items"]))
                for j, item in enumerate(outfit["items"]):
                    with item_cols[j]:
                        img_p = item.get("image_path")
                        if img_p and Path(img_p).exists():
                            st.image(img_p, use_container_width=True)
                        st.caption(f"**{item.get('category', '').capitalize()}**")
                        st.caption(item.get("title", item.get("item_id")))
                        st.caption(f"Match: {item.get('compatibility_score')}%")

                if st.button(f"💖 Save Outfit #{outfit_idx + 1}", key=f"save_btn_{outfit_idx}"):
                    save_favourite_outfit(outfit)
                    st.success(f"Saved Outfit #{outfit_idx + 1} to your favourites! 🎉")

elif page == "💖 Saved Favourites":
    st.subheader("💖 My Saved Favourite Outfits")
    try:
        favs = get_favourite_outfits()
    except Exception as e:
        favs = []
        st.warning(f"Could not load favourites: {e}")

    if not favs:
        st.info("No saved outfits yet. Head to the Recommendation Dashboard and click 'Save Outfit'!")
    else:
        for fav in favs:
            st.markdown(f"""
            <div class="outfit-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h4 style="margin:0;">Outfit #{fav['id']} ({fav['outfit_id']})</h4>
                    <span class="badge-compat">✨ {fav['overall_compatibility']}% Compatible</span>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            items = fav.get("items", [])
            cols = st.columns(max(1, len(items)))
            for j, item in enumerate(items):
                with cols[j]:
                    img_p = item.get("image_path")
                    if img_p and Path(img_p).exists():
                        st.image(img_p, use_container_width=True)
                    st.caption(f"**{item.get('category', '').capitalize()}**")
                    st.caption(item.get("title", ""))

            if st.button(f"🗑 Delete Outfit #{fav['id']}", key=f"del_{fav['id']}"):
                delete_favourite_outfit(fav['id'])
                st.experimental_rerun()

elif page == "📊 System Info & Dataset Stats":
    st.subheader("📊 Polyvore Dataset & System Statistics")
    engine = load_local_engine()
    if engine:
        df = engine["df"]
        st.metric("Total Items Indexed", len(df))
        st.metric("Total Polyvore Outfits", df["outfit_id"].nunique())
        
        st.subheader("Items per Category Distribution")
        cat_df = df["category"].value_counts().reset_index()
        cat_df.columns = ["Category", "Count"]
        st.bar_chart(cat_df.set_index("Category"))
