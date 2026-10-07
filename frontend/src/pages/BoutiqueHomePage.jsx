import React from 'react';
import BoutiqueHero from '../components/BoutiqueHero';
import { ITEMS_CATALOG, BODY_TYPES } from '../data/catalog';
import { ArrowRight, Sparkles, Heart, Eye, Check, Crown, ShieldCheck } from 'lucide-react';

export default function BoutiqueHomePage({
  userProfile,
  onStartBodyQuiz,
  onOpenStudioWithItem,
  onOpenCanvasWithOutfit
}) {
  const currentBody = BODY_TYPES.find(b => b.id === userProfile.bodyType) || BODY_TYPES[0];

  // Featured Categories
  const FEATURED_ITEMS = ITEMS_CATALOG.slice(0, 6);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* 1. Exact Hero Section from User Image */}
      <BoutiqueHero
        onShopEdit={() => {
          const el = document.getElementById('collection-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onStartBodyQuiz={onStartBodyQuiz}
      />

      {/* 2. Active Body Fit Personalization Strip */}
      <div style={{
        backgroundColor: '#1E1B18',
        color: '#FFFFFF',
        padding: '16px 36px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--boutique-gold)', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.1em' }}>
              ✦ PERSONALIZED FIT ACTIVE:
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
              Tailored for <strong>{currentBody.name}</strong> Silhouette
            </span>
            <span style={{ fontSize: '0.78rem', color: '#A8A29E' }}>
              ({currentBody.bestFits.slice(0, 3).join(', ')})
            </span>
          </div>

          <button
            onClick={onStartBodyQuiz}
            style={{
              background: 'transparent',
              border: '1px solid var(--boutique-gold)',
              color: 'var(--boutique-gold-light)',
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: 'pointer'
            }}
          >
            Change Silhouette ▾
          </button>
        </div>
      </div>

      {/* 3. "The Edit" / Curated Collection Section */}
      <section id="collection-section" style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '64px 36px'
      }}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '36px'
        }}>
          <div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--boutique-terracotta)',
              display: 'block',
              marginBottom: '6px'
            }}>
              HANDPICKED FOR YOUR SILHOUETTE
            </span>
            <h2 style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              color: '#1A1715',
              margin: 0
            }}>
              CURATED COLLECTION
            </h2>
          </div>

          <button
            onClick={onStartBodyQuiz}
            className="btn-boutique-outline"
            style={{ padding: '10px 22px', fontSize: '0.78rem' }}
          >
            <span>DISCOVER YOUR FIT</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 3-Column Luxury Garments Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '28px'
        }}>
          {FEATURED_ITEMS.map((item, idx) => {
            const isFlattering = item.flattering_body_types?.includes(userProfile.bodyType);
            return (
              <div
                key={item.item_id || idx}
                className="boutique-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div>
                  <div style={{ position: 'relative', height: '360px', overflow: 'hidden', backgroundColor: '#EDE7DC' }}>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                    />
                    
                    {/* Flattering Tag */}
                    {isFlattering && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: '#1A1715',
                        color: '#D4AF37',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: '4px'
                      }}>
                        ★ FLATTENS {currentBody.name.toUpperCase()}
                      </span>
                    )}

                    <span style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      backgroundColor: '#FFFFFF',
                      color: '#1A1715',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      padding: '4px 12px',
                      borderRadius: '4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      ${item.price}
                    </span>
                  </div>

                  <div style={{ padding: '20px 20px 10px 20px' }}>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--boutique-terracotta)',
                      marginBottom: '4px'
                    }}>
                      {item.category} • {item.brand}
                    </div>

                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#1A1715',
                      margin: '0 0 6px 0',
                      lineHeight: 1.35
                    }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: '0.8rem', color: '#6B655F', margin: 0, lineHeight: 1.45 }}>
                      {item.fabric}
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '14px 20px 20px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                  marginTop: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="color-swatch-circle" style={{ backgroundColor: item.color_hex }} />
                    <span style={{ fontSize: '0.78rem', color: '#6B655F', textTransform: 'capitalize' }}>
                      {item.color_label}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenStudioWithItem(item.item_id)}
                    className="btn-boutique-black"
                    style={{ padding: '10px 18px', fontSize: '0.74rem' }}
                  >
                    <span>STYLE THIS PIECE</span>
                    <Sparkles size={12} color="var(--boutique-gold)" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* 4. Luxury Editorial Lookbook Spotlight */}
      <section style={{
        backgroundColor: '#EDE7DC',
        padding: '72px 36px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'center'
        }}>
          <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <img
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80"
              alt="Silk Satin Evening Gown"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--boutique-terracotta)',
              display: 'block',
              marginBottom: '8px'
            }}>
              HAUTE COUTURE EDITORIAL
            </span>
            <h2 style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              color: '#1A1715',
              lineHeight: 1.1,
              marginBottom: '18px'
            }}>
              THE SILK & SATIN MOMENT.
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#4A453F', lineHeight: 1.7, marginBottom: '28px' }}>
              Crafted with heavy pure mulberry silk and sculpted architectural tailoring. Designed to cascade effortlessly along your silhouette for red-carpet evenings and cocktail galas.
            </p>

            <button
              onClick={() => onOpenStudioWithItem('item_10006')}
              className="btn-boutique-black"
              style={{ padding: '16px 36px' }}
            >
              <span>EXPLORE OUTFIT COMBINATIONS</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
