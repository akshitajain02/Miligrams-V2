import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Package, Clock, ShoppingBag, ShieldCheck, ArrowRight, Zap, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RadialOrbitalTimeline({ lang = 'hi' }) {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState({});
  const [activeNodeId, setActiveNodeId] = useState(null);

  const containerRef = useRef(null);
  const orbitRef = useRef(null);
  const nodeRefs = useRef({});

  // 5 Core Miligrams Architecture Milestones
  const timelineData = [
    {
      id: 1,
      title: lang === 'hi' ? 'किसान व वॉइस AI' : 'Farmer & Voice AI',
      category: lang === 'hi' ? 'उत्पत्ति (Origin)' : 'Origin & Touch',
      date: 'Milestone 01',
      content: lang === 'hi'
        ? 'कम पढ़े-लिखे किसान आवाज (हिंदी/अंग्रेजी) या टच द्वारा तुरंत फसल दर्ज करते हैं और क्रिप्टोग्राफिक डिजिटल पर्ची पाते हैं।'
        : 'Farmers register crops using natural voice recognition in Hindi or English, receiving instant cryptographic receipts.',
      icon: Sprout,
      route: '/farmer',
      badgeText: lang === 'hi' ? 'किसान पोर्टल' : 'Farmer Portal',
      relatedIds: [2, 5],
      status: 'completed',
      energy: 98,
      accentColor: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.4)'
    },
    {
      id: 2,
      title: lang === 'hi' ? 'स्मार्ट साइलो व गोदाम' : 'Smart Warehouse Silos',
      category: lang === 'hi' ? 'लॉजिस्टिक्स' : 'Logistics & Silo Sync',
      date: 'Milestone 02',
      content: lang === 'hi'
        ? 'खेत से गोदाम तक आवक का डिजिटल सत्यापन। साइलो भंडारण क्षमता व तापमान नियंत्रण ब्लॉकचेन पर सील होता है।'
        : 'Crops transition to intermediate storage silos with automated moisture logging and blockchain transition blocks.',
      icon: Package,
      route: '/warehouse',
      badgeText: lang === 'hi' ? 'गोदाम पैनल' : 'Warehouse Hub',
      relatedIds: [1, 3],
      status: 'completed',
      energy: 88,
      accentColor: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.4)'
    },
    {
      id: 3,
      title: lang === 'hi' ? '15-दिन उम्र सत्यापन' : '15-Day Aging Re-verification',
      category: lang === 'hi' ? 'गुणवत्ता चक्र' : 'Quality Assurance',
      date: 'Milestone 03',
      content: lang === 'hi'
        ? '15 दिन तक न बिकने वाली उपज पर 20% न्यायसंगत छूट व पुनः सत्यापन ब्लॉक मिंट कर मंडी में वरीयता दी जाती है।'
        : 'Unsold stock triggers automated 15-day re-verification, applying 20% fair price drops and on-chain verification.',
      icon: Clock,
      route: '/admin',
      badgeText: lang === 'hi' ? 'एजिंग इंजन' : 'Aging Engine',
      relatedIds: [2, 4],
      status: 'in-progress',
      energy: 82,
      accentColor: '#f43f5e',
      bgGlow: 'rgba(244, 63, 94, 0.4)'
    },
    {
      id: 4,
      title: lang === 'hi' ? 'थोक व्यापारी मंडी' : 'Buyer Fair-Trade Market',
      category: lang === 'hi' ? 'वाणिज्य' : 'Instant Settlement',
      date: 'Milestone 04',
      content: lang === 'hi'
        ? 'थोक खरीदार पूरी क्रिप्टोग्राफिक चेन व उम्र छूट देखकर बिना बिचौलियों के सीधे फसल खरीदते और सेटल करते हैं।'
        : 'Wholesale buyers audit complete seed-to-sale blockchain provenance, apply fair aging discounts, and settle trades.',
      icon: ShoppingBag,
      route: '/buyer',
      badgeText: lang === 'hi' ? 'व्यापारी मंडी' : 'Buyer Market',
      relatedIds: [3, 5],
      status: 'completed',
      energy: 92,
      accentColor: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.4)'
    },
    {
      id: 5,
      title: lang === 'hi' ? 'SHA-256 ब्लॉकचेन लेजर' : 'SHA-256 Ledger Core',
      category: lang === 'hi' ? 'अपरिवर्तनीय सुरक्षा' : 'Security Base',
      date: 'Milestone 05',
      content: lang === 'hi'
        ? 'मर्कल रूट व SHA-256 हैशिंग द्वारा शून्य-छेड़छाड़ सुरक्षा। एक अक्षर का परिवर्तन भी पूरी चेन को अवैध कर देता है।'
        : 'Zero-tamper cryptographic foundation linking every agricultural milestone via SHA-256 previousHash chaining.',
      icon: ShieldCheck,
      route: '/admin',
      badgeText: lang === 'hi' ? 'लेजर ऑडिट' : 'Ledger Audit',
      relatedIds: [1, 4],
      status: 'completed',
      energy: 100,
      accentColor: '#8b5cf6',
      bgGlow: 'rgba(139, 92, 246, 0.4)'
    }
  ];

  const handleContainerClick = (e) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id) => {
    setExpandedItems((prev) => {
      const newState = {};
      Object.keys(prev).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const currentItem = timelineData.find((item) => item.id === id);
        const related = currentItem ? currentItem.relatedIds : [];
        const newPulse = {};
        related.forEach((relId) => {
          newPulse[relId] = true;
        });
        setPulseEffect(newPulse);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer;
    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => (prev + 0.22) % 360);
      }, 40);
    }
    return () => {
      if (rotationTimer) clearInterval(rotationTimer);
    };
  }, [autoRotate]);

  const centerViewOnNode = (nodeId) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    if (nodeIndex === -1) return;
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 185;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.75, Math.min(1, 0.75 + 0.25 * ((1 + Math.sin(radian)) / 2)));

    return { x, y, angle, zIndex, opacity };
  };

  return (
    <div
      className="orbital-container"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      {/* Orbital Header Bar */}
      <div className="orbital-header">
        <div>
          <span className="orbital-badge">
            <Sparkles size={13} />
            <span>MILIGRAMS CORE ARCHITECTURE</span>
          </span>
          <h3 className="orbital-title">
            {lang === 'hi' ? 'इकोसिस्टम नोड नेविगेटर' : 'Autonomous Ecosystem Navigator'}
          </h3>
          <p className="orbital-sub">
            {lang === 'hi'
              ? 'आपूर्ति श्रृंखला के 5 संप्रभु नोड्स — किसी भी नोड पर क्लिक कर विवरण देखें या संबंधित पोर्टल में सीधे प्रवेश करें'
              : '5 cryptographic milestones connecting harvest, silo logistics, aging cycles, and fair-trade settlement.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.76rem', background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)' }}
          >
            <RefreshCw size={13} className={autoRotate ? 'spin-slow' : ''} color={autoRotate ? '#10b981' : '#94a3b8'} />
            <span>
              {autoRotate
                ? (lang === 'hi' ? 'ऑर्बिट रोकें' : 'Pause Orbit')
                : (lang === 'hi' ? 'ऑर्बिट शुरू करें' : 'Resume Orbit')}
            </span>
          </button>
        </div>
      </div>

      {/* Orbit Visualization Stage */}
      <div className="orbital-stage-wrapper">
        <div className="orbital-stage" ref={orbitRef}>
          {/* Central Pulsing Sun/Core */}
          <div className="orbital-center-core">
            <div className="orbital-ping-1"></div>
            <div className="orbital-ping-2"></div>
            <div className="orbital-center-dot">
              <Sprout size={32} color="#ffffff" />
            </div>
          </div>

          {/* Orbit Circular Tracks */}
          <div className="orbital-track"></div>
          <div className="orbital-track-inner"></div>

          {/* Orbital Satellite Nodes */}
          {timelineData.map((item, index) => {
            const pos = calculateNodePosition(index, timelineData.length);
            const isExpanded = !!expandedItems[item.id];
            const isRelated = activeNodeId ? item.relatedIds?.includes(activeNodeId) : false;
            const isPulsing = !!pulseEffect[item.id];
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                ref={(el) => (nodeRefs.current[item.id] = el)}
                className={`orbital-node ${isExpanded ? 'expanded' : ''}`}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  zIndex: isExpanded ? 300 : pos.zIndex,
                  opacity: isExpanded ? 1 : pos.opacity
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Glow ring */}
                <div
                  className="orbital-node-glow"
                  style={{
                    background: item.bgGlow,
                    animation: isPulsing ? 'pulse 1.2s infinite' : 'none'
                  }}
                ></div>

                {/* Node Icon Circle */}
                <div
                  className={`orbital-node-circle ${isExpanded ? 'active' : isRelated ? 'related' : ''}`}
                  style={{
                    borderColor: isExpanded ? '#ffffff' : item.accentColor,
                    color: isExpanded ? '#ffffff' : item.accentColor,
                    background: isExpanded ? item.accentColor : 'rgba(14, 20, 34, 0.95)',
                    boxShadow: isExpanded ? `0 0 25px ${item.accentColor}` : undefined
                  }}
                >
                  <Icon size={22} />
                </div>

                {/* Node Label Below */}
                <div className="orbital-node-label" style={{ borderLeft: `3px solid ${item.accentColor}` }}>
                  {item.title}
                </div>

                {/* Interactive Card Popup when node is clicked */}
                {isExpanded && (
                  <div
                    className="orbital-card-popup"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="orbital-popup-header">
                      <span
                        className="badge"
                        style={{
                          background: `${item.accentColor}18`,
                          color: item.accentColor,
                          borderColor: `${item.accentColor}40`
                        }}
                      >
                        {item.badgeText}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                        {item.date}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0.55rem 0 0.35rem' }}>
                      {item.title}
                    </h4>

                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
                      {item.content}
                    </p>

                    {/* Energy Meter */}
                    <div style={{ marginBottom: '1rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.35rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Zap size={12} color="#f59e0b" />
                          <span>{lang === 'hi' ? 'नोड ऊर्जा व अखंडता' : 'Node Energy & Integrity'}</span>
                        </span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ffffff' }}>{item.energy}%</span>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.08)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${item.energy}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${item.accentColor}, #34d399)`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Direct Portal CTA */}
                    <button
                      onClick={() => navigate(item.route)}
                      className="btn btn-sm btn-primary"
                      style={{ width: '100%', fontWeight: 700, fontSize: '0.82rem', background: item.accentColor, border: 'none' }}
                    >
                      <span>{lang === 'hi' ? 'पोर्टल में प्रवेश करें' : 'Launch Module'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
