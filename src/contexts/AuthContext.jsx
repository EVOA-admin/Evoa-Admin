import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { adminApi } from '../services/adminApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(undefined);

  function clearAuthState() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminProfile');
    setUser(null);
    setProfile(null);
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) { /* no-op */ }
    clearAuthState();
  };

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
        return;
      }

      try {
        const adminData = await adminApi.getAuthMe();
        if (isMounted && adminData?.id) {
          setUser({ id: adminData.id, email: adminData.email });
          setProfile(adminData);
          localStorage.setItem('adminProfile', JSON.stringify(adminData));
          return;
        }
      } catch (_) { /* proceed to session fallback */ }

      try {
        const adminData = await adminApi.getSession();
        if (isMounted && adminData) {
          setUser({ id: adminData.id || 'admin', email: adminData.email });
          setProfile(adminData);
          return;
        }
      } catch (_) { /* proceed to cached profile fallback */ }

      const cached = localStorage.getItem('adminProfile');
      if (cached && isMounted) {
        try {
          const parsed = JSON.parse(cached);
          setUser({ id: parsed.id, email: parsed.email });
          setProfile(parsed);
          return;
        } catch (_) { /* ignore */ }
      }

      if (isMounted) {
        clearAuthState();
      }
    }

    initAuth();
  }, []);

  const value = {
    user,
    profile,
    loading: user === undefined,
    logout,
    clearAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
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
