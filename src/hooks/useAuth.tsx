
import { createContext, useContext, ReactNode } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  habboAccount: any;
  isAdmin: () => boolean;
  logout: () => Promise<void>;
  loginWithPassword: (habboName: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const authData = useUnifiedAuth();
  
  return {
    user: authData.user,
    loading: authData.loading,
    isAuthenticated: !!authData.user,
    isLoggedIn: authData.isLoggedIn,
    habboAccount: authData.habboAccount,
    isAdmin: authData.isAdmin,
    logout: authData.logout,
    loginWithPassword: authData.loginWithPassword
  };
};
