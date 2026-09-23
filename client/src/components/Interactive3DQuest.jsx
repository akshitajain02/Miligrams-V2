import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Building2, Clock, ShoppingBag, ShieldCheck, Sparkles, CheckCircle2, RotateCcw, ArrowRight, Trophy, Zap, Volume2, VolumeX } from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function Interactive3DQuest({ lang = 'hi' }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [simulatedHash, setSimulatedHash] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [soundMuted, setSoundMuted] = useState(false);

  const questSteps = [
    {
      id: 0,
      title: lang === 'hi' ? '1. किसान खेत से कटाई' : '1. Harvest at Farm Gate',
      desc: lang === 'hi'
        ? 'किसान 500 किलो शरबती गेहूं अपनी आवाज में बोलकर दर्ज करता है। डिजिटल पर्ची सृजित होती है।'
        : 'Farmer registers 500 kg Sharbati Wheat via voice recognition. Digital Kisan Receipt is minted.',
      icon: Sprout,
      color: '#10b981',
      badge: 'PROVENANCE ORIGIN',
      actionPrompt: lang === 'hi' ? 'फसल दर्ज करें व आगे बढ़ें' : 'Harvest & Mint Step 1'
    },
    {
      id: 1,
      title: lang === 'hi' ? '2. साइलो आवक व कस्टडी' : '2. Smart Silo Ingestion',
      desc: lang === 'hi'
        ? 'गोदाम में आवक सत्यापित होती है। साइलो क्षमता और नमी का स्तर ब्लॉकचेन कस्टडी ब्लॉक में सील होता है।'
        : 'Warehouse Silo WH-CENTRAL logs produce arrival, telemetry moisture, and mints custody block.',
      icon: Building2,
      color: '#f59e0b',
      badge: 'SILO TELEMETRY',
      actionPrompt: lang === 'hi' ? 'साइलो में जमा करें व आगे बढ़ें' : 'Log Silo Arrival'
    },
    {
      id: 2,
      title: lang === 'hi' ? '3. 15-दिन स्वतः उम्र सत्यापन' : '3. 15-Day Aging Cycle',
      desc: lang === 'hi'
        ? '15 दिन बाद भी न बिकने पर इंजन स्वतः 20% मूल्य छूट लागू कर गुणवत्ता री-वेरिफिकेशन ब्लॉक जारी करता है।'
        : 'After 15 unsold days, automated engine applies 20% fair discount and mints re-verification block.',
      icon: Clock,
      color: '#f43f5e',
      badge: 'QUALITY RE-VERIFY',
      actionPrompt: lang === 'hi' ? '15-दिन चक्र चलाएं' : 'Trigger 15-Day Aging'
    },
    {
      id: 3,
      title: lang === 'hi' ? '4. थोक मंडी में सीधा व्यापार' : '4. Fair-Trade Settlement',
      desc: lang === 'hi'
        ? 'थोक खरीदार पूरी क्रिप्टोग्राफिक हिस्ट्री जांच कर ₹36/किलो की दर से ₹18,000 में खरीदता है।'
        : 'Wholesale buyer audits seed-to-sale blockchain history and executes instantaneous fair trade.',
      icon: ShoppingBag,
      color: '#06b6d4',
      badge: 'TRADE SETTLED',
      actionPrompt: lang === 'hi' ? 'मंडी में व्यापार सेटल करें' : 'Execute Instant Trade'
    },
    {
      id: 4,
      title: lang === 'hi' ? '5. अपरिवर्तनीय SHA-256 ब्लॉक' : '5. Cryptographic Block Sealed',
      desc: lang === 'hi'
        ? 'मर्कल रूट द्वारा सभी गतिविधियां शून्य-छेड़छाड़ ब्लॉकचेन में अमर हो गईं। क्वैस्ट पूर्ण!'
        : 'Merkle tree root binds the entire lifecycle into an immutable SHA-256 ledger block. Quest complete!',
      icon: ShieldCheck,
      color: '#8b5cf6',
      badge: 'GENESIS TO SETTLEMENT',
      actionPrompt: lang === 'hi' ? 'सफलतापूर्वक सील करें' : 'Seal Final Block'
    }
  ];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleNextStep = () => {
    if (currentStep < questSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      soundFX.questNext();

      // Generate a dynamic SHA-256 simulation hash
      const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setSimulatedHash(randomHex);
    } else {
      setIsCompleted(true);
      soundFX.questComplete();
    }
  };

  const handleResetQuest = () => {
    setCurrentStep(0);
    setIsCompleted(false);
    soundFX.click();
  };

  const toggleSound = () => {
    soundFX.muted = !soundFX.muted;
    setSoundMuted(soundFX.muted);
  };

  const activeStepData = questSteps[currentStep];
  const StepIcon = activeStepData.icon;

  return (
    <section className="glass-panel" style={{ padding: '2.25rem 2rem', margin: '3.5rem 0', position: 'relative', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
      {/* Background ambient radial aura */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          right: '-20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${activeStepData.color}20 0%, transparent 70%)`,
          pointerEvents: 'none',
          transition: 'background 0.5s ease'
        }}
      />

      {/* Quest Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <span className="orbital-badge">
            <Zap size={12} color="#f59e0b" />
            <span>INTERACTIVE 3D PROVENANCE QUEST</span>
          </span>
          <h2 style={{ fontSize: '1.65rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {lang === 'hi' ? '3D कृषि ब्लॉकचेन क्वेस्ट (Live Interactive Quest)' : 'Autonomous 3D Provenance Quest'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.2rem', maxWidth: '580px' }}>
            {lang === 'hi'
              ? 'प्रत्येक चरण पर क्लिक करें और देखें कि कैसे खेत की उपज वास्तविक समय में ब्लॉकचेन पर रूपांतरित होती है।'
              : 'Interactive step-by-step 3D journey simulating harvest, silo transition, 15-day aging, and ledger sealing.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={toggleSound}
            className="btn btn-secondary btn-sm"
            title={soundMuted ? 'Sound Muted' : 'Sound Active'}
          >
            {soundMuted ? <VolumeX size={14} color="#94a3b8" /> : <Volume2 size={14} color="#10b981" />}
            <span>{soundMuted ? 'Muted' : 'Audio On'}</span>
          </button>

          <button
            onClick={handleResetQuest}
            className="btn btn-secondary btn-sm"
            title="Restart Quest"
          >
            <RotateCcw size={13} />
            <span>{lang === 'hi' ? 'पुनः शुरू करें' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* 5-Step Orbital Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginBottom: '2.5rem', padding: '0 1rem' }}>
        {/* Connecting track line */}
        <div style={{ position: 'absolute', top: '50%', left: '2rem', right: '2rem', height: '3px', background: 'rgba(255, 255, 255, 0.08)', transform: 'translateY(-50%)', zIndex: 1 }}>
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6)',
              width: `${(currentStep / (questSteps.length - 1)) * 100}%`,
              transition: 'width 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>

        {questSteps.map((step, idx) => {
          const isDone = idx < currentStep || isCompleted;
          const isCurrent = idx === currentStep && !isCompleted;
          const StepIco = step.icon;

          return (
            <div
              key={step.id}
              onClick={() => {
                setCurrentStep(idx);
                soundFX.questNext();
              }}
              style={{
                position: 'relative',
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <motion.div
                whileHover={{ scale: 1.15 }}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: isCurrent ? step.color : isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 20, 34, 0.95)',
                  border: `2px solid ${isCurrent ? '#ffffff' : isDone ? '#10b981' : 'rgba(255, 255, 255, 0.15)'}`,
                  color: isCurrent ? '#ffffff' : isDone ? '#34d399' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isCurrent ? `0 0 20px ${step.color}` : undefined,
                  transition: 'all 0.3s ease'
                }}
              >
                {isDone ? <CheckCircle2 size={18} /> : <StepIco size={18} />}
              </motion.div>

              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  marginTop: '0.45rem',
                  color: isCurrent ? '#ffffff' : isDone ? '#34d399' : '#64748b',
                  fontFamily: 'var(--font-sans)',
                  whiteSpace: 'nowrap'
                }}
              >
                Stage 0{idx + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3D Tilt Card Simulation Container */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          perspective: '1000px',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <motion.div
          animate={{
            rotateY: mousePos.x,
            rotateX: mousePos.y
          }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          style={{
            width: '100%',
            maxWidth: '720px',
            background: 'rgba(11, 16, 28, 0.92)',
            border: `1.5px solid ${activeStepData.color}60`,
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: `0 25px 50px rgba(0, 0, 0, 0.7), 0 0 30px ${activeStepData.color}25`,
            backdropFilter: 'blur(20px)',
            position: 'relative'
          }}
        >
          {isCompleted ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '2px solid #10b981' }}>
                <Trophy size={32} />
              </div>
              <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                {lang === 'hi' ? 'क्वेस्ट सफल! ब्लॉकचेन लेजर 100% सीलबंद' : 'Quest Complete! Lifecycle 100% Cryptographically Sealed'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
                {lang === 'hi'
                  ? 'बीज से लेकर थोक मंडी तक प्रत्येक लेनदेन SHA-256 ब्लॉकचेन पर दर्ज हो चुका है। शून्य बिचौलिया, शून्य छेड़छाड़।'
                  : 'From farm soil to institutional trade, the crop journey is permanently engraved with zero middleman interference.'}
              </p>

              <div style={{ background: 'var(--surface-alt)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'inline-block', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>MINTED MERKLE PROOF:</span>
                <span className="font-mono" style={{ color: '#38bdf8', fontSize: '0.78rem' }}>{simulatedHash}</span>
              </div>

              <div>
                <button onClick={handleResetQuest} className="btn btn-primary btn-lg">
                  <RotateCcw size={16} />
                  <span>{lang === 'hi' ? 'नया सिमुलेशन शुरू करें' : 'Launch Another Quest'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: `${activeStepData.color}20`, color: activeStepData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${activeStepData.color}40` }}>
                    <StepIcon size={24} />
                  </div>
                  <div>
                    <span className="badge" style={{ background: `${activeStepData.color}15`, color: activeStepData.color, borderColor: `${activeStepData.color}35` }}>
                      {activeStepData.badge}
                    </span>
                    <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)', margin: '0.2rem 0 0' }}>
                      {activeStepData.title}
                    </h3>
                  </div>
                </div>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-light)', background: 'var(--surface-alt)', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                  Step {currentStep + 1} / {questSteps.length}
                </span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                {activeStepData.desc}
              </p>

              {/* Dynamic Hash Stream Bar */}
              <div style={{ background: 'var(--surface-alt)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase' }}>
                  SHA-256 State Hash:
                </span>
                <span className="font-mono" style={{ color: '#38bdf8', fontSize: '0.74rem' }}>
                  {simulatedHash.substring(0, 32)}...
                </span>
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleNextStep}
                  className="btn btn-primary"
                  style={{ background: activeStepData.color, borderColor: 'transparent', fontWeight: 800, minWidth: '180px' }}
                >
                  <span>{activeStepData.actionPrompt}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
