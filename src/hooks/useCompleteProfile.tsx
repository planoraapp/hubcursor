
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
    queryKey: ['complete-profile', username, hotel],
    queryFn: async (): Promise<CompleteProfile> => {
      if (!username) throw new Error('Username is required');
      
      console.log(`[🚀 COMPLETE PROFILE] Fetching complete profile for ${username} on ${hotel}`);
      
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

      console.log(`[✅ COMPLETE PROFILE] Successfully fetched profile for ${username}`);
      console.log(`[📊 COMPLETE PROFILE] Profile stats:`, {
        level: data.stats?.level,
        badges: data.stats?.badgesCount,
        friends: data.stats?.friendsCount,
        photos: data.stats?.photosCount
      });

      return data;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
