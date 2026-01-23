import { useState, useEffect, useRef } from 'react';

import type { HabboUser } from '@/types/habbo';

// Cache para evitar requisições duplicadas
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

// Função auxiliar para fetch com timeout
const fetchWithTimeout = async (url: string, timeout = 5000): Promise<Response | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      // Timeout silencioso - removido log para melhor performance
    }
    return null;
  }
};

// Tipos baseados nas APIs reais do Habbo

interface HabboBadge {
  code: string;
  name: string;
  description: string;
}

interface HabboRoom {
  id: number;
  name: string;
  description: string;
  creationTime: string;
  habboGroupId: string | null;
  tags: string[];
  maximumVisitors: number;
  showOwnerName: boolean;
  ownerName: string;
  ownerUniqueId: string;
  categories: string[];
  thumbnailUrl: string | null;
  imageUrl: string | null;
  rating: number;
  uniqueId: string;
}

interface HabboGroup {
  id: string;
  name: string;
  description: string;
  type: string;
  roomId: string | null;
  badgeCode: string;
  primaryColour: string;
  secondaryColour: string;
  isAdmin: boolean;
  online: boolean;
}

interface HabboFriend {
  uniqueId: string;
  name: string;
  motto: string;
  online: boolean;
  figureString: string;
}

interface HabboPhoto {
  id: string;
  url: string;
  takenOn?: string;
}

interface HabboProfile {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  lastAccessTime: string;
  memberSince: string;
  profileVisible: boolean;
  currentLevel: number;
  currentLevelCompletePercent: number;
  totalExperience: number;
  starGemCount: number;
  selectedBadges: string[];
  groups: HabboGroup[];
  badges: HabboBadge[];
  friends: HabboFriend[];
  rooms: HabboRoom[];
}

