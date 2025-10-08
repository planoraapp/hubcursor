
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
            // COMENTADO: Edge function habbo-feed não existe mais
      /*
      const { data, error } = await supabase.functions.invoke('habbo-feed', {
        body: { hotel, username },
      });
      if (error || !data) {
                return null;
      }
      return data;
      */
      
      return null;
    } catch (error) {
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
      onlyOnline?: boolean;
    }
  ): Promise<FeedResponse> {
    try {
            // COMENTADO: Edge function habbo-feed não existe mais
      /*
      const { data, error } = await supabase.functions.invoke('habbo-feed', {
        body: {
          hotel,
          limit,
          ...options,
        },
      });

      let baseResponse: FeedResponse = data as FeedResponse;

      if (error || !data) {
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

      // Fallback logic comentado também pois depende de habboProxyService
      */

      return {
        activities: [],
        meta: {
          source: 'database',
          timestamp: new Date().toISOString(),
          count: 0,
          onlineCount: 0,
        },
      };
    } catch (error) {
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
        // COMENTADO: Edge function habbo-sync-user não existe mais
    /*
    try {
      const { data, error } = await supabase.functions.invoke('habbo-sync-user', {
        body: { habbo_name: username, hotel },
      });
      if (error) {
                return null;
      }
      return data;
    } catch (error) {
            return null;
    }
    */
    
    return null;
  }

  // Funções removidas (edge functions obsoletas):
  // - ensureTrackedAndSynced (habbo-ensure-tracked não existe mais)
  // - discoverAndSyncOnlineUsers (habbo-discover-online não existe mais)
  // - triggerBatchSync (habbo-sync-batch não existe mais)

  // Métodos utilitários mantidos funcionando (não dependem de edge functions)
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
