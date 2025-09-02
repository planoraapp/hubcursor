
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useMemo } from 'react';

interface OfficialTickerResponse {
  success: boolean;
  hotel: string;
  activities: Array<{
    username: string;
    lastUpdate: string;
    counts: {
      groups: number;
      friends: number;
      badges: number;
      avatarChanged: boolean;
      mottoChanged: boolean;
    };
    groups: Array<{ name: string; badgeCode: string }>;
    friends: Array<{ name: string; figureString?: string }>;
    badges: Array<{ code: string; name?: string }>;
    photos: Array<{ url: string; caption?: string; id?: string }>;
    description: string;
    profile?: {
      figureString?: string;
      motto?: string;
      isOnline?: boolean;
      memberSince?: string;
      lastWebVisit?: string;
      groupsCount?: number;
      friendsCount?: number;
      badgesCount?: number;
      photosCount?: number;
    };
  }>;
  meta: {
    source: 'official' | 'database';
    timestamp: string;
    count: number;
    onlineCount: number;
    message?: string;
  };
}

export const useOfficialHotelTicker = (options?: { limit?: number }) => {
  const { habboAccount } = useUnifiedAuth();
  
  const hotel = useMemo(() => {
    const userHotel = habboAccount?.hotel;
    if (!userHotel) return 'com.br';
    if (userHotel === 'br') return 'com.br';
    return userHotel;
  }, [habboAccount?.hotel]);

  const limit = options?.limit || 50;

  const { 
    data: response, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['official-hotel-ticker', hotel, limit],
    queryFn: async (): Promise<OfficialTickerResponse> => {
      console.log(`📡 [useOfficialHotelTicker] Fetching from official ticker for ${hotel}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-official-ticker', {
        body: { hotel, limit }
      });

      if (error) {
        console.error(`❌ [useOfficialHotelTicker] Error:`, error);
        throw new Error(`Failed to fetch official ticker: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to fetch official ticker data');
      }

      console.log(`✅ [useOfficialHotelTicker] Retrieved ${data.activities?.length || 0} activities`);
      return data;
    },
    enabled: true,
    refetchInterval: 30 * 1000, // 30 segundos
    staleTime: 25 * 1000, // 25 segundos
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    activities: response?.activities || [],
    isLoading,
    error,
    hotel,
    metadata: response?.meta || {
      source: 'official' as const,
      timestamp: new Date().toISOString(),
      count: 0,
      onlineCount: 0
    },
    success: response?.success || false,
    refetch
  };
};
