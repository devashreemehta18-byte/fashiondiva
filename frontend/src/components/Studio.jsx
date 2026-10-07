import React, { useState, useEffect } from 'react';
import { ITEMS_CATALOG, CATEGORY_LIST, BODY_TYPES, DRESSING_OCCASIONS } from '../data/catalog';
import { fetchOutfitRecommendations, analyzeUploadedImage, saveLocalFavourite } from '../services/api';
import { Sparkles, Upload, Heart, ArrowRight, ShieldCheck, Palette, Tag, UserCheck, Crown, RefreshCw, Eye, Check, Scissors, Sliders, ChevronDown, ChevronUp, Image as ImageIcon, Sparkle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Studio({
  onSelectOutfitForCanvas,
  userProfile,
  setUserProfile,
  initialAnchorId = null
}) {
  const [selectedAnchorId, setSelectedAnchorId] = useState(initialAnchorId || 'item_10006'); // Emerald Evening Gown
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (initialAnchorId) {
      setSelectedAnchorId(initialAnchorId);
    }
  }, [initialAnchorId]);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [showBodySelector, setShowBodySelector] = useState(false);
  const [swapModalOutfit, setSwapModalOutfit] = useState(null);
  const [swapSlotIndex, setSwapSlotIndex] = useState(null);

  const currentAnchor = ITEMS_CATALOG.find(i => i.item_id === selectedAnchorId) || ITEMS_CATALOG[0];
  const currentBody = BODY_TYPES.find(b => b.id === userProfile.bodyType) || BODY_TYPES[0];
  const currentOccasion = DRESSING_OCCASIONS.find(o => o.id === userProfile.occasion) || DRESSING_OCCASIONS[0];

  useEffect(() => {
    loadRecommendations(selectedAnchorId);
  }, [selectedAnchorId, userProfile.bodyType, userProfile.occasion]);

  async function loadRecommendations(itemId) {
    setLoading(true);
    const item = ITEMS_CATALOG.find(i => i.item_id === itemId) || currentAnchor;
    
    // Set initial analysis preview
    setAnalysisData({
      category: item.category,
      categoryConfidence: 98,
      dominantColor: item.color_label,
      hex: item.color_hex,
      style: item.style,
      styleConfidence: 95,
      fabric: item.fabric || 'Luxury Silk Crepe',
      recommendedColors: ['Champagne Gold', 'Ivory Cream', 'Onyx Black', 'Midnight Navy']
    });

    const res = await fetchOutfitRecommendations(
      itemId,
      item.category,
      userProfile.bodyType,
      userProfile.occasion
    );
    setRecommendations(res.outfits || []);
    setLoading(false);
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingImage(true);
    try {
      const analysis = await analyzeUploadedImage(file);
      setAnalysisData({
        imagePreviewUrl: analysis.imagePreviewUrl,
        category: analysis.category || 'top',
        categoryConfidence: analysis.category_confidence || 96,
        dominantColor: analysis.color?.dominant_color || 'navy',
        hex: analysis.color?.hex || '#1E3A8A',
        style: analysis.style?.primary_style || 'party',
        styleConfidence: analysis.style?.confidence || 92,
        fabric: analysis.fabric || 'Fine Silk Weave',
        recommendedColors: analysis.recommended_colors || ['Champagne', 'Onyx', 'Ivory']
      });

      // Match nearest item in catalog to build outfits from
      const matched = ITEMS_CATALOG.find(i => i.category === analysis.category) || ITEMS_CATALOG[0];
      setSelectedAnchorId(matched.item_id);
    } catch (err) {
      console.error('Image analysis error:', err);
    } finally {
      setAnalyzingImage(false);
    }
  }

  function handleSaveOutfit(outfit) {
    saveLocalFavourite(outfit);
    setSavedIds(prev => [...prev, outfit.outfit_id]);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 }
    });
  }

  function handleQuickSwap(outfitIndex, slotIndex, newItem) {
    const updatedRecs = [...recommendations];
    const outfit = updatedRecs[outfitIndex];
    if (outfit && outfit.items[slotIndex]) {
      outfit.items[slotIndex] = newItem;
      outfit.total_price = outfit.items.reduce((s, itm) => s + (itm?.price || 0), 0);
      setRecommendations(updatedRecs);
    }
    setSwapModalOutfit(null);
    setSwapSlotIndex(null);
  }

  const filteredCatalog = selectedCategoryFilter === 'all'
    ? ITEMS_CATALOG
    : ITEMS_CATALOG.filter(i => i.category === selectedCategoryFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      
      {/* 🌟 STEP 1: Quick & Friendly Body Silhouette & Occasion Bar */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        border: '1.5px solid rgba(212, 175, 55, 0.4)',
        background: 'linear-gradient(135deg, rgba(26, 32, 50, 0.95) 0%, rgba(18, 24, 38, 0.98) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="wizard-step-badge">1</div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }} className="font-serif">
                Your Body Silhouette & Dressing Occasion
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Click below to select your body shape and where you are going:
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBodySelector(prev => !prev)}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            {showBodySelector ? 'Collapse Options ▲' : 'Change Shape / Vibe ▼'}
          </button>
        </div>

        {/* Selected Body Type & Occasion Summary Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(212, 175, 55, 0.07)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>Active Body Frame:</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFF' }}>
              ⏳ {currentBody.name} Frame
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {currentBody.stylingTip}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary-light)', fontWeight: 700, textTransform: 'uppercase' }}>Dressing Occasion:</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gold-light)' }}>
              👑 {currentOccasion.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {currentOccasion.vibe}
            </div>
          </div>
        </div>

        {/* Expandable Body & Occasion Picker */}
        {showBodySelector && (
          <div className="animate-fade-in" style={{ marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '18px' }}>
            
            {/* Body Shapes */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold-light)', display: 'block', marginBottom: '10px' }}>
                Select Your Body Shape:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                {BODY_TYPES.map(b => {
                  const isSelected = userProfile.bodyType === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setUserProfile(prev => ({ ...prev, bodyType: b.id }))}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--gold)' : '1px solid var(--border-glass)',
                        background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: isSelected ? 'var(--gold-light)' : 'var(--text-main)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{b.name}</span>
                        {isSelected && <Check size={14} color="var(--gold)" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Occasions */}
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-light)', display: 'block', marginBottom: '10px' }}>
                Where are you heading?
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {DRESSING_OCCASIONS.map(occ => {
                  const isSelected = userProfile.occasion === occ.id;
                  return (
                    <button
                      key={occ.id}
                      onClick={() => setUserProfile(prev => ({ ...prev, occasion: occ.id }))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                        background: isSelected ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))' : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? '#FFF' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      {occ.name}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 🌟 STEP 2 & 3: Main Workspace (Left: Pick/Upload Item -> Right: 5 Complete Styled Outfits) */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '28px' }}>
        
        {/* Left Column: Upload or Select Anchor Garment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* STEP 2 Banner */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div className="wizard-step-badge">2</div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  Upload or Pick Garment
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  We'll build complete looks around this piece
                </span>
              </div>
            </div>

            {/* Easy Drag & Drop Upload Zone */}
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 16px',
                borderRadius: 'var(--radius-md)',
                border: '2px dashed rgba(212, 175, 55, 0.45)',
                background: 'rgba(212, 175, 55, 0.05)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.45)';
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)';
              }}
            >
              {analyzingImage && <div className="scanner-laser" />}
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <Upload size={22} color="var(--gold-light)" />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>
                {analyzingImage ? 'Scanning with Deep Learning...' : 'Upload Clothing Photo'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                PNG, JPG, WEBP • Click or Drag here
              </span>
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            {/* Analysis Feedback Pill */}
            {analysisData && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.78rem',
                marginBottom: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Detected Item:</span>
                  <span style={{ fontWeight: 800, color: '#FFF', textTransform: 'capitalize' }}>
                    {analysisData.category} ({analysisData.categoryConfidence}%)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dominant Tone:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="color-swatch-circle" style={{ backgroundColor: analysisData.hex }} />
                    <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{analysisData.dominantColor}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Catalog Garment Tabs */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Or select from designer collection:
              </div>
              
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    border: 'none',
                    background: selectedCategoryFilter === 'all' ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                    color: selectedCategoryFilter === 'all' ? '#000' : '#FFF',
                    cursor: 'pointer'
                  }}
                >
                  All
                </button>
                {CATEGORY_LIST.slice(0, 6).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      border: 'none',
                      background: selectedCategoryFilter === cat.id ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                      color: selectedCategoryFilter === cat.id ? '#000' : 'var(--text-muted)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat.label.split('&')[0]}
                  </button>
                ))}
              </div>

              {/* Garment Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                maxHeight: '340px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {filteredCatalog.map(item => {
                  const isSelected = item.item_id === selectedAnchorId;
                  return (
                    <div
                      key={item.item_id}
                      onClick={() => setSelectedAnchorId(item.item_id)}
                      className="glass-card-interactive"
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '2px solid var(--gold)' : '1px solid var(--border-glass)',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        style={{ width: '100%', height: '95px', objectFit: 'cover', borderRadius: '8px', marginBottom: '6px' }}
                      />
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gold-light)', fontWeight: 700 }}>${item.price}</span>
                        <span className="color-swatch-circle" style={{ width: '10px', height: '10px', backgroundColor: item.color_hex }} />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: 🌟 STEP 3: Complete Styled Outfits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="wizard-step-badge">3</div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }} className="font-serif">
                  Your 5 Curated Outfits
                </h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Tailored for your {currentBody.name} silhouette & {currentOccasion.name}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Anchor: <strong style={{ color: 'var(--gold-light)' }}>{currentAnchor.title}</strong>
            </div>
          </div>

          {loading ? (
            <div className="glass-panel" style={{ padding: '70px', textAlign: 'center' }}>
              <Sparkles size={46} className="pulse-glow" color="var(--gold)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Styling Your Outfits...</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
                Analyzing color harmonies and matching pieces for your {currentBody.name} frame...
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {recommendations.map((outfit, index) => {
                const isSaved = savedIds.includes(outfit.outfit_id);
                return (
                  <div
                    key={outfit.outfit_id || index}
                    className="glass-panel glass-panel-hover"
                    style={{
                      padding: '24px',
                      border: index === 0 ? '1.5px solid var(--gold)' : '1px solid var(--border-glass)'
                    }}
                  >
                    
                    {/* Outfit Card Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '16px',
                      paddingBottom: '14px',
                      borderBottom: '1px solid var(--border-glass)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
                          Look #{index + 1} {index === 0 && '★ Top Match'}
                        </span>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }} className="font-serif">
                          {outfit.look_name || `${outfit.items[0]?.style?.toUpperCase()} ENSEMBLE`}
                        </h3>
                      </div>

                      {/* Match Score & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold-light)' }}>
                            {outfit.overall_compatibility}%
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Match Score</div>
                        </div>

                        <button
                          onClick={() => handleSaveOutfit(outfit)}
                          className={`btn-secondary ${isSaved ? 'badge-pink' : ''}`}
                          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                        >
                          <Heart size={15} fill={isSaved ? 'var(--secondary)' : 'none'} color={isSaved ? 'var(--secondary)' : 'currentColor'} />
                          {isSaved ? 'Saved' : 'Save'}
                        </button>

                        <button
                          onClick={() => onSelectOutfitForCanvas(outfit)}
                          className="btn-gold"
                          style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                        >
                          Dressing Room <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Friendly Stylist Tip Box */}
                    {outfit.stylist_note && (
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(212, 175, 55, 0.08)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        marginBottom: '18px',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                      }}>
                        <Sparkles size={16} color="var(--gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <div>
                          <strong style={{ color: 'var(--gold-light)' }}>Stylist Tip: </strong>
                          <span>{outfit.stylist_note}</span>
                        </div>
                      </div>
                    )}

                    {/* 5 Garment Photos Display */}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${outfit.items.length}, 1fr)`, gap: '14px' }}>
                      {outfit.items.map((item, slotIdx) => (
                        <div
                          key={slotIdx}
                          style={{
                            padding: '12px',
                            background: 'rgba(0, 0, 0, 0.45)',
                            borderRadius: 'var(--radius-md)',
                            border: item.item_id === selectedAnchorId ? '2px solid var(--gold)' : '1px solid var(--border-glass)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 800, marginBottom: '6px' }}>
                              {item.category}
                            </div>
                            
                            <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                              <img
                                src={item.image_url}
                                alt={item.title}
                                loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>

                            <div style={{ fontSize: '0.82rem', fontWeight: 700, height: '36px', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
                              {item.title}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{item.color_label}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-light)' }}>{item.fit_type || 'Tailored'}</span>
                          </div>

                          {/* Quick Swap Trigger */}
                          <button
                            onClick={() => {
                              setSwapModalOutfit(index);
                              setSwapSlotIndex(slotIdx);
                            }}
                            className="btn-secondary"
                            style={{
                              marginTop: '8px',
                              padding: '5px 8px',
                              fontSize: '0.72rem',
                              width: '100%',
                              justifyContent: 'center'
                            }}
                          >
                            <RefreshCw size={11} /> Swap Slot Item
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Ensemble Silhouette Breakdown Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Silhouette Flattery for {currentBody.name}: <strong style={{ color: '#6EE7B7' }}>{outfit.body_flattery_score || 96}% Flawless</strong></span>
                      <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>
                        5 Pieces Coordinated • Color Harmony {outfit.color_harmony_score || 95}%
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* In-Place Quick Garment Swapper Modal */}
      {swapModalOutfit !== null && swapSlotIndex !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            maxWidth: '680px',
            width: '100%',
            padding: '28px',
            border: '2px solid var(--gold)',
            background: 'rgba(20, 26, 42, 0.98)',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }} className="font-serif">
                  Swap {recommendations[swapModalOutfit]?.items[swapSlotIndex]?.category?.toUpperCase()}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Pick an alternative piece to instantly update Look #{swapModalOutfit + 1}
                </span>
              </div>
              <button
                onClick={() => {
                  setSwapModalOutfit(null);
                  setSwapSlotIndex(null);
                }}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Cancel ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
              {ITEMS_CATALOG
                .filter(i => i.category === recommendations[swapModalOutfit]?.items[swapSlotIndex]?.category)
                .map(cand => (
                  <div
                    key={cand.item_id}
                    onClick={() => handleQuickSwap(swapModalOutfit, swapSlotIndex, cand)}
                    className="glass-card-interactive"
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-glass)'
                    }}
                  >
                    <img
                      src={cand.image_url}
                      alt={cand.title}
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '6px' }}
                    />
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cand.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gold-light)', fontWeight: 800 }}>${cand.price}</span>
                      <button className="btn-gold" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                        Select
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
