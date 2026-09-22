import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sprout, Building2, ShoppingBag, ShieldCheck, Layers, 
  Globe, ChevronRight, Sun, Moon, LogIn, LogOut, 
  CheckCircle2, AlertTriangle, User, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSelectModal from './RoleSelectModal';

export default function Sidebar({ 
  lang = 'hi', 
  setLang, 
  theme = 'dark', 
  toggleTheme,
  isCollapsed = false,
  setIsCollapsed = () => {}
}) {
  const [chainValid, setChainValid] = useState(true);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, currentRole, logout } = useAuth();

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

  // Determine active portal persona based on current route or auth role
  const getRoleInfo = () => {
    const roleId = currentRole || (location.pathname.startsWith('/warehouse') ? 'warehouse' :
      location.pathname.startsWith('/buyer') ? 'buyer' :
      location.pathname.startsWith('/admin') ? 'admin' : 'farmer');

    if (roleId === 'warehouse') {
      return { id: 'warehouse', nameHi: 'गोदाम प्रबंधक', nameEn: 'Warehouse Hub', icon: Building2, color: '#f59e0b' };
    }
    if (roleId === 'buyer') {
      return { id: 'buyer', nameHi: 'व्यापारी मंडी', nameEn: 'Commodity Buyer', icon: ShoppingBag, color: '#06b6d4' };
    }
    if (roleId === 'admin') {
      return { id: 'admin', nameHi: 'सिस्टम एडमिन', nameEn: 'Ledger Admin', icon: ShieldCheck, color: '#8b5cf6' };
    }
    return { id: 'farmer', nameHi: 'किसान पोर्टल', nameEn: 'Farmer Portal', icon: Sprout, color: '#10b981' };
  };

  const activeRole = getRoleInfo();
  const RoleIcon = activeRole.icon;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Top Brand Emblem & Collapse Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', marginBottom: '0.85rem', flexDirection: isCollapsed ? 'column' : 'row', gap: isCollapsed ? '0.6rem' : '0' }}>
          <div 
            className="sidebar-brand" 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer', flex: isCollapsed ? '0 0 auto' : 1, margin: 0, padding: isCollapsed ? '0' : '0.4rem 0.4rem 0.95rem', borderBottom: isCollapsed ? 'none' : '1px solid var(--border)' }}
            title="Miligrams Home & Story"
          >
            <div className="sidebar-brand-icon">
              <Sprout size={20} />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="sidebar-brand-title">Miligrams</h1>
                <p className="sidebar-brand-sub">Agri-Blockchain v2.0</p>
              </div>
            )}
          </div>

          {/* Collapse / Expand Toggle Button ("अंदर / बाहर करें") */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="sidebar-collapse-toggle-btn"
            title={isCollapsed ? (lang === 'hi' ? 'साइडबार बाहर निकालें (Expand)' : 'Expand Sidebar') : (lang === 'hi' ? 'साइडबार अंदर करें (Collapse)' : 'Collapse Sidebar')}
          >
            <ChevronRight size={15} style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s ease' }} />
          </button>
        </div>

        {/* User Session & Role Card */}
        {isAuthenticated && currentUser ? (
          isCollapsed ? (
            <div 
              className="sidebar-role-mini-card"
              onClick={() => setIsRoleModalOpen(true)}
              title={`${currentUser.name || currentUser.uniqueId} • ${lang === 'hi' ? activeRole.nameHi : activeRole.nameEn} (Click to switch role)`}
              style={{ cursor: 'pointer', margin: '0.5rem auto 1rem', width: '38px', height: '38px', borderRadius: '10px', background: `${activeRole.color}20`, border: `1px solid ${activeRole.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
              <RoleIcon size={18} color={activeRole.color} />
              <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', border: '1.5px solid #0f172a' }} />
            </div>
          ) : (
            <div className="sidebar-role-card" style={{ marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {lang === 'hi' ? 'सक्रिय खाता' : 'LOGGED IN'}
                </span>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: `${activeRole.color}20`, color: activeRole.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RoleIcon size={14} />
                </div>
              </div>

              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name || currentUser.uniqueId}
              </div>

              {/* KYC Badge if Farmer */}
              {currentUser.role === 'farmer' && (
                <div style={{ marginBottom: '0.5rem' }}>
                  {currentUser.kycStatus === 'verified' ? (
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)', fontSize: '0.66rem', padding: '0.15rem 0.45rem' }}>
                      <CheckCircle2 size={10} />
                      <span>KYC Verified</span>
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)', fontSize: '0.66rem', padding: '0.15rem 0.45rem' }}>
                      <AlertTriangle size={10} />
                      <span>KYC Pending</span>
                    </span>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.45rem' }}>
                <button
                  onClick={() => setIsRoleModalOpen(true)}
                  className="sidebar-switch-role-btn"
                  style={{ flex: 1 }}
                  title="Switch portal workspace"
                >
                  <span>{lang === 'hi' ? 'भूमिका' : 'Role'}</span>
                  <ChevronRight size={13} />
                </button>

                <button
                  onClick={handleLogout}
                  className="sidebar-switch-role-btn"
                  style={{ width: 'auto', padding: '0.35rem 0.5rem', color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.25)' }}
                  title="Log out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          )
        ) : (
          isCollapsed ? (
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-sm"
              style={{ width: '38px', height: '38px', padding: 0, margin: '0.5rem auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={lang === 'hi' ? 'लॉगिन करें' : 'Sign In'}
            >
              <LogIn size={15} />
            </button>
          ) : (
            <div className="sidebar-role-card" style={{ marginBottom: '0.9rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {lang === 'hi' ? 'पोर्टल में प्रवेश के लिए लॉगिन करें' : 'Sign in to access portals'}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', fontSize: '0.76rem' }}
              >
                <LogIn size={13} />
                <span>{lang === 'hi' ? 'लॉगिन करें' : 'Sign In'}</span>
              </button>
            </div>
          )
        )}

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {!isCollapsed && (
            <div className="sidebar-section-title">
              {lang === 'hi' ? 'मुख्य कार्यक्षेत्र (Portals)' : 'Enterprise Portals'}
            </div>
          )}

          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active-farmer' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            title={lang === 'hi' ? 'मुख्य पृष्ठ (Front Page)' : 'Home & Story'}
          >
            <span className="sidebar-nav-icon"><Globe size={18} /></span>
            {!isCollapsed && <span>{lang === 'hi' ? 'मुख्य पृष्ठ (Front Page)' : 'Home & Story'}</span>}
          </NavLink>

          <NavLink
            to="/overview"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active-farmer' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            title={lang === 'hi' ? 'सिस्टम ओवरव्यू (3D Ecosystem)' : '3D Ecosystem'}
          >
            <span className="sidebar-nav-icon"><Layers size={18} /></span>
            {!isCollapsed && <span>{lang === 'hi' ? 'सिस्टम ओवरव्यू' : '3D Ecosystem'}</span>}
          </NavLink>

          <NavLink
            to="/farmer"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active-farmer' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            title={lang === 'hi' ? 'किसान पोर्टल (Farmer Voice Portal)' : 'Farmer Voice Portal'}
          >
            <span className="sidebar-nav-icon"><Sprout size={18} /></span>
            {!isCollapsed && <span>{lang === 'hi' ? 'किसान पोर्टल' : 'Farmer Voice Portal'}</span>}
          </NavLink>

          <NavLink
            to="/warehouse"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active-warehouse' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            title={lang === 'hi' ? 'गोदाम / साइलो (Smart Warehouse)' : 'Smart Warehouse'}
          >
            <span className="sidebar-nav-icon"><Building2 size={18} /></span>
            {!isCollapsed && <span>{lang === 'hi' ? 'गोदाम / साइलो' : 'Smart Warehouse'}</span>}
          </NavLink>

          <NavLink
            to="/buyer"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active-buyer' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            title={lang === 'hi' ? 'व्यापारी मंडी (Buyer Marketplace)' : 'Buyer Marketplace'}
          >
            <span className="sidebar-nav-icon"><ShoppingBag size={18} /></span>
            {!isCollapsed && <span>{lang === 'hi' ? 'व्यापारी मंडी' : 'Buyer Marketplace'}</span>}
          </NavLink>

          <NavLink
            to="/admin"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active-admin' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            title={lang === 'hi' ? 'एडमिन व लेजर (Admin & Governance)' : 'Admin & Governance'}
          >
            <span className="sidebar-nav-icon"><ShieldCheck size={18} /></span>
            {!isCollapsed && <span>{lang === 'hi' ? 'एडमिन व लेजर' : 'Admin & Governance'}</span>}
          </NavLink>

          {/* Dedicated Login Link */}
          <NavLink
            to="/login"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active-farmer' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            style={{ marginTop: 'auto', borderTop: '1px solid var(--border)' }}
            title={lang === 'hi' ? 'लॉगिन / भूमिका बदलें' : 'Login / Switch Role'}
          >
            <span className="sidebar-nav-icon"><LogIn size={17} /></span>
            {!isCollapsed && <span>{lang === 'hi' ? 'लॉगिन / भूमिका' : 'Login / Switch Role'}</span>}
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {isCollapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={toggleTheme}
                className="btn btn-secondary btn-sm"
                style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun size={14} color="#fbbf24" /> : <Moon size={14} color="#38bdf8" />}
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
                style={{ width: '32px', height: '32px', padding: 0, fontSize: '0.68rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={lang === 'hi' ? 'Switch to English' : 'हिन्दी में बदलें'}
              >
                {lang === 'hi' ? 'हि' : 'EN'}
              </button>

              <div
                className={`pulsing-dot ${chainValid ? 'pulsing-dot-green' : 'pulsing-dot-red'}`}
                style={{ margin: '0.2rem auto' }}
                title={chainValid ? (lang === 'hi' ? 'लेजर सुरक्षित (SHA-256)' : 'Ledger Active | Sealed') : (lang === 'hi' ? 'चेतावनी: छेड़छाड़!' : 'Alert: Tamper Detected!')}
              />
            </div>
          ) : (
            <>
              {/* Controls: Theme Switch & Language Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.28rem 0.55rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun size={13} color="#f59e0b" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon size={13} color="#38bdf8" />
                      <span>Dark</span>
                    </>
                  )}
                </button>

                {/* Language Switcher */}
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
                    ? (lang === 'hi' ? 'लेजर सुरक्षित (SHA-256)' : 'Ledger Active | Sealed')
                    : (lang === 'hi' ? 'चेतावनी: छेड़छाड़!' : 'Alert: Tamper Detected!')}
                </span>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Role Selection Modal */}
      <RoleSelectModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={activeRole.id}
        lang={lang}
      />
    </>
  );
}
