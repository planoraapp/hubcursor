import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface SimpleQueryOptions<T> extends Omit<UseQueryOptions<T>, 'refetchInterval' | 'enabled'> {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
  retry?: number;
}

export const useOptimizedQuery = <T,>(
  options: SimpleQueryOptions<T>
) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutos
    refetchInterval = false, // Sem polling automático
    retry = 2,
    ...queryOptions
  } = options;

  const query = useQuery({
    ...queryOptions,
    enabled,
    staleTime,
    refetchInterval,
    retry,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Função de refresh forçado
  const forceRefresh = () => {
    return query.refetch({ cancelRefetch: true });
  };

  return {
    ...query,
    forceRefresh
  };
};