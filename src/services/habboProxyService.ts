
import { supabase } from '@/integrations/supabase/client';

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
    code: string;
    name: string;
    description: string;
  }>;
}

export interface HabboPhoto {
  id: string;
  url: string;
  takenOn: string;
}

export interface TickerActivity {
  username: string;
  description: string;
  action: string;
  time: string;
  timestamp?: string;
}

export interface HabboFriend {
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  lastAccessTime: string;
}

class HabboProxyService {
  private static CACHE_KEY_PREFIX = 'habbo_ticker_cache_';
  private static CACHE_EXPIRY_MINUTES = 5;

  private async callProxy(action: string, params: Record<string, string> = {}) {
    try {
      const { data, error } = await supabase.functions.invoke('habbo-api-proxy', {
        body: {
          action,
          ...params
        },
        method: 'POST',
      });

      if (error) {
        console.error(`[HabboProxyService] Error calling ${action}:`, error);
        throw new Error(`Failed to fetch ${action}: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error(`[HabboProxyService] Network error for ${action}:`, error);
      throw error;
    }
  }

  private getCacheKey(hotel: string): string {
    return `${HabboProxyService.CACHE_KEY_PREFIX}${hotel}`;
  }

  private saveCacheData(hotel: string, activities: TickerActivity[]): void {
    try {
      const cacheData = {
        activities,
        timestamp: Date.now(),
        hotel
      };
      localStorage.setItem(this.getCacheKey(hotel), JSON.stringify(cacheData));
      console.log(`💾 [HabboProxyService] Cached ${activities.length} activities for hotel ${hotel}`);
    } catch (error) {
      console.warn('Failed to save cache:', error);
    }
  }

  private getCacheData(hotel: string): TickerActivity[] | null {
    try {
      const cached = localStorage.getItem(this.getCacheKey(hotel));
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;
      const maxAge = HabboProxyService.CACHE_EXPIRY_MINUTES * 60 * 1000;

      if (age > maxAge) {
        localStorage.removeItem(this.getCacheKey(hotel));
        console.log(`🗑️ [HabboProxyService] Expired cache for hotel ${hotel}`);
        return null;
      }

      console.log(`📋 [HabboProxyService] Using cached data for hotel ${hotel} (${Math.round(age/1000)}s old)`);
      return cacheData.activities;
    } catch (error) {
      console.warn('Failed to read cache:', error);
      return null;
    }
  }

  async getUserByName(username: string, hotel: string = 'com.br'): Promise<HabboUser | null> {
    return this.getUserProfile(username, hotel);
  }

  async getUserProfile(username: string, hotel: string = 'com.br'): Promise<HabboUser | null> {
    try {
      console.log(`[HabboProxyService] Fetching profile for: ${username} on ${hotel}`);
      
      const data = await this.callProxy('getUserProfile', { username, hotel });
      
      if (!data || data.error) {
        console.warn(`[HabboProxyService] User not found: ${username}`);
        return null;
      }

      const userData = Array.isArray(data) ? data[0] : data;

      if (!userData || !userData.name) {
        console.warn(`[HabboProxyService] Invalid user data for: ${username}`);
        return null;
      }

      return {
        uniqueId: userData.uniqueId || `fallback-${username}`,
        name: userData.name,
        figureString: userData.figureString || '',
        motto: userData.motto || 'Bem-vindo ao Habbo!',
        online: userData.online || false,
        lastAccessTime: userData.lastAccessTime || new Date().toISOString(),
        memberSince: userData.memberSince || '2024',
        profileVisible: userData.profileVisible !== false,
        selectedBadges: userData.selectedBadges || []
      };
    } catch (error) {
      console.error(`[HabboProxyService] Error fetching user profile:`, error);
      throw error;
    }
  }

  async getUserBadges(username: string, hotel: string = 'com.br'): Promise<Array<{ code: string; name: string; description: string; }>> {
    try {
      const data = await this.callProxy('getUserBadges', { username, hotel });
      return data?.selectedBadges || [];
    } catch (error) {
      console.error(`[HabboProxyService] Error fetching badges:`, error);
      return [];
    }
  }

  async getUserPhotos(username: string, hotel: string = 'com.br'): Promise<HabboPhoto[]> {
    try {
      const data = await this.callProxy('getUserPhotos', { username, hotel });
      
      if (!data || !Array.isArray(data)) {
        return [];
      }

      return data.map((photo: any) => ({
        id: photo.id || photo.photoId || Math.random().toString(),
        url: photo.url || photo.photoUrl || '',
        takenOn: photo.takenOn || photo.createdAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error(`[HabboProxyService] Error fetching photos:`, error);
      return [];
    }
  }

  async getUserFriends(username: string, hotel: string = 'com.br'): Promise<HabboFriend[]> {
    try {
      console.log(`[HabboProxyService] Fetching friends for: ${username} on ${hotel}`);
      const data = await this.callProxy('getUserFriends', { username, hotel });
      
      if (!data || !Array.isArray(data)) {
        return [];
      }

      return data.map((friend: any) => ({
        name: friend.name || friend.username || '',
        figureString: friend.figureString || '',
        motto: friend.motto || '',
        online: friend.online || false,
        lastAccessTime: friend.lastAccessTime || new Date().toISOString()
      }));
    } catch (error) {
      console.error(`[HabboProxyService] Error fetching friends:`, error);
      return [];
    }
  }

  async getHotelTicker(hotel: string = 'com.br'): Promise<TickerActivity[]> {
    try {
      console.log(`🎯 [HabboProxyService] Fetching hotel ticker for ${hotel}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-widgets-proxy', {
        body: { hotel },
        method: 'POST',
      });

      if (!error && data) {
        let activities: TickerActivity[] = [];
        
        if (data.activities && Array.isArray(data.activities)) {
          activities = data.activities;
          console.log(`✅ [HabboProxyService] Got ${activities.length} real activities from widgets proxy`);
        } else if (Array.isArray(data)) {
          activities = data.map((activity: any) => ({
            username: activity.username || 'Unknown',
            description: activity.activity || activity.description || 'fez uma atividade',
            action: activity.action || activity.type || 'action',
            time: activity.time || new Date().toISOString(),
            timestamp: activity.timestamp || activity.time || new Date().toISOString()
          }));
          console.log(`✅ [HabboProxyService] Got ${activities.length} activities (array format)`);
        }

        const normalizedActivities: TickerActivity[] = activities.map((activity: any) => ({
          username: activity.username || 'Unknown',
          description: activity.activity || activity.description || 'fez uma atividade',
          action: activity.action || activity.type || 'action',
          time: activity.time || new Date().toISOString(),
          timestamp: activity.timestamp || activity.time || new Date().toISOString()
        }));

        if (normalizedActivities.length > 0) {
          this.saveCacheData(hotel, normalizedActivities);
          return normalizedActivities;
        }
      }

      console.log(`⚠️ [HabboProxyService] Widgets proxy empty/error, trying fallback...`);
      
      // Try fallback from habbo-api-proxy
      const fallbackData = await this.callProxy('getHotelTicker');
      
      if (fallbackData && fallbackData.activities) {
        const activities: TickerActivity[] = fallbackData.activities.map((activity: any) => ({
          username: activity.username || 'Unknown',
          description: activity.description || 'fez uma atividade',
          action: activity.action || activity.type || 'action',
          time: activity.time || new Date().toISOString(),
          timestamp: activity.time || new Date().toISOString()
        }));
        
        console.log(`🎯 [HabboProxyService] Using ${activities.length} fallback activities`);
        this.saveCacheData(hotel, activities);
        return activities;
      }

      // Final fallback to cache
      const cachedData = this.getCacheData(hotel);
      if (cachedData) {
        console.log(`📋 [HabboProxyService] Using cached data as final fallback for ${hotel}`);
        return cachedData;
      }

      console.warn(`⚠️ [HabboProxyService] All ticker sources failed for ${hotel}, returning empty array`);
      return [];
    } catch (error) {
      console.error(`❌ [HabboProxyService] Error fetching hotel ticker:`, error);
      
      // Try cache on error
      const cachedData = this.getCacheData(hotel);
      if (cachedData) {
        console.log(`📋 [HabboProxyService] Using cached data after error for ${hotel}`);
        return cachedData;
      }
      
      return [];
    }
  }

  async getTicker(): Promise<TickerActivity[]> {
    return this.getHotelTicker();
  }

  getAvatarUrl(figureString: string, size: 'xs' | 's' | 'm' | 'l' = 'm'): string {
    if (!figureString) return '/assets/default-avatar.png';
    
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${figureString}&direction=2&head_direction=3&gesture=sml&size=${size}&action=std`;
  }

  getBadgeUrl(badgeCode: string): string {
    return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
  }
}

export const habboProxyService = new HabboProxyService();
