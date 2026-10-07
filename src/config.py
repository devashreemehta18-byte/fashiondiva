import os
import yaml
from pathlib import Path

DEFAULT_CONFIG_PATH = Path(__file__).resolve().parent.parent / "config.yaml"

def load_config(config_path: str = None) -> dict:
    path = Path(config_path) if config_path else DEFAULT_CONFIG_PATH
    if not path.exists():
        raise FileNotFoundError(f"Config file not found at {path}")
    with open(path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    return config

if __name__ == "__main__":
    cfg = load_config()
    print("Loaded config successfully:")
    print("Model type:", cfg.get("model", {}).get("type"))
