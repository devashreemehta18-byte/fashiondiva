# pyrefly: ignore [missing-import]
import numpy as np
from typing import List, Dict, Tuple
from src.config import load_config

STYLES = ["casual", "formal", "party", "sporty", "traditional", "streetwear", "minimalist", "vintage"]

STYLE_PROMPTS = [
    "a photo of casual everyday fashion clothing",
    "a photo of formal elegant business attire or suit",
    "a photo of glamorous party night outfit",
    "a photo of athletic sporty activewear",
    "a photo of traditional ethnic classic outfit",
    "a photo of trendy streetwear urban fashion",
    "a photo of minimalist subtle modern clothing",
    "a photo of retro vintage aesthetic fashion"
]

class StyleClassifier:
    """
    Style Classifier using CLIP Zero-Shot prompts.
    """
    def predict_style(self, image_input, extractor, top_k: int = 2) -> Dict:
        """
        Returns top-k predicted styles with confidence probabilities.
        """
        if extractor.model_type != "clip":
            # Fallback for resnet50: return default casual style
            return {
                "top_style": "casual",
                "styles": [
                    {"style": "casual", "confidence": 0.7},
                    {"style": "minimalist", "confidence": 0.3}
                ]
            }

        img_emb = extractor.extract_image_embedding(image_input)
        style_text_embs = extractor.extract_text_embedding(STYLE_PROMPTS)
        
        sims = np.dot(style_text_embs, img_emb)
        exp_sims = np.exp(sims * 10.0)
        probs = exp_sims / np.sum(exp_sims)
        
        sorted_indices = np.argsort(probs)[::-1][:top_k]
        
        top_styles = []
        for idx in sorted_indices:
            top_styles.append({
                "style": STYLES[idx],
                "confidence": round(float(probs[idx]), 3)
            })
            
        return {
            "top_style": STYLES[sorted_indices[0]],
            "styles": top_styles
        }

if __name__ == "__main__":
    print("Style classifier initialized successfully.")
