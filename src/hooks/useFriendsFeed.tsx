
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
  
  const hotelDomain = useMemo(() => {
    const h = (habboAccount as any)?.hotel as string | undefined;
    if (!h) return 'com.br';
    if (h === 'br') return 'com.br';
    if (h === 'com' || h.includes('.')) return h;
    return 'com.br';
  }, [habboAccount?.hotel]);
  
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
    queryKey: ['hotel-ticker-for-friends', hotelDomain],
    queryFn: () => habboProxyService.getHotelTicker(hotelDomain),
    enabled: friends.length > 0 && !!hotelDomain,
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });

  // Process friends activities from hotel ticker
  const friendsActivities = useMemo(() => {
    if (!friends.length || !hotelTicker.length) return [];

    console.log(`🔍 [useFriendsFeed] Processing ${friends.length} friends against ${hotelTicker.length} ticker activities`);
    
    const friendNameSet = new Set(friends.map(f => f.name.toLowerCase()));
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000; // 6 horas em vez de 30 minutos

    // Filter ticker activities for friends only
    let friendsTickerActivities = hotelTicker.filter(activity => {
      const activityTime = activity.timestamp ? 
        new Date(activity.timestamp).getTime() : 
        new Date(activity.time).getTime();
      
      return friendNameSet.has(activity.username.toLowerCase()) && 
             activityTime >= sixHoursAgo;
    });

    console.log(`📊 [useFriendsFeed] Found ${friendsTickerActivities.length} friend activities in last 6 hours`);

    // Fallback: se não houver atividades nas últimas 6 horas, pegar qualquer atividade de amigos
    if (friendsTickerActivities.length === 0) {
      friendsTickerActivities = hotelTicker.filter(activity => 
        friendNameSet.has(activity.username.toLowerCase())
      );
      console.log(`🔄 [useFriendsFeed] Fallback: Using ${friendsTickerActivities.length} activities from any time`);
    }

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
      const friend = friends.find(f => f.name.toLowerCase() === friendName.toLowerCase());
      if (!friend) return null;

      const sortedActivities = activities.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : new Date(a.time).getTime();
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : new Date(b.time).getTime();
        return timeB - timeA;
      });

      return {
        friend,
        activities: sortedActivities,
        lastActivityTime: sortedActivities[0]?.timestamp || sortedActivities[0]?.time || '',
      };
    }).filter(Boolean) as FriendActivity[];

    // Sort by most recent activity
    const sortedResult = result.sort((a, b) => {
      const timeA = new Date(a.lastActivityTime).getTime();
      const timeB = new Date(b.lastActivityTime).getTime();
      return timeB - timeA;
    });

    console.log(`✅ [useFriendsFeed] Processed ${sortedResult.length} friends with activities`);
    return sortedResult;
  }, [friends, hotelTicker]);

  return {
    friends,
    friendsActivities,
    isLoading: friendsLoading || tickerLoading,
    hasFriends: friends.length > 0,
  };
};
