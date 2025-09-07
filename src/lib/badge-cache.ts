/**
 * Sistema de Cache Inteligente para Emblemas
 * Gerencia cache em memória e localStorage para otimizar carregamento
 */

import { Badge } from './supabase-badges';

interface CacheEntry {
  data: Badge[];
  timestamp: number;
  version: string;
}

interface BadgeImageCache {
  [code: string]: {
    loaded: boolean;
    error: boolean;
    timestamp: number;
  };
}

class BadgeCacheManager {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private imageCache: BadgeImageCache = {};
  private readonly CACHE_VERSION = '1.0.0';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private readonly IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

  constructor() {
    this.loadImageCacheFromStorage();
  }

  /**
   * Verifica se o cache é válido
   */
  private isCacheValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < this.CACHE_DURATION && entry.version === this.CACHE_VERSION;
  }

  /**
   * Salva dados no cache
   */
  setCache(key: string, data: Badge[]): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      version: this.CACHE_VERSION
    };
    
    this.memoryCache.set(key, entry);
    
    // Salvar no localStorage para persistência
    try {
      localStorage.setItem(`badge_cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Erro ao salvar cache no localStorage:', error);
    }
  }

  /**
   * Recupera dados do cache
   */
  getCache(key: string): Badge[] | null {
    // Primeiro tenta memória
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isCacheValid(memoryEntry)) {
      return memoryEntry.data;
    }

    // Depois tenta localStorage
    try {
      const stored = localStorage.getItem(`badge_cache_${key}`);
      if (stored) {
        const entry: CacheEntry = JSON.parse(stored);
        if (this.isCacheValid(entry)) {
          // Atualizar cache em memória
          this.memoryCache.set(key, entry);
          return entry.data;
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar cache do localStorage:', error);
    }

    return null;
  }

  /**
   * Limpa cache expirado
   */
  clearExpiredCache(): void {
    const now = Date.now();
    
    // Limpar memória
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isCacheValid(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Limpar localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('badge_cache_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            if (!this.isCacheValid(entry)) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar cache expirado:', error);
    }
  }

  /**
   * Gerencia cache de imagens
   */
  setImageLoaded(code: string, loaded: boolean, error: boolean = false): void {
    this.imageCache[code] = {
      loaded,
      error,
      timestamp: Date.now()
    };
    
    // Salvar no localStorage
    try {
      localStorage.setItem('badge_image_cache', JSON.stringify(this.imageCache));
    } catch (error) {
      console.warn('Erro ao salvar cache de imagens:', error);
    }
  }

  /**
   * Verifica se imagem já foi carregada
   */
  isImageLoaded(code: string): boolean {
    const entry = this.imageCache[code];
    if (!entry) return false;
    
    const now = Date.now();
    const isExpired = (now - entry.timestamp) > this.IMAGE_CACHE_DURATION;
    
    if (isExpired) {
      delete this.imageCache[code];
      return false;
    }
    
    return entry.loaded && !entry.error;
  }

  /**
   * Verifica se imagem teve erro
   */
  isImageError(code: string): boolean {
    const entry = this.imageCache[code];
    if (!entry) return false;
    
    const now = Date.now();
    const isExpired = (now - entry.timestamp) > this.IMAGE_CACHE_DURATION;
    
    if (isExpired) {
      delete this.imageCache[code];
      return false;
    }
    
    return entry.error;
  }

  /**
   * Carrega cache de imagens do localStorage
   */
  private loadImageCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem('badge_image_cache');
      if (stored) {
        this.imageCache = JSON.parse(stored);
        
        // Limpar entradas expiradas
        const now = Date.now();
        Object.keys(this.imageCache).forEach(code => {
          const entry = this.imageCache[code];
          if ((now - entry.timestamp) > this.IMAGE_CACHE_DURATION) {
            delete this.imageCache[code];
          }
        });
      }
    } catch (error) {
      console.warn('Erro ao carregar cache de imagens:', error);
      this.imageCache = {};
    }
  }

  /**
   * Limpa todo o cache
   */
  clearAllCache(): void {
    this.memoryCache.clear();
    this.imageCache = {};
    
    try {
      // Limpar localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('badge_cache_') || key === 'badge_image_cache') {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar cache completo:', error);
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): {
    memoryEntries: number;
    imageEntries: number;
    memorySize: number;
  } {
    let memorySize = 0;
    for (const entry of this.memoryCache.values()) {
      memorySize += JSON.stringify(entry).length;
    }

    return {
      memoryEntries: this.memoryCache.size,
      imageEntries: Object.keys(this.imageCache).length,
      memorySize
    };
  }
}

// Instância singleton
export const badgeCache = new BadgeCacheManager();

// Limpar cache expirado na inicialização
badgeCache.clearExpiredCache();

// Limpar cache expirado a cada hora
setInterval(() => {
  badgeCache.clearExpiredCache();
}, 60 * 60 * 1000);
