
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LatestHomeData {
  user_id: string;
  habbo_name?: string;
  updated_at: string;
  background_type?: string;
  background_value?: string;
  average_rating?: number;
  ratings_count?: number;
}

export const useLatestHomes = () => {
  const queryClient = useQueryClient();

  const invalidateLatestHomes = () => {
    queryClient.invalidateQueries({ queryKey: ['latest-homes'] });
  };

  const query = useQuery({
    queryKey: ['latest-homes'],
    queryFn: async (): Promise<LatestHomeData[]> => {
            // Get the most recent homes by combining created and updated homes
      const { data: updatedHomes, error: updateError } = await supabase
        .from('user_home_layouts')
        .select(`
          user_id,
          updated_at,
          created_at
        `)
        .order('updated_at', { ascending: false })
        .limit(100);

      const { data: createdHomes, error: createError } = await supabase
        .from('user_home_backgrounds')
        .select(`
          user_id,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (updateError || createError) {
                throw updateError || createError;
      }

      // Combine and get unique users with most recent activity
      const uniqueUsers = new Map<string, LatestHomeData>();
      
      // Process updated homes
      updatedHomes?.forEach(home => {
        const lastActivity = new Date(home.updated_at).getTime();
        const existing = uniqueUsers.get(home.user_id);
        if (!existing || new Date(existing.updated_at).getTime() < lastActivity) {
          uniqueUsers.set(home.user_id, {
            user_id: home.user_id,
            updated_at: home.updated_at
          });
        }
      });

      // Process created homes
      createdHomes?.forEach(home => {
        const lastActivity = new Date(home.created_at).getTime();
        const existing = uniqueUsers.get(home.user_id);
        if (!existing || new Date(existing.updated_at).getTime() < lastActivity) {
          uniqueUsers.set(home.user_id, {
            user_id: home.user_id,
            updated_at: home.created_at // Use created_at for newly created homes
          });
        }
      });

      const latestUniqueHomes = Array.from(uniqueUsers.values())
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 8); // Increase to 8 to show more homes

      // Now fetch additional data for these users
      const userIds = latestUniqueHomes.map(home => home.user_id);
      
      // Get Habbo account names
      const { data: accounts } = await supabase
        .from('habbo_auth')
        .select('id, habbo_username')
        .in('id', userIds);

      // Get background data
      const { data: backgrounds } = await supabase
        .from('user_home_backgrounds')
        .select('user_id, background_type, background_value')
        .in('user_id', userIds);

      // Get average ratings for these homes
      const { data: ratings } = await supabase
        .from('user_home_ratings')
        .select('home_owner_user_id, rating')
        .in('home_owner_user_id', userIds);

      // Combine the data
      const enrichedHomes = latestUniqueHomes.map(home => {
        const account = accounts?.find(acc => acc.id === home.user_id);
        const background = backgrounds?.find(bg => bg.user_id === home.user_id);
        
        // Calculate average rating
        const homeRatings = ratings?.filter(r => r.home_owner_user_id === home.user_id) || [];
        const averageRating = homeRatings.length > 0 
          ? homeRatings.reduce((sum, r) => sum + r.rating, 0) / homeRatings.length 
          : 0;
        
        return {
          ...home,
          habbo_name: account?.habbo_username,
          background_type: background?.background_type,
          background_value: background?.background_value,
          average_rating: Math.round(averageRating * 10) / 10,
          ratings_count: homeRatings.length
        };
      });

            return enrichedHomes;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    ...query,
    invalidateLatestHomes
  };
};
