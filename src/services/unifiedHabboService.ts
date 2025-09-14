// Serviço unificado para APIs do Habbo
// Substitui unifiedHabboService.js, unifiedHabboService.ts e unifiedHabboService.ts

import type { HabboData, HabboUser } from '@/types/habbo';

interface HabboApiResponse {
  name: string;
  motto: string;
  figureString: string;
  memberSince: string;
  online: boolean;
  uniqueId: string;
  selectedBadges?: any[];
  badges?: any[];
  profileVisible?: boolean;
}

class UnifiedHabboService {
  private static instance: UnifiedHabboService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static getInstance(): UnifiedHabboService {
    if (!UnifiedHabboService.instance) {
      UnifiedHabboService.instance = new UnifiedHabboService();
    }
    return UnifiedHabboService.instance;
  }

  private getHotelDomain(hotel: string): string {
    const hotelMap: Record<string, string> = {
      'br': 'com.br',
      'com': 'com',
      'es': 'es',
      'fi': 'fi',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'nl': 'nl',
      'tr': 'com.tr'
    };
    return hotelMap[hotel] || 'com.br';
  }

  private getCacheKey(username: string, hotel: string): string {
    return `${username.toLowerCase()}-${hotel}`;
  }

  private isValidCache(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    return !!(cached && (Date.now() - cached.timestamp < this.CACHE_DURATION));
  }

  async getUserProfile(username: string, hotel: string = 'br'): Promise<HabboUser | null> {
    const cacheKey = this.getCacheKey(username, hotel);
    
    // Verificar cache
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const domain = this.getHotelDomain(hotel);
      const url = `https://www.habbo.${domain}/api/public/users?name=${encodeURIComponent(username)}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HabboHub/1.0'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
          return null; // Usuário não encontrado ou perfil privado
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data: HabboApiResponse = await response.json();
      
      if (!data || !data.name) {
        return null;
      }

      const habboUser: HabboUser = {
        id: data.uniqueId || '',
        name: data.name,
        motto: data.motto || '',
        online: !!data.online,
        memberSince: data.memberSince || '',
        selectedBadges: data.selectedBadges || [],
        badges: data.badges || [],
        figureString: data.figureString || '',
        profileVisible: data.profileVisible ?? true,
        uniqueId: data.uniqueId
      };

      // Salvar no cache
      this.cache.set(cacheKey, {
        data: habboUser,
        timestamp: Date.now()
      });

      return habboUser;

    } catch (error) {
            return null;
    }
  }

  async getUserBadges(username: string, hotel: string = 'br'): Promise<any[]> {
    const profile = await this.getUserProfile(username, hotel);
    return profile?.selectedBadges || [];
  }

  async getUserPhotos(username: string, hotel: string = 'br'): Promise<any[]> {
    // TODO: Implementar busca de fotos se necessário
    return [];
  }

  // Métodos do habboApi.js
  async getCachedData(key: string): Promise<any> {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
      return cached.data;
    }
    return null;
  }

  async setCachedData(key: string, data: any): Promise<void> {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async fetchWithRetry(url: string, options: RequestInit = {}, retries: number = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        if (i === retries - 1) throw new Error(`Failed after ${retries} retries`);
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Max retries exceeded');
  }

  async getAvatarUrl(username: string, hotel: string = 'br'): Promise<string> {
    const profile = await this.getUserProfile(username, hotel);
    if (!profile?.figureString) return '';
    
    const domain = this.getHotelDomain(hotel);
    return `https://www.habbo.${domain}/habbo-imaging/avatarimage?figure=${profile.figureString}`;
  }

  async getBadgeUrl(badgeCode: string): Promise<string> {
    return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
  }

  async discoverRooms(hotel: string = 'br'): Promise<any[]> {
    // TODO: Implementar descoberta de salas
    return [];
  }

  async getUserById(userId: string, hotel: string = 'br'): Promise<HabboUser | null> {
    // TODO: Implementar busca por ID
    return null;
  }

  async getUserFriends(username: string, hotel: string = 'br'): Promise<any[]> {
    // TODO: Implementar busca de amigos
    return [];
  }

  async getUserGroups(username: string, hotel: string = 'br'): Promise<any[]> {
    // TODO: Implementar busca de grupos
    return [];
  }

