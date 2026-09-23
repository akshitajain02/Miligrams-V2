import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertOctagon, RefreshCw, Search, ShieldAlert, 
  RotateCcw, UserPlus, Building2, ShoppingBag, CheckCircle2, 
  AlertCircle, Clock, Play, Cpu, Database, Link2, FileText, 
  X, AlertTriangle, Star, Check, Shield, Award, User, BookOpen
} from 'lucide-react';
import BlockCard from '../components/BlockCard';
import PortalTutorialModal from '../components/PortalTutorialModal';

export default function AdminPortal({ lang = 'hi' }) {
  const [activeTab, setActiveTab] = useState('kyc'); // 'kyc' | 'ledger' | 'aging' | 'participants' | 'register'
  const [blocks, setBlocks] = useState([]);
  const [verification, setVerification] = useState({ isValid: true, chainLength: 0, summary: 'Checking...' });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tamperStatus, setTamperStatus] = useState(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('miligrams_tour_admin_seen');
      if (!seen) {
        setIsTutorialOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // KYC Verification Hub states
  const [kycFilter, setKycFilter] = useState('all'); // 'all' | 'pending' | 'verified' | 'rejected'
  const [rejectionModalFarmer, setRejectionModalFarmer] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [isUpdatingKyc, setIsUpdatingKyc] = useState(false);
  const [kycSuccessMsg, setKycSuccessMsg] = useState(null);

  // Aging check results
  const [agingReport, setAgingReport] = useState(null);
  const [isCheckingAging, setIsCheckingAging] = useState(false);

  // Participants directory
  const [farmersList, setFarmersList] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);
  const [buyersList, setBuyersList] = useState([]);

  // Registration form states
  const [regRole, setRegRole] = useState('farmer');
  const [farmerForm, setFarmerForm] = useState({ name: '', uniqueId: '', contact: '', location: '' });
  const [warehouseForm, setWarehouseForm] = useState({ warehouseId: '', location: '', capacity: 20000 });
  const [buyerForm, setBuyerForm] = useState({ name: '', uniqueId: '', contact: '', organization: '' });
  const [formFeedback, setFormFeedback] = useState(null);

  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      const [blocksRes, verifyRes, fRes, wRes, bRes] = await Promise.all([
        fetch('/api/ledger/blocks'),
        fetch('/api/ledger/verify-chain'),
        fetch('/api/farmers'),
        fetch('/api/warehouse/stock'),
        fetch('/api/marketplace/buyers')
      ]);

      const blocksData = await blocksRes.json();
      const verifyData = await verifyRes.json();
      const fData = await fRes.json();
      const wData = await wRes.json();
      const bData = await bRes.json();

      if (blocksData.success) setBlocks(blocksData.chain || []);
      if (verifyData.success) setVerification(verifyData);
      if (fData.success) setFarmersList(fData.farmers || []);
      if (wData.success) setWarehousesList(wData.warehouses || []);
      if (bData.success) setBuyersList(bData.buyers || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const triggerAgingCheck = async () => {
    setIsCheckingAging(true);
    setAgingReport(null);
    try {
      const res = await fetch('/api/crops/check-aging');
      const data = await res.json();
      setAgingReport(data);
      fetchLedgerData();
    } catch (err) {
      alert(`Aging check error: ${err.message}`);
    } finally {
      setIsCheckingAging(false);
    }
  };

  const simulateTamper = async () => {
    if (blocks.length < 2) {
      alert('Need at least 1 crop block added to simulate tampering.');
      return;
    }

    try {
      const res = await fetch('/api/ledger/simulate-tamper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockIndex: 1,
          tamperedField: 'quantity',
          newValue: 999999
        })
      });
      const data = await res.json();
      setTamperStatus({
        type: 'tampered',
        message: `Tampered Block #1 quantity in-memory to 999,999 kg! Re-verifying chain...`
      });
      fetchLedgerData();
    } catch (err) {
      alert(`Tamper simulation failed: ${err.message}`);
    }
  };

  const restoreChain = async () => {
    try {
      const res = await fetch('/api/ledger/restore-chain', { method: 'POST' });
      const data = await res.json();
      setTamperStatus({
        type: 'restored',
        message: 'Chain restored to original state from persistent database records.'
      });
      fetchLedgerData();
    } catch (err) {
      alert(`Restore failed: ${err.message}`);
    }
  };

  const handleUpdateKycStatus = async (farmerUniqueId, newStatus, reason = '') => {
    setIsUpdatingKyc(true);
    setKycSuccessMsg(null);
    try {
      const res = await fetch(`/api/farmers/${farmerUniqueId}/kyc-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejectionReason: reason })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update KYC status');
      }
      setKycSuccessMsg(
        lang === 'hi' 
          ? `किसान (${farmerUniqueId}) का KYC '${newStatus === 'verified' ? 'सत्यापित (Verified)' : 'अस्वीकृत (Rejected)'}' कर दिया गया!`
          : `Farmer (${farmerUniqueId}) KYC updated to '${newStatus}'!`
      );
      setRejectionModalFarmer(null);
      setRejectionReasonText('');
      await fetchLedgerData();
    } catch (err) {
      alert(`KYC Update Error: ${err.message}`);
    } finally {
      setIsUpdatingKyc(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormFeedback(null);
    try {
      let endpoint = '';
      let body = {};
      if (regRole === 'farmer') {
        const cleanPhone = (farmerForm.contact || '').replace(/\D/g, '');
        if (cleanPhone && cleanPhone.length > 10) {
          throw new Error(lang === 'hi' ? 'फोन नंबर 10 अंकों से अधिक नहीं हो सकता।' : 'Phone number cannot exceed 10 digits.');
        }
        endpoint = '/api/farmers/register';
        body = { ...farmerForm, contact: cleanPhone };
      } else if (regRole === 'warehouse') {
        endpoint = '/api/warehouse/register';
        body = warehouseForm;
      } else {
        const cleanPhone = (buyerForm.contact || '').replace(/\D/g, '');
        if (cleanPhone && cleanPhone.length > 10) {
          throw new Error(lang === 'hi' ? 'फोन नंबर 10 अंकों से अधिक नहीं हो सकता।' : 'Phone number cannot exceed 10 digits.');
        }
        endpoint = '/api/marketplace/buyers/register';
        body = { ...buyerForm, contact: cleanPhone };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed');

      setFormFeedback({ type: 'success', message: `${regRole.toUpperCase()} registered successfully!` });
      setFarmerForm({ name: '', uniqueId: '', contact: '', location: '' });
      setWarehouseForm({ warehouseId: '', location: '', capacity: 20000 });
      setBuyerForm({ name: '', uniqueId: '', contact: '', organization: '' });
      fetchLedgerData();
    } catch (err) {
      setFormFeedback({ type: 'error', message: err.message });
    }
  };

  const filteredBlocks = blocks.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.index.toString() === q ||
      b.hash.toLowerCase().includes(q) ||
      b.previousHash.toLowerCase().includes(q) ||
      JSON.stringify(b.data).toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem 2.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, var(--surface-alt) 100%)', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
        <div>
          <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', borderColor: 'rgba(139, 92, 246, 0.3)', marginBottom: '0.65rem' }}>
            <ShieldCheck size={13} />
            <span>CRYPTOGRAPHIC LEDGER GOVERNANCE</span>
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: '0.35rem 0' }}>
            {lang === 'hi' ? 'एडमिन व ब्लॉकचेन लेजर पोर्टल' : 'Admin & Blockchain Ledger Explorer'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', maxWidth: '600px' }}>
            {lang === 'hi'
              ? 'क्रिप्टोग्राफिक SHA-256 ब्लॉकचेन सत्यापन, 15-दिन उम्र सत्यापन चक्र, और छेड़छाड़-रोधी परीक्षण।'
              : 'Audit cryptographic SHA-256 blocks, trigger 15-day crop aging checks, and test tamper detection.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => setIsTutorialOpen(true)} 
            className="btn btn-secondary btn-sm" 
            style={{ borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c084fc' }}
            title={lang === 'hi' ? 'एडमिन लेजर मार्गदर्शिका देखें' : 'View Admin Ledger Tutorial'}
          >
            <BookOpen size={14} />
            <span>{lang === 'hi' ? '📖 ट्यूटोरियल' : '📖 Tour'}</span>
          </button>

          <button onClick={fetchLedgerData} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin-slow' : ''} />
            <span>{lang === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Chain Verification Status Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          background: verification.isValid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.1)',
          borderColor: verification.isValid ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {verification.isValid ? (
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={28} />
            </div>
          ) : (
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertOctagon size={28} />
            </div>
          )}
          <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {verification.isValid
                ? (lang === 'hi' ? 'ब्लॉकचेन अखंडता: 100% सत्यापित व सुरक्षित' : 'Blockchain Integrity: 100% Cryptographically Intact')
                : (lang === 'hi' ? 'गंभीर चेतावनी: लेजर में छेड़छाड़ पकड़ी गई!' : 'Critical Alert: Cryptographic Tampering Detected!')}
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {verification.summary}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 800, letterSpacing: '0.05em' }}>
            Mined Blocks
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace' }}>
            #{blocks.length}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`btn ${activeTab === 'kyc' ? 'btn-primary' : 'btn-secondary'}`}
          style={activeTab === 'kyc' ? { background: '#10b981', borderColor: '#10b981' } : {}}
        >
          <ShieldCheck size={16} />
          <span>{lang === 'hi' ? 'किसान केवाईसी सत्यापन' : 'Farmer KYC Hub'}</span>
          {farmersList.filter(f => f.kycStatus === 'pending').length > 0 && (
            <span style={{ background: '#f59e0b', color: '#000', borderRadius: '9999px', fontSize: '0.68rem', padding: '0.1rem 0.45rem', fontWeight: 900 }}>
              {farmersList.filter(f => f.kycStatus === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`btn ${activeTab === 'ledger' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Link2 size={16} />
          <span>{lang === 'hi' ? 'ब्लॉकचेन लेजर (Explorer)' : 'Ledger Explorer'}</span>
        </button>

        <button
          onClick={() => setActiveTab('aging')}
          className={`btn ${activeTab === 'aging' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Clock size={16} />
          <span>{lang === 'hi' ? '15-दिन उम्र चक्र (Aging Engine)' : '15-Day Aging Engine'}</span>
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          className={`btn ${activeTab === 'participants' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Building2 size={16} />
          <span>{lang === 'hi' ? 'नेटवर्क भागीदार' : 'Network Actors'}</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`btn ${activeTab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <UserPlus size={16} />
          <span>{lang === 'hi' ? 'नया भागीदार जोड़ें' : 'Register Actor'}</span>
        </button>
      </div>

      {/* Tab 0: Farmer KYC Verification Hub */}
      {activeTab === 'kyc' && (
        <div>
          {/* KYC Feedback Banner */}
          {kycSuccessMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', padding: '1rem 1.4rem', borderRadius: 'var(--radius)', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CheckCircle2 size={20} color="#10b981" />
                <span>{kycSuccessMsg}</span>
              </div>
              <button onClick={() => setKycSuccessMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}>
                <X size={18} />
              </button>
            </div>
          )}

          {/* KYC Filter & Overview Bar */}
          <div className="glass-panel" style={{ padding: '1.4rem 1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Shield size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {lang === 'hi' ? 'किसान केवाईसी व पहचान सत्यापन (Farmer KYC Hub)' : 'Farmer KYC Verification Governance'}
                </h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: 0 }}>
                {lang === 'hi' 
                  ? 'AgriStack आईडी, आधार संख्या व खतौनी भूलेख का सत्यापन करें। केवल सत्यापित किसानों की उपज मंडी में दिखेगी।' 
                  : 'Inspect submitted credentials. Only approved farmers are eligible for Buyer Marketplace sales.'}
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setKycFilter('all')}
                className={`btn btn-sm ${kycFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              >
                {lang === 'hi' ? `सभी (${farmersList.length})` : `All (${farmersList.length})`}
              </button>
              <button
                onClick={() => setKycFilter('pending')}
                className={`btn btn-sm ${kycFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                style={kycFilter === 'pending' ? { background: '#f59e0b', borderColor: '#f59e0b', color: '#000' } : {}}
              >
                <Clock size={13} />
                <span>{lang === 'hi' ? `सत्यापन लंबित (${farmersList.filter(f => f.kycStatus === 'pending').length})` : `Pending (${farmersList.filter(f => f.kycStatus === 'pending').length})`}</span>
              </button>
              <button
                onClick={() => setKycFilter('verified')}
                className={`btn btn-sm ${kycFilter === 'verified' ? 'btn-primary' : 'btn-secondary'}`}
                style={kycFilter === 'verified' ? { background: '#10b981', borderColor: '#10b981' } : {}}
              >
                <CheckCircle2 size={13} />
                <span>{lang === 'hi' ? `सत्यापित (${farmersList.filter(f => f.kycStatus === 'verified').length})` : `Verified (${farmersList.filter(f => f.kycStatus === 'verified').length})`}</span>
              </button>
              <button
                onClick={() => setKycFilter('rejected')}
                className={`btn btn-sm ${kycFilter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
                style={kycFilter === 'rejected' ? { background: '#f43f5e', borderColor: '#f43f5e' } : {}}
              >
                <AlertTriangle size={13} />
                <span>{lang === 'hi' ? `अस्वीकृत (${farmersList.filter(f => f.kycStatus === 'rejected').length})` : `Rejected (${farmersList.filter(f => f.kycStatus === 'rejected').length})`}</span>
              </button>
            </div>
          </div>

          {/* KYC Farmers Review List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
            {farmersList
              .filter(f => {
                if (kycFilter === 'pending') return f.kycStatus === 'pending';
                if (kycFilter === 'verified') return f.kycStatus === 'verified';
                if (kycFilter === 'rejected') return f.kycStatus === 'rejected';
                return true;
              })
              .map(farmer => {
                const isVerified = farmer.kycStatus === 'verified';
                const isRejected = farmer.kycStatus === 'rejected';

                return (
                  <div
                    key={farmer.uniqueId}
                    className="glass-panel"
                    style={{
                      padding: '1.5rem',
                      borderLeft: isVerified ? '4px solid #10b981' : isRejected ? '4px solid #f43f5e' : '4px solid #f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.15rem', maxWidth: '680px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isVerified ? 'rgba(16, 185, 129, 0.15)' : isRejected ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: isVerified ? '#10b981' : isRejected ? '#f43f5e' : '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={24} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                          <strong style={{ fontSize: '1.12rem', color: 'var(--text-main)' }}>{farmer.name}</strong>
                          <span className="font-mono" style={{ fontSize: '0.74rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                            {farmer.uniqueId}
                          </span>

                          <span className="badge" style={{ 
                            background: isVerified ? 'rgba(16, 185, 129, 0.15)' : isRejected ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: isVerified ? '#34d399' : isRejected ? '#fb7185' : '#fbbf24',
                            borderColor: isVerified ? 'rgba(16, 185, 129, 0.35)' : isRejected ? 'rgba(244, 63, 94, 0.35)' : 'rgba(245, 158, 11, 0.35)'
                          }}>
                            {isVerified ? '✓ AgriStack Verified' : isRejected ? '✗ KYC Rejected' : '⏳ Verification Pending'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                          <span>📍 {farmer.location}</span>
                          <span>📞 {farmer.contact || 'N/A'}</span>
                          <span>⭐ Rating: {farmer.rating || 5.0} ({farmer.totalReviews || 0} reviews)</span>
                        </div>

                        {/* KYC Credentials Badges */}
                        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                          <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                            <span style={{ color: 'var(--text-light)', fontWeight: 700 }}>AgriStack ID: </span>
                            <span className="font-mono" style={{ color: '#34d399' }}>{farmer.agriStackId || 'Not Provided'}</span>
                          </div>

                          <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                            <span style={{ color: 'var(--text-light)', fontWeight: 700 }}>Aadhaar: </span>
                            <span className="font-mono" style={{ color: '#38bdf8' }}>{farmer.aadhaarNumber || 'Verified'}</span>
                          </div>

                          <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                            <span style={{ color: 'var(--text-light)', fontWeight: 700 }}>Khatauni / Land: </span>
                            <span className="font-mono" style={{ color: '#fbbf24' }}>{farmer.khatauniNumber || 'Deed Verified'}</span>
                          </div>
                        </div>

                        {isRejected && farmer.kycRejectionReason && (
                          <div style={{ marginTop: '0.5rem', color: '#fb7185', fontSize: '0.78rem' }}>
                            <strong>Rejection Note:</strong> {farmer.kycRejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Verification Actions */}
                    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                      {!isVerified && (
                        <button
                          onClick={() => handleUpdateKycStatus(farmer.uniqueId, 'verified')}
                          disabled={isUpdatingKyc}
                          className="btn btn-primary btn-sm"
                          style={{ background: '#10b981', borderColor: '#10b981' }}
                        >
                          <CheckCircle2 size={14} />
                          <span>{lang === 'hi' ? 'स्वीकृत करें (Approve)' : 'Approve & Verify'}</span>
                        </button>
                      )}

                      {!isRejected && (
                        <button
                          onClick={() => {
                            setRejectionModalFarmer(farmer);
                            setRejectionReasonText('');
                          }}
                          disabled={isUpdatingKyc}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.35)' }}
                        >
                          <X size={14} />
                          <span>{lang === 'hi' ? 'अस्वीकृत करें (Reject)' : 'Reject'}</span>
                        </button>
                      )}

                      {isVerified && (
                        <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle2 size={15} />
                          <span>{lang === 'hi' ? 'मंडी में सक्षम' : 'Marketplace Active'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 1: Ledger Explorer */}
      {activeTab === 'ledger' && (
        <div>
          {/* Tamper Demonstration Sandbox */}
          <div className="glass-panel" style={{ padding: '1.4rem 1.75rem', marginBottom: '2rem', borderStyle: 'dashed', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldAlert size={18} color="#f59e0b" />
                  <span>{lang === 'hi' ? 'शैक्षणिक डेमो: क्रिप्टोग्राफिक छेड़छाड़-रोधी परीक्षण' : 'Interactive Sandbox: SHA-256 Tamper Detection'}</span>
                </strong>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {lang === 'hi'
                    ? 'ब्लॉक डेटा बदलने से मर्कल रूट और SHA-256 हैश टूट जाता है, जिससे सत्यापन तुरंत विफल हो जाता है।'
                    : 'Modifying a single byte invalidates the Merkle root and breaks hash linkage immediately.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  onClick={simulateTamper}
                  className="btn btn-sm btn-danger"
                >
                  <ShieldAlert size={15} />
                  <span>{lang === 'hi' ? 'ब्लॉक #1 में छेड़छाड़ करें' : 'Simulate Tamper on Block #1'}</span>
                </button>
                <button
                  onClick={restoreChain}
                  className="btn btn-sm btn-secondary"
                >
                  <RotateCcw size={15} />
                  <span>{lang === 'hi' ? 'पुनर्स्थापित करें (Restore)' : 'Restore Original Chain'}</span>
                </button>
              </div>
            </div>

            {tamperStatus && (
              <div style={{ marginTop: '1rem', fontSize: '0.86rem', padding: '0.75rem 1rem', borderRadius: '8px', background: tamperStatus.type === 'tampered' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: tamperStatus.type === 'tampered' ? '#fb7185' : '#34d399', border: `1px solid ${tamperStatus.type === 'tampered' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` }}>
                {tamperStatus.message}
              </div>
            )}
          </div>

          {/* Search Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface-alt)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '0.6rem 1rem', flex: 1, maxWidth: '440px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder={lang === 'hi' ? 'ब्लॉक #, SHA-256 हैश, या विवरण से खोजें...' : 'Search block #, hash, or payload details...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.88rem', color: 'var(--text-main)' }}
              />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {lang === 'hi' ? `कुल ${blocks.length} में से ${filteredBlocks.length} ब्लॉक` : `Showing ${filteredBlocks.length} of ${blocks.length} Blocks`}
            </div>
          </div>

          {/* Blocks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredBlocks.map(block => (
              <BlockCard key={block.index} block={block} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Aging & Extended Verification Engine */}
      {activeTab === 'aging' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="#f59e0b" />
                <span>15-दिन फसल उम्र सत्यापन चक्र (Crop Aging Engine)</span>
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.35rem', maxWidth: '650px' }}>
                15 दिन तक न बिकने वाली फसलों को स्वतः 'aged-relisted' बनाकर 20% मूल्य छूट व ब्लॉकचेन री-वेरिफिकेशन दर्ज करता है। 30 दिन बाद 'unsellable' मार्क करता है।
              </p>
            </div>

            <button
              onClick={triggerAgingCheck}
              disabled={isCheckingAging}
              className="btn btn-accent"
              style={{ fontWeight: 800 }}
            >
              <Play size={16} />
              <span>{isCheckingAging ? 'जांच जारी है...' : 'अभी 15-दिन चक्र चलाएं (Run Check)'}</span>
            </button>
          </div>

          {agingReport && (
            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.4rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#34d399', fontWeight: 700 }}>
                <CheckCircle2 size={18} />
                <span>{agingReport.message}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.74rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>जांची गई फसलें</span>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace' }}>{agingReport.totalChecked}</strong>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <span style={{ color: '#fbbf24', fontSize: '0.74rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>पुनः सत्यापित (Aged-Relisted)</span>
                  <strong style={{ fontSize: '1.5rem', color: '#fbbf24', fontFamily: 'JetBrains Mono, monospace' }}>{agingReport.reverifiedCount}</strong>
                </div>

                <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                  <span style={{ color: '#fb7185', fontSize: '0.74rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>बिक्री अयोग्य (Unsellable)</span>
                  <strong style={{ fontSize: '1.5rem', color: '#f43f5e', fontFamily: 'JetBrains Mono, monospace' }}>{agingReport.unsellableCount}</strong>
                </div>
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '1rem 1.25rem', fontSize: '0.86rem', color: '#34d399' }}>
            💡 <strong>डेमो टिप (Interactive Tip):</strong> किसान पोर्टल पर किसी भी फसल के कार्ड पर मौजूद <strong>"15 दिन उम्र बढ़ाएं"</strong> बटन दबाकर आप तुरंत लाइव री-वेरिफिकेशन और ब्लॉकचेन ब्लॉक तैयार देख सकते हैं।
          </div>
        </div>
      )}

      {/* Tab 3: Participants Directory */}
      {activeTab === 'participants' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              पंजीकृत नेटवर्क भागीदार (Registered Network Actors)
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>भूमिका (Role)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>नाम (Name)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>यूनिक पहचान (ID)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>स्थान / विवरण</th>
                </tr>
              </thead>
              <tbody>
                {farmersList.map(f => (
                  <tr key={f.uniqueId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}><span className="badge badge-farm">किसान (Farmer)</span></td>
                    <td style={{ padding: '1rem' }}><strong style={{ color: 'var(--text-main)' }}>{f.name}</strong></td>
                    <td style={{ padding: '1rem' }}><span className="font-mono" style={{ color: '#38bdf8' }}>{f.uniqueId}</span></td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{f.location}</td>
                  </tr>
                ))}
                {warehousesList.map(w => (
                  <tr key={w.warehouseId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}><span className="badge badge-warehouse">गोदाम (Warehouse)</span></td>
                    <td style={{ padding: '1rem' }}><strong style={{ color: 'var(--text-main)' }}>{w.warehouseId}</strong></td>
                    <td style={{ padding: '1rem' }}><span className="font-mono" style={{ color: '#fbbf24' }}>क्षमता: {w.capacity?.toLocaleString()} kg</span></td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{w.location}</td>
                  </tr>
                ))}
                {buyersList.map(b => (
                  <tr key={b.uniqueId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}><span className="badge badge-sold">व्यापारी (Buyer)</span></td>
                    <td style={{ padding: '1rem' }}><strong style={{ color: 'var(--text-main)' }}>{b.name}</strong></td>
                    <td style={{ padding: '1rem' }}><span className="font-mono" style={{ color: '#34d399' }}>{b.uniqueId}</span></td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{b.organization}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Register New Participant */}
      {activeTab === 'register' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '680px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            नया भागीदार पंजीकृत करें (Register Participant)
          </h3>

          <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.75rem' }}>
            <button
              type="button"
              onClick={() => setRegRole('farmer')}
              className={`btn btn-sm ${regRole === 'farmer' ? 'btn-primary' : 'btn-secondary'}`}
            >
              किसान (Farmer)
            </button>
            <button
              type="button"
              onClick={() => setRegRole('warehouse')}
              className={`btn btn-sm ${regRole === 'warehouse' ? 'btn-primary' : 'btn-secondary'}`}
            >
              गोदाम (Warehouse)
            </button>
            <button
              type="button"
              onClick={() => setRegRole('buyer')}
              className={`btn btn-sm ${regRole === 'buyer' ? 'btn-primary' : 'btn-secondary'}`}
            >
              व्यापारी (Buyer)
            </button>
          </div>

          {formFeedback && (
            <div style={{
              background: formFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              border: `1px solid ${formFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
              borderRadius: '8px',
              padding: '0.85rem 1.15rem',
              marginBottom: '1.5rem',
              color: formFeedback.type === 'success' ? '#34d399' : '#fb7185',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              {formFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{formFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            {regRole === 'farmer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="form-label">किसान का नाम (Farmer Name) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={farmerForm.name}
                    onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">यूनिक किसान आईडी (Unique ID) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="उदा. FARMER-105"
                    value={farmerForm.uniqueId}
                    onChange={(e) => setFarmerForm({ ...farmerForm, uniqueId: e.target.value })}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>संपर्क नंबर (Contact)</label>
                    <span style={{ fontSize: '0.72rem', color: farmerForm.contact.length === 10 ? '#34d399' : 'var(--text-muted)' }}>
                      {farmerForm.contact.length}/10
                    </span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210 (Max 10 digits)"
                    className="form-input"
                    value={farmerForm.contact}
                    onChange={(e) => setFarmerForm({ ...farmerForm, contact: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  />
                </div>
                <div>
                  <label className="form-label">स्थान / जिला (Location) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={farmerForm.location}
                    onChange={(e) => setFarmerForm({ ...farmerForm, location: e.target.value })}
                  />
                </div>
              </div>
            )}

            {regRole === 'warehouse' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="form-label">गोदाम पहचान (Warehouse ID) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="उदा. WH-NORTH-02"
                    value={warehouseForm.warehouseId}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, warehouseId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">स्थान (Location) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={warehouseForm.location}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">भंडारण क्षमता (Capacity in kg) *</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={warehouseForm.capacity}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, capacity: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {regRole === 'buyer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="form-label">व्यापारी का नाम (Buyer Name) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={buyerForm.name}
                    onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">यूनिक व्यापारी आईडी (Unique ID) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="उदा. BUYER-504"
                    value={buyerForm.uniqueId}
                    onChange={(e) => setBuyerForm({ ...buyerForm, uniqueId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">संस्था / फर्म का नाम (Organization)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={buyerForm.organization}
                    onChange={(e) => setBuyerForm({ ...buyerForm, organization: e.target.value })}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>संपर्क नंबर (Contact)</label>
                    <span style={{ fontSize: '0.72rem', color: buyerForm.contact.length === 10 ? '#34d399' : 'var(--text-muted)' }}>
                      {buyerForm.contact.length}/10
                    </span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210 (Max 10 digits)"
                    className="form-input"
                    value={buyerForm.contact}
                    onChange={(e) => setBuyerForm({ ...buyerForm, contact: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <UserPlus size={16} />
                <span>पंजीकृत करें (Save to Database)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin KYC Rejection Reason Modal */}
      {rejectionModalFarmer && (
        <div className="modal-overlay" onClick={() => setRejectionModalFarmer(null)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} />
                </div>
                <h3>
                  <span>{lang === 'hi' ? 'केवाईसी अस्वीकृति कारण दर्ज करें' : 'Specify KYC Rejection Reason'}</span>
                </h3>
              </div>
              <button className="modal-close" onClick={() => setRejectionModalFarmer(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {lang === 'hi'
                  ? `आप किसान ${rejectionModalFarmer.name} (${rejectionModalFarmer.uniqueId}) का केवाईसी अस्वीकृत कर रहे हैं:`
                  : `Rejecting KYC verification for ${rejectionModalFarmer.name} (${rejectionModalFarmer.uniqueId}):`}
              </p>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {[
                  'Aadhaar number invalid / mismatch',
                  'Khatauni land deed document unclear',
                  'AgriStack ID mismatch with records',
                  'Incomplete contact details'
                ].map(preReason => (
                  <button
                    key={preReason}
                    type="button"
                    onClick={() => setRejectionReasonText(preReason)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                  >
                    + {preReason}
                  </button>
                ))}
              </div>

              <textarea
                rows="3"
                className="form-textarea"
                placeholder={lang === 'hi' ? 'अस्वीकृति का स्पष्ट कारण लिखें...' : 'Type rejection explanation for the farmer...'}
                value={rejectionReasonText}
                onChange={e => setRejectionReasonText(e.target.value)}
                style={{ width: '100%', marginBottom: '1.25rem' }}
              />

              <div className="modal-footer" style={{ padding: 0 }}>
                <button
                  type="button"
                  onClick={() => setRejectionModalFarmer(null)}
                  className="btn btn-secondary"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateKycStatus(rejectionModalFarmer.uniqueId, 'rejected', rejectionReasonText)}
                  disabled={isUpdatingKyc}
                  className="btn btn-primary"
                  style={{ background: '#f43f5e', borderColor: '#f43f5e', minWidth: '160px' }}
                >
                  {isUpdatingKyc ? 'Updating...' : (lang === 'hi' ? 'अस्वीकृत करें (Confirm)' : 'Confirm Rejection')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Role Walkthrough Tutorial Modal */}
      <PortalTutorialModal
        role="admin"
        lang={lang}
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
