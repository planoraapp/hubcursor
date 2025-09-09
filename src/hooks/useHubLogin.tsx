import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { generateVerificationCode } from '@/config/hotels';
import { getHotelConfig } from '@/config/hotels';
import { initializeUserHome } from '@/utils/initializeUserHome';
import { createHabbohubAccount } from '@/utils/createHabbohubAccount';

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

  // Verificar status de autenticação ao carregar o hook
  useEffect(() => {
    checkAuthStatus();
  }, []);

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

  // Registrar usuário no sistema (simulado para demonstração)
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
      // Simular registro bem-sucedido
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar usuário com senha
      const userWithPassword = {
        ...user,
        password: password // Em produção, isso seria hasheado
      };
      
      // Salvar no localStorage (em produção, salvar no Supabase)
      localStorage.setItem('hubUser', JSON.stringify(userWithPassword));
      setCurrentUser(userWithPassword);
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Agora você pode fazer login com sua senha",
      });
      
      // Redirecionar para a página inicial após registro
      navigate('/');
      
      return true;
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

  // Login com senha (simulado para demonstração)
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
      console.log('🔐 [useHubLogin] Attempting login for:', username, 'with password:', password);
      
      // Simular verificação de login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Contas especiais com senha fixa
      const specialAccounts = ['Beebop', 'habbohub'];
      if (specialAccounts.includes(username) && password === '151092') {
        console.log('✅ [useHubLogin] Special account login successful!');
        console.log('👤 [useHubLogin] Username:', username);
        console.log('🏨 [useHubLogin] Hotel ID:', hotelId);
        
        const hotelConfig = getHotelConfig(hotelId);
        const user: HabboUser = {
          id: `hh${hotelConfig.id}-${username.toLowerCase()}`,
          habbo_username: username,
          habbo_motto: username === 'Beebop' ? 'Código verificado: HUB-TEST' : 'Administrador do HabboHub',
          habbo_avatar: `https://www.habbo.${hotelConfig.domain}/habbo-imaging/avatarimage?user=${username}&headonly=1`,
          hotel: hotelConfig.id,
          created_at: new Date().toISOString()
        };

        console.log('👤 [useHubLogin] Created user object:', user);
        
        // Salvar no localStorage para persistência
        const userWithPassword = {
          ...user,
          password: '151092'
        };
        localStorage.setItem('hubUser', JSON.stringify(userWithPassword));
        console.log('💾 [useHubLogin] User saved to localStorage');
        
        setCurrentUser(user);
        console.log('✅ [useHubLogin] Current user set to:', user);
        
        // Criar conta no Supabase se for habbohub
        if (username.toLowerCase() === 'habbohub') {
          console.log('🔧 [useHubLogin] Criando conta habbohub no Supabase...');
          try {
            await createHabbohubAccount();
            console.log('✅ [useHubLogin] Conta habbohub criada no Supabase');
          } catch (accountError) {
            console.error('❌ [useHubLogin] Erro ao criar conta habbohub:', accountError);
          }
        }
        
        // Inicializar home do usuário se necessário
        console.log('🏠 [useHubLogin] Inicializando home do usuário...');
        try {
          await initializeUserHome(username);
          console.log('✅ [useHubLogin] Home inicializada com sucesso');
        } catch (homeError) {
          console.error('❌ [useHubLogin] Erro ao inicializar home:', homeError);
        }
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${username}!`,
        });
        navigate('/');
        return true;
      }
      
      // Verificar se usuário existe no localStorage (em produção, verificar no Supabase)
      const savedUser = localStorage.getItem('hubUser');
      console.log('🔍 [useHubLogin] Saved user from localStorage:', savedUser);
      
      if (savedUser) {
        const user = JSON.parse(savedUser);
        console.log('👤 [useHubLogin] Parsed user:', user);
        console.log('🔑 [useHubLogin] Checking credentials - Username match:', user.habbo_username === username, 'Password match:', user.password === password);
        
        if (user.habbo_username === username && user.password === password) {
          console.log('✅ [useHubLogin] Login successful!');
          setCurrentUser(user);
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo, ${user.habbo_username}!`,
          });
          navigate('/');
          return true;
        } else {
          console.log('❌ [useHubLogin] Credentials mismatch');
        }
      } else {
        console.log('❌ [useHubLogin] No saved user found');
      }
      
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error('❌ [useHubLogin] Login error:', error);
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

  // Verificar se usuário já tem conta (simulado para demonstração)
  const checkExistingUser = async (
    username: string,
    hotelId: string
  ): Promise<{ exists: boolean; needsPassword: boolean }> => {
    try {
      // Simular verificação
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Contas especiais que sempre existem
      const specialAccounts = ['Beebop', 'habbohub'];
      if (specialAccounts.includes(username)) {
        return { exists: true, needsPassword: true };
      }
      
      // Verificar se usuário existe no localStorage (em produção, verificar no Supabase)
      const savedUser = localStorage.getItem('hubUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.habbo_username === username) {
          return { exists: true, needsPassword: true };
        }
      }
      
      return { exists: false, needsPassword: false };
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
        console.log('🔍 [checkAuthStatus] Found saved user:', user);
        setCurrentUser(user);
        return user;
      } catch (error) {
        console.error('❌ [checkAuthStatus] Error parsing saved user:', error);
        localStorage.removeItem('hubUser');
        return null;
      }
    }
    console.log('❌ [checkAuthStatus] No saved user found');
    return null;
  };

  // Criar conta de teste para Beebop
  const createTestAccount = () => {
    const testUser: HabboUser = {
      id: 'hhbr-beebop',
      habbo_username: 'Beebop',
      habbo_motto: 'Código verificado: HUB-TEST',
      habbo_avatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Beebop&headonly=1',
      hotel: 'br',
      created_at: new Date().toISOString()
    };
    
    const userWithPassword = {
      ...testUser,
      password: '151092'
    };
    
    localStorage.setItem('hubUser', JSON.stringify(userWithPassword));
    setCurrentUser(userWithPassword);
    
    toast({
      title: "Conta de teste criada!",
      description: "Usuário: Beebop, Senha: 151092",
    });
    
    // Redirecionar para a página inicial após criar conta
    navigate('/');
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
