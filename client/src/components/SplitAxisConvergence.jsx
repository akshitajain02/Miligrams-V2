import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sprout, ShieldCheck, Package, Clock, ShoppingBag, ArrowRight, Sparkles, Cpu, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SplitAxisConvergence({ lang = 'hi' }) {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(0);

  const features = [
    {
      id: 1,
      title: lang === 'hi' ? '1. आवाज आधारित AI फसल पंजीकरण' : '1. Voice-AI Crop Registration',
      subtitle: lang === 'hi' ? 'कम पढ़े-लिखे किसानों के लिए सहज' : 'High-Accessibility Speech Engine',
      desc: lang === 'hi'
        ? 'माइक पर सहज भाषा में बोलें (जैसे "500 किलो शरबती गेहूं")। AI स्वतः वजन व फसल पहचान कर डिजिटल पर्ची जारी करता है।'
        : 'Farmers speak naturally in Hindi or English. The Web Speech AI parses crop variety, quantity, and mints initial blocks.',
      icon: Sprout,
      img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop',
      route: '/farmer',
      badge: 'VOICE AI ENGINE',
      telemetry: 'SPEECH-TO-TEXT V2',
      color: '#10b981'
    },
    {
      id: 2,
      title: lang === 'hi' ? '2. SHA-256 क्रिप्टोग्राफिक लेजर' : '2. SHA-256 Cryptographic Ledger',
      subtitle: lang === 'hi' ? 'अपरिवर्तनीय डिजिटल सील' : 'Zero-Tamper Immutability',
      desc: lang === 'hi'
        ? 'मर्कल ट्री व SHA-256 हैश द्वारा प्रत्येक गतिविधि अटूट रूप से जुड़ी है। किसी भी रिकॉर्ड में 1 अक्षर का बदलाव भी तुरंत पकड़ा जाता है।'
        : 'Every crop milestone is linked to its previous hash. An altered single byte instantly invalidates the subsequent chain.',
      icon: ShieldCheck,
      img: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop',
      route: '/admin',
      badge: 'BLOCKCHAIN CORE',
      telemetry: 'SHA-256 HASH VERIFIED',
      color: '#8b5cf6'
    },
    {
      id: 3,
      title: lang === 'hi' ? '3. स्मार्ट साइलो व गोदाम आवक' : '3. Smart Warehouse Logistics',
      subtitle: lang === 'hi' ? 'नमी व साइलो क्षमता नियंत्रण' : 'Logistics & Silo Capacity',
      desc: lang === 'hi'
        ? 'खेत से गोदाम में आवक दर्ज होते ही कस्टडी ट्रांसफर ब्लॉक बनता है और साइलो क्षमता वास्तविक समय में अपडेट होती है।'
        : 'Track storage capacity in real time. Receiving farm produce mints verified custody transition blocks on chain.',
      icon: Package,
      img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
      route: '/warehouse',
      badge: 'SILO LOGISTICS',
      telemetry: 'SENSOR TELEMETRY SYNC',
      color: '#f59e0b'
    },
    {
      id: 4,
      title: lang === 'hi' ? '4. 15-दिन स्वतः पुनः सत्यापन' : '4. 15-Day Aging Re-verification',
      subtitle: lang === 'hi' ? '20% छूट व फसल सुरक्षा चक्र' : 'Automated Quality Lifecycle',
      desc: lang === 'hi'
        ? '15 दिन तक न बिकने वाली उपज पर 20% मूल्य छूट का सुझाव देकर नए ब्लॉक के साथ मंडी में तुरंत प्राथमिकता दी जाती है।'
        : 'Unsold stock triggers automated 15-day re-verification on chain, applying fair price drops before spoilage.',
      icon: Clock,
      img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800&auto=format&fit=crop',
      route: '/admin',
      badge: 'QUALITY CYCLE',
      telemetry: '15-DAY VERIFIED CADENCE',
      color: '#f43f5e'
    },
    {
      id: 5,
      title: lang === 'hi' ? '5. सीधा निष्पक्ष व्यापार मंच' : '5. Direct Fair-Trade Marketplace',
      subtitle: lang === 'hi' ? 'बिचौलिया-रहित तत्काल निपटान' : 'Instant Settlement Protocol',
      desc: lang === 'hi'
        ? 'थोक व्यापारी पूरी ब्लॉकचेन चेन देखकर उचित मूल्य पर फसल खरीदते हैं और सेटलमेंट ब्लॉक दर्ज होता है।'
        : 'Wholesale buyers audit complete seed-to-sale blockchain provenance and execute instant cryptographic settlements.',
      icon: ShoppingBag,
      img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=800&auto=format&fit=crop',
      route: '/buyer',
      badge: 'COMMODITY TRADE',
      telemetry: 'INSTANT TRADE SETTLED',
      color: '#06b6d4'
    }
  ];

  return (
    <section className="feature-showcase-section">
      <div className="feature-showcase-header">
        <span className="orbital-badge">
          <Layers size={13} />
          <span>{lang === 'hi' ? 'प्लेटफॉर्म क्षमताएं' : 'ENTERPRISE PROTOCOL SUITE'}</span>
        </span>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em', marginTop: '0.4rem' }}>
          {lang === 'hi' ? 'मिलीग्राम्स कैसे कृषि को बदल रहा है?' : 'How Miligrams Transforms Agricultural Integrity'}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.96rem', maxWidth: '640px', margin: '0.4rem auto 0', lineHeight: 1.5 }}>
          {lang === 'hi'
            ? 'खेत से लेकर मंडी तक प्रत्येक कदम पर शून्य-छेड़छाड़ ब्लॉकचेन, उचित मूल्य और किसानों की पूर्ण सुरक्षा।'
            : 'End-to-end cryptographic transparency, fair farmer pricing, and zero middleman tampering.'}
        </p>
      </div>

      {/* Interactive Feature Cards Grid */}
      <div className="feature-cards-grid">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          const isSelected = activeCard === idx;

          return (
            <motion.div
              key={feat.id}
              className={`feature-card ${isSelected ? 'active-feature' : ''}`}
              onClick={() => setActiveCard(idx)}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              style={{
                borderColor: isSelected ? feat.color : 'rgba(255, 255, 255, 0.08)',
                boxShadow: isSelected ? `0 15px 35px ${feat.color}25, 0 0 20px ${feat.color}15` : undefined
              }}
            >
              <div className="feature-card-img-wrap">
                <img src={feat.img} alt={feat.title} className="feature-card-img" />
                <span className="feature-card-badge" style={{ background: feat.color }}>
                  {feat.badge}
                </span>
              </div>

              <div className="feature-card-content">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${feat.color}20`, color: feat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${feat.color}40` }}>
                      <Icon size={19} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#ffffff' }}>{feat.title}</h3>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>{feat.subtitle}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {feat.desc}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Cpu size={12} color={feat.color} />
                      <span>{feat.telemetry}</span>
                    </span>
                    <span style={{ color: feat.color, fontWeight: 700 }}>VERIFIED</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(feat.route);
                    }}
                    className="btn btn-sm"
                    style={{
                      width: '100%',
                      background: `${feat.color}15`,
                      color: feat.color,
                      border: `1px solid ${feat.color}45`,
                      fontWeight: 700
                    }}
                  >
                    <span>{lang === 'hi' ? 'मॉड्यूल देखें' : 'Launch Module'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
