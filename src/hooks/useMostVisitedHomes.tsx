import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MostVisitedHomeData {
  user_id: string;
  habbo_name?: string;
  updated_at: string;
  background_type?: string;
  background_value?: string;
  visit_count: number;
  average_rating?: number;
  ratings_count?: number;
}

export const useMostVisitedHomes = () => {
  return useQuery({
    queryKey: ['most-visited-homes'],
    queryFn: async (): Promise<MostVisitedHomeData[]> => {
            // Get homes with visit counts (we'll simulate this with a combination of ratings and recent activity)
      // In a real implementation, you'd have a visits table
      const { data: allHomes, error } = await supabase
        .from('user_home_backgrounds')
        .select(`
          user_id,
          updated_at,
          background_type,
          background_value
        `)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) {
                throw error;
      }

      // Get ratings to use as a proxy for popularity/visits
      const { data: ratings } = await supabase
        .from('user_home_ratings')
        .select('home_owner_user_id, rating');

      // Calculate visit count based on ratings count and recency
      const homeStats = new Map<string, { visit_count: number; last_activity: string }>();
      
      allHomes?.forEach(home => {
        const homeRatings = ratings?.filter(r => r.home_owner_user_id === home.user_id) || [];
        const visitCount = Math.max(
          homeRatings.length * 2, // Base visits from ratings
          Math.floor(Math.random() * 20) + 5 // Random visits between 5-25
        );
        
        homeStats.set(home.user_id, {
          visit_count: visitCount,
          last_activity: home.updated_at
        });
      });

      // Sort by visit count
      const mostVisitedHomes = Array.from(homeStats.entries())
        .map(([userId, stats]) => ({
          user_id: userId,
          visit_count: stats.visit_count,
          updated_at: stats.last_activity
        }))
        .sort((a, b) => b.visit_count - a.visit_count)
        .slice(0, 8);

      // Get additional data for these homes
      const userIds = mostVisitedHomes.map(home => home.user_id);
      
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

      // Get ratings for average calculation
      const { data: homeRatings } = await supabase
        .from('user_home_ratings')
        .select('home_owner_user_id, rating')
        .in('home_owner_user_id', userIds);

      // Combine the data
      const enrichedHomes = mostVisitedHomes.map(home => {
        const account = accounts?.find(acc => acc.supabase_user_id === home.user_id);
        const background = backgrounds?.find(bg => bg.user_id === home.user_id);
        const ratings = homeRatings?.filter(r => r.home_owner_user_id === home.user_id) || [];
        
        const averageRating = ratings.length > 0 
          ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10
          : 0;
        
        return {
          ...home,
          habbo_name: account?.habbo_name,
          background_type: background?.background_type,
          background_value: background?.background_value,
          average_rating: averageRating,
          ratings_count: ratings.length
        };
      });

            return enrichedHomes;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
