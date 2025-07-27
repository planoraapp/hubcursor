
import { useState, useEffect } from 'react';

export interface UserData {
  name: string;
  figureString: string;
  online: boolean;
  motto?: string;
  memberSince?: string;
  lastAccessTime?: string;
  profileVisible?: boolean;
  uniqueId?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
}

// Função para sanitizar entrada do usuário
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"']/g, '');
};

// Função para validar rate limiting
const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
  
  // Filtrar tentativas dentro da janela de tempo
  const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return false;
  }
  
  // Adicionar nova tentativa
  recentAttempts.push(now);
  localStorage.setItem(`rate_limit_${key}`, JSON.stringify(recentAttempts));
  
  return true;
};

// Função para log de auditoria
const auditLog = (action: string, details: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details,
    userAgent: navigator.userAgent,
    ip: 'client-side' // Em produção, seria capturado no backend
  };
  
  console.log('Audit Log:', logEntry);
  
  // Armazenar logs localmente (em produção, enviar para backend)
  const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
  logs.push(logEntry);
  
  // Manter apenas os últimos 100 logs
  if (logs.length > 100) {
    logs.splice(0, logs.length - 100);
  }
  
  localStorage.setItem('audit_logs', JSON.stringify(logs));
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    userData: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    // Verificar se há dados salvos do usuário
    const savedUserData = localStorage.getItem('habbo_hub_user_data');
    const savedSession = localStorage.getItem('habbo_hub_session');
    
    if (savedUserData && savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        const userData = JSON.parse(savedUserData);
        
        // Verificar se a sessão ainda é válida (24 horas)
        const sessionAge = Date.now() - sessionData.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas
        
        if (sessionAge < maxAge) {
          setAuthState({
            isLoggedIn: true,
            userData,
            loading: false,
            error: null
          });
          
          auditLog('session_restored', { username: userData.name });
        } else {
          // Sessão expirada, limpar dados
          localStorage.removeItem('habbo_hub_user_data');
          localStorage.removeItem('habbo_hub_session');
          auditLog('session_expired', { username: userData.name });
        }
      } catch (error) {
        console.error('Erro ao carregar dados da sessão:', error);
        localStorage.removeItem('habbo_hub_user_data');
        localStorage.removeItem('habbo_hub_session');
        auditLog('session_error', { error: error.message });
      }
    }
  }, []);

  const login = async (username: string): Promise<boolean> => {
    // Sanitizar entrada
    const sanitizedUsername = sanitizeInput(username);
    
    if (!sanitizedUsername) {
      setAuthState(prev => ({ ...prev, error: 'Nome de usuário inválido' }));
      return false;
    }

    // Verificar rate limiting
    if (!checkRateLimit('login', 5, 60000)) {
      setAuthState(prev => ({ ...prev, error: 'Muitas tentativas. Tente novamente em 1 minuto.' }));
      auditLog('rate_limit_exceeded', { username: sanitizedUsername });
      return false;
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      auditLog('login_attempt', { username: sanitizedUsername });
      
      // Tentar API do Habbo Brasil primeiro
      let response = await fetch(`https://www.habbo.com.br/api/public/users?name=${encodeURIComponent(sanitizedUsername)}`);
      let users = await response.json();
      
      // Se não encontrar no Brasil, tentar no Habbo ES
      if (!users || users.length === 0) {
        response = await fetch(`https://www.habbo.es/api/public/users?name=${encodeURIComponent(sanitizedUsername)}`);
        users = await response.json();
      }
      
      if (users && users.length > 0) {
        const user = users[0];
        const userDataToSave: UserData = {
          name: user.name,
          figureString: user.figureString,
          online: user.online || false,
          motto: user.motto,
          memberSince: user.memberSince,
          lastAccessTime: user.lastAccessTime,
          profileVisible: user.profileVisible,
          uniqueId: user.uniqueId
        };
        
        // Criar sessão
        const sessionData = {
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        };
        
        setAuthState({
          isLoggedIn: true,
          userData: userDataToSave,
          loading: false,
          error: null
        });
        
        localStorage.setItem('habbo_hub_user_data', JSON.stringify(userDataToSave));
        localStorage.setItem('habbo_hub_session', JSON.stringify(sessionData));
        
        auditLog('login_success', { username: sanitizedUsername, uniqueId: user.uniqueId });
        
        return true;
      }
      
      auditLog('login_failed', { username: sanitizedUsername, reason: 'user_not_found' });
      setAuthState(prev => ({ ...prev, loading: false, error: 'Usuário não encontrado' }));
      return false;
      
    } catch (error) {
      console.error('Erro no login:', error);
      auditLog('login_error', { username: sanitizedUsername, error: error.message });
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Erro de conexão. Tente novamente.' 
      }));
      return false;
    }
  };

  const logout = () => {
    const currentUser = authState.userData?.name;
    
    setAuthState({
      isLoggedIn: false,
      userData: null,
      loading: false,
      error: null
    });
    
    localStorage.removeItem('habbo_hub_user_data');
    localStorage.removeItem('habbo_hub_session');
    
    auditLog('logout', { username: currentUser });
  };

  return {
    isLoggedIn: authState.isLoggedIn,
    userData: authState.userData,
    loading: authState.loading,
    error: authState.error,
    login,
    logout
  };
};
