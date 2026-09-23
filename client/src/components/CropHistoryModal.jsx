import React, { useState, useEffect } from 'react';
import { X, Layers, ArrowDown, ShieldCheck, AlertTriangle, Clock, RefreshCw, AlertOctagon } from 'lucide-react';
import BlockCard from './BlockCard';

export default function CropHistoryModal({ crop, isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && crop) {
      setLoading(true);
      setError(null);
      fetch(`/api/ledger/crop-history/${crop._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setHistory(data.history || []);
          } else {
            setError(data.message || 'Failed to load history');
          }
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isOpen, crop]);

  if (!isOpen || !crop) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} />
            </div>
            <h3>
              <span>क्रिप्टोग्राफिक ब्लॉकचेन इतिहास: {crop.cropType}</span>
            </h3>
          </div>
          <button className="modal-close" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Crop quick summary */}
          <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.15rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>CROP ID</span>
              <span className="font-mono" style={{ fontWeight: 600, color: '#38bdf8' }}>{crop._id}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>QUANTITY</span>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{crop.quantity} kg</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>CURRENT STAGE</span>
              <span className={`badge badge-${crop.currentStage}`}>{crop.currentStage}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>ASSOCIATED BLOCKS</span>
              <span style={{ fontWeight: 700, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>{history.length} Chain Blocks</span>
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
              <RefreshCw size={24} className="spin-slow" style={{ margin: '0 auto 0.75rem', display: 'block', color: '#10b981' }} />
              <p>क्रिप्टोग्राफिक लेजर ब्लॉक लोड हो रहे हैं...</p>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#fb7185', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertOctagon size={18} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
              <p>इस फसल से जुड़ा कोई ब्लॉकचेन रिकॉर्ड नहीं मिला।</p>
            </div>
          )}

          {/* Timeline of linked blocks */}
          {!loading && history.length > 0 && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="#10b981" />
                <span>अपरिवर्तनीय लेजर श्रृंखला (Genesis से लेकर वर्तमान अवस्था):</span>
              </div>

              {history.map((block, idx) => (
                <div key={block.hash || idx} style={{ position: 'relative' }}>
                  <BlockCard block={block} highlightCropId={crop._id} />

                  {/* Chain connector arrow */}
                  {idx < history.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0.5rem 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#10b981' }}>
                        <div style={{ width: '2px', height: '14px', background: 'rgba(16, 185, 129, 0.4)' }}></div>
                        <ArrowDown size={16} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
