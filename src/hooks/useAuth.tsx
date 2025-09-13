import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HabboAccount {
  id: string;
  habbo_username: string;
  habbo_motto: string;
  habbo_avatar?: string;
  is_admin: boolean;
  hotel: string;
  created_at: string;
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

  // Função para inicializar conta habbohub se não existir
  const initializeHabboHubAccount = async () => {
    try {
      console.log('🔧 [Auth] Verificando se conta habbohub existe...');
      
      // Obter país selecionado do localStorage ou usar 'br' como padrão
      const selectedHotel = localStorage.getItem('selected_habbo_hotel') || 'br';
      
      // Verificar se já existe usando SQL direto
      const { data: existingAccount, error } = await (supabase as any)
        .rpc('check_habbo_auth_exists', { username: 'habbohub' });

      if (!error && existingAccount) {
        console.log('✅ [Auth] Conta habbohub já existe');
        return;
      }

      console.log('🔧 [Auth] Criando conta habbohub...');
      
      // Criar conta habbohub usando SQL direto
      const { data: newAccount, error: insertError } = await (supabase as any)
        .rpc('create_habbo_auth_account', {
          username: 'habbohub',
          motto: 'HUB-ADMIN',
          avatar: 'https://www.habbo.com/habbo-imaging/avatarimage?size=l&figure=hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61&direction=2&head_direction=2&img_format=png',
          password: '151092',
          is_admin: true,
          hotel: selectedHotel
        });

      if (insertError) {
        console.error('❌ [Auth] Erro ao criar conta habbohub:', insertError);
      } else {
        console.log('✅ [Auth] Conta habbohub criada com sucesso:', newAccount);
      }
    } catch (error) {
      console.error('❌ [Auth] Erro ao inicializar conta habbohub:', error);
    }
  };

  // Verificar sessão existente
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Primeiro, inicializar conta habbohub se necessário
        await initializeHabboHubAccount();
        
        // Depois verificar sessão existente
        const sessionData = localStorage.getItem('habbohub_session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          setHabboAccount(session);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
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
      console.log('🔐 [Auth] Tentando login para:', username);

      // Verificar credenciais usando função SQL
      console.log('🔍 [Auth] Verificando credenciais para:', username.toLowerCase());
      const { data: authResult, error } = await (supabase as any)
        .rpc('verify_habbo_auth_password', { 
          username: username.toLowerCase(), 
          password: password 
        });

      console.log('🔍 [Auth] Resultado da verificação:', { authResult, error });

      if (error || !authResult || !(authResult as any).success) {
        const errorMsg = (authResult as any)?.error || 'Erro na verificação';
        console.log('❌ [Auth] Erro na verificação:', errorMsg);
        toast({
          title: "Erro no login",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }

      const accountData = (authResult as any).user;

      // Buscar dados reais do Habbo se for habbohub
      if (username.toLowerCase() === 'habbohub') {
        try {
          // Obter país selecionado do localStorage
          const selectedHotel = localStorage.getItem('selected_habbo_hotel') || 'br';
          
          // Mapear código do país para URL da API
          const hotelApiUrls = {
            'br': 'https://www.habbo.com.br/api/public',
            'com': 'https://www.habbo.com/api/public',
            'de': 'https://www.habbo.de/api/public',
            'es': 'https://www.habbo.es/api/public',
            'fi': 'https://www.habbo.fi/api/public',
            'fr': 'https://www.habbo.fr/api/public',
            'it': 'https://www.habbo.it/api/public',
            'nl': 'https://www.habbo.nl/api/public',
            'tr': 'https://www.habbo.com.tr/api/public'
          };
          
          const apiUrl = hotelApiUrls[selectedHotel as keyof typeof hotelApiUrls] || hotelApiUrls.br;
          const response = await fetch(`${apiUrl}/users?name=habbohub`);
          if (response.ok) {
            const habboData = await response.json();
            
            // Atualizar dados na tabela usando SQL direto
            const { data: updatedUser } = await (supabase as any)
              .rpc('update_habbo_auth_user', {
                user_id: accountData.id,
                motto: habboData.motto || accountData.habbo_motto,
                avatar: habboData.figureString || accountData.habbo_avatar,
                last_login: new Date().toISOString()
              });
            
            // Atualizar accountData com dados reais
            if (updatedUser) {
              accountData.habbo_motto = (updatedUser as any).habbo_motto;
              accountData.habbo_avatar = (updatedUser as any).habbo_avatar;
            }
          }
        } catch (error) {
          console.warn('⚠️ [Auth] Erro ao buscar dados reais (não crítico):', error);
        }
      }

      // Criar sessão
      const session = {
        id: accountData.id,
        habbo_username: accountData.habbo_username,
        habbo_motto: accountData.habbo_motto,
        habbo_avatar: accountData.habbo_avatar,
        is_admin: accountData.is_admin,
        hotel: 'br',
        created_at: accountData.created_at
      };

      // Salvar na sessão local
      localStorage.setItem('habbohub_session', JSON.stringify(session));
      setHabboAccount(session);

      console.log('✅ [Auth] Login realizado com sucesso:', username);
      toast({
        title: "Login realizado",
        description: `Bem-vindo, ${username}!`
      });

      return true;

    } catch (error: any) {
      console.error('❌ [Auth] Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Erro interno",
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
      
      console.log('✅ [Auth] Logout realizado');
      toast({
        title: "Logout realizado",
        description: "Até logo!"
      });

    } catch (error) {
      console.error('❌ [Auth] Erro no logout:', error);
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
