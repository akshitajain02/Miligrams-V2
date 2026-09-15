import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Sprout } from 'lucide-react';

export default function NotFound({ lang = 'hi' }) {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        {/* Glowing Badge */}
        <div className="not-found-icon-wrap">
          <ShieldAlert size={38} color="#f43f5e" />
          <div className="not-found-ping"></div>
        </div>

        <div className="font-mono not-found-code">
          BLOCK #404_NOT_FOUND
        </div>

        <h2 className="not-found-title">
          {lang === 'hi' ? 'यह फसल या रिकॉर्ड लेजर में नहीं मिला' : 'Block or Page Not Found'}
        </h2>

        <p className="not-found-desc">
          {lang === 'hi'
            ? 'जो पेज या ब्लॉक आप ढूंढ रहे हैं, वह मिलीग्राम्स ब्लॉकचेन नेटवर्क पर मौजूद नहीं है या हटा दिया गया है।'
            : 'The requested blockchain block, crop hash, or URL does not exist on this ledger.'}
        </p>

        <div className="not-found-actions">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>{lang === 'hi' ? 'पीछे जाएं' : 'Go Back'}</span>
          </button>

          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            <span>{lang === 'hi' ? 'होम पेज पर जाएं' : 'Return to Overview'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
