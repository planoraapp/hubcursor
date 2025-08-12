
export interface HabboUser {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  profileVisible: boolean;
  memberSince?: string;
  lastAccessTime?: string;
  selectedBadges?: any[];
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
