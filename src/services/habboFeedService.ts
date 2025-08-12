import { supabase } from '@/integrations/supabase/client';

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
    this.baseUrl = '';
  }

  async getUserFeed(hotel: string, username: string) {
    try {
      const { data, error } = await supabase.functions.invoke('habbo-feed', {
        body: { hotel, username },
      });
      if (error || !data) {
        console.warn(`Failed to fetch user feed for ${username}:`, error?.message || 'no data');
        return null;
      }
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
      const { data, error } = await supabase.functions.invoke('habbo-feed', {
        body: {
          hotel,
          limit,
          ...options,
        },
      });

      let baseResponse: FeedResponse = data as FeedResponse;

      if (error || !data) {
        console.warn(`Failed to fetch hotel feed for ${hotel}:`, error?.message || 'no data');
        baseResponse = {
          activities: [],
          meta: {
            source: 'database',
            timestamp: new Date().toISOString(),
            count: 0,
            onlineCount: 0,
          },
        };
      }

      // If the database feed is sparse, enrich with official ticker items
      if (!baseResponse.activities || baseResponse.activities.length < Math.min(20, limit)) {
        try {
          const ticker = await (await import('./habboProxyService')).habboProxyService.getHotelTicker(hotel);
          if (ticker.activities?.length) {
            const mappedTicker: FeedActivity[] = ticker.activities.slice(0, limit).map((t) => ({
              username: t.username,
              description: t.description || t.activity,
              lastUpdate: t.timestamp,
              counts: { friends: 0, badges: 0, photos: 0 },
              friends: [],
              badges: [],
              photos: [],
              groups: [],
            }));

            // Merge by username+lastUpdate (avoid duplicates)
            const key = (a: FeedActivity) => `${a.username}-${a.lastUpdate}`;
            const existingMap = new Map((baseResponse.activities || []).map((a) => [key(a), a]));
            for (const item of mappedTicker) {
              if (!existingMap.has(key(item))) {
                existingMap.set(key(item), item);
              }
            }
            const merged = Array.from(existingMap.values())
              .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
              .slice(0, limit);

            return {
              activities: merged,
              meta: {
                source: 'hybrid',
                timestamp: new Date().toISOString(),
                count: merged.length,
                onlineCount: baseResponse?.meta?.onlineCount || 0,
              },
            };
          }
        } catch (enrichErr) {
          console.warn('Failed to enrich with official ticker:', enrichErr);
        }
      }

      return (baseResponse || { activities: [], meta: { source: 'database', timestamp: new Date().toISOString(), count: 0, onlineCount: 0 } });
    } catch (error) {
      console.error(`Error fetching hotel feed for ${hotel}:`, error);
      return {
        activities: [],
        meta: {
          source: 'database',
          timestamp: new Date().toISOString(),
          count: 0,
          onlineCount: 0,
        },
      };
    }
  }

  async triggerUserSync(username: string, hotel: string) {
    try {
      const { data, error } = await supabase.functions.invoke('habbo-sync-user', {
        body: { habbo_name: username, hotel },
      });
      if (error) {
        console.warn(`Failed to trigger sync for ${username}:`, error.message);
        return null;
      }
      return data;
    } catch (error) {
      console.error(`Error triggering sync for ${username}:`, error);
      return null;
    }
  }

  async ensureTrackedAndSynced(payload: { habbo_name: string; habbo_id: string; hotel: string }): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('habbo-ensure-tracked', {
        body: payload,
      });
      if (error) {
        console.warn(`Failed to ensure tracking for ${payload.habbo_name}:`, error.message);
        return null;
      }
      return data;
    } catch (error) {
      console.error(`Error ensuring tracking for ${payload.habbo_name}:`, error);
      return null;
    }
  }

  async discoverAndSyncOnlineUsers(hotel: string, limit: number = 50): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('habbo-discover-online', {
        body: { hotel, limit },
      });
      if (error) {
        console.warn(`Failed to discover online users for ${hotel}:`, error.message);
        return null;
      }
      return data;
    } catch (error) {
      console.error(`Error discovering online users for ${hotel}:`, error);
      return null;
    }
  }

  async triggerBatchSync(hotel: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('habbo-sync-batch', {
        body: { hotel },
      });
      if (error) {
        console.warn(`Failed to trigger batch sync for ${hotel}:`, error.message);
        return null;
      }
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
