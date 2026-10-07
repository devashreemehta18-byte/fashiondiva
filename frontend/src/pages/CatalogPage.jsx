import React, { useState } from 'react';
import { ITEMS_CATALOG, CATEGORY_LIST, BODY_TYPES } from '../data/catalog';
import { Search, Filter, Sparkles, Heart, Eye, ArrowRight, UserCheck, Check } from 'lucide-react';

export default function CatalogPage({ userProfile, onSelectGarmentForStudio }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterOnlyFlattering, setFilterOnlyFlattering] = useState(false);
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('all');

  const currentBody = BODY_TYPES.find(b => b.id === userProfile.bodyType) || BODY_TYPES[0];

  const filteredItems = ITEMS_CATALOG.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.fabric?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.color_label.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStyle = selectedStyleFilter === 'all' || item.style === selectedStyleFilter;
    const matchesFlattering = !filterOnlyFlattering || (item.flattering_body_types && item.flattering_body_types.includes(userProfile.bodyType));

    return matchesSearch && matchesCategory && matchesStyle && matchesFlattering;
  });

  const styles = ['all', 'minimalist', 'old_money', 'formal', 'party', 'casual', 'streetwear'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      
      {/* Page Header */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        background: 'linear-gradient(135deg, rgba(26, 32, 50, 0.95) 0%, rgba(18, 24, 38, 0.98) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.35)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '8px' }}>
              <Sparkles size={13} color="var(--gold)" /> Curated Haute Collection
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }} className="font-serif">
              Designer Wardrobe Catalog
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Explore luxury garments filtered specifically for your <strong>{currentBody.name}</strong> silhouette.
            </p>
          </div>

          {/* Quick Flattering Filter Switch */}
          <button
            onClick={() => setFilterOnlyFlattering(prev => !prev)}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              border: filterOnlyFlattering ? '2px solid var(--gold)' : '1px solid var(--border-glass)',
              background: filterOnlyFlattering ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: filterOnlyFlattering ? 'var(--gold-light)' : 'var(--text-main)',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition)'
            }}
          >
            <UserCheck size={16} color={filterOnlyFlattering ? 'var(--gold)' : 'currentColor'} />
            <span>Show Only Best Cuts for {currentBody.name}</span>
            {filterOnlyFlattering && <Check size={14} color="var(--gold)" strokeWidth={3} />}
          </button>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-glass)'
          }}>
            <Search size={18} color="var(--gold)" />
            <input
              type="text"
              placeholder="Search by garment title, brand, fabric (silk, cashmere, wool), or color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFF',
                fontSize: '0.9rem',
                width: '100%',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                background: selectedCategory === 'all' ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                color: selectedCategory === 'all' ? '#000' : '#FFF',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              All Pieces ({ITEMS_CATALOG.length})
            </button>
            {CATEGORY_LIST.map(cat => {
              const count = ITEMS_CATALOG.filter(i => i.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    background: selectedCategory === cat.id ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                    color: selectedCategory === cat.id ? '#000' : 'var(--text-muted)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Garments Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredItems.length}</strong> luxury pieces
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <Search size={40} color="var(--gold)" style={{ marginBottom: '14px' }} />
            <h3>No garments found matching your filters</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
              Try clearing the search query or disabling the silhouette filter.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredItems.map(item => {
              const isFlattering = item.flattering_body_types?.includes(userProfile.bodyType);
              return (
                <div
                  key={item.item_id}
                  className="glass-panel glass-panel-hover"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isFlattering ? '1.5px solid rgba(212, 175, 55, 0.4)' : '1px solid var(--border-glass)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 800 }}>
                        {item.category}
                      </span>
                      {isFlattering && (
                        <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                          ★ Flattering Cut
                        </span>
                      )}
                    </div>

                    <div style={{ height: '220px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px', position: 'relative' }}>
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span className="badge badge-gold" style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        fontWeight: 800,
                        textTransform: 'capitalize'
                      }}>
                        {item.fit_type || 'Tailored Fit'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '6px' }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                      {item.description || item.fabric}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                      <span>Fabric: <strong style={{ color: 'var(--text-main)' }}>{item.fabric}</strong></span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="color-swatch-circle" style={{ backgroundColor: item.color_hex }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{item.color_label}</span>
                    </div>

                    <button
                      onClick={() => onSelectGarmentForStudio(item.item_id)}
                      className="btn-gold"
                      style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                    >
                      Style Around This Piece <ArrowRight size={13} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
