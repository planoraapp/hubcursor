interface CacheEntry<T> {
  data: T;
  expires: number;
}

interface HabboProfile {
  figureString?: string;
  motto?: string;
  online?: boolean;
  memberSince?: string;
}

class HabboCacheService {
  private static instance: HabboCacheService;
  private cache = new Map<string, CacheEntry<HabboProfile>>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): HabboCacheService {
    if (!HabboCacheService.instance) {
      HabboCacheService.instance = new HabboCacheService();
    }
    return HabboCacheService.instance;
  }

  private getCacheKey(username: string, hotel: string): string {
    return `${username.toLowerCase()}:${hotel}`;
  }

  get(username: string, hotel: string): HabboProfile | null {
    const key = this.getCacheKey(username, hotel);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(username: string, hotel: string, data: HabboProfile): void {
    const key = this.getCacheKey(username, hotel);
    this.cache.set(key, {
      data,
      expires: Date.now() + this.TTL
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const habboCache = HabboCacheService.getInstance();