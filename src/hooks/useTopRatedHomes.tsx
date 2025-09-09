import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TopRatedHomeData {
  user_id: string;
  habbo_name?: string;
  updated_at: string;
  background_type?: string;
  background_value?: string;
  average_rating: number;
  ratings_count: number;
}

export const useTopRatedHomes = () => {
  return useQuery({
    queryKey: ['top-rated-homes'],
    queryFn: async (): Promise<TopRatedHomeData[]> => {
      console.log('⭐ [TopRatedHomes] Fetching top rated homes');
      
      // Get homes with ratings, ordered by average rating
      const { data: ratedHomes, error } = await supabase
        .from('user_home_ratings')
        .select(`
          home_owner_user_id,
          rating
        `);

      if (error) {
        console.error('❌ [TopRatedHomes] Error fetching ratings:', error);
        throw error;
      }

      // Calculate average ratings per home
      const homeRatings = new Map<string, { total: number; count: number }>();
      
      ratedHomes?.forEach(rating => {
        const existing = homeRatings.get(rating.home_owner_user_id);
        if (existing) {
          existing.total += rating.rating;
          existing.count += 1;
        } else {
          homeRatings.set(rating.home_owner_user_id, {
            total: rating.rating,
            count: 1
          });
        }
      });

      // Convert to array and sort by average rating
      const topRatedHomes = Array.from(homeRatings.entries())
        .map(([userId, data]) => ({
          user_id: userId,
          average_rating: Math.round((data.total / data.count) * 10) / 10,
          ratings_count: data.count
        }))
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 8);

      // Get additional data for these homes
      const userIds = topRatedHomes.map(home => home.user_id);
      
      // Get Habbo account names
      const { data: accounts } = await supabase
        .from('habbo_accounts')
        .select('supabase_user_id, habbo_name')
        .in('supabase_user_id', userIds);

      // Get background data
      const { data: backgrounds } = await supabase
        .from('user_home_backgrounds')
        .select('user_id, background_type, background_value, updated_at')
        .in('user_id', userIds);

      // Combine the data
      const enrichedHomes = topRatedHomes.map(home => {
        const account = accounts?.find(acc => acc.supabase_user_id === home.user_id);
        const background = backgrounds?.find(bg => bg.user_id === home.user_id);
        
        return {
          ...home,
          habbo_name: account?.habbo_name,
          background_type: background?.background_type,
          background_value: background?.background_value,
          updated_at: background?.updated_at || new Date().toISOString()
        };
      });

      console.log('✅ [TopRatedHomes] Found top rated homes:', enrichedHomes);
      return enrichedHomes;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
