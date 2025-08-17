
export interface HabboUser {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  profileVisible?: boolean;
  memberSince?: string;
  lastAccessTime?: string;
  selectedBadges?: any[];
  friendsCount?: number;
  roomsCount?: number;
  groupsCount?: number;
}

export interface HabboBadge {
  code: string;
  name: string;
  description?: string;
}

export interface HabboRoom {
  id: number;
  name: string;
  description: string;
  ownerName: string;
  rating: number;
  thumbnailUrl?: string;
}

export interface HabboPhoto {
  id: string;
  url: string;
  likes_count?: number;
  room_name?: string;
}
