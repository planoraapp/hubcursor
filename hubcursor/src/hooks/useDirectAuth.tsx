import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';

interface HabboUser {
  id: string;
  habbo_username: string;
  habbo_motto: string;
  habbo_avatar?: string;
  created_at: string;
}

export const useDirectAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<HabboUser | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const verifyUser = async (username: string, motto: string) => {
    if (!username || !motto) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha username e motto",
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
          username: username,
          motto: motto,
          action: 'verify'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        toast({
          title: "Usuário verificado!",
          description: "Agora defina uma senha para sua conta",
        });
        return data.user;
      } else {
        toast({
          title: "Erro na verificação",
          description: data.error || "Usuário não encontrado ou motto incorreta",
          variant: "destructive"
        });
        return null;
      }
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

  const registerUser = async (username: string, motto: string, password: string) => {
    if (!username || !motto || !password) {
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
          username: username,
          motto: motto,
          password: password,
          action: 'register'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Agora você pode fazer login com sua senha",
        });
        
        // Salvar dados do usuário no localStorage para simular sessão
        localStorage.setItem('habboUser', JSON.stringify(data.user));
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

  const loginWithPassword = async (username: string, password: string) => {
    if (!username || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha username e senha",
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
          username: username,
          password: password,
          action: 'login'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${data.user.habbo_username}!`,
        });
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('habboUser', JSON.stringify(data.user));
        setCurrentUser(data.user);
        
        return true;
      } else {
        toast({
          title: "Erro no login",
          description: data.error || "Username ou senha incorretos",
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

  const logout = () => {
    localStorage.removeItem('habboUser');
    setCurrentUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
  };

  const checkAuthStatus = () => {
    const savedUser = localStorage.getItem('habboUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        return user;
      } catch (error) {
        localStorage.removeItem('habboUser');
        return null;
      }
    }
    return null;
  };

  return {
    isLoading,
    currentUser,
    verifyUser,
    registerUser,
    loginWithPassword,
    logout,
    checkAuthStatus,
    isLoggedIn: !!currentUser
  };
};
