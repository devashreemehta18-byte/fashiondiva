import os
import json
import faiss
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from src.config import load_config

class FAISSIndexManager:
    """
    FAISS Vector Indexer and Similarity Search Manager.
    Manages global FAISS index + per-category FAISS indexes.
    """
    def __init__(self, index_dir: Path):
        self.index_dir = Path(index_dir)
        self.index_dir.mkdir(parents=True, exist_ok=True)
        self.global_index = None
        self.global_ids = []
        self.category_indexes: Dict[str, faiss.IndexFlatIP] = {}
        self.category_ids: Dict[str, List[str]] = {}

    def build_indexes(self, embeddings: np.ndarray, item_ids: List[str], metadata_df: pd.DataFrame):
        """
        Builds L2-normalized inner-product FAISS indexes (Global + Per-Category).
        """
        print("Building FAISS indexes...")
        dim = embeddings.shape[1]
        
        # L2-normalize just in case
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        embeddings_norm = (embeddings / norms).astype(np.float32)
        
        # 1. Global Index
        self.global_index = faiss.IndexFlatIP(dim)
        self.global_index.add(embeddings_norm)
        self.global_ids = item_ids
        
        # Save Global Index & ID mapping
        faiss.write_index(self.global_index, str(self.index_dir / "faiss_global.index"))
        with open(self.index_dir / "global_ids.json", "w", encoding="utf-8") as f:
            json.dump(item_ids, f)
            
        # 2. Per-Category Indexes
        id_to_index = {item_id: idx for idx, item_id in enumerate(item_ids)}
        id_to_cat = dict(zip(metadata_df["item_id"].astype(str), metadata_df["category"].astype(str)))
        
        categories = metadata_df["category"].astype(str).unique()
        for cat in categories:
            cat_clean = cat.replace("/", "_").replace(" ", "_")
            cat_indices = []
            cat_item_ids = []
            
            for item_id in item_ids:
                if id_to_cat.get(item_id) == cat:
                    cat_indices.append(id_to_index[item_id])
                    cat_item_ids.append(item_id)

            if cat_indices:
                cat_embeddings = embeddings_norm[cat_indices]
                cat_idx = faiss.IndexFlatIP(dim)
                cat_idx.add(cat_embeddings)
                
                self.category_indexes[cat] = cat_idx
                self.category_ids[cat] = cat_item_ids
                
                faiss.write_index(cat_idx, str(self.index_dir / f"faiss_cat_{cat_clean}.index"))
                with open(self.index_dir / f"cat_{cat_clean}_ids.json", "w", encoding="utf-8") as f:
                    json.dump(cat_item_ids, f)

        print(f"FAISS indexing complete! Global index items: {len(item_ids)}, Categories indexed: {len(self.category_indexes)}")

    def load_indexes(self):
        """Loads FAISS indexes from disk."""
        global_idx_file = self.index_dir / "faiss_global.index"
        global_ids_file = self.index_dir / "global_ids.json"
        
        if not global_idx_file.exists() or not global_ids_file.exists():
            raise FileNotFoundError("FAISS index files not found. Run build_indexes first.")

        self.global_index = faiss.read_index(str(global_idx_file))
        with open(global_ids_file, "r", encoding="utf-8") as f:
            self.global_ids = json.load(f)

        # Load category indexes
        cat_files = list(self.index_dir.glob("faiss_cat_*.index"))
        for cat_f in cat_files:
            cat_name = cat_f.stem.replace("faiss_cat_", "").replace("_", "/")
            # map back common slash replacements
            if cat_name == "jeans_pants":
                cat_name = "jeans/pants"
            elif cat_name == "jacket_outerwear":
                cat_name = "jacket/outerwear"
                
            cat_ids_file = self.index_dir / f"cat_{cat_f.stem.replace('faiss_cat_', '')}_ids.json"
            if cat_ids_file.exists():
                self.category_indexes[cat_name] = faiss.read_index(str(cat_f))
                with open(cat_ids_file, "r", encoding="utf-8") as f:
                    self.category_ids[cat_name] = json.load(f)

        print(f"Loaded global index ({len(self.global_ids)} items) and {len(self.category_indexes)} category indexes.")

    def search_similar(
        self,
        query_vector: np.ndarray,
        category: Optional[str] = None,
        top_k: int = 5,
        exclude_ids: Optional[List[str]] = None
    ) -> List[Tuple[str, float]]:
        """
        Search similar items using cosine similarity FAISS index.
        Returns list of (item_id, similarity_score).
        """
        if self.global_index is None:
            self.load_indexes()

        # Ensure vector shape and normalization
        vec = query_vector.copy().reshape(1, -1).astype(np.float32)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm

        exclude_set = set(exclude_ids or [])
        
        # Decide index and ID mapping
        if category and category in self.category_indexes:
            idx = self.category_indexes[category]
            ids_list = self.category_ids[category]
        else:
            idx = self.global_index
            ids_list = self.global_ids

        # Fetch extra candidates in case of exclusions
        fetch_k = min(top_k + len(exclude_set) + 10, idx.ntotal)
        if fetch_k == 0:
            return []

        scores, indices = idx.search(vec, fetch_k)
        
        results = []
        for score, idx_val in zip(scores[0], indices[0]):
            if idx_val < 0 or idx_val >= len(ids_list):
                continue
            item_id = ids_list[idx_val]
            if item_id in exclude_set:
                continue
            # Cosine similarity float
            sim_score = float(score)
            results.append((item_id, sim_score))
            if len(results) >= top_k:
                break

        return results

if __name__ == "__main__":
    config = load_config()
    index_mgr = FAISSIndexManager(index_dir=Path(config["indexes"]["save_dir"]))
    try:
        index_mgr.load_indexes()
        print("Loaded FAISS index successfully.")
    except Exception as e:
        print(f"FAISS index load test note: {e}")
