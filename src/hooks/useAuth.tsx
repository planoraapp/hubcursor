import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { findUserByUsername, verifyCredentials, createUserWithDomain, type LocalUser } from '@/data/localUsers';
import { generateUniqueUsername, extractOriginalUsername } from '@/utils/usernameUtils';

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
            // Verificar credenciais localmente
      const authResult = verifyCredentials(username, password);
      
      if (!authResult.success) {
                toast({
          title: "Erro no login",
          description: authResult.error || 'Erro na verificação',
          variant: "destructive"
        });
        return false;
      }

      const user = authResult.user!;

      // Buscar dados reais do Habbo se for habbohub
      const originalUsername = extractOriginalUsername(user.habbo_username);
      if (originalUsername.toLowerCase() === 'habbohub') {
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
            
            // Atualizar dados do usuário com dados reais
            user.habbo_motto = habboData.motto || user.habbo_motto;
            user.habbo_avatar = habboData.figureString || user.habbo_avatar;
          }
        } catch (error) {
          console.warn('⚠️ [Auth] Erro ao buscar dados reais (não crítico):', error);
        }
      }

      // Criar sessão (usar nome original para exibição)
      const session: HabboAccount = {
        id: user.id,
        habbo_username: originalUsername, // Usar nome original para exibição
        habbo_motto: user.habbo_motto,
        habbo_avatar: user.habbo_avatar,
        is_admin: user.is_admin,
        hotel: user.hotel,
        created_at: user.created_at
      };

      // Salvar na sessão local
      localStorage.setItem('habbohub_session', JSON.stringify(session));
      setHabboAccount(session);

            toast({
        title: "Login realizado",
        description: `Bem-vindo, ${username}!`
      });

      return true;

    } catch (error: any) {
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
      
            toast({
        title: "Logout realizado",
        description: "Até logo!"
      });

    } catch (error) {
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