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
      console.log(`[useFriendsFeed] No friends to process (${friends.length} friends)`);
      return [];
    }

    console.log(`🔍 [useFriendsFeed] Processing ${friends.length} friends with ${realActivities.length} real activities`);
    console.log(`[useFriendsFeed] Friends list:`, friends.map(f => f.name));
    console.log(`[useFriendsFeed] Real activities:`, realActivities.map(a => ({ name: a.habbo_name, type: a.activity_type, time: a.created_at })));
    
    const friendNameSet = new Set(friends.map(f => f.name.toLowerCase()));
    console.log(`[useFriendsFeed] Friend names set:`, Array.from(friendNameSet));
    
    // Group real activities by friend
    const realActivityGroups: { [friendName: string]: RealFriendActivity[] } = {};
    realActivities.forEach(activity => {
      const friendName = activity.habbo_name.toLowerCase();
      console.log(`[useFriendsFeed] Checking activity from ${friendName}, is friend: ${friendNameSet.has(friendName)}`);
      if (friendNameSet.has(friendName)) {
        if (!realActivityGroups[friendName]) {
          realActivityGroups[friendName] = [];
        }
        realActivityGroups[friendName].push(activity);
      }
    });

    console.log(`[useFriendsFeed] Activity groups:`, Object.keys(realActivityGroups));

    // Create FriendActivity objects from real activities
    const result: FriendActivity[] = Object.entries(realActivityGroups).map(([friendName, activities]) => {
      const friend = friends.find(f => f.name.toLowerCase() === friendName);
      if (!friend) {
        console.log(`[useFriendsFeed] Friend not found for activities: ${friendName}`);
        return null;
      }

      const sortedActivities = activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log(`[useFriendsFeed] Created activity group for ${friend.name} with ${sortedActivities.length} activities`);

      return {
        friend,
        activities: sortedActivities,
        lastActivityTime: sortedActivities[0]?.created_at || new Date().toISOString(),
        activityType: 'real' as const
      };
    }).filter(Boolean) as FriendActivity[];

    // Sort by most recent activity
    const sortedResult = result.sort((a, b) => {
      const timeA = new Date(a.lastActivityTime).getTime();
      const timeB = new Date(b.lastActivityTime).getTime();
      return timeB - timeA;
    });

    console.log(`✅ [useFriendsFeed] Final result: ${sortedResult.length} friends with activities`);
    sortedResult.forEach(fa => {
      console.log(`  - ${fa.friend.name}: ${fa.activities.length} activities, last: ${fa.lastActivityTime}`);
    });
    
    return sortedResult.slice(0, 15); // Increased limit to 15 for better visibility
  }, [friends, realActivities]);

  return {
    friends,
    friendsActivities,
    isLoading: friendsLoading || realActivitiesLoading,
    hasFriends: friends.length > 0,
    tickerMetadata: { source: 'real_activities', timestamp: new Date().toISOString(), count: realActivities.length, onlineCount: 0 }
  };
};
