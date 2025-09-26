import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { usePageVisibility } from './usePageVisibility';
import { useRateLimit } from './useRateLimit';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'refetchInterval' | 'enabled'> {
  baseRefetchInterval?: number | false; // false = desabilita polling
  aggressiveCacheTime?: number;
  enableRateLimit?: boolean;
  rateLimitConfig?: {
    maxRequests: number;
    windowMs: number;
  };
  enableVisibilityControl?: boolean;
  enabled?: boolean;
  onDemandOnly?: boolean; // Nova opção para modo on-demand apenas
}

export const useOptimizedQuery = <T,>(
  options: OptimizedQueryOptions<T>
) => {
  const { isVisible, isRecentlyActive } = usePageVisibility();
  const {
    baseRefetchInterval = false, // Desabilita polling por padrão 
    aggressiveCacheTime = 15 * 60 * 1000, // Reduzido para 15 minutos 
    enableRateLimit = true,
    rateLimitConfig = { maxRequests: 120, windowMs: 60 * 1000 }, // 120 requests por minuto
    enableVisibilityControl = false, // Desabilita controle de visibilidade
    enabled = true,
    onDemandOnly = true, // Modo on-demand por padrão
    ...queryOptions
  } = options;

  const rateLimit = useRateLimit(rateLimitConfig);

  // Configurações para modo on-demand
  const dynamicRefetchInterval = onDemandOnly 
    ? false // Desabilita polling em modo on-demand
    : (enableVisibilityControl 
      ? (isVisible ? baseRefetchInterval : (baseRefetchInterval as number) * 5)
      : baseRefetchInterval);

  const shouldEnable = enabled && (!enableRateLimit || rateLimit.canMakeRequest());

  const query = useQuery({
    ...queryOptions,
    enabled: shouldEnable,
    refetchInterval: dynamicRefetchInterval,
    staleTime: onDemandOnly ? 15 * 60 * 1000 : aggressiveCacheTime / 2, // Reduzido para 15 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos cache
    refetchOnWindowFocus: false, // Desabilita refresh automático no foco
    refetchOnReconnect: false, // Desabilita refresh automático na reconexão
    retry: (failureCount, error) => {
      if (enableRateLimit && !rateLimit.canMakeRequest()) {
                return false;
      }
      return failureCount < 2;
    },
  });

  // Função de refresh forçado que ignora cache
  const forceRefresh = () => {
        return query.refetch({ cancelRefetch: true });
  };

  return {
    ...query,
    forceRefresh
  };
};