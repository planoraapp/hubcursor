
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompleteProfileStats {
  level: number;
  levelPercent: number;
  experience: number;
  starGems: number;
  badgesCount: number;
  friendsCount: number;
  groupsCount: number;
  roomsCount: number;
  photosCount: number;
  habboTickerCount: number;
}

export interface CompleteProfileData {
  badges: any[];
  friends: any[];
  groups: any[];
  rooms: any[];
  photos: any[];
  selectedBadges: any[];
}

export interface CompleteProfile {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  lastAccessTime: string;
  memberSince: string;
  profileVisible: boolean;
  stats: CompleteProfileStats;
  data: CompleteProfileData;
}

export const useCompleteProfile = (username: string, hotel: string = 'com.br') => {
  return useQuery({
    queryKey: ['complete-profile-optimized', username, hotel],
    queryFn: async (): Promise<CompleteProfile> => {
      if (!username) throw new Error('Username is required');
      
      console.log(`[🚀 COMPLETE PROFILE] Fetching optimized profile for ${username} on ${hotel}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-complete-profile', {
        body: { username: username.trim(), hotel }
      });

      if (error) {
        console.error('[❌ COMPLETE PROFILE] Error:', error);
        throw new Error(error.message || 'Failed to fetch complete profile');
      }

      if (data.error) {
        console.error('[❌ COMPLETE PROFILE] API Error:', data.error);
        throw new Error(data.error);
      }

      console.log(`[✅ COMPLETE PROFILE] Successfully fetched optimized profile for ${username}`);
      console.log(`[📊 COMPLETE PROFILE] Profile stats:`, {
        photos: data.stats?.photosCount || 0,
        badges: data.stats?.badgesCount || 0,
        friends: data.stats?.friendsCount || 0,
        groups: data.stats?.groupsCount || 0,
        rooms: data.stats?.roomsCount || 0,
        online: data.online
      });

      return {
        uniqueId: data.uniqueId,
        name: data.name,
        figureString: data.figureString,
        motto: data.motto,
        online: data.online,
        lastAccessTime: data.lastAccessTime,
        memberSince: data.memberSince,
        profileVisible: data.profileVisible,
        stats: {
          level: data.stats?.level || 0,
          levelPercent: data.stats?.levelPercent || 0,
          experience: 0,
          starGems: data.stats?.level || 0,
          badgesCount: data.stats?.badgesCount || 0,
          friendsCount: data.stats?.friendsCount || 0, // Corrigido para mapear corretamente
          groupsCount: data.stats?.groupsCount || 0,   // Corrigido para mapear corretamente
          roomsCount: data.stats?.roomsCount || 0,     // Corrigido para mapear corretamente
          photosCount: data.stats?.photosCount || 0,
          habboTickerCount: 0
        },
        data: {
          badges: data.badges || [],
          friends: data.friends || [],     // Agora mapeia os dados reais
          groups: data.groups || [],       // Agora mapeia os dados reais
          rooms: data.rooms || [],         // Agora mapeia os dados reais
          photos: data.photos || [],
          selectedBadges: data.selectedBadges || []
        }
      };
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes - optimized for API calls
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
