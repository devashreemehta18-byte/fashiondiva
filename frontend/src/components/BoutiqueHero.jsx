import React from 'react';
import { ArrowRight, Sparkles, Feather, Globe, Shirt } from 'lucide-react';

export default function BoutiqueHero({ onShopEdit, onStartBodyQuiz }) {
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
            NEW COLLECTION
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
            <span>TIMELESS PIECES. MADE FOR YOU.</span>
          </div>

          {/* CTA Button Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={onShopEdit}
              className="btn-boutique-black"
            >
              <span>SHOP THE EDIT</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onStartBodyQuiz}
              className="btn-boutique-outline"
            >
              <Sparkles size={16} color="var(--boutique-terracotta)" />
              <span>AI BODY FIT QUIZ</span>
            </button>
          </div>

          {/* 3-Column Trust / Features Bar */}
          <div className="trust-bar">
            
            {/* 1. Curated Styles */}
            <div className="trust-item">
              <div style={{ color: '#1A1715', marginTop: '2px' }}>
                <Shirt size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="trust-title">CURATED STYLES</div>
                <div className="trust-desc">Handpicked looks</div>
              </div>
            </div>

            {/* 2. Premium Quality */}
            <div className="trust-item">
              <div style={{ color: '#1A1715', marginTop: '2px' }}>
                <Feather size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="trust-title">PREMIUM QUALITY</div>
                <div className="trust-desc">Fabrics that last</div>
              </div>
            </div>

            {/* 3. Worldwide Shipping */}
            <div className="trust-item">
              <div style={{ color: '#1A1715', marginTop: '2px' }}>
                <Globe size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="trust-title">WORLDWIDE SHIPPING</div>
                <div className="trust-desc">Fast & secure delivery</div>
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
            alt="Luxora Boutique Editorial Fashion Model"
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
