
import { useQuery } from '@tanstack/react-query';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useMemo } from 'react';

interface TickerActivity {
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
  profile: {
    figureString: string;
    motto: string;
    isOnline: boolean;
    memberSince?: string;
    lastWebVisit: string;
    groupsCount: number;
    friendsCount: number;
    badgesCount: number;
    photosCount: number;
    uniqueId?: string;
  };
}

interface TickerResponse {
  success: boolean;
  hotel: string;
  activities: TickerActivity[];
  meta: {
    source: string;
    timestamp: string;
    count: number;
    onlineCount: number;
    totalAvailable?: number;
    message?: string;
  };
}

class OfficialTickerService {
  private baseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1';

  async getOfficialTicker(hotel: string = 'com.br', limit: number = 50): Promise<TickerResponse> {
    console.log(`🎯 [OfficialTicker] Fetching official ticker for hotel: ${hotel}`);
    
    const params = new URLSearchParams({ 
      hotel: hotel, 
      limit: String(limit)
    });
    
    const response = await fetch(`${this.baseUrl}/habbo-official-ticker?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log(`✅ [OfficialTicker] Received ${data.activities?.length || 0} activities from official API`);
    return data;
  }
}

const officialTickerService = new OfficialTickerService();

export const useOfficialHotelTicker = (options?: { limit?: number }) => {
  const { habboAccount } = useUnifiedAuth();
  
  const hotel = useMemo(() => {
    const userHotel = (habboAccount as any)?.hotel as string | undefined;
    if (!userHotel) return 'com.br';
    if (userHotel === 'br') return 'com.br';
    if (userHotel === 'com' || userHotel.includes('.')) return userHotel;
    return 'com.br';
  }, [habboAccount?.hotel]);

  const limit = options?.limit || 50;

  const { 
    data: tickerResponse, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['official-hotel-ticker', hotel, limit],
    queryFn: () => officialTickerService.getOfficialTicker(hotel, limit),
    refetchInterval: 30 * 1000, // Atualizar a cada 30 segundos para manter o ticker "live"
    staleTime: 15 * 1000, // 15 segundos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const activities = useMemo(() => {
    return tickerResponse?.activities || [];
  }, [tickerResponse?.activities]);

  const metadata = tickerResponse?.meta || {
    source: 'official',
    timestamp: new Date().toISOString(),
    count: 0,
    onlineCount: 0
  };

  return {
    activities,
    isLoading,
    error,
    hotel,
    metadata,
    refetch,
    success: tickerResponse?.success || false
  };
};

export type { TickerActivity };
