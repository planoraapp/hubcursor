
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicHabboProfile {
  supabase_user_id: string | null;
  habbo_name: string;
  habbo_id: string | null;
  hotel: string | null;
  figure_string: string | null;
  motto: string | null;
  is_online: boolean | null;
  created_at: string | null;
  last_updated: string | null;
}

const normalizeHotel = (hotel?: string | null) => {
  if (!hotel) return null;
  return hotel === 'com.br' ? 'br' : hotel;
};

export const usePublicHabboProfile = (username?: string, targetHotel?: string) => {
  return useQuery<PublicHabboProfile | null>({
    queryKey: ['public-habbo-profile', username?.toLowerCase() || '', targetHotel || ''],
    queryFn: async () => {
      if (!username) return null;

      console.log(`🔎 [usePublicHabboProfile] Loading public habbo for ${username} (${targetHotel || 'any hotel'})`);
      const { data, error } = await supabase.rpc('get_habbo_account_public_by_name', {
        habbo_name_param: username,
      });

      if (error) {
        console.error('❌ [usePublicHabboProfile] RPC error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ [usePublicHabboProfile] No data found for user');
        return null;
      }

      // RPC returns a "table" - in PostgREST it will be an array
      const row = data[0] as any;
      const profile: PublicHabboProfile = {
        supabase_user_id: row.supabase_user_id || null,
        habbo_name: row.habbo_name || username,
        habbo_id: row.habbo_id || null,
        hotel: row.hotel || null,
        figure_string: row.figure_string || null,
        motto: row.motto || null,
        is_online: row.is_online ?? null,
        created_at: row.created_at || null,
        last_updated: row.last_updated || null,
      };

      // If the caller specifies a target hotel and RPC returns a different one, just pass through
      const rpcHotel = normalizeHotel(profile.hotel);
      const target = normalizeHotel(targetHotel || null);
      if (target && rpcHotel && rpcHotel !== target) {
        console.log(`⚠️ [usePublicHabboProfile] Hotel mismatch: rpc=${rpcHotel}, target=${target}`);
      }

      console.log('✅ [usePublicHabboProfile] Loaded:', {
        name: profile.habbo_name,
        hotel: profile.hotel,
        hasId: !!profile.habbo_id,
      });

      return profile;
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
};
