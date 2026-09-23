import React, { useState } from 'react';
import { X, ShieldCheck, Printer, ChevronDown, ChevronUp, Sprout, CheckCircle2, QrCode } from 'lucide-react';
import BlockCard from './BlockCard';
import { translations } from '../utils/translations';

export default function KisanReceiptModal({ crop, block, isOpen, onClose, lang = 'hi' }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const t = translations[lang] || translations.hi;

  if (!isOpen || !crop) return null;

  const stageDisplay = {
    farm: {
      hi: 'खेत में सुरक्षित (At Farm Gate)',
      en: 'Safe at Farm Gate',
      color: '#38bdf8',
      bg: 'rgba(14, 165, 233, 0.15)'
    },
    warehouse: {
      hi: 'गोदाम में जमा (In Warehouse)',
      en: 'Stored in Warehouse Silo',
      color: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.15)'
    },
    sold: {
      hi: 'बिक गई व भुगतान पूरा (Sold & Paid)',
      en: 'Sold & Settled',
      color: '#34d399',
      bg: 'rgba(16, 185, 129, 0.15)'
    }
  };

  const currentStageInfo = stageDisplay[crop.currentStage] || stageDisplay.farm;
  const weightKg = Number(crop.quantity) || 0;
  const weightQuintal = (weightKg / 100).toFixed(1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <h3>
              <span>{lang === 'hi' ? 'किसान डिजिटल पर्ची (Digital Kisan Receipt)' : 'Digital Kisan Provenance Certificate'}</span>
            </h3>
          </div>
          <button className="modal-close" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Printable Receipt Paper */}
          <div className="receipt-slip">
            <div className="receipt-header-banner">
              <div className="receipt-gov-seal">
                <Sprout size={28} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {lang === 'hi' ? 'मिलीग्राम्स डिजिटल किसान प्रमाण पत्र' : 'Miligrams Digital Farmer Certificate'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {lang === 'hi' ? 'भारत सरकार समर्थित स्वायत्त ब्लॉकचेन लेजर पर प्रमाणित' : 'Cryptographically Verified on Sovereign SHA-256 Ledger'}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.74rem', fontWeight: 800 }}>
                <CheckCircle2 size={13} />
                <span>{lang === 'hi' ? 'डिजिटल रूप से सीलबंद व सत्यापित' : 'CRYPTOGRAPHICALLY SEALED'}</span>
              </div>
            </div>

            {/* Core Certificate Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem', background: 'var(--surface-alt)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'फसल का प्रकार' : 'Crop Type'}
                </span>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                  {crop.cropType}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'कुल वजन' : 'Total Quantity'}
                </span>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.15rem' }}>
                  {crop.quantity.toLocaleString()} kg ({weightQuintal} Q)
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'किसान का नाम व पहचान' : 'Farmer Identity'}
                </span>
                <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                  {crop.farmerName || 'Kisan'} ({crop.farmerId})
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'कटाई की तिथि' : 'Harvest Date'}
                </span>
                <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                  {new Date(crop.harvestDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US')}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'गुणवत्ता श्रेणी' : 'Quality Grade'}
                </span>
                <div style={{ marginTop: '0.2rem' }}>
                  <span className="badge badge-quality">{crop.qualityStatus || 'Grade A'}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'वर्तमान स्थिति' : 'Current Status'}
                </span>
                <div style={{ marginTop: '0.2rem' }}>
                  <span className="badge" style={{ background: currentStageInfo.bg, color: currentStageInfo.color, borderColor: currentStageInfo.color }}>
                    {lang === 'hi' ? currentStageInfo.hi : currentStageInfo.en}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Footprint Preview */}
            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.9rem', marginBottom: '1.25rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  Crop ID (MongoDB & Hash):
                </span>
                <span style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>{crop._id}</span>
              </div>
              {block && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Blockchain Block:
                  </span>
                  <span style={{ color: '#10b981', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                    Block #{block.index} ({block.hash.substring(0, 16)}...)
                  </span>
                </div>
              )}
            </div>

            {/* Print & Technical Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <span>{showTechnicalDetails ? (lang === 'hi' ? 'तकनीकी ब्लॉकचेन विवरण छुपाएं' : 'Hide Ledger Details') : (lang === 'hi' ? 'तकनीकी ब्लॉकचेन ब्लॉक देखें' : 'View Ledger Details')}</span>
                {showTechnicalDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-primary btn-sm"
              >
                <Printer size={15} />
                <span>{lang === 'hi' ? 'पर्ची प्रिंट करें' : 'Print Certificate'}</span>
              </button>
            </div>

            {/* Technical BlockCard Accordion */}
            {showTechnicalDetails && block && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <BlockCard block={block} highlightCropId={crop._id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
