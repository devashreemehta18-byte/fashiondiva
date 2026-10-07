import React, { useState, useEffect } from 'react';
import { getLocalFavourites, deleteLocalFavourite } from '../services/api';
import { Heart, Trash2, Download, Sparkles, Layers, Crown, ArrowRight, Share2 } from 'lucide-react';

export default function SavedOutfits({ onSelectOutfitForCanvas }) {
  const [favList, setFavList] = useState([]);

  useEffect(() => {
    setFavList(getLocalFavourites());
  }, []);

  function handleDelete(id) {
    const updated = deleteLocalFavourite(id);
    setFavList(updated);
  }

  function handleExportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(favList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fashiondiva_lookbook_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'linear-gradient(135deg, rgba(26, 32, 48, 0.9) 0%, rgba(18, 24, 38, 0.95) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)'
      }}>
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '8px' }}>
            <Crown size={13} color="var(--gold)" /> Haute Lookbook Vault
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }} className="font-serif">
            My Curated Haute Ensembles
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Your personal private collection of high-scoring, personalized ensembles.
          </p>
        </div>

        {favList.length > 0 && (
          <button onClick={handleExportJSON} className="btn-gold" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            <Download size={15} /> Export Lookbook Collection
          </button>
        )}
      </div>

      {favList.length === 0 ? (
        <div className="glass-panel" style={{ padding: '70px', textAlign: 'center' }}>
          <Heart size={48} color="var(--gold)" className="pulse-glow" style={{ marginBottom: '18px' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Your Haute Lookbook is Empty</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px', maxWidth: '500px', margin: '8px auto 0' }}>
            Explore the Styling Studio or Wardrobe Canvas and click "Save Look" to curate your signature wardrobe collection!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {favList.map((outfit, index) => (
            <div key={outfit.outfit_id || index} className="glass-panel glass-panel-hover" style={{ padding: '24px' }}>
              
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '16px',
                paddingBottom: '14px',
                borderBottom: '1px solid var(--border-glass)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
                    Ensemble #{index + 1}
                  </span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700 }} className="font-serif">
                    {outfit.look_name || `${outfit.overall_compatibility}% Runway Match`}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => onSelectOutfitForCanvas(outfit)}
                    className="btn-gold"
                    style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  >
                    <Layers size={14} /> Edit in Canvas
                  </button>
                  <button
                    onClick={() => handleDelete(outfit.outfit_id)}
                    className="btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.8rem', color: '#F43F5E' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Items Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${outfit.items.length}, 1fr)`, gap: '14px' }}>
                {outfit.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      background: 'rgba(0,0,0,0.4)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-glass)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                      {item.category}
                    </div>
                    <div style={{ height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                      <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.color_label}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-light)' }}>${item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lookbook Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                  Overall Compatibility: {outfit.overall_compatibility}%
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Look Value: <strong style={{ color: 'var(--gold-light)' }}>${outfit.total_price || outfit.items.reduce((s, itm) => s + (itm.price || 0), 0)}</strong>
                </span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
