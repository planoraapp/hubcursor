// Hook unificado para dados de todos os hotéis do Habbo
import { useState, useEffect, useCallback, useMemo } from 'react';
import { unifiedHabboApiService, type HabboUser, type HabboFriend, type HabboGroup, type HabboRoom, type HabboAchievement, type HabboPhoto } from '@/services/unifiedHabboApiService';

interface UseUnifiedHabboDataOptions {
  username?: string;
  userId?: string;
  hotel?: string;
  autoDetectHotel?: boolean;
  enableFriends?: boolean;
  enableGroups?: boolean;
  enableRooms?: boolean;
  enableAchievements?: boolean;
  enablePhotos?: boolean;
}

interface UseUnifiedHabboDataReturn {
  // Dados principais
  user: HabboUser | null;
  friends: HabboFriend[];
  groups: HabboGroup[];
  rooms: HabboRoom[];
  achievements: HabboAchievement[];
  photos: HabboPhoto[];
  
  // Estados de loading
  loading: boolean;
  loadingUser: boolean;
  loadingFriends: boolean;
  loadingGroups: boolean;
  loadingRooms: boolean;
  loadingAchievements: boolean;
  loadingPhotos: boolean;
  
  // Estados de erro
  error: string | null;
  userError: string | null;
  friendsError: string | null;
  groupsError: string | null;
  roomsError: string | null;
  achievementsError: string | null;
  photosError: string | null;
  
  // Funções de controle
  refetchUser: () => Promise<void>;
  refetchFriends: () => Promise<void>;
  refetchGroups: () => Promise<void>;
  refetchRooms: () => Promise<void>;
  refetchAchievements: () => Promise<void>;
  refetchPhotos: () => Promise<void>;
  refetchAll: () => Promise<void>;
  
  // Informações do hotel
  detectedHotel: string;
  isHotelSupported: boolean;
  
  // Estatísticas
  stats: {
    totalFriends: number;
    totalGroups: number;
    totalRooms: number;
    totalAchievements: number;
    completedAchievements: number;
    totalPhotos: number;
  };
}

