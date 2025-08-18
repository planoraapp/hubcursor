
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface HabboAccount {
  id: string;
  supabase_user_id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  is_admin: boolean;
  motto?: string;
  figure_string?: string;
  is_online?: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  habboAccount: HabboAccount | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (habboName: string, hotel?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshHabboAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = !!user && !!habboAccount;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadHabboAccount(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadHabboAccount(session.user.id);
        } else {
          setHabboAccount(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadHabboAccount = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('*')
        .eq('supabase_user_id', userId)
        .single();

      if (error) {
        console.error('Error loading Habbo account:', error);
        setHabboAccount(null);
      } else {
        setHabboAccount(data);
      }
    } catch (error) {
      console.error('Error loading Habbo account:', error);
      setHabboAccount(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (habboName: string, hotel: string = 'br'): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Generate a fake email for this Habbo account
      const email = `${habboName.toLowerCase()}.${hotel}@habbohub.com`;
      const password = 'habbo123'; // Simple password for all accounts

      // Try to sign in first
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // If sign in failed, try to sign up
      if (signInError) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              habbo_name: habboName,
              hotel: hotel
            }
          }
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          return false;
        }

        signInData = signUpData;
      }

      if (signInData.user) {
        // Create or update Habbo account record
        const { error: upsertError } = await supabase
          .from('habbo_accounts')
          .upsert({
            supabase_user_id: signInData.user.id,
            habbo_name: habboName,
            habbo_id: `hh${hotel}-${Math.random().toString(36).substr(2, 9)}`,
            hotel: hotel,
            is_admin: habboName.toLowerCase() === 'beebop'
          }, {
            onConflict: 'supabase_user_id'
          });

        if (upsertError) {
          console.error('Error creating Habbo account:', upsertError);
          return false;
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshHabboAccount = async () => {
    if (user) {
      await loadHabboAccount(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        habboAccount,
        isLoggedIn,
        isLoading,
        login,
        logout,
        refreshHabboAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
