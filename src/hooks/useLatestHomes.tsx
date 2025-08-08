
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LatestHomeData {
  user_id: string;
  habbo_name?: string;
  updated_at: string;
  background_type?: string;
  background_value?: string;
}

export const useLatestHomes = () => {
  return useQuery({
    queryKey: ['latest-homes'],
    queryFn: async (): Promise<LatestHomeData[]> => {
      console.log('🏠 [LatestHomes] Fetching latest updated homes');
      
      // Get the 5 most recently updated homes by joining background and layout tables
      const { data: latestHomes, error } = await supabase
        .from('user_home_layouts')
        .select(`
          user_id,
          updated_at
        `)
        .order('updated_at', { ascending: false })
        .limit(100); // Get more to ensure we have enough unique users

      if (error) {
        console.error('❌ [LatestHomes] Error fetching homes:', error);
        throw error;
      }

      // Group by user_id and get the latest 5 unique users
      const uniqueUsers = new Map<string, LatestHomeData>();
      
      latestHomes?.forEach(home => {
        if (!uniqueUsers.has(home.user_id)) {
          uniqueUsers.set(home.user_id, {
            user_id: home.user_id,
            updated_at: home.updated_at
          });
        }
      });

      const latestUniqueHomes = Array.from(uniqueUsers.values())
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

      // Now fetch additional data for these users
      const userIds = latestUniqueHomes.map(home => home.user_id);
      
      // Get Habbo account names
      const { data: accounts } = await supabase
        .from('habbo_accounts')
        .select('supabase_user_id, habbo_name')
        .in('supabase_user_id', userIds);

      // Get background data
      const { data: backgrounds } = await supabase
        .from('user_home_backgrounds')
        .select('user_id, background_type, background_value')
        .in('user_id', userIds);

      // Combine the data
      const enrichedHomes = latestUniqueHomes.map(home => {
        const account = accounts?.find(acc => acc.supabase_user_id === home.user_id);
        const background = backgrounds?.find(bg => bg.user_id === home.user_id);
        
        return {
          ...home,
          habbo_name: account?.habbo_name,
          background_type: background?.background_type,
          background_value: background?.background_value
        };
      });

      console.log('✅ [LatestHomes] Found latest homes:', enrichedHomes);
      return enrichedHomes;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
