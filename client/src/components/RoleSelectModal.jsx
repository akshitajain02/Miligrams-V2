import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Building2, ShoppingBag, ShieldCheck, X, ArrowRight, Sparkles } from 'lucide-react';

export default function RoleSelectModal({ isOpen, onClose, currentRole, lang = 'hi' }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const roles = [
    {
      id: 'farmer',
      path: '/farmer',
      titleHi: 'किसान पोर्टल (Farmer)',
      descHi: 'नई फसल आवाज या टच द्वारा दर्ज करें, डिजिटल पर्ची पाएं और अपनी उपज का ट्रैक रखें।',
      titleEn: 'Farmer Voice Portal',
      descEn: 'Register crops via speech AI or touch, get digital receipts, and track lifecycle stages.',
      icon: Sprout,
      badge: 'VOICE AI ASSISTED',
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)'
    },
    {
      id: 'warehouse',
      path: '/warehouse',
      titleHi: 'गोदाम / साइलो हब (Warehouse)',
      descHi: 'खेत से आने वाली फसलों की आवक दर्ज करें और साइलो भंडारण क्षमता प्रबंधित करें।',
      titleEn: 'Smart Warehouse Silos',
      descEn: 'Receive incoming farm produce, log moisture, and manage warehouse storage capacity.',
      icon: Building2,
      badge: 'LOGISTICS & SILOS',
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)'
    },
    {
      id: 'buyer',
      path: '/buyer',
      titleHi: 'व्यापारी व मंडी (Buyer / Trader)',
      descHi: 'सत्यापित कृषि उपज की थोक खरीद करें, 15-दिन मूल्य छूट देखें और तुरंत भुगतान करें।',
      titleEn: 'Buyer Marketplace',
      descEn: 'Browse verified crops, view 15-day suggested aging discounts, and settle trades.',
      icon: ShoppingBag,
      badge: 'COMMODITY FAIR-TRADE',
      color: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.15)'
    },
    {
      id: 'admin',
      path: '/admin',
      titleHi: 'एडमिन व ब्लॉकचेन लेजर (Admin)',
      descHi: 'SHA-256 ब्लॉकचेन सत्यापन, छेड़छाड़ परीक्षण और 15-दिन वेरिफिकेशन चक्र चलाएं।',
      titleEn: 'Admin & Blockchain Explorer',
      descEn: 'Audit SHA-256 blocks, test tamper detection, and trigger aging verification cycle.',
      icon: ShieldCheck,
      badge: 'LEDGER GOVERNANCE',
      color: '#8b5cf6',
      bgGlow: 'rgba(139, 92, 246, 0.15)'
    }
  ];

  const handleSelectRole = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)', marginBottom: '0.4rem' }}>
              <Sparkles size={12} />
              <span>MILIGRAMS ENTERPRISE WORKSPACES</span>
            </span>
            <h3 style={{ fontSize: '1.45rem', marginTop: '0.2rem' }}>
              {lang === 'hi' ? 'अपनी भूमिका चुनें (Switch Workspace)' : 'Select Active Workspace'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '0.2rem' }}>
              {lang === 'hi'
                ? 'कृषि आपूर्ति श्रृंखला में अपनी भूमिका के अनुसार पैनल में प्रवेश करें:'
                : 'Choose your operating portal across the cryptographic supply chain:'}
            </p>
          </div>
          {onClose && (
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {roles.map(r => {
            const Icon = r.icon;
            const isCurrent = currentRole === r.id;

            return (
              <div
                key={r.id}
                onClick={() => handleSelectRole(r.path)}
                className="glass-panel glass-panel-glow"
                style={{
                  padding: '1.4rem',
                  cursor: 'pointer',
                  borderColor: isCurrent ? r.color : 'var(--border)',
                  background: isCurrent ? `${r.color}15` : 'rgba(16, 23, 38, 0.85)',
                  boxShadow: isCurrent ? `0 0 25px ${r.color}25` : undefined
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: r.bgGlow, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${r.color}35` }}>
                    <Icon size={22} />
                  </div>
                  <span className="badge" style={{ background: `${r.color}18`, color: r.color, borderColor: `${r.color}35` }}>
                    {r.badge}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                  {lang === 'hi' ? r.titleHi : r.titleEn}
                </h4>

                <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.15rem' }}>
                  {lang === 'hi' ? r.descHi : r.descEn}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.76rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                    {isCurrent ? '● CURRENT' : 'READY'}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: r.color, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{lang === 'hi' ? 'प्रवेश करें' : 'Launch Workspace'}</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
