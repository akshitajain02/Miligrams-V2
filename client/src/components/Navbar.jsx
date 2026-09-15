import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sprout, Package, ShoppingBag, ShieldCheck, Layers, Building2 } from 'lucide-react';

export default function Navbar() {
  const [chainValid, setChainValid] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetch('/api/ledger/verify-chain')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setChainValid(data.isValid);
        }
      })
      .catch(() => setChainValid(true));
  }, [location.pathname]);

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand */}
        <Link to="/farmer" className="nav-brand">
          <div className="brand-icon">
            🌾
          </div>
          <div className="brand-text">
            <h1>मिलीग्राम्स <span>Miligrams</span></h1>
            <p>Agri Crop-Tracking & Blockchain</p>
          </div>
        </Link>

        {/* 4-Panel Role Switcher */}
        <div className="portal-switcher">
          <NavLink
            to="/farmer"
            className={({ isActive }) => `portal-tab ${isActive ? 'active' : ''}`}
          >
            <span>🌾 किसान पोर्टल (Farmer)</span>
          </NavLink>

          <NavLink
            to="/warehouse"
            className={({ isActive }) => `portal-tab ${isActive ? 'active active-warehouse' : ''}`}
          >
            <span>🏢 गोदाम / हब (Warehouse)</span>
          </NavLink>

          <NavLink
            to="/buyer"
            className={({ isActive }) => `portal-tab ${isActive ? 'active active-buyer' : ''}`}
          >
            <span>💼 व्यापारी (Buyer)</span>
          </NavLink>

          <NavLink
            to="/admin"
            className={({ isActive }) => `portal-tab ${isActive ? 'active active-admin' : ''}`}
          >
            <span>🛡️ एडमिन व लेजर (Admin)</span>
          </NavLink>
        </div>

        {/* Blockchain Status Indicator */}
        <div className="nav-profile-pill" style={{ background: chainValid ? '#f0fdf4' : '#fee2e2', borderColor: chainValid ? '#bbf7d0' : '#fca5a5' }}>
          <span className="status-dot" style={{ background: chainValid ? '#16a34a' : '#dc2626' }}></span>
          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: chainValid ? '#15803d' : '#991b1b' }}>
            {chainValid ? 'ब्लॉकचेन सुरक्षित' : 'चेन में छेड़छाड़!'}
          </span>
        </div>
      </div>
    </header>
  );
}
