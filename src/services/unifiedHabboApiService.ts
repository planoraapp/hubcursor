// Serviço unificado para APIs de todos os hotéis do Habbo
import { habboCacheService } from './habboCacheService';

// Tipos de dados do Habbo
export interface HabboUser {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  lastAccessTime?: string;
  memberSince?: string;
  profileVisible?: boolean;
  currentLevel?: number;
  currentLevelCompletePercent?: number;
  totalExperience?: number;
  starGemCount?: number;
  selectedBadges?: HabboBadge[];
}

export interface HabboBadge {
  badgeIndex: number;
  code: string;
  name: string;
  description: string;
}

export interface HabboFriend {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  lastAccessTime?: string;
}

export interface HabboGroup {
  id: string;
  name: string;
  description: string;
  type: string;
  roomId?: string;
  badgeCode?: string;
  memberCount?: number;
  isAdmin?: boolean;
  joinedDate?: string;
}

export interface HabboRoom {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  maxUsers: number;
  currentUsers: number;
  ownerName: string;
  ownerUniqueId: string;
  createdDate?: string;
  lastVisited?: string;
}

export interface HabboAchievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedDate?: string;
}

export interface HabboPhoto {
  id: string;
  url: string;
  caption?: string;
  createdDate: string;
  likes: number;
  comments: number;
}

class UnifiedHabboApiService {
  private readonly SUPPORTED_HOTELS = ['br', 'com', 'de', 'es', 'fi', 'fr', 'it', 'nl', 'tr'];
  
  /**
   * Verificar se hotel é suportado
   */
  isHotelSupported(hotel: string): boolean {
    return this.SUPPORTED_HOTELS.includes(hotel);
  }
  
  /**
   * Obter URL da API para hotel específico
   */
  private getApiUrl(hotel: string, endpoint: string): string {
    const baseUrl = habboCacheService.getApiUrl(hotel);
    return `${baseUrl}${endpoint}`;
  }
  
  /**
   * Fazer requisição HTTP com headers apropriados
   */
  private async makeHttpRequest(url: string): Promise<any> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Buscar dados do usuário por nome
   */
  async getUserByName(username: string, hotel: string = 'com'): Promise<HabboUser | null> {
    if (!this.isHotelSupported(hotel)) {
      throw new Error(`Hotel ${hotel} não é suportado`);
    }
    
    return habboCacheService.makeRequest(
      'user_profile',
      `user:${username}`,
      hotel,
      async () => {
        const url = this.getApiUrl(hotel, `/users?name=${encodeURIComponent(username)}`);
        const data = await this.makeHttpRequest(url);
        
        if (data && data.name) {
          return {
            uniqueId: data.uniqueId || `hh${hotel}-${data.name.toLowerCase()}`,
            name: data.name,
            figureString: data.figureString || '',
            motto: data.motto || '',
            online: data.online || false,
            lastAccessTime: data.lastAccessTime,
            memberSince: data.memberSince || data.registeredDate,
            profileVisible: data.profileVisible,
            currentLevel: data.currentLevel,
            currentLevelCompletePercent: data.currentLevelCompletePercent,
            totalExperience: data.totalExperience,
            starGemCount: data.starGemCount,
            selectedBadges: data.selectedBadges || []
          };
        }
        
        return null;
      }
    );
  }
  
  /**
   * Buscar dados do usuário por ID
   */
  async getUserById(userId: string, hotel: string = 'com'): Promise<HabboUser | null> {
    if (!this.isHotelSupported(hotel)) {
      throw new Error(`Hotel ${hotel} não é suportado`);
    }
    
    return habboCacheService.makeRequest(
      'user_profile',
      `userid:${userId}`,
      hotel,
      async () => {
        const url = this.getApiUrl(hotel, `/users/${encodeURIComponent(userId)}`);
        const data = await this.makeHttpRequest(url);
        
        if (data && data.name) {
          return {
            uniqueId: data.uniqueId || userId,
            name: data.name,
            figureString: data.figureString || '',
            motto: data.motto || '',
            online: data.online || false,
            lastAccessTime: data.lastAccessTime,
            memberSince: data.memberSince || data.registeredDate,
            profileVisible: data.profileVisible,
            currentLevel: data.currentLevel,
            currentLevelCompletePercent: data.currentLevelCompletePercent,
            totalExperience: data.totalExperience,
            starGemCount: data.starGemCount,
            selectedBadges: data.selectedBadges || []
          };
        }
        
        return null;
      }
    );
  }
  
  /**
   * Buscar amigos do usuário
   */
  async getUserFriends(userId: string, hotel: string = 'com'): Promise<HabboFriend[]> {
    if (!this.isHotelSupported(hotel)) {
      throw new Error(`Hotel ${hotel} não é suportado`);
    }
    
    return habboCacheService.makeRequest(
      'user_friends',
      `friends:${userId}`,
      hotel,
      async () => {
        try {
          const url = this.getApiUrl(hotel, `/users/${encodeURIComponent(userId)}/friends`);
          const data = await this.makeHttpRequest(url);
          
          if (Array.isArray(data)) {
            return data.map(friend => ({
              uniqueId: friend.uniqueId || `hh${hotel}-${friend.name.toLowerCase()}`,
              name: friend.name,
              figureString: friend.figureString || '',
              motto: friend.motto || '',
              online: friend.online || false,
              lastAccessTime: friend.lastAccessTime
            }));
          }
          
          return [];
        } catch (error) {
          console.warn(`Failed to fetch friends for ${userId}:`, error);
          return [];
        }
      }
    );
  }
  
