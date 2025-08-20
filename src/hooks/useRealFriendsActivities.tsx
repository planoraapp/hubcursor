
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';
import { useDebounce } from './useRateLimit';

export interface RealFriendActivity {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  activity_type: string;
  activity_description: string;
  old_data?: any;
  new_data: any;
  detected_at: string;
  created_at: string;
}

export const useRealFriendsActivities = () => {
  const { habboAccount } = useAuth();

  // Cache agressivo para lista de amigos (muda pouco)
  const { data: friends = [] } = useOptimizedQuery({
    queryKey: ['habbo-friends-for-activities', habboAccount?.habbo_name],
    queryFn: async () => {
      if (!habboAccount?.habbo_name) return [];
      
      const hotel = (habboAccount as any)?.hotel || 'br';
      const domain = hotel === 'br' ? 'com.br' : hotel;
      
      try {
        const userResponse = await fetch(`https://www.habbo.${domain}/api/public/users?name=${habboAccount.habbo_name}`);
        if (!userResponse.ok) return [];
        
        const userProfile = await userResponse.json();
        if (!userProfile?.uniqueId) return [];

        const friendsResponse = await fetch(`https://www.habbo.${domain}/api/public/users/${userProfile.uniqueId}/friends`);
        if (!friendsResponse.ok) return [];
        
        const friendsData = await friendsResponse.json();
        return friendsData.map((f: any) => f.name.toLowerCase());
      } catch (error) {
        console.error('Error fetching friends for activities:', error);
        return [];
      }
    },
    enabled: !!habboAccount?.habbo_name,
    baseRefetchInterval: 10 * 60 * 1000, // 10 minutos (amigos mudam pouco)
    aggressiveCacheTime: 30 * 60 * 1000, // 30 minutos de cache
    enableRateLimit: true,
    rateLimitConfig: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests por minuto
  });

  // Atividades dos amigos com controle otimizado
  const { 
    data: activitiesData = [], 
    isLoading,
    refetch 
  } = useOptimizedQuery({
    queryKey: ['real-friends-activities', friends],
    queryFn: async (): Promise<RealFriendActivity[]> => {
      if (friends.length === 0) return [];

      console.log(`🔍 [useRealFriendsActivities] Fetching activities for ${friends.length} friends`);

      const { data, error } = await supabase
        .from('friends_activities')
        .select('id, habbo_name, activity_type, activity_description, new_data, detected_at, created_at') // Select específico
        .in('habbo_name', friends.map(f => typeof f === 'string' ? f : f.toLowerCase()))
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(30); // Reduzido de 50 para 30

      if (error) {
        console.error('Error fetching friends activities:', error);
        throw error;
      }

      console.log(`✅ [useRealFriendsActivities] Found ${data.length} activities`);
      return data || [];
    },
    enabled: friends.length > 0,
    baseRefetchInterval: 5 * 60 * 1000, // 5 minutos (era 60s)
    aggressiveCacheTime: 10 * 60 * 1000, // 10 minutos de cache
    enableRateLimit: true,
    rateLimitConfig: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 requests por minuto
  });

  // Activity tracker com debounce e rate limiting mais rigoroso
  const debouncedTriggerTracker = useDebounce(async () => {
    if (!habboAccount?.habbo_name) return null;

    try {
      const { data, error } = await supabase.functions.invoke('habbo-friends-activity-tracker', {
        body: { 
          username: habboAccount.habbo_name,
          hotel: (habboAccount as any)?.hotel || 'br'
        }
      });

      if (error) {
        console.error('Activity tracker error:', error);
        return null;
      }

      console.log('Activity tracker result:', data);
      return data;
    } catch (error) {
      console.error('Failed to trigger activity tracker:', error);
      return null;
    }
  }, 2000); // 2 seconds debounce

  const { data: trackerResult } = useOptimizedQuery({
    queryKey: ['trigger-activity-tracker', habboAccount?.habbo_name],
    queryFn: debouncedTriggerTracker,
    enabled: !!habboAccount?.habbo_name,
    baseRefetchInterval: 30 * 60 * 1000, // 30 minutos (era 10 minutos)
    aggressiveCacheTime: 60 * 60 * 1000, // 1 hora de cache
    enableRateLimit: true,
    rateLimitConfig: { maxRequests: 5, windowMs: 60 * 1000 }, // Apenas 5 requests por minuto
  });

  return {
    activities: activitiesData,
    isLoading,
    refetch,
    trackerResult
  };
};