  async getUserRooms(username: string, hotel: string = 'br'): Promise<any[]> {
    // TODO: Implementar busca de salas do usuário
    return [];
  }

  async getRoomDetails(roomId: string, hotel: string = 'br'): Promise<any> {
    // TODO: Implementar detalhes da sala
    return null;
  }

  async getAchievements(hotel: string = 'br'): Promise<any[]> {
    // TODO: Implementar busca de conquistas
    return [];
  }

  async getAchievementById(achievementId: string, hotel: string = 'br'): Promise<any> {
    // TODO: Implementar busca de conquista por ID
    return null;
  }

  async getGroupDetails(groupId: string, hotel: string = 'br'): Promise<any> {
    // TODO: Implementar detalhes do grupo
    return null;
  }

  async getGroupMembers(groupId: string, hotel: string = 'br'): Promise<any[]> {
    // TODO: Implementar membros do grupo
    return [];
  }

  async getMarketplaceStatsRoomItem(itemName: string, hotel: string = 'br'): Promise<any> {
    // TODO: Implementar estatísticas do marketplace para itens de sala
    return null;
  }

  async getMarketplaceStatsWallItem(itemName: string, hotel: string = 'br'): Promise<any> {
    // TODO: Implementar estatísticas do marketplace para itens de parede
    return null;
  }

  async getRealtimeStats(hotel: string = 'br'): Promise<any> {
    // TODO: Implementar estatísticas em tempo real
    return null;
  }

  async getTopBadgeCollectors(hotel: string = 'br'): Promise<any[]> {
    // TODO: Implementar top colecionadores de badges
    return [];
  }

  async getTopRooms(hotel: string = 'br'): Promise<any[]> {
    // TODO: Implementar top salas
    return [];
  }

  // Métodos do habboApiMultiHotel.ts
  async getUserByName(username: string, hotel: string = 'br'): Promise<HabboUser | null> {
    return this.getUserProfile(username, hotel);
  }

  // Métodos do habboOfficialService.ts
  getGender(figureString: string): string {
    // Extrair gênero da figure string
    if (figureString.includes('.hr-')) {
      return 'male';
    } else if (figureString.includes('.hr-')) {
      return 'female';
    }
    return 'unknown';
  }

  // Converter HabboUser para HabboData (compatibilidade)
  convertToHabboData(habboUser: HabboUser, hotel: string = 'br'): HabboData {
    return {
      id: habboUser.uniqueId || habboUser.id,
      habbo_name: habboUser.name,
      habbo_id: habboUser.uniqueId || habboUser.id,
      hotel: hotel,
      motto: habboUser.motto,
      figure_string: habboUser.figureString,
      is_online: habboUser.online,
      memberSince: habboUser.memberSince
    };
  }

  // Limpar cache (útil para testes ou refresh manual)
  clearCache(): void {
    this.cache.clear();
  }

  // Limpar cache expirado
  cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

// Instância singleton
export const unifiedHabboService = UnifiedHabboService.getInstance();

// Funções de compatibilidade com APIs antigas
export async function getUserByName(username: string, hotel: string = 'br'): Promise<HabboUser | null> {
  return unifiedHabboService.getUserProfile(username, hotel);
}

export async function getUserById(userId: string, hotel: string = 'br'): Promise<HabboUser | null> {
  return unifiedHabboService.getUserById(userId, hotel);
}

export async function getAvatarUrl(username: string, hotel: string = 'br'): Promise<string> {
  return unifiedHabboService.getAvatarUrl(username, hotel);
}

export async function getBadgeUrl(badgeCode: string): Promise<string> {
  return unifiedHabboService.getBadgeUrl(badgeCode);
}

export async function getCachedData(key: string): Promise<any> {
  return unifiedHabboService.getCachedData(key);
}

export async function setCachedData(key: string, data: any): Promise<void> {
  return unifiedHabboService.setCachedData(key, data);
}

export async function fetchWithRetry(url: string, options: RequestInit = {}, retries: number = 3): Promise<Response> {
  return unifiedHabboService.fetchWithRetry(url, options, retries);
}

export function getGender(figureString: string): string {
  return unifiedHabboService.getGender(figureString);
}

export default unifiedHabboService;
