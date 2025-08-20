
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { usePageVisibility } from './usePageVisibility';
import { useRateLimit } from './useRateLimit';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'refetchInterval' | 'enabled'> {
  baseRefetchInterval?: number;
  aggressiveCacheTime?: number;
  enableRateLimit?: boolean;
  rateLimitConfig?: {
    maxRequests: number;
    windowMs: number;
  };
  enableVisibilityControl?: boolean;
  enabled?: boolean;
}

export const useOptimizedQuery = <T,>(
  options: OptimizedQueryOptions<T>
) => {
  const { isVisible, isRecentlyActive } = usePageVisibility();
  const {
    baseRefetchInterval = 60000, // 1 minuto padrão
    aggressiveCacheTime = 10 * 60 * 1000, // 10 minutos
    enableRateLimit = true,
    rateLimitConfig = { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests por minuto
    enableVisibilityControl = true,
    enabled = true,
    ...queryOptions
  } = options;

  const rateLimit = useRateLimit(rateLimitConfig);

  // Configurações dinâmicas baseadas na visibilidade
  const dynamicRefetchInterval = enableVisibilityControl 
    ? (isVisible ? baseRefetchInterval : baseRefetchInterval * 5) // 5x mais lento quando não visível
    : baseRefetchInterval;

  const shouldEnable = enabled && (enableVisibilityControl 
    ? isRecentlyActive && (!enableRateLimit || rateLimit.canMakeRequest())
    : (!enableRateLimit || rateLimit.canMakeRequest()));

  return useQuery({
    ...queryOptions,
    enabled: shouldEnable,
    refetchInterval: dynamicRefetchInterval,
    staleTime: aggressiveCacheTime / 2, // Cache considera stale na metade do tempo
    gcTime: aggressiveCacheTime, // Garbage collection mais agressiva
    refetchOnWindowFocus: enableVisibilityControl ? isVisible : false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Rate limit mais conservador em caso de erro
      if (enableRateLimit && !rateLimit.canMakeRequest()) {
        console.warn(`[useOptimizedQuery] Rate limit reached, skipping retry`);
        return false;
      }
      return failureCount < 2;
    },
  });
};
