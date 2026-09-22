import React, { useState, useEffect } from 'react';
import { 
  Volume2, VolumeX, X, Sparkles, Mic, FileText, 
  ShieldCheck, HelpCircle, ChevronRight, MessageCircle, RefreshCw 
} from 'lucide-react';
import { speakText } from '../utils/speechUtils';
import { soundFX } from '../utils/audioFX';

export default function FarmerMascot({ lang = 'hi' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const tips = [
    {
      id: 'voice',
      icon: Mic,
      titleHi: 'माइक दबाकर बोलें',
      titleEn: 'Speak Naturally via Mic',
      textHi: 'किसान भाई, आपको टाइप करने की जरूरत नहीं है! "माइक से बोलें" बटन दबाकर अपनी आवाज में बोलें — जैसे "500 किलो शरबती गेहूं"। सिस्टम खुद ही फसल का नाम और वजन लिख लेगा।',
      textEn: 'No need to type! Just tap the microphone button and speak in Hindi or English (e.g., "500 kg Sharbati Wheat"). Our AI automatically registers the crop.',
      badgeHi: 'आवाज AI',
      badgeEn: 'Voice AI'
    },
    {
      id: 'receipt',
      icon: FileText,
      titleHi: 'अपनी किसान पर्ची देखें',
      titleEn: 'Digital Kisan Receipt',
      textHi: 'फसल दर्ज करते ही आपको एक सुरक्षित डिजिटल किसान पर्ची (Kisan Receipt) मिलती है, जिसपर SHA-256 ब्लॉकचेन हैश और क्यूआर कोड होता है। इसे कोई बिचौलिया बदल नहीं सकता!',
      textEn: 'Every crop upload gives you an immutable digital Kisan Receipt with a unique QR code and cryptographic ledger stamp, guaranteeing proof of deposit.',
      badgeHi: 'पक्की पर्ची',
      badgeEn: 'Secure Receipt'
    },
    {
      id: 'kyc',
      icon: ShieldCheck,
      titleHi: 'एग्रीस्टैक KYC सत्यापन',
      titleEn: 'AgriStack KYC Verification',
      textHi: 'अपनी फसल को मंडी में बेचने के लिए एग्रीस्टैक आईडी, आधार व खतौनी दस्तावेज जमा करें। एडमिन द्वारा वेरीफाई होते ही आपकी बिक्री तुरंत अनलॉक हो जाएगी।',
      textEn: 'Submit your AgriStack Farmer ID, Aadhaar, and Khatauni land records to unlock direct trading access across national commodity markets.',
      badgeHi: 'सरकारी मान्यता',
      badgeEn: 'AgriStack'
    },
    {
      id: 'aging',
      icon: RefreshCw,
      titleHi: '15-दिन शेल्फ लाइफ व भाव',
      titleEn: '15-Day Aging Protection',
      textHi: 'आपकी फसल 15 दिनों तक गोदाम में सुरक्षित रहती है। 15 दिन बाद सिस्टम उचित डिस्काउंट देकर त्वरित खरीद करवाता है, ताकि आपका अनाज कभी खराब न हो।',
      textEn: 'Stored batches are tracked across 15-day storage cycles with fair-trade discounts to prevent spoilage and guarantee payment settlement.',
      badgeHi: 'मूल्य सुरक्षा',
      badgeEn: 'Zero Waste'
    }
  ];

  const currentTip = tips[activeTipIndex];
  const TipIcon = currentTip.icon;

  // Auto-prompt on mount or custom event
  useEffect(() => {
    const handleOpenMascot = (e) => {
      setIsOpen(true);
      if (e?.detail?.tipIndex !== undefined) {
        setActiveTipIndex(e.detail.tipIndex);
      }
    };
    window.addEventListener('open-kisan-mascot', handleOpenMascot);
    return () => window.removeEventListener('open-kisan-mascot', handleOpenMascot);
  }, []);

  const handleToggle = () => {
    soundFX.click();
    setIsOpen(!isOpen);
  };

  const handleSpeak = (text) => {
    soundFX.click();
    setIsSpeaking(true);
    speakText(text, lang === 'hi' ? 'hi-IN' : 'en-IN');
    setTimeout(() => setIsSpeaking(false), 6000);
  };

  return (
    <aside className="farmer-mascot-widget" aria-label="Kisan Mitra AI Assistant">
      {/* Speech Bubble Popup */}
      {isOpen && (
        <div className="mascot-bubble-card glass-panel">
          {/* Header */}
          <div className="mascot-bubble-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', fontSize: '0.7rem' }}>
                <Sparkles size={11} />
                <span>{lang === 'hi' ? 'किसान मित्र AI' : 'Kisan Mitra AI'}</span>
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {lang === 'hi' ? 'सहायक' : 'Assistant'}
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="btn-icon"
              style={{ width: '26px', height: '26px', borderRadius: '6px' }}
              title="Close Mascot"
            >
              <X size={15} />
            </button>
          </div>

          {/* Active Tip Content */}
          <div className="mascot-bubble-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TipIcon size={16} />
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {lang === 'hi' ? currentTip.titleHi : currentTip.titleEn}
              </h4>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0.4rem 0 0.85rem' }}>
              {lang === 'hi' ? currentTip.textHi : currentTip.textEn}
            </p>

            {/* Audio Read-Out Button for Illiterate Farmers */}
            <button
              onClick={() => handleSpeak(lang === 'hi' ? currentTip.textHi : currentTip.textEn)}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}
            >
              <Volume2 size={14} className={isSpeaking ? 'spin-slow' : ''} />
              <span>{lang === 'hi' ? 'बोलकर सुनें (Audio Guide)' : 'Listen Aloud (Voice Guide)'}</span>
            </button>
          </div>

          {/* Quick Tip Selection Pills */}
          <div className="mascot-quick-pills">
            {tips.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => { soundFX.click(); setActiveTipIndex(idx); }}
                className={`mascot-pill-btn ${idx === activeTipIndex ? 'active' : ''}`}
              >
                {lang === 'hi' ? t.badgeHi : t.badgeEn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Animated Mascot Avatar Trigger */}
      <button
        onClick={handleToggle}
        className="mascot-avatar-trigger"
        title={lang === 'hi' ? 'किसान मित्र से सहायता लें' : 'Ask Kisan Mitra for Help'}
      >
        <div className="mascot-avatar-frame">
          <img
            src="/mascot-farmer-boy.jpg"
            alt="Kisan Mitra 3D Animated Farmer Mascot"
            className="mascot-avatar-img"
          />
          <span className="mascot-pulse-ring" />
          <span className="mascot-help-badge">
            {lang === 'hi' ? 'मदद?' : 'Help'}
          </span>
        </div>
      </button>
    </aside>
  );
}
