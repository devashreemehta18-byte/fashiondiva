import React, { useState, useEffect } from 'react';
import FashionNavbar from './components/FashionNavbar';
import FashionStylistHomePage from './pages/FashionStylistHomePage';
import BoutiqueBodyQuizModal from './components/BoutiqueBodyQuizModal';
import Studio from './components/Studio';
import WardrobeCanvas from './components/WardrobeCanvas';
import CatalogPage from './pages/CatalogPage';
import SavedOutfits from './components/SavedOutfits';
import SimilarityExplorer from './components/SimilarityExplorer';
import StyleGuidePage from './pages/StyleGuidePage';
import { checkBackendStatus, getLocalFavourites } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedOutfitForCanvas, setSelectedOutfitForCanvas] = useState(null);
  const [selectedStudioGarmentId, setSelectedStudioGarmentId] = useState(null);
  const [showBodyQuizModal, setShowBodyQuizModal] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // User Profile
  const [userProfile, setUserProfile] = useState({
    bodyType: 'hourglass',
    occasion: 'gala',
    stylingGoals: ['Accentuate Waistline', 'Elongate Leg Silhouette'],
    colorPalette: 'monochrome',
    fitPreference: 'tailored'
  });

  useEffect(() => {
    async function init() {
      await checkBackendStatus();
      const favs = getLocalFavourites();
      setSavedCount(favs.length);
    }
    init();
  }, []);

  function handleOpenStudioWithItem(itemId) {
    setSelectedStudioGarmentId(itemId);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectOutfitForCanvas(outfit) {
    setSelectedOutfitForCanvas(outfit);
    setActiveTab('canvas');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCompleteQuiz() {
    setShowBodyQuizModal(false);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--boutique-cream)' }}>
      
      {/* 1. Global AI Stylist Navigation Bar */}
      <FashionNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        onOpenBodyQuiz={() => setShowBodyQuizModal(true)}
        savedCount={savedCount}
      />

      {/* 2. Main Page Views */}
      <main>
        
        {/* OVERVIEW / HOME: Editorial Hero & AI Stylist Highlights */}
        {activeTab === 'home' && (
          <FashionStylistHomePage
            userProfile={userProfile}
            onStartBodyQuiz={() => setShowBodyQuizModal(true)}
            onOpenStudioWithItem={handleOpenStudioWithItem}
            onOpenCanvasWithOutfit={handleSelectOutfitForCanvas}
            onNavigateToStudio={() => {
              setActiveTab('studio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* AI OUTFIT STYLIST STUDIO */}
        {activeTab === 'studio' && (
          <div className="app-container" style={{ paddingTop: '32px' }}>
            <Studio
              onSelectOutfitForCanvas={handleSelectOutfitForCanvas}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              initialAnchorId={selectedStudioGarmentId}
            />
          </div>
        )}

        {/* WARDROBE VAULT & INSPIRATION */}
        {activeTab === 'catalog' && (
          <div className="app-container" style={{ paddingTop: '32px' }}>
            <CatalogPage
              userProfile={userProfile}
              onSelectGarmentForStudio={handleOpenStudioWithItem}
            />
          </div>
        )}

        {/* MIX & MATCH DRESSING ROOM CANVAS */}
        {activeTab === 'canvas' && (
          <div className="app-container" style={{ paddingTop: '32px' }}>
            <WardrobeCanvas
              currentOutfit={selectedOutfitForCanvas}
              onUpdateOutfit={(updated) => setSelectedOutfitForCanvas(updated)}
              userProfile={userProfile}
            />
          </div>
        )}

        {/* SAVED LOOKBOOKS */}
        {activeTab === 'saved' && (
          <div className="app-container" style={{ paddingTop: '32px' }}>
            <SavedOutfits onSelectOutfitForCanvas={handleSelectOutfitForCanvas} />
          </div>
        )}

        {/* VISUAL EMBEDDING SEARCH */}
        {activeTab === 'search' && (
          <div className="app-container" style={{ paddingTop: '32px' }}>
            <SimilarityExplorer />
          </div>
        )}

        {/* STYLE GUIDE & BODY RULES */}
        {activeTab === 'guide' && (
          <div className="app-container" style={{ paddingTop: '32px' }}>
            <StyleGuidePage
              userProfile={userProfile}
              onSelectBodyType={(bId) => {
                setUserProfile(prev => ({ ...prev, bodyType: bId }));
                setActiveTab('studio');
              }}
            />
          </div>
        )}

      </main>

      {/* 3. Interactive Body Type Quiz Consultation Modal */}
      <BoutiqueBodyQuizModal
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        isOpen={showBodyQuizModal}
        onClose={() => setShowBodyQuizModal(false)}
        onComplete={handleCompleteQuiz}
      />

    </div>
  );
}
