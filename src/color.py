# pyrefly: ignore [missing-import]
from pathlib import Path
# pyrefly: ignore [missing-import]
import cv2
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from PIL import Image
from typing import Tuple, Dict, List, Union
from sklearn.cluster import KMeans

COLOR_PROFILES = [
    # (name, (H_min, H_max, S_min, S_max, V_min, V_max))
    ("black", (0, 180, 0, 255, 0, 45)),
    ("white", (0, 180, 0, 30, 215, 255)),
    ("grey", (0, 180, 0, 40, 45, 215)),
    ("red", (0, 10, 50, 255, 50, 255)),
    ("red2", (170, 180, 50, 255, 50, 255)),
    ("orange", (11, 25, 60, 255, 70, 255)),
    ("beige", (15, 30, 20, 120, 180, 255)),
    ("yellow", (26, 35, 60, 255, 70, 255)),
    ("green", (36, 85, 40, 255, 40, 255)),
    ("blue", (86, 130, 40, 255, 40, 255)),
    ("purple", (131, 155, 40, 255, 40, 255)),
    ("pink", (156, 169, 40, 255, 70, 255)),
    ("brown", (10, 25, 40, 220, 30, 175)),
]

def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
    return "#{:02x}{:02x}{:02x}".format(rgb[0], rgb[1], rgb[2])

def map_hsv_to_color_name(hsv: Tuple[int, int, int], rgb: Tuple[int, int, int]) -> str:
    """Map HSV & RGB values to human-understandable color name."""
    h, s, v = hsv
    r, g, b = rgb
    
    # Check achromatic / low saturation / dark / light first
    if v < 40:
        return "black"
    if s < 30 and v > 210:
        return "white"
    if s < 40 and 40 <= v <= 210:
        return "grey"
        
    # Check beige/brown specifically using RGB relations
    if r > 180 and g > 160 and b > 130 and abs(r - g) < 40 and (r - b) > 30:
        return "beige"
    if r > 80 and g > 50 and b < 60 and r > g > b and s < 180 and v < 180:
        return "brown"

    for name, (h_min, h_max, s_min, s_max, v_min, v_max) in COLOR_PROFILES:
        if h_min <= h <= h_max and s_min <= s <= s_max and v_min <= v <= v_max:
            if name == "red2":
                return "red"
            return name

    # Fallback nearest RGB distance anchor
    anchors = {
        "black": (20, 20, 20),
        "white": (240, 240, 240),
        "grey": (128, 128, 128),
        "red": (220, 30, 30),
        "blue": (30, 80, 220),
        "green": (30, 180, 60),
        "yellow": (230, 210, 40),
        "orange": (230, 120, 30),
        "pink": (240, 130, 170),
        "purple": (130, 40, 200),
        "beige": (220, 200, 160),
        "brown": (110, 60, 30)
    }
    best_name = "grey"
    min_dist = float("inf")
    for a_name, a_rgb in anchors.items():
        dist = np.sum((np.array(rgb) - np.array(a_rgb)) ** 2)
        if dist < min_dist:
            min_dist = dist
            best_name = a_name
    return best_name

def extract_foreground_pixels(image_np: np.ndarray) -> np.ndarray:
    """
    Segmentation to remove white/near-white or uniform background pixels.
    """
    h, w, c = image_np.shape
    # Center crop region assumption (clothing usually in middle 80%)
    margin_h = int(h * 0.05)
    margin_w = int(w * 0.05)
    crop = image_np[margin_h:h-margin_h, margin_w:w-margin_w]
    
    # Flatten crop pixels
    pixels = crop.reshape(-1, 3)
    
    # Filter out pure white/very light background (e.g., R>245, G>245, B>245)
    non_bg_mask = ~((pixels[:, 0] > 242) & (pixels[:, 1] > 242) & (pixels[:, 2] > 242))
    fg_pixels = pixels[non_bg_mask]
    
    if len(fg_pixels) < 50:
        return pixels  # fallback to all pixels if mask eliminates everything
    return fg_pixels

def detect_dominant_color(image_input: Union[str, Image.Image, np.ndarray], n_colors: int = 3) -> Dict:
    """
    Extract foreground pixels, perform K-Means clustering, and return dominant color details.
    """
    if isinstance(image_input, (str, Path)):
        img = Image.open(image_input).convert("RGB")
        img_np = np.array(img)
    elif isinstance(image_input, Image.Image):
        img_np = np.array(image_input.convert("RGB"))
    elif isinstance(image_input, np.ndarray):
        img_np = image_input
    else:
        raise ValueError("Invalid image input type.")

    fg_pixels = extract_foreground_pixels(img_np)
    
    # K-Means clustering
    kmeans = KMeans(n_clusters=min(n_colors, len(fg_pixels)), n_init=5, random_state=42)
    labels = kmeans.fit_predict(fg_pixels)
    centers = kmeans.cluster_centers_.astype(int)
    
    # Count cluster frequencies
    counts = np.bincount(labels)
    sorted_indices = np.argsort(counts)[::-1]
    
    dominant_rgb = tuple(centers[sorted_indices[0]])
    
    # Convert dominant RGB to HSV
    hsv_pixel = cv2.cvtColor(np.uint8([[dominant_rgb]]), cv2.COLOR_RGB2HSV)[0][0]
    color_name = map_hsv_to_color_name(tuple(hsv_pixel), dominant_rgb)
    hex_code = rgb_to_hex(dominant_rgb)
    
    # Palette of top colors
    palette = []
    total_pixels = len(fg_pixels)
    for idx in sorted_indices:
        rgb_tuple = tuple(centers[idx])
        pct = float(counts[idx] / total_pixels)
        hsv_t = cv2.cvtColor(np.uint8([[rgb_tuple]]), cv2.COLOR_RGB2HSV)[0][0]
        c_name = map_hsv_to_color_name(tuple(hsv_t), rgb_tuple)
        palette.append({
            "color_name": c_name,
            "rgb": rgb_tuple,
            "hex": rgb_to_hex(rgb_tuple),
            "percentage": round(pct, 3)
        })
        
    return {
        "dominant_color": color_name,
        "hex": hex_code,
        "rgb": dominant_rgb,
        "hsv": tuple(hsv_pixel),
        "palette": palette
    }

if __name__ == "__main__":
    test_img = np.zeros((100, 100, 3), dtype=np.uint8)
    test_img[:, :] = [220, 50, 50]  # Red test image
    res = detect_dominant_color(test_img)
    print("Color Detection Test Output:", res)
