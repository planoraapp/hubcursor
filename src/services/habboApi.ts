
// Base URL for Habbo API (replace with specific hotel if needed)
const HABBO_API_BASE_URL = 'https://www.habbo.com/api/public';
// Para o Habbo BR:
// const HABBO_API_BASE_URL = 'https://www.habbo.com.br/api/public';

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

// Função auxiliar para fazer requisições à API
const fetchData = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(`${HABBO_API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Erro HTTP! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar dados do endpoint ${endpoint}:`, error);
    return null;
  }
};

// Função para buscar usuário por nome
export const getUserByName = async (name: string): Promise<HabboUser | null> => {
  return await fetchData(`/users?name=${encodeURIComponent(name)}`);
};

// Função para buscar dados do usuário por ID
export const getUserById = async (userId: string): Promise<HabboUser | null> => {
  return await fetchData(`/users/${userId}`);
};

// Função para buscar perfil detalhado do usuário
export const getUserProfile = async (userId: string): Promise<HabboUser | null> => {
  return await fetchData(`/users/${userId}/profile`);
};

// Função para buscar emblemas do usuário
export const getUserBadges = async (userId: string): Promise<HabboBadge[] | null> => {
  return await fetchData(`/users/${userId}/badges`);
};

// Função para buscar amigos do usuário
export const getUserFriends = async (userId: string): Promise<HabboUser[] | null> => {
  return await fetchData(`/users/${userId}/friends`);
};

// Função para buscar grupos do usuário
export const getUserGroups = async (userId: string): Promise<HabboGroup[] | null> => {
  return await fetchData(`/users/${userId}/groups`);
};

// Função para buscar quartos do usuário
export const getUserRooms = async (userId: string): Promise<HabboRoom[] | null> => {
  return await fetchData(`/users/${userId}/rooms`);
};

// Função para buscar detalhes de um quarto
export const getRoomDetails = async (roomId: string): Promise<HabboRoom | null> => {
  return await fetchData(`/rooms/${roomId}`);
};

// Função para buscar todos os emblemas disponíveis
export const getAchievements = async (): Promise<HabboBadge[] | null> => {
  return await fetchData('/achievements');
};

// Função para buscar emblema específico
export const getAchievementById = async (achievementId: string): Promise<HabboBadge | null> => {
  return await fetchData(`/achievements/${achievementId}`);
};

// Função para buscar detalhes de um grupo
export const getGroupDetails = async (groupId: string): Promise<HabboGroup | null> => {
  return await fetchData(`/groups/${groupId}`);
};

// Função para buscar membros de um grupo
export const getGroupMembers = async (groupId: string): Promise<HabboUser[] | null> => {
  return await fetchData(`/groups/${groupId}/members`);
};

// Função para buscar estatísticas do marketplace para room items
export const getMarketplaceStatsRoomItem = async (itemName: string): Promise<MarketplaceStats | null> => {
  return await fetchData(`/marketplace/stats/roomItem/${encodeURIComponent(itemName)}`);
};

// Função para buscar estatísticas do marketplace para wall items
export const getMarketplaceStatsWallItem = async (itemName: string): Promise<MarketplaceStats | null> => {
  return await fetchData(`/marketplace/stats/wallItem/${encodeURIComponent(itemName)}`);
};

// Função para gerar URL do avatar do usuário
export const getAvatarUrl = (figureString: string, size: 's' | 'm' | 'l' = 'm'): string => {
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=${size}&direction=2&head_direction=3&gesture=sml&action=std`;
};

// Função para gerar URL do emblema
export const getBadgeUrl = (badgeCode: string): string => {
  return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
};
