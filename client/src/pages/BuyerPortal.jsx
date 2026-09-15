import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2, Shield, RefreshCw, Layers, DollarSign, UserCheck, Tag, Clock, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import CropHistoryModal from '../components/CropHistoryModal';

export default function BuyerPortal({ lang = 'hi' }) {
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
        const sellableOnly = (marketData.crops || []).filter(c => c.status !== 'unsellable');
        setAvailableCrops(sellableOnly);
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

    const basePricePerKg = crop.qualityStatus?.includes('Organic') ? 48 : crop.qualityStatus?.includes('Grade A') ? 36 : 28;
    const finalPricePerKg = crop.suggestedPriceDrop ? Math.round(basePricePerKg * 0.8) : basePricePerKg;
    const totalAmount = crop.quantity * finalPricePerKg;

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
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem 2.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(14, 20, 34, 0.8) 100%)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
        <div>
          <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', borderColor: 'rgba(6, 182, 212, 0.3)', marginBottom: '0.65rem' }}>
            <ShoppingBag size={13} />
            <span>INSTANT COMMODITY SETTLEMENT</span>
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.35rem 0' }}>
            {lang === 'hi' ? 'व्यापारी व थोक मंडी पोर्टल' : 'Buyer Fair-Trade Marketplace'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.94rem', maxWidth: '600px' }}>
            {lang === 'hi'
              ? 'सत्यापित कृषि उपज की थोक खरीद करें, 15-दिन पुनः सत्यापित मूल्य छूट देखें और ब्लॉकचेन सेटलमेंट प्राप्त करें।'
              : 'Browse verified agricultural commodities, view re-verified price drops, and settle trades on blockchain.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Active Buyer Selector */}
          <div style={{ background: 'rgba(11, 16, 26, 0.85)', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserCheck size={18} color="#06b6d4" />
            <select
              value={selectedBuyerId}
              onChange={(e) => setSelectedBuyerId(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.88rem', color: '#ffffff', outline: 'none', cursor: 'pointer' }}
            >
              {buyers.map(b => (
                <option key={b.uniqueId} value={b.uniqueId} style={{ background: '#0e1421', color: '#ffffff' }}>
                  {b.name} ({b.uniqueId})
                </option>
              ))}
            </select>
          </div>

          <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin-slow' : ''} />
            <span>{lang === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Purchase Receipt Notification */}
      {purchaseReceipt && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <strong style={{ color: '#ffffff', fontSize: '1.05rem' }}>
              {lang === 'hi' ? 'खरीद व भुगतान ब्लॉकचेन पर दर्ज (Settlement Block Minted!)' : 'Settlement Block Minted on Blockchain!'}
            </strong>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            {purchaseReceipt.message}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: '#64748b', fontWeight: 700 }}>TX ID:</span>{' '}
              <span className="font-mono" style={{ color: '#38bdf8' }}>{purchaseReceipt.transaction._id}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', fontWeight: 700 }}>BLOCK:</span>{' '}
              <strong style={{ color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>Block #{purchaseReceipt.block.index}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontWeight: 700 }}>HASH:</span>{' '}
              <span className="font-mono" style={{ color: '#38bdf8' }}>{purchaseReceipt.block.hash.substring(0, 24)}...</span>
            </div>
          </div>
        </div>
      )}

      {/* Available Commodities Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
          {lang === 'hi' ? `मंडी में उपलब्ध प्रमाणित फसलें (${availableCrops.length})` : `Available Commodities (${availableCrops.length})`}
        </h3>
        <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#38bdf8', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          {lang === 'hi' ? 'सत्यापित ब्लॉकचेन सील युक्त' : 'Verified Cryptographic Provenance'}
        </span>
      </div>

      {availableCrops.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: '#94a3b8' }}>
          <p>{lang === 'hi' ? 'वर्तमान में कोई फसल उपलब्ध नहीं है।' : 'No crops available in marketplace right now.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {availableCrops.map(crop => {
            const basePrice = crop.qualityStatus?.includes('Organic') ? 48 : crop.qualityStatus?.includes('Grade A') ? 36 : 28;
            const isAged = crop.status === 'aged-relisted' || crop.suggestedPriceDrop;
            const discountedPrice = isAged ? Math.round(basePrice * 0.8) : basePrice;

            const baseTotal = crop.quantity * basePrice;
            const finalTotal = crop.quantity * discountedPrice;

            return (
              <div
                key={crop._id}
                className="glass-panel glass-panel-glow"
                style={{
                  padding: '1.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: isAged ? '3px solid #f59e0b' : '3px solid #10b981'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{crop.cropType}</h4>
                      <span className="font-mono" style={{ fontSize: '0.72rem', color: '#38bdf8' }}>ID: {crop._id}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      <span className={`badge badge-${crop.currentStage}`}>
                        {crop.currentStage === 'farm' ? '● At Farm Gate' : '● In Warehouse Silo'}
                      </span>

                      {/* 15-Day Aging Re-verification Tag */}
                      {isAged && (
                        <span className="badge badge-aging">
                          <Clock size={11} />
                          <span>15-Day Re-verified (-20%)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(11, 16, 26, 0.7)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '1.25rem', fontSize: '0.86rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                      <span style={{ color: '#64748b' }}>{lang === 'hi' ? 'उपलब्ध मात्रा' : 'Quantity'}:</span>
                      <strong style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                        {crop.quantity.toLocaleString()} kg ({(crop.quantity / 100).toFixed(1)} Q)
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                      <span style={{ color: '#64748b' }}>{lang === 'hi' ? 'गुणवत्ता ग्रेड' : 'Quality'}:</span>
                      <span className="badge badge-quality">{crop.qualityStatus || 'Grade A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                      <span style={{ color: '#64748b' }}>{lang === 'hi' ? 'मूल किसान' : 'Farmer'}:</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{crop.farmerName || crop.farmerId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>{lang === 'hi' ? 'सूचीबद्ध तिथि' : 'Listed'}:</span>
                      <span style={{ color: '#94a3b8' }}>{new Date(crop.listedDate || crop.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.35rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        {lang === 'hi' ? 'थोक दर (प्रति किलो)' : 'Rate / kg'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginTop: '0.2rem' }}>
                        <strong style={{ fontSize: '1.45rem', color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
                          ₹{discountedPrice}
                        </strong>
                        {isAged && (
                          <span style={{ textDecoration: 'line-through', color: '#64748b', fontSize: '0.85rem' }}>
                            ₹{basePrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        {lang === 'hi' ? 'कुल राशि' : 'Total Amount'}
                      </span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                        ₹{finalTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => openHistoryModal(crop)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: '0 0 auto' }}
                    title="Audit blockchain chain"
                  >
                    <Layers size={15} />
                    <span>{lang === 'hi' ? 'लेजर' : 'Audit Chain'}</span>
                  </button>

                  <button
                    onClick={() => handlePurchase(crop)}
                    disabled={purchasingCropId === crop._id}
                    className="btn btn-primary"
                    style={{ flex: 1, fontWeight: 800 }}
                  >
                    <ShoppingBag size={16} />
                    <span>{purchasingCropId === crop._id ? 'Settling...' : lang === 'hi' ? 'तुरंत खरीदें (Buy Now)' : 'Execute Trade'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Settled Trades Section */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span>{lang === 'hi' ? 'हाल ही में संपन्न व्यापार (Settled Trades On-Chain)' : 'Settled Transactions (On-Chain Proof)'}</span>
          </h3>
        </div>

        {soldCrops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
            <p>{lang === 'hi' ? 'अभी तक कोई फसल नहीं बिकी है।' : 'No closed transactions yet.'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#64748b', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'फसल' : 'Crop'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'मात्रा' : 'Quantity'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{lang === 'hi' ? 'लेजर प्रमाण' : 'Ledger Proof'}</th>
                </tr>
              </thead>
              <tbody>
                {soldCrops.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong style={{ color: '#ffffff' }}>{c.cropType}</strong>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#38bdf8' }}>{c._id}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{c.quantity} kg</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-sold">● Settled & Paid</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => openHistoryModal(c)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Layers size={14} />
                        <span>Audit Proof</span>
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
        lang={lang}
      />
    </div>
  );
}
