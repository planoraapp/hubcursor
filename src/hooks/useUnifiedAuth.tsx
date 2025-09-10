import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from './use-toast';

interface HabboAccount {
  id: string;
  habbo_username: string;
  habbo_motto?: string;
  habbo_avatar?: string;
  password_hash: string;
  is_admin: boolean;
  is_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
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
    habbo_name: habboAccount.habbo_username,
    habbo_id: habboAccount.id,
    hotel: 'br',
    is_admin: habboAccount.is_admin,
    motto: habboAccount.habbo_motto,
    figure_string: habboAccount.habbo_avatar,
    is_online: false
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
        .from('habbo_auth')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ [useUnifiedAuth] Error loading Habbo account:', error);
        setHabboAccount(null);
      } else {
        console.log('✅ [useUnifiedAuth] Habbo account loaded:', data.habbo_username);
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
        .from('habbo_auth')
        .select('*')
        .eq('habbo_username', habboName)
        .single();

      if (accountError || !accountData) {
        console.error('❌ [useUnifiedAuth] Account lookup failed:', accountError);
        throw new Error('Conta não encontrada. Use a aba "Missão" para se cadastrar.');
      }

      // Check password from database
      if (password !== accountData.password_hash) {
        throw new Error('Senha incorreta. Verifique e tente novamente.');
      }

      // Atualizar dados reais do Habbo se for habbohub
      if (habboName.toLowerCase() === 'habbohub') {
        try {
          console.log('🔄 [useUnifiedAuth] Buscando dados reais do habbohub...');
          
          // Buscar dados reais do habbo.com.br
          const response = await fetch(`https://www.habbo.com.br/api/public/users?name=habbohub`);
          if (response.ok) {
            const habboData = await response.json();
            if (habboData && habboData.name && habboData.uniqueId) {
              console.log('✅ [useUnifiedAuth] Dados reais encontrados:', habboData);
              
              // Atualizar dados na tabela
              await supabase
                .from('habbo_auth')
                .update({
                  habbo_motto: habboData.motto || accountData.habbo_motto,
                  habbo_avatar: habboData.figureString || accountData.habbo_avatar,
                  last_login: new Date().toISOString()
                })
                .eq('id', accountData.id);
              
              // Atualizar accountData com dados reais
              accountData.habbo_motto = habboData.motto || accountData.habbo_motto;
              accountData.habbo_avatar = habboData.figureString || accountData.habbo_avatar;
            }
          }
        } catch (error) {
          console.warn('⚠️ [useUnifiedAuth] Erro ao buscar dados reais (não crítico):', error);
        }
      }

      // Create a simple session for the user
      const userSession = {
        user: {
          id: accountData.id,
          email: `${habboName}@habbohub.com`,
          user_metadata: {
            habbo_name: habboName,
            hotel: 'br',
            habbo_id: accountData.id
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