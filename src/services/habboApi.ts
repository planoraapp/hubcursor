// Base URL para Habbo BR API
const HABBO_API_BASE_URL = 'https://www.habbo.com.br/api/public';

export interface HabboUser {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  lastAccessTime: string;
  memberSince: string;
  profileVisible: boolean;
  selectedBadges: Array<{
    badgeIndex: number;
    code: string;
    name: string;
    description: string;
  }>;
}

export interface HabboRoom {
  id: string;
  name: string;
  description: string;
  ownerName: string;
  ownerUniqueId: string;
  rating: number;
  userCount: number;
  maxUserCount: number;
  tags: string[];
  thumbnailUrl: string;
  imageUrl: string;
  habboGroupId: string;
  categoryId: number;
  creationTime: string;
}

export interface HabboBadge {
  code: string;
  name: string;
  description: string;
}

export interface HabboGroup {
  id: string;
  name: string;
  description: string;
  ownerName: string;
  ownerUniqueId: string;
  memberCount: number;
  badgeCode: string;
  roomId: string;
  roomName: string;
  type: string;
  createdAt: string;
}

export interface MarketplaceStats {
  furniTypeName: string;
  averagePrice: number;
  offerCount: number;
  historicalPrices: Array<{
    averagePrice: number;
    date: string;
  }>;
}

// Cache local para evitar muitas requisições
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função auxiliar para cache
const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 [API Cache] Hit for ${key}`);
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Função auxiliar para fazer requisições à API com retry e timeout
const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🌐 [API Request] Tentativa ${i + 1}: ${url}`);
      
      // Implementar timeout usando AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HabboHub/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log(`📡 [API Response] Status ${response.status} para ${url}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`⚠️ [API] Usuário não encontrado (404): ${url}`);
          return null;
        }
        if (response.status === 403) {
          console.warn(`⚠️ [API] Perfil privado (403): ${url}`);
          return null;
        }
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📊 [API Data] Dados recebidos para ${url}:`, data ? 'OK' : 'Empty');
      return data;
      
    } catch (error) {
      console.error(`❌ [API Error] Tentativa ${i + 1} falhou:`, error);
      
      if (i === retries - 1) {
        throw error; // Última tentativa, propagar o erro
      }
      
      // Esperar antes da próxima tentativa (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// Função para buscar usuário por nome - MELHORADA com robustez
export const getUserByName = async (name: string): Promise<HabboUser | null> => {
  try {
    const trimmedName = name.trim();
    if (!trimmedName) {
      console.warn('❌ Nome do usuário está vazio');
      return null;
    }

    console.log(`🔍 [API] Procurando usuário: ${trimmedName}`);
    
    const cacheKey = `user-${trimmedName.toLowerCase()}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      console.log(`📦 [API Cache] Retornando dados em cache para: ${trimmedName}`);
      return cached;
    }

    const data = await fetchWithRetry(`${HABBO_API_BASE_URL}/users?name=${encodeURIComponent(trimmedName)}`);
    
    if (!data) {
      console.warn('❌ Nenhum dado retornado da API para usuário:', trimmedName);
      return null;
    }

    // A API do Habbo pode retornar um objeto diretamente ou um array
    let user;
    if (Array.isArray(data)) {
      if (data.length === 0) {
        console.warn('❌ Array vazio retornado - usuário não encontrado:', trimmedName);
        return null;
      }
      user = data[0]; // Pegar o primeiro usuário se for array
    } else {
      user = data;
    }

    // Verificar se o objeto do usuário tem as propriedades essenciais
    if (!user || typeof user !== 'object') {
      console.warn('❌ Dados do usuário inválidos:', user);
      return null;
    }

    // Verificar se o perfil é privado
    if (user.profileVisible === false) {
      console.warn('❌ Perfil do usuário é privado:', trimmedName);
      return null;
    }

    // Construir objeto do usuário com fallbacks seguros
    const processedUser: HabboUser = {
      uniqueId: user.uniqueId || user.id || `unknown-${Date.now()}`,
      name: user.name || trimmedName,
      figureString: user.figureString || '',
      motto: user.motto ? String(user.motto).trim() : '',
      online: Boolean(user.online),
      lastAccessTime: user.lastAccessTime || new Date().toISOString(),
      memberSince: user.memberSince || new Date().toISOString(),
      profileVisible: user.profileVisible !== false,
      selectedBadges: Array.isArray(user.selectedBadges) ? user.selectedBadges : []
    };

    console.log('✅ Usuário processado com sucesso:');
    console.log('👤 Nome:', processedUser.name);
    console.log('💬 Motto:', `"${processedUser.motto}"`);
    console.log('🟢 Online:', processedUser.online);
    console.log('👁️ Perfil Visível:', processedUser.profileVisible);
    console.log('🆔 ID Único:', processedUser.uniqueId);

    // Salvar no cache
    setCachedData(cacheKey, processedUser);
    
    return processedUser;
    
  } catch (error) {
    console.error('❌ Erro em getUserByName:', error);
    
    // Retornar dados básicos como fallback
    return {
      uniqueId: `fallback-${Date.now()}`,
      name: name.trim(),
      figureString: '',
      motto: 'Perfil temporariamente indisponível',
      online: false,
      lastAccessTime: new Date().toISOString(),
      memberSince: new Date().toISOString(),
      profileVisible: true,
      selectedBadges: []
    };
  }
};

