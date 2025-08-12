
interface FeedActivity {
  username: string;
  lastUpdate: string;
  counts: {
    groups: number;
    friends: number;
    badges: number;
    avatarChanged: boolean;
    mottoChanged: boolean;
  };
  groups: Array<{ name: string; badgeCode: string }>;
  friends: Array<{ name: string; figureString?: string }>;
  badges: Array<{ code: string; name?: string }>;
  description: string;
  photos?: Array<{ url: string; caption?: string; id?: string }>;
  profile?: {
    figureString?: string;
    motto?: string;
    isOnline?: boolean;
    memberSince?: string;
    lastWebVisit?: string;
    groupsCount?: number;
    friendsCount?: number;
    badgesCount?: number;
    photosCount?: number;
  };
}

interface FeedResponse {
  success: boolean;
  hotel: string;
  activities: FeedActivity[];
  meta: {
    source: 'live' | 'cached';
    timestamp: string;
    count: number;
    onlineCount: number;
  };
}

interface DiscoverResponse {
  success: boolean;
  hotel: string;
  discovered: number;
  users: string[];
  message: string;
}

class HabboFeedService {
  private baseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1';

  async getHotelFeed(hotel: string = 'com.br', limit: number = 20, options?: { onlineWithinSeconds?: number }): Promise<FeedResponse> {
    console.log(`🎯 [HabboFeedService] Fetching feed for hotel: ${hotel}`);
    const params = new URLSearchParams({ hotel: hotel, limit: String(limit) });
    if (options?.onlineWithinSeconds) {
      params.set('onlineWithinSeconds', String(options.onlineWithinSeconds));
    }
    const response = await fetch(`${this.baseUrl}/habbo-feed?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log(`✅ [HabboFeedService] Received ${data.activities?.length || 0} activities for ${hotel}`);
    return data;
  }

  async discoverAndSyncOnlineUsers(hotel: string = 'com.br', limit: number = 50): Promise<DiscoverResponse> {
    console.log(`🔍 [HabboFeedService] Discovering online users for hotel: ${hotel}`);
    
    const params = new URLSearchParams({ hotel: hotel, limit: String(limit) });
    const response = await fetch(`${this.baseUrl}/habbo-discover-online?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log(`✅ [HabboFeedService] Discovered ${data.discovered || 0} users for ${hotel}`);
    return data;
  }

  async getUserFeed(hotel: string = 'com.br', username: string): Promise<FeedResponse> {
    console.log(`🎯 [HabboFeedService] Fetching feed for user: ${username} (${hotel})`);
    
    const response = await fetch(`${this.baseUrl}/habbo-feed?hotel=${encodeURIComponent(hotel)}&username=${encodeURIComponent(username)}&limit=10`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log(`✅ [HabboFeedService] Received ${data.activities?.length || 0} activities for ${username}`);
    
    return data;
  }

  async triggerUserSync(habboName: string, hotel: string = 'com.br'): Promise<void> {
    console.log(`🔄 [HabboFeedService] Triggering sync for ${habboName} (${hotel})`);
    
    const response = await fetch(`${this.baseUrl}/habbo-sync-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        habbo_name: habboName,
        hotel: hotel
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync user: ${response.status}`);
    }

    console.log(`✅ [HabboFeedService] Sync triggered for ${habboName}`);
  }

  async ensureTrackedAndSynced(payload: { habbo_name: string; habbo_id: string; hotel: string }): Promise<void> {
    console.log(`🧭 [HabboFeedService] Ensure tracked + sync for ${payload.habbo_name} (${payload.hotel})`);
    const response = await fetch(`${this.baseUrl}/habbo-ensure-tracked`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to ensure tracked: ${response.status}`);
    }
    console.log('✅ [HabboFeedService] ensureTracked succeeded');
  }

  // Helper functions for HabboWidgets-style formatting
  getBadgeUrl(badgeCode: string): string {
    return `https://images.habbo.com/c_images/album1584/${badgeCode}.png`;
  }

  getGroupBadgeUrl(badgeCode: string): string {
    return `https://www.habbo.com.br/habbo-imaging/badge/${badgeCode}.gif`;
  }

  getAvatarUrl(figureString: string, size: string = 'b', headOnly: boolean = true): string {
    const sizeParam = size;
    const headOnlyParam = headOnly ? '&headonly=1' : '';
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?hb=img&figure=${figureString}&size=${sizeParam}${headOnlyParam}`;
  }

  async triggerBatchSync(hotel: string = 'com.br'): Promise<void> {
    console.log(`🔄 [HabboFeedService] Triggering batch sync for ${hotel}`);
    
    const response = await fetch(`${this.baseUrl}/habbo-sync-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hotel: hotel
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync batch: ${response.status}`);
    }

    console.log(`✅ [HabboFeedService] Batch sync triggered for ${hotel}`);
  }

  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return diffInSeconds <= 1 ? 'há 1 segundo' : `há ${diffInSeconds} segundos`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? 'há 1 minuto' : `há ${diffInMinutes} minutos`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? 'há 1 hora' : `há ${diffInHours} horas`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return diffInDays === 1 ? 'há 1 dia' : `há ${diffInDays} dias`;
  }
}

export const habboFeedService = new HabboFeedService();
export type { FeedActivity, FeedResponse, DiscoverResponse };
