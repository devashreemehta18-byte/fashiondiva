import os
# pyrefly: ignore [missing-import]
import joblib
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from PIL import Image
from pathlib import Path
from typing import Dict, Tuple, List, Optional
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

CATEGORIES = [
    "top", "shirt", "dress", "jeans/pants",
    "skirt", "shoes", "jacket/outerwear", "bag", "accessories"
]

CATEGORY_PROMPTS = [
    "a photo of a fashion top or sweater",
    "a photo of a buttoned shirt or polo",
    "a photo of a dress or jumpsuit",
    "a photo of jeans or pants or trousers",
    "a photo of a skirt",
    "a photo of shoes or sneakers or boots",
    "a photo of a jacket or coat or blazer",
    "a photo of a handbag or tote bag or purse",
    "a photo of a fashion accessory like hat, belt, sunglasses or jewelry"
]

class CategoryDetector:
    """
    Category Detection using CLIP Zero-Shot & Lightweight Classifier.
    """
    def __init__(self, classifier_path: Optional[Path] = None):
        self.classifier_path = Path(classifier_path) if classifier_path else None
        self.classifier = None
        if self.classifier_path and self.classifier_path.exists():
            try:
                self.classifier = joblib.load(self.classifier_path)
                print(f"Loaded category classifier from {self.classifier_path}")
            except Exception as e:
                print(f"Note: Could not load category classifier: {e}")

    def predict_zeroshot(self, image_input, extractor) -> Tuple[str, float, Dict[str, float]]:
        """
        Zero-shot category prediction using CLIP.
        """
        if extractor.model_type != "clip":
            raise ValueError("Zero-shot prediction requires CLIP model.")
            
        img_emb = extractor.extract_image_embedding(image_input) # (D,)
        text_embs = extractor.extract_text_embedding(CATEGORY_PROMPTS) # (K, D)
        
        # Cosine similarities
        sims = np.dot(text_embs, img_emb) # (K,)
        # Softmax probabilities
        exp_sims = np.exp(sims * 10.0)
        probs = exp_sims / np.sum(exp_sims)
        
        prob_dict = {cat: float(p) for cat, p in zip(CATEGORIES, probs)}
        top_idx = int(np.argmax(probs))
        return CATEGORIES[top_idx], float(probs[top_idx]), prob_dict

    def train_classifier(self, embeddings: np.ndarray, labels: List[str], save_path: Path) -> float:
        """
        Train a small LogisticRegression classifier on dataset embeddings.
        """
        save_path = Path(save_path)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        
        clf = LogisticRegression(max_iter=500, C=1.0)
        clf.fit(embeddings, labels)
        
        preds = clf.predict(embeddings)
        acc = accuracy_score(labels, preds)
        
        joblib.dump(clf, save_path)
        self.classifier = clf
        self.classifier_path = save_path
        print(f"Trained category classifier with accuracy {acc:.4f}. Saved to {save_path}")
        return acc

    def predict_classifier(self, image_embedding: np.ndarray) -> Tuple[str, float]:
        """
        Predict category using trained classifier.
        """
        if self.classifier is None:
            raise ValueError("No classifier loaded. Train or pass classifier_path first.")
            
        vec = image_embedding.reshape(1, -1)
        pred = self.classifier.predict(vec)[0]
        probs = self.classifier.predict_proba(vec)[0]
        max_prob = float(np.max(probs))
        return str(pred), max_prob

if __name__ == "__main__":
    print("Category detector module initialized successfully.")