// Função para gerar URL do avatar do usuário com fallback
export const getAvatarUrl = (figureString: string, size: 's' | 'm' | 'l' = 'm', username?: string): string => {
  if (figureString) {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=${size}&direction=2&head_direction=3&gesture=sml&action=std`;
  }
  
  // Fallback para avatar por nome de usuário
  if (username) {
    return `https://www.habbo.com/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&direction=2&head_direction=2&gesture=sml&size=${size}&action=std`;
  }
  
  // Avatar padrão se nada mais funcionar
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=lg-3023-1335.sh-300-64.hd-180-1.hr-831-49.ch-255-66.ca-1813-62&size=${size}&direction=2&head_direction=3&gesture=sml&action=std`;
};

// Função para gerar URL do emblema
export const getBadgeUrl = (badgeCode: string): string => {
  return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
};

// Usuários conhecidos populares do Habbo BR para descobrir quartos
const POPULAR_USERS = [
  'joao123', 'maria456', 'pedro789', 'ana321', 'carlos654',
  'fernanda987', 'ricardo123', 'julia456', 'bruno789', 'carla321'
];

// Função para descobrir quartos através de usuários populares
export const discoverRooms = async (): Promise<HabboRoom[]> => {
  const rooms: HabboRoom[] = [];
  
  for (const username of POPULAR_USERS.slice(0, 5)) { // Limitar para evitar muitas requisições
    try {
      const user = await getUserByName(username);
      if (user) {
        const userRooms = await getUserRooms(user.uniqueId);
        if (userRooms) {
          rooms.push(...userRooms.slice(0, 3)); // Pegar apenas os primeiros 3 quartos de cada usuário
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar quartos do usuário ${username}:`, error);
    }
  }
  
  return rooms;
};

// Função para buscar dados do usuário por ID
export const getUserById = async (userId: string): Promise<HabboUser | null> => {
  return await fetchWithRetry(`/users/${userId}`);
};

// Função para buscar perfil detalhado do usuário
export const getUserProfile = async (userId: string): Promise<HabboUser | null> => {
  return await fetchWithRetry(`/users/${userId}/profile`);
};

// Função para buscar emblemas do usuário
export const getUserBadges = async (userId: string): Promise<HabboBadge[] | null> => {
  return await fetchWithRetry(`/users/${userId}/badges`);
};

// Função para buscar amigos do usuário
export const getUserFriends = async (userId: string): Promise<HabboUser[] | null> => {
  return await fetchWithRetry(`/users/${userId}/friends`);
};

