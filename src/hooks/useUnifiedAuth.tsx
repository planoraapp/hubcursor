
import React, { createContext, useContext, useState, useEffect } from 'react';

interface HabboAccount {
  habbo_name: string;
  id: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  habboAccount: HabboAccount | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);

  const login = async (username: string, password: string) => {
    // TODO: Implement actual login logic
    console.log('Login attempt:', { username, password });
    
    // Mock login for now
    setIsLoggedIn(true);
    setHabboAccount({
      habbo_name: username,
      id: 'mock-id'
    });
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setHabboAccount(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, habboAccount, login, logout }}>
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
