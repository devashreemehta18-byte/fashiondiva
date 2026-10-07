import React, { useState, useEffect } from 'react';
import { ITEMS_CATALOG, CATEGORY_LIST, BODY_TYPES, DRESSING_OCCASIONS, getItemById } from '../data/catalog';
import { predictPairCompatibility, calculateColorHarmonyScore, calculateBodyTypeFlatteryScore, saveLocalFavourite } from '../services/api';
import { Layers, RefreshCw, Heart, Sparkles, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, X, Crown, Scissors } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WardrobeCanvas({ currentOutfit, onUpdateOutfit, userProfile }) {
  const defaultItems = currentOutfit?.items || [
    getItemById('item_10006'), // Emerald Gown
    getItemById('item_10016'), // Camel Wool Coat
    getItemById('item_10013'), // Stiletto Heels
    getItemById('item_10019'), // Croc Bag
    getItemById('item_10021')  // Gold Necklace
  ];

  const [slotItems, setSlotItems] = useState(defaultItems);
  const [activeSlotIndex, setActiveSlotIndex] = useState(null);
  const [compatScores, setCompatScores] = useState({ overall: 96, learned: 95, body: 96, color: 95 });
  const [stylistFeedback, setStylistFeedback] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentBody = BODY_TYPES.find(b => b.id === userProfile?.bodyType) || BODY_TYPES[0];
  const currentOccasion = DRESSING_OCCASIONS.find(o => o.id === userProfile?.occasion) || DRESSING_OCCASIONS[0];

  useEffect(() => {
    if (currentOutfit?.items) {
      setSlotItems(currentOutfit.items);
    }
  }, [currentOutfit]);

  useEffect(() => {
    recalculateScores(slotItems);
  }, [slotItems, userProfile?.bodyType, userProfile?.occasion]);

  function recalculateScores(items) {
    if (!items || items.length === 0) return;

    let pairSum = 0;
    let count = 0;
    let colorSum = 0;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const itemA = items[i];
        const itemB = items[j];
        if (!itemA || !itemB) continue;

        const pScore = predictPairCompatibility(itemA, itemB, userProfile?.bodyType, userProfile?.occasion);
        pairSum += pScore;

        const cHarm = calculateColorHarmonyScore(itemA.color_label, itemB.color_label);
        colorSum += cHarm;
        count++;
      }
    }

    const n = count || 1;
    const bodyFlattery = calculateBodyTypeFlatteryScore(items, userProfile?.bodyType || 'hourglass');
    const color = Math.round((colorSum / n) * 100);
    const learned = Math.min(99, Math.round((pairSum / n) * 100));
    const overall = Math.round(0.40 * learned + 0.35 * bodyFlattery + 0.25 * color);

    setCompatScores({ overall, learned, body: bodyFlattery, color });

    // Generate dynamic stylist critique
    if (color < 75) {
      setStylistFeedback('⚠️ Color palette contrast is elevated. Consider balancing with ivory, champagne gold, or onyx.');
    } else if (overall >= 90) {
      setStylistFeedback(`✨ Flawless Runway Ensemble! Harmonious color tones, luxury texture synergy, and optimal silhouette flattery for your ${currentBody.name} frame.`);
    } else {
      setStylistFeedback('👍 Strong aesthetic profile. Well-suited for elevated daily wear and versatile layering.');
    }
  }

  function handleReplaceItem(newItem) {
    if (activeSlotIndex === null) return;
    const updated = [...slotItems];
    updated[activeSlotIndex] = newItem;
    setSlotItems(updated);
    setActiveSlotIndex(null);
    if (onUpdateOutfit) {
      onUpdateOutfit({
        ...currentOutfit,
        items: updated
      });
    }
  }

  function handleSaveCanvasOutfit() {
    const outfitToSave = {
      outfit_id: `custom_canvas_${Date.now()}`,
      look_name: `Custom FashionDiva Look (${currentOccasion.name})`,
      overall_compatibility: compatScores.overall,
      learned_model_score: compatScores.learned,
      body_flattery_score: compatScores.body,
      color_harmony_score: compatScores.color,
      total_price: slotItems.reduce((s, itm) => s + (itm?.price || 0), 0),
      items: slotItems
    };
    saveLocalFavourite(outfitToSave);
    setSavedSuccess(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  }

  const activeSlotCategory = activeSlotIndex !== null ? slotItems[activeSlotIndex]?.category : null;
  const slotCandidates = activeSlotCategory
    ? ITEMS_CATALOG.filter(i => i.category === activeSlotCategory)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      
      {/* Top Title Banner */}
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
            <Scissors size={13} color="var(--gold)" /> Interactive Garment Canvas
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }} className="font-serif">
            Virtual Wardrobe Mixer & Stylist Studio
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Click any garment slot below to swap with alternative pieces and watch neural scores recompute in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSaveCanvasOutfit}
            className="btn-gold"
            style={{ padding: '10px 20px' }}
          >
            <Heart size={16} /> {savedSuccess ? 'Saved to Lookbook!' : 'Save Custom Ensemble'}
          </button>
        </div>
      </div>

      {/* Main Mixer Layout: Left Slots & Right Mannequin & Diagnostics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px' }}>
        
        {/* Left: Garment Slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {slotItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveSlotIndex(idx)}
                className="glass-card-interactive"
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: activeSlotIndex === idx ? '2px solid var(--gold)' : '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: activeSlotIndex === idx ? 'var(--shadow-gold)' : 'none'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
                      Slot #{idx + 1} • {item.category}
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                      Swap <RefreshCw size={10} />
                    </span>
                  </div>

                  <div style={{ position: 'relative', height: '170px', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '6px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.fabric || item.brand}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="color-swatch-circle" style={{ backgroundColor: item.color_hex }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{item.color_label}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-light)' }}>{item.fit_type || 'Tailored Fit'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Slot Swapper Drawer Modal */}
          {activeSlotIndex !== null && (
            <div className="glass-panel animate-fade-in" style={{
              padding: '24px',
              border: '2px solid var(--gold)',
              background: 'rgba(20, 26, 40, 0.98)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                    Select Replacement for Slot #{activeSlotIndex + 1} ({activeSlotCategory})
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Choose an alternative piece to instantly test compatibility with remaining 4 garments.
                  </span>
                </div>
                <button
                  onClick={() => setActiveSlotIndex(null)}
                  style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {slotCandidates.map(cand => {
                  const isCurrent = cand.item_id === slotItems[activeSlotIndex]?.item_id;
                  return (
                    <div
                      key={cand.item_id}
                      onClick={() => handleReplaceItem(cand)}
                      className="glass-card-interactive"
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        background: isCurrent ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: isCurrent ? '2px solid var(--gold)' : '1px solid var(--border-glass)',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={cand.image_url}
                        alt={cand.title}
                        style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', marginBottom: '6px' }}
                      />
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cand.title}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>${cand.price}</span>
                        {isCurrent && <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Active</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right: Live Compatibility Gauge & Mannequin Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Live Compatibility Panel */}
          <div className="glass-panel" style={{
            padding: '24px',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            background: 'linear-gradient(180deg, rgba(26, 32, 48, 0.95) 0%, rgba(15, 20, 30, 0.98) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Neural Synthesis
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }} className="font-serif">
                  Ensemble Synergy
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--gold-light)' }}>
                  {compatScores.overall}%
                </div>
              </div>
            </div>

            {/* Stylist Feedback */}
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              marginBottom: '18px'
            }}>
              {stylistFeedback}
            </div>

            {/* Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Body Flattery Index ({currentBody.name})</span>
                  <span style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{compatScores.body}%</span>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${compatScores.body}%`, background: 'var(--gold)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Siamese Neural MLP Metric</span>
                  <span style={{ fontWeight: 700 }}>{compatScores.learned}%</span>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${compatScores.learned}%`, background: 'var(--primary)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Color Harmony Palette</span>
                  <span style={{ fontWeight: 700 }}>{compatScores.color}%</span>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${compatScores.color}%`, background: 'var(--cyan)' }} />
                </div>
              </div>
            </div>

            {/* Outfit Coordination Summary */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ensemble Silhouette Match:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-light)' }}>
                {compatScores.overall}% Coordinated
              </span>
            </div>
          </div>

          {/* Virtual Lookbook Head-to-Toe Stacking */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crown size={16} color="var(--gold)" /> Lookbook Flat-Lay Preview
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {slotItems.map((itm, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)'
                }}>
                  <img
                    src={itm.image_url}
                    alt={itm.title}
                    style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {itm.title}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {itm.category} • {itm.color_label}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                    ${itm.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
