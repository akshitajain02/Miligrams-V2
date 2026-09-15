import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, CheckCircle2, Shield, Layers, ArrowRight, AlertCircle, Copy, Check } from 'lucide-react';

export default function UploadCrop() {
  const [farmers, setFarmers] = useState([]);
  const [formData, setFormData] = useState({
    cropType: '',
    quantity: '',
    harvestDate: new Date().toISOString().split('T')[0],
    qualityStatus: 'Grade A',
    farmerId: '',
    farmerName: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mintedReceipt, setMintedReceipt] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Pre-fill common crop options for fast input
  const commonCrops = [
    'Sharbati Organic Wheat',
    'Basmati Rice (Pusa 1121)',
    'Yellow Maize (Corn)',
    'Mustard Seeds',
    'Organic Soybeans',
    'Sugarcane (Co 0238)',
    'Barley (Malt Grade)',
    'Desi Chickpeas (Chana)'
  ];

  useEffect(() => {
    fetch('/api/farmers')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.farmers.length > 0) {
          setFarmers(data.farmers);
          setFormData(prev => ({
            ...prev,
            farmerId: data.farmers[0].uniqueId,
            farmerName: data.farmers[0].name
          }));
        }
      })
      .catch(err => console.error('Error fetching farmers:', err));
  }, []);

  const handleFarmerChange = (e) => {
    const selectedId = e.target.value;
    const farmer = farmers.find(f => f.uniqueId === selectedId);
    setFormData(prev => ({
      ...prev,
      farmerId: selectedId,
      farmerName: farmer ? farmer.name : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMintedReceipt(null);

    try {
      const response = await fetch('/api/crops/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload crop');
      }

      setMintedReceipt(data);
      // Reset crop input fields but keep farmer
      setFormData(prev => ({
        ...prev,
        cropType: '',
        quantity: ''
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>Register & Mint Crop to Blockchain</h2>
          <p>Each harvested batch creates a cryptographically linked block on the Miligrams ledger.</p>
        </div>
      </div>

      {/* Success Block Receipt Banner */}
      {mintedReceipt && (
        <div className="receipt-card">
          <div className="receipt-title">
            <CheckCircle2 size={24} color="#16a34a" />
            <span>Crop Registered & Minted onto Blockchain Ledger!</span>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#166534', marginBottom: '1.25rem' }}>
            A new immutable block has been appended to the chain with a SHA-256 cryptographic hash and Merkle root.
          </p>

          <div className="receipt-grid">
            <div className="receipt-item">
              <span>BLOCK INDEX</span>
              <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>
                Block #{mintedReceipt.block.index}
              </strong>
            </div>
            <div className="receipt-item">
              <span>CROP RECORD</span>
              <strong>{mintedReceipt.crop.cropType} ({mintedReceipt.crop.quantity} kg)</strong>
            </div>
            <div className="receipt-item">
              <span>FARMER ID</span>
              <span className="font-mono">{mintedReceipt.crop.farmerId}</span>
            </div>
            <div className="receipt-item">
              <span>TIMESTAMP</span>
              <span>{new Date(mintedReceipt.block.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Block Hash Highlight */}
          <div style={{ marginTop: '1.25rem', background: '#ffffff', padding: '0.9rem', borderRadius: '8px', border: '1px solid #86efac' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                Newly Created Block SHA-256 Hash
              </span>
              <button
                onClick={() => copyToClipboard(mintedReceipt.block.hash)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}
              >
                {copiedHash ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                {copiedHash ? 'Copied!' : 'Copy Hash'}
              </button>
            </div>
            <div className="font-mono" style={{ fontSize: '0.85rem', color: '#0369a1', wordBreak: 'break-all', fontWeight: 600 }}>
              {mintedReceipt.block.hash}
            </div>

            <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#64748b' }}>
              <strong>Previous Hash:</strong> <span className="font-mono">{mintedReceipt.block.previousHash.substring(0, 24)}...</span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
            <Link to="/" className="btn btn-primary btn-sm">
              View on Farmer Dashboard
            </Link>
            <Link to="/ledger" className="btn btn-secondary btn-sm">
              <Layers size={14} />
              Open Ledger Explorer
            </Link>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '1rem', borderRadius: '8px', color: '#991b1b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Farmer Selection */}
          <div className="form-group">
            <label className="form-label">Select Registered Farmer</label>
            <select
              className="form-select"
              value={formData.farmerId}
              onChange={handleFarmerChange}
              required
            >
              {farmers.map(f => (
                <option key={f.uniqueId} value={f.uniqueId}>
                  {f.name} — {f.uniqueId} ({f.location})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            {/* Crop Type */}
            <div className="form-group">
              <label className="form-label">Crop Type / Variety</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sharbati Organic Wheat"
                value={formData.cropType}
                onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                required
                list="crop-suggestions"
              />
              <datalist id="crop-suggestions">
                {commonCrops.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">Harvest Quantity (in kg)</label>
              <input
                type="number"
                min="1"
                step="1"
                className="form-input"
                placeholder="e.g. 500"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            {/* Harvest Date */}
            <div className="form-group">
              <label className="form-label">Harvest Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                required
              />
            </div>

            {/* Quality Grade */}
            <div className="form-group">
              <label className="form-label">Quality Grade</label>
              <select
                className="form-select"
                value={formData.qualityStatus}
                onChange={(e) => setFormData({ ...formData, qualityStatus: e.target.value })}
              >
                <option value="Grade A">Grade A (Export Quality)</option>
                <option value="Grade B">Grade B (Standard Market)</option>
                <option value="Grade C">Grade C (Processing Grade)</option>
                <option value="Organic Premium">Organic Premium (Certified)</option>
                <option value="Standard">Standard</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '220px' }}
            >
              <Shield size={18} />
              <span>{loading ? 'Minting to Blockchain...' : 'Register & Mint Block'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
