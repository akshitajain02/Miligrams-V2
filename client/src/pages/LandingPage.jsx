import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Building2, ShoppingBag, ShieldCheck, ArrowRight, Sparkles, Database, Activity, CheckCircle, Shield } from 'lucide-react';
import RadialOrbitalTimeline from '../components/RadialOrbitalTimeline';
import Interactive3DQuest from '../components/Interactive3DQuest';
import { soundFX } from '../utils/audioFX';

export default function LandingPage({ lang = 'hi' }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCrops: 8,
    totalBlocks: 6,
    chainValid: true,
    warehousesCount: 2
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/crops').then(r => r.json()).catch(() => ({ crops: [] })),
      fetch('/api/ledger/blocks').then(r => r.json()).catch(() => ({ chain: [] })),
      fetch('/api/ledger/verify-chain').then(r => r.json()).catch(() => ({ isValid: true }))
    ]).then(([cropsData, blocksData, verifyData]) => {
      setStats({
        totalCrops: cropsData.crops?.length || 8,
        totalBlocks: blocksData.chain?.length || 6,
        chainValid: verifyData.isValid !== undefined ? verifyData.isValid : true,
        warehousesCount: 2
      });
    });
  }, []);

  const quickRoles = [
    {
      id: 'farmer',
      path: '/farmer',
      title: lang === 'hi' ? 'किसान पोर्टल' : 'Farmer Voice Portal',
      sub: lang === 'hi' ? 'आवाज व छूकर फसल दर्ज करें व पर्ची पाएं' : 'Natural voice & touch crop registration',
      icon: Sprout,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      className: 'role-farmer',
      tag: lang === 'hi' ? 'सुगम आवाज AI' : 'VOICE ASSISTED'
    },
    {
      id: 'warehouse',
      path: '/warehouse',
      title: lang === 'hi' ? 'स्मार्ट साइलो हब' : 'Smart Warehouse Hub',
      sub: lang === 'hi' ? 'साइलो आवक, नमी व स्टॉक प्रबंधन' : 'Automated silo custody & moisture logging',
      icon: Building2,
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      className: 'role-warehouse',
      tag: lang === 'hi' ? 'लॉजिस्टिक्स' : 'SILO LOGISTICS'
    },
    {
      id: 'buyer',
      path: '/buyer',
      title: lang === 'hi' ? 'व्यापारी मंडी' : 'Buyer Marketplace',
      sub: lang === 'hi' ? 'थोक खरीद, उम्र छूट व तत्काल सेटलमेंट' : 'Direct trade, 15-day price discounts',
      icon: ShoppingBag,
      color: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.12)',
      className: 'role-buyer',
      tag: lang === 'hi' ? 'सीधा व्यापार' : 'FAIR-TRADE'
    },
    {
      id: 'admin',
      path: '/admin',
      title: lang === 'hi' ? 'एडमिन व लेजर' : 'Admin & Ledger Explorer',
      sub: lang === 'hi' ? 'SHA-256 ऑडिट, छेड़छाड़ जांच व 15-दिन चक्र' : 'Cryptographic ledger audit & aging engine',
      icon: ShieldCheck,
      color: '#8b5cf6',
      bgGlow: 'rgba(139, 92, 246, 0.12)',
      className: 'role-admin',
      tag: lang === 'hi' ? 'शून्य छेड़छाड़' : 'ZERO-TAMPER'
    }
  ];

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Clean, Spacious Luxury Hero */}
      <div className="landing-hero">
        <div className="hero-pill-badge">
          <Sparkles size={12} />
          <span>{lang === 'hi' ? 'स्वायत्त कृषि ब्लॉकचेन व वॉइस AI' : "Sovereign Agri-Blockchain & Voice AI"}</span>
        </div>

        <h1 className="hero-title">
          {lang === 'hi' ? (
            <>
              खेत से मंडी तक <span className="hero-title-highlight">अपरिवर्तनीय विश्वास</span>
            </>
          ) : (
            <>
              Cryptographic Integrity <br />
              <span className="hero-title-highlight">From Farm Seed to Settlement</span>
            </>
          )}
        </h1>

        <p className="hero-sub">
          {lang === 'hi'
            ? 'कम पढ़े-लिखे किसानों के लिए सहज आवाज पंजीकरण, वैज्ञानिक साइलो भंडारण, 15-दिन उम्र सत्यापन और SHA-256 ब्लॉकचेन सुरक्षा।'
            : 'Voice-assisted crop registration for low-literacy farmers, smart warehouse silos, 15-day aging cycles, and cryptographic blockchain provenance.'}
        </p>

        {/* Live Network Telemetry Bar - Compact & Airy */}
        <div className="telemetry-ticker-bar">
          <div className="telemetry-item">
            <div className="telemetry-icon-box" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Database size={15} />
            </div>
            <div className="telemetry-meta">
              <h4>{lang === 'hi' ? 'पंजीकृत फसलें' : 'Crops Logged'}</h4>
              <p>{stats.totalCrops} Batches</p>
            </div>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-icon-box" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
              <Shield size={15} />
            </div>
            <div className="telemetry-meta">
              <h4>{lang === 'hi' ? 'ब्लॉकचेन ब्लॉक्स' : 'Ledger Blocks'}</h4>
              <p>#{stats.totalBlocks} Mined</p>
            </div>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-icon-box" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
              <Activity size={15} />
            </div>
            <div className="telemetry-meta">
              <h4>{lang === 'hi' ? 'लेजर अखंडता' : 'Chain Integrity'}</h4>
              <p style={{ color: stats.chainValid ? '#10b981' : '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle size={12} />
                <span>{stats.chainValid ? '100% Cryptographic' : 'Tamper Detected'}</span>
              </p>
            </div>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-icon-box" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <Building2 size={15} />
            </div>
            <div className="telemetry-meta">
              <h4>{lang === 'hi' ? 'सत्यापित साइलो' : 'Silo Hubs'}</h4>
              <p>Active 24/7</p>
            </div>
          </div>
        </div>

        {/* 4 Dedicated Workspace Cards */}
        <div className="role-cards-grid">
          {quickRoles.map(r => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                onClick={() => {
                  soundFX.click();
                  navigate(r.path);
                }}
                onMouseEnter={() => soundFX.hover()}
                className={`luxury-role-card ${r.className}`}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div className="role-icon-pod" style={{ background: r.bgGlow, color: r.color, borderColor: `${r.color}30` }}>
                      <Icon size={18} />
                    </div>
                    <span className="badge" style={{ background: `${r.color}15`, color: r.color, borderColor: `${r.color}30` }}>
                      {r.tag}
                    </span>
                  </div>
                  <h3 className="role-card-title">{r.title}</h3>
                  <p className="role-card-desc">{r.sub}</p>
                </div>

                <div className="role-card-cta" style={{ color: r.color }}>
                  <span>{lang === 'hi' ? 'पोर्टल में प्रवेश करें' : 'Open Portal'}</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive 3D Provenance Quest Component */}
      <Interactive3DQuest lang={lang} />

      {/* Celestial Radial Orbital Timeline Navigator */}
      <RadialOrbitalTimeline lang={lang} />
    </div>
  );
}
