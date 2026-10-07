import React, { useState, useEffect } from 'react';
import { ITEMS_CATALOG, CATEGORY_LIST } from '../data/catalog';
import { fetchSimilarItems } from '../services/api';
import { Search, Layers, Sparkles, Filter, ShieldCheck, Crown } from 'lucide-react';

export default function SimilarityExplorer() {
  const [selectedItemId, setSelectedItemId] = useState('item_10006');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [similarResults, setSimilarResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedItem = ITEMS_CATALOG.find(i => i.item_id === selectedItemId) || ITEMS_CATALOG[0];

  useEffect(() => {
    handleSearch(selectedItemId, selectedCategory);
  }, [selectedItemId, selectedCategory]);

  async function handleSearch(itemId, cat) {
    setLoading(true);
    const results = await fetchSimilarItems(itemId, cat);
    setSimilarResults(results);
    setLoading(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '24px 32px',
        background: 'linear-gradient(135deg, rgba(26, 32, 48, 0.9) 0%, rgba(18, 24, 38, 0.95) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)'
      }}>
        <div>
          <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>
            <Search size={13} color="var(--cyan)" /> Neural FAISS Similarity Engine
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }} className="font-serif">
            Visual & Aesthetic Embedding Search
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Query our 512-dimensional CLIP embedding space to discover visually similar, silhouette-aligned designer garments.
          </p>
        </div>
      </div>

      {/* Query Selector & Category Filter */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'center' }}>
          
          {/* Query Item Preview */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '14px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--cyan)'
          }}>
            <img
              src={selectedItem.image_url}
              alt={selectedItem.title}
              style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' }}
            />
            <div>
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px', marginBottom: '4px' }}>
                Query Anchor
              </span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedItem.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {selectedItem.fabric || selectedItem.brand} • ${selectedItem.price}
              </div>
            </div>
          </div>

          {/* Filter Category Pills */}
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} /> Filter Candidate Categories:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  background: selectedCategory === null ? 'var(--cyan)' : 'rgba(255,255,255,0.06)',
                  color: selectedCategory === null ? '#000' : '#FFF',
                  cursor: 'pointer'
                }}
              >
                All Categories
              </button>
              {CATEGORY_LIST.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: 'none',
                    background: selectedCategory === cat.id ? 'var(--cyan)' : 'rgba(255,255,255,0.06)',
                    color: selectedCategory === cat.id ? '#000' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {cat.label.split('&')[0]}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Results Grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }} className="font-serif">
          Nearest Visual Neighbours in Latent Space
        </h3>

        {loading ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <Sparkles size={40} className="pulse-glow" color="var(--cyan)" style={{ marginBottom: '16px' }} />
            <h4>Executing FAISS Nearest-Neighbour Query...</h4>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
            {similarResults.map((item, idx) => (
              <div
                key={item.item_id || idx}
                onClick={() => setSelectedItemId(item.item_id)}
                className="glass-panel glass-panel-hover"
                style={{ padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--cyan)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {item.category}
                    </span>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      {Math.round((item.similarity_score || 0.9) * 100)}% Match
                    </span>
                  </div>

                  <div style={{ height: '160px', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                    <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.brand} • {item.fabric}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="color-swatch-circle" style={{ backgroundColor: item.color_hex }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{item.color_label}</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gold-light)' }}>${item.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
