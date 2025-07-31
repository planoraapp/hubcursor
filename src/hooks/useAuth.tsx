
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

interface HabboAccount {
  id: string;
  habbo_name: string;
  figure_string?: string;
  motto?: string;
  is_admin: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  habboAccount: HabboAccount | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  refreshHabboAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshHabboAccount = async () => {
    if (!user) {
      setHabboAccount(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching Habbo account:', error);
        return;
      }

      if (data) {
        // Check if user should be admin based on habbo_name
        const isAdminUser = ['habbohub', 'Beebop'].includes(data.habbo_name);
        
        if (data.is_admin !== isAdminUser) {
          // Update admin status if it changed
          const { error: updateError } = await supabase
            .from('habbo_accounts')
            .update({ is_admin: isAdminUser })
            .eq('id', data.id);

          if (updateError) {
            console.error('Error updating admin status:', updateError);
          } else {
            data.is_admin = isAdminUser;
          }
        }

        setHabboAccount(data);
      } else {
        setHabboAccount(null);
      }
    } catch (error) {
      console.error('Error refreshing Habbo account:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await refreshHabboAccount();
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setHabboAccount(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = () => {
    return habboAccount?.is_admin || false;
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          await refreshHabboAccount();
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await refreshHabboAccount();
        } else {
          setHabboAccount(null);
        }

        if (event === 'SIGNED_OUT') {
          setHabboAccount(null);
        }

        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Refresh Habbo account when user changes
  useEffect(() => {
    if (user && !isLoading) {
      refreshHabboAccount();
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    habboAccount,
    isLoggedIn: !!user,
    isLoading,
    login,
    logout,
    isAdmin,
    refreshHabboAccount
  };

  return (
    <AuthContext.Provider value={value}>
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
