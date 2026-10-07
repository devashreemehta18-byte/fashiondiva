import React, { useState } from 'react';
import { BODY_TYPES, DRESSING_OCCASIONS } from '../data/catalog';
import { BookOpen, Sparkles, Crown, Check, X, Palette, Scissors, ShieldCheck, Heart } from 'lucide-react';

export default function StyleGuidePage({ userProfile, onSelectBodyType }) {
  const [selectedBodyTab, setSelectedBodyTab] = useState(userProfile.bodyType || 'hourglass');

  const currentBody = BODY_TYPES.find(b => b.id === selectedBodyTab) || BODY_TYPES[0];

  const DO_DONT_MAP = {
    hourglass: {
      dos: ['Fitted waistlines & wrap dresses', 'High-waist straight or wide trousers', 'V-neck, sweetheart, and scoop collars', 'Belted tailored coats and blazers'],
      donts: ['Boxy shapeless oversized cuts that hide waist', 'Stiff bulky box jackets without waist tapering', 'Excessive ruffled necklines that add unnecessary bulk']
    },
    pear: {
      dos: ['Statement collar & structured shoulder tops', 'A-line and flowing midi skirts', 'Wide-leg and dark-wash straight trousers', 'Boatneck and sweetheart necklines to broaden shoulders'],
      donts: ['Low-rise tight jeans', 'Heavy pocket details around hips/thighs', 'Tapered skinny pants paired with tight plain tops']
    },
    inverted_triangle: {
      dos: ['V-neck and halter tops to soften upper line', 'Flared, wide-leg and pleated trousers', 'A-line and skater skirts to balance hips', 'Unstructured fluid cardigan layers'],
      donts: ['Heavy shoulder pads or epaulets', 'Boatneck and wide horizontal necklines', 'Skinny jeans with oversized puffy tops']
    },
    rectangle: {
      dos: ['Belted coats and cinched blazers', 'Fit-and-flare dresses with flared hemlines', 'Layered textures, pleats, and ruffles', 'Cropped tops paired with high-rise pants'],
      donts: ['Straight unbelted shift dresses', 'Square boxy cuts from shoulder to hem without waist definition']
    },
    apple: {
      dos: ['Empire waist and fluid wrap dresses', 'Flowing silk blouses with deep V-necks', 'Straight-leg pants that highlight slender legs', 'Open-front structured longline blazers'],
      donts: ['Tight waist belts that cinch midsection', 'Heavy horizontal stripes around the torso', 'High stiff turtlenecks without vertical drape']
    },
    petite: {
      dos: ['Monochromatic column dressing to add height', 'High-rise pants and cropped blazers', 'Pointed-toe shoes and heels', 'Mini and tailored midi hemlines'],
      donts: ['Oversized floor-dragging heavy coats', 'Wide horizontal color blocks that break the vertical line']
    },
    tall: {
      dos: ['Sweeping maxi coats and floor-length gowns', 'Wide-leg palazzo pants and dramatic flares', 'Bold oversized blazers and bold statement jewelry', 'Layered dimensional silhouettes'],
      donts: ['Awkward mid-calf cutoffs that look unintentionally short']
    },
    curvy: {
      dos: ['Stretch wool crepe wrap dresses', 'Structured hourglass blazers', 'High-rise sculpting trousers', 'Monochromatic foundation layers with contrast outerwear'],
      donts: ['Stiff non-stretch boxy fabrics', 'Shapeless sack silhouettes']
    }
  };

  const currentRules = DO_DONT_MAP[selectedBodyTab] || DO_DONT_MAP.hourglass;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        background: 'linear-gradient(135deg, rgba(26, 32, 50, 0.95) 0%, rgba(18, 24, 38, 0.98) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.35)'
      }}>
        <span className="badge badge-gold" style={{ marginBottom: '8px' }}>
          <BookOpen size={13} color="var(--gold)" /> FashionDiva Style Masterclass
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0 10px 0' }} className="gradient-text-gold font-serif">
          Body Silhouette & Color Harmony Master Guide
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: '750px', lineHeight: 1.6 }}>
          Learn the principles of silhouette flattery, proportional balance, and color theory used by luxury celebrity stylists and our deep learning model.
        </p>
      </div>

      {/* Body Shape Guide Interactive Selector */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }} className="font-serif">
          Silhouette Flattery Blueprint: Select a Body Shape
        </h2>

        {/* Tab Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
          {BODY_TYPES.map(body => {
            const isActive = selectedBodyTab === body.id;
            return (
              <button
                key={body.id}
                onClick={() => setSelectedBodyTab(body.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  border: isActive ? '2px solid var(--gold)' : '1px solid var(--border-glass)',
                  background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? 'var(--gold-light)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition)'
                }}
              >
                {body.name}
              </button>
            );
          })}
        </div>

        {/* Detailed Blueprint for Selected Body */}
        <div style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(212, 175, 55, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--gold-light)' }} className="font-serif">
                {currentBody.name} Frame Guide
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                {currentBody.shortDesc}
              </p>
            </div>

            <button
              onClick={() => onSelectBodyType(currentBody.id)}
              className="btn-gold"
              style={{ padding: '8px 18px', fontSize: '0.82rem' }}
            >
              Set as My Active Profile
            </button>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '20px' }}>
            <strong>Stylist Rule: </strong>{currentBody.stylingTip}
          </p>

          {/* Dos and Don'ts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* DOs */}
            <div style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#6EE7B7', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={18} /> What to Wear (Flattering Cuts)
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentRules.dos.map((d, i) => (
                  <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-main)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span> {d}
                  </li>
                ))}
              </ul>
            </div>

            {/* DONTs */}
            <div style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#F87171', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <X size={18} /> Cuts to Avoid
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentRules.donts.map((d, i) => (
                  <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-main)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#EF4444', fontWeight: 800 }}>✕</span> {d}
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </div>

      {/* Color Theory Rules */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }} className="font-serif">
          Color Theory & Harmony Matrix
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--gold-light)', marginBottom: '8px' }}>1. The Universal Neutrals</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Ivory, Camel, Black, and Navy serve as the structural anchor of any high-fashion outfit. They match with 95%+ compatibility with any saturated accent.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--primary-light)', marginBottom: '8px' }}>2. Complementary Contrast</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Pairing jewel tones like Emerald Green with Champagne Gold or Deep Crimson with Obsidian Black creates striking runway elegance.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--cyan)', marginBottom: '8px' }}>3. Monochromatic Tonal Layering</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Varying textures (cashmere knit + silk skirt + calfskin boots) within the same color family (e.g. all-ivory or all-black) elongates the silhouette.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
