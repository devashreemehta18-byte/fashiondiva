import React from 'react';
import { Search, User, ShoppingBag, Sparkles, SlidersHorizontal, Heart } from 'lucide-react';

export default function BoutiqueNavbar({
  activeTab,
  setActiveTab,
  userProfile,
  onOpenBodyQuiz,
  cartCount = 1,
  savedCount = 0
}) {
  return (
    <header className="boutique-nav">
      
      {/* Top Announcement Bar */}
      <div style={{
        backgroundColor: '#161514',
        color: '#D4AF37',
        fontSize: '0.72rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        textAlign: 'center',
        padding: '7px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <Sparkles size={12} color="#D4AF37" />
        <span>Complimentary Worldwide Express Shipping on Orders Over $250 • Custom AI Body-Fit Tailoring</span>
      </div>

      {/* Main Luxury Navigation Bar */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '16px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        
        {/* Brand Logo: LUXORA / FASHIONDIVA BOUTIQUE */}
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
              BOUTIQUE
            </span>
          </div>
        </div>

        {/* Center Categories Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { id: 'home', label: 'NEW IN' },
            { id: 'clothing', label: 'CLOTHING' },
            { id: 'dresses', label: 'DRESSES' },
            { id: 'sets', label: 'SETS' },
            { id: 'accessories', label: 'ACCESSORIES' },
            { id: 'sale', label: 'SALE', isSale: true },
            { id: 'studio', label: 'AI STYLIST', isAi: true },
            { id: 'canvas', label: 'DRESSING ROOM' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`boutique-nav-link ${activeTab === item.id ? 'active' : ''} ${item.isSale ? 'boutique-sale-link' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: item.isSale ? '#E07A5F' : item.isAi ? 'var(--boutique-gold)' : undefined
              }}
            >
              {item.isAi && <Sparkles size={12} color="var(--boutique-gold)" />}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* Quick Body Type Trigger Button */}
          <button
            onClick={onOpenBodyQuiz}
            style={{
              background: 'rgba(197, 168, 128, 0.15)',
              border: '1px solid var(--boutique-gold)',
              color: 'var(--boutique-gold-light)',
              padding: '6px 14px',
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
            <span>Fit: {userProfile.bodyType}</span>
          </button>

          {/* Search Icon */}
          <button
            onClick={() => setActiveTab('search')}
            style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Search Collection"
          >
            <Search size={20} />
          </button>

          {/* User Account / Profile */}
          <button
            onClick={onOpenBodyQuiz}
            style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Style Consultation"
          >
            <User size={20} />
          </button>

          {/* Saved / Favorites */}
          <button
            onClick={() => setActiveTab('saved')}
            style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative' }}
            title="My Saved Outfits"
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

          {/* Shopping Bag Icon with Badge */}
          <button
            onClick={() => setActiveTab('saved')}
            style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative' }}
            title="Boutique Bag"
          >
            <ShoppingBag size={20} />
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
              {cartCount}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
}
