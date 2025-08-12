
export interface FeedActivity {
  username: string;
  description: string;
  lastUpdate: string;
  counts: {
    friends: number;
    badges: number;
    photos: number;
    avatarChanged?: boolean;
  };
  friends: Array<{
    name: string;
    figureString: string;
    uniqueId: string;
  }>;
  badges: Array<{
    code: string;
    name: string;
  }>;
  photos: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
  groups: Array<{
    id: string;
    name: string;
    badgeCode: string;
  }>;
  profile?: {
    figureString: string;
    motto: string;
    online: boolean;
  };
}

export interface FeedResponse {
  activities: FeedActivity[];
  meta: {
    source: 'official' | 'database' | 'hybrid';
    timestamp: string;
    count: number;
    onlineCount: number;
  };
}

class HabboFeedService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  async getUserFeed(hotel: string, username: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/habbo-feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotel,
          username
        }),
      });

      if (!response.ok) {
        console.warn(`Failed to fetch user feed for ${username}:`, response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching user feed for ${username}:`, error);
      return null;
    }
  }

  async getHotelFeed(
    hotel: string, 
    limit: number = 50, 
    options?: {
      onlineWithinSeconds?: number;
      mode?: 'official' | 'database' | 'hybrid';
      offsetHours?: number;
    }
  ): Promise<FeedResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/habbo-feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotel,
          limit,
          ...options
        }),
      });

      if (!response.ok) {
        console.warn(`Failed to fetch hotel feed for ${hotel}:`, response.status);
        return {
          activities: [],
          meta: {
            source: 'database',
            timestamp: new Date().toISOString(),
            count: 0,
            onlineCount: 0
          }
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching hotel feed for ${hotel}:`, error);
      return {
        activities: [],
        meta: {
          source: 'database',
          timestamp: new Date().toISOString(),
          count: 0,
          onlineCount: 0
        }
      };
    }
  }

  async triggerUserSync(username: string, hotel: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/habbo-sync-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habbo_name: username,
          hotel
        }),
      });

      if (!response.ok) {
        console.warn(`Failed to trigger sync for ${username}:`, response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error triggering sync for ${username}:`, error);
      return null;
    }
  }

  async ensureTrackedAndSynced(payload: { habbo_name: string; habbo_id: string; hotel: string }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/habbo-ensure-tracked`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn(`Failed to ensure tracking for ${payload.habbo_name}:`, response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error ensuring tracking for ${payload.habbo_name}:`, error);
      return null;
    }
  }

  async discoverAndSyncOnlineUsers(hotel: string, limit: number = 50): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/discover-online-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotel,
          limit
        }),
      });

      if (!response.ok) {
        console.warn(`Failed to discover online users for ${hotel}:`, response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error discovering online users for ${hotel}:`, error);
      return null;
    }
  }

  async triggerBatchSync(hotel: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/batch-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotel
        }),
      });

      if (!response.ok) {
        console.warn(`Failed to trigger batch sync for ${hotel}:`, response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error triggering batch sync for ${hotel}:`, error);
      return null;
    }
  }

  getAvatarUrl(figureString: string, size: 'xs' | 's' | 'm' | 'l' | 'b' = 'm', headOnly: boolean = false): string {
    const baseUrl = 'https://www.habbo.com.br/habbo-imaging/avatarimage';
    const params = new URLSearchParams({
      figure: figureString,
      size: size,
      direction: '2',
      head_direction: '3',
      gesture: 'sml',
    });

    if (headOnly) {
      params.append('headonly', '1');
    }

    return `${baseUrl}?${params.toString()}`;
  }

  getBadgeUrl(badgeCode: string): string {
    return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
  }

  getGroupBadgeUrl(badgeCode: string): string {
    return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
  }

  formatTimeAgo(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return 'há alguns segundos';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `há ${hours} hora${hours > 1 ? 's' : ''}`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `há ${days} dia${days > 1 ? 's' : ''}`;
      }
    } catch (error) {
      return 'há alguns segundos';
    }
  }
}

export const habboFeedService = new HabboFeedService();
