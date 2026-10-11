# pyrefly: ignore [missing-import]
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from src.color_theory import get_color_harmony_score, compute_blended_compatibility_score
from src.color import detect_dominant_color

SLOT_TEMPLATES = {
    "top": ["jeans/pants", "skirt", "shoes", "jacket/outerwear", "bag", "accessories"],
    "shirt": ["jeans/pants", "skirt", "shoes", "jacket/outerwear", "bag", "accessories"],
    "dress": ["shoes", "jacket/outerwear", "bag", "accessories"],
    "jeans/pants": ["top", "shirt", "shoes", "jacket/outerwear", "bag", "accessories"],
    "skirt": ["top", "shirt", "shoes", "jacket/outerwear", "bag", "accessories"],
    "shoes": ["top", "shirt", "jeans/pants", "skirt", "jacket/outerwear", "bag"],
    "jacket/outerwear": ["top", "shirt", "jeans/pants", "shoes", "bag", "accessories"],
    "bag": ["top", "jeans/pants", "shoes", "jacket/outerwear", "accessories"],
    "accessories": ["top", "jeans/pants", "shoes", "jacket/outerwear", "bag"]
}

class OutfitGenerator:
    """
    Beam Search & Pairwise Re-Ranking Engine for Diverse Full Outfit Generation.
    """
    def __init__(
        self,
        metadata_df: pd.DataFrame,
        embeddings: np.ndarray,
        item_ids: List[str],
        faiss_manager,
        compat_predictor,
        weights: Optional[Dict[str, float]] = None
    ):
        self.df = metadata_df
        self.embeddings = embeddings
        self.item_ids = item_ids
        self.id_to_idx = {item_id: idx for idx, item_id in enumerate(item_ids)}
        self.faiss_mgr = faiss_manager
        self.compat_predictor = compat_predictor
        
        self.item_dict = self.df.set_index(self.df["item_id"].astype(str)).to_dict(orient="index")
        
        self.weights = weights or {
            "learned_compatibility": 0.6,
            "style_similarity": 0.2,
            "color_harmony": 0.2
        }

    def _get_item_embedding(self, item_id: str) -> np.ndarray:
        idx = self.id_to_idx[str(item_id)]
        return self.embeddings[idx]

    def _get_item_color(self, item_id: str) -> str:
        item = self.item_dict.get(str(item_id), {})
        if "color_label" in item and pd.notna(item["color_label"]):
            return str(item["color_label"])
        img_path = item.get("image_path")
        if img_path:
            try:
                res = detect_dominant_color(img_path)
                return res["dominant_color"]
            except Exception:
                pass
        return "black"

    def compute_pair_score(self, item_id_a: str, item_id_b: str, emb_a: np.ndarray = None, emb_b: np.ndarray = None) -> float:
        """Computes blended compatibility score between two items."""
        if emb_a is None:
            emb_a = self._get_item_embedding(item_id_a)
        if emb_b is None:
            emb_b = self._get_item_embedding(item_id_b)

        # 1. Learned compatibility model score
        learned_compat = self.compat_predictor.predict_pair_compatibility(emb_a, emb_b)
        
        # 2. Vector cosine similarity (style/visual similarity)
        cosine_sim = float(np.dot(emb_a, emb_b))
        cosine_sim = max(0.0, min(1.0, cosine_sim))
        
        # 3. Color harmony score
        c1 = self._get_item_color(item_id_a)
        c2 = self._get_item_color(item_id_b)
        color_score = get_color_harmony_score(c1, c2)
        
        blended = compute_blended_compatibility_score(
            learned_compat, cosine_sim, color_score,
            w_learned=self.weights["learned_compatibility"],
            w_style=self.weights["style_similarity"],
            w_color=self.weights["color_harmony"]
        )
        return blended["score_float"]

    def generate_recommendations_by_slot(
        self,
        query_item_id: Optional[str] = None,
        query_embedding: Optional[np.ndarray] = None,
        category: str = "top",
        top_n: int = 5
    ) -> Dict[str, List[Dict]]:
        """
        Returns top-N matching candidate items for each category slot.
        """
        if query_embedding is None:
            if query_item_id is None:
                raise ValueError("Must provide query_item_id or query_embedding")
            query_embedding = self._get_item_embedding(query_item_id)
            
        target_slots = SLOT_TEMPLATES.get(category, ["jeans/pants", "shoes", "jacket/outerwear", "bag"])
        slot_recommendations = {}

        for slot_cat in target_slots:
            if slot_cat in slot_recommendations:
                continue
                
            # Search FAISS index for slot category candidates
            exclude = [query_item_id] if query_item_id else []
            similar_hits = self.faiss_mgr.search_similar(
                query_embedding, category=slot_cat, top_k=top_n * 2, exclude_ids=exclude
            )
            
            slot_items = []
            for item_id, sim_score in similar_hits:
                if str(item_id) not in self.item_dict:
                    continue
                cand_info = self.item_dict[str(item_id)].copy()
                cand_emb = self._get_item_embedding(item_id)
                
                # Pairwise score against query item
                learned_compat = self.compat_predictor.predict_pair_compatibility(query_embedding, cand_emb)
                c_query = self._get_item_color(query_item_id) if query_item_id else "black"
                c_cand = self._get_item_color(item_id)
                color_score = get_color_harmony_score(c_query, c_cand)
                
                blended = compute_blended_compatibility_score(
                    learned_compat, max(0.0, sim_score), color_score
                )
                
                cand_info["compatibility_score"] = blended["percentage"]
                cand_info["similarity_score"] = round(sim_score, 3)
                slot_items.append(cand_info)

            # Sort by compatibility score
            slot_items.sort(key=lambda x: x["compatibility_score"], reverse=True)
            slot_recommendations[slot_cat] = slot_items[:top_n]

        return slot_recommendations

    def generate_top_outfits(
        self,
        query_item_id: str,
        query_category: str,
        num_outfits: int = 5,
        beam_width: int = 5
    ) -> List[Dict]:
        """
        Generates Top-5 complete outfit combinations using beam search and pairwise re-ranking.
        """
        query_emb = self._get_item_embedding(query_item_id)
        anchor_item = self.item_dict[str(query_item_id)].copy()
        anchor_item["compatibility_score"] = 100
        
        # Pick 3 key slots to build a complete 4-item outfit
        # e.g., for top: [bottom (pants/skirt), shoes, jacket/bag]
        if query_category in ["top", "shirt"]:
            slots_to_fill = ["jeans/pants", "shoes", "bag"]
        elif query_category == "dress":
            slots_to_fill = ["shoes", "jacket/outerwear", "bag"]
        elif query_category in ["jeans/pants", "skirt"]:
            slots_to_fill = ["top", "shoes", "jacket/outerwear"]
        else:
            slots_to_fill = ["top", "jeans/pants", "shoes"]

        # 1. Fetch candidate pools for each slot
        slot_candidates = {}
        for slot in slots_to_fill:
            hits = self.faiss_mgr.search_similar(
                query_emb, category=slot, top_k=beam_width * 3, exclude_ids=[query_item_id]
            )
            candidates = [h[0] for h in hits if str(h[0]) in self.item_dict]
            if not candidates:
                # fallback query global
                hits = self.faiss_mgr.search_similar(query_emb, top_k=beam_width * 3, exclude_ids=[query_item_id])
                candidates = [h[0] for h in hits if str(h[0]) in self.item_dict]
            slot_candidates[slot] = candidates

        # 2. Beam Search across slots
        # State: tuple of (current_items_list, cumulative_score)
        beam = [([query_item_id], 0.0)]
        
        for slot in slots_to_fill:
            candidates = slot_candidates[slot]
            new_beam = []
            
            for current_items, current_score in beam:
                for cand_id in candidates:
                    if cand_id in current_items:
                        continue
                    # Compute score of cand_id with all existing items in current_items
                    cand_emb = self._get_item_embedding(cand_id)
                    pair_scores = []
                    for existing_id in current_items:
                        ex_emb = self._get_item_embedding(existing_id)
                        s = self.compute_pair_score(existing_id, cand_id, ex_emb, cand_emb)
                        pair_scores.append(s)
                    avg_pair_score = float(np.mean(pair_scores))
                    new_score = current_score + avg_pair_score
                    new_beam.append((current_items + [cand_id], new_score))

            # Keep top-K beam states
            new_beam.sort(key=lambda x: x[1], reverse=True)
            beam = new_beam[:beam_width * 4]

        # 3. Final Re-Ranking & Diversity Check
        outfits_result = []
        seen_outfit_combos = set()
        
        for item_ids_combo, _ in beam:
            combo_tuple = tuple(sorted(item_ids_combo))
            if combo_tuple in seen_outfit_combos:
                continue
            seen_outfit_combos.add(combo_tuple)
            
            # Compute average pairwise score among all items in outfit
            pairwise_scores = []
            for i in range(len(item_ids_combo)):
                for j in range(i + 1, len(item_ids_combo)):
                    s = self.compute_pair_score(item_ids_combo[i], item_ids_combo[j])
                    pairwise_scores.append(s)
            
            overall_float = float(np.mean(pairwise_scores)) if pairwise_scores else 0.8
            overall_pct = int(round(overall_float * 100))
            overall_pct = max(60, min(99, overall_pct))
            
            # Format outfit item objects
            outfit_items = []
            for item_id in item_ids_combo:
                item_info = self.item_dict[str(item_id)].copy()
                if item_id == query_item_id:
                    item_info["compatibility_score"] = 100
                else:
                    item_score = self.compute_pair_score(query_item_id, item_id)
                    item_info["compatibility_score"] = int(round(item_score * 100))
                outfit_items.append(item_info)

            outfits_result.append({
                "outfit_id": f"rec_outfit_{len(outfits_result)+1}",
                "overall_compatibility": overall_pct,
                "items": outfit_items
            })
            
            if len(outfits_result) >= num_outfits:
                break

        return outfits_result

if __name__ == "__main__":
    print("Outfit generator module loaded.")
