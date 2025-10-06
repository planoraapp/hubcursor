// Sistema de cache unificado para todos os hotéis do Habbo
class HabboCacheService {
  private cache = new Map<string, any>();
  private ttl = new Map<string, number>();
  private requestQueue = new Map<string, Promise<any>>();
  
  // TTL por tipo de dados (em milissegundos)
  private readonly CACHE_TTL = {
    user_profile: 5 * 60 * 1000,      // 5 minutos
    user_friends: 15 * 60 * 1000,     // 15 minutos
    user_groups: 30 * 60 * 1000,      // 30 minutos
    user_rooms: 60 * 60 * 1000,       // 1 hora
    user_badges: 2 * 60 * 60 * 1000,  // 2 horas
    user_achievements: 60 * 60 * 1000, // 1 hora
    user_photos: 30 * 60 * 1000,      // 30 minutos
    home_data: 2 * 60 * 1000,         // 2 minutos
    latest_homes: 30 * 1000,          // 30 segundos
  };
  
  // Hotéis suportados
  private readonly SUPPORTED_HOTELS = [
    'br', 'com', 'de', 'es', 'fi', 'fr', 'it', 'nl', 'tr'
  ];
  
  // URLs das APIs por hotel
  private readonly API_URLS = {
    br: 'https://www.habbo.com.br/api/public',
    com: 'https://www.habbo.com/api/public',
    de: 'https://www.habbo.de/api/public',
    es: 'https://www.habbo.es/api/public',
    fi: 'https://www.habbo.fi/api/public',
    fr: 'https://www.habbo.fr/api/public',
    it: 'https://www.habbo.it/api/public',
    nl: 'https://www.habbo.nl/api/public',
    tr: 'https://www.habbo.com.tr/api/public',
  };
  
  /**
   * Obter dados do cache se válidos
   */
  async getCachedData(key: string, type: keyof typeof this.CACHE_TTL): Promise<any | null> {
    const now = Date.now();
    const cached = this.cache.get(key);
    const expiry = this.ttl.get(key);
    
    if (cached && expiry && now < expiry) {
      console.log(`✅ Cache hit: ${key} (${type})`);
      return cached;
    }
    
    console.log(`❌ Cache miss: ${key} (${type})`);
    return null;
  }
  
  /**
   * Armazenar dados no cache
   */
  setCachedData(key: string, data: any, type: keyof typeof this.CACHE_TTL): void {
    this.cache.set(key, data);
    this.ttl.set(key, Date.now() + this.CACHE_TTL[type]);
    console.log(`💾 Cached: ${key} (TTL: ${this.CACHE_TTL[type]}ms)`);
  }
  
  /**
   * Limpar cache expirado
   */
  cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now >= expiry) {
        this.cache.delete(key);
        this.ttl.delete(key);}
    }
  }
  
  /**
   * Verificar se hotel é suportado
   */
  isHotelSupported(hotel: string): boolean {
    return this.SUPPORTED_HOTELS.includes(hotel);
  }
  
  /**
   * Obter URL da API para hotel específico
   */
  getApiUrl(hotel: string): string {
    return this.API_URLS[hotel as keyof typeof this.API_URLS] || this.API_URLS.com;
  }
  
  /**
   * Gerar chave de cache unificada
   */
  generateCacheKey(type: string, identifier: string, hotel: string = 'com'): string {
    return `${type}:${hotel}:${identifier}`;
  }
  
  /**
   * Fazer requisição com cache e rate limiting
   */
  async makeRequest<T>(
    type: keyof typeof this.CACHE_TTL,
    identifier: string,
    hotel: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(type, identifier, hotel);
    
    // Verificar cache primeiro
    const cached = await this.getCachedData(cacheKey, type);
    if (cached) {
      return cached;
    }
    
    // Verificar se já há uma requisição em andamento
    if (this.requestQueue.has(cacheKey)) {return this.requestQueue.get(cacheKey)!;
    }
    
    // Fazer nova requisição
    const requestPromise = this.executeRequest(cacheKey, type, requestFn);
    this.requestQueue.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }
  
  /**
   * Executar requisição com retry e rate limiting
   */
  private async executeRequest<T>(
    cacheKey: string,
    type: keyof typeof this.CACHE_TTL,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🌐 Making request: ${cacheKey} (attempt ${attempt})`);
        const result = await requestFn();
        
        // Armazenar no cache
        this.setCachedData(cacheKey, result, type);
        
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Request failed (attempt ${attempt}): ${error}`);
        
        if (attempt < maxRetries) {
          // Delay exponencial entre tentativas
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Request failed after all retries');
  }
  
  /**
   * Obter estatísticas do cache
   */
  getCacheStats(): { totalKeys: number; expiredKeys: number; memoryUsage: number } {
    const now = Date.now();
    let expiredKeys = 0;
    
    for (const [key, expiry] of this.ttl.entries()) {
      if (now >= expiry) {
        expiredKeys++;
      }
    }
    
    return {
      totalKeys: this.cache.size,
      expiredKeys,
      memoryUsage: JSON.stringify(Array.from(this.cache.values())).length
    };
  }
  
  /**
   * Limpar todo o cache
   */
  clearAllCache(): void {
    this.cache.clear();
    this.ttl.clear();
    this.requestQueue.clear();}
}

// Instância singleton
export const habboCacheService = new HabboCacheService();

// Limpar cache expirado a cada 5 minutos
setInterval(() => {
  habboCacheService.cleanExpiredCache();
}, 5 * 60 * 1000);

