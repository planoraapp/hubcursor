
import React from 'react';
import { habboProxyService, TickerActivity, TickerResponse } from '@/services/habboProxyService';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useOptimizedQuery } from './useOptimizedQuery';

interface AggregatedActivity {
  username: string;
  activities: TickerActivity[];
  lastActivityTime: string;
  activityCount: number;
}

export const useHotelTicker = () => {
  const { habboAccount } = useAuth();
  
  // Detectar hotel do usuário autenticado
  const hotel = React.useMemo(() => {
    const userHotel = (habboAccount as any)?.hotel as string | undefined;
    if (!userHotel) return 'com.br';
    if (userHotel === 'br') return 'com.br';
    if (userHotel === 'com' || userHotel.includes('.')) return userHotel;
    return 'com.br';
  }, [habboAccount?.hotel]);

  const { 
    data: tickerResponse, 
    isLoading, 
    error,
    refetch
  } = useOptimizedQuery({
    queryKey: ['hotel-ticker', hotel],
    queryFn: () => {
      console.log(`🎯 [useHotelTicker] Fetching ticker for hotel: ${hotel} (user: ${habboAccount?.habbo_name || 'guest'})`);
      return unifiedHabboService.getHotelTicker(hotel);
    },
    baseRefetchInterval: 30 * 1000, // 30 segundos para atualizações mais frequentes
    aggressiveCacheTime: 1 * 60 * 1000, // 1 minuto de cache
    enableRateLimit: true,
    rateLimitConfig: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests por minuto
    retry: 1
  });

  // Extract activities and metadata
  const rawActivities = tickerResponse?.activities || [];
  const metadata = tickerResponse?.meta || {
    source: 'mock' as const,
    timestamp: new Date().toISOString(),
    hotel: hotel,
    count: 0
  };

  // Aggregate activities by user with improved time window
  const aggregatedActivities: AggregatedActivity[] = React.useMemo(() => {
    console.log(`🔄 [useHotelTicker] Processing ${rawActivities.length} raw activities for aggregation (hotel: ${hotel}, source: ${metadata.source})`);
    
    if (rawActivities.length === 0) {
            return [];
    }
    
    const groupByUser = (items: TickerActivity[]) => {
      const userGroups: { [username: string]: TickerActivity[] } = {};
      items.forEach(activity => {
        if (!userGroups[activity.username]) userGroups[activity.username] = [];
        userGroups[activity.username].push(activity);
      });
      return Object.entries(userGroups).map(([username, activities]) => ({
        username,
        activities: activities.sort((a, b) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : new Date(a.time).getTime();
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : new Date(b.time).getTime();
          return timeB - timeA;
        }),
        lastActivityTime: activities[0]?.timestamp || activities[0]?.time || '',
        activityCount: activities.length,
      })).sort((a, b) => {
        const timeA = new Date(a.lastActivityTime).getTime();
        const timeB = new Date(b.lastActivityTime).getTime();
        return timeB - timeA;
      });
    };

    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const recent = rawActivities.filter(a => {
      const t = a.timestamp ? new Date(a.timestamp).getTime() : new Date(a.time).getTime();
      return t >= twoHoursAgo;
    });

    let result = groupByUser(recent);
    
    if (result.length < 8 && rawActivities.length > 0) {
            const allGrouped = groupByUser(rawActivities);
      
      // Implementar filtro de diversidade para evitar usuários repetitivos
      const diverseResult = [];
      const usedPatterns = new Set<string>();
      
      for (const group of allGrouped) {
        // Criar padrão baseado nas primeiras 3 letras para detectar similaridade
        const pattern = group.username.slice(0, 3).toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Evitar muitos usuários com padrões similares (como !!! ou 123)
        if (!usedPatterns.has(pattern) || usedPatterns.size < 10) {
          diverseResult.push(group);
          usedPatterns.add(pattern);
        }
        
        if (diverseResult.length >= 20) break;
      }
      
      result = diverseResult;
    }

    console.log(`✅ [useHotelTicker] Aggregated into ${result.length} user groups (hotel: ${hotel}, source: ${metadata.source})`);
    console.log(`📊 [useHotelTicker] Total activities: ${result.reduce((sum, group) => sum + group.activityCount, 0)}`);
    
    return result;
  }, [rawActivities, hotel, metadata.source]);

  return {
    activities: rawActivities,
    aggregatedActivities,
    isLoading,
    error,
    hotel,
    metadata,
    refetch
  };
};

