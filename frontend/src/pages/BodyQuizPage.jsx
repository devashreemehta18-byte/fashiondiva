import React, { useState } from 'react';
import { BODY_TYPES, DRESSING_OCCASIONS } from '../data/catalog';
import { Sparkles, Check, ArrowRight, ArrowLeft, Crown, Heart, UserCheck, Palette, Layers, Scissors, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

const STYLING_GOALS = [
  { id: 'waist', title: 'Accentuate Waistline', desc: 'Highlight natural curves with defined waistbands & wrap cuts' },
  { id: 'legs', title: 'Elongate Leg Silhouette', desc: 'Create a taller vertical line with high-rise waists & clean hems' },
  { id: 'shoulders', title: 'Balance Shoulders & Hips', desc: 'Proportion broad or narrow shoulders for harmonious symmetry' },
  { id: 'decolletage', title: 'Highlight Neckline', desc: 'Draw focus upward with sweetheart, V-neck, or halter collars' },
  { id: 'comfort', title: 'Effortless Fluid Drape', desc: 'Relaxed flowing fabrics that move gracefully without constriction' },
  { id: 'sculpt', title: 'Architectural Power Sculpting', desc: 'Structured shoulders, tailored lapels, and sharp silhouettes' }
];

const COLOR_PALETTES = [
  { id: 'monochrome', name: 'Monochromatic Onyx & Gold', hexes: ['#0A0A0A', '#FFFFFF', '#D4AF37', '#71717A'], desc: 'High-contrast luxury & timeless minimalist sophistication' },
  { id: 'warm_autumn', name: 'Warm Autumn Earth & Camel', hexes: ['#B45309', '#78350F', '#D97706', '#FDE68A'], desc: 'Rich terracotta, cognac leather, and warm golden tones' },
  { id: 'cool_winter', name: 'Cool Winter Emerald & Navy', hexes: ['#065F46', '#1E3A8A', '#18181B', '#F8FAFC'], desc: 'Deep jewel tones, crisp icy whites, and royal sapphire' },
  { id: 'soft_summer', name: 'Soft Summer Rose & Champagne', hexes: ['#FB7185', '#E0A96D', '#E2E8F0', '#94A3B8'], desc: 'Romantic pastels, cashmere cream, and blushing silk' }
];

export default function BodyQuizPage({
  userProfile,
  setUserProfile,
  onCompleteQuiz,
  onSkip
}) {
  const [step, setStep] = useState(1);

  const selectedBody = BODY_TYPES.find(b => b.id === userProfile.bodyType) || BODY_TYPES[0];
  const selectedOccasion = DRESSING_OCCASIONS.find(o => o.id === userProfile.occasion) || DRESSING_OCCASIONS[0];

  function handleBodySelect(bodyId) {
    setUserProfile(prev => ({ ...prev, bodyType: bodyId }));
  }

  function handleOccasionSelect(occId) {
    setUserProfile(prev => ({ ...prev, occasion: occId }));
  }

  function handleGoalToggle(goalTitle) {
    setUserProfile(prev => {
      const current = prev.stylingGoals || [];
      if (current.includes(goalTitle)) {
        return { ...prev, stylingGoals: current.filter(g => g !== goalTitle) };
      } else {
        return { ...prev, stylingGoals: [...current, goalTitle] };
      }
    });
  }

  function handlePaletteSelect(palId) {
    setUserProfile(prev => ({ ...prev, colorPalette: palId }));
  }

  function handleFinish() {
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 }
    });
    onCompleteQuiz();
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }} className="animate-fade-in">
      
      {/* Welcome & Progress Bar */}
      <div className="glass-panel" style={{
        padding: '32px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(26, 32, 50, 0.95) 0%, rgba(18, 24, 38, 0.98) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        textAlign: 'center'
      }}>
        <span className="badge badge-gold" style={{ marginBottom: '12px' }}>
          <Sparkles size={13} color="var(--gold)" /> Welcome to FashionDiva
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '10px' }} className="gradient-text-gold font-serif">
          Let's Find Your Signature Silhouette
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          Tell us about your body shape and how you want to dress up today. Our deep learning stylist will tailor every garment cut, color harmony, and outfit combination specifically for you.
        </p>

        {/* 4-Step Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', maxWidth: '500px', margin: '0 auto' }}>
          {[
            { num: 1, label: 'Body Shape' },
            { num: 2, label: 'Styling Goals' },
            { num: 3, label: 'Occasion' },
            { num: 4, label: 'Colors' }
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                opacity: step >= s.num ? 1 : 0.45
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step === s.num ? 'var(--gold)' : step > s.num ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                color: step === s.num ? '#000' : '#FFF',
                fontWeight: 800,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: step === s.num ? 'var(--gold-light)' : 'var(--text-muted)' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: BODY SHAPE SELECTION */}
      {step === 1 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 800, letterSpacing: '0.05em' }}>QUESTION 1 OF 4</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }} className="font-serif">
                What is your body silhouette?
              </h2>
            </div>
            <span className="badge badge-gold">
              Selected: {selectedBody.name}
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '22px' }}>
            Choose the description that best reflects your natural frame geometry:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {BODY_TYPES.map(body => {
              const isSelected = userProfile.bodyType === body.id;
              return (
                <div
                  key={body.id}
                  onClick={() => handleBodySelect(body.id)}
                  className="glass-card-interactive"
                  style={{
                    padding: '20px 16px',
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'rgba(212, 175, 55, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '2px solid var(--gold)' : '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '160px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: isSelected ? 'var(--gold-light)' : '#FFF' }}>
                        {body.name}
                      </span>
                      {isSelected && (
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={14} color="#000" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                      {body.shortDesc}
                    </p>
                  </div>

                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700 }}>
                      Best Cuts: {body.bestFits.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={onSkip} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              Skip to Studio
            </button>
            <button onClick={() => setStep(2)} className="btn-gold" style={{ padding: '12px 28px' }}>
              Next: Styling Goals <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: STYLING PRIORITIES */}
      {step === 2 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: 800, letterSpacing: '0.05em' }}>QUESTION 2 OF 4</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }} className="font-serif">
                What features would you love to accentuate?
              </h2>
            </div>
            <span className="badge badge-emerald">
              Multi-Select
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '22px' }}>
            Select all priorities that match how you want your clothes to fit and flatter:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {STYLING_GOALS.map(goal => {
              const isSelected = (userProfile.stylingGoals || []).includes(goal.title);
              return (
                <div
                  key={goal.id}
                  onClick={() => handleGoalToggle(goal.title)}
                  className="glass-card-interactive"
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '2px solid var(--emerald)' : '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.98rem', color: isSelected ? '#6EE7B7' : '#FFF' }}>
                      {goal.title}
                    </span>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: isSelected ? 'none' : '1.5px solid var(--border-glass)',
                      background: isSelected ? 'var(--emerald)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isSelected && <Check size={13} color="#000" strokeWidth={3} />}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                    {goal.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setStep(1)} className="btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setStep(3)} className="btn-gold" style={{ padding: '12px 28px' }}>
              Next: Dressing Occasion <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: OCCASION & DRESSING VIBE */}
      {step === 3 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 800, letterSpacing: '0.05em' }}>QUESTION 3 OF 4</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }} className="font-serif">
                How do you want to dress up today?
              </h2>
            </div>
            <span className="badge badge-purple">
              {selectedOccasion.name}
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '22px' }}>
            Select your event or desired aesthetic mood:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {DRESSING_OCCASIONS.map(occ => {
              const isSelected = userProfile.occasion === occ.id;
              return (
                <div
                  key={occ.id}
                  onClick={() => handleOccasionSelect(occ.id)}
                  className="glass-card-interactive"
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(236, 72, 153, 0.25))' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '130px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: isSelected ? '#FFF' : 'var(--text-main)' }}>
                      {occ.name}
                    </span>
                    {isSelected && <Check size={16} color="var(--primary-light)" strokeWidth={3} />}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                    {occ.vibe}
                  </p>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setStep(2)} className="btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setStep(4)} className="btn-gold" style={{ padding: '12px 28px' }}>
              Next: Color Palette <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: COLOR PALETTE & SUMMARY */}
      {step === 4 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 800, letterSpacing: '0.05em' }}>QUESTION 4 OF 4</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }} className="font-serif">
                Select Your Seasonal Color Tone
              </h2>
            </div>
            <span className="badge badge-cyan">
              Palette Match
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {COLOR_PALETTES.map(pal => {
              const isSelected = userProfile.colorPalette === pal.id;
              return (
                <div
                  key={pal.id}
                  onClick={() => handlePaletteSelect(pal.id)}
                  className="glass-card-interactive"
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '2px solid var(--cyan)' : '1px solid var(--border-glass)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isSelected ? '#67E8F9' : '#FFF' }}>
                      {pal.name}
                    </span>
                    {isSelected && <Check size={16} color="var(--cyan)" strokeWidth={3} />}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    {pal.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {pal.hexes.map((hex, idx) => (
                      <span key={idx} className="color-swatch-circle" style={{ width: '20px', height: '20px', backgroundColor: hex }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Stylist Blueprint Prescription */}
          <div style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(139, 92, 246, 0.12))',
            border: '1.5px solid var(--gold)',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Crown size={22} color="var(--gold)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }} className="font-serif">
                Your FashionDiva Blueprint: {selectedBody.name} Frame
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
              {selectedBody.stylingTip}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)', fontWeight: 700 }}>Your Signature Cuts:</span>
              {selectedBody.bestFits.map((fit, idx) => (
                <span key={idx} className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                  {fit}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setStep(3)} className="btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={handleFinish} className="btn-gold" style={{ padding: '14px 36px', fontSize: '1rem' }}>
              ✨ Enter Your Styling Suite & Reveal Outfits <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