export const useUnifiedHabboData = (options: UseUnifiedHabboDataOptions = {}): UseUnifiedHabboDataReturn => {
  const {
    username,
    userId,
    hotel = 'com',
    autoDetectHotel = true,
    enableFriends = false,
    enableGroups = false,
    enableRooms = false,
    enableAchievements = false,
    enablePhotos = false
  } = options;
  
  // Estados dos dados
  const [user, setUser] = useState<HabboUser | null>(null);
  const [friends, setFriends] = useState<HabboFriend[]>([]);
  const [groups, setGroups] = useState<HabboGroup[]>([]);
  const [rooms, setRooms] = useState<HabboRoom[]>([]);
  const [achievements, setAchievements] = useState<HabboAchievement[]>([]);
  const [photos, setPhotos] = useState<HabboPhoto[]>([]);
  
  // Estados de loading
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  
  // Estados de erro
  const [error, setError] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [achievementsError, setAchievementsError] = useState<string | null>(null);
  const [photosError, setPhotosError] = useState<string | null>(null);
  
  // Detectar hotel automaticamente
  const detectedHotel = useMemo(() => {
    if (autoDetectHotel && userId) {
      return unifiedHabboApiService.detectHotelFromUserId(userId);
    }
    return hotel;
  }, [autoDetectHotel, userId, hotel]);
  
  const isHotelSupported = useMemo(() => {
    return unifiedHabboApiService.isHotelSupported(detectedHotel);
  }, [detectedHotel]);
  
  // Buscar dados do usuário
  const fetchUser = useCallback(async () => {
    if (!username && !userId) return;
    
    setLoadingUser(true);
    setUserError(null);
    
    try {
      let userData: HabboUser | null = null;
      
      if (userId) {
        userData = await unifiedHabboApiService.getUserById(userId, detectedHotel);
      } else if (username) {
        userData = await unifiedHabboApiService.getUserByName(username, detectedHotel);
      }
      
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados do usuário';
      setUserError(errorMessage);
      console.error('Error fetching user:', err);
    } finally {
      setLoadingUser(false);
    }
  }, [username, userId, detectedHotel]);
  
  // Buscar amigos
  const fetchFriends = useCallback(async () => {
    if (!user?.uniqueId || !enableFriends) return;
    
    setLoadingFriends(true);
    setFriendsError(null);
    
    try {
      const friendsData = await unifiedHabboApiService.getUserFriends(user.uniqueId, detectedHotel);
      setFriends(friendsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar amigos';
      setFriendsError(errorMessage);
      console.error('Error fetching friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  }, [user?.uniqueId, enableFriends, detectedHotel]);
  
  // Buscar grupos
  const fetchGroups = useCallback(async () => {
    if (!user?.uniqueId || !enableGroups) return;
    
    setLoadingGroups(true);
    setGroupsError(null);
    
    try {
      const groupsData = await unifiedHabboApiService.getUserGroups(user.uniqueId, detectedHotel);
      setGroups(groupsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar grupos';
      setGroupsError(errorMessage);
      console.error('Error fetching groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  }, [user?.uniqueId, enableGroups, detectedHotel]);
  
  // Buscar quartos
  const fetchRooms = useCallback(async () => {
    if (!user?.uniqueId || !enableRooms) return;
    
    setLoadingRooms(true);
    setRoomsError(null);
    
    try {
      const roomsData = await unifiedHabboApiService.getUserRooms(user.uniqueId, detectedHotel);
      setRooms(roomsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar quartos';
      setRoomsError(errorMessage);
      console.error('Error fetching rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  }, [user?.uniqueId, enableRooms, detectedHotel]);
  
  // Buscar conquistas
  const fetchAchievements = useCallback(async () => {
    if (!user?.uniqueId || !enableAchievements) return;
    
    setLoadingAchievements(true);
    setAchievementsError(null);
    
    try {
      const achievementsData = await unifiedHabboApiService.getUserAchievements(user.uniqueId, detectedHotel);
      setAchievements(achievementsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar conquistas';
      setAchievementsError(errorMessage);
      console.error('Error fetching achievements:', err);
    } finally {
      setLoadingAchievements(false);
    }
  }, [user?.uniqueId, enableAchievements, detectedHotel]);
  
  // Buscar fotos
  const fetchPhotos = useCallback(async () => {
    if (!user?.uniqueId || !enablePhotos) return;
    
    setLoadingPhotos(true);
    setPhotosError(null);
    
    try {
      const photosData = await unifiedHabboApiService.getUserPhotos(user.uniqueId, detectedHotel);
      setPhotos(photosData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar fotos';
      setPhotosError(errorMessage);
      console.error('Error fetching photos:', err);
    } finally {
      setLoadingPhotos(false);
    }
  }, [user?.uniqueId, enablePhotos, detectedHotel]);
  
  // Buscar todos os dados
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.allSettled([
        fetchUser(),
        enableFriends ? fetchFriends() : Promise.resolve(),
        enableGroups ? fetchGroups() : Promise.resolve(),
        enableRooms ? fetchRooms() : Promise.resolve(),
        enableAchievements ? fetchAchievements() : Promise.resolve(),
        enablePhotos ? fetchPhotos() : Promise.resolve()
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados';
      setError(errorMessage);
      console.error('Error fetching all data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchUser, fetchFriends, fetchGroups, fetchRooms, fetchAchievements, fetchPhotos, enableFriends, enableGroups, enableRooms, enableAchievements, enablePhotos]);
  
  // Funções de refetch individuais
  const refetchUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);
  
  const refetchFriends = useCallback(async () => {
    await fetchFriends();
  }, [fetchFriends]);
  
  const refetchGroups = useCallback(async () => {
    await fetchGroups();
  }, [fetchGroups]);
  
  const refetchRooms = useCallback(async () => {
    await fetchRooms();
  }, [fetchRooms]);
  
  const refetchAchievements = useCallback(async () => {
    await fetchAchievements();
  }, [fetchAchievements]);
  
  const refetchPhotos = useCallback(async () => {
    await fetchPhotos();
  }, [fetchPhotos]);
  
  const refetchAll = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);
  
  // Calcular estatísticas
  const stats = useMemo(() => {
    return {
      totalFriends: friends.length,
      totalGroups: groups.length,
      totalRooms: rooms.length,
      totalAchievements: achievements.length,
      completedAchievements: achievements.filter(a => a.completed).length,
      totalPhotos: photos.length
    };
  }, [friends, groups, rooms, achievements, photos]);
  
  // Efeito para buscar dados iniciais
  useEffect(() => {
    if (username || userId) {
      fetchAll();
    }
  }, [username, userId, detectedHotel, enableFriends, enableGroups, enableRooms, enableAchievements, enablePhotos]);
  
  // Efeito para buscar dados adicionais quando usuário é carregado
  useEffect(() => {
    if (user?.uniqueId) {
      if (enableFriends) fetchFriends();
      if (enableGroups) fetchGroups();
      if (enableRooms) fetchRooms();
      if (enableAchievements) fetchAchievements();
      if (enablePhotos) fetchPhotos();
    }
  }, [user?.uniqueId, enableFriends, enableGroups, enableRooms, enableAchievements, enablePhotos]);
  
  return {
    // Dados
    user,
    friends,
    groups,
    rooms,
    achievements,
    photos,
    
    // Estados de loading
    loading,
    loadingUser,
    loadingFriends,
    loadingGroups,
    loadingRooms,
    loadingAchievements,
    loadingPhotos,
    
    // Estados de erro
    error,
    userError,
    friendsError,
    groupsError,
    roomsError,
    achievementsError,
    photosError,
    
    // Funções de controle
    refetchUser,
    refetchFriends,
    refetchGroups,
    refetchRooms,
    refetchAchievements,
    refetchPhotos,
    refetchAll,
    
    // Informações do hotel
    detectedHotel,
    isHotelSupported,
    
    // Estatísticas
    stats
  };
};
