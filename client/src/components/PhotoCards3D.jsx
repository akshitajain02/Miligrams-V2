import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Sprout, Building2, Smartphone, X } from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export default function PhotoCards3D({ lang = 'hi' }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const cards = [
    {
      id: 1,
      image: '/farmer-thumbs-up-sold.jpg',
      badgeHi: 'सत्यापित खरीद • Fair Trade',
      badgeEn: 'VERIFIED SETTLEMENT',
      badgeColor: '#10b981',
      titleHi: 'किसान की मेहनत, समृद्ध भारत',
      titleEn: 'Crop Sold Successfully!',
      subHi: 'मोबाइल पर सीधे "Crop Sold Successfully" का डिजिटल संदेश और बिना बिचौलियों के उचित मूल्य।',
      subEn: 'Direct trading with verified buyers, instant payment confirmation, and zero intermediary cuts.',
      icon: Smartphone
    },
    {
      id: 2,
      image: '/farmer-sunset-field.jpg',
      badgeHi: 'प्रकृति सम्मत • Peace of Mind',
      badgeEn: 'SUSTAINABLE HARVEST',
      badgeColor: '#f59e0b',
      titleHi: 'हरित खेत व निश्चिंत जीवन',
      titleEn: 'Serene Farms, Guaranteed Value',
      subHi: 'फसल की शेल्फ लाइफ सुरक्षा और पारदर्शी लेजर से किसानों को मिला अपनी मेहनत का सच्चा सम्मान।',
      subEn: 'Peace of mind with transparent crop aging records, price protection, and zero food spoilage.',
      icon: Sprout
    },
    {
      id: 3,
      image: '/farm-aerial-harvest.jpg',
      badgeHi: 'स्मार्ट भंडारण • 20k Silos',
      badgeEn: 'MODERN LOGISTICS',
      badgeColor: '#06b6d4',
      titleHi: 'खेत से साइलो तक त्वरित लॉजिस्टिक्स',
      titleEn: 'Harvest to 20,000 Quintal Silos',
      subHi: '20,000 क्विंटल आधुनिक साइलो, अनाज नमी सेंसर (<12%) और कोल्ड/ड्राई स्टोरेज का वैज्ञानिक प्रबंधन।',
      subEn: 'From combine harvesting to climate-controlled silo storage with real-time moisture telemetry.',
      icon: Building2
    },
    {
      id: 4,
      image: '/mascot-farmer-boy.jpg',
      badgeHi: 'आवाज AI साथी • Kisan Mitra',
      badgeEn: 'VOICE AI COMPANION',
      badgeColor: '#8b5cf6',
      titleHi: 'एआई किसान मित्र — सुगम आवाज सहायता',
      titleEn: 'Kisan Mitra AI Assistant',
      subHi: 'कम पढ़े-लिखे किसानों के लिए बोलकर फसल दर्ज करने वाला पहला भारतीय डिजिटल साथी।',
      subEn: 'Intuitive voice-guided crop logging and hands-free assistance for every grassroots farmer.',
      icon: Sparkles
    }
  ];

  return (
    <div className="photo-cards-3d-wrapper">
      <div className="photo-cards-3d-grid">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.id}
              className="photo-3d-card glass-panel"
              whileHover={{ 
                y: -6, 
                rotateX: 3, 
                rotateY: -3,
                boxShadow: "0 18px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(16, 185, 129, 0.2)"
              }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => { soundFX.click(); setSelectedPhoto(c); }}
            >
              {/* Image Frame with Overlay */}
              <div className="photo-3d-image-frame">
                <img src={c.image} alt={c.titleEn} className="photo-3d-img" />
                <div className="photo-3d-overlay" />
                
                {/* Floating Badge */}
                <div className="photo-3d-badge" style={{ background: `${c.badgeColor}25`, borderColor: `${c.badgeColor}50`, color: c.badgeColor }}>
                  <Icon size={12} />
                  <span>{lang === 'hi' ? c.badgeHi : c.badgeEn}</span>
                </div>
              </div>

              {/* Text Card Body */}
              <div className="photo-3d-body">
                <h3 className="photo-3d-title">
                  {lang === 'hi' ? c.titleHi : c.titleEn}
                </h3>
                <p className="photo-3d-sub">
                  {lang === 'hi' ? c.subHi : c.subEn}
                </p>

                <div className="photo-3d-footer">
                  <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 800 }}>
                    {lang === 'hi' ? 'विस्तार देखें' : 'View Details'}
                  </span>
                  <ArrowRight size={13} color="#34d399" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded Photo Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="photo-modal-backdrop"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="photo-modal-card glass-panel"
              onClick={e => e.stopPropagation()}
            >
              <div className="photo-modal-img-wrap">
                <img src={selectedPhoto.image} alt={selectedPhoto.titleEn} className="photo-modal-img" />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="photo-modal-close-btn"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="photo-modal-content">
                <span className="badge" style={{ background: `${selectedPhoto.badgeColor}20`, color: selectedPhoto.badgeColor, borderColor: `${selectedPhoto.badgeColor}40`, marginBottom: '0.5rem' }}>
                  {lang === 'hi' ? selectedPhoto.badgeHi : selectedPhoto.badgeEn}
                </span>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0 0.5rem', color: 'var(--text-main)' }}>
                  {lang === 'hi' ? selectedPhoto.titleHi : selectedPhoto.titleEn}
                </h3>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                  {lang === 'hi' ? selectedPhoto.subHi : selectedPhoto.subEn}
                </p>

                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <span>{lang === 'hi' ? 'बंद करें' : 'Close Preview'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
