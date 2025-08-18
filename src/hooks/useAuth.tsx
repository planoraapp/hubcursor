
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
    console.log('🚀 [useAuth] Initializing auth...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 [useAuth] Auth state changed: ${event}`, session?.user?.id);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadHabboAccount(session.user.id);
        } else {
          setHabboAccount(null);
          setLoading(false);
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 [useAuth] Initial session check:', session?.user?.id);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadHabboAccount(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 [useAuth] Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const loadHabboAccount = async (userId: string) => {
    try {
      console.log(`🔍 [useAuth] Loading Habbo account for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('*')
        .eq('supabase_user_id', userId)
        .single();

      if (error) {
        console.error('❌ [useAuth] Error loading Habbo account:', error);
        setHabboAccount(null);
      } else {
        console.log('✅ [useAuth] Habbo account loaded:', data.habbo_name);
        setHabboAccount(data);
      }
    } catch (error) {
      console.error('❌ [useAuth] Error loading Habbo account:', error);
      setHabboAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (habboName: string, hotel: string = 'br'): Promise<boolean> => {
    try {
      setLoading(true);
      console.log(`🔐 [useAuth] Attempting legacy login for: ${habboName}`);

      // Generate a fake email for this Habbo account
      const email = `${habboName.toLowerCase()}.${hotel}@habbohub.com`;
      const password = 'habbo123'; // Simple password for all accounts

      // Try to sign in first
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.log('🔄 [useAuth] Sign in failed, trying sign up');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              habbo_name: habboName,
              hotel: hotel
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (signUpError) {
          console.error('❌ [useAuth] Sign up error:', signUpError);
          toast({
            title: "Erro no cadastro",
            description: signUpError.message,
            variant: "destructive"
          });
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
          console.error('❌ [useAuth] Error creating Habbo account:', upsertError);
          toast({
            title: "Erro",
            description: "Erro ao vincular conta Habbo",
            variant: "destructive"
          });
          return false;
        }

        console.log('✅ [useAuth] Legacy login successful');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('❌ [useAuth] Login error:', error);
      toast({
        title: "Erro no login",
        description: error.message || 'Erro interno',
        variant: "destructive"
      });
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
        console.error('❌ [useAuth] Email lookup error:', emailError);
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
        console.error('❌ [useAuth] Login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Senha incorreta. Use a aba "Missão" para redefinir.');
        }
        throw error;
      }

      if (data.user) {
        console.log('✅ [useAuth] Login successful for:', habboName);
        return data;
      }

      throw new Error('Erro no login');
    } catch (error: any) {
      console.error('❌ [useAuth] Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('🚪 [useAuth] Logging out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ [useAuth] Logout error:', error);
        toast({
          title: "Erro no logout",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setUser(null);
        setHabboAccount(null);
        console.log('✅ [useAuth] Logout successful');
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
