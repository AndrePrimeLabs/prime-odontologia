import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiHttpClient } from '@/api/primeosclient'; // Point to your refactored Axios instance

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: string | null;
  appPublicSettings: any;
  logout: (shouldRedirect?: boolean) => Promise<void>;
  navigateToLogin: () => void;
  checkAppState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isLoadingPublicSettings] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [appPublicSettings] = useState({
    id: 'primeos.primeodontologia.com.br',
    public_settings: {}
  });

  useEffect(() => {
    // Standard initialization: verify local token state on launch
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const storedUser = localStorage.getItem('primeos_user');
      const storedToken = localStorage.getItem('primeos_token');

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Ensure Axios interceptors always have the token attached for your API routes
        apiHttpClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error: any) {
      console.error('Session restoration failed:', error);
      setAuthError(error.message || 'Failed to authenticate');
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      // Clear all state tokens from localStorage
      localStorage.removeItem('primeos_user');
      localStorage.removeItem('primeos_token');
      localStorage.removeItem('primeos_auth');
      
      // Clear auth headers from your API client instance
      delete apiHttpClient.defaults.headers.common['Authorization'];

      setUser(null);
      setIsAuthenticated(false);
      console.log('📤 User logged out cleanly from PrimeOS');
      
      if (shouldRedirect) {
        window.location.href = '/login';
      }
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
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
