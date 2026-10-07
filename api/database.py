import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Optional

DB_PATH = Path("favourites.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize SQLite database tables."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS favourites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        outfit_id TEXT NOT NULL,
        overall_compatibility INTEGER NOT NULL,
        items_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()
    print(f"SQLite database initialized at {DB_PATH.resolve()}")

def save_favourite_outfit(outfit_data: Dict) -> Dict:
    """Save an outfit to SQLite database."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    outfit_id = str(outfit_data.get("outfit_id", "saved_outfit"))
    compat = int(outfit_data.get("overall_compatibility", 90))
    items_json = json.dumps(outfit_data.get("items", []))
    
    cursor.execute("""
    INSERT INTO favourites (outfit_id, overall_compatibility, items_json)
    VALUES (?, ?, ?)
    """, (outfit_id, compat, items_json))
    
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "id": new_id,
        "outfit_id": outfit_id,
        "overall_compatibility": compat,
        "items": outfit_data.get("items", [])
    }

def get_favourite_outfits() -> List[Dict]:
    """List all saved favourite outfits."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, outfit_id, overall_compatibility, items_json, created_at FROM favourites ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    favourites = []
    for r in rows:
        favourites.append({
            "id": r["id"],
            "outfit_id": r["outfit_id"],
            "overall_compatibility": r["overall_compatibility"],
            "items": json.loads(r["items_json"]),
            "created_at": r["created_at"]
        })
    return favourites

def delete_favourite_outfit(fav_id: int) -> bool:
    """Delete favourite outfit by ID."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM favourites WHERE id = ?", (fav_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

if __name__ == "__main__":
    init_db()
