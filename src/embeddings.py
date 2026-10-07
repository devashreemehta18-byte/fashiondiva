import os
import json
import torch
import numpy as np
import pandas as pd
from PIL import Image
from pathlib import Path
from typing import List, Union, Tuple
from torchvision import transforms

from src.config import load_config

class FeatureExtractor:
    """
    Switchable Image & Text Embedding Extractor.
    Supports CLIP (via Transformers / OpenCLIP) and ResNet50 fallback.
    """
    def __init__(self, model_type: str = "clip", model_name: str = "ViT-B-32", device: str = "auto"):
        self.model_type = model_type.lower()
        if device == "auto":
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
            
        print(f"Initializing FeatureExtractor (type={self.model_type}, device={self.device})...")
        
        if self.model_type == "clip":
            self._init_clip(model_name)
        elif self.model_type == "resnet50":
            self._init_resnet50()
        else:
            raise ValueError(f"Unsupported model type: {model_type}")

    def _init_clip(self, model_name: str):
        try:
            import open_clip
            # try loading open_clip
            self.model, _, self.preprocess = open_clip.create_model_and_transforms(
                model_name, pretrained="openai"
            )
            self.tokenizer = open_clip.get_tokenizer(model_name)
            self.model.to(self.device).eval()
            self.embedding_dim = self.model.visual.output_dim if hasattr(self.model, 'visual') else 512
            self.backend = "open_clip"
        except Exception as e:
            print(f"OpenCLIP initialization note: {e}. Falling back to HuggingFace Transformers CLIP...")
            from transformers import CLIPModel, CLIPProcessor, CLIPTokenizer
            clip_hf_id = "openai/clip-vit-base-patch32"
            self.model = CLIPModel.from_pretrained(clip_hf_id).to(self.device).eval()
            self.processor = CLIPProcessor.from_pretrained(clip_hf_id)
            self.tokenizer = CLIPTokenizer.from_pretrained(clip_hf_id)
            self.preprocess = None
            self.embedding_dim = 512
            self.backend = "hf_transformers"

    def _init_resnet50(self):
        from torchvision.models import resnet50, ResNet50_Weights
        weights = ResNet50_Weights.DEFAULT
        full_resnet = resnet50(weights=weights)
        # remove final classification layer to get 2048-dim feature vector
        self.model = torch.nn.Sequential(*list(full_resnet.children())[:-1]).to(self.device).eval()
        self.preprocess = weights.transforms()
        self.embedding_dim = 2048
        self.backend = "resnet50"

    def extract_image_embedding(self, image_input: Union[str, Path, Image.Image, np.ndarray]) -> np.ndarray:
        """Extract L2-normalized embedding vector for a single image."""
        if isinstance(image_input, (str, Path)):
            img = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, np.ndarray):
            img = Image.fromarray(image_input).convert("RGB")
        elif isinstance(image_input, Image.Image):
            img = image_input.convert("RGB")
        else:
            raise ValueError("Unsupported image input type")

        with torch.no_grad():
            if self.model_type == "clip":
                if self.backend == "open_clip":
                    tensor = self.preprocess(img).unsqueeze(0).to(self.device)
                    feats = self.model.encode_image(tensor)
                else:  # hf_transformers
                    inputs = self.processor(images=img, return_tensors="pt").to(self.device)
                    feats = self.model.get_image_features(**inputs)
            else:  # resnet50
                tensor = self.preprocess(img).unsqueeze(0).to(self.device)
                feats = self.model(tensor).squeeze(-1).squeeze(-1)

            feats = feats / feats.norm(p=2, dim=-1, keepdim=True)
            return feats.cpu().numpy().flatten()

    def extract_text_embedding(self, texts: List[str]) -> np.ndarray:
        """Extract L2-normalized text embeddings (CLIP only)."""
        if self.model_type != "clip":
            raise NotImplementedError("Text embeddings are only supported for CLIP model type.")
            
        with torch.no_grad():
            if self.backend == "open_clip":
                tokens = self.tokenizer(texts).to(self.device)
                feats = self.model.encode_text(tokens)
            else:
                inputs = self.processor(text=texts, return_tensors="pt", padding=True).to(self.device)
                feats = self.model.get_text_features(**inputs)
                
            feats = feats / feats.norm(p=2, dim=-1, keepdim=True)
            return feats.cpu().numpy()

    def extract_dataset_embeddings(self, df: pd.DataFrame, save_dir: Path, batch_size: int = 32) -> Tuple[np.ndarray, List[str]]:
        """
        Extract & save L2-normalized embeddings for entire metadata dataset with batching & checkpointing.
        """
        save_dir = Path(save_dir)
        save_dir.mkdir(parents=True, exist_ok=True)
        
        vectors_path = save_dir / "item_embeddings.npy"
        ids_path = save_dir / "item_ids.json"
        
        image_paths = df["image_path"].tolist()
        item_ids = df["item_id"].astype(str).tolist()
        
        # Check if already processed completely
        if vectors_path.exists() and ids_path.exists():
            print(f"Loading existing embeddings from {vectors_path}...")
            embeddings = np.load(vectors_path)
            with open(ids_path, "r", encoding="utf-8") as f:
                saved_ids = json.load(f)
            if len(embeddings) == len(df) and saved_ids == item_ids:
                print("Loaded cached embeddings successfully.")
                return embeddings, saved_ids

        print(f"Extracting embeddings for {len(df)} dataset items...")
        all_embeddings = []
        valid_ids = []
        
        for i in range(0, len(image_paths), batch_size):
            batch_paths = image_paths[i:i + batch_size]
            batch_ids = item_ids[i:i + batch_size]
            batch_tensors = []
            batch_valid_ids = []
            
            for img_p, item_id in zip(batch_paths, batch_ids):
                p = Path(img_p)
                if not p.exists():
                    print(f"Warning: image path missing {img_p}")
                    continue
                try:
                    img = Image.open(p).convert("RGB")
                    if self.preprocess:
                        t = self.preprocess(img)
                    else:
                        t = self.processor(images=img, return_tensors="pt")["pixel_values"][0]
                    batch_tensors.append(t)
                    batch_valid_ids.append(item_id)
                except Exception as e:
                    print(f"Error processing image {img_p}: {e}")

            if not batch_tensors:
                continue

            with torch.no_grad():
                if self.preprocess:
                    t_stack = torch.stack(batch_tensors).to(self.device)
                    if self.model_type == "clip":
                        feats = self.model.encode_image(t_stack)
                    else:
                        feats = self.model(t_stack).squeeze(-1).squeeze(-1)
                else:
                    t_stack = torch.stack(batch_tensors).to(self.device)
                    feats = self.model.get_image_features(pixel_values=t_stack)
                    
                feats = feats / feats.norm(p=2, dim=-1, keepdim=True)
                all_embeddings.append(feats.cpu().numpy())
                valid_ids.extend(batch_valid_ids)
                
            print(f"Processed batch [{min(i+batch_size, len(image_paths))}/{len(image_paths)}]")

        if not all_embeddings:
            raise ValueError("No embeddings were extracted!")

        embeddings_matrix = np.vstack(all_embeddings).astype(np.float32)
        
        # Save to disk
        np.save(vectors_path, embeddings_matrix)
        with open(ids_path, "w", encoding="utf-8") as f:
            json.dump(valid_ids, f, indent=2)
            
        print(f"Saved {embeddings_matrix.shape[0]} embeddings of dim {embeddings_matrix.shape[1]} to {save_dir}")
        return embeddings_matrix, valid_ids

if __name__ == "__main__":
    config = load_config()
    extractor = FeatureExtractor(
        model_type=config["model"]["type"],
        model_name=config["model"]["clip_model_name"],
        device=config["model"]["device"]
    )
    df = pd.read_csv(config["dataset"]["metadata_file"])
    embeddings, ids = extractor.extract_dataset_embeddings(
        df,
        save_dir=Path(config["embeddings"]["save_dir"]),
        batch_size=config["model"]["batch_size"]
    )
    print("Embedding extraction test completed! Shape:", embeddings.shape)
