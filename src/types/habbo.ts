
export interface HabboUser {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  profileVisible?: boolean;
  memberSince?: string;
  lastAccessTime?: string;
  selectedBadges?: HabboBadge[];
  friendsCount?: number;
  roomsCount?: number;
  groupsCount?: number;
  badges?: HabboBadge[];
  id?: string;
  lastWebVisit?: string;
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
  takenOn?: string;
  previewUrl?: string;
  caption?: string;
  timestamp?: string;
  roomId?: string;
  roomName?: string;
  likesCount?: number;
  type?: string;
}

export interface HabboFriend {
  name: string;
  figureString: string;
  online: boolean;
  uniqueId: string;
  motto?: string;
}

export interface TickerActivity {
  username: string;
  activity: string;
  timestamp: string;
  time: string;
  description?: string;
}

export interface TickerResponse {
  activities: TickerActivity[];
  meta: {
    source: string;
    timestamp: string;
    count: number;
    onlineCount: number;
  };
}
