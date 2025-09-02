import { useState, useEffect } from 'react';

// Tipos baseados nas APIs reais do Habbo
interface HabboUser {
  uniqueId: string;
  name: string;
  motto: string;
  figureString: string;
  memberSince: string;
  lastAccessTime: string;
  profileVisible: boolean;
  online: boolean;
  currentLevel: number;
  currentLevelCompletePercent: number;
  totalExperience: number;
  starGemCount: number;
  selectedBadges: string[];
}

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
  type: 'SELFIE' | 'PHOTO' | 'USER_CREATION';
  contentWidth: number;
  contentHeight: number;
  caption?: string;
  likes: number;
  createdAt: string;
  author: string;
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

export const useHabboPublicAPI = (username: string = 'Beebop', country: string = 'br') => {
  const [userData, setUserData] = useState<HabboUser | null>(null);
  const [profileData, setProfileData] = useState<HabboProfile | null>(null);
  const [badges, setBadges] = useState<HabboBadge[]>([]);
  const [rooms, setRooms] = useState<HabboRoom[]>([]);
  const [groups, setGroups] = useState<HabboGroup[]>([]);
  const [friends, setFriends] = useState<HabboFriend[]>([]);
  const [photos, setPhotos] = useState<HabboPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const url = `${API_BASE}/api/public/users?name=${encodeURIComponent(username)}`;
      console.log('Buscando usuário na URL:', url);
      
      const response = await fetch(url);
      console.log('Resposta da API:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dados do usuário recebidos:', data);
        setUserData(data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('Erro na API:', response.status, errorText);
        throw new Error(`Usuário não encontrado: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      setError(`Erro ao buscar dados do usuário: ${error.message}`);
      return null;
    }
  };

  // Função para buscar perfil completo do usuário
  const fetchUserProfile = async (uniqueId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/public/users/${uniqueId}/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        
        // Extrair dados do perfil
        if (data.badges) setBadges(data.badges);
        if (data.rooms) setRooms(data.rooms);
        if (data.groups) setGroups(data.groups);
        if (data.friends) setFriends(data.friends);
        
        return data;
      } else {
        throw new Error('Perfil não encontrado ou não visível');
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      // Se o perfil não estiver disponível, tentar buscar dados individuais
      await fetchIndividualData(uniqueId);
      return null;
    }
  };

  // Função para buscar dados individuais quando o perfil não estiver disponível
  const fetchIndividualData = async (uniqueId: string) => {
    try {
      const [badgesResponse, roomsResponse, groupsResponse, friendsResponse, photosResponse] = await Promise.allSettled([
        fetch(`${API_BASE}/api/public/users/${uniqueId}/badges`),
        fetch(`${API_BASE}/api/public/users/${uniqueId}/rooms`),
        fetch(`${API_BASE}/api/public/users/${uniqueId}/groups`),
        fetch(`${API_BASE}/api/public/users/${uniqueId}/friends`),
        fetch(`${API_BASE}/api/public/users/${uniqueId}/photos`)
      ]);

      // Processar badges
      if (badgesResponse.status === 'fulfilled' && badgesResponse.value.ok) {
        const badgesData = await badgesResponse.value.json();
        setBadges(badgesData);
      }

      // Processar quartos
      if (roomsResponse.status === 'fulfilled' && roomsResponse.value.ok) {
        const roomsData = await roomsResponse.value.json();
        setRooms(roomsData);
      }

      // Processar grupos
      if (groupsResponse.status === 'fulfilled' && groupsResponse.value.ok) {
        const groupsData = await groupsResponse.value.json();
        setGroups(groupsData);
      }

      // Processar amigos
      if (friendsResponse.status === 'fulfilled' && friendsResponse.value.ok) {
        const friendsData = await friendsResponse.value.json();
        setFriends(friendsData);
      }

      // Processar fotos
      if (photosResponse.status === 'fulfilled' && photosResponse.value.ok) {
        const photosData = await photosResponse.value.json();
        setPhotos(photosData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados individuais:', error);
    }
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
    setIsLoading(true);
    setError(null);

    try {
      // 1. Buscar dados básicos do usuário
      const userData = await fetchUserData(username);
      if (userData && userData.uniqueId) {
        // 2. Buscar perfil completo
        await fetchUserProfile(userData.uniqueId);
      } else {
        setError('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar dados específicos
  const refreshSpecificData = async (dataType: 'badges' | 'rooms' | 'groups' | 'friends' | 'photos') => {
    if (!userData?.uniqueId) return;

    try {
      switch (dataType) {
        case 'badges':
          const badgesResponse = await fetch(`${API_BASE}/api/public/users/${userData.uniqueId}/badges`);
          if (badgesResponse.ok) {
            const badgesData = await badgesResponse.json();
            setBadges(badgesData);
          }
          break;
        case 'rooms':
          const roomsResponse = await fetch(`${API_BASE}/api/public/users/${userData.uniqueId}/rooms`);
          if (roomsResponse.ok) {
            const roomsData = await roomsResponse.json();
            setRooms(roomsData);
          }
          break;
        case 'groups':
          const groupsResponse = await fetch(`${API_BASE}/api/public/users/${userData.uniqueId}/groups`);
          if (groupsResponse.ok) {
            const groupsData = await groupsResponse.json();
            setGroups(groupsData);
          }
          break;
        case 'friends':
          const friendsResponse = await fetch(`${API_BASE}/api/public/users/${userData.uniqueId}/friends`);
          if (friendsResponse.ok) {
            const friendsData = await friendsResponse.json();
            setFriends(friendsData);
          }
          break;
        case 'photos':
          const photosResponse = await fetch(`${API_BASE}/api/public/users/${userData.uniqueId}/photos`);
          if (photosResponse.ok) {
            const photosData = await photosResponse.json();
            setPhotos(photosData);
          }
          break;
      }
    } catch (error) {
      console.error(`Erro ao atualizar ${dataType}:`, error);
    }
  };

  // Carregar dados quando o hook for inicializado ou país mudar
  useEffect(() => {
    if (username) {
      fetchAllData(username);
    }
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
