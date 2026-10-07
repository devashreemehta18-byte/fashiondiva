import React, { useState } from 'react';
import { BODY_TYPES, DRESSING_OCCASIONS } from '../data/catalog';
import { Sparkles, Check, ArrowRight, ArrowLeft, X, Crown, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BoutiqueBodyQuizModal({
  userProfile,
  setUserProfile,
  isOpen,
  onClose,
  onComplete
}) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const currentBody = BODY_TYPES.find(b => b.id === userProfile.bodyType) || BODY_TYPES[0];
  const currentOccasion = DRESSING_OCCASIONS.find(o => o.id === userProfile.occasion) || DRESSING_OCCASIONS[0];

  function handleBodySelect(bodyId) {
    setUserProfile(prev => ({ ...prev, bodyType: bodyId }));
  }

  function handleOccasionSelect(occId) {
    setUserProfile(prev => ({ ...prev, occasion: occId }));
  }

  function handleFinish() {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });
    onComplete();
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="animate-fade-in" style={{
        maxWidth: '840px',
        width: '100%',
        backgroundColor: '#FAF8F5',
        borderRadius: '12px',
        border: '1px solid #D4AF37',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '36px'
      }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--boutique-terracotta)', textTransform: 'uppercase' }}>
              BOUTIQUE AI CONSULTATION • STEP {step} OF 3
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Cinzel', 'Playfair Display', serif", color: '#1A1715', margin: '4px 0 0 0' }}>
              {step === 1 && "What is your body silhouette?"}
              {step === 2 && "Where are you wearing your outfit?"}
              {step === 3 && "Your Tailored Style Blueprint"}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#1A1715', fontSize: '1.2rem', cursor: 'pointer', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>

        {/* Step 1: Body Shape */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Select the silhouette that best describes your natural proportions. Our AI will filter the most flattering cuts for you:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '28px' }}>
              {BODY_TYPES.map(body => {
                const isSelected = userProfile.bodyType === body.id;
                return (
                  <div
                    key={body.id}
                    onClick={() => handleBodySelect(body.id)}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #000000' : '1px solid rgba(0, 0, 0, 0.1)',
                      backgroundColor: isSelected ? '#EDE7DC' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A1715' }}>
                        {body.name}
                      </span>
                      {isSelected && (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#000', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#6B655F', margin: 0, lineHeight: 1.4 }}>
                      {body.shortDesc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setStep(2)} className="btn-boutique-black">
                <span>NEXT: CHOOSE OCCASION</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Occasion */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Select your dress code or occasion vibe:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', marginBottom: '28px' }}>
              {DRESSING_OCCASIONS.map(occ => {
                const isSelected = userProfile.occasion === occ.id;
                return (
                  <div
                    key={occ.id}
                    onClick={() => handleOccasionSelect(occ.id)}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #000000' : '1px solid rgba(0, 0, 0, 0.1)',
                      backgroundColor: isSelected ? '#EDE7DC' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A1715' }}>
                        {occ.name}
                      </span>
                      {isSelected && (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#000', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#6B655F', margin: 0, lineHeight: 1.4 }}>
                      {occ.vibe}
                    </p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} className="btn-boutique-outline">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={() => setStep(3)} className="btn-boutique-black">
                <span>VIEW PRESCRIPTION</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary & Launch */}
        {step === 3 && (
          <div>
            <div style={{
              padding: '24px',
              backgroundColor: '#EDE7DC',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Crown size={20} color="var(--boutique-mocha)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A1715', margin: 0 }}>
                  Stylist Recommendation for {currentBody.name}
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#4A453F', lineHeight: 1.6, marginBottom: '16px' }}>
                {currentBody.stylingTip}
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1A1715' }}>Top Recommended Cuts:</span>
                {currentBody.bestFits.map((fit, idx) => (
                  <span key={idx} style={{
                    backgroundColor: '#FFFFFF',
                    color: '#1A1715',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    {fit}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} className="btn-boutique-outline">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={handleFinish} className="btn-boutique-black" style={{ padding: '16px 40px' }}>
                <span>✨ APPLY & GENERATE OUTFITS</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
