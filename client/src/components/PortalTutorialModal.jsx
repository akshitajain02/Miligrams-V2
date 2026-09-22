import React, { useState } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, 
  HelpCircle, Sprout, Building2, ShoppingBag, ShieldCheck,
  Mic, Award, Clock, FileText, Activity, AlertTriangle, Shield
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function PortalTutorialModal({ role = 'farmer', lang = 'hi', isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const roleMeta = {
    farmer: {
      titleHi: 'किसान पोर्टल मार्गदर्शिका',
      titleEn: 'Farmer Voice Portal Tutorial',
      icon: Sprout,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      storageKey: 'miligrams_tour_farmer_seen'
    },
    warehouse: {
      titleHi: 'गोदाम प्रबंधन मार्गदर्शिका',
      titleEn: 'Smart Silo Warehouse Tutorial',
      icon: Building2,
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      storageKey: 'miligrams_tour_warehouse_seen'
    },
    buyer: {
      titleHi: 'व्यापारी मंडी मार्गदर्शिका',
      titleEn: 'Commodity Buyer Tutorial',
      icon: ShoppingBag,
      color: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
      storageKey: 'miligrams_tour_buyer_seen'
    },
    admin: {
      titleHi: 'सिस्टम एडमिन व लेजर मार्गदर्शिका',
      titleEn: 'Admin Ledger Explorer Tutorial',
      icon: ShieldCheck,
      color: '#8b5cf6',
      bgGlow: 'rgba(139, 92, 246, 0.15)',
      storageKey: 'miligrams_tour_admin_seen'
    }
  };

  const tutorialsData = {
    farmer: [
      {
        stepIcon: Mic,
        badgeHi: 'सुगम आवाज AI',
        badgeEn: 'VOICE-ASSISTED AI',
        titleHi: 'बोलकर अपनी फसल दर्ज करें',
        titleEn: 'Register Crops Hands-Free via Voice',
        descHi: 'कम पढ़े-लिखे किसानों के लिए: "माइक से बोलें" बटन दबाकर अपनी भाषा (हिंदी या अंग्रेजी) में बोलें, जैसे "500 किलो शरबती गेहूं"। सिस्टम खुद ब खुद वजन व फसल पहचान लेता है।',
        descEn: 'Accessibility-first: Tap the microphone icon and speak naturally (e.g. "500 kg Sharbati Wheat"). Our speech recognition engine extracts crop type, quantity, and grade automatically without typing.',
        tipHi: 'सुझाव: आप आवाज सुनकर पुष्टि भी पा सकते हैं।',
        tipEn: 'Tip: Text-to-speech audio reads back confirmation for complete reassurance.'
      },
      {
        stepIcon: FileText,
        badgeHi: 'छेड़छाड़-रोधी पर्ची',
        badgeEn: 'BLOCKCHAIN RECEIPT',
        titleHi: 'डिजिटल किसान पर्ची व QR कोड',
        titleEn: 'Immutable Digital Kisan Receipt',
        descHi: 'फसल दर्ज करते ही आपको एक कानूनी डिजिटल किसान पर्ची (Kisan Receipt) मिलती है, जिसपर SHA-256 ब्लॉकचेन हैश और यूनिक लॉट आईडी दर्ज होती है। इसे कोई बिचौलिया बदल नहीं सकता।',
        descEn: 'Every uploaded crop instantly mints a cryptographic receipt with a unique QR code and SHA-256 ledger hash, providing undisputable proof of custody and grade.',
        tipHi: 'सुझाव: "पर्ची देखें (View Receipt)" पर क्लिक कर कभी भी प्रिंट या डाउनलोड करें।',
        tipEn: 'Tip: Click "View Receipt" at any time to inspect or print proof of deposit.'
      },
      {
        stepIcon: Award,
        badgeHi: 'सत्यापित किसान',
        badgeEn: 'AGRISTACK KYC',
        titleHi: 'एग्रीस्टैक व सरकारी पहचान KYC',
        titleEn: 'AgriStack & Land Record KYC',
        descHi: 'अपनी उपज बेचने के लिए एग्रीस्टैक फार्मर आईडी (AgriStack ID) और आधार/खतौनी दस्तावेज जमा करें। एडमिन द्वारा सत्यापित होने पर आपको "Verified Farmer" बैज मिलता है और बिक्री अनलॉक होती है।',
        descEn: 'Submit your AgriStack Farmer ID, Aadhaar, and Khatauni land records. Once verified by state admins, you receive a verified badge and full marketplace selling privileges.',
        tipHi: 'सुझाव: बिना KYC के फसल दर्ज हो सकती है, लेकिन बिक्री हेतु सत्यापन आवश्यक है।',
        tipEn: 'Tip: Crops can be uploaded immediately, but KYC is required for marketplace settlement.'
      },
      {
        stepIcon: Clock,
        badgeHi: '15-दिन जीवनचक्र',
        badgeEn: 'AGING ENGINE',
        titleHi: '15-दिन शेल्फ-लाइफ व मूल्य सुरक्षा',
        titleEn: '15-Day Aging & Guaranteed Trade',
        descHi: 'आपकी उपज गोदाम में 15 दिनों तक सुरक्षित रखी जाती है। यदि 15 दिन में नहीं बिकती, तो 15-दिन डिस्काउंट इंजन की मदद से न्यूनतम भाव पर त्वरित बिक्री सुनिश्चित की जाती है ताकि अनाज सड़े नहीं।',
        descEn: 'Stored batches are tracked across a 15-day lifecycle. Fresh crops maintain full premium, while aging lots receive progressive fair-trade discounts to prevent spoilage.',
        tipHi: 'सुझाव: डैशबोर्ड में "Aging Timeline" से अपनी फसल की उम्र ट्रैक करें।',
        tipEn: 'Tip: Track the precise storage age and relisting status on your dashboard.'
      }
    ],
    warehouse: [
      {
        stepIcon: Building2,
        badgeHi: 'स्मार्ट भंडारण',
        badgeEn: 'SILO LOGISTICS',
        titleHi: 'साइलो क्षमता व आवक प्रबंधन',
        titleEn: 'Silo Capacity & Grain Intake',
        descHi: 'किसानों द्वारा लाए गए अनाज की बोरियों को तौलें और 20,000 क्विंटल कुल क्षमता वाले साइलो में दर्ज करें। उपलब्ध क्षमता और भरे हुए साइलो की स्थिति रियल-टाइम में दिखती है।',
        descEn: 'Track grain intake loads against total warehouse silo capacity (20,000 quintals). View real-time utilization graphs, storage pod assignments, and batch logs.',
        tipHi: 'सुझाव: क्षमता 90% से ऊपर जाने पर सिस्टम स्वतः चेतावनी देता है।',
        tipEn: 'Tip: Automatic capacity threshold alerts prevent warehouse over-saturation.'
      },
      {
        stepIcon: Activity,
        badgeHi: 'गुणवत्ता परीक्षण',
        badgeEn: 'MOISTURE SENSORS',
        titleHi: 'अनाज नमी व गुणवत्ता ग्रेडिंग',
        titleEn: 'Grain Moisture & Quality Grade Audit',
        descHi: 'अनाज सुरक्षित रखने के लिए नमी 12% से कम होनी चाहिए। डिजिटल मॉइश्चर मीटर से नमी नापें और ग्रेड (Grade A/B/C) ब्लॉकचेन लेजर में सुरक्षित करें।',
        descEn: 'Maintain grain safety by verifying moisture levels (optimum <12%). Log digital moisture readings and assign verified quality grades straight to the ledger.',
        tipHi: 'सुझाव: अनुचित नमी वाले लॉट को तुरंत सुखाने (Aeration) का निर्देश दें।',
        tipEn: 'Tip: Flag high-moisture grain for immediate aeration to protect silo integrity.'
      },
      {
        stepIcon: Clock,
        badgeHi: 'कोल्ड व ड्राई चेन',
        badgeEn: 'PRESERVATION',
        titleHi: 'स्टॉक पृथक्करण व जीवनचक्र निगरानी',
        titleEn: 'Stock Segregation & Aging Tracker',
        descHi: 'अनाज व दलहन को ड्राई साइलो और फल-सब्जियों को कोल्ड पॉड्स में अलग-अलग रखें। 15-दिन से अधिक पुराने लॉट को प्राथमिकता से मंडी डिस्पैच में भेजें।',
        descEn: 'Segregate dry grains from climate-controlled cold storage commodities. Monitor batch age to prioritize dispatch for crops approaching 15 storage days.',
        tipHi: 'सुझाव: समय रहते डिस्पैच करने से गुणवत्ता हानि शून्य रहती है।',
        tipEn: 'Tip: FIFO dispatch rotation guarantees peak freshness and minimum loss.'
      }
    ],
    buyer: [
      {
        stepIcon: ShoppingBag,
        badgeHi: '100% सत्यापित मंडी',
        badgeEn: 'DIRECT FARM BATCHES',
        titleHi: 'सत्यापित किसानों से सीधी थोक खरीद',
        titleEn: 'Direct Procurement from Verified Farmers',
        descHi: 'बिचौलियों और आढ़तियों के बिना सीधे एग्रीस्टैक-सत्यापित किसानों से शुद्ध और ताजा कृषि उपज खरीदें। प्रत्येक लॉट की नमी, ग्रेड और किसान आईडी स्पष्ट रूप से उपलब्ध है।',
        descEn: 'Procure wholesale produce directly from AgriStack-authenticated farmers without intermediary commissions. Inspect laboratory-grade moisture and farmer ratings upfront.',
        tipHi: 'सुझाव: "Verified" बैज वाले किसानों की उपज 100% प्रामाणिक होती है।',
        tipEn: 'Tip: Look for the green verified badge for authenticated source tracking.'
      },
      {
        stepIcon: Clock,
        badgeHi: 'मूल्य छूट',
        badgeEn: 'FAIR-TRADE DEALS',
        titleHi: '15-दिन एजिंग छूट का लाभ उठाएं',
        titleEn: 'Leverage 15-Day Aging Discounts',
        descHi: 'गोदाम में 15 दिनों से रखे परिपक्व लॉट पर विशेष प्रगतिशील छूट (Aging Discounts) पाएं। कम दाम पर प्रीमियम गुणवत्ता का अनाज प्राप्त करें और किसानों को बर्बादी से बचाएं।',
        descEn: 'Access progressive discount rates on mature grain lots reaching 15 storage days, unlocking wholesale bargain margins while preventing food wastage.',
        tipHi: 'सुझाव: डिस्काउंटेड लॉट पर "15-Day Discount" का नारंगी बैज दिखता है।',
        tipEn: 'Tip: Orange discount tags indicate active fair-trade markdown batches.'
      },
      {
        stepIcon: Award,
        badgeHi: 'समुदाय समीक्षा',
        badgeEn: 'FARMER RATINGS',
        titleHi: 'किसान को रेटिंग व समीक्षा दें',
        titleEn: 'Rate Farmers & Write Verified Reviews',
        descHi: 'खरीद पूरी होने के बाद किसान को 1 से 5 स्टार रेटिंग और समीक्षा (Review) दें। आपकी समीक्षा से अन्य खरीदारों को मदद मिलती है और ईमानदार किसानों का मान बढ़ता है।',
        descEn: 'Leave star ratings and quality reviews following trade settlement. Your feedback drives transparent reputation scores across the national farming community.',
        tipHi: 'सुझाव: टॉप-रेटेड किसान को मंडी में विशेष प्राथमिकता मिलती है।',
        tipEn: 'Tip: High-rated farmers are prominently showcased on the marketplace front.'
      }
    ],
    admin: [
      {
        stepIcon: ShieldCheck,
        badgeHi: 'क्रिप्टोग्राफिक लेजर',
        badgeEn: 'SHA-256 AUDIT',
        titleHi: 'SHA-256 ब्लॉकचेन लेजर एक्सप्लोरर',
        titleEn: 'Cryptographic SHA-256 Ledger Explorer',
        descHi: 'जेनेसिस ब्लॉक #0 से लेकर नवीनतम व्यापार तक प्रत्येक लेनदेन का क्रिप्टोग्राफिक हैश ऑडिट करें। ब्लॉकचेन में किसी भी पिछले डेटा को बदलना या मिटाना गणितीय रूप से असंभव है।',
        descEn: 'Audit every block linked from Genesis #0 to present. Each block is cryptographically sealed with previous-hash matching, ensuring complete transparency and anti-fraud defense.',
        tipHi: 'सुझाव: "ब्लॉकचेन सत्यापन" बटन दबाकर संपूर्ण श्रृंखला का लाइव ऑडिट करें।',
        tipEn: 'Tip: Click "Verify Ledger" to mathematically re-hash every block in real time.'
      },
      {
        stepIcon: Shield,
        badgeHi: 'KYC प्रशासन',
        badgeEn: 'GOVERNANCE',
        titleHi: 'किसान KYC सत्यापन व अनुमोदन केंद्र',
        titleEn: 'Farmer KYC Verification & Approval Hub',
        descHi: 'किसानों द्वारा जमा किए गए एग्रीस्टैक आईडी, आधार और खतौनी भू-अभिलेखों की समीक्षा करें। एक क्लिक में "सत्यापित (Approve)" करें या कारण सहित "अस्वीकार (Reject)" करें।',
        descEn: 'Review pending farmer applications, AgriStack credentials, and land record documents. Approve with 1 click or reject with official justification notes.',
        tipHi: 'सुझाव: केवल वेरीफाइड किसान ही मंडी में लॉट बेच सकते हैं।',
        tipEn: 'Tip: Approval instantly unlocks the farmer\'s marketplace trading permissions.'
      },
      {
        stepIcon: Activity,
        badgeHi: 'सिमुलेटर',
        badgeEn: 'TEST SUITE',
        titleHi: '15-दिवसीय जीवनचक्र व छेड़छाड़ परीक्षण',
        titleEn: 'Aging Cycle Simulation & Tamper Detection',
        descHi: 'सिस्टम के "15-Day Aging Cycle" को चलाकर देखें कि कैसे पुरानी फसलें स्वतः डिस्काउंट में बदलती हैं, और छेड़छाड़ परीक्षण (Tamper Test) से जानें कि अवैध डेटा बदलने पर सिस्टम कैसे लाल अलर्ट देता है।',
        descEn: 'Trigger the 15-day aging simulation to observe automatic discount relisting, or run the tamper test to see the zero-trust ledger detect and reject corrupt blocks.',
        tipHi: 'सुझाव: छेड़छाड़ के बाद "रीसेट लेजर" से सिस्टम पुनः सही हो जाता है।',
        tipEn: 'Tip: The tamper recovery tool instantly restores chain integrity.'
      }
    ]
  };

  const currentRoleMeta = roleMeta[role] || roleMeta.farmer;
  const steps = tutorialsData[role] || tutorialsData.farmer;
  const step = steps[currentStep] || steps[0];
  const StepIcon = step.stepIcon;
  const RoleIcon = currentRoleMeta.icon;

  const handleNext = () => {
    soundFX.click();
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    soundFX.click();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    soundFX.success();
    try {
      localStorage.setItem(currentRoleMeta.storageKey, 'seen');
    } catch (e) {
      console.error(e);
    }
    onClose();
  };

  return (
    <div className="portal-tutorial-backdrop" onClick={onClose}>
      <div 
        className="portal-tutorial-modal glass-panel" 
        onClick={e => e.stopPropagation()}
        style={{
          borderTop: `4px solid ${currentRoleMeta.color}`,
        }}
      >
        {/* Top Header */}
        <div className="portal-tutorial-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                background: currentRoleMeta.bgGlow, 
                color: currentRoleMeta.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: `1px solid ${currentRoleMeta.color}40`
              }}
            >
              <RoleIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {lang === 'hi' ? currentRoleMeta.titleHi : currentRoleMeta.titleEn}
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                {lang === 'hi' 
                  ? `चरण ${currentStep + 1} / ${steps.length} — त्वरित सहायता मार्गदर्शिका`
                  : `Step ${currentStep + 1} of ${steps.length} — Interactive Feature Walkthrough`}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="btn-icon" 
            style={{ width: '32px', height: '32px', borderRadius: '8px' }}
            title={lang === 'hi' ? 'मार्गदर्शिका बंद करें' : 'Close Tutorial'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="portal-tutorial-progress-bar">
          {steps.map((s, idx) => (
            <div
              key={idx}
              onClick={() => { soundFX.click(); setCurrentStep(idx); }}
              className={`portal-tutorial-progress-step ${idx === currentStep ? 'active' : idx < currentStep ? 'completed' : ''}`}
              style={{
                borderColor: idx === currentStep ? currentRoleMeta.color : undefined,
                background: idx === currentStep ? currentRoleMeta.color : idx < currentStep ? `${currentRoleMeta.color}80` : undefined
              }}
              title={`Step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Step Body Card */}
        <div className="portal-tutorial-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span 
              className="badge" 
              style={{ 
                background: currentRoleMeta.bgGlow, 
                color: currentRoleMeta.color, 
                borderColor: `${currentRoleMeta.color}40`,
                fontSize: '0.72rem'
              }}
            >
              <Sparkles size={11} />
              <span>{lang === 'hi' ? step.badgeHi : step.badgeEn}</span>
            </span>

            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              {currentStep + 1} / {steps.length}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div 
              style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: `${currentRoleMeta.color}15`, 
                color: currentRoleMeta.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                border: `1px solid ${currentRoleMeta.color}35`
              }}
            >
              <StepIcon size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.18rem', fontWeight: 800, margin: '0 0 0.45rem', color: 'var(--text-main)' }}>
                {lang === 'hi' ? step.titleHi : step.titleEn}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {lang === 'hi' ? step.descHi : step.descEn}
              </p>
            </div>
          </div>

          {/* Helpful Pro-Tip Box */}
          <div 
            style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px dashed var(--border)', 
              borderRadius: '10px', 
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.78rem',
              color: 'var(--text-light)'
            }}
          >
            <HelpCircle size={15} color={currentRoleMeta.color} style={{ flexShrink: 0 }} />
            <span>{lang === 'hi' ? step.tipHi : step.tipEn}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="portal-tutorial-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem' }}
          >
            {lang === 'hi' ? 'छोड़ें (Skip)' : 'Skip Tour'}
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ChevronLeft size={14} />
                <span>{lang === 'hi' ? 'पिछला' : 'Back'}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn btn-primary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: currentStep === steps.length - 1 ? currentRoleMeta.color : undefined,
                borderColor: currentStep === steps.length - 1 ? currentRoleMeta.color : undefined
              }}
            >
              <span>
                {currentStep === steps.length - 1 
                  ? (lang === 'hi' ? 'समझ गए! शुरू करें' : 'Got it! Finish Tour') 
                  : (lang === 'hi' ? 'अगला' : 'Next')}
              </span>
              {currentStep === steps.length - 1 ? (
                <CheckCircle2 size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
