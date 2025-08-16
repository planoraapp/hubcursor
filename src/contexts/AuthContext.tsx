
import React, { createContext, useContext } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface AuthContextType {
  user: any;
  loading: boolean;
  habboAccount: any;
  isLoggedIn: boolean;
  isAdmin: () => boolean;
  logout: () => Promise<void>;
  loginWithPassword: (habboName: string, password: string) => Promise<any>;
  loadHabboAccount: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useUnifiedAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
