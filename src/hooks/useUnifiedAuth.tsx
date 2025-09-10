import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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
  password?: string;
  auth_email?: string;
}

interface CurrentUser {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  is_admin: boolean;
  motto?: string;
  figure_string?: string;
  is_online?: boolean;
}

interface UnifiedAuthContextType {
  user: User | null;
  habboAccount: HabboAccount | null;
  currentUser: CurrentUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  loginWithPassword: (habboName: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshHabboAccount: () => Promise<void>;
  isAdmin: () => boolean;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isLoggedIn = !!user && !!habboAccount;
  
  // Criar currentUser padronizado
  const currentUser: CurrentUser | null = habboAccount ? {
    id: habboAccount.id,
    habbo_name: habboAccount.habbo_name,
    habbo_id: habboAccount.habbo_id,
    hotel: habboAccount.hotel,
    is_admin: habboAccount.is_admin,
    motto: habboAccount.motto,
    figure_string: habboAccount.figure_string,
    is_online: habboAccount.is_online
  } : null;

  useEffect(() => {
    console.log('🚀 [useUnifiedAuth] Getting initial session...');
    
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
      (event, session) => {
        console.log(`🔄 [useUnifiedAuth] Auth state changed: ${event}`, session?.user?.id);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Usar setTimeout para evitar conflitos
          setTimeout(() => {
            loadHabboAccount(session.user.id);
          }, 0);
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
      console.log(`🔍 [useUnifiedAuth] Loading Habbo account for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('*')
        .eq('supabase_user_id', userId)
        .single();

      if (error) {
        console.error('❌ [useUnifiedAuth] Error loading Habbo account:', error);
        setHabboAccount(null);
      } else {
        console.log('✅ [useUnifiedAuth] Habbo account loaded:', data.habbo_name);
        setHabboAccount(data);
      }
    } catch (error) {
      console.error('❌ [useUnifiedAuth] Error loading Habbo account:', error);
      setHabboAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async (habboName: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔐 [useUnifiedAuth] Attempting login for:', habboName);
      
      // Verify user exists and get account data
      const { data: accountData, error: accountError } = await supabase
        .from('habbo_accounts')
        .select('*')
        .eq('habbo_name', habboName)
        .eq('hotel', 'br')
        .single();

      if (accountError || !accountData) {
        console.error('❌ [useUnifiedAuth] Account lookup failed:', accountError);
        throw new Error('Conta não encontrada. Use a aba "Missão" para se cadastrar.');
      }

      // For habbohub and beebop, use predefined passwords
      let expectedPassword = '';
      if (habboName.toLowerCase() === 'habbohub') {
        expectedPassword = '151092';
      } else if (habboName.toLowerCase() === 'beebop') {
        expectedPassword = '290684';
      } else {
        // For other users, get password from database
        expectedPassword = accountData.password || '';
      }

      if (password !== expectedPassword) {
        throw new Error('Senha incorreta. Verifique e tente novamente.');
      }

      // Create a simple session for the user
      const userSession = {
        user: {
          id: accountData.supabase_user_id,
          email: accountData.auth_email || `${habboName}@habbohub.com`,
          user_metadata: {
            habbo_name: habboName,
            hotel: 'br',
            habbo_id: accountData.habbo_id
          }
        },
        session: {
          access_token: `habbohub_${habboName}_${Date.now()}`,
          refresh_token: `refresh_${habboName}_${Date.now()}`,
          expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }
      };

      console.log('✅ [useUnifiedAuth] Login successful for:', habboName);
      toast({
        title: "Login realizado",
        description: `Bem-vindo de volta, ${habboName}!`
      });

      // Set the user in the auth state
      setUser(userSession.user);
      setHabboAccount(accountData);

      return userSession;
    } catch (error: any) {
      console.error('❌ [useUnifiedAuth] Login error:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Tente novamente"
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
        console.error('❌ [useUnifiedAuth] Logout error:', error);
        // Mas ainda mostramos sucesso porque o estado local foi limpo
      }
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      
    } catch (error: any) {
      console.error('❌ [useUnifiedAuth] Logout error:', error);
      
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
    <UnifiedAuthContext.Provider
      value={{
        user,
        habboAccount,
        currentUser,
        isLoggedIn,
        loading,
        loginWithPassword,
        logout,
        refreshHabboAccount,
        isAdmin
      }}
    >
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = (): UnifiedAuthContextType => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within an UnifiedAuthProvider');
  }
  return context;
};