import os
import random
# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import numpy as np
import pandas as pd
# pyrefly: ignore [missing-import]
import torch.nn as nn
from pathlib import Path
from typing import List, Tuple, Dict
from sklearn.metrics import roc_auc_score, accuracy_score
# pyrefly: ignore [missing-import]
from torch.utils.data import Dataset, DataLoader

class CompatibilityMLP(nn.Module):
    """
    Siamese MLP for Item Compatibility Prediction.
    Takes item embeddings a and b, concatenates [a, b, a*b, |a-b|] (4 * D) -> 1
    """
    def __init__(self, embedding_dim: int = 512, hidden_dim: int = 256, dropout: float = 0.2):
        super(CompatibilityMLP, self).__init__()
        input_dim = 4 * embedding_dim
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

    def forward(self, emb_a: torch.Tensor, emb_b: torch.Tensor) -> torch.Tensor:
        mult = emb_a * emb_b
        diff = torch.abs(emb_a - emb_b)
        x = torch.cat([emb_a, emb_b, mult, diff], dim=-1)
        return self.net(x).squeeze(-1)

class ItemPairDataset(Dataset):
    def __init__(self, pairs: List[Tuple[int, int, float]], embeddings: np.ndarray):
        self.pairs = pairs
        self.embeddings = torch.tensor(embeddings, dtype=torch.float32)

    def __len__(self):
        return len(self.pairs)

    def __getitem__(self, idx):
        idx_a, idx_b, label = self.pairs[idx]
        return self.embeddings[idx_a], self.embeddings[idx_b], torch.tensor(label, dtype=torch.float32)

def generate_polyvore_pairs(df: pd.DataFrame, item_ids: List[str]) -> List[Tuple[int, int, float]]:
    """
    Generate positive pairs (in same outfit) and hard negative pairs (different outfits).
    """
    id_to_idx = {item_id: idx for idx, item_id in enumerate(item_ids)}
    df_filtered = df[df["item_id"].astype(str).isin(id_to_idx)].copy()
    
    outfit_groups = df_filtered.groupby("outfit_id")["item_id"].apply(list).to_dict()
    all_outfits = list(outfit_groups.keys())
    
    pairs = []
    
    # Positive pairs
    for outfit_id, items in outfit_groups.items():
        if len(items) < 2:
            continue
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                idx_a = id_to_idx[str(items[i])]
                idx_b = id_to_idx[str(items[j])]
                pairs.append((idx_a, idx_b, 1.0))
                
    num_positives = len(pairs)
    
    # Negative pairs (random sampling from different outfits)
    neg_count = 0
    while neg_count < num_positives:
        o1, o2 = random.sample(all_outfits, 2)
        if o1 == o2 or not outfit_groups[o1] or not outfit_groups[o2]:
            continue
        item_a = random.choice(outfit_groups[o1])
        item_b = random.choice(outfit_groups[o2])
        idx_a = id_to_idx[str(item_a)]
        idx_b = id_to_idx[str(item_b)]
        pairs.append((idx_a, idx_b, 0.0))
        neg_count += 1
        
    random.shuffle(pairs)
    return pairs

