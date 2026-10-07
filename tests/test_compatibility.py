import torch
import numpy as np
import pytest
from src.compatibility import CompatibilityMLP, CompatibilityPredictor

def test_compatibility_mlp_forward():
    model = CompatibilityMLP(embedding_dim=512, hidden_dim=256)
    emb_a = torch.randn(4, 512)
    emb_b = torch.randn(4, 512)
    out = model(emb_a, emb_b)
    assert out.shape == (4,)
    assert (out >= 0.0).all() and (out <= 1.0).all()

def test_compatibility_predictor_single_pair():
    predictor = CompatibilityPredictor(embedding_dim=512, device="cpu")
    v_a = np.random.randn(512).astype(np.float32)
    v_b = np.random.randn(512).astype(np.float32)
    v_a = v_a / np.linalg.norm(v_a)
    v_b = v_b / np.linalg.norm(v_b)
    
    score = predictor.predict_pair_compatibility(v_a, v_b)
    assert 0.0 <= score <= 1.0
