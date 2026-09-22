import React, { useState, useEffect } from 'react';
import { 
  Sprout, Package, Plus, RefreshCw, Layers, ShieldCheck, User, 
  FileText, CheckCircle2, X, Mic, MicOff, Volume2, Calendar, Scale, 
  AlertTriangle, FastForward, Building2, ShoppingBag, Sparkles, Award, Shield, Lock, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import KisanReceiptModal from '../components/KisanReceiptModal';
import CropHistoryModal from '../components/CropHistoryModal';
import PortalTutorialModal from '../components/PortalTutorialModal';
import { startVoiceRecognition, parseSpokenCrop, speakText } from '../utils/speechUtils';
import { translations } from '../utils/translations';

export default function FarmerPortal({ lang = 'hi' }) {
  const t = translations[lang] || translations.hi;
  const { currentUser } = useAuth();

  const [crops, setCrops] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState(
    currentUser?.role === 'farmer' ? currentUser.uniqueId : ''
  );
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [mintedBlock, setMintedBlock] = useState(null);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('miligrams_tour_farmer_seen');
      if (!seen) {
        setIsTutorialOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // KYC submission form state
  const [kycForm, setKycForm] = useState({
    agriStackId: '',
    aadhaarNumber: '',
    khatauniNumber: '',
    photoUrl: ''
  });
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // Form state
  const [selectedCropTile, setSelectedCropTile] = useState('शरबती गेहूं (Wheat)');
  const [quantity, setQuantity] = useState(500);
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  // Voice Input State - Synchronized with selected app language
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState(lang === 'hi' ? 'hi-IN' : 'en-IN');
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [activeRecognition, setActiveRecognition] = useState(null);

  useEffect(() => {
    setVoiceLang(lang === 'hi' ? 'hi-IN' : 'en-IN');
  }, [lang]);

  // Luxury Crop Catalog
  const cropCatalog = [
    { nameHi: 'गेहूं', nameEn: 'Wheat', icon: Sprout, fullName: 'शरबती गेहूं (Wheat)', color: '#10b981' },
    { nameHi: 'चावल', nameEn: 'Basmati Rice', icon: Layers, fullName: 'बासमती चावल (Basmati Rice)', color: '#38bdf8' },
    { nameHi: 'मक्का', nameEn: 'Yellow Maize', icon: Sparkles, fullName: 'पीली मक्का (Yellow Maize)', color: '#f59e0b' },
    { nameHi: 'सरसों', nameEn: 'Mustard', icon: Award, fullName: 'सरसों के बीज (Mustard)', color: '#eab308' },
    { nameHi: 'आलू', nameEn: 'Potato', icon: Package, fullName: 'पहाड़ी आलू (Potato)', color: '#c084fc' },
    { nameHi: 'चना/दाल', nameEn: 'Chickpeas', icon: ShieldCheck, fullName: 'देसी चना (Chickpeas)', color: '#fb923c' },
    { nameHi: 'गन्ना', nameEn: 'Sugarcane', icon: CheckCircle2, fullName: 'गन्ना (Sugarcane)', color: '#34d399' },
    { nameHi: 'बाजरा', nameEn: 'Pearl Millet', icon: Sprout, fullName: 'देसी बाजरा (Pearl Millet)', color: '#a3e635' }
  ];

  const getCropIcon = (cropType = '') => {
    const matched = cropCatalog.find(c => cropType.includes(c.nameHi) || cropType.includes(c.nameEn));
    return matched ? matched.icon : Sprout;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [farmersRes, cropsRes] = await Promise.all([
        fetch('/api/farmers'),
        fetch('/api/crops')
      ]);
      const fData = await farmersRes.json();
      const cData = await cropsRes.json();

      if (fData.success && fData.farmers.length > 0) {
        setFarmers(fData.farmers);
        if (!selectedFarmerId) {
          setSelectedFarmerId(fData.farmers[0].uniqueId);
        }
      }
      if (cData.success) {
        setCrops(cData.crops);
      }
    } catch (err) {
      console.error('Error fetching farmer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeFarmer = farmers.find(f => f.uniqueId === selectedFarmerId) || farmers[0];
  const farmerCrops = crops.filter(c => selectedFarmerId ? c.farmerId === selectedFarmerId : true);
  const agedCrops = farmerCrops.filter(c => c.status === 'aged-relisted');
  const unsellableCrops = farmerCrops.filter(c => c.status === 'unsellable');

  // Stats
  const totalCropsCount = farmerCrops.length;
  const farmStageCount = farmerCrops.filter(c => c.currentStage === 'farm').length;
  const warehouseStageCount = farmerCrops.filter(c => c.currentStage === 'warehouse').length;
  const soldStageCount = farmerCrops.filter(c => c.currentStage === 'sold').length;

  // Voice Input Handlers
  const handleStartListening = () => {
    if (isListening) {
      if (activeRecognition) activeRecognition.stop();
      setIsListening(false);
      return;
    }

    const promptText = voiceLang === 'hi-IN' 
      ? 'कृपया बोलिए: जैसे 500 किलो गेहूं' 
      : 'Please speak: for example, 500 kg wheat';
    
    speakText(promptText, voiceLang);
    setVoiceFeedback(voiceLang === 'hi-IN' ? 'सुन रहे हैं... बोलिए' : 'Listening... please speak');
    setIsListening(true);

    const rec = startVoiceRecognition(
      voiceLang,
      (transcript) => {
        setIsListening(false);
        setVoiceFeedback(lang === 'hi' ? `सुना गया: "${transcript}"` : `Heard: "${transcript}"`);

        const parsed = parseSpokenCrop(transcript);
        if (parsed.cropType) {
          setSelectedCropTile(parsed.cropType);
        }
        if (parsed.quantity) {
          setQuantity(parsed.quantity);
        }

        const confirmMsg = voiceLang === 'hi-IN'
          ? `दर्ज किया: ${parsed.cropType || 'फसल'}, ${parsed.quantity || quantity} किलो`
          : `Captured: ${parsed.cropType || 'Crop'}, ${parsed.quantity || quantity} kilograms`;
        speakText(confirmMsg, voiceLang);
      },
      (err) => {
        setIsListening(false);
        setVoiceFeedback(lang === 'hi' ? `त्रुटि: ${err}` : `Voice error: ${err}`);
      },
      () => {
        setIsListening(false);
      }
    );

    setActiveRecognition(rec);
  };

  const handleReadAloud = (text) => {
    speakText(text, voiceLang);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessBanner(null);

    try {
      const payload = {
        cropType: selectedCropTile,
        quantity: Number(quantity),
        harvestDate: new Date(harvestDate).toISOString(),
        qualityStatus: qualityGrade,
        farmerId: activeFarmer?.uniqueId || 'FARMER-101',
        farmerName: activeFarmer?.name || 'Kisan'
      };

      const res = await fetch('/api/crops/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload crop');
      }

      await fetchData();
      setIsUploadOpen(false);
      setSelectedCrop(data.crop);
      setMintedBlock(data.block);
      setIsReceiptOpen(true);

      const successMsg = lang === 'hi'
        ? 'फसल सफलतापूर्वक दर्ज हो गई! ब्लॉकचेन पर्ची तैयार है।'
        : 'Crop registered successfully! Blockchain receipt is ready.';
      
      setSuccessBanner(successMsg);
      speakText(successMsg, voiceLang);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenKycModal = () => {
    if (activeFarmer) {
      setKycForm({
        agriStackId: activeFarmer.agriStackId || '',
        aadhaarNumber: activeFarmer.aadhaarNumber || '',
        khatauniNumber: activeFarmer.khatauniNumber || '',
        photoUrl: activeFarmer.photoUrl || ''
      });
    }
    setIsKycModalOpen(true);
  };

  const handleSubmitKyc = async (e) => {
    e.preventDefault();
    if (!activeFarmer) return;
    setIsSubmittingKyc(true);
    try {
      const res = await fetch(`/api/farmers/${activeFarmer.uniqueId}/kyc-submit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kycForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit KYC');
      }
      await fetchData();
      setIsKycModalOpen(false);
      setSuccessBanner(lang === 'hi' ? 'KYC दस्तावेज सफलतापूर्वक जमा किए गए! सत्यापन प्रक्रियाधीन है।' : 'KYC documents submitted successfully! Verification in progress.');
    } catch (err) {
      alert(`KYC Submission Error: ${err.message}`);
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  const handleSimulateAging = async (cropId) => {
    try {
      const res = await fetch('/api/crops/simulate-aging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropId, daysFastForward: 16 })
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        const alertMsg = lang === 'hi'
          ? `15-दिन उम्र सत्यापन सफल! नया ब्लॉक #${data.block.index} जुड़ा। स्थिति: ${data.crop.status}`
          : `15-Day aging verification complete! New Block #${data.block.index} minted. Status: ${data.crop.status}`;
        alert(alertMsg);
      }
    } catch (err) {
      alert(`Aging simulation error: ${err.message}`);
    }
  };

  const openReceipt = (crop) => {
    setSelectedCrop(crop);
    setIsReceiptOpen(true);
  };

  const openHistory = (crop) => {
    setSelectedCrop(crop);
    setIsHistoryOpen(true);
  };

  return (
    <div>
      {/* High-Tech Assisted Mode Pill */}
      <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 'var(--radius)', padding: '0.9rem 1.4rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <strong style={{ color: '#ffffff', fontSize: '0.92rem' }}>
              {t.assistedMode}
            </strong>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              {t.assistedModeDesc}
            </p>
          </div>
        </div>
        <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          {lang === 'hi' ? 'आवाज व टच सहायता सक्रिय' : 'Voice & Touch AI Active'}
        </span>
      </div>

      {/* Luxury Farmer Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem 2.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(14, 20, 34, 0.8) 100%)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
        <div>
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)', marginBottom: '0.65rem' }}>
            <Sprout size={13} />
            <span>SOVEREIGN PROVENANCE</span>
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.35rem 0' }}>
            {t.farmerBannerTitle}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.94rem', maxWidth: '600px' }}>
            {t.farmerBannerSubtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Active Farmer Selector */}
          <div style={{ background: 'rgba(11, 16, 26, 0.85)', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User size={18} color="#10b981" />
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.88rem', color: '#ffffff', outline: 'none', cursor: 'pointer' }}
            >
              {farmers.map(f => (
                <option key={f.uniqueId} value={f.uniqueId} style={{ background: '#0e1421', color: '#ffffff' }}>
                  {f.name} ({f.location || f.uniqueId})
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Tutorial Button */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
            title={lang === 'hi' ? 'किसान पोर्टल मार्गदर्शिका देखें' : 'View Farmer Portal Tutorial'}
          >
            <BookOpen size={16} />
            <span>{lang === 'hi' ? '📖 ट्यूटोरियल' : '📖 Tour'}</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="btn btn-primary btn-lg"
          >
            <Plus size={20} />
            <span>{t.addCropBtn}</span>
          </button>
        </div>
      </div>

      {/* Farmer KYC Authentication Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.25rem 1.5rem', 
          marginBottom: '1.75rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '1rem',
          borderLeft: activeFarmer?.kycStatus === 'verified' 
            ? '4px solid #10b981' 
            : activeFarmer?.kycStatus === 'rejected' 
            ? '4px solid #f43f5e' 
            : '4px solid #f59e0b',
          background: activeFarmer?.kycStatus === 'verified' 
            ? 'rgba(16, 185, 129, 0.06)' 
            : activeFarmer?.kycStatus === 'rejected' 
            ? 'rgba(244, 63, 94, 0.08)' 
            : 'rgba(245, 158, 11, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', maxWidth: '720px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '10px', 
            background: activeFarmer?.kycStatus === 'verified' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
            color: activeFarmer?.kycStatus === 'verified' ? '#10b981' : '#f59e0b',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {activeFarmer?.kycStatus === 'verified' ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {activeFarmer?.kycStatus === 'verified'
                  ? (lang === 'hi' ? 'प्रमाणित किसान (AgriStack Verified Farmer)' : 'AgriStack Verified Producer')
                  : activeFarmer?.kycStatus === 'rejected'
                  ? (lang === 'hi' ? 'केवाईसी अस्वीकृत (KYC Rejected)' : 'KYC Verification Rejected')
                  : (lang === 'hi' ? 'केवाईसी सत्यापन लंबित (KYC Pending — Verification in Progress)' : 'KYC Pending — Verification in Progress')}
              </h4>

              <span 
                className="badge" 
                style={{ 
                  background: activeFarmer?.kycStatus === 'verified' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: activeFarmer?.kycStatus === 'verified' ? '#34d399' : '#fbbf24',
                  borderColor: activeFarmer?.kycStatus === 'verified' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'
                }}
              >
                {activeFarmer?.kycStatus === 'verified' ? '● Verified' : activeFarmer?.kycStatus === 'rejected' ? '● Rejected' : '● In Review'}
              </span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: 0, lineHeight: 1.45 }}>
              {activeFarmer?.kycStatus === 'verified' ? (
                lang === 'hi' 
                  ? `AgriStack ID: ${activeFarmer.agriStackId || 'AGRI-PB-2026-8891'} • आधार: ${activeFarmer.aadhaarNumber || 'सत्यापित'} • मंडी में बिक्री व थोक खरीद सक्रिय है।`
                  : `AgriStack ID: ${activeFarmer.agriStackId || 'AGRI-PB-2026-8891'} • Aadhaar Verified • Marketplace listings are active.`
              ) : activeFarmer?.kycStatus === 'rejected' ? (
                lang === 'hi'
                  ? `अस्वीकृति कारण: ${activeFarmer.kycRejectionReason || 'दस्तावेज अस्पष्ट थे'}। कृपया सही दस्तावेज पुनः जमा करें।`
                  : `Reason: ${activeFarmer.kycRejectionReason || 'Documents could not be verified'}. Please re-submit.`
              ) : (
                lang === 'hi'
                  ? 'आप अपनी फसलें अपने आंतरिक रिकॉर्ड और पर्ची के लिए दर्ज कर सकते हैं, लेकिन जब तक एडमिन द्वारा आपका KYC स्वीकृत नहीं हो जाता, तब तक यह मंडी में बिक्री के लिए लिस्ट नहीं होगी।'
                  : 'You can upload crops for personal records & receipts, but marketplace selling is locked until Admin verifies your KYC.'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenKycModal}
          className="btn btn-secondary btn-sm"
          style={{ 
            borderColor: activeFarmer?.kycStatus === 'verified' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
            color: activeFarmer?.kycStatus === 'verified' ? '#34d399' : '#fbbf24',
            whiteSpace: 'nowrap'
          }}
        >
          <Shield size={14} />
          <span>{lang === 'hi' ? 'दस्तावेज देखें / अपडेट करें' : 'View / Update KYC'}</span>
        </button>
      </div>

      {/* Voice Assistant Master Banner */}
      <div className="voice-assistant-bar">
        <div className="voice-mic-container">
          <button
            type="button"
            onClick={handleStartListening}
            className={`voice-mic-button ${isListening ? 'recording' : ''}`}
            title="Tap to speak"
          >
            {isListening ? <MicOff size={30} /> : <Mic size={30} />}
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {isListening ? (voiceLang === 'hi-IN' ? 'सुन रहे हैं... बोलिए' : 'Listening... speak now') : t.voiceInputTitle}
              </h3>
              <div className="soundwave-visualizer">
                <div className={`soundwave-bar ${isListening ? 'active' : ''}`}></div>
                <div className={`soundwave-bar ${isListening ? 'active' : ''}`}></div>
                <div className={`soundwave-bar ${isListening ? 'active' : ''}`}></div>
                <div className={`soundwave-bar ${isListening ? 'active' : ''}`}></div>
                <div className={`soundwave-bar ${isListening ? 'active' : ''}`}></div>
                <div className={`soundwave-bar ${isListening ? 'active' : ''}`}></div>
                <div className={`soundwave-bar ${isListening ? 'active' : ''}`}></div>
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: 0 }}>
              {voiceLang === 'hi-IN'
                ? 'माइक दबाकर बोलें: जैसे "500 किलो शरबती गेहूं" — AI स्वतः पहचान कर लेगा।'
                : 'Tap mic and speak naturally: e.g. "500 kg Wheat" — the AI auto-extracts data.'}
            </p>

            {voiceFeedback && (
              <div style={{ marginTop: '0.6rem', fontSize: '0.84rem', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-block' }}>
                {voiceFeedback}
              </div>
            )}
          </div>
        </div>

        {/* Voice Speech Language Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => setVoiceLang('hi-IN')}
            className={`btn btn-sm ${voiceLang === 'hi-IN' ? 'btn-primary' : 'btn-secondary'}`}
          >
            हिंदी आवाज
          </button>
          <button
            type="button"
            onClick={() => setVoiceLang('en-IN')}
            className={`btn btn-sm ${voiceLang === 'en-IN' ? 'btn-primary' : 'btn-secondary'}`}
          >
            English Voice
          </button>
        </div>
      </div>

      {/* Crop Aging Warning Alert */}
      {agedCrops.length > 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: 'var(--radius)', padding: '1.15rem 1.4rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
          <AlertTriangle size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#fbbf24', fontSize: '1rem', display: 'block' }}>
              {t.agingAlertTitle}
            </strong>
            <p style={{ fontSize: '0.86rem', color: '#e2e8f0', marginTop: '0.25rem' }}>
              {t.agingAlertDesc} ({agedCrops.length} {lang === 'hi' ? 'फसलें' : 'crop batches'})
            </p>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {successBanner && (
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', padding: '1rem 1.4rem', borderRadius: 'var(--radius)', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.35rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>{totalCropsCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>{t.totalCrops}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.35rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>{farmStageCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>{t.atFarm}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.35rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>{warehouseStageCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>{t.inWarehouse}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.35rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>{soldStageCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>{t.sold}</div>
          </div>
        </div>
      </div>

      {/* Crops Inventory Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span>{t.myCrops}</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#94a3b8' }}>({farmerCrops.length})</span>
        </h3>

        <button onClick={fetchData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} />
          <span>{t.refresh}</span>
        </button>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <RefreshCw size={24} className="spin-slow" style={{ margin: '0 auto 1rem', display: 'block', color: '#10b981' }} />
          <p>{lang === 'hi' ? 'फसलों की जानकारी लोड हो रही है...' : 'Loading verified crops data...'}</p>
        </div>
      ) : farmerCrops.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <Sprout size={32} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>{t.noCropsYet}</h3>
          <p style={{ color: '#94a3b8', marginTop: '0.35rem' }}>{t.firstCropPrompt}</p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="btn btn-primary btn-lg"
            style={{ marginTop: '1.5rem' }}
          >
            <Plus size={18} />
            <span>{t.addCropBtn}</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {farmerCrops.map(crop => {
            const Icon = getCropIcon(crop.cropType);
            const weightQuintal = (crop.quantity / 100).toFixed(1);
            const isAged = crop.status === 'aged-relisted';
            const isUnsellable = crop.status === 'unsellable';

            return (
              <div
                key={crop._id}
                className="glass-panel glass-panel-glow"
                style={{
                  padding: '1.4rem 1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  borderLeft: isAged ? '4px solid #f59e0b' : isUnsellable ? '4px solid #f43f5e' : '4px solid #10b981'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Icon size={26} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '1.12rem', fontWeight: 800, color: '#ffffff' }}>{crop.cropType}</span>
                      {isAged && (
                        <span className="badge badge-aging">
                          🔄 {lang === 'hi' ? '15-दिन पुनः सत्यापित (-20%)' : '15-Day Re-verified (20% OFF)'}
                        </span>
                      )}
                      {isUnsellable && (
                        <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
                          ⚠️ {lang === 'hi' ? 'बिक्री अयोग्य' : 'Unsellable Expired'}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: '#94a3b8', fontSize: '0.84rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ffffff', fontWeight: 700 }}>
                        <Scale size={14} color="#10b981" />
                        <span>{crop.quantity.toLocaleString()} kg</span>
                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>({weightQuintal} Q)</span>
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} />
                        <span>{new Date(crop.harvestDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US')}</span>
                      </span>
                      <span>•</span>
                      <span className="badge badge-quality">{crop.qualityStatus || 'Grade A'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div>
                    {crop.currentStage === 'farm' && (
                      <span className="badge badge-farm">
                        ● {lang === 'hi' ? 'खेत में (At Farm Gate)' : 'At Farm Gate'}
                      </span>
                    )}
                    {crop.currentStage === 'warehouse' && (
                      <span className="badge badge-warehouse">
                        ● {lang === 'hi' ? 'गोदाम में (In Warehouse)' : 'In Warehouse Silo'}
                      </span>
                    )}
                    {crop.currentStage === 'sold' && (
                      <span className="badge badge-sold">
                        ● {lang === 'hi' ? 'बिक गई (Sold & Settled)' : 'Sold & Settled'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openReceipt(crop)}
                    className="btn btn-primary btn-sm"
                  >
                    <FileText size={15} />
                    <span>{t.viewReceipt}</span>
                  </button>

                  {activeFarmer?.kycStatus === 'verified' ? (
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                      <CheckCircle2 size={12} />
                      <span>{lang === 'hi' ? 'मंडी में लाइव' : 'Live on Marketplace'}</span>
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                      <Lock size={12} />
                      <span>{lang === 'hi' ? 'मंडी लॉक (KYC लंबित)' : 'Marketplace Locked (KYC)'}</span>
                    </span>
                  )}

                  {/* 15-day Aging test demo button */}
                  {crop.currentStage !== 'sold' && !isUnsellable && (
                    <button
                      onClick={() => handleSimulateAging(crop._id)}
                      className="btn btn-sm btn-secondary"
                      style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                      title="Simulate 15 days aging on this crop"
                    >
                      <FastForward size={13} />
                      <span>{t.testAgingBtn}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Voice-Enabled Luxury Crop Upload Modal */}
      {isUploadOpen && (
        <div className="modal-overlay" onClick={() => setIsUploadOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sprout size={20} />
                </div>
                <h3>{t.addCropBtn}</h3>
              </div>
              <button className="modal-close" onClick={() => setIsUploadOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Voice Input In-Modal Quick Action */}
              <div style={{ background: isListening ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.08)', border: `1.5px ${isListening ? 'dashed #f43f5e' : 'solid rgba(16, 185, 129, 0.3)'}`, borderRadius: 'var(--radius)', padding: '1.35rem', marginBottom: '1.75rem', textAlign: 'center', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem', fontWeight: 800, color: '#34d399' }}>
                    <Mic size={18} color="#10b981" />
                    <span>{t.voiceInputTitle}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setVoiceLang('hi-IN')}
                      className={`btn btn-sm ${voiceLang === 'hi-IN' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.74rem' }}
                    >
                      हिंदी
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoiceLang('en-IN')}
                      className={`btn btn-sm ${voiceLang === 'en-IN' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.74rem' }}
                    >
                      English
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  {voiceLang === 'hi-IN'
                    ? 'माइक दबाकर बोलिए: जैसे "500 किलो गेहूं" या "दो सौ किलो चावल"'
                    : 'Tap mic and speak: for example "500 kg wheat" or "200 kg rice"'}
                </p>

                <button
                  type="button"
                  onClick={handleStartListening}
                  className={`btn btn-lg ${isListening ? 'btn-danger' : 'btn-primary'}`}
                  style={{ borderRadius: '9999px', padding: '0.85rem 2.2rem' }}
                >
                  {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                  <span>{isListening ? (voiceLang === 'hi-IN' ? 'सुन रहे हैं... बोलिए' : 'Listening...') : t.tapToSpeak}</span>
                </button>

                {voiceFeedback && (
                  <div style={{ marginTop: '0.85rem', fontSize: '0.86rem', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-block' }}>
                    {voiceFeedback}
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <form onSubmit={handleUploadSubmit}>
                {/* Crop Variety Selection */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.88rem', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sprout size={16} color="#10b981" />
                      <span>{t.selectCrop} *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleReadAloud(lang === 'hi' ? 'फसल का चयन करें. गेहूं, चावल, मक्का या सरसों चुनें.' : 'Select crop variety. Choose wheat, rice, corn or mustard.')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 700 }}
                    >
                      <Volume2 size={16} />
                      <span>{lang === 'hi' ? 'सुनें' : 'Listen'}</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.85rem' }}>
                    {cropCatalog.map(tile => {
                      const Icon = tile.icon;
                      const isSelected = selectedCropTile === tile.fullName;

                      return (
                        <div
                          key={tile.fullName}
                          className={`crop-select-tile ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedCropTile(tile.fullName);
                            handleReadAloud(lang === 'hi' ? tile.nameHi : tile.nameEn);
                          }}
                        >
                          <div className="crop-tile-icon">
                            <Icon size={24} />
                          </div>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                            {lang === 'hi' ? tile.nameHi : tile.nameEn}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                            {lang === 'hi' ? tile.nameEn : tile.nameHi}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Weight / Quantity */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.88rem', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Scale size={16} color="#10b981" />
                      <span>{t.weightLabel} *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleReadAloud(lang === 'hi' ? `कुल वजन दर्ज करें. अभी ${quantity} किलो यानी ${(quantity / 100).toFixed(1)} क्विंटल चुना है.` : `Enter quantity. Currently ${quantity} kilograms.`)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 700 }}
                    >
                      <Volume2 size={16} />
                      <span>{lang === 'hi' ? 'सुनें' : 'Listen'}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="10"
                      className="form-input"
                      style={{ fontSize: '1.35rem', fontWeight: 800, maxWidth: '240px', color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      required
                    />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94a3b8' }}>
                      kg = <strong style={{ color: '#ffffff' }}>{(quantity / 100).toFixed(1)} Quintal</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {[100, 250, 500, 1000, 2500].map(amt => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => {
                          setQuantity(amt);
                          handleReadAloud(`${amt} kg`);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem' }}
                      >
                        +{amt} kg ({amt / 100} Q)
                      </button>
                    ))}
                  </div>
                </div>

                {/* Harvest Date & Quality Grade Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div>
                    <label className="form-label">{t.harvestDate} *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">{t.qualityGrade} *</label>
                    <select
                      className="form-select"
                      value={qualityGrade}
                      onChange={(e) => setQualityGrade(e.target.value)}
                    >
                      <option value="Grade A">Grade A (Premium Quality)</option>
                      <option value="Grade B">Grade B (Standard Market)</option>
                      <option value="Grade C">Grade C (Fair Trade)</option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="btn btn-secondary"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ minWidth: '160px' }}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={16} className="spin-slow" />
                        <span>{lang === 'hi' ? 'ब्लॉकचेन पर दर्ज हो रहा है...' : 'Minting on Chain...'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>{t.confirmCrop}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Kisan Digital Receipt Certificate Modal */}
      <KisanReceiptModal
        crop={selectedCrop}
        block={mintedBlock}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        lang={lang}
      />

      {/* Crop Cryptographic History Modal */}
      <CropHistoryModal
        crop={selectedCrop}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        lang={lang}
      />

      {/* Farmer KYC Documents Modal */}
      {isKycModalOpen && (
        <div className="modal-overlay" onClick={() => setIsKycModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={20} />
                </div>
                <h3>
                  <span>{lang === 'hi' ? 'किसान केवाईसी व पहचान दस्तावेज' : 'Farmer KYC Verification & Documents'}</span>
                </h3>
              </div>
              <button className="modal-close" onClick={() => setIsKycModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Current Status Pill */}
              <div style={{ background: activeFarmer?.kycStatus === 'verified' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', border: `1px solid ${activeFarmer?.kycStatus === 'verified' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`, padding: '0.85rem 1.15rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {lang === 'hi' ? 'सत्यापन स्थिति' : 'CURRENT STATUS'}
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: activeFarmer?.kycStatus === 'verified' ? '#34d399' : '#fbbf24', marginTop: '0.15rem' }}>
                    {activeFarmer?.kycStatus === 'verified' ? '✓ Verified (सत्यापित)' : activeFarmer?.kycStatus === 'rejected' ? '✗ Rejected (अस्वीकृत)' : '⏳ Pending Review (लंबित)'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {lang === 'hi' ? 'किसान विशिष्ट आईडी' : 'FARMER ID'}
                  </span>
                  <div className="font-mono" style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 700, marginTop: '0.15rem' }}>
                    {activeFarmer?.uniqueId}
                  </div>
                </div>
              </div>

              {activeFarmer?.kycStatus === 'rejected' && (
                <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <strong>अस्वीकृति कारण:</strong> {activeFarmer.kycRejectionReason || 'Documents could not be verified'}
                </div>
              )}

              <form onSubmit={handleSubmitKyc}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">
                    {lang === 'hi' ? 'एग्रीस्टैक किसान आईडी (AgriStack ID) *' : 'AgriStack Farmer ID *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AGRI-PB-2026-8891"
                    className="form-input"
                    value={kycForm.agriStackId}
                    onChange={e => setKycForm({ ...kycForm, agriStackId: e.target.value })}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.2rem', display: 'block' }}>
                    {lang === 'hi' ? 'भारत सरकार डिजिटल कृषि मिशन के तहत जारी आईडी' : 'Official Farmer ID under Digital Agri Mission'}
                  </small>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label">
                      {lang === 'hi' ? 'आधार संख्या (12-Digit Aadhaar) *' : 'Aadhaar Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength="14"
                      placeholder="XXXX-XXXX-4321"
                      className="form-input"
                      value={kycForm.aadhaarNumber}
                      onChange={e => setKycForm({ ...kycForm, aadhaarNumber: e.target.value })}
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      {lang === 'hi' ? 'खतौनी / भूलेख संख्या (Land Record)' : 'Land Record / Khatauni'}
                    </label>
                    <input
                      type="text"
                      placeholder="KH-9021/26-PB"
                      className="form-input"
                      value={kycForm.khatauniNumber}
                      onChange={e => setKycForm({ ...kycForm, khatauniNumber: e.target.value })}
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">
                    {lang === 'hi' ? 'दस्तावेज / फोटो प्रमाण URL' : 'Document Proof / Photo URL'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="form-input"
                    value={kycForm.photoUrl}
                    onChange={e => setKycForm({ ...kycForm, photoUrl: e.target.value })}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
                    {lang === 'hi' ? 'या डिफ़ॉल्ट सत्यापित नमूना उपयोग करें' : 'Or use default sample verified deed'}
                  </small>
                </div>

                <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsKycModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    {t.cancel}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingKyc}
                    className="btn btn-primary"
                    style={{ minWidth: '180px' }}
                  >
                    {isSubmittingKyc ? (
                      <>
                        <RefreshCw size={15} className="spin-slow" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>{lang === 'hi' ? 'दस्तावेज जमा करें' : 'Submit for Verification'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Role Walkthrough Tutorial Modal */}
      <PortalTutorialModal
        role="farmer"
        lang={lang}
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