class CompatibilityPredictor:
    def __init__(self, model_path: Path = None, embedding_dim: int = 512, device: str = "cpu"):
        self.device = device
        self.embedding_dim = embedding_dim
        self.model = CompatibilityMLP(embedding_dim=embedding_dim).to(device)
        self.model_path = Path(model_path) if model_path else None
        
        if self.model_path and self.model_path.exists():
            try:
                state_dict = torch.load(self.model_path, map_location=device)
                self.model.load_state_dict(state_dict)
                self.model.eval()
                print(f"Loaded Compatibility Model from {self.model_path}")
            except Exception as e:
                print(f"Note: Could not load compatibility model weights: {e}")

    def train_model(
        self,
        df: pd.DataFrame,
        embeddings: np.ndarray,
        item_ids: List[str],
        save_path: Path,
        epochs: int = 10,
        lr: float = 0.001,
        batch_size: int = 64
    ) -> Dict[str, float]:
        """
        Train Siamese MLP compatibility network and report train AUC/Accuracy.
        """
        pairs = generate_polyvore_pairs(df, item_ids)
        if not pairs:
            raise ValueError("No item pairs available to train compatibility model.")
            
        dataset = ItemPairDataset(pairs, embeddings)
        dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        
        optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)
        criterion = nn.BCELoss()
        
        self.model.train()
        print(f"Training Compatibility Model on {len(pairs)} pairs for {epochs} epochs...")
        
        for epoch in range(epochs):
            total_loss = 0.0
            all_preds, all_labels = [], []
            
            for emb_a, emb_b, labels in dataloader:
                emb_a, emb_b, labels = emb_a.to(self.device), emb_b.to(self.device), labels.to(self.device)
                optimizer.zero_grad()
                
                outputs = self.model(emb_a, emb_b)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item() * len(labels)
                all_preds.extend(outputs.detach().cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
                
            avg_loss = total_loss / len(pairs)
            auc = roc_auc_score(all_labels, all_preds)
            acc = accuracy_score(all_labels, np.array(all_preds) >= 0.5)
            
            if (epoch + 1) % max(1, epochs // 5) == 0 or epoch == epochs - 1:
                print(f"Epoch [{epoch+1}/{epochs}] - Loss: {avg_loss:.4f} | AUC: {auc:.4f} | Acc: {acc:.4f}")

        save_path = Path(save_path)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        torch.save(self.model.state_dict(), save_path)
        self.model.eval()
        self.model_path = save_path
        
        metrics = {"loss": float(avg_loss), "auc": float(auc), "accuracy": float(acc)}
        return metrics

    def predict_pair_compatibility(self, emb_a: np.ndarray, emb_b: np.ndarray) -> float:
        """Predict pair compatibility score in range [0.0, 1.0]."""
        with torch.no_grad():
            t_a = torch.tensor(emb_a, dtype=torch.float32).unsqueeze(0).to(self.device)
            t_b = torch.tensor(emb_b, dtype=torch.float32).unsqueeze(0).to(self.device)
            score = self.model(t_a, t_b).item()
            return float(score)

    def evaluate_fitb(self, df: pd.DataFrame, embeddings: np.ndarray, item_ids: List[str], num_samples: int = 50) -> float:
        """
        Evaluate Fill-In-The-Blank (FITB) accuracy:
        Given an outfit missing 1 item, pick the correct ground truth item from 4 candidate options.
        """
        id_to_idx = {item_id: idx for idx, item_id in enumerate(item_ids)}
        df_filtered = df[df["item_id"].astype(str).isin(id_to_idx)].copy()
        
        outfits = df_filtered.groupby("outfit_id")["item_id"].apply(list).to_dict()
        valid_outfits = [items for items in outfits.values() if len(items) >= 3]
        
        if not valid_outfits:
            return 0.0
            
        correct = 0
        total = 0
        
        for items in valid_outfits[:num_samples]:
            gt_item = random.choice(items)
            context_items = [i for i in items if i != gt_item]
            
            # Select 3 distractor negative items
            distractors = []
            while len(distractors) < 3:
                rnd_item = random.choice(item_ids)
                if rnd_item not in items and rnd_item not in distractors:
                    distractors.append(rnd_item)
                    
            candidates = [gt_item] + distractors
            random.shuffle(candidates)
            
            # Score each candidate against context items
            candidate_scores = []
            for cand in candidates:
                cand_emb = embeddings[id_to_idx[cand]]
                context_compatibilities = []
                for ctx in context_items:
                    ctx_emb = embeddings[id_to_idx[ctx]]
                    score = self.predict_pair_compatibility(cand_emb, ctx_emb)
                    context_compatibilities.append(score)
                avg_score = np.mean(context_compatibilities)
                candidate_scores.append(avg_score)
                
            best_candidate = candidates[np.argmax(candidate_scores)]
            if best_candidate == gt_item:
                correct += 1
            total += 1
            
        fitb_acc = correct / total if total > 0 else 0.0
        print(f"FITB Accuracy ({total} samples): {fitb_acc * 100:.2f}%")
        return fitb_acc

if __name__ == "__main__":
    print("Compatibility module loaded.")
