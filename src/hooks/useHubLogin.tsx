import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { generateVerificationCode } from '@/config/hotels';
import { getHotelConfig } from '@/config/hotels';

interface HabboUser {
  id: string;
  habbo_username: string;
  habbo_motto: string;
  habbo_avatar?: string;
  hotel: string;
  created_at: string;
}

export const useHubLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<HabboUser | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Gerar código de verificação
  const generateCode = () => {
    return generateVerificationCode();
  };

  // Verificar usuário com código (simulado para demonstração)
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
      // Simular verificação - em produção, você faria uma chamada real para a API do Habbo
      const hotelConfig = getHotelConfig(hotelId);
      
      // Simular delay de verificação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular verificação bem-sucedida (em produção, verificar via API real)
      const user: HabboUser = {
        id: `hh${hotelConfig.id}-${username.toLowerCase()}`,
        habbo_username: username,
        habbo_motto: `Código verificado: ${verificationCode}`,
        habbo_avatar: `https://www.habbo.${hotelConfig.domain}/habbo-imaging/avatarimage?user=${username}&headonly=1`,
        hotel: hotelConfig.id,
        created_at: new Date().toISOString()
      };

      setCurrentUser(user);
      toast({
        title: "Usuário verificado!",
        description: "Agora defina uma senha para sua conta",
      });
      return user;

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro na verificação",
        description: "Erro ao verificar usuário",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Registrar usuário no sistema (usando Supabase existente)
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
      // Usar o sistema Supabase existente
      const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.habbo_username,
          motto: user.habbo_motto,
          password: password,
          action: 'register',
          hotel: user.hotel
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Agora você pode fazer login com sua senha",
        });
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('hubUser', JSON.stringify(data.user));
        setCurrentUser(data.user);
        
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
      console.error('Erro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Erro ao criar conta",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login com senha (usando Supabase existente)
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
      // Usar o sistema Supabase existente
      const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          action: 'login',
          hotel: hotelId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${data.user.habbo_username}!`,
        });
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('hubUser', JSON.stringify(data.user));
        setCurrentUser(data.user);
        
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
      console.error('Erro:', error);
      toast({
        title: "Erro no login",
        description: "Erro ao fazer login",
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
      return await AuthService.checkExistingUser(username, hotelId);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      return { exists: false, needsPassword: false };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('hubUser');
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
        return null;
      }
    }
    return null;
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
    isLoggedIn: !!currentUser
  };
};
