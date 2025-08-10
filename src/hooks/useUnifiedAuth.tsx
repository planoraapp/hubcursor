
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HabboAccount {
  habbo_name: string;
  id: string;
  habbo_id?: string;
  is_admin?: boolean;
  hotel?: string;
  supabase_user_id?: string;
}

interface AuthContextType {
  user: any;
  loading: boolean;
  isLoggedIn: boolean;
  habboAccount: HabboAccount | null;
  isAdmin: () => boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      console.log('Login attempt:', { username, password });
      
      // Mock login for now
      setIsLoggedIn(true);
      const mockAccount: HabboAccount = {
        habbo_name: username,
        id: 'mock-id',
        habbo_id: 'mock-habbo-id',
        is_admin: false,
        hotel: 'br',
        supabase_user_id: 'mock-supabase-id'
      };
      setHabboAccount(mockAccount);
      setUser(mockAccount);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async (username: string, password: string) => {
    return login(username, password);
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setHabboAccount(null);
    setUser(null);
  };

  const isAdmin = () => {
    return habboAccount?.is_admin || false;
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      loading,
      isLoggedIn, 
      habboAccount, 
      isAdmin,
      login, 
      loginWithPassword,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUnifiedAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within an AuthProvider');
  }
  return context;
};