export const useHabboPublicAPI = (username: string = '', country: string = 'br') => {
  const [userData, setUserData] = useState<HabboUser | null>(null);
  const [profileData, setProfileData] = useState<HabboProfile | null>(null);
  const [badges, setBadges] = useState<HabboBadge[]>([]);
  const [rooms, setRooms] = useState<HabboRoom[]>([]);
  const [groups, setGroups] = useState<HabboGroup[]>([]);
  const [friends, setFriends] = useState<HabboFriend[]>([]);
  const [photos, setPhotos] = useState<HabboPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false); // Evitar múltiplas chamadas simultâneas
  const lastUsernameRef = useRef<string>(''); // Rastrear último username carregado

  // Mapeamento de países para URLs da API
  const countryAPIs = {
    br: 'https://www.habbo.com.br',
    us: 'https://www.habbo.com',
    de: 'https://www.habbo.de',
    es: 'https://www.habbo.es',
    fi: 'https://www.habbo.fi',
    fr: 'https://www.habbo.fr',
    it: 'https://www.habbo.it',
    nl: 'https://www.habbo.nl',
    tr: 'https://www.habbo.com.tr'
  };

  // API base baseada no país selecionado
  const API_BASE = countryAPIs[country as keyof typeof countryAPIs] || countryAPIs.br;

  // Função para buscar dados básicos do usuário
  const fetchUserData = async (username: string) => {
    try {
      const cacheKey = `user-${username.toLowerCase()}-${country}`;
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setUserData(cached.data);
        return cached.data;
      }

      // Usar a documentação oficial da API: GET /api/public/users
      const url = `${API_BASE}/api/public/users?name=${encodeURIComponent(username)}`;
      const response = await fetchWithTimeout(url, 5000);
      
      if (response && response.ok) {
        const data = await response.json();
        // Verificar se os dados estão no formato esperado
        if (data && data.name && data.figureString) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          setUserData(data);
          setError(null); // Limpar erro anterior
          return data;
        } else {
          throw new Error('Dados do usuário incompletos');
        }
      } else {
        throw new Error(`Usuário não encontrado: ${response?.status || 'timeout'}`);
      }
    } catch (error) {
      setError(`Erro ao buscar dados do usuário: ${error.message}`);
      setUserData(null); // Limpar dados anteriores
      return null;
    }
  };

  // Função para buscar perfil completo do usuário
  const fetchUserProfile = async (uniqueId: string) => {
    try {
      const cacheKey = `profile-${uniqueId}-${country}`;
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        const data = cached.data;
        setProfileData(data);
        if (data.badges) setBadges(data.badges);
        if (data.rooms) setRooms(data.rooms);
        if (data.groups) setGroups(data.groups);
        if (data.friends) setFriends(data.friends);
        if (data.photos) setPhotos(data.photos);
        return data;
      }

      const response = await fetchWithTimeout(`${API_BASE}/api/public/users/${uniqueId}/profile`, 5000);
      
      if (response && response.ok) {
        const data = await response.json();
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
        setProfileData(data);
        
        // Extrair dados do perfil
        if (data.badges) {
          setBadges(data.badges);
        }
        if (data.rooms) {
          setRooms(data.rooms);
        }
        if (data.groups) {
          setGroups(data.groups);
        }
        if (data.friends) {
          setFriends(data.friends);
        }
        
        // Verificar se há fotos no perfil
        if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
          setPhotos(data.photos);
        } else {
          // Se não há fotos no perfil, buscar de forma otimizada
          await fetchPhotosOptimized(uniqueId);
        }
        
        return data;
      } else {
        throw new Error('Perfil não encontrado ou não visível');
      }
    } catch (error) {
      // Se o perfil não estiver disponível, tentar buscar dados individuais em paralelo
      await fetchIndividualDataOptimized(uniqueId, username);
      return null;
    }
  };

  // Função otimizada para buscar fotos (tenta endpoints em paralelo)
  const fetchPhotosOptimized = async (uniqueId: string) => {
    const cacheKey = `photos-${uniqueId}-${country}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setPhotos(cached.data);
      return;
    }

    try {
      // Tentar todos os endpoints em paralelo com timeout curto
      const photosPromises = [
        fetchWithTimeout(`${API_BASE}/extradata/public/users/${uniqueId}/photos`, 3000),
        fetchWithTimeout(`${API_BASE}/api/public/users/${uniqueId}/photos`, 3000),
        fetchWithTimeout(`${API_BASE}/api/public/users/${uniqueId}/stories`, 3000)
      ];

      const results = await Promise.allSettled(photosPromises);
      
      // Pegar o primeiro que funcionou
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value && result.value.ok) {
          try {
            const photosData = await result.value.json();
            if (photosData && Array.isArray(photosData) && photosData.length > 0) {
              apiCache.set(cacheKey, { data: photosData, timestamp: Date.now() });
              setPhotos(photosData);
              return;
            }
          } catch (e) {
            // Continuar para o próximo
          }
        }
      }
      
      setPhotos([]);
    } catch (photoError) {
      // Erro ao buscar fotos - silenciado para melhor UX
      setPhotos([]);
    }
  };

  // Função otimizada para buscar dados individuais em paralelo
  const fetchIndividualDataOptimized = async (uniqueId: string, username: string) => {
    try {
      // Buscar tudo em paralelo com timeout
      const [badgesResponse, roomsResponse, groupsResponse, friendsResponse] = await Promise.allSettled([
        fetchWithTimeout(`${API_BASE}/api/public/users/${uniqueId}/badges`, 4000),
        fetchWithTimeout(`${API_BASE}/api/public/users/${uniqueId}/rooms`, 4000),
        fetchWithTimeout(`${API_BASE}/api/public/users/${uniqueId}/groups`, 4000),
        fetchWithTimeout(`${API_BASE}/api/public/users/${uniqueId}/friends`, 4000)
      ]);

      // Processar respostas em paralelo
      const promises = [
        badgesResponse.status === 'fulfilled' && badgesResponse.value?.ok 
          ? badgesResponse.value.json().then(data => { setBadges(data); return data; }).catch(() => null)
          : Promise.resolve(null),
        roomsResponse.status === 'fulfilled' && roomsResponse.value?.ok
          ? roomsResponse.value.json().then(data => { setRooms(data); return data; }).catch(() => null)
          : Promise.resolve(null),
        groupsResponse.status === 'fulfilled' && groupsResponse.value?.ok
          ? groupsResponse.value.json().then(data => { setGroups(data); return data; }).catch(() => null)
          : Promise.resolve(null),
        friendsResponse.status === 'fulfilled' && friendsResponse.value?.ok
          ? friendsResponse.value.json().then(data => { setFriends(data); return data; }).catch(() => null)
          : Promise.resolve(null)
      ];

      await Promise.all(promises);

      // Buscar fotos de forma otimizada
      await fetchPhotosOptimized(uniqueId);
    } catch (error) {
      // Erro ao buscar dados individuais - silenciado para melhor UX
    }
  };

  // Função para buscar dados individuais quando o perfil não estiver disponível (versão antiga para compatibilidade)
  const fetchIndividualData = async (uniqueId: string, username: string) => {
    await fetchIndividualDataOptimized(uniqueId, username);
  };

  // Função para buscar detalhes de um grupo específico
  const fetchGroupDetails = async (groupId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/public/groups/${groupId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do grupo:', error);
    }
    return null;
  };

  // Função para buscar detalhes de um quarto específico
  const fetchRoomDetails = async (roomId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/public/rooms/${roomId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do quarto:', error);
    }
    return null;
  };

  // Função para buscar todos os dados
  const fetchAllData = async (username: string) => {
    // Evitar múltiplas chamadas simultâneas
    if (loadingRef.current) {
      // Debug removido para melhor performance
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Buscar dados básicos do usuário
      const userData = await fetchUserData(username);
      
      if (userData && userData.uniqueId) {
        // 2. Buscar perfil completo
        await fetchUserProfile(userData.uniqueId);
        lastUsernameRef.current = username; // Marcar como carregado apenas após sucesso
      } else {
        setError('Usuário não encontrado');
        // Não atualizar lastUsernameRef em caso de erro para permitir retry
      }
    } catch (error) {
      setError(`Erro ao carregar dados: ${error.message}`);
      // Não atualizar lastUsernameRef em caso de erro para permitir retry
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  // Função para atualizar dados específicos (otimizada)
  const refreshSpecificData = async (dataType: 'badges' | 'rooms' | 'groups' | 'friends' | 'photos') => {
    if (!userData?.uniqueId) return;

    try {
      switch (dataType) {
        case 'badges': {
          const response = await fetchWithTimeout(`${API_BASE}/api/public/users/${userData.uniqueId}/badges`, 4000);
          if (response && response.ok) {
            const badgesData = await response.json();
            setBadges(badgesData);
          }
          break;
        }
        case 'rooms': {
          const response = await fetchWithTimeout(`${API_BASE}/api/public/users/${userData.uniqueId}/rooms`, 4000);
          if (response && response.ok) {
            const roomsData = await response.json();
            setRooms(roomsData);
          }
          break;
        }
        case 'groups': {
          const response = await fetchWithTimeout(`${API_BASE}/api/public/users/${userData.uniqueId}/groups`, 4000);
          if (response && response.ok) {
            const groupsData = await response.json();
            setGroups(groupsData);
          }
          break;
        }
        case 'friends': {
          const response = await fetchWithTimeout(`${API_BASE}/api/public/users/${userData.uniqueId}/friends`, 4000);
          if (response && response.ok) {
            const friendsData = await response.json();
            setFriends(friendsData);
          }
          break;
        }
        case 'photos':
          await fetchPhotosOptimized(userData.uniqueId);
          break;
      }
    } catch (error) {
      // Erro silencioso para melhor UX
    }
  };

  // Carregar dados quando o hook for inicializado ou país mudar (otimizado)
  useEffect(() => {
    // Só carrega se:
    // 1. Há um username válido
    // 2. Não está carregando atualmente  
    // 3. É um username diferente do último carregado OU não há dados ainda
    const hasUsername = username && username.trim() !== '';
    const isDifferentUser = username !== lastUsernameRef.current;
    const hasNoData = !userData;
    
    if (hasUsername && !loadingRef.current && (isDifferentUser || hasNoData)) {
      fetchAllData(username);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, country]);

  return {
    userData,
    profileData,
    badges,
    rooms,
    groups,
    friends,
    photos,
    isLoading,
    error,
    refreshData: () => fetchAllData(username),
    refreshBadges: () => refreshSpecificData('badges'),
    refreshRooms: () => refreshSpecificData('rooms'),
    refreshGroups: () => refreshSpecificData('groups'),
    refreshFriends: () => refreshSpecificData('friends'),
    refreshPhotos: () => refreshSpecificData('photos'),
    fetchGroupDetails,
    fetchRoomDetails
  };
};
