
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
}

interface UnifiedAuthContextType {
  user: User | null;
  habboAccount: HabboAccount | null;
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
  const [loading, setLoading] = useState(false); // Começar como false
  const { toast } = useToast();

  // Para simplificar, vamos verificar se há usuário no localStorage
  const isLoggedIn = !!habboAccount;
  
  // Debug log
  console.log('🔍 [useUnifiedAuth] Current state:', { habboAccount, isLoggedIn, user });
  
  // Forçar re-render quando localStorage muda
  const [forceUpdate, setForceUpdate] = useState(0);
  
  useEffect(() => {
    const handleStorageChange = () => {
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    console.log('🚀 [useUnifiedAuth] Checking for logged user...');
    
    // Verificar se há usuário logado no localStorage
    const storedUser = localStorage.getItem('habbo_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('✅ [useUnifiedAuth] User found in localStorage:', userData.habbo_username);
        
        // Converter formato hub_users para formato esperado
        const habboAccount = {
          id: userData.id,
          supabase_user_id: userData.id, // Usar o ID do hub_users como supabase_user_id
          habbo_name: userData.habbo_username,
          habbo_id: userData.habbo_id || '',
          hotel: userData.hotel || 'br',
          is_admin: userData.is_admin || false,
          motto: userData.motto || '',
          figure_string: userData.figure_string || '',
          is_online: userData.is_online || false,
          created_at: userData.created_at
        };
        
        setUser({ id: userData.id } as User); // Mock user object
        setHabboAccount(habboAccount);
        console.log('✅ [useUnifiedAuth] State updated:', { habboAccount, isLoggedIn: true });
      } catch (e) {
        console.error('❌ [useUnifiedAuth] Error parsing stored user:', e);
        setUser(null);
        setHabboAccount(null);
      }
    } else {
      console.log('❌ [useUnifiedAuth] No user found in localStorage');
      setUser(null);
      setHabboAccount(null);
    }
  }, [forceUpdate]); // Adicionar forceUpdate como dependência

  const loadHabboAccount = async (userId: string) => {
    try {
      console.log(`🔍 [useUnifiedAuth] Loading Habbo account for user: ${userId}`);
      
      // Para simplificar, vamos usar hub_users diretamente
      // Verificar se há usuário logado no localStorage
      const storedUser = localStorage.getItem('habbo_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('✅ [useUnifiedAuth] User loaded from localStorage:', userData.habbo_username);
          
          // Converter formato hub_users para formato esperado
          const habboAccount = {
            id: userData.id,
            supabase_user_id: userId,
            habbo_name: userData.habbo_username,
            habbo_id: userData.habbo_id || '',
            hotel: userData.hotel || 'br',
            is_admin: userData.is_admin || false,
            motto: userData.motto || '',
            figure_string: userData.figure_string || '',
            is_online: userData.is_online || false,
            created_at: userData.created_at
          };
          
          setHabboAccount(habboAccount);
          return;
        } catch (e) {
          console.error('❌ [useUnifiedAuth] Error parsing stored user:', e);
        }
      }

      // Se não há usuário no localStorage, tentar buscar no Supabase
      const hubUsersResult = await supabase
        .from('hub_users')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (hubUsersResult.data) {
        // Converter formato hub_users para formato esperado
        const data = {
          id: hubUsersResult.data.id,
          supabase_user_id: userId,
          habbo_name: hubUsersResult.data.habbo_username,
          habbo_id: hubUsersResult.data.habbo_id || '',
          hotel: hubUsersResult.data.hotel || 'br',
          is_admin: hubUsersResult.data.is_admin || false,
          motto: hubUsersResult.data.motto || '',
          figure_string: hubUsersResult.data.figure_string || '',
          is_online: hubUsersResult.data.is_online || false,
          created_at: hubUsersResult.data.created_at
        };
        
        console.log('✅ [useUnifiedAuth] Habbo account loaded from Supabase:', data.habbo_name);
        setHabboAccount(data);
      } else {
        console.log('❌ [useUnifiedAuth] No user found');
        setHabboAccount(null);
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
      
      // Primeiro tentar unified_users, depois hub_users
      let userData = null;
      let userError = null;

      // Tentar unified_users primeiro
      const unifiedResult = await supabase
        .from('unified_users')
        .select('email, password_hash')
        .ilike('habbo_name', habboName)
        .eq('hotel', 'br')
        .eq('is_active', true)
        .single();

      if (unifiedResult.data) {
        userData = unifiedResult.data;
      } else {
        // Se não encontrar em unified_users, tentar hub_users
        console.log('🔄 [useUnifiedAuth] Trying hub_users table for login...');
        const hubResult = await supabase
          .from('hub_users')
          .select('email, password_hash')
          .ilike('habbo_username', habboName)
          .eq('hotel', 'br')
          .eq('is_active', true)
          .single();
        
        if (hubResult.data) {
          userData = hubResult.data;
        } else {
          userError = hubResult.error;
        }
      }

      if (userError || !userData) {
        throw new Error('Conta não encontrada. Use a aba "Missão" para se cadastrar.');
      }

      if (!userData.email) {
        throw new Error('Conta não configurada corretamente. Contate o administrador.');
      }

      const authEmail = userData.email;
      console.log('🔐 [useUnifiedAuth] Attempting login with email:', authEmail);

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
        console.log('✅ [useUnifiedAuth] Login successful for:', habboName);
        toast({
          title: "Login realizado",
          description: `Bem-vindo de volta, ${habboName}!`
        });
        return data;
      }

      throw new Error('Erro no login');
    } catch (error: any) {
      console.error('❌ [useUnifiedAuth] Login error:', error);
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
