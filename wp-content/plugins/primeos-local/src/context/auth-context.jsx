import React, { createContext, useState, useContext, useEffect } from 'react';

// @ts-nocheck
const AuthContext = createContext(null);

// Lazy load Supabase to avoid import resolution issues in build
let supabaseInstance = null;

const loadSupabase = async () => {
  if (!supabaseInstance) {
    try {
      const { supabase: sb } = await import('../../../../../../../supabase/supabaseClient.js');
      supabaseInstance = sb;
    } catch (e) {
      console.warn('⚠️ Failed to load Supabase in AuthContext:', e.message);
      supabaseInstance = null;
    }
  }
  return supabaseInstance;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: 'primeos.primeodontologia.com.br',
    public_settings: {}
  });

  // ============================================================================
  // LOCAL MODE: Detect if running in local-only development
  // ============================================================================
  const isLocalMode = import.meta.env.VITE_LOCAL_MODE === 'true';

  useEffect(() => {
    // Check localStorage as fallback
    const localAuth = localStorage.getItem("primeos_auth");
    if (localAuth === "1") {
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    }

    checkUserAuth();

    // Only setup auth listener in production mode
    if (!isLocalMode) {
      setupAuthListener();
    } else {
      console.log('✅ Local mode: Using mock authentication');
      setIsLoadingAuth(false);
    }
  }, []);

  const setupAuthListener = async () => {
    const sb = await loadSupabase();
    if (!sb?.auth) return;

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      console.log('[Auth] State changed:', _event, !!session);
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        localStorage.setItem('primeos_auth', '1');
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    });

    return () => subscription?.unsubscribe();
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);

      // ============================================================================
      // LOCAL MODE: Use mock user instead of Supabase
      // ============================================================================
      if (isLocalMode) {
        console.log('🔐 Local mode: Checking auth...');
        const cachedUser = localStorage.getItem('primeos_local_user');
        if (cachedUser) {
          const user = JSON.parse(cachedUser);
          setUser(user);
          setIsAuthenticated(true);
        } else {
          const mockUser = {
            id: 'local-dev-' + Date.now(),
            email: 'dev@primeos.local',
            user_metadata: { 
              full_name: 'Developer (Local Mode)',
              role: 'admin'
            }
          };
          localStorage.setItem('primeos_local_user', JSON.stringify(mockUser));
          setUser(mockUser);
          setIsAuthenticated(true);
        }
        return;
      }

      // PRODUCTION MODE: Use Supabase
      const sb = await loadSupabase();
      if (sb?.auth) {
        const { data: { session }, error } = await sb.auth.getSession();
        console.log('[Auth] Session check:', !!session, error);
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          localStorage.setItem('primeos_auth', '1');
        } else {
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    if (isLocalMode) {
      localStorage.removeItem('primeos_local_user');
      localStorage.removeItem('primeos_auth');
      setUser(null);
      setIsAuthenticated(false);
      console.log('📤 Local mode: Logged out');
      return;
    }

    const sb = await loadSupabase();
    if (sb?.auth) {
      await sb.auth.signOut();
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('primeos_auth');
    
    if (shouldRedirect) {
      window.location.href = '/login.html';
    }
  };

  const navigateToLogin = () => {
    if (isLocalMode) {
      console.log('🔐 Local mode: Skipping login (using mock auth)');
      setIsAuthenticated(true);
      const mockUser = {
        id: 'local-dev-' + Date.now(),
        email: 'dev@primeos.local',
        user_metadata: { full_name: 'Developer (Local Mode)' }
      };
      setUser(mockUser);
      localStorage.setItem('primeos_local_user', JSON.stringify(mockUser));
      return;
    }
    window.location.href = '/login.html';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState: checkUserAuth,
      isLocalMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
