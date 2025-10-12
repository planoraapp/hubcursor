import { useState, useCallback, useRef } from 'react';

interface RateLimitConfig {
  maxActions: number; // Máximo de ações permitidas
  windowMs: number;   // Janela de tempo em milissegundos
  minInterval?: number; // Intervalo mínimo entre ações (ms)
}

interface RateLimitResult {
  canPerform: boolean;
  remainingActions: number;
  nextAvailableTime?: Date;
  error?: string;
}

/**
 * Hook para implementar rate limiting
 * Previne spam e abuso de funcionalidades
 */
export const useRateLimit = (config: RateLimitConfig) => {
  const [actionTimestamps, setActionTimestamps] = useState<number[]>([]);
  const lastActionRef = useRef<number>(0);

  const checkRateLimit = useCallback((): RateLimitResult => {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Limpar timestamps antigos
    const recentActions = actionTimestamps.filter(timestamp => timestamp > windowStart);

    // Verificar intervalo mínimo entre ações
    if (config.minInterval) {
      const timeSinceLastAction = now - lastActionRef.current;
      if (lastActionRef.current > 0 && timeSinceLastAction < config.minInterval) {
        const waitTime = config.minInterval - timeSinceLastAction;
        return {
          canPerform: false,
          remainingActions: config.maxActions - recentActions.length,
          nextAvailableTime: new Date(now + waitTime),
          error: `Aguarde ${Math.ceil(waitTime / 1000)} segundos antes de enviar outro comentário`
        };
      }
    }

    // Verificar limite de ações na janela de tempo
    if (recentActions.length >= config.maxActions) {
      const oldestAction = Math.min(...recentActions);
      const resetTime = oldestAction + config.windowMs;
      const waitTime = resetTime - now;
      
      return {
        canPerform: false,
        remainingActions: 0,
        nextAvailableTime: new Date(resetTime),
        error: `Limite de ${config.maxActions} ações excedido. Aguarde ${Math.ceil(waitTime / 1000)} segundos.`
      };
    }

    return {
      canPerform: true,
      remainingActions: config.maxActions - recentActions.length - 1
    };
  }, [actionTimestamps, config]);

  const recordAction = useCallback(() => {
    const now = Date.now();
    lastActionRef.current = now;
    setActionTimestamps(prev => {
      const windowStart = now - config.windowMs;
      return [...prev.filter(ts => ts > windowStart), now];
    });
  }, [config.windowMs]);

  const reset = useCallback(() => {
    setActionTimestamps([]);
    lastActionRef.current = 0;
  }, []);

  return {
    checkRateLimit,
    recordAction,
    reset
  };
};

