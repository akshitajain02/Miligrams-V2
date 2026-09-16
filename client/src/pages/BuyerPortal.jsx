import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, CheckCircle2, Shield, RefreshCw, Layers, 
  DollarSign, UserCheck, Tag, Clock, ArrowRight, Sparkles, 
  Building2, Star, Award, MessageSquare, ThumbsUp, X, User 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../utils/audioFX';

export default function BuyerPortal({ lang = 'hi' }) {
  const { currentUser } = useAuth();
  const [availableCrops, setAvailableCrops] = useState([]);
  const [soldCrops, setSoldCrops] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(
    currentUser?.role === 'buyer' ? currentUser.uniqueId : 'BUYER-501'
  );
  const [loading, setLoading] = useState(true);
  const [purchasingCropId, setPurchasingCropId] = useState(null);
  const [purchaseReceipt, setPurchaseReceipt] = useState(null);

  // Farmer Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingFarmer, setReviewingFarmer] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewCropType, setReviewCropType] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessBanner, setReviewSuccessBanner] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [marketRes, buyersRes, farmersRes] = await Promise.all([
        fetch('/api/marketplace/browse'),
        fetch('/api/marketplace/buyers'),
        fetch('/api/farmers')
      ]);

      const marketData = await marketRes.json();
      const buyersData = await buyersRes.json();
      const farmersData = await farmersRes.json();

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
      if (farmersData.success) {
        setFarmers(farmersData.farmers || []);
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
    soundFX.click();
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

      setPurchaseReceipt({
        ...data,
        cropType: crop.cropType,
        quantity: crop.quantity,
        farmerId: crop.farmerId,
        farmerName: crop.farmerName,
        totalAmount
      });
      fetchData();
    } catch (err) {
      alert(`Purchase failed: ${err.message}`);
    } finally {
      setPurchasingCropId(null);
    }
  };

  const handleOpenReviewModal = (farmerId, farmerName, cropType = '') => {
    soundFX.click();
    setReviewingFarmer({
      id: farmerId,
      name: farmerName
    });
    setReviewCropType(cropType);
    setReviewRating(5);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewingFarmer) return;

    setIsSubmittingReview(true);
    try {
      const activeBuyer = buyers.find(b => b.uniqueId === selectedBuyerId);
      const res = await fetch(`/api/farmers/${reviewingFarmer.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: selectedBuyerId,
          buyerName: activeBuyer?.name || 'Mandi Merchant',
          rating: Number(reviewRating),
          comment: reviewComment,
          cropType: reviewCropType
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to record review');
      }

      setIsReviewModalOpen(false);
      setReviewSuccessBanner(
        lang === 'hi' 
          ? `किसान ${reviewingFarmer.name} को ⭐ ${reviewRating} स्टार समीक्षा सफलतापूर्वक दी गई!`
          : `Review with ⭐ ${reviewRating} stars recorded for ${reviewingFarmer.name}!`
      );
      fetchData();
    } catch (err) {
      alert(`Review Error: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Compute Top Rated Farmers for Leaderboard
  const topFarmers = [...farmers]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  return (
    <div>
      {/* Header Banner - Clean & Modern */}
      <div className="glass-panel" style={{ padding: '2rem 2.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(14, 20, 34, 0.8) 100%)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
        <div>
          <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', borderColor: 'rgba(6, 182, 212, 0.3)', marginBottom: '0.65rem' }}>
            <ShoppingBag size={13} />
            <span>INSTANT COMMODITY SETTLEMENT</span>
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: '0.35rem 0' }}>
            {lang === 'hi' ? 'व्यापारी मंडी व खरीद पोर्टल' : 'Buyer Fair-Trade Marketplace'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', maxWidth: '600px' }}>
            {lang === 'hi'
              ? 'प्रमाणित किसानों से सीधी थोक खरीद करें, स्टार रेटिंग के आधार पर सर्वश्रेष्ठ उत्पादक चुनें और सुरक्षित डिजिटल व्यापार करें।'
              : 'Direct commodity procurement from verified farmers with transparent ratings, 15-day price discounts and instant settlement.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Active Buyer Selector */}
          <div style={{ background: 'var(--surface-solid)', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserCheck size={18} color="#06b6d4" />
            <select
              value={selectedBuyerId}
              onChange={(e) => setSelectedBuyerId(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}
            >
              {buyers.map(b => (
                <option key={b.uniqueId} value={b.uniqueId}>
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

      {/* Review Success Notification Banner */}
      {reviewSuccessBanner && (
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', padding: '1rem 1.4rem', borderRadius: 'var(--radius)', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span>{reviewSuccessBanner}</span>
          </div>
          <button onClick={() => setReviewSuccessBanner(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Clean Purchase Receipt Notification (No raw hashes!) */}
      {purchaseReceipt && (
        <div className="glass-panel" style={{ padding: '1.4rem 1.75rem', marginBottom: '2rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem', display: 'block' }}>
                  {lang === 'hi' ? 'खरीद व भुगतान सफलतापूर्वक संपन्न!' : 'Trade Executed & Settled Successfully!'}
                </strong>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {purchaseReceipt.cropType} • {purchaseReceipt.quantity} kg • ₹{purchaseReceipt.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleOpenReviewModal(purchaseReceipt.farmerId, purchaseReceipt.farmerName, purchaseReceipt.cropType)}
              className="btn btn-primary btn-sm"
              style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
            >
              <Star size={14} />
              <span>{lang === 'hi' ? 'किसान को रेटिंग व समीक्षा दें' : 'Rate & Review Farmer'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Rated Producers / Farmers Showcase */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {lang === 'hi' ? 'शीर्ष रेटेड किसान व उत्पादक (Top Rated Producers)' : 'Top Rated Producers'}
            </h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {lang === 'hi' ? 'व्यापारियों की वास्तविक समीक्षाओं के आधार पर' : 'Ranked by buyer reviews'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {topFarmers.map((f, idx) => (
            <div 
              key={f.uniqueId} 
              className="glass-panel" 
              style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: idx === 0 ? '4px solid #f59e0b' : '4px solid #10b981' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem' }}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {f.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 800, fontSize: '0.9rem' }}>
                    <Star size={14} fill="#f59e0b" />
                    <span>{f.rating || 5.0}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {f.location} • {f.totalReviews || 0} {lang === 'hi' ? 'समीक्षाएं' : 'reviews'}
                </div>

                <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)', fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                    AgriStack Verified
                  </span>

                  <button
                    onClick={() => handleOpenReviewModal(f.uniqueId, f.name)}
                    style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <MessageSquare size={12} />
                    <span>{lang === 'hi' ? 'समीक्षा दें' : 'Review'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Commodities Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {lang === 'hi' ? `मंडी में उपलब्ध प्रमाणित फसलें (${availableCrops.length})` : `Available Commodities (${availableCrops.length})`}
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
            ✓ {lang === 'hi' ? 'केवल केवाईसी-सत्यापित किसानों की उपज' : 'Exclusively from KYC-verified farmers'}
          </span>
        </div>

        <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#38bdf8', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          {lang === 'hi' ? 'स्वायत्त गुणवत्ता प्रमाणन' : 'Quality Assured'}
        </span>
      </div>

      {availableCrops.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>{lang === 'hi' ? 'वर्तमान में कोई प्रमाणित फसल उपलब्ध नहीं है।' : 'No crops available in marketplace right now.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {availableCrops.map(crop => {
            const basePrice = crop.qualityStatus?.includes('Organic') ? 48 : crop.qualityStatus?.includes('Grade A') ? 36 : 28;
            const isAged = crop.status === 'aged-relisted' || crop.suggestedPriceDrop;
            const discountedPrice = isAged ? Math.round(basePrice * 0.8) : basePrice;

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
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{crop.cropType}</h4>
                      {/* Farmer Name & Rating Stars */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
                          {crop.farmerName || crop.farmerId}
                        </span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', padding: '0.1rem 0.4rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                          <Star size={11} fill="#f59e0b" />
                          <span>{crop.farmerRating || 5.0}</span>
                        </div>
                      </div>
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

                  {/* Clean Commodity Specs */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '1.25rem', fontSize: '0.86rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                      <span style={{ color: 'var(--text-light)' }}>{lang === 'hi' ? 'उपलब्ध मात्रा' : 'Quantity'}:</span>
                      <strong style={{ color: 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {crop.quantity.toLocaleString()} kg ({(crop.quantity / 100).toFixed(1)} Q)
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                      <span style={{ color: 'var(--text-light)' }}>{lang === 'hi' ? 'गुणवत्ता ग्रेड' : 'Quality'}:</span>
                      <span className="badge badge-quality">{crop.qualityStatus || 'Grade A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-light)' }}>{lang === 'hi' ? 'स्थान' : 'Location'}:</span>
                      <span style={{ color: 'var(--text-muted)' }}>{crop.farmerLocation || 'Punjab Hub'}</span>
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.35rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {lang === 'hi' ? 'थोक दर (प्रति किलो)' : 'Rate / kg'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginTop: '0.2rem' }}>
                        <strong style={{ fontSize: '1.45rem', color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
                          ₹{discountedPrice}
                        </strong>
                        {isAged && (
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                            ₹{basePrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {lang === 'hi' ? 'कुल राशि' : 'Total Amount'}
                      </span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace' }}>
                        ₹{finalTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleOpenReviewModal(crop.farmerId, crop.farmerName, crop.cropType)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: '0 0 auto' }}
                    title="Review Farmer"
                  >
                    <Star size={14} color="#f59e0b" />
                    <span>{lang === 'hi' ? 'रेटिंग' : 'Rate'}</span>
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

      {/* Settled Trades Section - Clean without cryptic hashes */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span>{lang === 'hi' ? 'हाल ही में संपन्न व्यापार (Settled Transactions)' : 'Settled Transactions'}</span>
          </h3>
        </div>

        {soldCrops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <p>{lang === 'hi' ? 'अभी तक कोई फसल नहीं बिकी है।' : 'No closed transactions yet.'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'फसल व किसान' : 'Crop & Producer'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'मात्रा' : 'Quantity'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{lang === 'hi' ? 'समीक्षा' : 'Feedback'}</th>
                </tr>
              </thead>
              <tbody>
                {soldCrops.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{c.cropType}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.farmerName || c.farmerId}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{c.quantity} kg</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-sold">● Settled & Paid</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenReviewModal(c.farmerId, c.farmerName, c.cropType)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Star size={13} color="#f59e0b" />
                        <span>{lang === 'hi' ? 'समीक्षा लिखें' : 'Review Farmer'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Buyer Farmer Review Modal */}
      {isReviewModalOpen && reviewingFarmer && (
        <div className="modal-overlay" onClick={() => setIsReviewModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={20} fill="#f59e0b" />
                </div>
                <h3>
                  <span>{lang === 'hi' ? 'किसान की रेटिंग व समीक्षा' : 'Rate & Review Producer'}</span>
                </h3>
              </div>
              <button className="modal-close" onClick={() => setIsReviewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.05rem', display: 'block' }}>
                  {reviewingFarmer.name}
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  ID: {reviewingFarmer.id} {reviewCropType && `• ${reviewCropType}`}
                </span>
              </div>

              <form onSubmit={handleSubmitReview}>
                {/* Star Rating Select */}
                <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  <label className="form-label" style={{ marginBottom: '0.65rem' }}>
                    {lang === 'hi' ? 'स्टार रेटिंग चुनें (1 से 5 सितारे)' : 'Select Star Rating (1 to 5)'}
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem' }}>
                    {[1, 2, 3, 4, 5].map(starVal => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setReviewRating(starVal)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.35rem',
                          transition: 'transform 0.15s ease',
                          transform: reviewRating >= starVal ? 'scale(1.15)' : 'scale(1)'
                        }}
                      >
                        <Star 
                          size={32} 
                          color="#f59e0b" 
                          fill={reviewRating >= starVal ? '#f59e0b' : 'transparent'} 
                        />
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: '0.45rem', fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>
                    {reviewRating === 5 ? '⭐⭐⭐⭐⭐ Excellent' :
                     reviewRating === 4 ? '⭐⭐⭐⭐ Very Good' :
                     reviewRating === 3 ? '⭐⭐⭐ Good' :
                     reviewRating === 2 ? '⭐⭐ Fair' : '⭐ Needs Improvement'}
                  </div>
                </div>

                {/* Review Comment Textarea */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">
                    {lang === 'hi' ? 'समीक्षा व टिप्पणी (Review Comments)' : 'Review Comments'}
                  </label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    placeholder={lang === 'hi' ? 'फसल की गुणवत्ता, पैकेजिंग व डिलीवरी के बारे में लिखें...' : 'Write about crop quality, moisture level, and timely dispatch...'}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                  />
                </div>

                <div className="modal-footer" style={{ padding: 0 }}>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="btn btn-primary"
                    style={{ background: '#f59e0b', borderColor: '#f59e0b', minWidth: '160px' }}
                  >
                    {isSubmittingReview ? 'Recording...' : (lang === 'hi' ? 'समीक्षा जमा करें' : 'Submit Review')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
