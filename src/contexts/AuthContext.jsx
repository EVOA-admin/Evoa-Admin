import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { adminApi } from '../services/adminApi';

const AuthContext = createContext(null);
const ADMIN_EMAIL = 'admin@evoa.co.in';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(undefined);

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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      await hydrateAdminProfile(sessionUser);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      await hydrateAdminProfile(sessionUser);
    });

    return () => subscription.unsubscribe();
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
