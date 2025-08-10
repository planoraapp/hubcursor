
import { useQuery } from '@tanstack/react-query';
import { useUnifiedAuth } from './useUnifiedAuth';
import { habboProxyService, HabboFriend, TickerActivity } from '@/services/habboProxyService';

interface FriendActivity {
  friend: HabboFriend;
  activities: TickerActivity[];
  lastActivityTime: string;
}

export const useFriendsFeed = () => {
  const { habboAccount } = useUnifiedAuth();
  
  // Fetch friends list
  const { 
    data: friends = [], 
    isLoading: friendsLoading 
  } = useQuery({
    queryKey: ['habbo-friends', habboAccount?.habbo_name],
    queryFn: () => habboProxyService.getUserFriends(habboAccount!.habbo_name),
    enabled: !!habboAccount?.habbo_name,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mock friends feed activities (would need real API integration)
  const { 
    data: friendsActivities = [], 
    isLoading: activitiesLoading 
  } = useQuery({
    queryKey: ['friends-feed-activities', habboAccount?.habbo_name],
    queryFn: async (): Promise<FriendActivity[]> => {
      // Mock data - in real implementation, would fetch activities for each friend
      const mockActivities: FriendActivity[] = friends.slice(0, 5).map(friend => ({
        friend,
        activities: [
          {
            type: 'login' as const,
            username: friend.name,
            time: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          }
        ],
        lastActivityTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      }));
      
      return mockActivities.sort((a, b) => 
        new Date(b.lastActivityTime).getTime() - new Date(a.lastActivityTime).getTime()
      );
    },
    enabled: friends.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    friends,
    friendsActivities,
    isLoading: friendsLoading || activitiesLoading,
    hasFriends: friends.length > 0,
  };
};
