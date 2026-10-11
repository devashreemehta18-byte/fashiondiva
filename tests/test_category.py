# pyrefly: ignore [missing-import]
import pytest
from src.data_prep import map_fine_category_to_broad

def test_map_fine_category_to_broad():
    assert map_fine_category_to_broad("Graphic T-Shirt") == "top"
    assert map_fine_category_to_broad("Denim Skinny Jeans") == "jeans/pants"
    assert map_fine_category_to_broad("High Heel Leather Boots") == "shoes"
    assert map_fine_category_to_broad("Leather Handbag Tote") == "bag"
    assert map_fine_category_to_broad("Winter Trench Coat") == "jacket/outerwear"
    assert map_fine_category_to_broad("Gold Necklace Ring") == "accessories"
