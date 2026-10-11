import os
import json
import random
import pandas as pd
# pyrefly: ignore [missing-import]
import numpy as np
from pathlib import Path
# pyrefly: ignore [missing-import]
from PIL import Image, ImageDraw
from src.config import load_config

# Broad category mapping keywords
CATEGORY_MAP = {
    "top": ["top", "tops", "t-shirt", "tee", "blouse", "camisole", "tank", "sweater", "cardigan", "hoodie", "sweatshirt"],
    "shirt": ["shirt", "button-down", "polo", "dress shirt"],
    "dress": ["dress", "gown", "jumpsuit", "romper"],
    "jeans/pants": ["jeans", "pants", "trousers", "leggings", "sweatpants", "shorts", "denim"],
    "skirt": ["skirt", "mini skirt", "midi skirt", "maxi skirt"],
    "shoes": ["shoes", "boots", "sneakers", "sandals", "heels", "pumps", "flats", "loafers", "footwear"],
    "jacket/outerwear": ["jacket", "coat", "blazer", "outerwear", "vest", "parka", "trench", "overcoat"],
    "bag": ["bag", "handbag", "tote", "clutch", "backpack", "purse", "shoulder bag", "crossbody"],
    "accessories": ["accessory", "accessories", "belt", "sunglasses", "hat", "scarf", "jewelry", "necklace", "ring", "watch", "earrings", "bracelet", "glasses", "tie"]
}

DEFAULT_CATEGORIES = list(CATEGORY_MAP.keys())

def map_fine_category_to_broad(category_str: str) -> str:
    """Map fine category or item description to broad category."""
    if not category_str:
        return "accessories"
    cat_lower = str(category_str).lower()
    
    for broad_cat, keywords in CATEGORY_MAP.items():
        for kw in keywords:
            if kw in cat_lower:
                return broad_cat
    return "accessories"

def create_sample_dataset(raw_dir: Path, processed_dir: Path, num_outfits: int = 100, items_per_outfit: int = 5):
    """
    Creates a synthetic Polyvore-structured sample dataset with images and outfit JSONs
    if real dataset is not yet present.
    """
    print(f"Creating sample dataset with {num_outfits} outfits in {raw_dir}...")
    img_dir = raw_dir / "images"
    img_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    outfits = []
    items_meta = {}
    
    color_palette = {
        "black": (20, 20, 20),
        "white": (240, 240, 240),
        "red": (220, 40, 40),
        "blue": (40, 80, 220),
        "green": (40, 180, 80),
        "yellow": (240, 220, 50),
        "beige": (225, 200, 160),
        "pink": (240, 140, 180),
        "brown": (120, 70, 30),
        "grey": (130, 130, 130)
    }

    item_counter = 1
    
    category_shapes = {
        "top": "rect",
        "shirt": "rect",
        "dress": "dress",
        "jeans/pants": "pants",
        "skirt": "triangle",
        "shoes": "shoes",
        "jacket/outerwear": "outerwear",
        "bag": "bag",
        "accessories": "circle"
    }

    for outfit_idx in range(1, num_outfits + 1):
        outfit_id = f"outfit_{outfit_idx:04d}"
        outfit_items = []
        
        # Pick 4-5 items per outfit from different categories
        chosen_cats = random.sample(DEFAULT_CATEGORIES, k=min(items_per_outfit, len(DEFAULT_CATEGORIES)))
        
        for pos, cat in enumerate(chosen_cats):
            item_id = f"item_{item_counter:05d}"
            color_name, color_rgb = random.choice(list(color_palette.items()))
            img_filename = f"{item_id}.jpg"
            img_path = img_dir / img_filename
            
            # Generate a 224x224 sample fashion image with colored shape
            img = Image.new("RGB", (224, 224), color=(255, 255, 255))
            draw = ImageDraw.Draw(img)
            
            shape = category_shapes.get(cat, "rect")
            if shape == "rect":
                draw.rectangle([50, 40, 174, 184], fill=color_rgb, outline=(0,0,0), width=2)
            elif shape == "dress":
                draw.polygon([(80, 40), (144, 40), (184, 200), (40, 200)], fill=color_rgb, outline=(0,0,0))
            elif shape == "pants":
                draw.rectangle([60, 40, 100, 200], fill=color_rgb)
                draw.rectangle([120, 40, 160, 200], fill=color_rgb)
            elif shape == "triangle":
                draw.polygon([(112, 50), (184, 190), (40, 190)], fill=color_rgb)
            elif shape == "circle":
                draw.ellipse([60, 60, 164, 164], fill=color_rgb)
            elif shape == "shoes":
                draw.rectangle([40, 120, 184, 180], fill=color_rgb)
            else:
                draw.rectangle([40, 40, 184, 184], fill=color_rgb)

            img.save(img_path, "JPEG")
            
            title = f"{color_name.capitalize()} {cat.capitalize()}"
            items_meta[item_id] = {
                "item_id": item_id,
                "image_path": str(img_path).replace("\\", "/"),
                "category": cat,
                "fine_category": cat,
                "outfit_id": outfit_id,
                "position_in_outfit": pos,
                "title": title,
                "color_label": color_name
            }
            
            outfit_items.append({
                "item_id": item_id,
                "index": pos,
                "category": cat
            })
            item_counter += 1
            
        outfits.append({
            "set_id": outfit_id,
            "items": outfit_items
        })
        
    # Save outfits JSON
    outfit_json_path = raw_dir / "sample_outfits.json"
    with open(outfit_json_path, "w", encoding="utf-8") as f:
        json.dump(outfits, f, indent=2)
        
    # Save metadata CSV/Parquet
    df = pd.DataFrame(list(items_meta.values()))
    csv_path = processed_dir / "items_metadata.csv"
    df.to_csv(csv_path, index=False)
    print(f"Sample dataset generated successfully with {len(df)} items and {len(outfits)} outfits.")
    return df

