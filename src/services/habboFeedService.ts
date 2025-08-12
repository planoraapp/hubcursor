
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
    source: 'official' | 'database' | 'live' | 'cached' | 'hybrid';
    timestamp: string;
    count: number;
    onlineCount: number;
    filter?: {
      mode?: string;
      onlineWithinSeconds?: number;
      offsetHours?: number;
    };
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
  private supabase: any;

  constructor() {
    // Import supabase client for function invocation
    import('@/integrations/supabase/client').then(module => {
      this.supabase = module.supabase;
    });
  }

  async getHotelFeed(
    hotel: string = 'com.br', 
    limit: number = 50, 
    options?: { 
      onlineWithinSeconds?: number;
      mode?: 'official' | 'database' | 'hybrid';
      offsetHours?: number;
    }
  ): Promise<FeedResponse> {
    console.log(`🎯 [HabboFeedService] Fetching ${options?.mode || 'hybrid'} feed for hotel: ${hotel}`);
    
    const params = { 
      hotel: hotel, 
      limit: String(limit),
      mode: options?.mode || 'hybrid'
    };
    
    if (options?.onlineWithinSeconds) {
      (params as any).onlineWithinSeconds = String(options.onlineWithinSeconds);
    }
    
    if (options?.offsetHours) {
      (params as any).offsetHours = String(options.offsetHours);
    }
    
    const { data, error } = await this.supabase.functions.invoke('habbo-feed', {
      body: params
    });

    if (error) {
      throw new Error(`Failed to fetch feed: ${error.message}`);
    }

    console.log(`✅ [HabboFeedService] Received ${data.activities?.length || 0} activities (${data.meta?.source}) for ${hotel}`);
    return data;
  }

  async discoverAndSyncOnlineUsers(hotel: string = 'com.br', limit: number = 50): Promise<DiscoverResponse> {
    console.log(`🔍 [HabboFeedService] Discovering online users for hotel: ${hotel}`);
    
    const { data, error } = await this.supabase.functions.invoke('habbo-discover-online', {
      body: { hotel: hotel, limit: String(limit) }
    });

    if (error) {
      throw new Error(`Failed to discover users: ${error.message}`);
    }

    console.log(`✅ [HabboFeedService] Discovered ${data.discovered || 0} users for ${hotel}`);
    return data;
  }

  async getUserFeed(hotel: string = 'com.br', username: string): Promise<FeedResponse> {
    console.log(`🎯 [HabboFeedService] Fetching feed for user: ${username} (${hotel})`);
    
    const { data, error } = await this.supabase.functions.invoke('habbo-feed', {
      body: { hotel: hotel, username: username, limit: '10' }
    });

    if (error) {
      throw new Error(`Failed to fetch user feed: ${error.message}`);
    }

    console.log(`✅ [HabboFeedService] Received ${data.activities?.length || 0} activities for ${username}`);
    
    return data;
  }

  async triggerUserSync(habboName: string, hotel: string = 'com.br'): Promise<void> {
    console.log(`🔄 [HabboFeedService] Triggering sync for ${habboName} (${hotel})`);
    
    const { error } = await this.supabase.functions.invoke('habbo-sync-user', {
      body: { habbo_name: habboName, hotel: hotel }
    });

    if (error) {
      throw new Error(`Failed to sync user: ${error.message}`);
    }

    console.log(`✅ [HabboFeedService] Sync triggered for ${habboName}`);
  }

  async ensureTrackedAndSynced(payload: { habbo_name: string; habbo_id: string; hotel: string }): Promise<void> {
    console.log(`🧭 [HabboFeedService] Ensure tracked + sync for ${payload.habbo_name} (${payload.hotel})`);
    
    const { error } = await this.supabase.functions.invoke('habbo-ensure-tracked', {
      body: payload
    });
    
    if (error) {
      throw new Error(`Failed to ensure tracked: ${error.message}`);
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
    
    const { error } = await this.supabase.functions.invoke('habbo-sync-batch', {
      body: { hotel: hotel }
    });

    if (error) {
      throw new Error(`Failed to sync batch: ${error.message}`);
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
