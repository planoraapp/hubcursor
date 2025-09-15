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
      // Get homes with actual visit counts from user_home_visits table
      const { data: visitStats, error: visitError } = await supabase
        .from('user_home_visits')
        .select(`
          home_owner_user_id,
          visited_at
        `);

      if (visitError) {
        throw visitError;
      }

      // Count visits per home
      const homeVisitCounts = new Map<string, { count: number; last_visit: string }>();
      
      visitStats?.forEach(visit => {
        const existing = homeVisitCounts.get(visit.home_owner_user_id);
        const count = existing ? existing.count + 1 : 1;
        const lastVisit = existing 
          ? (new Date(visit.visited_at) > new Date(existing.last_visit) ? visit.visited_at : existing.last_visit)
          : visit.visited_at;
        
        homeVisitCounts.set(visit.home_owner_user_id, {
          count,
          last_visit: lastVisit
        });
      });

      // Sort by visit count and get top 8
      const mostVisitedHomes = Array.from(homeVisitCounts.entries())
        .map(([userId, stats]) => ({
          user_id: userId,
          visit_count: stats.count,
          updated_at: stats.last_visit
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
