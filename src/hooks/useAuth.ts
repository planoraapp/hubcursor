
import { useState, useEffect } from 'react';

export interface UserData {
  name: string;
  figureString: string;
  online: boolean;
  motto?: string;
  memberSince?: string;
  lastAccessTime?: string;
  profileVisible?: boolean;
}

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar se há dados salvos do usuário
    const savedUserData = localStorage.getItem('habboHubUserData');
    if (savedUserData) {
      try {
        const parsedUserData = JSON.parse(savedUserData);
        setUserData(parsedUserData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('habboHubUserData');
      }
    }
  }, []);

  const login = async (username: string) => {
    setLoading(true);
    try {
      // Simulação de login - em produção, seria uma API real
      const response = await fetch(`https://www.habbo.com.br/api/public/users?name=${username}`);
      const users = await response.json();
      
      if (users && users.length > 0) {
        const user = users[0];
        const userDataToSave: UserData = {
          name: user.name,
          figureString: user.figureString,
          online: user.online || false,
          motto: user.motto,
          memberSince: user.memberSince,
          lastAccessTime: user.lastAccessTime,
          profileVisible: user.profileVisible
        };
        
        setUserData(userDataToSave);
        setIsLoggedIn(true);
        localStorage.setItem('habboHubUserData', JSON.stringify(userDataToSave));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUserData(null);
    setIsLoggedIn(false);
    localStorage.removeItem('habboHubUserData');
  };

  return {
    isLoggedIn,
    userData,
    loading,
    login,
    logout
  };
};
