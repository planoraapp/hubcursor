
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
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 [useAuth] Initial session:', session?.user?.id);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadHabboAccount(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`🔄 [useAuth] Auth state changed: ${event}`, session?.user?.id);
        setUser(session?.user ?? null);
        if (session?.user) {
          loadHabboAccount(session.user.id);
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
      console.log(`🔍 [useAuth] Loading Habbo account for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('*')
        .eq('supabase_user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ [useAuth] No Habbo account found for user');
        } else {
          console.error('❌ [useAuth] Error loading Habbo account:', error);
        }
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
      
      // Limpar estado local primeiro
      setUser(null);
      setHabboAccount(null);
      
      // Tentar fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      // Se houver erro de sessão ausente, não é um problema crítico
      if (error && error.message !== 'Auth session missing!') {
        console.error('❌ [useAuth] Logout error:', error);
        // Mas ainda mostramos sucesso porque o estado local foi limpo
      }
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      
    } catch (error: any) {
      console.error('❌ [useAuth] Logout error:', error);
      
      // Mesmo com erro, limpar estado local e mostrar sucesso
      setUser(null);
      setHabboAccount(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
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
