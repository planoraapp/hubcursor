
// Mock Habbo API service for development
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

export interface HabboRoom {
  id: string;
  name: string;
  description: string;
  ownerName: string;
  owner: string;
  userCount: number;
  maxUsers: number;
  maxUserCount?: number; // Added alias
  room?: string;
  score?: number;
  rating?: number;
  creationTime?: string; // Added missing property
}

export interface HabboGroup {
  id: string;
  name: string;
  description: string;
  badgeCode: string;
  memberCount?: number;
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

// Mock functions for development
export const getUserByName = async (username: string): Promise<HabboUser | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock user data
  const mockUser: HabboUser = {
    name: username,
    motto: "Welcome to Habbo Hotel!",
    id: "mock-id-" + username,
    uniqueId: "mock-unique-" + username,
    profileVisible: true,
    figureString: "hd-180-1.ch-255-66.lg-270-82.sh-305-62",
    online: Math.random() > 0.5,
    lastAccessTime: new Date().toISOString(),
    memberSince: "2020-01-01T00:00:00.000Z",
    selectedBadges: [
      { code: 'ACH_Badge1', name: 'Achievement 1', description: 'First achievement' },
      { code: 'ACH_Badge2', name: 'Achievement 2', description: 'Second achievement' },
    ]
  };
  
  return mockUser;
};

export const getAchievements = async (): Promise<HabboBadge[]> => {
  return [
    { code: 'ACH_Badge1', name: 'Achievement 1', description: 'First achievement' },
    { code: 'ACH_Badge2', name: 'Achievement 2', description: 'Second achievement' },
  ];
};

export const discoverRooms = async (): Promise<HabboRoom[]> => {
  return [
    {
      id: '1',
      name: 'Test Room 1',
      description: 'A test room description',
      ownerName: 'TestUser',
      owner: 'TestUser',
      userCount: 5,
      maxUsers: 25,
      maxUserCount: 25,
      room: 'Test Room 1',
      score: 4.5,
      rating: 4.5,
      creationTime: new Date().toISOString()
    }
  ];
};

export const getTopBadgeCollectors = async (): Promise<any[]> => {
  return [];
};

export const getTopRooms = async (): Promise<HabboRoom[]> => {
  return await discoverRooms();
};

export const getRealtimeStats = async (): Promise<any> => {
  return {
    onlineUsers: 1000,
    roomsWithUsers: 500,
    totalRooms: 2000
  };
};

export const getUserBadges = async (username: string): Promise<HabboBadge[]> => {
  return await getAchievements();
};

export const getUserFriends = async (username: string): Promise<HabboFriend[]> => {
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
};

export const getUserGroups = async (username: string): Promise<HabboGroup[]> => {
  return [
    { 
      id: '1', 
      name: 'Test Group', 
      description: 'A test group description', 
      badgeCode: 'GRP001',
      memberCount: 50
    }
  ];
};

export const getUserRooms = async (username: string): Promise<HabboRoom[]> => {
  return await discoverRooms();
};

export const getAvatarUrl = (figureString: string, size: 'xs' | 's' | 'm' | 'l' = 'm'): string => {
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=${size}`;
};

export const getBadgeUrl = (badgeCode: string): string => {
  return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
};
