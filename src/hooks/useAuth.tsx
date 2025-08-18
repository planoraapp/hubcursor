
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from './use-toast';

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
  loading: boolean;
  login: (habboName: string, hotel?: string) => Promise<boolean>;
  loginWithPassword: (habboName: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshHabboAccount: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isLoggedIn = !!user && !!habboAccount;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadHabboAccount(session.user.id);
      } else {
        setLoading(false);
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
          setLoading(false);
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
      setLoading(false);
    }
  };

  const login = async (habboName: string, hotel: string = 'br'): Promise<boolean> => {
    try {
      setLoading(true);

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
      setLoading(false);
    }
  };

  const loginWithPassword = async (habboName: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔐 [useAuth] Attempting login for:', habboName);
      
      // Get auth email for this Habbo account
      const { data: emailResult, error: emailError } = await supabase.rpc(
        'get_auth_email_for_habbo_with_hotel', 
        { 
          habbo_name_param: habboName,
          hotel_param: 'br'
        }
      );

      if (emailError || !emailResult) {
        throw new Error('Conta não encontrada. Use a aba "Missão" para se cadastrar.');
      }

      const authEmail = emailResult;
      console.log('🔐 [useAuth] Attempting login with email:', authEmail);

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Senha incorreta. Use a aba "Missão" para redefinir.');
        }
        throw error;
      }

      if (data.user) {
        console.log('✅ [useAuth] Login successful for:', habboName);
        toast({
          title: "Login realizado",
          description: `Bem-vindo de volta, ${habboName}!`
        });
        return data;
      }

      throw new Error('Erro no login');
    } catch (error: any) {
      console.error('❌ [useAuth] Login error:', error);
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        setUser(null);
        setHabboAccount(null);
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso."
        });
      }
    } catch (error: any) {
      console.error('❌ [useAuth] Logout error:', error);
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshHabboAccount = async () => {
    if (user) {
      await loadHabboAccount(user.id);
    }
  };

  const isAdmin = () => {
    return habboAccount?.is_admin === true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        habboAccount,
        isLoggedIn,
        loading,
        login,
        loginWithPassword,
        logout,
        refreshHabboAccount,
        isAdmin
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
