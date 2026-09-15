import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import InteractiveCanvas3D from './components/InteractiveCanvas3D';
import LandingPage from './pages/LandingPage';
import FarmerPortal from './pages/FarmerPortal';
import WarehousePortal from './pages/WarehousePortal';
import BuyerPortal from './pages/BuyerPortal';
import AdminPortal from './pages/AdminPortal';
import NotFound from './pages/NotFound';

export default function App() {
  const [lang, setLang] = useState('hi'); // 'hi' or 'en'

  return (
    <BrowserRouter>
      {/* Interactive 3D Star & Node Constellation Canvas */}
      <InteractiveCanvas3D />

      <div className="app-layout-sidebar">
        {/* Left Sidebar */}
        <Sidebar lang={lang} setLang={setLang} />

        {/* Main Viewport */}
        <div className="app-main-viewport">
          <Routes>
            {/* Interactive Hub with Split Parallax, 3D Quest & Orbital Timeline */}
            <Route path="/" element={<LandingPage lang={lang} />} />
            
            {/* 4 Dedicated Portals */}
            <Route path="/farmer" element={<FarmerPortal lang={lang} />} />
            <Route path="/warehouse" element={<WarehousePortal lang={lang} />} />
            <Route path="/buyer" element={<BuyerPortal lang={lang} />} />
            <Route path="/admin" element={<AdminPortal lang={lang} />} />

            {/* Direct fallbacks */}
            <Route path="/upload" element={<Navigate to="/farmer" replace />} />
            <Route path="/marketplace" element={<Navigate to="/buyer" replace />} />
            <Route path="/ledger" element={<Navigate to="/admin" replace />} />
            <Route path="/register" element={<Navigate to="/admin" replace />} />
            
            {/* Custom 404 Error Page */}
            <Route path="*" element={<NotFound lang={lang} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
