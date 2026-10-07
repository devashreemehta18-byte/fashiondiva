import os
import json
import numpy as np
import pandas as pd
from pathlib import Path

from src.config import load_config
from src.data_prep import parse_polyvore_dataset
from src.embeddings import FeatureExtractor
from src.similarity import FAISSIndexManager
from src.compatibility import CompatibilityPredictor, generate_polyvore_pairs
from src.outfit_generator import OutfitGenerator
from sklearn.metrics import roc_auc_score, accuracy_score

def evaluate_pipeline():
    print("="*60)
    print("EVALUATING FASHION RECOMMENDATION SYSTEM PIPELINE")
    print("="*60)

    config = load_config()
    raw_dir = Path(config["dataset"]["raw_dir"])
    processed_dir = Path(config["dataset"]["processed_dir"])
    meta_path = Path(config["dataset"]["metadata_file"])
    
    if not meta_path.exists():
        df = parse_polyvore_dataset(raw_dir, processed_dir)
    else:
        df = pd.read_csv(meta_path)
        
    print(f"Dataset items: {len(df)}, outfits: {df['outfit_id'].nunique()}")

    # 1. Feature Extractor
    extractor = FeatureExtractor(
        model_type=config["model"]["type"],
        model_name=config["model"]["clip_model_name"],
        device=config["model"]["device"]
    )

    # 2. Extract / Load Embeddings
    save_dir = Path(config["embeddings"]["save_dir"])
    embeddings, item_ids = extractor.extract_dataset_embeddings(
        df, save_dir=save_dir, batch_size=config["model"]["batch_size"]
    )

    # 3. FAISS Indexes
    faiss_mgr = FAISSIndexManager(index_dir=Path(config["indexes"]["save_dir"]))
    try:
        faiss_mgr.load_indexes()
    except Exception:
        faiss_mgr.build_indexes(embeddings, item_ids, df)

    # 4. Compatibility Model Evaluation
    model_path = Path(config["compatibility_model"]["save_path"])
    compat_predictor = CompatibilityPredictor(
        model_path=model_path,
        embedding_dim=extractor.embedding_dim,
        device=extractor.device
    )
    
    if not model_path.exists():
        metrics = compat_predictor.train_model(
            df, embeddings, item_ids, save_path=model_path, epochs=config["compatibility_model"]["epochs"]
        )
    
    # Generate test pairs for AUC evaluation
    test_pairs = generate_polyvore_pairs(df, item_ids)
    id_to_idx = {item_id: idx for idx, item_id in enumerate(item_ids)}
    
    preds, labels = [], []
    for idx_a, idx_b, label in test_pairs[:200]:
        emb_a, emb_b = embeddings[idx_a], embeddings[idx_b]
        score = compat_predictor.predict_pair_compatibility(emb_a, emb_b)
        preds.append(score)
        labels.append(label)

    auc_score = roc_auc_score(labels, preds)
    acc_score = accuracy_score(labels, np.array(preds) >= 0.5)

    print("\n" + "-"*40)
    print("COMPATIBILITY MODEL METRICS")
    print(f"Pair Compatibility AUC Score : {auc_score:.4f}")
    print(f"Pair Classification Accuracy  : {acc_score * 100:.2f}%")
    
    # FITB Accuracy
    fitb_acc = compat_predictor.evaluate_fitb(df, embeddings, item_ids, num_samples=30)
    print(f"Fill-In-The-Blank (FITB) Acc : {fitb_acc * 100:.2f}%")

    # 5. Recall@K Search Evaluation
    print("\n" + "-"*40)
    print("FAISS RETRIEVAL RECALL@K EVALUATION")
    
    hits_at_5 = 0
    total_evals = 0
    
    outfits = df.groupby("outfit_id")["item_id"].apply(list).to_dict()
    for o_id, o_items in list(outfits.items())[:30]:
        if len(o_items) < 2:
            continue
        query_item = str(o_items[0])
        gt_target = str(o_items[1])
        
        if query_item in id_to_idx and gt_target in id_to_idx:
            q_emb = embeddings[id_to_idx[query_item]]
            similar_hits = faiss_mgr.search_similar(q_emb, top_k=5, exclude_ids=[query_item])
            hit_ids = [h[0] for h in similar_hits]
            if gt_target in hit_ids:
                hits_at_5 += 1
            total_evals += 1

    recall_at_5 = (hits_at_5 / total_evals) if total_evals > 0 else 0.0
    print(f"FAISS Retrieval Recall@5       : {recall_at_5 * 100:.2f}%")
    print("="*60 + "\n")

    summary = {
        "dataset_items": len(df),
        "dataset_outfits": df["outfit_id"].nunique(),
        "compatibility_auc": round(float(auc_score), 4),
        "compatibility_accuracy": round(float(acc_score), 4),
        "fitb_accuracy": round(float(fitb_acc), 4),
        "recall_at_5": round(float(recall_at_5), 4)
    }
    return summary

if __name__ == "__main__":
    evaluate_pipeline()
