
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
  userCount: number;
  maxUsers: number;
}

export interface HabboGroup {
  id: string;
  name: string;
  description: string;
  badgeCode: string;
}

export interface HabboFriend {
  name: string;
  figureString: string;
  online: boolean;
}

// Mock functions for development
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
      description: 'A test room',
      ownerName: 'TestUser',
      userCount: 5,
      maxUsers: 25
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
    { name: 'Friend1', figureString: 'hd-180-1.ch-255-66', online: true },
    { name: 'Friend2', figureString: 'hd-180-2.ch-255-66', online: false },
  ];
};

export const getUserGroups = async (username: string): Promise<HabboGroup[]> => {
  return [
    { id: '1', name: 'Test Group', description: 'A test group', badgeCode: 'GRP001' }
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
