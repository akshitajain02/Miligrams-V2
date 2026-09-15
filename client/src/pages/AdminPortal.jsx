import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertOctagon, RefreshCw, Search, ShieldAlert, RotateCcw, UserPlus, Building2, ShoppingBag, CheckCircle2, AlertCircle, Clock, Play, Cpu, Database, Link2 } from 'lucide-react';
import BlockCard from '../components/BlockCard';

export default function AdminPortal({ lang = 'hi' }) {
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'aging' | 'participants' | 'register'
  const [blocks, setBlocks] = useState([]);
  const [verification, setVerification] = useState({ isValid: true, chainLength: 0, summary: 'Checking...' });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tamperStatus, setTamperStatus] = useState(null);

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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormFeedback(null);
    try {
      let endpoint = '';
      let body = {};
      if (regRole === 'farmer') {
        endpoint = '/api/farmers/register';
        body = farmerForm;
      } else if (regRole === 'warehouse') {
        endpoint = '/api/warehouse/register';
        body = warehouseForm;
      } else {
        endpoint = '/api/marketplace/buyers/register';
        body = buyerForm;
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
      <div className="glass-panel" style={{ padding: '2rem 2.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(14, 20, 34, 0.8) 100%)', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
        <div>
          <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', borderColor: 'rgba(139, 92, 246, 0.3)', marginBottom: '0.65rem' }}>
            <ShieldCheck size={13} />
            <span>CRYPTOGRAPHIC LEDGER GOVERNANCE</span>
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.35rem 0' }}>
            {lang === 'hi' ? 'एडमिन व ब्लॉकचेन लेजर पोर्टल' : 'Admin & Blockchain Ledger Explorer'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.94rem', maxWidth: '600px' }}>
            {lang === 'hi'
              ? 'क्रिप्टोग्राफिक SHA-256 ब्लॉकचेन सत्यापन, 15-दिन उम्र सत्यापन चक्र, और छेड़छाड़-रोधी परीक्षण।'
              : 'Audit cryptographic SHA-256 blocks, trigger 15-day crop aging checks, and test tamper detection.'}
          </p>
        </div>

        <button onClick={fetchLedgerData} className="btn btn-secondary btn-sm" title="Refresh">
          <RefreshCw size={14} className={loading ? 'spin-slow' : ''} />
          <span>{lang === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
        </button>
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
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              {verification.isValid
                ? (lang === 'hi' ? 'ब्लॉकचेन अखंडता: 100% सत्यापित व सुरक्षित' : 'Blockchain Integrity: 100% Cryptographically Intact')
                : (lang === 'hi' ? 'गंभीर चेतावनी: लेजर में छेड़छाड़ पकड़ी गई!' : 'Critical Alert: Cryptographic Tampering Detected!')}
            </h4>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              {verification.summary}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>
            Mined Blocks
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
            #{blocks.length}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
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

      {/* Tab 1: Ledger Explorer */}
      {activeTab === 'ledger' && (
        <div>
          {/* Tamper Demonstration Sandbox */}
          <div className="glass-panel" style={{ padding: '1.4rem 1.75rem', marginBottom: '2rem', borderStyle: 'dashed', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div>
                <strong style={{ fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldAlert size={18} color="#f59e0b" />
                  <span>{lang === 'hi' ? 'शैक्षणिक डेमो: क्रिप्टोग्राफिक छेड़छाड़-रोधी परीक्षण' : 'Interactive Sandbox: SHA-256 Tamper Detection'}</span>
                </strong>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '0.25rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(11, 16, 26, 0.8)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '0.6rem 1rem', flex: 1, maxWidth: '440px' }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder={lang === 'hi' ? 'ब्लॉक #, SHA-256 हैश, या विवरण से खोजें...' : 'Search block #, hash, or payload details...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.88rem', color: '#ffffff' }}
              />
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="#f59e0b" />
                <span>15-दिन फसल उम्र सत्यापन चक्र (Crop Aging Engine)</span>
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginTop: '0.35rem', maxWidth: '650px' }}>
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
            <div style={{ background: 'rgba(11, 16, 26, 0.7)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.4rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#34d399', fontWeight: 700 }}>
                <CheckCircle2 size={18} />
                <span>{agingReport.message}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ color: '#64748b', fontSize: '0.74rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>जांची गई फसलें</span>
                  <strong style={{ fontSize: '1.5rem', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>{agingReport.totalChecked}</strong>
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              पंजीकृत नेटवर्क भागीदार (Registered Network Actors)
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#64748b', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>भूमिका (Role)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>नाम (Name)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>यूनिक पहचान (ID)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>स्थान / विवरण</th>
                </tr>
              </thead>
              <tbody>
                {farmersList.map(f => (
                  <tr key={f.uniqueId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1rem' }}><span className="badge badge-farm">किसान (Farmer)</span></td>
                    <td style={{ padding: '1rem' }}><strong style={{ color: '#ffffff' }}>{f.name}</strong></td>
                    <td style={{ padding: '1rem' }}><span className="font-mono" style={{ color: '#38bdf8' }}>{f.uniqueId}</span></td>
                    <td style={{ padding: '1rem', color: '#94a3b8' }}>{f.location}</td>
                  </tr>
                ))}
                {warehousesList.map(w => (
                  <tr key={w.warehouseId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1rem' }}><span className="badge badge-warehouse">गोदाम (Warehouse)</span></td>
                    <td style={{ padding: '1rem' }}><strong style={{ color: '#ffffff' }}>{w.warehouseId}</strong></td>
                    <td style={{ padding: '1rem' }}><span className="font-mono" style={{ color: '#fbbf24' }}>क्षमता: {w.capacity?.toLocaleString()} kg</span></td>
                    <td style={{ padding: '1rem', color: '#94a3b8' }}>{w.location}</td>
                  </tr>
                ))}
                {buyersList.map(b => (
                  <tr key={b.uniqueId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1rem' }}><span className="badge badge-sold">व्यापारी (Buyer)</span></td>
                    <td style={{ padding: '1rem' }}><strong style={{ color: '#ffffff' }}>{b.name}</strong></td>
                    <td style={{ padding: '1rem' }}><span className="font-mono" style={{ color: '#34d399' }}>{b.uniqueId}</span></td>
                    <td style={{ padding: '1rem', color: '#94a3b8' }}>{b.organization}</td>
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
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
                  <label className="form-label">संपर्क नंबर (Contact)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={farmerForm.contact}
                    onChange={(e) => setFarmerForm({ ...farmerForm, contact: e.target.value })}
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
                  <label className="form-label">संपर्क नंबर (Contact)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={buyerForm.contact}
                    onChange={(e) => setBuyerForm({ ...buyerForm, contact: e.target.value })}
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
    </div>
  );
}
