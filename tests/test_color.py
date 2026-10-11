# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
import pytest
from src.color import detect_dominant_color, map_hsv_to_color_name
from src.color_theory import get_color_harmony_score, recommend_matching_colors, compute_blended_compatibility_score

def test_detect_dominant_color_red():
    img_np = np.zeros((100, 100, 3), dtype=np.uint8)
    img_np[:, :] = [220, 30, 30]  # Red RGB image
    res = detect_dominant_color(img_np)
    assert res["dominant_color"] == "red"
    assert res["hex"] == "#dc1e1e"

def test_detect_dominant_color_blue():
    img_np = np.zeros((100, 100, 3), dtype=np.uint8)
    img_np[:, :] = [30, 80, 220]  # Blue RGB image
    res = detect_dominant_color(img_np)
    assert res["dominant_color"] == "blue"

def test_color_harmony_rules():
    score_blue_beige = get_color_harmony_score("blue", "beige")
    assert score_blue_beige >= 0.90
    
    score_black_white = get_color_harmony_score("black", "white")
    assert score_black_white == 1.0

def test_color_recommendations():
    recs = recommend_matching_colors("red")
    assert len(recs) > 0
    colors = [r["color"] for r in recs]
    assert "black" in colors or "white" in colors or "beige" in colors

def test_blended_compatibility_score():
    blended = compute_blended_compatibility_score(
        learned_compat=0.9, style_sim=0.8, color_harmony=0.95
    )
    assert 85 <= blended["percentage"] <= 99
