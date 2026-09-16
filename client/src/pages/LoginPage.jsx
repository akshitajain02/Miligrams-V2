import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, Building2, ShoppingBag, ShieldCheck, 
  ArrowRight, CheckCircle2, AlertTriangle, 
  Sparkles, LogIn, ChevronLeft, Shield, Award 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../utils/audioFX';

export default function LoginPage({ lang = 'hi' }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Selected role for login: 'farmer' | 'warehouse' | 'buyer' | 'admin'
  const [selectedRole, setSelectedRole] = useState(null);
  const [farmersList, setFarmersList] = useState([]);
  const [buyersList, setBuyersList] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);

  // Form states
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [isRegisteringFarmer, setIsRegisteringFarmer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Farmer registration state
  const [regForm, setRegForm] = useState({
    name: '',
    contact: '',
    location: 'Ludhiana, Punjab',
    agriStackId: '',
    aadhaarNumber: '',
    khatauniNumber: ''
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/farmers').then(r => r.json()).catch(() => ({ farmers: [] })),
      fetch('/api/marketplace/buyers').then(r => r.json()).catch(() => ({ buyers: [] })),
      fetch('/api/warehouse/stock').then(r => r.json()).catch(() => ({ warehouses: [] }))
    ]).then(([fData, bData, wData]) => {
      if (fData.farmers) setFarmersList(fData.farmers);
      if (bData.buyers) setBuyersList(bData.buyers);
      if (wData.warehouses) setWarehousesList(wData.warehouses);
    });
  }, []);

  const roles = [
    {
      id: 'farmer',
      path: '/farmer',
      titleHi: 'किसान पोर्टल (Farmer)',
      titleEn: 'Farmer Voice Portal',
      descHi: 'फसल दर्ज करें, अपनी उपज का डिजिटल रिकॉर्ड देखें व पर्ची प्राप्त करें।',
      descEn: 'Log crops via voice AI, manage custody receipts and track lifecycle.',
      icon: Sprout,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      badge: lang === 'hi' ? 'सुगम आवाज AI' : 'VOICE ASSISTED'
    },
    {
      id: 'warehouse',
      path: '/warehouse',
      titleHi: 'गोदाम / साइलो हब (Warehouse)',
      titleEn: 'Smart Warehouse Silos',
      descHi: 'साइलो आवक, अनाज नमी व भंडारण क्षमता का सुरक्षित प्रबंधन।',
      descEn: 'Log produce arrivals, moisture checks and grain silo inventory.',
      icon: Building2,
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      badge: lang === 'hi' ? 'लॉजिस्टिक्स' : 'SILO LOGISTICS'
    },
    {
      id: 'buyer',
      path: '/buyer',
      titleHi: 'व्यापारी मंडी (Buyer)',
      titleEn: 'Buyer Fair-Trade',
      descHi: 'सत्यापित कृषि उपज की थोक खरीद, 15-दिन मूल्य छूट व सेटलमेंट।',
      descEn: 'Procure verified batches, view aging discounts and settle trades.',
      icon: ShoppingBag,
      color: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
      badge: lang === 'hi' ? 'थोक व्यापार' : 'FAIR-TRADE'
    },
    {
      id: 'admin',
      path: '/admin',
      titleHi: 'सिस्टम एडमिन (Admin & Ledger)',
      titleEn: 'Admin Ledger Explorer',
      descHi: 'किसान KYC सत्यापन, SHA-256 ब्लॉकचेन ऑडिट व 15-दिन साइकिल।',
      descEn: 'Farmer KYC verification, SHA-256 ledger explorer and aging engine.',
      icon: ShieldCheck,
      color: '#8b5cf6',
      bgGlow: 'rgba(139, 92, 246, 0.15)',
      badge: lang === 'hi' ? 'लेजर प्रशासन' : 'LEDGER AUDIT'
    }
  ];

  const handleRoleSelect = (roleId) => {
    soundFX.click();
    setSelectedRole(roleId);
    setFeedback(null);
    setIsRegisteringFarmer(false);

    if (roleId === 'farmer' && farmersList.length > 0) {
      setSelectedEntityId(farmersList[0].uniqueId);
    } else if (roleId === 'warehouse' && warehousesList.length > 0) {
      setSelectedEntityId(warehousesList[0].warehouseId);
    } else if (roleId === 'buyer' && buyersList.length > 0) {
      setSelectedEntityId(buyersList[0].uniqueId);
    }
  };

  const handleFarmerLogin = (farmer) => {
    soundFX.click();
    login('farmer', {
      uniqueId: farmer.uniqueId,
      name: farmer.name,
      location: farmer.location,
      contact: farmer.contact,
      kycStatus: farmer.kycStatus || 'pending',
      agriStackId: farmer.agriStackId || '',
      aadhaarNumber: farmer.aadhaarNumber || '',
      khatauniNumber: farmer.khatauniNumber || '',
      rating: farmer.rating || 5.0
    });
    navigate('/farmer');
  };

  const handleWarehouseLogin = () => {
    soundFX.click();
    const wh = warehousesList.find(w => w.warehouseId === selectedEntityId) || {
      warehouseId: selectedEntityId || 'WH-CENTRAL-01',
      location: 'Central Grain Logistics Hub'
    };
    login('warehouse', {
      uniqueId: wh.warehouseId,
      name: wh.warehouseId,
      location: wh.location
    });
    navigate('/warehouse');
  };

  const handleBuyerLogin = () => {
    soundFX.click();
    const buyer = buyersList.find(b => b.uniqueId === selectedEntityId) || {
      uniqueId: selectedEntityId || 'BUYER-501',
      name: 'Punjab Agri Commodities Ltd.'
    };
    login('buyer', {
      uniqueId: buyer.uniqueId,
      name: buyer.name,
      organization: buyer.organization || buyer.name
    });
    navigate('/buyer');
  };

  const handleAdminLogin = () => {
    soundFX.click();
    login('admin', {
      uniqueId: 'ADMIN-ROOT',
      name: 'Cryptographic Ledger Administrator',
      role: 'admin'
    });
    navigate('/admin');
  };

  const handleFarmerRegister = async (e) => {
    e.preventDefault();
    if (!regForm.name.trim()) {
      setFeedback({ type: 'error', message: lang === 'hi' ? 'कृपया किसान का नाम दर्ज करें' : 'Farmer name is required' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/farmers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regForm.name,
          contact: regForm.contact,
          location: regForm.location,
          agriStackId: regForm.agriStackId || `AGRI-IN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          aadhaarNumber: regForm.aadhaarNumber,
          khatauniNumber: regForm.khatauniNumber
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      login('farmer', {
        uniqueId: data.farmer.uniqueId,
        name: data.farmer.name,
        location: data.farmer.location,
        contact: data.farmer.contact,
        kycStatus: 'pending',
        agriStackId: data.farmer.agriStackId,
        aadhaarNumber: data.farmer.aadhaarNumber,
        khatauniNumber: data.farmer.khatauniNumber,
        rating: 5.0
      });

      navigate('/farmer');
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '1.5rem auto 4rem', padding: '0 1rem' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '0.35rem 0.9rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.85rem' }}>
          <Sparkles size={14} />
          <span>MILIGRAMS SECURE ROLE GATEWAY</span>
        </div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
          {lang === 'hi' ? 'मिलीग्राम्स पोर्टल में प्रवेश करें' : 'Sign in to Miligrams Portal'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.45rem' }}>
          {lang === 'hi' 
            ? 'अपनी संबंधित भूमिका चुनें और अपने सुरक्षित कार्यक्षेत्र में लॉगिन करें'
            : 'Select your organizational persona to access your dedicated cryptographic portal'}
        </p>
      </div>

      {/* Step 1: Role Selection ("Login As") */}
      {!selectedRole && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {lang === 'hi' ? 'चरण 1: किसके रूप में लॉगिन करना चाहते हैं?' : 'STEP 1: LOGIN AS'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.35rem' }}>
            {roles.map(r => {
              const Icon = r.icon;
              return (
                <div
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  className="glass-panel glass-panel-glow"
                  style={{
                    padding: '1.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderTop: `4px solid ${r.color}`,
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: r.bgGlow, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${r.color}35` }}>
                        <Icon size={24} />
                      </div>
                      <span className="badge" style={{ background: `${r.color}15`, color: r.color, borderColor: `${r.color}30` }}>
                        {r.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                      {lang === 'hi' ? r.titleHi : r.titleEn}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                      {lang === 'hi' ? r.descHi : r.descEn}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-light)', fontWeight: 700 }}>
                      {lang === 'hi' ? 'लॉगिन करें' : 'Proceed'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: r.color, fontWeight: 800, fontSize: '0.84rem' }}>
                      <span>{lang === 'hi' ? 'चुनें' : 'Select'}</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Dedicated Role Login Panels */}
      {selectedRole && (
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          {/* Back Button */}
          <button
            onClick={() => setSelectedRole(null)}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ChevronLeft size={16} />
            <span>{lang === 'hi' ? 'वापस: अन्य भूमिका चुनें (Change Role)' : 'Back: Choose Another Role'}</span>
          </button>

          {/* Feedback banner */}
          {feedback && (
            <div style={{ padding: '0.9rem 1.2rem', borderRadius: '10px', marginBottom: '1.25rem', background: feedback.type === 'error' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: feedback.type === 'error' ? '#fb7185' : '#34d399', border: `1px solid ${feedback.type === 'error' ? '#f43f5e50' : '#10b98150'}`, fontWeight: 700, fontSize: '0.86rem' }}>
              {feedback.message}
            </div>
          )}

          {/* 1. FARMER LOGIN PANEL */}
          {selectedRole === 'farmer' && !isRegisteringFarmer && (
            <div className="glass-panel" style={{ padding: '2.25rem', borderTop: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sprout size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {lang === 'hi' ? 'किसान लॉगिन (Farmer Access)' : 'Farmer Voice Login'}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                    {lang === 'hi' ? 'सत्यापित या नए किसान के रूप में प्रवेश करें' : 'Sign in as registered or new farmer'}
                  </p>
                </div>
              </div>

              {/* Demo 1-Click Farmers */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  {lang === 'hi' ? 'त्वरित डेमो लॉगिन (1-Click Demo Profiles):' : 'Fast Demo Profiles:'}
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Ramesh Patel - Verified */}
                  <div
                    onClick={() => {
                      const f = farmersList.find(x => x.uniqueId === 'FARMER-101') || {
                        uniqueId: 'FARMER-101',
                        name: 'Ramesh Patel',
                        location: 'Ludhiana, Punjab',
                        kycStatus: 'verified',
                        agriStackId: 'AGRI-PB-2026-8891',
                        aadhaarNumber: 'XXXX-XXXX-4321',
                        khatauniNumber: 'KH-9021/26-PB',
                        rating: 4.9
                      };
                      handleFarmerLogin(f);
                    }}
                    style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.98rem' }}>Ramesh Patel (रमेश पटेल)</strong>
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                          <CheckCircle2 size={11} />
                          <span>KYC Verified</span>
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        ID: FARMER-101 • AgriStack: AGRI-PB-2026-8891 • ⭐ 4.9 Rating
                      </div>
                    </div>
                    <ArrowRight size={18} color="#10b981" />
                  </div>

                  {/* Sita Devi - Pending KYC */}
                  <div
                    onClick={() => {
                      const f = farmersList.find(x => x.uniqueId === 'FARMER-102') || {
                        uniqueId: 'FARMER-102',
                        name: 'Sita Devi',
                        location: 'Karnal, Haryana',
                        kycStatus: 'pending',
                        agriStackId: 'AGRI-HR-2026-1042',
                        aadhaarNumber: 'XXXX-XXXX-2233',
                        khatauniNumber: 'KH-4412/26-HR',
                        rating: 4.7
                      };
                      handleFarmerLogin(f);
                    }}
                    style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.98rem' }}>Sita Devi (सीता देवी)</strong>
                        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                          <AlertTriangle size={11} />
                          <span>KYC Pending</span>
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        ID: FARMER-102 • AgriStack: AGRI-HR-2026-1042 • Marketplace Locked
                      </div>
                    </div>
                    <ArrowRight size={18} color="#f59e0b" />
                  </div>
                </div>
              </div>

              {/* Or Select from list */}
              {farmersList.length > 2 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                    {lang === 'hi' ? 'या अन्य पंजीकृत किसान चुनें:' : 'Or Select Other Farmer:'}
                  </label>
                  <select
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', marginBottom: '1rem' }}
                  >
                    {farmersList.map(f => (
                      <option key={f.uniqueId} value={f.uniqueId}>
                        {f.name} ({f.uniqueId} - {f.kycStatus === 'verified' ? 'Verified' : 'Pending'})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      const f = farmersList.find(x => x.uniqueId === selectedEntityId);
                      if (f) handleFarmerLogin(f);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    <LogIn size={16} />
                    <span>{lang === 'hi' ? 'लॉगिन करें' : 'Sign In as Selected Farmer'}</span>
                  </button>
                </div>
              )}

              {/* Toggle to New Farmer Registration */}
              <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '0.65rem' }}>
                  {lang === 'hi' ? 'क्या आप नए किसान हैं?' : 'Are you a new farmer?'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsRegisteringFarmer(true)}
                  className="btn btn-secondary"
                  style={{ width: '100%', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
                >
                  <Award size={16} />
                  <span>{lang === 'hi' ? 'नया किसान पंजीकरण व KYC दस्तावेज जमा करें' : 'Register New Farmer with AgriStack KYC'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 1.B NEW FARMER REGISTRATION & KYC SUBMISSION */}
          {selectedRole === 'farmer' && isRegisteringFarmer && (
            <div className="glass-panel" style={{ padding: '2.25rem', borderTop: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Award size={24} color="#10b981" />
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                      {lang === 'hi' ? 'नया किसान पंजीकरण व KYC' : 'Farmer Registration & KYC'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                      {lang === 'hi' ? 'दस्तावेज जमा करें (स्थिति: सत्यापन लंबित रहेगी)' : 'Submit documents for Admin Verification'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRegisteringFarmer(false)}
                  className="btn btn-secondary btn-sm"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>

              <form onSubmit={handleFarmerRegister}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      {lang === 'hi' ? 'किसान का पूरा नाम *' : 'Farmer Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gurpreet Singh"
                      value={regForm.name}
                      onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                      className="input-field"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      {lang === 'hi' ? 'मोबाइल नंबर *' : 'Contact Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 00000"
                      value={regForm.contact}
                      onChange={e => setRegForm({ ...regForm, contact: e.target.value })}
                      className="input-field"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    {lang === 'hi' ? 'स्थान / गांव / जिला' : 'Location / Village / District'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samrala, Ludhiana, Punjab"
                    value={regForm.location}
                    onChange={e => setRegForm({ ...regForm, location: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                {/* KYC Section */}
                <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#34d399', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.85rem' }}>
                    <Shield size={16} />
                    <span>{lang === 'hi' ? 'सत्यापन दस्तावेज (KYC Authentication)' : 'Official KYC Credentials'}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        {lang === 'hi' ? 'एग्रीस्टैक आईडी (AgriStack ID)' : 'AgriStack Farmer ID'}
                      </label>
                      <input
                        type="text"
                        placeholder="AGRI-PB-2026-XXXX"
                        value={regForm.agriStackId}
                        onChange={e => setRegForm({ ...regForm, agriStackId: e.target.value })}
                        className="input-field"
                        style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        {lang === 'hi' ? 'आधार संख्या (12-Digit Aadhaar)' : 'Aadhaar Card Number'}
                      </label>
                      <input
                        type="text"
                        maxLength="14"
                        placeholder="XXXX-XXXX-9999"
                        value={regForm.aadhaarNumber}
                        onChange={e => setRegForm({ ...regForm, aadhaarNumber: e.target.value })}
                        className="input-field"
                        style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      {lang === 'hi' ? 'खतौनी / भूलेख संख्या (Land Record / Khatauni)' : 'Land Record / Khatauni Number'}
                    </label>
                    <input
                      type="text"
                      placeholder="KH-8821/2026"
                      value={regForm.khatauniNumber}
                      onChange={e => setRegForm({ ...regForm, khatauniNumber: e.target.value })}
                      className="input-field"
                      style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace' }}
                    />
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.4 }}>
                    ℹ️ {lang === 'hi' 
                      ? 'दस्तावेज जमा करने के बाद आपकी स्थिति "Pending" रहेगी। एडमिन द्वारा सत्यापन के बाद ही मंडी में बिक्री शुरू होगी।' 
                      : 'After submission, status will be "Pending". Marketplace selling activates after Admin approval.'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', fontWeight: 800 }}
                >
                  <CheckCircle2 size={18} />
                  <span>{isSubmitting ? 'Registering...' : (lang === 'hi' ? 'पंजीकरण पूरा करें व लॉगिन करें' : 'Complete Registration & Sign In')}</span>
                </button>
              </form>
            </div>
          )}

          {/* 2. WAREHOUSE LOGIN PANEL */}
          {selectedRole === 'warehouse' && (
            <div className="glass-panel" style={{ padding: '2.25rem', borderTop: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {lang === 'hi' ? 'गोदाम प्रबंधक लॉगिन' : 'Warehouse Hub Login'}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                    {lang === 'hi' ? 'साइलो व आवक प्रबंधन पैनल' : 'Silo & Storage Ingestion Portal'}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {lang === 'hi' ? 'सक्रिय साइलो हब चुनें:' : 'Select Silo Hub Facility:'}
                </label>
                <select
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', marginBottom: '1rem', fontSize: '0.95rem' }}
                >
                  <option value="WH-CENTRAL-01">WH-CENTRAL-01 (Ambala Logistics Hub, Haryana)</option>
                  <option value="WH-NORTH-02">WH-NORTH-02 (Patiala Grain Depot, Punjab)</option>
                </select>
              </div>

              <button
                onClick={handleWarehouseLogin}
                className="btn btn-warning btn-lg"
                style={{ width: '100%', fontWeight: 800 }}
              >
                <LogIn size={18} />
                <span>{lang === 'hi' ? 'गोदाम पैनल में प्रवेश करें' : 'Sign In to Warehouse Hub'}</span>
              </button>
            </div>
          )}

          {/* 3. BUYER LOGIN PANEL */}
          {selectedRole === 'buyer' && (
            <div className="glass-panel" style={{ padding: '2.25rem', borderTop: '4px solid #06b6d4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {lang === 'hi' ? 'व्यापारी व मंडी लॉगिन' : 'Buyer Fair-Trade Login'}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                    {lang === 'hi' ? 'थोक खरीददार व मंडी ट्रेडर्स' : 'Agricultural Commodity Merchants'}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {lang === 'hi' ? 'व्यापारी पहचान (Trader Account):' : 'Trader / Organization:'}
                </label>
                <select
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', marginBottom: '1rem', fontSize: '0.95rem' }}
                >
                  <option value="BUYER-501">Punjab Agri Commodities Ltd. (BUYER-501)</option>
                  <option value="BUYER-502">GreenEarth Organics Inc. (BUYER-502)</option>
                </select>
              </div>

              <button
                onClick={handleBuyerLogin}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', background: '#06b6d4', borderColor: '#06b6d4', fontWeight: 800 }}
              >
                <LogIn size={18} />
                <span>{lang === 'hi' ? 'मंडी मार्केटप्लेस में प्रवेश करें' : 'Sign In to Marketplace'}</span>
              </button>
            </div>
          )}

          {/* 4. ADMIN LOGIN PANEL */}
          {selectedRole === 'admin' && (
            <div className="glass-panel" style={{ padding: '2.25rem', borderTop: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {lang === 'hi' ? 'सिस्टम एडमिन व लेजर गवर्नेंस' : 'System Administrator Login'}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                    {lang === 'hi' ? 'KYC सत्यापन, लेजर ऑडिट व क्रिप्टोग्राफिक टूल्स' : 'KYC verification, block explorer & audits'}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                  {lang === 'hi' ? 'एडमिन सुरक्षा पासकी (Passkey)' : 'Administrator Passkey'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    defaultValue="admin2026"
                    className="input-field"
                    style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontSize: '0.74rem', fontWeight: 700 }}>
                    READY
                  </div>
                </div>
              </div>

              <button
                onClick={handleAdminLogin}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', background: '#8b5cf6', borderColor: '#8b5cf6', fontWeight: 800 }}
              >
                <ShieldCheck size={18} />
                <span>{lang === 'hi' ? 'एडमिन पैनल में लॉगिन करें' : 'Authenticate as Administrator'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
