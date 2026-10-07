import React from 'react';
import { ArrowRight, Sparkles, Cpu, SlidersHorizontal, Palette } from 'lucide-react';

export default function FashionHero({ onStartBodyQuiz, onStartStudioUpload }) {
  return (
    <section className="hero-container" style={{
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      backgroundColor: '#F7F4EE'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.05fr 0.95fr',
        minHeight: '84vh',
        alignItems: 'stretch'
      }}>
        
        {/* Left Hero Content */}
        <div style={{
          padding: '64px 48px 48px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          
          {/* Tag */}
          <span className="hero-tag">
            AI OUTFIT ANALYSIS & PERSONAL STYLIST
          </span>

          {/* Massive Headline */}
          <h1 className="hero-headline">
            DRESS<br />
            YOUR<br />
            <span className="accent-word">MOMENT.</span>
          </h1>

          {/* Subtitle */}
          <div className="hero-subtitle">
            <span style={{ color: 'var(--boutique-terracotta)', fontSize: '1.2rem' }}>✦</span>
            <span>PERFECT COMPATIBILITY. MADE FOR YOUR BODY.</span>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={onStartBodyQuiz}
              className="btn-boutique-black"
            >
              <span>ANALYZE MY BODY & STYLE</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onStartStudioUpload}
              className="btn-boutique-outline"
            >
              <Sparkles size={16} color="var(--boutique-terracotta)" />
              <span>UPLOAD CLOTHING PHOTO</span>
            </button>
          </div>

          {/* 3-Column AI Stylist Highlights Bar */}
          <div className="trust-bar">
            
            {/* 1. Deep Learning Analysis */}
            <div className="trust-item">
              <div style={{ color: '#1A1715', marginTop: '2px' }}>
                <Cpu size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="trust-title">DEEP LEARNING AI</div>
                <div className="trust-desc">CLIP & Siamese neural compatibility</div>
              </div>
            </div>

            {/* 2. Body Shape Tailoring */}
            <div className="trust-item">
              <div style={{ color: '#1A1715', marginTop: '2px' }}>
                <SlidersHorizontal size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="trust-title">BODY SILHOUETTE FIT</div>
                <div className="trust-desc">Flattering rules for 8 shapes</div>
              </div>
            </div>

            {/* 3. Color Harmony Matrix */}
            <div className="trust-item">
              <div style={{ color: '#1A1715', marginTop: '2px' }}>
                <Palette size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="trust-title">COLOR HARMONY</div>
                <div className="trust-desc">Science-backed palette synergy</div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Hero Image (High Fashion Editorial Shot) */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: '600px',
          background: '#EAE5DB'
        }}>
          <img
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85"
            alt="FashionDiva AI Stylist Editorial"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 20%'
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(247, 244, 238, 0.25) 0%, transparent 40%)'
          }} />
        </div>

      </div>
    </section>
  );
}
