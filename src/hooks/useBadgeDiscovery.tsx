
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BadgeDiscoveryResult {
  usersFound: number;
  badgesFound: number;
  errors: string[];
  processingTime: number;
}

interface BadgeDiscoveryResponse {
  success: boolean;
  hotel: string;
  badgeCode: string;
  result: BadgeDiscoveryResult;
  timestamp: string;
}

export const useBadgeDiscovery = () => {
  const queryClient = useQueryClient();

  const discoveryMutation = useMutation({
    mutationFn: async ({ 
      hotel = 'com.br', 
      badgeCode = 'ACH_Tutorial1', 
      limit = 100 
    }: { 
      hotel?: string; 
      badgeCode?: string; 
      limit?: number; 
    }) => {
            const { data, error } = await supabase.functions.invoke('habbo-unified-api', {
        body: { 
          endpoint: 'badges',
          action: 'discover',
          params: { hotel, badge: badgeCode, limit }
        }
      });

      if (error) {
                throw new Error(`Badge discovery failed: ${error.message}`);
      }

            return data as BadgeDiscoveryResponse;
    },
    onSuccess: (data) => {
      const { result } = data;
      
      toast.success(
        `Descoberta concluída! ${result.usersFound} usuários e ${result.badgesFound} emblemas encontrados`,
        {
          description: `Processado em ${result.processingTime}ms`,
        }
      );

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['tracked-users'] });
      queryClient.invalidateQueries({ queryKey: ['habbo-badges'] });
      queryClient.invalidateQueries({ queryKey: ['real-hotel-feed'] });
      queryClient.invalidateQueries({ queryKey: ['activity-detector'] });
    },
    onError: (error) => {
            toast.error('Erro na descoberta de usuários', {
        description: error.message,
      });
    },
  });

  // Query to get discovery statistics
  const { data: discoveryStats, isLoading: statsLoading } = useQuery({
    queryKey: ['discovery-stats'],
    queryFn: async () => {
            const [trackedUsersQuery, badgesQuery, activitiesQuery] = await Promise.all([
        supabase.from('tracked_habbo_users').select('id', { count: 'exact' }),
        supabase.from('habbo_badges').select('id', { count: 'exact' }),
        supabase.from('habbo_activities').select('id', { count: 'exact' })
      ]);

      return {
        totalTrackedUsers: trackedUsersQuery.count || 0,
        totalBadges: badgesQuery.count || 0,
        totalActivities: activitiesQuery.count || 0,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    startDiscovery: discoveryMutation.mutate,
    isDiscovering: discoveryMutation.isPending,
    discoveryResult: discoveryMutation.data,
    discoveryStats,
    statsLoading,
  };
};
