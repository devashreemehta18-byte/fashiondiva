import React from 'react';
import { BODY_TYPES, DRESSING_OCCASIONS } from '../data/catalog';
import { Sparkles, Check, Heart, Shield, Crown, Briefcase, Coffee, Gem, Zap, Sun, GlassWater, ArrowRight, UserCheck, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

const OCCASION_ICONS = {
  gala: Crown,
  business: Briefcase,
  date_night: GlassWater,
  casual_luxury: Coffee,
  old_money: Gem,
  streetwear: Zap,
  resort: Sun
};

const COLOR_PALETTES = [
  { id: 'monochrome', name: 'Onyx & Champagne Monochrome', hexes: ['#0A0A0A', '#FFFFFF', '#D4AF37', '#71717A'] },
  { id: 'warm_autumn', name: 'Warm Autumn Earth & Terracotta', hexes: ['#B45309', '#78350F', '#D97706', '#FDE68A'] },
  { id: 'cool_winter', name: 'Cool Winter Emerald & Navy', hexes: ['#065F46', '#1E3A8A', '#18181B', '#F8FAFC'] },
  { id: 'soft_summer', name: 'Soft Summer Rose & Cashmere', hexes: ['#FB7185', '#E0A96D', '#E2E8F0', '#94A3B8'] }
];

export default function BodyStyleProfiler({
  userProfile,
  setUserProfile,
  onApplyProfile
}) {
  const currentBody = BODY_TYPES.find(b => b.id === userProfile.bodyType) || BODY_TYPES[0];
  const currentOccasion = DRESSING_OCCASIONS.find(o => o.id === userProfile.occasion) || DRESSING_OCCASIONS[0];

  function handleBodySelect(bodyId) {
    setUserProfile(prev => ({ ...prev, bodyType: bodyId }));
  }

  function handleOccasionSelect(occId) {
    setUserProfile(prev => ({ ...prev, occasion: occId }));
  }

  function handleGoalToggle(goal) {
    setUserProfile(prev => {
      const currentGoals = prev.stylingGoals || [];
      if (currentGoals.includes(goal)) {
        return { ...prev, stylingGoals: currentGoals.filter(g => g !== goal) };
      } else {
        return { ...prev, stylingGoals: [...currentGoals, goal] };
      }
    });
  }

  function handleComplete() {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onApplyProfile) {
      onApplyProfile();
    }
  }

  const STYLING_GOALS = [
    'Accentuate Waistline',
    'Elongate Leg Silhouette',
    'Balance Upper & Lower Proportions',
    'Highlight Décolletage & Shoulders',
    'Architectural Power Layering',
    'Effortless Draped Comfort',
    'Hourglass Curve Sculpting'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      
      {/* Editorial Banner */}
      <div className="glass-panel" style={{
        padding: '36px 32px',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(30, 27, 75, 0.85) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '14px' }}>
            <Sparkles size={13} color="var(--gold)" /> Haute Couture Stylist Consultation
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '12px' }} className="font-serif">
            Personalized Body Silhouette & Dressing Consultation
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Our deep learning fashion engine tailors Siamese neural compatibility weights, hemline proportions, and color harmonies precisely to your unique body frame and the occasion you want to conquer.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px' }}>
        
        {/* Left Column: Interactive Questionnaire */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Question 1: Body Shape */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.05em' }}>STEP 01</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Select Your Body Silhouette</h3>
              </div>
              <span className="badge badge-purple">
                <UserCheck size={14} /> Selected: {currentBody.name}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
              {BODY_TYPES.map(body => {
                const isSelected = userProfile.bodyType === body.id;
                return (
                  <div
                    key={body.id}
                    onClick={() => handleBodySelect(body.id)}
                    className="glass-card-interactive"
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '2px solid var(--gold)' : '1px solid var(--border-glass)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? 'var(--gold-light)' : '#FFF' }}>
                        {body.name}
                      </span>
                      {isSelected && (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={12} color="#000" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                      {body.shortDesc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question 2: Occasion / How do you want to dress up? */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 700, letterSpacing: '0.05em' }}>STEP 02</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>How Do You Want to Dress Up Today?</h3>
              </div>
              <span className="badge badge-gold">
                {currentOccasion.name}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
              {DRESSING_OCCASIONS.map(occ => {
                const isSelected = userProfile.occasion === occ.id;
                const IconComponent = OCCASION_ICONS[occ.id] || Crown;
                return (
                  <div
                    key={occ.id}
                    onClick={() => handleOccasionSelect(occ.id)}
                    className="glass-card-interactive"
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isSelected ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComponent size={18} color={isSelected ? '#FFF' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#FFF' : 'var(--text-main)', marginBottom: '4px' }}>
                        {occ.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                        {occ.vibe}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question 3: Silhouette & Styling Goals */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: 700, letterSpacing: '0.05em' }}>STEP 03</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '14px' }}>
              What Features Would You Love to Accentuate?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Select all goals that apply to calibrate our neural silhouette engine:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {STYLING_GOALS.map((goal, idx) => {
                const isSelected = (userProfile.stylingGoals || []).includes(goal);
                return (
                  <button
                    key={idx}
                    onClick={() => handleGoalToggle(goal)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid var(--gold)' : '1px solid var(--border-glass)',
                      background: isSelected ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? 'var(--gold-light)' : 'var(--text-main)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'var(--transition)'
                    }}
                  >
                    {isSelected && <Check size={13} color="var(--gold)" strokeWidth={3} />}
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 4: Preferred Palette Mood */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 700, letterSpacing: '0.05em' }}>STEP 04</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>
              Seasonal Color & Tone Preference
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {COLOR_PALETTES.map(pal => {
                const isSelected = userProfile.colorPalette === pal.id;
                return (
                  <div
                    key={pal.id}
                    onClick={() => setUserProfile(prev => ({ ...prev, colorPalette: pal.id }))}
                    className="glass-card-interactive"
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '2px solid var(--cyan)' : '1px solid var(--border-glass)'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>
                      {pal.name}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {pal.hexes.map((hex, i) => (
                        <span key={i} className="color-swatch-circle" style={{ width: '18px', height: '18px', backgroundColor: hex }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Live AI Stylist Prescription Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{
            padding: '28px',
            position: 'sticky',
            top: '20px',
            background: 'linear-gradient(180deg, rgba(26, 32, 48, 0.9) 0%, rgba(15, 20, 30, 0.95) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.35)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Crown size={20} color="#000" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Stylist Consultation
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Tailored Blueprint
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
              
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <div style={{ fontWeight: 700, color: 'var(--gold-light)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> {currentBody.name} Blueprint:
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
                  {currentBody.stylingTip}
                </p>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Most Flattering Cuts:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {currentBody.bestFits.map((fit, idx) => (
                    <span key={idx} className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                      {fit}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Selected Occasion:
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFF' }}>
                  <Crown size={16} color="var(--gold)" /> {currentOccasion.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {currentOccasion.vibe}
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="btn-gold"
                style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '12px 20px', fontSize: '0.95rem' }}
              >
                Apply & Generate Personalized Outfits <ArrowRight size={16} />
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
