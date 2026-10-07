import React from 'react';
import { Sparkles, SlidersHorizontal, Heart, Search, User, Scissors, BookOpen, Layers } from 'lucide-react';

export default function FashionNavbar({
  activeTab,
  setActiveTab,
  userProfile,
  onOpenBodyQuiz,
  savedCount = 0
}) {
  return (
    <header className="boutique-nav">
      
      {/* Top AI Stylist Announcement Bar */}
      <div style={{
        backgroundColor: '#121214',
        color: '#D4AF37',
        fontSize: '0.72rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        textAlign: 'center',
        padding: '7px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <Sparkles size={12} color="#D4AF37" />
        <span>AI Fashion Compatibility Engine • CLIP Vision Embeddings • Personalized Body Silhouette Profiling</span>
      </div>

      {/* Main Navigation Bar */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '16px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('home')}
          style={{ cursor: 'pointer', textAlign: 'center' }}
        >
          <div style={{
            fontSize: '1.65rem',
            fontWeight: 700,
            letterSpacing: '0.22em',
            color: '#FFFFFF',
            fontFamily: "'Cinzel', serif",
            textTransform: 'uppercase',
            lineHeight: 1
          }}>
            FASHIONDIVA
          </div>
          <div style={{
            fontSize: '0.62rem',
            letterSpacing: '0.38em',
            color: 'var(--boutique-gold)',
            textTransform: 'uppercase',
            fontFamily: "'Cinzel', serif",
            marginTop: '4px',
            position: 'relative',
            display: 'inline-block'
          }}>
            <span style={{ borderBottom: '1px solid var(--boutique-gold)', paddingBottom: '2px', display: 'inline-block' }}>
              AI OUTFIT STYLIST
            </span>
          </div>
        </div>

        {/* Center Stylist Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { id: 'home', label: 'OVERVIEW' },
            { id: 'studio', label: 'AI OUTFIT STYLIST', isAi: true },
            { id: 'canvas', label: 'DRESSING ROOM' },
            { id: 'catalog', label: 'WARDROBE VAULT' },
            { id: 'saved', label: 'MY LOOKBOOKS' },
            { id: 'search', label: 'VISUAL SEARCH' },
            { id: 'guide', label: 'STYLE GUIDE' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`boutique-nav-link ${activeTab === item.id ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: item.isAi ? 'var(--boutique-gold)' : undefined
              }}
            >
              {item.isAi && <Sparkles size={12} color="var(--boutique-gold)" />}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action Icons & Active Silhouette Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Active Body Silhouette Indicator */}
          <button
            onClick={onOpenBodyQuiz}
            style={{
              background: 'rgba(197, 168, 128, 0.15)',
              border: '1px solid var(--boutique-gold)',
              color: 'var(--boutique-gold-light)',
              padding: '7px 16px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition)'
            }}
          >
            <SlidersHorizontal size={13} color="var(--boutique-gold)" />
            <span>Body: <strong style={{ color: '#FFF' }}>{userProfile.bodyType}</strong></span>
          </button>

          {/* Search Icon */}
          <button
            onClick={() => setActiveTab('search')}
            style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Visual Embedding Search"
          >
            <Search size={20} />
          </button>

          {/* User Profile / Body Consultation */}
          <button
            onClick={onOpenBodyQuiz}
            style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Retake Body Consultation Quiz"
          >
            <User size={20} />
          </button>

          {/* Saved Lookbook Heart */}
          <button
            onClick={() => setActiveTab('saved')}
            style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative' }}
            title="Saved Lookbooks"
          >
            <Heart size={20} />
            {savedCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                background: '#E07A5F',
                color: '#FFF',
                fontSize: '0.62rem',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {savedCount}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
}
