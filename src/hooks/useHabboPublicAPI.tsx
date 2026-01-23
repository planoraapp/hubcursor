import { useState, useEffect } from 'react';

interface HabboUserData {
  name: string;
  motto: string;
  figureString: string;
  memberSince?: string;
  lastAccessTime?: string;
  online?: boolean;
}

interface UseHabboPublicAPIResult {
  userData: HabboUserData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

// Mapeamento de países para URLs da API
const countryAPIs = {
  br: 'https://www.habbo.com/api/public/users',
  us: 'https://www.habbo.com/api/public/users',
  de: 'https://www.habbo.de/api/public/users',
  es: 'https://www.habbo.es/api/public/users',
  fi: 'https://www.habbo.fi/api/public/users',
  fr: 'https://www.habbo.fr/api/public/users',
  it: 'https://www.habbo.it/api/public/users',
  nl: 'https://www.habbo.nl/api/public/users',
  tr: 'https://www.habbo.com.tr/api/public/users'
};

export function useHabboPublicAPI(username: string, country: string): UseHabboPublicAPIResult {
  const [userData, setUserData] = useState<HabboUserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (user: string, countryCode: string) => {
    if (!user.trim()) {
      setUserData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = countryAPIs[countryCode as keyof typeof countryAPIs] || countryAPIs.us;
      const response = await fetch(`${baseUrl}?name=${encodeURIComponent(user)}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuário não encontrado');
        }
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.name) {
        setUserData({
          name: data.name,
          motto: data.motto || '',
          figureString: data.figureString || '',
          memberSince: data.memberSince,
          lastAccessTime: data.lastAccessTime,
          online: data.online
        });
      } else {
        throw new Error('Dados do usuário inválidos');
      }
    } catch (err) {
      console.error('Erro ao buscar dados do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username.trim()) {
      fetchUserData(username, country);
    } else {
      setUserData(null);
      setError(null);
    }
  }, [username, country]);

  const refreshData = () => {
    if (username.trim()) {
      fetchUserData(username, country);
    }
  };

  return {
    userData,
    isLoading,
    error,
    refreshData
  };
}