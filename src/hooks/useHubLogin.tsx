import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { getHotelConfig } from '@/config/hotels';

interface HabboUser {
  id: string;
  habbo_username: string;
  habbo_avatar?: string;
  hotel: string;
  member_since?: string;
  created_at: string;
}

interface LoginResponse {
  success: boolean;
  user?: HabboUser;
  hasAccount?: boolean;
  message?: string;
  code?: string;
  sessionToken?: string;
  error?: string;
}

export const useHubLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<HabboUser | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar status de autenticação ao carregar o hook
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Gerar código de verificação
  const generateCode = async (username: string, hotel: string): Promise<string | null> => {
    if (!username.trim()) {
      toast({
        title: "Nome de usuário obrigatório",
        description: "Por favor, digite seu nome de usuário",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_code',
          username: username,
          hotel: hotel
        })
      });
      
      const data: LoginResponse = await response.json();
      
      if (data.success && data.code) {
        toast({
          title: "Código gerado!",
          description: "Coloque o código em sua motto no Habbo e clique em verificar.",
        });
        return data.code;
      } else {
        toast({
          title: "Erro ao gerar código",
          description: data.error || "Erro desconhecido",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      toast({
        title: "Erro ao gerar código",
        description: "Erro de conexão",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar usuário com código
  const verifyUserWithCode = async (
    username: string,
    verificationCode: string,
    hotelId: string
  ): Promise<HabboUser | null> => {
    if (!username || !verificationCode || !hotelId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_code',
          username: username,
          hotel: hotelId,
          verificationCode: verificationCode
        })
      });
      
      const data: LoginResponse = await response.json();
      
      if (data.success && data.user) {
        const user: HabboUser = {
          id: data.user.habbo_username + '_' + hotelId,
          habbo_username: data.user.habbo_username,
          habbo_avatar: data.user.habbo_avatar,
          hotel: data.user.hotel,
          member_since: data.user.member_since,
          created_at: new Date().toISOString()
        };

        setCurrentUser(user);
        toast({
          title: "Usuário verificado!",
          description: data.message || "Agora defina uma senha para sua conta",
        });
        return user;
      } else {
        toast({
          title: "Erro na verificação",
          description: data.error || "Código inválido ou expirado",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro na verificação",
        description: "Erro de conexão",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Registrar usuário no sistema
  const registerUser = async (
    user: HabboUser,
    password: string
  ): Promise<boolean> => {
    if (!user || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          username: user.habbo_username,
          hotel: user.hotel,
          password: password
        })
      });
      
      const data: LoginResponse = await response.json();
      
      if (data.success && data.user) {
        const newUser: HabboUser = {
          id: data.user.id,
          habbo_username: data.user.habbo_username,
          habbo_avatar: data.user.habbo_avatar,
          hotel: data.user.hotel,
          member_since: user.member_since,
          created_at: data.user.created_at
        };
        
        // Salvar no localStorage
        localStorage.setItem('hubUser', JSON.stringify(newUser));
        setCurrentUser(newUser);
        
        toast({
          title: "Conta criada com sucesso!",
          description: "Agora você pode fazer login com sua senha",
        });
        
        return true;
      } else {
        toast({
          title: "Erro no cadastro",
          description: data.error || "Erro ao criar conta",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Erro de conexão",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login com senha
  const loginWithPassword = async (
    username: string,
    password: string,
    hotelId: string
  ): Promise<boolean> => {
    if (!username || !password || !hotelId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          username: username,
          hotel: hotelId,
          password: password
        })
      });
      
      const data: LoginResponse = await response.json();
      
      if (data.success && data.user) {
        const user: HabboUser = {
          id: data.user.id,
          habbo_username: data.user.habbo_username,
          habbo_avatar: data.user.habbo_avatar,
          hotel: data.user.hotel,
          member_since: data.user.member_since,
          created_at: data.user.created_at
        };
        
        // Salvar no localStorage
        localStorage.setItem('hubUser', JSON.stringify(user));
        if (data.sessionToken) {
          localStorage.setItem('hubSessionToken', data.sessionToken);
        }
        setCurrentUser(user);
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${user.habbo_username}!`,
        });
        
        return true;
      } else {
        toast({
          title: "Erro no login",
          description: data.error || "Usuário ou senha incorretos",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Erro de conexão",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se usuário já tem conta
  const checkExistingUser = async (
    username: string,
    hotelId: string
  ): Promise<{ exists: boolean; needsPassword: boolean }> => {
    try {
      // Esta verificação será feita no backend durante a verificação do código
      return { exists: false, needsPassword: false };
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      return { exists: false, needsPassword: false };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('hubUser');
    localStorage.removeItem('hubSessionToken');
    setCurrentUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
  };

  // Verificar status de autenticação
  const checkAuthStatus = () => {
    const savedUser = localStorage.getItem('hubUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        return user;
      } catch (error) {
        localStorage.removeItem('hubUser');
        localStorage.removeItem('hubSessionToken');
        return null;
      }
    }
    return null;
  };

  // Criar conta de teste para Beebop
  const createTestAccount = async () => {
    const testUser: HabboUser = {
      id: 'beebop_br',
      habbo_username: 'beebop',
      habbo_avatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Beebop&headonly=1',
      hotel: 'br',
      member_since: '2024-01-01',
      created_at: new Date().toISOString()
    };
    
    // Tentar fazer login com a conta Beebop
    const success = await loginWithPassword('beebop', '151092', 'br');
    
    if (success) {
      toast({
        title: "Conta de teste carregada!",
        description: "Usuário: Beebop, Senha: 151092",
      });
    } else {
      // Se não conseguir fazer login, criar a conta
      const registerSuccess = await registerUser(testUser, '151092');
      if (registerSuccess) {
        toast({
          title: "Conta de teste criada!",
          description: "Usuário: Beebop, Senha: 151092",
        });
      }
    }
  };

  return {
    isLoading,
    currentUser,
    generateCode,
    verifyUserWithCode,
    registerUser,
    loginWithPassword,
    checkExistingUser,
    logout,
    checkAuthStatus,
    createTestAccount,
    isLoggedIn: !!currentUser
  };
};