import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertOctagon, RefreshCw, Search, ShieldAlert, RotateCcw, Link2, FileCode, CheckCircle2 } from 'lucide-react';
import BlockCard from '../components/BlockCard';

export default function LedgerView() {
  const [blocks, setBlocks] = useState([]);
  const [verification, setVerification] = useState({ isValid: true, chainLength: 0, summary: 'Checking...' });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tamperStatus, setTamperStatus] = useState(null);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const [blocksRes, verifyRes] = await Promise.all([
        fetch('/api/ledger/blocks'),
        fetch('/api/ledger/verify-chain')
      ]);

      const blocksData = await blocksRes.json();
      const verifyData = await verifyRes.json();

      if (blocksData.success) {
        setBlocks(blocksData.chain || []);
      }
      if (verifyData.success) {
        setVerification(verifyData);
      }
    } catch (err) {
      console.error('Error loading blockchain ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

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
      // Re-fetch verification
      fetchLedger();
    } catch (err) {
      alert(`Tamper simulation failed: ${err.message}`);
    }
  };

  const restoreChain = async () => {
    try {
      const res = await fetch('/api/ledger/restore-chain', {
        method: 'POST'
      });
      const data = await res.json();
      setTamperStatus({
        type: 'restored',
        message: 'Chain restored to original state from persistent database records.'
      });
      fetchLedger();
    } catch (err) {
      alert(`Restore failed: ${err.message}`);
    }
  };

  const filteredBlocks = blocks.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const indexMatch = b.index.toString() === q;
    const hashMatch = b.hash.toLowerCase().includes(q) || b.previousHash.toLowerCase().includes(q);
    const dataMatch = JSON.stringify(b.data).toLowerCase().includes(q);
    return indexMatch || hashMatch || dataMatch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Blockchain Ledger Explorer</h2>
          <p>Publicly auditable, cryptographic SHA-256 chain recording all Miligrams agricultural transactions.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={fetchLedger} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={15} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Chain Verification Status Banner */}
      <div className={`verify-banner ${verification.isValid ? 'valid' : 'invalid'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {verification.isValid ? (
            <ShieldCheck size={32} color="#15803d" />
          ) : (
            <AlertOctagon size={32} color="#dc2626" />
          )}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              {verification.isValid ? 'Blockchain Integrity: 100% Verified & Intact' : 'CRITICAL WARNING: Tampering Detected!'}
            </h4>
            <p style={{ fontSize: '0.85rem', marginTop: '0.15rem' }}>
              {verification.summary}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: verification.isValid ? '#15803d' : '#991b1b', fontWeight: 700 }}>
            Total Chain Length
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {blocks.length} Blocks
          </div>
        </div>
      </div>

      {/* Educational Tamper Demonstration Panel */}
      <div className="card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '1rem 1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🎓 Academic Demonstration: Cryptographic Tamper-Proofing Test
            </strong>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
              Simulate modifying historical block data to see the SHA-256 Merkle root recalculation fail and immediately flag the chain as corrupt.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={simulateTamper}
              className="btn btn-sm"
              style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
            >
              <ShieldAlert size={15} />
              <span>Simulate Tampering Block #1</span>
            </button>
            <button
              onClick={restoreChain}
              className="btn btn-sm btn-secondary"
            >
              <RotateCcw size={15} />
              <span>Restore Legitimate Chain</span>
            </button>
          </div>
        </div>

        {tamperStatus && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', padding: '0.5rem 0.75rem', borderRadius: '4px', background: tamperStatus.type === 'tampered' ? '#fee2e2' : '#dcfce7', color: tamperStatus.type === 'tampered' ? '#991b1b' : '#166534' }}>
            {tamperStatus.message}
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 0.85rem', flex: 1, maxWidth: '400px' }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by Block #, SHA-256 Hash, Crop ID, or Action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Showing <strong>{filteredBlocks.length}</strong> of <strong>{blocks.length}</strong> total blocks
        </div>
      </div>

      {/* Blocks List */}
      {loading ? (
        <div className="card empty-state">
          <p>Loading blockchain ledger...</p>
        </div>
      ) : filteredBlocks.length === 0 ? (
        <div className="card empty-state">
          <p>No blocks matched your search query.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredBlocks.map((block, idx) => (
            <div key={block.index} style={{ position: 'relative' }}>
              <BlockCard block={block} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