// Função para buscar grupos do usuário
export const getUserGroups = async (userId: string): Promise<HabboGroup[] | null> => {
  return await fetchWithRetry(`/users/${userId}/groups`);
};

// Função para buscar quartos do usuário
export const getUserRooms = async (userId: string): Promise<HabboRoom[] | null> => {
  return await fetchWithRetry(`/users/${userId}/rooms`);
};

// Função para buscar detalhes de um quarto
export const getRoomDetails = async (roomId: string): Promise<HabboRoom | null> => {
  return await fetchWithRetry(`/rooms/${roomId}`);
};

// Função para buscar todos os emblemas disponíveis
export const getAchievements = async (): Promise<HabboBadge[] | null> => {
  return await fetchWithRetry('/achievements');
};

// Função para buscar emblema específico
export const getAchievementById = async (achievementId: string): Promise<HabboBadge | null> => {
  return await fetchWithRetry(`/achievements/${achievementId}`);
};

// Função para buscar detalhes de um grupo
export const getGroupDetails = async (groupId: string): Promise<HabboGroup | null> => {
  return await fetchWithRetry(`/groups/${groupId}`);
};

// Função para buscar membros de um grupo
export const getGroupMembers = async (groupId: string): Promise<HabboUser[] | null> => {
  return await fetchWithRetry(`/groups/${groupId}/members`);
};

// Função para buscar estatísticas do marketplace para room items
export const getMarketplaceStatsRoomItem = async (itemName: string): Promise<MarketplaceStats | null> => {
  return await fetchWithRetry(`/marketplace/stats/roomItem/${encodeURIComponent(itemName)}`);
};

// Função para buscar estatísticas do marketplace para wall items
export const getMarketplaceStatsWallItem = async (itemName: string): Promise<MarketplaceStats | null> => {
  return await fetchWithRetry(`/marketplace/stats/wallItem/${encodeURIComponent(itemName)}`);
};

// Função para calcular estatísticas em tempo real
export const getRealtimeStats = async () => {
  try {
    const achievements = await getAchievements();
    const rooms = await discoverRooms();
    
    return {
      totalBadges: achievements?.length || 0,
      totalRooms: rooms?.length || 0,
      activeUsers: rooms?.reduce((acc, room) => acc + (room.userCount || 0), 0) || 0,
      averageRating: rooms?.length ? rooms.reduce((acc, room) => acc + (room.rating || 0), 0) / rooms.length : 0
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas em tempo real:', error);
    return {
      totalBadges: 0,
      totalRooms: 0,
      activeUsers: 0,
      averageRating: 0
    };
  }
};

// Função para buscar rankings de usuários com mais emblemas
export const getTopBadgeCollectors = async (): Promise<Array<{ name: string; score: number; user: HabboUser }>> => {
  const collectors: Array<{ name: string; score: number; user: HabboUser }> = [];
  
  for (const username of POPULAR_USERS.slice(0, 10)) {
    try {
      const user = await getUserByName(username);
      if (user) {
        const badges = await getUserBadges(user.uniqueId);
        if (badges) {
          collectors.push({
            name: user.name,
            score: badges.length,
            user: user
          });
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar emblemas do usuário ${username}:`, error);
    }
  }
  
  return collectors.sort((a, b) => b.score - a.score).slice(0, 5);
};

// Função para buscar quartos mais populares
export const getTopRooms = async (): Promise<Array<{ name: string; owner: string; score: number; room: HabboRoom }>> => {
  const rooms = await discoverRooms();
  
  if (!rooms || rooms.length === 0) {
    return [];
  }
  
  return rooms
    .filter(room => room && room.name && room.ownerName) // Filter out invalid rooms
    .map(room => ({
      name: room.name,
      owner: room.ownerName,
      score: room.userCount || 0, // Ensure score is always a number
      room: room
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};
