
import { supabase } from '@/integrations/supabase/client';

// Types
interface HabboUser {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  avatar_url?: string;
  last_seen?: string;
  online_status?: boolean;
}

interface HotelActivity {
  id: string;
  user_name: string;
  activity_type: string;
  description: string;
  timestamp: string;
  avatar_url?: string;
}

interface OnlineUser {
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  avatar_url?: string;
  last_seen: string;
}

interface FeedMeta {
  timestamp: number;
  count: number;
  source: string;
}

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Local cache with TTL
class LocalCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

const cache = new LocalCache();

export class OptimizedFeedService {
  private static instance: OptimizedFeedService;

  static getInstance(): OptimizedFeedService {
    if (!OptimizedFeedService.instance) {
      OptimizedFeedService.instance = new OptimizedFeedService();
    }
    return OptimizedFeedService.instance;
  }

  // Hotel Feed with optimized edge function
  async getHotelFeed(hotel: string = 'br', limit: number = 50): Promise<{
    activities: HotelActivity[];
    meta: FeedMeta;
  }> {
    const cacheKey = `hotel-feed-${hotel}-${limit}`;
    const cached = cache.get<{ activities: HotelActivity[]; meta: FeedMeta }>(cacheKey);
    
    if (cached) {
      console.log('🎯 [OptimizedFeedService] Hotel feed cache hit');
      return cached;
    }

    try {
      console.log(`🚀 [OptimizedFeedService] Fetching hotel feed for ${hotel}...`);
      
      const { data, error } = await supabase.functions.invoke('habbo-feed-optimized', {
        body: { hotel, limit }
      });

      if (error) {
        console.error('❌ [OptimizedFeedService] Edge function error:', error);
        throw error;
      }

      const result = {
        activities: data?.activities || [],
        meta: {
          timestamp: Date.now(),
          count: data?.activities?.length || 0,
          source: 'edge-function'
        }
      };

      // Cache for 2 minutes
      cache.set(cacheKey, result, 2);
      
      console.log(`✅ [OptimizedFeedService] Hotel feed loaded: ${result.activities.length} activities`);
      return result;

    } catch (error) {
      console.error('❌ [OptimizedFeedService] Hotel feed error:', error);
      
      // Return empty state on error
      return {
        activities: [],
        meta: {
          timestamp: Date.now(),
          count: 0,
          source: 'error-fallback'
        }
      };
    }
  }

  // Online Users with optimized queries
  async getOnlineUsers(hotel: string = 'br', limit: number = 20): Promise<{
    users: OnlineUser[];
    meta: FeedMeta;
  }> {
    const cacheKey = `online-users-${hotel}-${limit}`;
    const cached = cache.get<{ users: OnlineUser[]; meta: FeedMeta }>(cacheKey);
    
    if (cached) {
      console.log('🎯 [OptimizedFeedService] Online users cache hit');
      return cached;
    }

    try {
      console.log(`🚀 [OptimizedFeedService] Fetching online users for ${hotel}...`);
      
      // Query recent activities to find online users
      const { data, error } = await supabase
        .from('habbo_user_activities')
        .select(`
          user_name,
          habbo_id,
          hotel,
          created_at,
          habbo_users!inner(*)
        `)
        .eq('hotel', hotel)
        .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ [OptimizedFeedService] Online users query error:', error);
        throw error;
      }

      // Process and deduplicate users
      const usersMap = new Map<string, OnlineUser>();
      data?.forEach((activity: any) => {
        const userId = `${activity.habbo_id}-${activity.hotel}`;
        if (!usersMap.has(userId)) {
          usersMap.set(userId, {
            habbo_name: activity.user_name,
            habbo_id: activity.habbo_id,
            hotel: activity.hotel,
            last_seen: activity.created_at,
            avatar_url: activity.habbo_users?.avatar_url
          });
        }
      });

      const users = Array.from(usersMap.values()).slice(0, limit);
      
      const result = {
        users,
        meta: {
          timestamp: Date.now(),
          count: users.length,
          source: 'database-query'
        }
      };

      // Cache for 3 minutes
      cache.set(cacheKey, result, 3);
      
      console.log(`✅ [OptimizedFeedService] Online users loaded: ${users.length} users`);
      return result;

    } catch (error) {
      console.error('❌ [OptimizedFeedService] Online users error:', error);
      
      return {
        users: [],
        meta: {
          timestamp: Date.now(),
          count: 0,
          source: 'error-fallback'
        }
      };
    }
  }

  // User Discovery with edge function
  async discoverUsers(hotel: string = 'br', limit: number = 15): Promise<{
    users: HabboUser[];
    meta: FeedMeta;
  }> {
    const cacheKey = `discover-users-${hotel}-${limit}`;
    const cached = cache.get<{ users: HabboUser[]; meta: FeedMeta }>(cacheKey);
    
    if (cached) {
      console.log('🎯 [OptimizedFeedService] User discovery cache hit');
      return cached;
    }

    try {
      console.log(`🚀 [OptimizedFeedService] Discovering users for ${hotel}...`);
      
      const { data, error } = await supabase.functions.invoke('habbo-discover-users', {
        body: { hotel, limit }
      });

      if (error) {
        console.error('❌ [OptimizedFeedService] User discovery error:', error);
        throw error;
      }

      const result = {
        users: data?.users || [],
        meta: {
          timestamp: Date.now(),
          count: data?.users?.length || 0,
          source: 'edge-function'
        }
      };

      // Cache for 5 minutes
      cache.set(cacheKey, result, 5);
      
      console.log(`✅ [OptimizedFeedService] Users discovered: ${result.users.length} users`);
      return result;

    } catch (error) {
      console.error('❌ [OptimizedFeedService] User discovery error:', error);
      
      return {
        users: [],
        meta: {
          timestamp: Date.now(),
          count: 0,
          source: 'error-fallback'
        }
      };
    }
  }

  // Cache management
  clearCache(): void {
    cache.clear();
    console.log('🧹 [OptimizedFeedService] Cache cleared');
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: cache.size(),
      entries: Array.from(cache['cache'].keys())
    };
  }
}

export const optimizedFeedService = OptimizedFeedService.getInstance();
