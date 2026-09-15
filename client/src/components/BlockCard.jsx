import React, { useState } from 'react';
import { Copy, Check, Shield, Link2, Clock, FileText, Cpu, Database } from 'lucide-react';

export default function BlockCard({ block, highlightCropId = null, showConnector = false }) {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isGenesis = block.index === 0;

  return (
    <div className="block-card">
      <div className="block-card-header">
        <div className="block-index-title">
          <Shield size={18} color={isGenesis ? '#f59e0b' : '#10b981'} />
          <span>Block #{block.index}</span>
          {isGenesis && (
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              Genesis
            </span>
          )}
          {block.data?.action && (
            <span className="badge badge-quality" style={{ fontSize: '0.72rem' }}>
              {block.data.action}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94a3b8', fontSize: '0.76rem', fontFamily: 'JetBrains Mono, monospace' }}>
          <Clock size={13} />
          <span>{new Date(block.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {/* SHA-256 Hash */}
      <div className="block-field">
        <span className="block-field-label">Block Hash:</span>
        <div className="hash-pill" style={{ flex: 1, justifyContent: 'space-between' }}>
          <span>{block.hash}</span>
          <button 
            onClick={() => copyToClipboard(block.hash, 'hash')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38bdf8', display: 'flex' }}
            title="Copy SHA-256 hash"
          >
            {copiedField === 'hash' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Previous Hash Link */}
      <div className="block-field">
        <span className="block-field-label">Prev Hash:</span>
        <div className="hash-pill" style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', color: '#94a3b8', borderColor: 'rgba(255, 255, 255, 0.08)', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Link2 size={13} color="#64748b" />
            {block.previousHash === '0' ? '0 (Genesis Antecedent)' : block.previousHash}
          </span>
          {block.previousHash !== '0' && (
            <button 
              onClick={() => copyToClipboard(block.previousHash, 'prevHash')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
              title="Copy Previous hash"
            >
              {copiedField === 'prevHash' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Merkle Root */}
      {block.merkleRoot && (
        <div className="block-field">
          <span className="block-field-label">Merkle Root:</span>
          <div className="hash-pill" style={{ flex: 1, background: 'rgba(139, 92, 246, 0.06)', color: '#c084fc', borderColor: 'rgba(139, 92, 246, 0.2)', justifyContent: 'space-between' }}>
            <span>{block.merkleRoot}</span>
            <button 
              onClick={() => copyToClipboard(block.merkleRoot, 'merkle')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c084fc', display: 'flex' }}
              title="Copy Merkle root"
            >
              {copiedField === 'merkle' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Nonce */}
      <div className="block-field">
        <span className="block-field-label">Proof / Nonce:</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#94a3b8' }}>
          {block.nonce !== undefined ? block.nonce : '0 (Standard Consensus)'}
        </span>
      </div>

      {/* Block Payload Data */}
      {block.data && (
        <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            <FileText size={12} />
            <span>Cryptographic Payload Details:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', background: 'rgba(11, 16, 26, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
            {Object.entries(block.data).map(([k, v]) => {
              const isHighlighted = highlightCropId && String(v) === String(highlightCropId);
              return (
                <div key={k} style={{ background: isHighlighted ? 'rgba(16, 185, 129, 0.15)' : 'transparent', padding: '0.2rem', borderRadius: '4px' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{k}</span>
                  <span style={{ color: isHighlighted ? '#34d399' : '#ffffff', fontFamily: typeof v === 'number' ? 'JetBrains Mono' : 'inherit', wordBreak: 'break-all', fontWeight: isHighlighted ? 700 : 500 }}>
                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
