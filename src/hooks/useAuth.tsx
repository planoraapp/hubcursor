
import { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';

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
  const { user, loading, habboAccount, signOut } = useSupabaseAuth();
  
  const isLoggedIn = !!user && !!habboAccount;
  const isAdmin = () => habboAccount?.is_admin || false;
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isLoggedIn,
      habboAccount,
      isAdmin,
      logout: signOut
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
