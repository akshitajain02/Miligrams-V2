import React, { useState, useEffect } from 'react';
import { Package, ArrowRight, CheckCircle2, Shield, RefreshCw, Layers, Building2 } from 'lucide-react';
import CropHistoryModal from '../components/CropHistoryModal';

export default function WarehouseView() {
  const [warehouses, setWarehouses] = useState([]);
  const [farmCrops, setFarmCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('WH-CENTRAL-01');
  const [notes, setNotes] = useState('');
  const [processingCropId, setProcessingCropId] = useState(null);
  const [latestBlockResult, setLatestBlockResult] = useState(null);

  const [activeCropForModal, setActiveCropForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [whRes, cropsRes] = await Promise.all([
        fetch('/api/warehouse/stock'),
        fetch('/api/crops?stage=farm')
      ]);
      const whData = await whRes.json();
      const cropsData = await cropsRes.json();

      if (whData.success) {
        setWarehouses(whData.warehouses);
        if (whData.warehouses.length > 0 && !selectedWarehouseId) {
          setSelectedWarehouseId(whData.warehouses[0].warehouseId);
        }
      }
      if (cropsData.success) {
        setFarmCrops(cropsData.crops);
      }
    } catch (err) {
      console.error('Error fetching warehouse data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReceiveStock = async (cropId) => {
    setProcessingCropId(cropId);
    setLatestBlockResult(null);

    try {
      const response = await fetch('/api/warehouse/update-stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropId,
          warehouseId: selectedWarehouseId,
          notes: notes || 'Verified quality and stored in warehouse silos.'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update stock');
      }

      setLatestBlockResult(data);
      // Refresh warehouse and farm crop lists
      fetchData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingCropId(null);
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
          <h2>Warehouse Stock & Depot Management</h2>
          <p>Receive farm batches into intermediate storage and cryptographically record stage transitions.</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh">
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Latest Transition Block Notification */}
      {latestBlockResult && (
        <div className="receipt-card">
          <div className="receipt-title">
            <CheckCircle2 size={22} color="#16a34a" />
            <span>Stock Transition Recorded to Blockchain!</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.75rem' }}>
            {latestBlockResult.message}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#15803d', fontWeight: 600 }}>TRANSITION BLOCK:</span>{' '}
              <strong>Block #{latestBlockResult.block.index}</strong>
            </div>
            <div>
              <span style={{ color: '#15803d', fontWeight: 600 }}>HASH:</span>{' '}
              <span className="font-mono">{latestBlockResult.block.hash.substring(0, 20)}...</span>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Selector & Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {warehouses.map(wh => (
          <div 
            key={wh.warehouseId} 
            className="card" 
            style={{ 
              marginBottom: 0,
              cursor: 'pointer',
              border: selectedWarehouseId === wh.warehouseId ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: selectedWarehouseId === wh.warehouseId ? 'var(--primary-light)' : '#ffffff'
            }}
            onClick={() => setSelectedWarehouseId(wh.warehouseId)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} color="#15803d" />
                <strong style={{ fontSize: '1rem' }}>{wh.warehouseId}</strong>
              </div>
              <span className="badge badge-quality">{wh.cropsStored?.length || 0} Batches</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              📍 {wh.location}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
              Capacity: {wh.capacity.toLocaleString()} kg
            </div>
          </div>
        ))}
      </div>

      {/* Section 1: Crops Ready to be Received into Warehouse */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Incoming Farm Batches (Ready for Storage)</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Crops currently at the farm gate that can be officially received into <strong style={{ color: '#15803d' }}>{selectedWarehouseId}</strong>.
            </p>
          </div>
        </div>

        {farmCrops.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <p>No crops currently waiting at farm gate. All registered crops are stored or sold.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Crop Variety</th>
                  <th>Quantity</th>
                  <th>Origin Farmer</th>
                  <th>Harvest Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {farmCrops.map(crop => (
                  <tr key={crop._id}>
                    <td>
                      <strong>{crop.cropType}</strong>
                      <div className="font-mono" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{crop._id}</div>
                    </td>
                    <td><strong>{crop.quantity}</strong> kg</td>
                    <td>{crop.farmerName} ({crop.farmerId})</td>
                    <td>{new Date(crop.harvestDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm"
                        disabled={processingCropId === crop._id}
                        onClick={() => handleReceiveStock(crop._id)}
                      >
                        <Package size={14} />
                        <span>{processingCropId === crop._id ? 'Minting Transition Block...' : `Receive into ${selectedWarehouseId}`}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Stored Inventory in Selected Warehouse */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            Current Inventory in {selectedWarehouseId}
          </h3>
        </div>

        {(() => {
          const selectedWh = warehouses.find(w => w.warehouseId === selectedWarehouseId);
          const stored = selectedWh?.cropsStored || [];

          if (stored.length === 0) {
            return (
              <div className="empty-state">
                <p>No crops currently stored in {selectedWarehouseId}.</p>
              </div>
            );
          }

          return (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Stored Crop</th>
                    <th>Weight</th>
                    <th>Quality Status</th>
                    <th>Blockchain Hash</th>
                    <th style={{ textAlign: 'right' }}>Audit Trail</th>
                  </tr>
                </thead>
                <tbody>
                  {stored.map(crop => (
                    <tr key={crop._id}>
                      <td>
                        <strong>{crop.cropType}</strong>
                        <div className="font-mono" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{crop._id}</div>
                      </td>
                      <td><strong>{crop.quantity}</strong> kg</td>
                      <td><span className="badge badge-quality">{crop.qualityStatus}</span></td>
                      <td>
                        <span className="hash-pill">
                          <Shield size={12} />
                          {crop.blockHash ? `${crop.blockHash.substring(0, 16)}...` : 'Pending'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => openHistoryModal(crop)}
                          className="btn btn-outline-primary btn-sm"
                        >
                          <Layers size={14} />
                          <span>View Chain</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
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
