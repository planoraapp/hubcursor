
// Mock Habbo Proxy Service
export interface HabboUser {
  name: string;
  motto: string;
  uniqueId: string;
  figureString: string;
  online: boolean;
  profileVisible: boolean;
  lastAccessTime: string;
}

export interface HabboFriend {
  name: string;
  figureString: string;
  online: boolean;
}

export interface TickerActivity {
  username: string;
  activity: string;
  time: string;
  timestamp?: string;
}

export const habboProxyService = {
  getUserProfile: async (username: string): Promise<HabboUser> => {
    return {
      name: username,
      motto: 'Test motto',
      uniqueId: 'test-id',
      figureString: 'hd-180-1.ch-255-66',
      online: true,
      profileVisible: true,
      lastAccessTime: new Date().toISOString()
    };
  },

  getUserBadges: async (username: string): Promise<any[]> => {
    return [];
  },

  getUserPhotos: async (username: string): Promise<any[]> => {
    return [];
  },

  getTicker: async (): Promise<TickerActivity[]> => {
    return [];
  },

  getHotelTicker: async (): Promise<TickerActivity[]> => {
    return [];
  },

  getUserFriends: async (username: string): Promise<HabboFriend[]> => {
    return [];
  },

  getAvatarUrl: (figureString: string, size?: 'xs' | 's' | 'm' | 'l'): string => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=${size || 'm'}`;
  },

  getBadgeUrl: (badgeCode: string): string => {
    return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
  },
};
