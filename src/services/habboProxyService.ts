
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
}

export interface HabboPhoto {
  id: string;
  url: string;
  timestamp: string;
  roomName?: string;
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
        { code: 'ACH_Badge1', name: 'Achievement 1', description: 'First achievement' }
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
  }
};
