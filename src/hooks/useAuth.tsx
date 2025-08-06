
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading, habboAccount, isLoggedIn, isAdmin, logout } = useUnifiedAuth();
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isLoggedIn,
      habboAccount,
      isAdmin,
      logout
    }}>
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
