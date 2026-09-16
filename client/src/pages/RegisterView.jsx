import React, { useState, useEffect } from 'react';
import { UserPlus, Building2, ShoppingBag, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function RegisterView() {
  const [activeTab, setActiveTab] = useState('farmer');

  // Farmer form state
  const [farmerForm, setFarmerForm] = useState({
    name: '',
    uniqueId: '',
    contact: '',
    location: ''
  });

  // Warehouse form state
  const [warehouseForm, setWarehouseForm] = useState({
    warehouseId: '',
    location: '',
    capacity: 20000
  });

  // Buyer form state
  const [buyerForm, setBuyerForm] = useState({
    name: '',
    uniqueId: '',
    contact: '',
    organization: ''
  });

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const [farmersList, setFarmersList] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);
  const [buyersList, setBuyersList] = useState([]);

  const loadParticipants = async () => {
    try {
      const [fRes, wRes, bRes] = await Promise.all([
        fetch('/api/farmers'),
        fetch('/api/warehouse/stock'),
        fetch('/api/marketplace/buyers')
      ]);
      const f = await fRes.json();
      const w = await wRes.json();
      const b = await bRes.json();
      if (f.success) setFarmersList(f.farmers);
      if (w.success) setWarehousesList(w.warehouses);
      if (b.success) setBuyersList(b.buyers);
    } catch (err) {
      console.error('Error fetching participants:', err);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  const handleFarmerSubmit = async (e) => {
    const cleanPhone = (farmerForm.contact || '').replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length > 10) {
      setFeedback({ type: 'error', message: 'Contact number cannot exceed 10 digits.' });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/farmers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...farmerForm, contact: cleanPhone })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed');

      setFeedback({ type: 'success', message: `Farmer "${data.farmer.name}" (${data.farmer.uniqueId}) registered successfully!` });
      setFarmerForm({ name: '', uniqueId: '', contact: '', location: '' });
      loadParticipants();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/warehouse/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouseForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed');

      setFeedback({ type: 'success', message: `Warehouse "${data.warehouse.warehouseId}" registered successfully!` });
      setWarehouseForm({ warehouseId: '', location: '', capacity: 20000 });
      loadParticipants();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = (buyerForm.contact || '').replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length > 10) {
      setFeedback({ type: 'error', message: 'Contact number cannot exceed 10 digits.' });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/marketplace/buyers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buyerForm, contact: cleanPhone })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed');

      setFeedback({ type: 'success', message: `Buyer "${data.buyer.name}" registered successfully!` });
      setBuyerForm({ name: '', uniqueId: '', contact: '', organization: '' });
      loadParticipants();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>Network Participant Registration</h2>
          <p>Register supply chain actors: Farmers, Warehouses, and Commercial Buyers.</p>
        </div>
        <button onClick={loadParticipants} className="btn btn-secondary btn-sm" title="Refresh">
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div style={{
          background: feedback.type === 'success' ? '#f0fdf4' : '#fee2e2',
          border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fca5a5'}`,
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          color: feedback.type === 'success' ? '#14532d' : '#991b1b'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => { setActiveTab('farmer'); setFeedback(null); }}
          className={`btn ${activeTab === 'farmer' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <UserPlus size={16} />
          <span>Register Farmer</span>
        </button>
        <button
          onClick={() => { setActiveTab('warehouse'); setFeedback(null); }}
          className={`btn ${activeTab === 'warehouse' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Building2 size={16} />
          <span>Register Warehouse</span>
        </button>
        <button
          onClick={() => { setActiveTab('buyer'); setFeedback(null); }}
          className={`btn ${activeTab === 'buyer' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ShoppingBag size={16} />
          <span>Register Buyer</span>
        </button>
      </div>

      {/* Forms */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        {activeTab === 'farmer' && (
          <form onSubmit={handleFarmerSubmit}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Farmer Registration</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Harpreet Singh"
                  value={farmerForm.name}
                  onChange={e => setFarmerForm({ ...farmerForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Farmer Unique ID (Optional - auto-generated if blank)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. FARMER-103"
                  value={farmerForm.uniqueId}
                  onChange={e => setFarmerForm({ ...farmerForm, uniqueId: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Contact Number</label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{farmerForm.contact.length}/10</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  className="form-input"
                  placeholder="e.g. 9876543210 (Max 10 digits)"
                  value={farmerForm.contact}
                  onChange={e => setFarmerForm({ ...farmerForm, contact: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Farm Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jalandhar, Punjab"
                  value={farmerForm.location}
                  onChange={e => setFarmerForm({ ...farmerForm, location: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Registering...' : 'Register Farmer'}
            </button>
          </form>
        )}

        {activeTab === 'warehouse' && (
          <form onSubmit={handleWarehouseSubmit}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Warehouse / Silo Registration</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Warehouse ID *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. WH-EAST-03"
                  value={warehouseForm.warehouseId}
                  onChange={e => setWarehouseForm({ ...warehouseForm, warehouseId: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Karnal Agro Park, Haryana"
                  value={warehouseForm.location}
                  onChange={e => setWarehouseForm({ ...warehouseForm, location: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Storage Capacity (in kg)</label>
              <input
                type="number"
                className="form-input"
                value={warehouseForm.capacity}
                onChange={e => setWarehouseForm({ ...warehouseForm, capacity: Number(e.target.value) })}
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Registering...' : 'Register Warehouse'}
            </button>
          </form>
        )}

        {activeTab === 'buyer' && (
          <form onSubmit={handleBuyerSubmit}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Commercial Buyer Registration</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Buyer / Entity Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apex Agri Exports Pvt Ltd"
                  value={buyerForm.name}
                  onChange={e => setBuyerForm({ ...buyerForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Buyer Unique ID (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. BUYER-503"
                  value={buyerForm.uniqueId}
                  onChange={e => setBuyerForm({ ...buyerForm, uniqueId: e.target.value })}
                />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Organization Type</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Grain Export House"
                  value={buyerForm.organization}
                  onChange={e => setBuyerForm({ ...buyerForm, organization: e.target.value })}
                />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Contact Number</label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{buyerForm.contact.length}/10</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  className="form-input"
                  placeholder="e.g. 9900012345 (Max 10 digits)"
                  value={buyerForm.contact}
                  onChange={e => setBuyerForm({ ...buyerForm, contact: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Registering...' : 'Register Buyer'}
            </button>
          </form>
        )}
      </div>

      {/* Current Network Participants Directory */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            Active Network Participants
          </h3>
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Entity Name</th>
                <th>Identifier</th>
                <th>Location / Details</th>
              </tr>
            </thead>
            <tbody>
              {farmersList.map(f => (
                <tr key={f.uniqueId}>
                  <td><span className="badge badge-farm">Farmer</span></td>
                  <td><strong>{f.name}</strong></td>
                  <td><span className="font-mono">{f.uniqueId}</span></td>
                  <td>{f.location}</td>
                </tr>
              ))}
              {warehousesList.map(w => (
                <tr key={w.warehouseId}>
                  <td><span className="badge badge-warehouse">Warehouse</span></td>
                  <td><strong>{w.warehouseId}</strong></td>
                  <td><span className="font-mono">Cap: {w.capacity?.toLocaleString()} kg</span></td>
                  <td>{w.location}</td>
                </tr>
              ))}
              {buyersList.map(b => (
                <tr key={b.uniqueId}>
                  <td><span className="badge badge-sold">Buyer</span></td>
                  <td><strong>{b.name}</strong></td>
                  <td><span className="font-mono">{b.uniqueId}</span></td>
                  <td>{b.organization}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
