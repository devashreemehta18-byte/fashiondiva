from typing import List, Dict, Tuple

NEUTRALS = {"black", "white", "grey", "beige", "brown"}

COLOR_HUES = {
    "red": 0,
    "orange": 30,
    "yellow": 60,
    "green": 120,
    "blue": 240,
    "purple": 280,
    "pink": 330
}

# Pre-defined curated high-fashion pairs
HIGH_HARMONY_PAIRS = {
    ("blue", "white"): 1.0,
    ("blue", "beige"): 0.98,
    ("blue", "brown"): 0.92,
    ("red", "black"): 0.96,
    ("red", "white"): 0.95,
    ("green", "beige"): 0.94,
    ("green", "black"): 0.92,
    ("yellow", "blue"): 0.88,
    ("pink", "grey"): 0.95,
    ("purple", "yellow"): 0.90,
    ("black", "white"): 1.0,
    ("black", "black"): 0.90,
    ("white", "white"): 0.90
}

def get_color_harmony_score(color1: str, color2: str) -> float:
    """
    Calculate color harmony score between 0.0 and 1.0 using color theory rules.
    """
    c1, c2 = str(color1).lower(), str(color2).lower()
    if c1 == c2:
        return 0.88
        
    pair = tuple(sorted([c1, c2]))
    if pair in HIGH_HARMONY_PAIRS:
        return HIGH_HARMONY_PAIRS[pair]
        
    # Neutral pairing rule
    if c1 in NEUTRALS or c2 in NEUTRALS:
        return 0.95
        
    if c1 not in COLOR_HUES or c2 not in COLOR_HUES:
        return 0.75
        
    h1, h2 = COLOR_HUES[c1], COLOR_HUES[c2]
    diff = abs(h1 - h2)
    if diff > 180:
        diff = 360 - diff
        
    # Complementary (~180°)
    if 150 <= diff <= 210:
        return 0.95
    # Triadic (~120°)
    elif 100 <= diff <= 140:
        return 0.88
    # Analogous (~30-60°)
    elif 30 <= diff <= 60:
        return 0.90
    # Slightly clashing
    elif diff < 30:
        return 0.70
    else:
        return 0.75

def recommend_matching_colors(input_color: str) -> List[Dict[str, str]]:
    """
    Return list of recommended matching colors with harmony rule tags.
    """
    c = str(input_color).lower()
    recommendations = []
    
    # 1. Neutrals
    for n in ["black", "white", "beige", "grey"]:
        if n != c:
            recommendations.append({
                "color": n,
                "harmony_type": "Neutral Pairing",
                "score": get_color_harmony_score(c, n)
            })
            
    # 2. Complementary / Wheel rules
    if c in COLOR_HUES:
        h = COLOR_HUES[c]
        comp_hue = (h + 180) % 360
        # Find closest color hue
        closest_comp = min(COLOR_HUES.keys(), key=lambda k: min(abs(COLOR_HUES[k] - comp_hue), 360 - abs(COLOR_HUES[k] - comp_hue)))
        if closest_comp != c and closest_comp not in [r["color"] for r in recommendations]:
            recommendations.append({
                "color": closest_comp,
                "harmony_type": "Complementary",
                "score": get_color_harmony_score(c, closest_comp)
            })
            
        # Analogous
        analogous_hue = (h + 40) % 360
        closest_ana = min(COLOR_HUES.keys(), key=lambda k: min(abs(COLOR_HUES[k] - analogous_hue), 360 - abs(COLOR_HUES[k] - analogous_hue)))
        if closest_ana != c and closest_ana not in [r["color"] for r in recommendations]:
            recommendations.append({
                "color": closest_ana,
                "harmony_type": "Analogous",
                "score": get_color_harmony_score(c, closest_ana)
            })
            
    # Sort recommendations by score descending
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[:5]

def compute_blended_compatibility_score(
    learned_compat: float,
    style_sim: float,
    color_harmony: float,
    w_learned: float = 0.6,
    w_style: float = 0.2,
    w_color: float = 0.2
) -> Dict:
    """
    Blends learned compatibility + style similarity + color harmony.
    Returns composite score percentage & breakdown.
    """
    blended = (w_learned * learned_compat) + (w_style * style_sim) + (w_color * color_harmony)
    percentage = int(round(blended * 100))
    # clamp percentage between 50% and 99% for realistic user experience
    percentage = max(50, min(99, percentage))
    
    return {
        "percentage": percentage,
        "score_float": round(blended, 4),
        "breakdown": {
            "learned_model_score": round(learned_compat, 3),
            "style_similarity": round(style_sim, 3),
            "color_harmony": round(color_harmony, 3)
        }
    }

if __name__ == "__main__":
    score = get_color_harmony_score("blue", "beige")
    recs = recommend_matching_colors("red")
    print(f"Blue + Beige score: {score}")
    print("Red matching color recommendations:", recs)
