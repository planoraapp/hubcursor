/**
 * Sistema de Rate Limiting para prevenção de spam
 * Limita ações por usuário em um período de tempo
 */

interface RateLimitConfig {
  maxAttempts: number;  // Número máximo de tentativas
  windowMs: number;      // Janela de tempo em milissegundos
  message?: string;      // Mensagem de erro personalizada
}

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blocked Until?: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();

  /**
   * Verifica se uma ação está permitida
   * @param key Identificador único (ex: userId + action)
   * @param config Configuração do rate limit
   * @returns true se permitido, false se bloqueado
   */
  checkLimit(key: string, config: RateLimitConfig): { allowed: boolean; message?: string; retryAfter?: number } {
    const now = Date.now();
    const entry = this.attempts.get(key);

    // Verifica se está bloqueado temporariamente
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
      return {
        allowed: false,
        message: config.message || `Aguarde ${retryAfter} segundos antes de tentar novamente.`,
        retryAfter
      };
    }

    // Limpa entrada se a janela de tempo expirou
    if (entry && now - entry.firstAttempt > config.windowMs) {
      this.attempts.delete(key);
    }

    const currentEntry = this.attempts.get(key);

    if (!currentEntry) {
      // Primeira tentativa na janela
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now
      });
      return { allowed: true };
    }

    // Incrementa contador
    currentEntry.count++;

    // Verifica se excedeu o limite
    if (currentEntry.count > config.maxAttempts) {
      // Bloqueia por 2x a janela de tempo
      currentEntry.blockedUntil = now + (config.windowMs * 2);
      const retryAfter = Math.ceil((config.windowMs * 2) / 1000);
      
      return {
        allowed: false,
        message: config.message || `Muitas tentativas. Aguarde ${retryAfter} segundos.`,
        retryAfter
      };
    }

    return { allowed: true };
  }

  /**
   * Reseta o rate limit para uma chave específica
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Limpa todas as entradas expiradas (limpeza periódica)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (entry.blockedUntil && entry.blockedUntil < now) {
        this.attempts.delete(key);
      }
    }
  }
}

// Instância global
export const rateLimiter = new RateLimiter();

// Configurações pré-definidas para diferentes ações
export const RATE_LIMITS = {
  // Chat: 10 mensagens por minuto
  CHAT_MESSAGE: {
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minuto
    message: '⏱️ Você está enviando mensagens muito rápido. Aguarde um momento.'
  },
  
  // Bloqueio de usuários: 5 ações por minuto
  USER_BLOCK: {
    maxAttempts: 5,
    windowMs: 60 * 1000,
    message: '⏱️ Aguarde antes de bloquear mais usuários.'
  },
  
  // Denúncias: 3 por 5 minutos
  REPORT_MESSAGE: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000, // 5 minutos
    message: '⏱️ Aguarde antes de fazer mais denúncias.'
  },
  
  // Busca de usuários: 20 por minuto
  USER_SEARCH: {
    maxAttempts: 20,
    windowMs: 60 * 1000,
    message: '⏱️ Muitas buscas. Aguarde um momento.'
  },
  
  // Login: 5 tentativas por 15 minutos
  LOGIN_ATTEMPT: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    message: '🔒 Muitas tentativas de login. Tente novamente em alguns minutos.'
  }
};

// Limpeza automática a cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

export default rateLimiter;

