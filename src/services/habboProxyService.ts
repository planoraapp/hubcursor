
export interface HabboUser {
  name: string;
  motto: string;
  id: string;
  uniqueId: string;
  profileVisible: boolean;
  figureString: string;
  online: boolean;
  lastAccessTime: string;
  memberSince: string;
  selectedBadges?: HabboBadge[];
}

export interface HabboBadge {
  code: string;
  name: string;
  description: string;
  badgeIndex?: number;
}

export interface HabboPhoto {
  id: string;
  url: string;
  timestamp: string;
  roomName?: string;
}

export interface HabboFriend {
  name: string;
  figureString: string;
  online: boolean;
  motto?: string;
  id?: string;
  uniqueId?: string;
  profileVisible?: boolean;
  lastAccessTime?: string;
  memberSince?: string;
}

export interface TickerActivity {
  id: string;
  type: string;
  message: string;
  description?: string;
  timestamp?: string;
  time?: string;
  username: string;
  user?: string;
  room?: string;
}

export const habboProxyService = {
  getUserProfile: async (username: string): Promise<HabboUser> => {
    // Mock implementation
    return {
      name: username,
      motto: "Mock user motto",
      id: `mock-id-${username}`,
      uniqueId: `mock-unique-${username}`,
      profileVisible: true,
      figureString: "hd-180-1.ch-255-66.lg-270-82.sh-305-62",
      online: Math.random() > 0.5,
      lastAccessTime: new Date().toISOString(),
      memberSince: "2020-01-01T00:00:00.000Z",
      selectedBadges: [
        { code: 'ACH_Badge1', name: 'Achievement 1', description: 'First achievement', badgeIndex: 1 }
      ]
    };
  },

  getUserPhotos: async (username: string): Promise<HabboPhoto[]> => {
    // Mock implementation
    return [
      {
        id: '1',
        url: 'https://via.placeholder.com/150',
        timestamp: new Date().toISOString(),
        roomName: 'Test Room'
      }
    ];
  },

  getUserBadges: async (username: string): Promise<HabboBadge[]> => {
    return [
      { code: 'ACH_Badge1', name: 'Achievement 1', description: 'First achievement', badgeIndex: 1 },
      { code: 'ACH_Badge2', name: 'Achievement 2', description: 'Second achievement', badgeIndex: 2 },
    ];
  },

  getUserFriends: async (username: string): Promise<HabboFriend[]> => {
    return [
      { 
        name: 'Friend1', 
        figureString: 'hd-180-1.ch-255-66', 
        online: true,
        motto: "Hello!",
        id: "friend1-id",
        uniqueId: "friend1-unique",
        profileVisible: true,
        lastAccessTime: new Date().toISOString(),
        memberSince: "2020-01-01T00:00:00.000Z"
      },
      { 
        name: 'Friend2', 
        figureString: 'hd-180-2.ch-255-66', 
        online: false,
        motto: "Offline now",
        id: "friend2-id",
        uniqueId: "friend2-unique",
        profileVisible: true,
        lastAccessTime: new Date().toISOString(),
        memberSince: "2020-01-01T00:00:00.000Z"
      },
    ];
  },

  getTicker: async (): Promise<TickerActivity[]> => {
    return [
      {
        id: '1',
        type: 'login',
        message: 'User joined the hotel',
        description: 'A new user has entered the hotel',
        timestamp: new Date().toISOString(),
        username: 'TestUser'
      },
      {
        id: '2',
        type: 'room',
        message: 'New room created',
        description: 'A user created a new room',
        timestamp: new Date().toISOString(),
        username: 'TestUser',
        room: 'Test Room'
      }
    ];
  },

  getHotelTicker: async (): Promise<TickerActivity[]> => {
    return await habboProxyService.getTicker();
  },

  getAvatarUrl: (figureString: string, size?: 'xs' | 's' | 'm' | 'l') => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=${size || 'm'}`;
  },

  getBadgeUrl: (badgeCode: string) => {
    return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
  }
};
