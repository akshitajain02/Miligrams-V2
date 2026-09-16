import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import InteractiveCanvas3D from './components/InteractiveCanvas3D';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import FarmerPortal from './pages/FarmerPortal';
import WarehousePortal from './pages/WarehousePortal';
import BuyerPortal from './pages/BuyerPortal';
import AdminPortal from './pages/AdminPortal';
import NotFound from './pages/NotFound';

export default function App() {
  const [lang, setLang] = useState('hi'); // 'hi' or 'en'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('miligrams_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('miligrams_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Interactive 3D Star & Node Constellation Canvas */}
        <InteractiveCanvas3D />

        <div className="app-layout-sidebar">
          {/* Left Sidebar */}
          <Sidebar 
            lang={lang} 
            setLang={setLang} 
            theme={theme} 
            toggleTheme={toggleTheme} 
          />

          {/* Main Viewport */}
          <div className="app-main-viewport">
            <Routes>
              {/* Default Entry Point: Role-Based Authentication & Gateway */}
              <Route path="/" element={<LoginPage lang={lang} />} />
              <Route path="/login" element={<LoginPage lang={lang} />} />
              
              {/* System Overview & Interactive 3D Ecosystem */}
              <Route path="/overview" element={<LandingPage lang={lang} />} />

              {/* 4 Dedicated Portals */}
              <Route path="/farmer" element={<FarmerPortal lang={lang} />} />
              <Route path="/warehouse" element={<WarehousePortal lang={lang} />} />
              <Route path="/buyer" element={<BuyerPortal lang={lang} />} />
              <Route path="/admin" element={<AdminPortal lang={lang} />} />

              {/* Fallback Aliases */}
              <Route path="/upload" element={<Navigate to="/farmer" replace />} />
              <Route path="/marketplace" element={<Navigate to="/buyer" replace />} />
              <Route path="/ledger" element={<Navigate to="/admin" replace />} />
              <Route path="/register" element={<Navigate to="/login" replace />} />
              
              {/* Custom 404 Error Page */}
              <Route path="*" element={<NotFound lang={lang} />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
