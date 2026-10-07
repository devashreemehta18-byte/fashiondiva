# 👗 Fashion Compatibility Recommendation System (Polyvore Dataset)

A production-ready, full-stack **Fashion Compatibility & Outfit Recommendation Engine** built using PyTorch, OpenAI CLIP, FAISS, FastAPI, Streamlit, and SQLite based on the Polyvore dataset.

---

## 🌟 Features

1. **AI Fashion Analysis**:
   - **Category Detection**: CLIP zero-shot classification across 9 broad fashion categories (`top`, `shirt`, `dress`, `jeans/pants`, `skirt`, `shoes`, `jacket/outerwear`, `bag`, `accessories`).
   - **Dominant Color Extraction**: Foreground segmentation + K-Means clustering + HSV/LAB color mapping to 12 canonical named colors & hex swatches.
   - **Style Aesthetic Classification**: CLIP zero-shot matching across styles (`casual`, `formal`, `party`, `sporty`, `traditional`, `streetwear`, `minimalist`, `vintage`).
2. **FAISS Cosine Similarity Search**:
   - High-performance vector retrieval with global index + 9 category-filtered indexes.
3. **Learned Outfit Compatibility Model**:
   - PyTorch Siamese MLP network trained on Polyvore outfit item pairs `[a, b, a*b, |a-b|]`.
   - Evaluated with AUC score, Fill-In-The-Blank (FITB) accuracy, and Recall@K.
4. **Color Theory Harmony Engine**:
   - Rules for neutral pairing, complementary colors, analogous hues, and triadic relationships.
   - Blended compatibility score: `0.6 * learned_model + 0.2 * style_sim + 0.2 * color_harmony`.
5. **Complete Outfit Generation**:
   - Beam search assembly with pairwise compatibility re-ranking across item slots.
   - Generates Top-5 diverse, non-duplicate full outfit combinations.
6. **FastAPI Backend & Streamlit Web UI**:
   - RESTful endpoints (`/analyze`, `/similar`, `/recommend`, `/favourites`).
   - Modern Streamlit frontend dashboard with visual outfit cards and SQLite favourites storage.

---

## 🏗 Directory Structure

```text
fashion_analysis/
├── data/
│   ├── raw/                  # Polyvore dataset JSONs & item images
│   └── processed/            # Parsed items metadata CSV
├── embeddings/               # L2-normalized CLIP image vectors (.npy) & item IDs
├── indexes/                  # Global & per-category FAISS index files
├── models/                   # Saved trained PyTorch compatibility MLP model checkpoint
├── src/
│   ├── config.py             # Configuration YAML loader
│   ├── data_prep.py          # Polyvore dataset parser & sample generator
│   ├── embeddings.py         # Switchable CLIP / ResNet feature extractor
│   ├── category.py           # Zero-shot CLIP & classifier category detector
│   ├── color.py              # K-Means foreground color extractor
│   ├── style.py             # CLIP zero-shot style classifier
│   ├── similarity.py        # FAISS search manager
│   ├── compatibility.py     # Siamese MLP pair compatibility model & trainer
│   ├── color_theory.py      # Color harmony rules & score blending
│   └── outfit_generator.py  # Beam search outfit generator
├── api/
│   ├── database.py           # SQLite database for saved favourite outfits
│   └── main.py               # FastAPI backend application
├── app/
│   └── streamlit_app.py      # Streamlit web UI frontend
├── tests/                    # Pytest test suite
├── evaluate.py               # System evaluation script (AUC, FITB, Recall@5)
├── config.yaml               # System parameters & scoring weights
├── requirements.txt          # Dependencies
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Installation
Clone the repository and install the Python dependencies:

```bash
pip install -r requirements.txt
```

### 2. Dataset Setup
To setup or parse the Polyvore dataset:

```bash
python src/data_prep.py
```

*Note: If no Polyvore dataset is present in `data/raw/`, `src/data_prep.py` automatically generates a structured sample Polyvore dataset so you can run and test the complete pipeline out-of-the-box!*

To use the full Polyvore dataset:
1. Download Polyvore Outfits JSONs & images from [Polyvore Dataset](https://github.com/xthan/polyvore-dataset).
2. Place JSON files (`train.json`, `polyvore_item_metadata.json`) in `data/raw/` and images in `data/raw/images/`.
3. Re-run `python src/data_prep.py`.

### 3. Extract Image Embeddings & Build FAISS Indexes
```bash
python src/embeddings.py
```

### 4. Evaluate System (AUC, FITB Accuracy, Recall@K)
```bash
python evaluate.py
```

### 5. Launch FastAPI Backend API
```bash
uvicorn api.main:app --reload --port 8000
```
Open interactive Swagger API docs at `http://localhost:8000/docs`.

### 6. Launch Streamlit Web UI
```bash
streamlit run app/streamlit_app.py
```

---

## 🧪 Unit Testing

Run the test suite using `pytest`:

```bash
pytest tests/
```

---

## ⚙️ Configuration (`config.yaml`)

You can switch models (`clip` vs `resnet50`), adjust batch sizes, scoring weights, or outfit slots directly in `config.yaml`:

```yaml
model:
  type: "clip"
  clip_model_name: "ViT-B-32"
  device: "auto"

scoring:
  weights:
    learned_compatibility: 0.6
    style_similarity: 0.2
    color_harmony: 0.2
```
