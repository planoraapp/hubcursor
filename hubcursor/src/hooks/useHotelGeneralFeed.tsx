import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

export interface HotelFeedActivity {
  username: string;
  activity: string;
  timestamp: string;
  figureString?: string;
  hotel: string;
  type: 'look_change' | 'motto_change' | 'badge' | 'friends' | 'photos' | 'groups' | 'online';
  details?: {
    newFriends?: Array<{ name: string; avatar?: string }>;
    newBadges?: Array<{ code: string; name?: string }>;
    newGroups?: Array<{ name: string; badge?: string }>;
    newPhotos?: Array<{ url: string; roomName?: string }>;
    newMotto?: string;
    previousMotto?: string;
  };
}

interface HotelFeedResponse {
  activities: HotelFeedActivity[];
  metadata: {
    source: string;
    timestamp: string;
    count: number;
    hotel: string;
  };
}

export const useHotelGeneralFeed = (options?: { 
  refreshInterval?: number; 
  limit?: number; 
}) => {
  const { habboAccount } = useUnifiedAuth();
  
  const hotel = habboAccount?.hotel === 'br' ? 'com.br' : (habboAccount?.hotel || 'com.br');
  const refreshInterval = options?.refreshInterval || 30 * 1000; // 30 segundos
  const limit = options?.limit || 20;

  const { 
    data: feedData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['hotel-general-feed', hotel, limit],
    queryFn: async (): Promise<HotelFeedResponse> => {
      console.log(`🏨 [HOTEL FEED] Buscando feed geral do hotel ${hotel}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('habbo-hotel-general-feed', {
          body: { hotel, limit }
        });

        if (error) {
          console.error('❌ [HOTEL FEED] Error:', error);
          throw new Error(error.message || 'Failed to fetch hotel feed');
        }

        if (!data) {
          console.error('❌ [HOTEL FEED] No data received');
          throw new Error('No data received from hotel feed');
        }

        console.log(`✅ [HOTEL FEED] Recebidas ${data.activities?.length || 0} atividades`);
        return data as HotelFeedResponse;

      } catch (error: any) {
        console.error('❌ [HOTEL FEED] Fetch failed:', error);
        // Fallback com atividades mock
        return {
          activities: generateMockHotelActivities(hotel, limit),
          metadata: {
            source: 'fallback',
            timestamp: new Date().toISOString(),
            count: limit,
            hotel
          }
        };
      }
    },
    enabled: !!hotel,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
    refetchInterval: refreshInterval,
  });

  const activities = feedData?.activities || [];
  const meta = feedData?.metadata;

  return {
    activities,
    meta,
    hotel,
    isLoading,
    error,
    refetch,
    isEmpty: !isLoading && activities.length === 0,
    lastUpdate: meta?.timestamp
  };
};

// Mock data generation for fallback
function generateMockHotelActivities(hotel: string, limit: number): HotelFeedActivity[] {
  const mockUsers = [
    'CoolUser123', 'HabboFan2024', 'PixelMaster', 'RoomDesigner', 'BadgeHunter',
    'SocialBee', 'GamerPro', 'FashionIcon', 'MusicLover', 'ArtisticSoul',
    'TechWiz', 'PartyKing', 'CreativeGenius', 'FriendlyUser', 'StyleGuru'
  ];

  const activities: HotelFeedActivity[] = [];
  const now = new Date();

  for (let i = 0; i < limit; i++) {
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const minutesAgo = Math.floor(Math.random() * 60) + 1; // 1-60 minutos atrás
    const timestamp = new Date(now.getTime() - minutesAgo * 60000).toISOString();

    const activityTypes = [
      {
        type: 'look_change' as const,
        activity: 'mudou o visual',
        figureString: 'lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62'
      },
      {
        type: 'motto_change' as const,
        activity: 'mudou a missão',
        details: { newMotto: 'Explorando novos horizontes!' }
      },
      {
        type: 'badge' as const,
        activity: 'conquistou um novo emblema',
        details: { newBadges: [{ code: 'ACH_BasicClub1', name: 'Clube Básico' }] }
      },
      {
        type: 'friends' as const,
        activity: 'fez novos amigos',
        details: { newFriends: [{ name: 'NovoAmigo123' }] }
      },
      {
        type: 'online' as const,
        activity: 'está online agora'
      }
    ];

    const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];

    activities.push({
      username: user,
      activity: randomActivity.activity,
      timestamp,
      figureString: randomActivity.figureString || 'lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62',
      hotel,
      type: randomActivity.type,
      details: randomActivity.details
    });
  }

  return activities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}