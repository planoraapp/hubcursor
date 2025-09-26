import { useState, useEffect, useCallback, useMemo } from 'react';

// Sistema de Cache Avançado para Editor de Visuais Habbo
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
  lastAccessed: number;
}

interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live em ms
  maxHits: number;
}

class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
    this.startCleanupInterval();
  }

  set(key: string, data: T): void {
    // Se cache está cheio, remover item menos usado
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
      lastAccessed: Date.now()
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Verificar TTL
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Atualizar estatísticas
    entry.hits++;
    entry.lastAccessed = Date.now();
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastUsedScore = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Score baseado em hits e tempo desde último acesso
      const score = entry.hits / (Date.now() - entry.lastAccessed + 1);
      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.config.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Limpeza a cada minuto
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate()
    };
  }

  private calculateHitRate(): number {
    let totalHits = 0;
    let totalAccesses = 0;

    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
      totalAccesses += entry.hits + 1; // +1 para o acesso inicial
    }

    return totalAccesses > 0 ? totalHits / totalAccesses : 0;
  }
}

// Cache específico para URLs de avatar
const avatarUrlCache = new AdvancedCache<string>({
  maxSize: 1000,
  ttl: 1000 * 60 * 60 * 2, // 2 horas
  maxHits: 100
});

// Cache para dados de figuredata
const figureDataCache = new AdvancedCache<any>({
  maxSize: 100,
  ttl: 1000 * 60 * 60 * 24, // 24 horas
  maxHits: 50
});

// Hook para gerenciar cache de URLs de avatar
export const useAvatarUrlCache = () => {
  const [cacheStats, setCacheStats] = useState(avatarUrlCache.getStats());

  const getCachedUrl = useCallback((key: string, generator: () => string): string => {
    const cached = avatarUrlCache.get(key);
    if (cached) {
            return cached;
    }

    const url = generator();
    avatarUrlCache.set(key, url);
        setCacheStats(avatarUrlCache.getStats());
    return url;
  }, []);

  const preloadUrls = useCallback((urls: string[]) => {
    urls.forEach(url => {
      const key = `preload_${url}`;
      if (!avatarUrlCache.has(key)) {
        avatarUrlCache.set(key, url);
      }
    });
  }, []);

  return {
    getCachedUrl,
    preloadUrls,
    cacheStats
  };
};

// Hook para cache de figuredata
export const useFigureDataCache = () => {
  const getCachedData = useCallback((key: string, generator: () => Promise<any>): Promise<any> => {
    const cached = figureDataCache.get(key);
    if (cached) {
            return Promise.resolve(cached);
    }

    return generator().then(data => {
      figureDataCache.set(key, data);
            return data;
    });
  }, []);

  return { getCachedData };
};

// Hook para otimização de renderização
export const useOptimizedAvatarRendering = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renderAvatar = useCallback(async (
    figureString: string,
    options: {
      hotel?: string;
      gender?: 'M' | 'F' | 'U';
      size?: 's' | 'l';
      direction?: number;
      headDirection?: number;
      action?: string;
      gesture?: string;
    } = {}
  ): Promise<string> => {
    const {
      hotel = 'com',
      gender = 'M',
      size = 'l',
      direction = 2,
      headDirection = 2,
      action = 'std',
      gesture = 'std'
    } = options;

    setIsLoading(true);
    setError(null);

    try {
      const cacheKey = `avatar_${figureString}_${hotel}_${gender}_${size}_${direction}_${headDirection}_${action}_${gesture}`;
      
      const url = avatarUrlCache.get(cacheKey);
      if (url) {
        setIsLoading(false);
        return url;
      }

      // Construir URL com parâmetros otimizados
      const params = new URLSearchParams({
        figure: figureString,
        gender,
        direction: direction.toString(),
        head_direction: headDirection.toString(),
        size,
        action,
        gesture,
        img_format: 'png'
      });

      const avatarUrl = `https://www.habbo.${hotel}/habbo-imaging/avatarimage?${params.toString()}`;
      
      // Validar URL fazendo uma requisição HEAD
      const response = await fetch(avatarUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Avatar URL invalid: ${response.status}`);
      }

      avatarUrlCache.set(cacheKey, avatarUrl);
      setIsLoading(false);
      
      return avatarUrl;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setIsLoading(false);
      throw err;
    }
  }, []);

  return {
    renderAvatar,
    isLoading,
    error
  };
};

// Hook para preload inteligente de imagens
export const useImagePreloader = () => {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.has(url)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, url]));
                resolve();
      };
      img.onerror = () => {
                reject(new Error('Failed to preload image'));
      };
      img.src = url;
    });
  }, [preloadedImages]);

  const preloadBatch = useCallback(async (urls: string[]): Promise<void> => {
    const promises = urls.map(url => preloadImage(url).catch(() => {}));
    await Promise.allSettled(promises);
  }, [preloadImage]);

  return {
    preloadImage,
    preloadBatch,
    preloadedImages
  };
};
