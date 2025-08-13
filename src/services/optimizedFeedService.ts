
import { supabase } from '@/integrations/supabase/client';

export interface FeedActivity {
  id: string;
  username: string;
  description: string;
  timestamp: string;
  profile: {
    figureString: string;
    motto: string;
    online: boolean;
  };
  changes?: Record<string, any>;
}

export interface OnlineUser {
  id: string;
  username: string;
  motto: string;
  figureString: string;
  online: boolean;
  lastSeen: string;
}

export interface ProfileChange {
  id: string;
  username: string;
  changeType: string;
  description: string;
  timestamp: string;
  oldValue: any;
  newValue: any;
}

export interface FeedMeta {
  source: string;
  type: string;
  timestamp: string;
  count: number;
  hotel: string;
}

class OptimizedFeedService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 2 * 60 * 1000; // 2 minutos

  private getCacheKey(hotel: string, type: string, params?: any): string {
    return `${hotel}:${type}:${JSON.stringify(params || {})}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache(key: string, data: any, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  async getHotelActivities(hotel: string = 'br', limit: number = 50): Promise<{
    activities: FeedActivity[];
    meta: FeedMeta;
  }> {
    const cacheKey = this.getCacheKey(hotel, 'activities', { limit });
    const cached = this.getFromCache<{ activities: FeedActivity[]; meta: FeedMeta }>(cacheKey);
    
    if (cached) {
      console.log(`📦 [OptimizedFeedService] Cache hit for activities:${hotel}`);
      return cached;
    }

    try {
      console.log(`🔄 [OptimizedFeedService] Fetching activities for hotel:${hotel}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-feed-optimized', {
        body: { hotel, type: 'activities', limit }
      });

      if (error) throw error;

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`❌ [OptimizedFeedService] Error fetching activities:`, error);
      return {
        activities: [],
        meta: {
          source: 'error',
          type: 'activities',
          timestamp: new Date().toISOString(),
          count: 0,
          hotel
        }
      };
    }
  }

  async getOnlineUsers(hotel: string = 'br', limit: number = 30): Promise<{
    users: OnlineUser[];
    meta: FeedMeta;
  }> {
    const cacheKey = this.getCacheKey(hotel, 'online-users', { limit });
    const cached = this.getFromCache<{ users: OnlineUser[]; meta: FeedMeta }>(cacheKey);
    
    if (cached) {
      console.log(`📦 [OptimizedFeedService] Cache hit for online-users:${hotel}`);
      return cached;
    }

    try {
      console.log(`🔄 [OptimizedFeedService] Fetching online users for hotel:${hotel}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-feed-optimized', {
        body: { hotel, type: 'online-users', limit }
      });

      if (error) throw error;

      this.setCache(cacheKey, data, 1 * 60 * 1000); // Cache por 1 minuto
      return data;
    } catch (error) {
      console.error(`❌ [OptimizedFeedService] Error fetching online users:`, error);
      return {
        users: [],
        meta: {
          source: 'error',
          type: 'online-users',
          timestamp: new Date().toISOString(),
          count: 0,
          hotel
        }
      };
    }
  }

  async getRecentChanges(hotel: string = 'br', limit: number = 20): Promise<{
    changes: ProfileChange[];
    meta: FeedMeta;
  }> {
    const cacheKey = this.getCacheKey(hotel, 'recent-changes', { limit });
    const cached = this.getFromCache<{ changes: ProfileChange[]; meta: FeedMeta }>(cacheKey);
    
    if (cached) {
      console.log(`📦 [OptimizedFeedService] Cache hit for recent-changes:${hotel}`);
      return cached;
    }

    try {
      console.log(`🔄 [OptimizedFeedService] Fetching recent changes for hotel:${hotel}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-feed-optimized', {
        body: { hotel, type: 'recent-changes', limit }
      });

      if (error) throw error;

      this.setCache(cacheKey, data, 3 * 60 * 1000); // Cache por 3 minutos
      return data;
    } catch (error) {
      console.error(`❌ [OptimizedFeedService] Error fetching recent changes:`, error);
      return {
        changes: [],
        meta: {
          source: 'error',
          type: 'recent-changes',
          timestamp: new Date().toISOString(),
          count: 0,
          hotel
        }
      };
    }
  }

  async discoverUsers(hotel: string = 'br', method: 'random' | 'recent' | 'active' = 'random', limit: number = 20): Promise<{
    users: OnlineUser[];
    meta: FeedMeta;
  }> {
    const cacheKey = this.getCacheKey(hotel, 'discover', { method, limit });
    const cached = this.getFromCache<{ users: OnlineUser[]; meta: FeedMeta }>(cacheKey);
    
    if (cached) {
      console.log(`📦 [OptimizedFeedService] Cache hit for discover:${hotel}:${method}`);
      return cached;
    }

    try {
      console.log(`🔄 [OptimizedFeedService] Discovering users via ${method} for hotel:${hotel}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-discover-users', {
        body: { hotel, method, limit }
      });

      if (error) throw error;

      this.setCache(cacheKey, data, 5 * 60 * 1000); // Cache por 5 minutos
      return data;
    } catch (error) {
      console.error(`❌ [OptimizedFeedService] Error discovering users:`, error);
      return {
        users: [],
        meta: {
          source: 'error',
          method,
          timestamp: new Date().toISOString(),
          count: 0,
          hotel
        }
      };
    }
  }

  // Método para limpar cache
  clearCache(): void {
    this.cache.clear();
    console.log(`🧹 [OptimizedFeedService] Cache cleared`);
  }

  // Método para invalidar cache específico
  invalidateCache(hotel: string, type?: string): void {
    const keysToDelete = [];
    
    for (const [key] of this.cache) {
      if (key.startsWith(`${hotel}:`)) {
        if (!type || key.includes(`:${type}:`)) {
          keysToDelete.push(key);
        }
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🗑️ [OptimizedFeedService] Invalidated ${keysToDelete.length} cache entries for ${hotel}${type ? `:${type}` : ''}`);
  }
}

export const optimizedFeedService = new OptimizedFeedService();
