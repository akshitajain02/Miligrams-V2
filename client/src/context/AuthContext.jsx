import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'miligrams_auth_session';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved auth:', e);
    }
    // Default seed session for instant accessibility
    return {
      isAuthenticated: true,
      role: 'farmer',
      user: {
        uniqueId: 'FARMER-101',
        name: 'Ramesh Patel',
        role: 'farmer',
        location: 'Ludhiana, Punjab',
        contact: '+91 98765 43210',
        kycStatus: 'verified',
        agriStackId: 'AGRI-PB-2026-8891',
        aadhaarNumber: 'XXXX-XXXX-4321',
        khatauniNumber: 'KH-9021/26-PB',
        rating: 4.9
      }
    };
  });

  useEffect(() => {
    try {
      if (authState) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist auth:', e);
    }
  }, [authState]);

  const login = (role, userDetails) => {
    const session = {
      isAuthenticated: true,
      role,
      user: {
        role,
        ...userDetails
      }
    };
    setAuthState(session);
    return session;
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      role: null,
      user: null
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateUser = (updates) => {
    setAuthState(prev => {
      if (!prev || !prev.user) return prev;
      return {
        ...prev,
        user: {
          ...prev.user,
          ...updates
        }
      };
    });
  };

  const switchRole = (newRole, userDetails = {}) => {
    setAuthState(prev => ({
      isAuthenticated: true,
      role: newRole,
      user: {
        role: newRole,
        ...(userDetails.name ? userDetails : prev?.user || {})
      }
    }));
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: authState?.isAuthenticated || false,
      currentRole: authState?.role || null,
      currentUser: authState?.user || null,
      login,
      logout,
      updateUser,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
