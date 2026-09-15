import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, Building2, ShoppingBag, ShieldCheck, Layers, Globe, ChevronRight, Shield, Zap, Sparkles } from 'lucide-react';
import RoleSelectModal from './RoleSelectModal';

export default function Sidebar({ lang = 'hi', setLang }) {
  const [chainValid, setChainValid] = useState(true);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  // Determine active portal persona based on current route
  const getRoleInfo = () => {
    const p = location.pathname;
    if (p.startsWith('/warehouse')) {
      return { id: 'warehouse', nameHi: 'गोदाम प्रबंधक', nameEn: 'Warehouse Hub', icon: Building2, color: '#f59e0b' };
    }
    if (p.startsWith('/buyer')) {
      return { id: 'buyer', nameHi: 'व्यापारी मंडी', nameEn: 'Commodity Buyer', icon: ShoppingBag, color: '#06b6d4' };
    }
    if (p.startsWith('/admin')) {
      return { id: 'admin', nameHi: 'सिस्टम एडमिन', nameEn: 'Ledger Admin', icon: ShieldCheck, color: '#8b5cf6' };
    }
    return { id: 'farmer', nameHi: 'किसान पोर्टल', nameEn: 'Farmer Portal', icon: Sprout, color: '#10b981' };
  };

  const currentRole = getRoleInfo();
  const RoleIcon = currentRole.icon;

  return (
    <>
      <aside className="app-sidebar">
        {/* Top Brand Emblem */}
        <div className="sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="sidebar-brand-icon">
            <Sprout size={24} />
          </div>
          <div>
            <h1 className="sidebar-brand-title">Miligrams</h1>
            <p className="sidebar-brand-sub">Agri-Blockchain v2.0</p>
          </div>
        </div>

        {/* Active Role Selector Card */}
        <div className="sidebar-role-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {lang === 'hi' ? 'सक्रिय कार्यक्षेत्र' : 'ACTIVE PERSONA'}
            </span>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: `${currentRole.color}20`, color: currentRole.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RoleIcon size={15} />
            </div>
          </div>

          <div style={{ fontSize: '1.02rem', fontWeight: 800, color: currentRole.color, marginBottom: '0.65rem' }}>
            {lang === 'hi' ? currentRole.nameHi : currentRole.nameEn}
          </div>

          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="sidebar-switch-role-btn"
          >
            <span>{lang === 'hi' ? 'भूमिका बदलें' : 'Switch Workspace'}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">
            {lang === 'hi' ? 'मुख्य कार्यक्षेत्र (Portals)' : 'Enterprise Portals'}
          </div>

          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active-farmer' : ''}`}
          >
            <span className="sidebar-nav-icon"><Layers size={18} /></span>
            <span>{lang === 'hi' ? 'होम व नेविगेटर' : 'Home & Navigator'}</span>
          </NavLink>

          <NavLink
            to="/farmer"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active-farmer' : ''}`}
          >
            <span className="sidebar-nav-icon"><Sprout size={18} /></span>
            <span>{lang === 'hi' ? 'किसान पोर्टल' : 'Farmer Voice Portal'}</span>
          </NavLink>

          <NavLink
            to="/warehouse"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active-warehouse' : ''}`}
          >
            <span className="sidebar-nav-icon"><Building2 size={18} /></span>
            <span>{lang === 'hi' ? 'गोदाम / साइलो' : 'Smart Warehouse Silos'}</span>
          </NavLink>

          <NavLink
            to="/buyer"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active-buyer' : ''}`}
          >
            <span className="sidebar-nav-icon"><ShoppingBag size={18} /></span>
            <span>{lang === 'hi' ? 'व्यापारी मंडी' : 'Buyer Fair-Trade'}</span>
          </NavLink>

          <NavLink
            to="/admin"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active-admin' : ''}`}
          >
            <span className="sidebar-nav-icon"><ShieldCheck size={18} /></span>
            <span>{lang === 'hi' ? 'एडमिन व लेजर' : 'Ledger & Aging Engine'}</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* Language Switcher */}
          <div className="sidebar-lang-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: '#94a3b8', fontWeight: 700 }}>
              <Globe size={14} color="#10b981" />
              <span>{lang === 'hi' ? 'भाषा' : 'Language'}</span>
            </div>
            <div className="sidebar-lang-toggle">
              <button
                className={`lang-btn ${lang === 'hi' ? 'active' : ''}`}
                onClick={() => setLang('hi')}
              >
                हिन्दी
              </button>
              <button
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>
          </div>

          {/* Live Blockchain Node Status Beacon */}
          <div
            className="sidebar-chain-status"
            style={{
              background: chainValid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.1)',
              borderColor: chainValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.4)',
              color: chainValid ? '#34d399' : '#fb7185'
            }}
          >
            <div className={`pulsing-dot ${chainValid ? 'pulsing-dot-green' : 'pulsing-dot-red'}`} />
            <span>
              {chainValid
                ? (lang === 'hi' ? 'लेजर अखंड: SHA-256 सुरक्षित' : 'Node Active | SHA-256 Sealed')
                : (lang === 'hi' ? 'चेतावनी: लेजर में छेड़छाड़!' : 'Alert: Tamper Detected!')}
            </span>
          </div>
        </div>
      </aside>

      {/* Role Selection Modal */}
      <RoleSelectModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={currentRole.id}
        lang={lang}
      />
    </>
  );
}
