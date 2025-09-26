import { useState, useEffect } from 'react';

import type { HabboUser } from '@/types/habbo';
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

export const useHabboPublicAPI = (username: string = 'Beebop', country: string = 'br') => {
  const [userData, setUserData] = useState<HabboUser | null>(null);
  const [profileData, setProfileData] = useState<HabboProfile | null>(null);
  const [badges, setBadges] = useState<HabboBadge[]>([]);
  const [rooms, setRooms] = useState<HabboRoom[]>([]);
  const [groups, setGroups] = useState<HabboGroup[]>([]);
  const [friends, setFriends] = useState<HabboFriend[]>([]);
  const [photos, setPhotos] = useState<HabboPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      // Usar a documentação oficial da API: GET /api/public/users
      const url = `${API_BASE}/api/public/users?name=${encodeURIComponent(username)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Verificar se os dados estão no formato esperado
        if (data && data.name && data.figureString) {
          setUserData(data);
          setError(null); // Limpar erro anterior
          return data;
        } else {
          throw new Error('Dados do usuário incompletos');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Usuário não encontrado: ${response.status}`);
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
      const response = await fetch(`${API_BASE}/api/public/users/${uniqueId}/profile`);
      
      if (response.ok) {
        const data = await response.json();
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
        if (data.photos) {
          setPhotos(data.photos);
        } else {
          // Se não há fotos no perfil, tentar buscar individualmente
          await fetchIndividualData(uniqueId, username);
        }
        
        return data;
      } else {
        throw new Error('Perfil não encontrado ou não visível');
      }
    } catch (error) {
      // Se o perfil não estiver disponível, tentar buscar dados individuais
      await fetchIndividualData(uniqueId, username);
      return null;
    }
  };

  // Função para buscar dados individuais quando o perfil não estiver disponível
  const fetchIndividualData = async (uniqueId: string, username: string) => {
    try {
      const [badgesResponse, roomsResponse, groupsResponse, friendsResponse] = await Promise.allSettled([
        fetch(`${API_BASE}/api/public/users/${uniqueId}/badges`),
        fetch(`${API_BASE}/api/public/users/${uniqueId}/rooms`),
        fetch(`${API_BASE}/api/public/users/${uniqueId}/groups`),
        fetch(`${API_BASE}/api/public/users/${uniqueId}/friends`)
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

      // Tentar diferentes endpoints para fotos
      try {
        // Tentar endpoint 1: extradata
        const photosUrl1 = `${API_BASE}/extradata/public/users/${uniqueId}/photos`;
        const photosResponse1 = await fetch(photosUrl1);
        
        if (photosResponse1.ok) {
          const photosData = await photosResponse1.json();
          setPhotos(photosData);
          return;
        }
        
        // Tentar endpoint 2: api/public
        const photosUrl2 = `${API_BASE}/api/public/users/${uniqueId}/photos`;
        const photosResponse2 = await fetch(photosUrl2);
        
        if (photosResponse2.ok) {
          const photosData = await photosResponse2.json();
          setPhotos(photosData);
          return;
        }
        
        // Tentar endpoint 3: stories
        const photosUrl3 = `${API_BASE}/api/public/users/${uniqueId}/stories`;
        const photosResponse3 = await fetch(photosUrl3);
        
        if (photosResponse3.ok) {
          const photosData = await photosResponse3.json();
          setPhotos(photosData);
          return;
        }
        
        setPhotos([]);
        
      } catch (photoError) {
        console.error('Erro ao buscar fotos:', photoError);
        setPhotos([]);
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
    setUserData(null); // Limpar dados anteriores

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
      setError(`Erro ao carregar dados: ${error.message}`);
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
          try {
            // Tentar endpoint 1: extradata
            const photosUrl1 = `${API_BASE}/extradata/public/users/${userData.uniqueId}/photos`;
            const photosResponse1 = await fetch(photosUrl1);
            
            if (photosResponse1.ok) {
              const photosData = await photosResponse1.json();
              setPhotos(photosData);
              return;
            }
            
            // Tentar endpoint 2: api/public
            const photosUrl2 = `${API_BASE}/api/public/users/${userData.uniqueId}/photos`;
            const photosResponse2 = await fetch(photosUrl2);
            
            if (photosResponse2.ok) {
              const photosData = await photosResponse2.json();
              setPhotos(photosData);
              return;
            }
            
            // Tentar endpoint 3: stories
            const photosUrl3 = `${API_BASE}/api/public/users/${userData.uniqueId}/stories`;
            const photosResponse3 = await fetch(photosUrl3);
            
            if (photosResponse3.ok) {
              const photosData = await photosResponse3.json();
              setPhotos(photosData);
              return;
            }
            
            setPhotos([]);
            
          } catch (photoError) {
            console.error('Erro ao buscar fotos:', photoError);
            setPhotos([]);
          }
          break;
      }
    } catch (error) {
      console.error('Erro ao atualizar dados específicos:', error);
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
