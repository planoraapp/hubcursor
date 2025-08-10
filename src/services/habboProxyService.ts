
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

  async getUserProfile(username: string, hotel: string = 'com.br'): Promise<HabboUser | null> {
    try {
      console.log(`[HabboProxyService] Fetching profile for: ${username}`);
      
      const data = await this.callProxy('getUserProfile', { username, hotel });
      
      if (!data || data.error) {
        console.warn(`[HabboProxyService] User not found: ${username}`);
        return null;
      }

      // Handle both array and object responses
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

      // Map the Habbo API photo format to our HabboPhoto interface
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
      console.log(`[HabboProxyService] Fetching real hotel ticker from widgets proxy`);
      
      const { data, error } = await supabase.functions.invoke('habbo-widgets-proxy', {
        body: {
          username: 'hotel-ticker'
        },
        method: 'POST',
      });

      // The updated widgets proxy now returns 200 with empty activities on error
      if (!error && data && data.activities && data.activities.length > 0) {
        console.log(`[HabboProxyService] Successfully got ${data.activities.length} real ticker activities`);
        
        // Normalize the data structure
        const activities: TickerActivity[] = data.activities.map((activity: any) => ({
          username: activity.username || 'Unknown',
          description: activity.activity || activity.description || 'fez uma atividade',
          time: activity.time || new Date().toISOString(),
          timestamp: activity.timestamp || new Date().toISOString()
        }));

        return activities;
      }

      // Fallback to mock data from habbo-api-proxy
      console.log(`[HabboProxyService] Widgets proxy returned empty/error, falling back to mock data`);
      const fallbackData = await this.callProxy('getHotelTicker');
      
      if (fallbackData && fallbackData.activities) {
        const activities: TickerActivity[] = fallbackData.activities.map((activity: any) => ({
          username: activity.username || 'Unknown',
          description: activity.description || 'fez uma atividade',
          time: activity.time || new Date().toISOString(),
          timestamp: activity.time || new Date().toISOString()
        }));
        
        console.log(`[HabboProxyService] Using ${activities.length} fallback ticker activities`);
        return activities;
      }

      console.warn(`[HabboProxyService] Both ticker sources failed, returning empty array`);
      return [];
    } catch (error) {
      console.error(`[HabboProxyService] Error fetching hotel ticker:`, error);
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