def parse_polyvore_dataset(raw_dir: Path, processed_dir: Path) -> pd.DataFrame:
    """
    Parses Polyvore dataset JSON files (e.g., train.json, valid.json, test.json,
    polyvore_item_metadata.json) if present in raw_dir.
    """
    raw_dir = Path(raw_dir)
    processed_dir = Path(processed_dir)
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    # Check for polyvore outfit JSON files
    json_files = list(raw_dir.glob("*.json")) + list(raw_dir.rglob("*.json"))
    meta_json = raw_dir / "polyvore_item_metadata.json"
    
    if not json_files:
        print("No Polyvore JSON files found in raw directory. Generating sample dataset...")
        return create_sample_dataset(raw_dir, processed_dir)
        
    meta_dict = {}
    if meta_json.exists():
        with open(meta_json, "r", encoding="utf-8") as f:
            meta_dict = json.load(f)
            
    items_list = []
    
    for jf in json_files:
        if "metadata" in jf.name.lower():
            continue
        try:
            with open(jf, "r", encoding="utf-8") as f:
                outfit_data = json.load(f)
                if not isinstance(outfit_data, list):
                    continue
                for set_obj in outfit_data:
                    set_id = set_obj.get("set_id") or set_obj.get("name", "unknown_set")
                    for item in set_obj.get("items", []):
                        item_id = str(item.get("item_id"))
                        index = item.get("index", 0)
                        
                        # Find image path
                        img_path = raw_dir / "images" / f"{item_id}.jpg"
                        if not img_path.exists():
                            # search recursive for item_id image
                            matches = list(raw_dir.rglob(f"{item_id}.jpg"))
                            if matches:
                                img_path = matches[0]
                        
                        m_info = meta_dict.get(item_id, {})
                        fine_cat = m_info.get("category_id") or item.get("category", "")
                        title = m_info.get("title") or item.get("name") or f"Item {item_id}"
                        broad_cat = map_fine_category_to_broad(fine_cat or title)
                        
                        items_list.append({
                            "item_id": item_id,
                            "image_path": str(img_path).replace("\\", "/"),
                            "category": broad_cat,
                            "fine_category": str(fine_cat),
                            "outfit_id": str(set_id),
                            "position_in_outfit": index,
                            "title": str(title)
                        })
        except Exception as e:
            print(f"Warning: could not parse {jf}: {e}")

    if not items_list:
        print("Could not parse items from existing JSONs. Generating sample dataset...")
        return create_sample_dataset(raw_dir, processed_dir)
        
    df = pd.DataFrame(items_list).drop_duplicates(subset=["item_id"])
    csv_path = processed_dir / "items_metadata.csv"
    df.to_csv(csv_path, index=False)
    print(f"Parsed Polyvore dataset: {len(df)} unique items found.")
    return df

def get_dataset_stats(df: pd.DataFrame):
    """Print dataset statistics."""
    total_items = len(df)
    total_outfits = df["outfit_id"].nunique()
    cat_counts = df["category"].value_counts().to_dict()
    
    stats = {
        "total_items": total_items,
        "total_outfits": total_outfits,
        "category_counts": cat_counts
    }
    
    print("\n" + "="*50)
    print("POLYVORE DATASET STATISTICS")
    print("="*50)
    print(f"Total Unique Items : {total_items}")
    print(f"Total Outfits      : {total_outfits}")
    print("Items Per Category :")
    for cat, count in cat_counts.items():
        print(f"  - {cat:<20}: {count}")
    print("="*50 + "\n")
    return stats

if __name__ == "__main__":
    config = load_config()
    raw_dir = Path(config["dataset"]["raw_dir"])
    processed_dir = Path(config["dataset"]["processed_dir"])
    
    df = parse_polyvore_dataset(raw_dir, processed_dir)
    get_dataset_stats(df)
