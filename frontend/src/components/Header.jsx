import React from 'react';
import { Sparkles, Scissors, Search, Heart, Crown, UserCheck, ShoppingBag, BookOpen } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  userProfile,
  savedCount = 0
}) {
  const tabs = [
    { id: 'quiz', label: 'Body Style Quiz', icon: UserCheck, badge: 'Start Here' },
    { id: 'studio', label: 'Outfit Stylist', icon: Sparkles, badge: 'AI Engine' },
    { id: 'canvas', label: 'Mix & Match Canvas', icon: Scissors },
    { id: 'catalog', label: 'Wardrobe Catalog', icon: ShoppingBag },
    { id: 'favourites', label: 'Saved Looks', icon: Heart, count: savedCount },
    { id: 'similarity', label: 'Visual Search', icon: Search },
    { id: 'guide', label: 'Style Guide', icon: BookOpen }
  ];

  return (
    <header style={{ marginBottom: '28px' }}>
      
      {/* Top Navbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(26, 32, 50, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        boxShadow: 'var(--shadow-glow)',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        
        {/* Brand */}
        <div
          onClick={() => setActiveTab('studio')}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F5D77F 0%, #D4AF37 50%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-gold)'
          }}>
            <Crown size={24} color="#0A0A0E" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }} className="gradient-text-gold font-serif">
                FashionDiva
              </h1>
              <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                AI STYLIST
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Deep Learning Fashion Compatibility & Body Silhouette Profiling
            </p>
          </div>
        </div>

        {/* Quick Profile Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('quiz')}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: 'var(--gold-light)',
              fontSize: '0.82rem',
              fontWeight: 700
            }}
          >
            <UserCheck size={16} color="var(--gold)" />
            <span>
              Profile: <strong style={{ color: '#FFF', textTransform: 'capitalize' }}>{userProfile.bodyType}</strong>
              {' • '}
              <span style={{ color: 'var(--gold-light)', textTransform: 'capitalize' }}>{userProfile.occasion.replace('_', ' ')}</span>
            </span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '6px', marginLeft: '4px' }}>
              Retake Quiz ▾
            </span>
          </button>
        </div>
      </div>

      {/* Multi-Page Navigation Bar */}
      <nav style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '6px',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-glass)'
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 800 : 500,
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(139, 92, 246, 0.22) 100%)' : 'transparent',
                color: isActive ? 'var(--gold-light)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 4px 15px rgba(0, 0, 0, 0.3)' : 'none',
                borderBottom: isActive ? '2px solid var(--gold)' : '2px solid transparent'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--gold)' : 'currentColor'} />
              {tab.label}
              {tab.badge && (
                <span className="badge badge-gold" style={{ fontSize: '0.62rem', padding: '1px 6px', marginLeft: '2px' }}>
                  {tab.badge}
                </span>
              )}
              {tab.count > 0 && (
                <span className="badge badge-pink" style={{ fontSize: '0.62rem', padding: '1px 6px', marginLeft: '2px' }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

    </header>
  );
}
