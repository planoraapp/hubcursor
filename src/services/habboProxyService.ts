
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
  type: 'login' | 'achievement' | 'friend';
  username: string;
  achievement?: string;
  friend?: string;
  time: string;
}

class HabboProxyService {
  private async callProxy(action: string, params: Record<string, string> = {}) {
    try {
      const searchParams = new URLSearchParams({
        action,
        ...params
      });

      const { data, error } = await supabase.functions.invoke('habbo-api-proxy', {
        body: null,
        method: 'GET',
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
      return data?.badges || [];
    } catch (error) {
      console.error(`[HabboProxyService] Error fetching badges:`, error);
      return [];
    }
  }

  async getUserPhotos(username: string, hotel: string = 'com.br'): Promise<HabboPhoto[]> {
    try {
      const data = await this.callProxy('getUserPhotos', { username, hotel });
      return data || [];
    } catch (error) {
      console.error(`[HabboProxyService] Error fetching photos:`, error);
      return [];
    }
  }

  async getTicker(): Promise<TickerActivity[]> {
    try {
      const data = await this.callProxy('getTicker');
      return data?.activities || [];
    } catch (error) {
      console.error(`[HabboProxyService] Error fetching ticker:`, error);
      return [];
    }
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