  /**
   * Buscar grupos do usuário
   */
  async getUserGroups(userId: string, hotel: string = 'com'): Promise<HabboGroup[]> {
    if (!this.isHotelSupported(hotel)) {
      throw new Error(`Hotel ${hotel} não é suportado`);
    }
    
    return habboCacheService.makeRequest(
      'user_groups',
      `groups:${userId}`,
      hotel,
      async () => {
        try {
          const url = this.getApiUrl(hotel, `/users/${encodeURIComponent(userId)}/groups`);
          const data = await this.makeHttpRequest(url);
          
          if (Array.isArray(data)) {
            return data.map(group => ({
              id: group.id || group.groupId,
              name: group.name || group.groupName,
              description: group.description || '',
              type: group.type || 'public',
              roomId: group.roomId,
              badgeCode: group.badgeCode,
              memberCount: group.memberCount,
              isAdmin: group.isAdmin || false,
              joinedDate: group.joinedDate
            }));
          }
          
          return [];
        } catch (error) {
          console.warn(`Failed to fetch groups for ${userId}:`, error);
          return [];
        }
      }
    );
  }
  
  /**
   * Buscar quartos do usuário
   */
  async getUserRooms(userId: string, hotel: string = 'com'): Promise<HabboRoom[]> {
    if (!this.isHotelSupported(hotel)) {
      throw new Error(`Hotel ${hotel} não é suportado`);
    }
    
    return habboCacheService.makeRequest(
      'user_rooms',
      `rooms:${userId}`,
      hotel,
      async () => {
        try {
          const url = this.getApiUrl(hotel, `/users/${encodeURIComponent(userId)}/rooms`);
          const data = await this.makeHttpRequest(url);
          
          if (Array.isArray(data)) {
            return data.map(room => ({
              id: room.id || room.roomId,
              name: room.name || room.roomName,
              description: room.description || '',
              category: room.category || 'public',
              tags: room.tags || [],
              maxUsers: room.maxUsers || 25,
              currentUsers: room.currentUsers || 0,
              ownerName: room.ownerName || room.owner,
              ownerUniqueId: room.ownerUniqueId || room.ownerId,
              createdDate: room.createdDate,
              lastVisited: room.lastVisited
            }));
          }
          
          return [];
        } catch (error) {
          console.warn(`Failed to fetch rooms for ${userId}:`, error);
          return [];
        }
      }
    );
  }
  
  /**
   * Buscar conquistas do usuário
   */
  async getUserAchievements(userId: string, hotel: string = 'com'): Promise<HabboAchievement[]> {
    if (!this.isHotelSupported(hotel)) {
      throw new Error(`Hotel ${hotel} não é suportado`);
    }
    
    return habboCacheService.makeRequest(
      'user_achievements',
      `achievements:${userId}`,
      hotel,
      async () => {
        try {
          const url = this.getApiUrl(hotel, `/users/${encodeURIComponent(userId)}/achievements`);
          const data = await this.makeHttpRequest(url);
          
          if (Array.isArray(data)) {
            return data.map(achievement => ({
              id: achievement.id || achievement.achievementId,
              name: achievement.name || achievement.achievementName,
              description: achievement.description || '',
              progress: achievement.progress || 0,
              maxProgress: achievement.maxProgress || 1,
              completed: achievement.completed || false,
              completedDate: achievement.completedDate
            }));
          }
          
          return [];
        } catch (error) {
          console.warn(`Failed to fetch achievements for ${userId}:`, error);
          return [];
        }
      }
    );
  }
  
  /**
   * Buscar fotos do usuário
   */
  async getUserPhotos(userId: string, hotel: string = 'com'): Promise<HabboPhoto[]> {
    if (!this.isHotelSupported(hotel)) {
      throw new Error(`Hotel ${hotel} não é suportado`);
    }
    
    return habboCacheService.makeRequest(
      'user_photos',
      `photos:${userId}`,
      hotel,
      async () => {
        try {
          const url = this.getApiUrl(hotel, `/users/${encodeURIComponent(userId)}/photos`);
          const data = await this.makeHttpRequest(url);
          
          if (Array.isArray(data)) {
            return data.map(photo => ({
              id: photo.id || photo.photoId,
              url: photo.url || photo.photoUrl,
              caption: photo.caption || '',
              createdDate: photo.createdDate || photo.date,
              likes: photo.likes || 0,
              comments: photo.comments || 0
            }));
          }
          
          return [];
        } catch (error) {
          console.warn(`Failed to fetch photos for ${userId}:`, error);
          return [];
        }
      }
    );
  }
  
  /**
   * Detectar hotel a partir do ID do usuário
   */
  detectHotelFromUserId(userId: string): string {
    if (userId.startsWith('hhbr-')) return 'br';
    if (userId.startsWith('hhcom-') || userId.startsWith('hhus-')) return 'com';
    if (userId.startsWith('hhde-')) return 'de';
    if (userId.startsWith('hhes-')) return 'es';
    if (userId.startsWith('hhfi-')) return 'fi';
    if (userId.startsWith('hhfr-')) return 'fr';
    if (userId.startsWith('hhit-')) return 'it';
    if (userId.startsWith('hhnl-')) return 'nl';
    if (userId.startsWith('hhtr-')) return 'tr';
    return 'com'; // fallback
  }
  
  /**
   * Obter estatísticas do serviço
   */
  getServiceStats() {
    return {
      supportedHotels: this.SUPPORTED_HOTELS,
      cacheStats: habboCacheService.getCacheStats()
    };
  }
}

// Instância singleton
export const unifiedHabboApiService = new UnifiedHabboApiService();
