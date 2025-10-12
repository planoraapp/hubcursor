import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface HabboAccount {
  id: string;
  supabase_user_id: string;
  habbo_name: string;
  habbo_id: string;
  figure_string: string;
  motto: string;
  hotel: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  habboAccount: HabboAccount | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isLoggedIn = !!habboAccount;

  // Verificar sessão existente
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar sessão existente no localStorage
        const sessionData = localStorage.getItem('habbohub_session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          setHabboAccount(session);
        }
      } catch (error) {
        localStorage.removeItem('habbohub_session');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Login via Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('habbo-complete-auth', {
        body: {
          action: 'login',
          habbo_name: username.trim(),
          password: password
        }
      });

      if (functionError || !data?.success) {
        toast({
          title: "Erro no login",
          description: data?.error || "Usuário não encontrado ou senha incorreta",
          variant: "destructive"
        });
        return false;
      }

      const habboAccount = data.account;

      // Salvar sessão no localStorage
      const sessionData = {
        id: habboAccount.id,
        supabase_user_id: habboAccount.supabase_user_id,
        habbo_name: habboAccount.habbo_name,
        habbo_id: habboAccount.habbo_id,
        figure_string: habboAccount.figure_string,
        motto: habboAccount.motto,
        hotel: habboAccount.hotel,
        is_admin: habboAccount.is_admin,
        created_at: habboAccount.created_at,
        updated_at: habboAccount.updated_at
      };
      
      localStorage.setItem('habbohub_session', JSON.stringify(sessionData));
      setHabboAccount(sessionData);

      toast({
        title: "Login realizado!",
        description: `Bem-vindo, ${habboAccount.habbo_name}!`,
      });

      return true;
    } catch (error) {
      logger.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Erro inesperado ao fazer login",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Limpar sessão local
      localStorage.removeItem('habbohub_session');
      setHabboAccount(null);
      
      toast({
        title: "Logout realizado",
        description: "Até logo!"
      });

    } catch (error) {
      logger.error('Erro no logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      habboAccount,
      isLoggedIn,
      loading,
      login,
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