import { useState, useEffect, useCallback } from 'react';
import { formatCacheKey, isValidTimestamp } from '@/utils/timestampUtils';

export interface CacheItem<T> {
  data: T;
  timestamp: string;
  expiresAt: string;
  key: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live em minutos
  maxSize?: number; // Tamanho máximo do cache
  enablePersistence?: boolean; // Persistir no localStorage
}

export const useTimestampCache = <T>(options: CacheOptions = {}) => {
  const {
    ttl = 30, // 30 minutos por padrão
    maxSize = 100,
    enablePersistence = true
  } = options;

  const [cache, setCache] = useState<Map<string, CacheItem<T>>>(new Map());

  // Carregar cache do localStorage na inicialização
  useEffect(() => {
    if (enablePersistence) {
      try {
        const stored = localStorage.getItem('timestamp-cache');
        if (stored) {
          const parsed = JSON.parse(stored);
          const cacheMap = new Map<string, CacheItem<T>>();
          
          Object.entries(parsed).forEach(([key, value]) => {
            const item = value as CacheItem<T>;
            // Verificar se o item ainda é válido
            if (new Date(item.expiresAt) > new Date()) {
              cacheMap.set(key, item);
            }
          });
          
          setCache(cacheMap);}
      } catch (error) {
        console.warn('[🗄️ CACHE] Failed to load from localStorage:', error);
      }
    }
  }, [enablePersistence]);

  // Salvar cache no localStorage quando mudar
  useEffect(() => {
    if (enablePersistence && cache.size > 0) {
      try {
        const cacheObj = Object.fromEntries(cache);
        localStorage.setItem('timestamp-cache', JSON.stringify(cacheObj));
      } catch (error) {
        console.warn('[🗄️ CACHE] Failed to save to localStorage:', error);
      }
    }
  }, [cache, enablePersistence]);

  // Limpar itens expirados
  const cleanExpiredItems = useCallback(() => {
    const now = new Date();
    setCache(prev => {
      const cleaned = new Map<string, CacheItem<T>>();
      
      prev.forEach((item, key) => {
        if (new Date(item.expiresAt) > now) {
          cleaned.set(key, item);
        }
      });
      
      if (cleaned.size !== prev.size) {}
      
      return cleaned;
    });
  }, []);

  // Adicionar item ao cache
  const set = useCallback((key: string, data: T, customTtl?: number) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (customTtl || ttl) * 60 * 1000);
    
    const item: CacheItem<T> = {
      data,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      key
    };

    setCache(prev => {
      const newCache = new Map(prev);
      
      // Verificar limite de tamanho
      if (newCache.size >= maxSize) {
        // Remover o item mais antigo
        const oldestKey = Array.from(newCache.keys())[0];
        newCache.delete(oldestKey);
      }
      
      newCache.set(key, item);
      return newCache;
    });

    console.log('[🗄️ CACHE] Set item:', key, 'expires at:', expiresAt.toISOString());
  }, [ttl, maxSize]);

  // Obter item do cache
  const get = useCallback((key: string): T | null => {
    const item = cache.get(key);
    
    if (!item) {return null;
    }

    // Verificar se expirou
    if (new Date(item.expiresAt) <= new Date()) {setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }return item.data;
  }, [cache]);

  // Verificar se item existe e é válido
  const has = useCallback((key: string): boolean => {
    const item = cache.get(key);
    if (!item) return false;
    
    return new Date(item.expiresAt) > new Date();
  }, [cache]);

  // Remover item específico
  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });}, []);

  // Limpar todo o cache
  const clear = useCallback(() => {
    setCache(new Map());
    if (enablePersistence) {
      localStorage.removeItem('timestamp-cache');
    }}, [enablePersistence]);

  // Obter estatísticas do cache
  const getStats = useCallback(() => {
    const now = new Date();
    let validItems = 0;
    let expiredItems = 0;
    
    cache.forEach(item => {
      if (new Date(item.expiresAt) > now) {
        validItems++;
      } else {
        expiredItems++;
      }
    });

    return {
      totalItems: cache.size,
      validItems,
      expiredItems,
      hitRate: 0, // Seria calculado com histórico de hits/misses
      memoryUsage: JSON.stringify(Object.fromEntries(cache)).length
    };
  }, [cache]);

  // Cache com timestamp automático
  const setWithTimestamp = useCallback((baseKey: string, data: T, timestamp?: string | number | Date) => {
    const timestampKey = timestamp ? formatCacheKey(timestamp) : formatCacheKey(new Date());
    const fullKey = `${baseKey}-${timestampKey}`;
    set(fullKey, data);
  }, [set]);

  // Obter item mais recente para uma chave base
  const getLatest = useCallback((baseKey: string): T | null => {
    const keys = Array.from(cache.keys()).filter(key => key.startsWith(baseKey));
    
    if (keys.length === 0) return null;
    
    // Ordenar por timestamp (mais recente primeiro)
    const sortedKeys = keys.sort((a, b) => {
      const timestampA = a.split('-').pop() || '';
      const timestampB = b.split('-').pop() || '';
      return timestampB.localeCompare(timestampA);
    });
    
    return get(sortedKeys[0]);
  }, [cache, get]);

  // Auto-limpeza periódica
  useEffect(() => {
    const interval = setInterval(cleanExpiredItems, 5 * 60 * 1000); // A cada 5 minutos
    return () => clearInterval(interval);
  }, [cleanExpiredItems]);

  return {
    set,
    get,
    has,
    remove,
    clear,
    getStats,
    setWithTimestamp,
    getLatest,
    cleanExpiredItems,
    size: cache.size
  };
};

