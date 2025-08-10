
import { useQuery } from '@tanstack/react-query';
import { useUnifiedAuth } from './useUnifiedAuth';
import { habboProxyService, HabboFriend, TickerActivity } from '@/services/habboProxyService';
import { useMemo } from 'react';

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

  // Fetch hotel ticker
  const { 
    data: hotelTicker = [], 
    isLoading: tickerLoading 
  } = useQuery({
    queryKey: ['hotel-ticker-for-friends'],
    queryFn: () => habboProxyService.getHotelTicker(),
    enabled: friends.length > 0,
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });

  // Process friends activities from hotel ticker
  const friendsActivities = useMemo(() => {
    if (!friends.length || !hotelTicker.length) return [];

    const friendNames = friends.map(f => f.name);
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    // Filter ticker activities for friends only
    const friendsTickerActivities = hotelTicker.filter(activity => 
      friendNames.includes(activity.username) &&
      new Date(activity.time).getTime() >= thirtyMinutesAgo
    );

    // Group activities by friend
    const friendGroups: { [friendName: string]: TickerActivity[] } = {};
    friendsTickerActivities.forEach(activity => {
      if (!friendGroups[activity.username]) {
        friendGroups[activity.username] = [];
      }
      friendGroups[activity.username].push(activity);
    });

    // Convert to FriendActivity format
    const result: FriendActivity[] = Object.entries(friendGroups).map(([friendName, activities]) => {
      const friend = friends.find(f => f.name === friendName);
      if (!friend) return null;

      const sortedActivities = activities.sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );

      return {
        friend,
        activities: sortedActivities,
        lastActivityTime: sortedActivities[0]?.time || '',
      };
    }).filter(Boolean) as FriendActivity[];

    // Sort by most recent activity
    return result.sort((a, b) => 
      new Date(b.lastActivityTime).getTime() - new Date(a.lastActivityTime).getTime()
    );
  }, [friends, hotelTicker]);

  return {
    friends,
    friendsActivities,
    isLoading: friendsLoading || tickerLoading,
    hasFriends: friends.length > 0,
  };
};
