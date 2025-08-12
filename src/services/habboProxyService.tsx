
import { HabboUser } from '@/types/habbo';

export interface HabboFriend {
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
}

export interface TickerActivity {
  username: string;
  action: string;
  timestamp: string;
  time: string;
  figureString?: string;
}

export interface HabboProxyService {
  getAvatarUrl: (figureString: string, direction?: string, size?: string) => string;
  getUserByName: (username: string) => Promise<HabboUser | null>;
  getUserFriends: (username: string) => Promise<HabboFriend[]>;
  getHotelTicker: (hotel: string) => Promise<TickerActivity[]>;
}

export const habboProxyService: HabboProxyService = {
  getAvatarUrl: (figureString: string, direction: string = 'm', size: string = 'l') => {
    // Generate Habbo avatar URL
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&direction=2&head_direction=2&size=${size}`;
  },

  getUserByName: async (username: string): Promise<HabboUser | null> => {
    try {
      console.log(`🔍 [HabboProxy] Searching for user: ${username}`);
      
      const response = await fetch(`https://www.habbo.com.br/api/public/users?name=${username}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ [HabboProxy] User not found: ${username}`);
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const userData = await response.json();
      
      if (!userData || !userData.uniqueId) {
        console.log(`❌ [HabboProxy] Invalid user data for: ${username}`);
        return null;
      }

      const habboUser: HabboUser = {
        uniqueId: userData.uniqueId,
        name: userData.name,
        figureString: userData.figureString,
        motto: userData.motto || '',
        online: userData.online || false,
        profileVisible: userData.profileVisible !== false,
        memberSince: userData.memberSince,
        lastAccessTime: userData.lastAccessTime,
        selectedBadges: userData.selectedBadges || []
      };

      console.log(`✅ [HabboProxy] User found: ${habboUser.name}`);
      return habboUser;
      
    } catch (error) {
      console.error(`❌ [HabboProxy] Error fetching user ${username}:`, error);
      return null;
    }
  },

  getUserFriends: async (username: string): Promise<HabboFriend[]> => {
    try {
      console.log(`👥 [HabboProxy] Fetching friends for: ${username}`);
      
      const response = await fetch(`https://www.habbo.com.br/api/public/users/${username}/friends`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const friendsData = await response.json();
      return friendsData || [];
      
    } catch (error) {
      console.error(`❌ [HabboProxy] Error fetching friends for ${username}:`, error);
      return [];
    }
  },

  getHotelTicker: async (hotel: string): Promise<TickerActivity[]> => {
    try {
      console.log(`📰 [HabboProxy] Fetching ticker for hotel: ${hotel}`);
      
      const response = await fetch(`https://www.habbo.${hotel}/api/public/ticker`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const tickerData = await response.json();
      return tickerData || [];
      
    } catch (error) {
      console.error(`❌ [HabboProxy] Error fetching ticker for ${hotel}:`, error);
      return [];
    }
  }
};
