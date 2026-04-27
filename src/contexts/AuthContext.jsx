import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { adminApi } from '../services/adminApi';

const AuthContext = createContext(null);
const ADMIN_EMAIL = 'admin@evoa.co.in';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(undefined);

  function clearAuthState() {
    localStorage.removeItem('authToken');
    setUser(null);
    setProfile(null);
  }

  async function recoverSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data?.session) return data.session;
    } catch (_) { /* no-op */ }

    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data?.session ?? null;
    } catch (_) {
      return null;
    }
  }

  async function hydrateAdminProfile(sessionUser) {
    if (!sessionUser) {
      setProfile(null);
      return;
    }

    if (sessionUser.email === ADMIN_EMAIL) {
      setProfile({
        id: sessionUser.id,
        email: sessionUser.email,
        fullName: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || 'Admin',
        role: 'admin',
      });

      adminApi.getSession()
        .then((adminProfile) => setProfile(adminProfile))
        .catch(() => { /* keep fallback admin profile */ });
      return;
    }

    try {
      const adminProfile = await adminApi.getSession();
      setProfile(adminProfile);
    } catch {
      setProfile(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    const handleSession = async (event, session) => {
      if (!session?.user) {
        if (event === 'SIGNED_OUT') {
          clearAuthState();
          return;
        }

        const recoveredSession = await recoverSession();
        if (!isMounted) return;

        if (!recoveredSession?.user) {
          clearAuthState();
          return;
        }

        session = recoveredSession;
      }

      if (session?.access_token) {
        localStorage.setItem('authToken', session.access_token);
      } else {
        localStorage.removeItem('authToken');
      }

      setUser(session.user);
      await hydrateAdminProfile(session.user);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      handleSession('INITIAL_SESSION', session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      handleSession(event, session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading: user === undefined || profile === undefined }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
