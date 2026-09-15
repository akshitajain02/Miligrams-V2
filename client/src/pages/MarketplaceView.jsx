import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2, Shield, RefreshCw, Layers, DollarSign, UserCheck } from 'lucide-react';
import CropHistoryModal from '../components/CropHistoryModal';

export default function MarketplaceView() {
  const [availableCrops, setAvailableCrops] = useState([]);
  const [soldCrops, setSoldCrops] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState('BUYER-501');
  const [loading, setLoading] = useState(true);
  const [purchasingCropId, setPurchasingCropId] = useState(null);
  const [purchaseReceipt, setPurchaseReceipt] = useState(null);

  const [activeCropForModal, setActiveCropForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [marketRes, buyersRes] = await Promise.all([
        fetch('/api/marketplace/browse'),
        fetch('/api/marketplace/buyers')
      ]);

      const marketData = await marketRes.json();
      const buyersData = await buyersRes.json();

      if (marketData.success) {
        setAvailableCrops(marketData.crops || []);
        setSoldCrops(marketData.soldCrops || []);
      }
      if (buyersData.success && buyersData.buyers.length > 0) {
        setBuyers(buyersData.buyers);
        if (!selectedBuyerId) {
          setSelectedBuyerId(buyersData.buyers[0].uniqueId);
        }
      }
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePurchase = async (crop) => {
    setPurchasingCropId(crop._id);
    setPurchaseReceipt(null);

    // Approximate unit price based on crop quality
    const pricePerKg = crop.qualityStatus.includes('Organic') ? 48 : crop.qualityStatus.includes('Grade A') ? 36 : 28;
    const totalAmount = crop.quantity * pricePerKg;

    try {
      const response = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropId: crop._id,
          buyerId: selectedBuyerId,
          amount: totalAmount
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete purchase');
      }

      setPurchaseReceipt(data);
      fetchData();
    } catch (err) {
      alert(`Purchase failed: ${err.message}`);
    } finally {
      setPurchasingCropId(null);
    }
  };

  const openHistoryModal = (crop) => {
    setActiveCropForModal(crop);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Buyer Marketplace & Trade Settlement</h2>
          <p>Verified agricultural commodities with full blockchain provenance and instant trade settlement.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Active Buyer Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.35rem 0.65rem' }}>
            <UserCheck size={16} color="#64748b" />
            <select
              value={selectedBuyerId}
              onChange={(e) => setSelectedBuyerId(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              {buyers.map(b => (
                <option key={b.uniqueId} value={b.uniqueId}>
                  {b.name} ({b.uniqueId})
                </option>
              ))}
            </select>
          </div>

          <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Purchase Receipt Notification */}
      {purchaseReceipt && (
        <div className="receipt-card">
          <div className="receipt-title">
            <CheckCircle2 size={22} color="#16a34a" />
            <span>Purchase & Trade Settlement Block Minted!</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.75rem' }}>
            {purchaseReceipt.message}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#15803d', fontWeight: 600 }}>TRANSACTION ID:</span>{' '}
              <span className="font-mono">{purchaseReceipt.transaction._id}</span>
            </div>
            <div>
              <span style={{ color: '#15803d', fontWeight: 600 }}>SETTLEMENT BLOCK:</span>{' '}
              <strong>Block #{purchaseReceipt.block.index}</strong>
            </div>
            <div>
              <span style={{ color: '#15803d', fontWeight: 600 }}>BLOCK HASH:</span>{' '}
              <span className="font-mono">{purchaseReceipt.block.hash.substring(0, 20)}...</span>
            </div>
          </div>
        </div>
      )}

      {/* Available Crops Grid */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
        Commodities Ready for Trade ({availableCrops.length})
      </h3>

      {availableCrops.length === 0 ? (
        <div className="card empty-state">
          <p>No available crops on the marketplace right now. Upload a crop from the dashboard to list it here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {availableCrops.map(crop => {
            const pricePerKg = crop.qualityStatus.includes('Organic') ? 48 : crop.qualityStatus.includes('Grade A') ? 36 : 28;
            const estTotal = crop.quantity * pricePerKg;

            return (
              <div key={crop._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{crop.cropType}</h4>
                      <span className="font-mono" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ID: {crop._id}</span>
                    </div>
                    <span className={`badge badge-${crop.currentStage}`}>
                      {crop.currentStage}
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#64748b' }}>Volume Available:</span>
                      <strong>{crop.quantity.toLocaleString()} kg</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#64748b' }}>Quality Classification:</span>
                      <span className="badge badge-quality" style={{ padding: '0.15rem 0.5rem' }}>{crop.qualityStatus}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#64748b' }}>Origin Farmer:</span>
                      <span>{crop.farmerName || crop.farmerId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Harvest Date:</span>
                      <span>{new Date(crop.harvestDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>ESTIMATED VALUATION</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>
                        ₹{estTotal.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}> (₹{pricePerKg}/kg)</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0' }}>
                  <button
                    onClick={() => openHistoryModal(crop)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    title="Audit blockchain history before purchasing"
                  >
                    <Layers size={14} />
                    <span>Audit Chain</span>
                  </button>

                  <button
                    onClick={() => handlePurchase(crop)}
                    disabled={purchasingCropId === crop._id}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1.3 }}
                  >
                    <ShoppingBag size={14} />
                    <span>{purchasingCropId === crop._id ? 'Settling on Chain...' : 'Buy & Settle'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Settled / Sold Crops Audit Section */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Settled Transactions ({soldCrops.length})</h3>
        </div>

        {soldCrops.length === 0 ? (
          <div className="empty-state">
            <p>No settled purchases yet.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Commodity</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Settlement Block Hash</th>
                  <th style={{ textAlign: 'right' }}>Complete Provenance</th>
                </tr>
              </thead>
              <tbody>
                {soldCrops.map(crop => (
                  <tr key={crop._id}>
                    <td>
                      <strong>{crop.cropType}</strong>
                      <div className="font-mono" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{crop._id}</div>
                    </td>
                    <td><strong>{crop.quantity}</strong> kg</td>
                    <td><span className="badge badge-sold">🤝 Sold & Settled</span></td>
                    <td>
                      <span className="hash-pill">
                        <Shield size={12} color="#16a34a" />
                        {crop.blockHash ? `${crop.blockHash.substring(0, 18)}...` : 'N/A'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openHistoryModal(crop)}
                        className="btn btn-outline-primary btn-sm"
                      >
                        <Layers size={14} />
                        <span>Full Lifecycle Chain</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Crop History Modal */}
      <CropHistoryModal
        crop={activeCropForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
