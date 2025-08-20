import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { habboProxyService, HabboFriend, TickerActivity } from '@/services/habboProxyService';
import { useRealFriendsActivities, RealFriendActivity } from './useRealFriendsActivities';
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FriendActivity {
  friend: HabboFriend;
  activities: (TickerActivity | RealFriendActivity)[];
  lastActivityTime: string;
  activityType: 'real' | 'ticker';
}

export const useFriendsFeed = () => {
  const { habboAccount } = useAuth();
  
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
    queryFn: async () => {
      if (!habboAccount?.habbo_name) return [];
      
      console.log(`[useFriendsFeed] Fetching friends for ${habboAccount.habbo_name}`);
      const friendsData = await habboProxyService.getUserFriends(habboAccount.habbo_name, hotelDomain);
      console.log(`[useFriendsFeed] Retrieved ${friendsData.length} friends:`, friendsData);
      return friendsData;
    },
    enabled: !!habboAccount?.habbo_name,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch hotel ticker
  const { 
    data: tickerResponse, 
    isLoading: tickerLoading 
  } = useQuery({
    queryKey: ['hotel-ticker-for-friends', hotelDomain],
    queryFn: () => habboProxyService.getHotelTicker(hotelDomain),
    enabled: friends.length > 0 && !!hotelDomain,
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });

  const hotelTicker = tickerResponse?.activities || [];

  // Get real friends activities
  const { activities: realActivities, isLoading: realActivitiesLoading } = useRealFriendsActivities();

  // Process friends activities (combine real activities with ticker)
  const friendsActivities = useMemo(() => {
    if (!friends.length) {
      console.log(`[useFriendsFeed] No friends to process`);
      return [];
    }

    console.log(`🔍 [useFriendsFeed] Processing ${friends.length} friends with ${realActivities.length} real activities`);
    
    const friendNameSet = new Set(friends.map(f => f.name.toLowerCase()));
    
    // Group real activities by friend
    const realActivityGroups: { [friendName: string]: RealFriendActivity[] } = {};
    realActivities.forEach(activity => {
      const friendName = activity.habbo_name.toLowerCase();
      if (friendNameSet.has(friendName)) {
        if (!realActivityGroups[friendName]) {
          realActivityGroups[friendName] = [];
        }
        realActivityGroups[friendName].push(activity);
      }
    });

    // Create FriendActivity objects from real activities
    const result: FriendActivity[] = Object.entries(realActivityGroups).map(([friendName, activities]) => {
      const friend = friends.find(f => f.name.toLowerCase() === friendName);
      if (!friend) return null;

      const sortedActivities = activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return {
        friend,
        activities: sortedActivities,
        lastActivityTime: sortedActivities[0]?.created_at || new Date().toISOString(),
        activityType: 'real' as const
      };
    }).filter(Boolean) as FriendActivity[];

    // Only show friends with actual activities
    const allResults = result;

    // Sort by most recent activity
    const sortedResult = allResults.sort((a, b) => {
      const timeA = new Date(a.lastActivityTime).getTime();
      const timeB = new Date(b.lastActivityTime).getTime();
      return timeB - timeA;
    });

    console.log(`✅ [useFriendsFeed] Processed ${sortedResult.length} friends with activities`);
    return sortedResult.slice(0, 10); // Limit to 10 friends
  }, [friends, realActivities]);

  return {
    friends,
    friendsActivities,
    isLoading: friendsLoading || realActivitiesLoading,
    hasFriends: friends.length > 0,
    tickerMetadata: { source: 'real_activities', timestamp: new Date().toISOString(), count: realActivities.length, onlineCount: 0 }
  };
};
