import React, { useState } from 'react';
import { ITEMS_CATALOG, getItemById } from '../data/catalog';
import { HelpCircle, CheckCircle2, XCircle, Award, Sparkles, RefreshCw, Crown, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FITBChallenge() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [scoreCount, setScoreCount] = useState({ correct: 0, total: 0 });

  const quizQuestions = [
    {
      title: "Gala Look: Emerald Satin Evening Gown",
      givenItems: [getItemById('item_10006'), getItemById('item_10019'), getItemById('item_10021')],
      targetCategory: "shoes",
      correctId: 'item_10013', // Stiletto Gold Pumps
      explanation: "Metallic champagne gold stiletto pumps create luxury color harmony with emerald silk satin and gold jewelry.",
      options: [
        getItemById('item_10013'),
        getItemById('item_10014'),
        getItemById('item_10015'),
        getItemById('item_10008')
      ]
    },
    {
      title: "Executive Look: Sartorial Tailored Blazer Ensemble",
      givenItems: [getItemById('item_10004'), getItemById('item_10009'), getItemById('item_10018')],
      targetCategory: "shoes",
      correctId: 'item_10015', // Chelsea Boots
      explanation: "Black Italian leather Chelsea boots maintain the structured corporate silhouette and monochrome palette.",
      options: [
        getItemById('item_10015'),
        getItemById('item_10013'),
        getItemById('item_10014'),
        getItemById('item_10003')
      ]
    },
    {
      title: "Urban Streetwear Look: Leather Biker & Denim",
      givenItems: [getItemById('item_10002'), getItemById('item_10008'), getItemById('item_10017')],
      targetCategory: "shoes",
      correctId: 'item_10014', // Platform Sneakers
      explanation: "Clean minimalist white leather sneakers balance the heavy black leather and high-waist denim.",
      options: [
        getItemById('item_10014'),
        getItemById('item_10013'),
        getItemById('item_10011'),
        getItemById('item_10006')
      ]
    }
  ];

  const currentQ = quizQuestions[questionIndex % quizQuestions.length];

  function handleAnswer(candId) {
    if (showResult) return;
    setSelectedCandidateId(candId);
    setShowResult(true);

    const isCorrect = candId === currentQ.correctId;
    setScoreCount(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  function handleNext() {
    setShowResult(false);
    setSelectedCandidateId(null);
    setQuestionIndex(prev => prev + 1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'linear-gradient(135deg, rgba(26, 32, 48, 0.9) 0%, rgba(18, 24, 38, 0.95) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)'
      }}>
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '8px' }}>
            <Award size={13} color="var(--gold)" /> Polyvore FITB Benchmark Challenge
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }} className="font-serif">
            Fashion Intelligence & Compatibility IQ
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Test your styling intuition against our PyTorch Siamese Compatibility model on Fill-In-The-Blank tasks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-light)' }}>
              {scoreCount.correct} / {scoreCount.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stylist Score</div>
          </div>
        </div>
      </div>

      {/* Main Challenge Board */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        
        {/* Given Incomplete Outfit */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }} className="font-serif">
              {currentQ.title}
            </h3>
            <span className="badge badge-purple">
              Mission: Choose the best {currentQ.targetCategory.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${currentQ.givenItems.length + 1}, 1fr)`, gap: '16px' }}>
            {currentQ.givenItems.map((item, idx) => (
              <div key={idx} style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  Given: {item.category}
                </div>
                <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </div>
              </div>
            ))}

            {/* Missing Slot Card */}
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--gold)',
              background: 'rgba(212, 175, 55, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <HelpCircle size={36} color="var(--gold)" className="pulse-glow" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-light)' }}>Missing Piece</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {currentQ.targetCategory}</div>
            </div>
          </div>
        </div>

        {/* Multiple Choice Options */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
            Select the Most Harmonious Candidate:
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {currentQ.options.map((cand, idx) => {
              const isSelected = selectedCandidateId === cand.item_id;
              const isCorrect = cand.item_id === currentQ.correctId;

              let borderStyle = '1px solid var(--border-glass)';
              let bgStyle = 'rgba(255,255,255,0.03)';

              if (showResult) {
                if (isCorrect) {
                  borderStyle = '2px solid #10B981';
                  bgStyle = 'rgba(16, 185, 129, 0.15)';
                } else if (isSelected) {
                  borderStyle = '2px solid #EF4444';
                  bgStyle = 'rgba(239, 68, 68, 0.15)';
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleAnswer(cand.item_id)}
                  className="glass-card-interactive"
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: borderStyle,
                    background: bgStyle,
                    cursor: showResult ? 'default' : 'pointer'
                  }}
                >
                  <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                    <img src={cand.image_url} alt={cand.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cand.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cand.category}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--gold-light)' }}>${cand.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback & Next Button */}
        {showResult && (
          <div className="animate-fade-in" style={{
            marginTop: '24px',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            background: selectedCandidateId === currentQ.correctId ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: selectedCandidateId === currentQ.correctId ? '1px solid #10B981' : '1px solid #EF4444',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedCandidateId === currentQ.correctId ? (
                  <><CheckCircle2 size={18} color="#10B981" /> Correct Answer! Outstanding Compatibility Match.</>
                ) : (
                  <><XCircle size={18} color="#EF4444" /> Not quite optimal. AI Siamese network preferred Option #{currentQ.options.findIndex(o => o.item_id === currentQ.correctId) + 1}.</>
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0 }}>
                {currentQ.explanation}
              </p>
            </div>

            <button onClick={handleNext} className="btn-gold" style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>
              Next Question <ArrowRight size={15} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
