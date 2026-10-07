import React, { useState } from 'react';
import { Cpu, Layers, Palette, ShieldCheck, Sliders, Server, Code, Crown, UserCheck, Sparkles } from 'lucide-react';

export default function ModelDocs({ backendStatus }) {
  const [weights, setWeights] = useState({
    learned_compatibility: 0.35,
    body_silhouette_flattery: 0.25,
    color_harmony: 0.20,
    occasion_alignment: 0.20
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '24px 32px',
        background: 'linear-gradient(135deg, rgba(26, 32, 48, 0.9) 0%, rgba(18, 24, 38, 0.95) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: '8px' }}>
            <Cpu size={13} color="var(--primary-light)" /> Deep Neural Architecture & Math
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }} className="font-serif">
            FashionDiva AI System Architecture
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Detailed view of our 512-D CLIP visual encoder, Siamese compatibility metric MLP, FAISS multi-slot vector indexing, and Body Silhouette Flattery Engine.
          </p>
        </div>
      </div>

      {/* Architecture Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        
        {/* Card 1: CLIP Embeddings */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Cpu size={22} color="var(--primary-light)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>1. CLIP ViT-B/32</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            Maps visual garments into 512-dimensional L2-normalized feature vectors. Performs zero-shot category and aesthetic classification.
          </p>
          <span className="badge badge-purple">512-D Latent Space</span>
        </div>

        {/* Card 2: FAISS Index */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Layers size={22} color="var(--cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>2. FAISS 9-Slot Index</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            Maintains 9 category-specific sub-indexes (top, dress, jacket, pants, shoes, bag, accessories) for sub-millisecond beam search retrieval.
          </p>
          <span className="badge badge-cyan">IndexFlatIP • Cosine Sim</span>
        </div>

        {/* Card 3: Siamese MLP */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <ShieldCheck size={22} color="var(--secondary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>3. Siamese MLP Metric</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            PyTorch pairwise network evaluating item pair vectors via concatenated interactive features: <code>[u, v, u * v, |u - v|]</code> (2048-D).
          </p>
          <span className="badge badge-pink">AUC 0.89 • Binary Cross-Entropy</span>
        </div>

        {/* Card 4: Body Silhouette Engine */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Crown size={22} color="var(--gold)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>4. Silhouette Profiler</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            Calculates personalized silhouette flattery and occasion dress-code appropriateness based on individual body frame geometry.
          </p>
          <span className="badge badge-gold">8 Body Types • 7 Occasions</span>
        </div>

      </div>

      {/* Live Server Endpoints Info */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={18} color="var(--emerald)" /> RESTful Neural Microservice Endpoints (FastAPI)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '0.85rem' }}>
          <div style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontWeight: 700, color: 'var(--cyan)', marginBottom: '4px' }}>POST /analyze</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Accepts uploaded clothing image, extracts 512-D CLIP embedding, dominant color hex, style classification, and fabric texture.
            </div>
          </div>

          <div style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontWeight: 700, color: 'var(--gold)', marginBottom: '4px' }}>POST /recommend</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Beam search cross-category generator ranking complete 5-piece ensembles by Siamese neural compatibility and body flattery.
            </div>
          </div>

          <div style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary-light)', marginBottom: '4px' }}>POST /similar</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              FAISS vector search retrieving Top-K nearest visual garments in latent embedding space.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
