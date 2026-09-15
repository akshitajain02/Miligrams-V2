import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Package, ShoppingBag, Plus, RefreshCw, Layers, ShieldCheck, User } from 'lucide-react';
import CropHistoryModal from '../components/CropHistoryModal';

export default function Dashboard() {
  const [crops, setCrops] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCropForModal, setActiveCropForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStage, setFilterStage] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [farmersRes, cropsRes] = await Promise.all([
        fetch('/api/farmers'),
        fetch('/api/crops')
      ]);
      const farmersData = await farmersRes.json();
      const cropsData = await cropsRes.json();

      if (farmersData.success) {
        setFarmers(farmersData.farmers);
      }
      if (cropsData.success) {
        setCrops(cropsData.crops);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter crops
  const filteredCrops = crops.filter(c => {
    const matchesFarmer = selectedFarmerId ? c.farmerId === selectedFarmerId : true;
    const matchesStage = filterStage === 'all' ? true : c.currentStage === filterStage;
    return matchesFarmer && matchesStage;
  });

  // Calculate statistics
  const totalCrops = filteredCrops.length;
  const farmCount = filteredCrops.filter(c => c.currentStage === 'farm').length;
  const warehouseCount = filteredCrops.filter(c => c.currentStage === 'warehouse').length;
  const soldCount = filteredCrops.filter(c => c.currentStage === 'sold').length;
  const totalWeight = filteredCrops.reduce((sum, c) => sum + (c.quantity || 0), 0);

  const openHistoryModal = (crop) => {
    setActiveCropForModal(crop);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Farmer Dashboard</h2>
          <p>Real-time lifecycle tracking & immutable blockchain verification for harvested crops.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Farmer Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.35rem 0.65rem' }}>
            <User size={16} color="#64748b" />
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              <option value="">All Farmers (Overview)</option>
              {farmers.map(f => (
                <option key={f.uniqueId} value={f.uniqueId}>
                  {f.name} ({f.uniqueId})
                </option>
              ))}
            </select>
          </div>

          <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={15} />
          </button>
          <Link to="/upload" className="btn btn-primary">
            <Plus size={16} />
            <span>Upload New Crop</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Sprout size={24} />
          </div>
          <div>
            <div className="stat-val">{totalCrops}</div>
            <div className="stat-label">Crops Tracked</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Sprout size={24} />
          </div>
          <div>
            <div className="stat-val">{farmCount}</div>
            <div className="stat-label">At Farm Gate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#ffedd5', color: '#ea580c' }}>
            <Package size={24} />
          </div>
          <div>
            <div className="stat-val">{warehouseCount}</div>
            <div className="stat-label">Stored in Warehouse</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="stat-val">{soldCount}</div>
            <div className="stat-label">Sold & Settled</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'farm', 'warehouse', 'sold'].map(stage => (
            <button
              key={stage}
              onClick={() => setFilterStage(stage)}
              className={`btn btn-sm ${filterStage === stage ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {stage === 'all' ? `All Crops (${crops.length})` : `${stage} (${crops.filter(c => c.currentStage === stage).length})`}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Total Yield Recorded: <strong>{totalWeight.toLocaleString()} kg</strong>
        </span>
      </div>

      {/* Crops Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">
            <p>Loading crops data...</p>
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌾</div>
            <h3>No crops found</h3>
            <p>Upload a new crop harvest to generate its first blockchain record.</p>
            <Link to="/upload" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Upload First Crop
            </Link>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Crop Details</th>
                  <th>Quantity</th>
                  <th>Harvest Date</th>
                  <th>Quality Grade</th>
                  <th>Farmer</th>
                  <th>Current Stage</th>
                  <th>Genesis / Latest Block Hash</th>
                  <th style={{ textAlign: 'right' }}>Blockchain Ledger</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrops.map(crop => (
                  <tr key={crop._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{crop.cropType}</div>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        ID: {crop._id}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{crop.quantity}</span> <span style={{ color: '#64748b', fontSize: '0.8rem' }}>kg</span>
                    </td>
                    <td style={{ color: '#475569' }}>
                      {new Date(crop.harvestDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="badge badge-quality">{crop.qualityStatus}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{crop.farmerName || crop.farmerId}</div>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#64748b' }}>{crop.farmerId}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${crop.currentStage}`}>
                        {crop.currentStage === 'farm' && '🌱 Farm'}
                        {crop.currentStage === 'warehouse' && '📦 Warehouse'}
                        {crop.currentStage === 'sold' && '🤝 Sold'}
                      </span>
                    </td>
                    <td>
                      {crop.blockHash ? (
                        <span className="hash-pill" title={crop.blockHash}>
                          <ShieldCheck size={12} color="#0284c7" />
                          {crop.blockHash.substring(0, 16)}...
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Pending</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openHistoryModal(crop)}
                        className="btn btn-outline-primary btn-sm"
                        title="View the cryptographic block history for this crop"
                      >
                        <Layers size={14} />
                        <span>View Ledger History</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blockchain Ledger History Modal */}
      <CropHistoryModal
        crop={activeCropForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
