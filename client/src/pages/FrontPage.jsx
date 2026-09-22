import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, Building2, ShoppingBag, ShieldCheck, ArrowRight, 
  Sparkles, CheckCircle2, Star, Mic, Shield, Award, 
  Clock, Truck, Users, Layers, ChevronRight, Globe, Sun, Moon,
  HeartHandshake, Compass, Leaf
} from 'lucide-react';
import PhotoCards3D from '../components/PhotoCards3D';
import NatureBackground from '../components/NatureBackground';
import { soundFX } from '../utils/audioFX';

export default function FrontPage({ lang = 'hi', setLang, theme = 'dark', toggleTheme }) {
  const navigate = useNavigate();

  const handleTryMiligrams = () => {
    soundFX.click();
    navigate('/login');
  };

  const supplyChainNodes = [
    {
      id: 'farm',
      icon: Sprout,
      titleHi: 'खेत (Farm)',
      titleEn: 'Farm Source',
      subHi: 'आवाज AI फसल पंजीकरण व डिजिटल पर्ची',
      subEn: 'Voice AI harvest logging & Kisan receipt',
      color: '#10b981'
    },
    {
      id: 'transport',
      icon: Truck,
      titleHi: 'परिवहन (Transport)',
      titleEn: 'Cold-Chain Transit',
      subHi: 'जीपीएस व तापमान निगरानी पारगमन',
      subEn: 'GPS tracked farm-to-silo transit dispatch',
      color: '#38bdf8'
    },
    {
      id: 'storage',
      icon: Building2,
      titleHi: 'भंडारण (Storage)',
      titleEn: 'Smart Silo Storage',
      subHi: '20,000 क्विंटल क्षमता व <12% नमी सेंसर',
      subEn: '20k quintal silos & digital moisture audit',
      color: '#f59e0b'
    },
    {
      id: 'market',
      icon: ShoppingBag,
      titleHi: 'मंडी (Market)',
      titleEn: 'Fair-Trade Market',
      subHi: '15-दिन एजिंग छूट व सीधी थोक खरीद',
      subEn: '15-day aging discounts & fair procurement',
      color: '#06b6d4'
    },
    {
      id: 'consumer',
      icon: Users,
      titleHi: 'उपभोक्ता (Consumer)',
      titleEn: 'Consumer Trust',
      subHi: 'क्यूआर कोड से किसान की प्रामाणिकता जांच',
      subEn: 'Farm-to-fork origin and purity trace',
      color: '#a855f7'
    },
    {
      id: 'traceable',
      icon: ShieldCheck,
      titleHi: 'सत्यापित (Traceable)',
      titleEn: 'Safe & Sustainable',
      subHi: 'क्रिप्टोग्राफिक SHA-256 ब्लॉकचेन मुहर',
      subEn: 'Zero-waste mathematical trust ledger',
      color: '#22c55e'
    }
  ];

  const portalCards = [
    {
      role: 'farmer',
      icon: Sprout,
      color: '#10b981',
      badgeHi: 'सुगम आवाज AI',
      badgeEn: 'VOICE AI ACCESS',
      titleHi: 'किसान पोर्टल (Farmer)',
      titleEn: 'Farmer Voice Portal',
      descHi: 'कम पढ़े-लिखे किसानों के लिए आवाज से फसल दर्ज करने की सुविधा, कानूनी किसान पर्ची, और एग्रीस्टैक KYC सत्यापन।',
      descEn: 'Voice-driven crop logging for low-literacy farmers, digital Kisan receipts, and official AgriStack verification.',
      path: '/farmer'
    },
    {
      role: 'warehouse',
      icon: Building2,
      color: '#f59e0b',
      badgeHi: 'स्मार्ट भंडारण',
      badgeEn: 'SILO LOGISTICS',
      titleHi: 'गोदाम / साइलो हब (Warehouse)',
      titleEn: 'Smart Silo Warehouse',
      descHi: '20,000 क्विंटल क्षमता, स्वचालित नमी सेंसर (<12%), और वैज्ञानिक कोल्ड/ड्राई स्टोरेज से शून्य बर्बादी।',
      descEn: 'Manage 20,000 quintal silos with digital moisture sensors (<12%) and segregated climate-controlled storage.',
      path: '/warehouse'
    },
    {
      role: 'buyer',
      icon: ShoppingBag,
      color: '#06b6d4',
      badgeHi: 'थोक मंडी',
      badgeEn: 'FAIR-TRADE MARKET',
      titleHi: 'व्यापारी मंडी (Buyer)',
      titleEn: 'Commodity Buyer Market',
      descHi: 'बिचौलिया-मुक्त 100% सत्यापित लॉट, 15-दिन शेल्फ-लाइफ मूल्य छूट, और पारदर्शी किसान समीक्षा प्रणाली।',
      descEn: 'Direct procurement from verified growers, 15-day progressive aging discounts, and community farmer ratings.',
      path: '/buyer'
    },
    {
      role: 'admin',
      icon: ShieldCheck,
      color: '#8b5cf6',
      badgeHi: 'लेजर प्रशासन',
      badgeEn: 'LEDGER GOVERNANCE',
      titleHi: 'सिस्टम एडमिन (Admin & Ledger)',
      titleEn: 'Cryptographic Admin Ledger',
      descHi: 'जेनेसिस ब्लॉक से जुड़ी SHA-256 श्रृंखला, किसान KYC अनुमोदन, 15-दिन सिमुलेटर, और छेड़छाड़ पहचान परीक्षण।',
      descEn: 'Immutable SHA-256 ledger explorer, farmer KYC verification desk, 15-day aging simulation, and zero-trust audit.',
      path: '/admin'
    }
  ];

  const testimonials = [
    {
      id: 1,
      nameHi: 'सरदार गुरप्रीत सिंह',
      nameEn: 'Sardar Gurpreet Singh',
      roleHi: 'शरबती गेहूं व धान किसान, समराला (पंजाब)',
      roleEn: 'Wheat & Paddy Farmer, Ludhiana (Punjab)',
      quoteHi: 'मुझे पढ़ना-लिखना नहीं आता था, लेकिन मिलीग्राम्स में बस माइक दबाकर "500 किलो गेहूं" बोला और तुरंत पक्की पर्ची बन गई! मंडी में आढ़तियों की मनमानी और कम तौल से हमेशा के लिए आजादी मिल गई।',
      quoteEn: 'I cannot read or write, but with MiliGrams I just tapped the mic and said "500 kg Wheat", and my official receipt was ready! No more cheating by local middlemen or arbitrary price deductions.',
      rating: 5,
      avatarBg: '#10b981',
      badgeHi: 'एग्रीस्टैक सत्यापित किसान',
      badgeEn: 'AgriStack Verified Farmer'
    },
    {
      id: 2,
      nameHi: 'विपिन सचदेवा',
      nameEn: 'Vipin Sachdeva',
      roleHi: 'हब प्रबंधक, सेंट्रल साइलो करनाल (हरियाणा)',
      roleEn: 'Hub Operations Manager, Karnal Silos (Haryana)',
      quoteHi: '20,000 क्विंटल अनाज के भंडारण में नमी और 15-दिन की शेल्फ लाइफ ट्रैक करना पहले सिरदर्द था। अब ऑटोमेटेड मॉइश्चर सेंसर और लेजर से एक दाना भी खराब नहीं होता और समय पर मंडी डिस्पैच हो जाता है।',
      quoteEn: 'Managing moisture levels and 15-day shelf life across 20,000 quintals used to be a logistics nightmare. Now our automated sensor ledger ensures zero grain rot and optimized warehouse turnaround.',
      rating: 5,
      avatarBg: '#f59e0b',
      badgeHi: 'साइलो लॉजिस्टिक्स हेड',
      badgeEn: 'Silo Logistics Head'
    },
    {
      id: 3,
      nameHi: 'अमित सिंघानिया',
      nameEn: 'Amit Singhania',
      roleHi: 'थोक अनाज निर्यातक, दिल्ली ग्रेन्स प्राइवेट लिमिटेड',
      roleEn: 'Managing Director, Delhi Grains Export Ltd.',
      quoteHi: 'एग्रीस्टैक-सत्यापित किसानों से सीधे 15-दिन डिस्काउंट में प्रीमियम बासमती और शरबती गेहूं खरीदना मेरे व्यापार का सबसे भरोसेमंद फैसला रहा। हर लॉट का ब्लॉकचेन इतिहास मुझे और मेरे ग्राहकों को संतुष्ट रखता है।',
      quoteEn: 'Procuring verified basmati and wheat with 15-day fair-trade discounts directly from growers transformed our export margins. The cryptographic origin hash gives our global buyers complete confidence.',
      rating: 5,
      avatarBg: '#06b6d4',
      badgeHi: 'थोक कमोडिटी खरीदार',
      badgeEn: 'Verified Commodity Buyer'
    },
    {
      id: 4,
      nameHi: 'डॉ. मीनाक्षी अय्यर',
      nameEn: 'Dr. Meenakshi Iyer',
      roleHi: 'कृषि अर्थशास्त्री व लेजर ऑडिटर, राज्य कृषि निदेशालय',
      roleEn: 'Agricultural Economist & Ledger Auditor, State Agri Dept.',
      quoteHi: 'मिलीग्राम्स का गणितीय SHA-256 लेजर और 15-दिन एजिंग चक्र भारत के कृषि सुधारों का भविष्य है। बिचौलियों का अनुचित कमीशन खत्म होकर पूरा पैसा सीधे किसान की जेब में पहुंच रहा है।',
      quoteEn: 'The mathematical transparency of MiliGrams’ SHA-256 ledger combined with 15-day aging cycles sets a gold standard for agricultural governance. Direct farmer empowerment in its purest form.',
      rating: 5,
      avatarBg: '#8b5cf6',
      badgeHi: 'राज्य कृषि ऑडिटर',
      badgeEn: 'State Agricultural Auditor'
    }
  ];

  return (
    <div className="front-page-container">
      {/* Animated Nature Atmosphere in Background */}
      <NatureBackground />

      {/* Nature Top Navigation Bar */}
      <header className="front-navbar">
        <div className="front-navbar-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="front-brand-icon">
            <Sprout size={24} />
          </div>
          <div>
            <span className="front-brand-title">MiliGrams</span>
            <span className="front-brand-sub">Agri-Blockchain v2.0</span>
          </div>
        </div>

        {/* Quick Nav Anchors */}
        <nav className="front-nav-links">
          <a href="#ecosystem" className="front-nav-link">
            {lang === 'hi' ? 'आपूर्ति श्रृंखला' : 'Supply Chain'}
          </a>
          <a href="#portals" className="front-nav-link">
            {lang === 'hi' ? '4 कार्यक्षेत्र' : 'Portals'}
          </a>
          <a href="#testimonials" className="front-nav-link">
            {lang === 'hi' ? 'उपयोगकर्ताओं की राय' : 'Reviews'}
          </a>
        </nav>

        {/* Action Controls: Lang Toggle, Theme Toggle & Try Miligrams */}
        <div className="front-navbar-actions">
          {/* Language Switch */}
          <button
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            className="btn btn-secondary btn-sm front-lang-btn"
            title="Switch Language"
          >
            <Globe size={14} />
            <span>{lang === 'hi' ? 'English' : 'हिन्दी'}</span>
          </button>

          {/* Theme Toggle */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              title="Toggle Theme"
              style={{ padding: '0.4rem 0.65rem' }}
            >
              {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#60a5fa" />}
            </button>
          )}

          {/* Try MiliGrams CTA */}
          <button
            onClick={handleTryMiligrams}
            className="btn btn-primary front-cta-btn"
          >
            <span>{lang === 'hi' ? 'लॉगिन करें' : 'Sign In'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Main Hero Section with 3D Perspective Card (ContainerScroll) */}
      {/* Main Hero Section with Compact 3D Photo Cards */}
      <main className="front-main-content">
        <section className="front-hero-section">
          <div className="front-hero-header">
            <div className="nature-badge-pill">
              <Leaf size={14} className="leaf-pulse-icon" />
              <span>
                {lang === 'hi' 
                  ? 'भारत की पहली प्रकृति-आधारित कृषि ब्लॉकचेन • BHARAT AGRI-LEDGER'
                  : 'BHARAT\'S NATURE-POWERED AGRI-BLOCKCHAIN ECOSYSTEM'}
              </span>
            </div>

            <h1 className="front-hero-title">
              {lang === 'hi' ? (
                <>
                  खेत से थाली तक, हर दाने का <br />
                  <span className="front-title-gradient">सच्चा व सुरक्षित हिसाब</span>
                </>
              ) : (
                <>
                  From Soil to Settlement: <br />
                  <span className="front-title-gradient">100% Traceable Agri-Blockchain</span>
                </>
              )}
            </h1>

            <p className="front-hero-description">
              {lang === 'hi'
                ? 'असाक्षर किसानों के लिए आवाज आधारित AI, 20,000 क्विंटल आधुनिक साइलो, 15-दिवसीय शेल्फ-लाइफ मूल्य सुरक्षा, और छेड़छाड़-रोधी SHA-256 क्रिप्टोग्राफिक लेजर।'
                : 'Empowering low-literacy farmers with voice-AI intake, 20,000 quintal climate silos, 15-day fair-trade aging, and mathematical zero-trust transparency.'}
            </p>

            <div className="front-hero-cta-group">
              <button
                onClick={handleTryMiligrams}
                className="btn btn-primary btn-lg front-hero-primary-btn"
              >
                <Sparkles size={18} />
                <span>{lang === 'hi' ? 'मिलीग्राम्स आज़माएँ (Try MiliGrams)' : 'Try MiliGrams Now'}</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => navigate('/overview')}
                className="btn btn-secondary btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Compass size={17} />
                <span>{lang === 'hi' ? '3D इकोसिस्टम एक्सप्लोरर' : 'Explore 3D Ecosystem'}</span>
              </button>
            </div>
          </div>

          {/* Compact 3D Photo Cards - Space-efficient & interactive */}
          <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
            <PhotoCards3D lang={lang} />
          </div>
        </section>

        {/* Section 2: Supply Chain Nodes Breakdown */}
        <section id="ecosystem" className="front-section">
          <div className="front-section-header">
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <HeartHandshake size={13} />
              <span>{lang === 'hi' ? 'संपूर्ण आपूर्ति श्रृंखला' : 'INTEGRATED SUPPLY CHAIN'}</span>
            </span>
            <h2 className="front-section-title">
              {lang === 'hi' ? 'पारदर्शिता के 6 स्तंभ' : '6 Pillars of Farm-to-Fork Traceability'}
            </h2>
            <p className="front-section-sub">
              {lang === 'hi'
                ? 'बीज बोने से लेकर अंतिम उपभोक्ता की थाली तक, प्रत्येक चरण पर प्रामाणिक डिजिटल मुहर।'
                : 'From sowing and harvest to end consumers, every step is mathematically recorded and tamper-proof.'}
            </p>
          </div>

          <div className="front-nodes-grid">
            {supplyChainNodes.map((node) => {
              const Icon = node.icon;
              return (
                <div key={node.id} className="front-node-card glass-panel">
                  <div 
                    className="front-node-icon-wrap"
                    style={{ background: `${node.color}18`, color: node.color, borderColor: `${node.color}35` }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="front-node-card-title">
                    {lang === 'hi' ? node.titleHi : node.titleEn}
                  </h3>
                  <p className="front-node-card-desc">
                    {lang === 'hi' ? node.subHi : node.subEn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Visual Architecture Diagram from User Blueprint */}
          <div className="front-architecture-banner glass-panel" style={{ marginTop: '2.5rem', padding: '1.5rem', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={20} color="#34d399" />
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                  {lang === 'hi' ? 'प्रणाली स्थापत्य व लेजर सुरक्षा ढांचा' : 'System Architecture & Cryptographic Trust Blueprint'}
                </span>
              </div>
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)', fontSize: '0.72rem' }}>
                SHA-256 Validated Node Network
              </span>
            </div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', background: '#0a0f1d' }}>
              <img 
                src="/miligrams-ui-architecture.jpg" 
                alt="MiliGrams UI Architecture Diagram" 
                style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
              />
            </div>
          </div>
        </section>

        {/* Section 3: The 4 Portals (Step 3 Preview) */}
        <section id="portals" className="front-section">
          <div className="front-section-header">
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
              <Layers size={13} />
              <span>{lang === 'hi' ? 'समर्पित कार्यक्षेत्र' : '4 DEDICATED ROLES'}</span>
            </span>
            <h2 className="front-section-title">
              {lang === 'hi' ? 'हर हितधारक के लिए अलग पोर्टल' : 'Tailored Portals for Every Actor'}
            </h2>
            <p className="front-section-sub">
              {lang === 'hi'
                ? 'किसान, गोदाम प्रबंधक, थोक व्यापारी और सरकारी ऑडिटर — सभी के लिए सुगम और सुरक्षित इंटरफेस।'
                : 'Farmers, warehouse operators, grain traders, and state regulators each enjoy a purpose-built workspace.'}
            </p>
          </div>

          <div className="front-portals-grid">
            {portalCards.map((p) => {
              const Icon = p.icon;
              return (
                <div 
                  key={p.role} 
                  className="front-portal-card glass-panel"
                  style={{ borderTop: `4px solid ${p.color}` }}
                  onClick={handleTryMiligrams}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div 
                      style={{ 
                        width: '46px', 
                        height: '46px', 
                        borderRadius: '12px', 
                        background: `${p.color}20`, 
                        color: p.color, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: `1px solid ${p.color}40`
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="badge" style={{ background: `${p.color}15`, color: p.color, borderColor: `${p.color}35` }}>
                      {lang === 'hi' ? p.badgeHi : p.badgeEn}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.22rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
                    {lang === 'hi' ? p.titleHi : p.titleEn}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                    {lang === 'hi' ? p.descHi : p.descEn}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700 }}>
                      {lang === 'hi' ? 'लॉगिन कर देखें' : 'Sign in to access'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: p.color, fontWeight: 800, fontSize: '0.84rem' }}>
                      <span>{lang === 'hi' ? 'प्रवेश करें' : 'Open'}</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4: What Our Users Say (Testimonials) */}
        <section id="testimonials" className="front-section">
          <div className="front-section-header">
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              <Star size={13} />
              <span>{lang === 'hi' ? 'विश्वसनीयता व अनुभव' : 'USER REVIEWS & TESTIMONIALS'}</span>
            </span>
            <h2 className="front-section-title">
              {lang === 'hi' ? 'हमारे उपयोगकर्ताओं की जुबानी' : 'What Our Community Says'}
            </h2>
            <p className="front-section-sub">
              {lang === 'hi'
                ? 'पंजाब के खेतों से लेकर दिल्ली की मंडियों और सरकारी ऑडिटरों तक का सच्चा अनुभव।'
                : 'Real perspectives from grassroots farmers, silo operators, grain traders, and agricultural auditors.'}
            </p>
          </div>

          <div className="front-testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.id} className="front-testimonial-card glass-panel">
                {/* Rating Stars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.85rem' }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={15} fill="#fbbf24" color="#fbbf24" />
                  ))}
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', marginLeft: '0.35rem' }}>
                    5.0 / 5.0
                  </span>
                </div>

                {/* Quote Text */}
                <p className="front-testimonial-quote">
                  "{lang === 'hi' ? t.quoteHi : t.quoteEn}"
                </p>

                {/* Author Info */}
                <div className="front-testimonial-author">
                  <div 
                    className="front-testimonial-avatar"
                    style={{ background: t.avatarBg }}
                  >
                    {(lang === 'hi' ? t.nameHi : t.nameEn).charAt(0)}
                  </div>
                  <div>
                    <h4 className="front-testimonial-name">
                      {lang === 'hi' ? t.nameHi : t.nameEn}
                    </h4>
                    <p className="front-testimonial-role">
                      {lang === 'hi' ? t.roleHi : t.roleEn}
                    </p>
                    <span className="badge" style={{ fontSize: '0.66rem', padding: '0.15rem 0.45rem', marginTop: '0.25rem' }}>
                      <CheckCircle2 size={10} color="#34d399" />
                      <span>{lang === 'hi' ? t.badgeHi : t.badgeEn}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Grand Bottom CTA (Step 1 -> Step 2 Gate) */}
        <section className="front-bottom-cta-section">
          <div className="front-bottom-cta-card glass-panel glass-panel-glow">
            <div className="front-cta-glow-circle" />
            
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', marginBottom: '1rem' }}>
              <Sparkles size={14} />
              <span>{lang === 'hi' ? '3-चरणीय सुगम यात्रा' : 'STEP 1 COMPLETE • ENTER PLATFORM'}</span>
            </span>

            <h2 className="front-bottom-cta-title">
              {lang === 'hi' ? 'कृषि में नई क्रांति का हिस्सा बनें' : 'Ready to Experience Fair Agri-Trade?'}
            </h2>

            <p className="front-bottom-cta-sub">
              {lang === 'hi'
                ? 'अभी "Try MiliGrams" पर क्लिक करें, अपनी भूमिका चुनें और आधुनिक ब्लॉकचेन पोर्टल का लाइव प्रोटोटाइप आज़माएँ।'
                : 'Click below to enter the Role Gateway, pick your persona, and experience the full interactive prototype with guided tutorials.'}
            </p>

            <button
              onClick={handleTryMiligrams}
              className="btn btn-primary btn-lg front-cta-pulse-btn"
            >
              <Sprout size={20} />
              <span style={{ fontSize: '1.08rem', fontWeight: 800 }}>
                {lang === 'hi' ? 'मिलीग्राम्स आज़माएँ (Try MiliGrams)' : 'Try MiliGrams Now'}
              </span>
              <ArrowRight size={20} />
            </button>

            <div className="front-cta-footer-tags">
              <span>✓ {lang === 'hi' ? 'आवाज से फसल पंजीकरण' : 'Voice AI Logging'}</span>
              <span>✓ {lang === 'hi' ? '20,000 क्विंटल साइलो' : 'Smart Silos'}</span>
              <span>✓ {lang === 'hi' ? '15-दिन मूल्य सुरक्षा' : '15-Day Aging Engine'}</span>
              <span>✓ {lang === 'hi' ? 'SHA-256 ब्लॉकचेन' : 'Cryptographic Ledger'}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Nature Footer */}
      <footer className="front-footer">
        <div className="front-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="front-brand-icon" style={{ width: '32px', height: '32px' }}>
              <Sprout size={18} />
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>MiliGrams</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                Agri-Blockchain v2.0
              </span>
            </div>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            {lang === 'hi' 
              ? 'भारतीय किसानों और व्यापारियों के लिए निष्पक्ष, सुरक्षित व पारदर्शी बहीखाता।' 
              : 'Empowering Indian Agriculture with Cryptographic Transparency & Voice AI.'}
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem' }}>
            <button onClick={handleTryMiligrams} className="btn-link" style={{ color: '#34d399', fontWeight: 700 }}>
              {lang === 'hi' ? 'लॉगिन / भूमिका चुनें' : 'Sign In / Roles'}
            </button>
            <button onClick={() => navigate('/overview')} className="btn-link" style={{ color: 'var(--text-light)' }}>
              {lang === 'hi' ? '3D ओवरव्यू' : '3D Overview'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
