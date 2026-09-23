import React, { useState, useEffect } from 'react';
import { Package, Building2, CheckCircle2, Shield, RefreshCw, Layers, ArrowRight, MapPin, Cpu, Database, BookOpen } from 'lucide-react';
import CropHistoryModal from '../components/CropHistoryModal';
import PortalTutorialModal from '../components/PortalTutorialModal';
import { translations } from '../utils/translations';

export default function WarehousePortal({ lang = 'hi' }) {
  const t = translations[lang] || translations.hi;

  const [warehouses, setWarehouses] = useState([]);
  const [farmCrops, setFarmCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('WH-CENTRAL-01');
  const [notes, setNotes] = useState('');
  const [processingCropId, setProcessingCropId] = useState(null);
  const [latestBlockResult, setLatestBlockResult] = useState(null);

  const [activeCropForModal, setActiveCropForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('miligrams_tour_warehouse_seen');
      if (!seen) {
        setIsTutorialOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem 2.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, var(--surface-alt) 100%)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
        <div>
          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)', marginBottom: '0.65rem' }}>
            <Building2 size={13} />
            <span>SMART SILO LOGISTICS & TELEMETRY</span>
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: '0.35rem 0' }}>
            {t.warehouseTitle}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', maxWidth: '600px' }}>
            {t.warehouseSubtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => setIsTutorialOpen(true)} 
            className="btn btn-secondary btn-sm" 
            style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
            title={lang === 'hi' ? 'गोदाम मार्गदर्शिका देखें' : 'View Warehouse Tutorial'}
          >
            <BookOpen size={14} />
            <span>{lang === 'hi' ? '📖 ट्यूटोरियल' : '📖 Tour'}</span>
          </button>

          <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin-slow' : ''} />
            <span>{t.refresh}</span>
          </button>
        </div>
      </div>

      {/* Transition Block Minted Notification */}
      {latestBlockResult && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <strong style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>
              {lang === 'hi' ? 'गोदाम आवक ब्लॉकचेन पर दर्ज (Stock Transition Block Minted!)' : 'Stock Transition Minted on Blockchain!'}
            </strong>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            {latestBlockResult.message}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: '#64748b', fontWeight: 700 }}>BLOCK INDEX:</span>{' '}
              <strong style={{ color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>Block #{latestBlockResult.block.index}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontWeight: 700 }}>SHA-256 HASH:</span>{' '}
              <span className="font-mono" style={{ color: '#38bdf8' }}>{latestBlockResult.block.hash.substring(0, 24)}...</span>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Selector & Storage Silos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {warehouses.map(wh => {
          const isSelected = selectedWarehouseId === wh.warehouseId;
          const whWeight = (wh.cropsStored || []).reduce((sum, c) => sum + (c.quantity || 0), 0);
          const percent = Math.min(100, Math.round((whWeight / (wh.capacity || 20000)) * 100));

          return (
            <div
              key={wh.warehouseId}
              className="glass-panel glass-panel-glow"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                borderColor: isSelected ? '#f59e0b' : 'var(--border)',
                background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'var(--surface)',
                boxShadow: isSelected ? '0 0 25px rgba(245, 158, 11, 0.2)' : undefined
              }}
              onClick={() => setSelectedWarehouseId(wh.warehouseId)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '1.08rem', color: 'var(--text-main)' }}>{wh.warehouseId}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={12} color="#64748b" />
                      <span>{wh.location}</span>
                    </div>
                  </div>
                </div>
                <span className="badge badge-warehouse">
                  {wh.cropsStored?.length || 0} {lang === 'hi' ? 'बैच' : 'Batches'}
                </span>
              </div>

              {/* Occupancy Progress Bar */}
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem' }}>
                  <span>{t.occupancy}: <strong style={{ color: percent > 85 ? '#f43f5e' : '#fbbf24' }}>{percent}%</strong></span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{whWeight.toLocaleString()} / {wh.capacity?.toLocaleString()} kg</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.08)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      background: percent > 85 ? 'linear-gradient(90deg, #f59e0b, #f43f5e)' : 'linear-gradient(90deg, #f59e0b, #10b981)',
                      width: `${percent}%`,
                      height: '100%',
                      transition: 'width 0.4s ease'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 1: Incoming Farm Batches Ready to Receive */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} color="#f59e0b" />
              <span>{t.incomingBatches}</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {t.incomingSubtitle} ({selectedWarehouseId})
            </p>
          </div>
          <span className="badge badge-farm">{farmCrops.length} {lang === 'hi' ? 'बैच उपलब्ध' : 'Available at Farm'}</span>
        </div>

        {farmCrops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
            <p>{t.noIncoming}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'फसल (Crop Variety)' : 'Crop Variety'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'वजन (Quantity)' : 'Quantity'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'मूल किसान (Origin Farmer)' : 'Origin Farmer'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'कटाई की तारीख' : 'Harvest Date'}</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{lang === 'hi' ? 'कार्रवाई (Action)' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {farmCrops.map(crop => (
                  <tr key={crop._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{crop.cropType}</strong>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#38bdf8' }}>ID: {crop._id}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace' }}>{crop.quantity.toLocaleString()}</strong> kg
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{(crop.quantity / 100).toFixed(1)} Q</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{crop.farmerName}</div>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{crop.farmerId}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8' }}>
                      {new Date(crop.harvestDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US')}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        className="btn btn-accent btn-sm"
                        disabled={processingCropId === crop._id}
                        onClick={() => handleReceiveStock(crop._id)}
                      >
                        <Package size={14} />
                        <span>{processingCropId === crop._id ? 'Minting Block...' : `${t.receiveStockBtn} (${selectedWarehouseId})`}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Current Inventory in Selected Warehouse */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={20} color="#f59e0b" />
            <span>{selectedWarehouseId} - {t.storedStockTitle}</span>
          </h3>
        </div>

        {(() => {
          const selectedWh = warehouses.find(w => w.warehouseId === selectedWarehouseId);
          const stored = selectedWh?.cropsStored || [];

          if (stored.length === 0) {
            return (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>{lang === 'hi' ? 'इस गोदाम में अभी कोई स्टॉक जमा नहीं है।' : 'No crops currently stored in this warehouse.'}</p>
              </div>
            );
          }

          return (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'जमा फसल' : 'Stored Crop'}</th>
                    <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'वजन' : 'Weight'}</th>
                    <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'ग्रेड' : 'Grade'}</th>
                    <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'ब्लॉकचेन सील (Hash)' : 'Blockchain Hash'}</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{lang === 'hi' ? 'प्रमाणित इतिहास' : 'Provenance'}</th>
                  </tr>
                </thead>
                <tbody>
                  {stored.map(crop => (
                    <tr key={crop._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <strong style={{ color: 'var(--text-main)' }}>{crop.cropType}</strong>
                        <div className="font-mono" style={{ fontSize: '0.72rem', color: '#38bdf8' }}>{crop._id}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <strong style={{ color: 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace' }}>{crop.quantity}</strong> kg
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className="badge badge-quality">{crop.qualityStatus}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className="hash-pill">
                          <Shield size={12} color="#06b6d4" />
                          <span>{crop.blockHash ? `${crop.blockHash.substring(0, 16)}...` : 'Sealed'}</span>
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => openHistoryModal(crop)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Layers size={14} />
                          <span>{t.viewChain}</span>
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
        lang={lang}
      />

      {/* Interactive Role Walkthrough Tutorial Modal */}
      <PortalTutorialModal
        role="warehouse"
        lang={lang}
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
