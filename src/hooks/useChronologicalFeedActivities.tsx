import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompleteProfile } from './useCompleteProfile';
import { useDailyActivitiesTracker } from './useDailyActivitiesTracker';

interface ChronologicalActivity {
  id: string;
  user_habbo_id: string;
  user_habbo_name: string;
  hotel: string;
  activity_date: string;
  badges_gained: string[];
  groups_joined: any[];
  rooms_created: any[];
  photos_posted: any[];
  motto_changed?: string;
  figure_changes?: any;
  session_start: string;
  last_updated: string;
  total_changes: number;
  timeAgo: string;
  summary: string;
}

export const useChronologicalFeedActivities = (currentUserName: string, hotel: string = 'br') => {
  const { data: profileData, isLoading: profileLoading } = useCompleteProfile(currentUserName, hotel);
  const { trackUserActivities } = useDailyActivitiesTracker();
  const friends = profileData?.data?.friends || [];

  const queryResult = useQuery({
    queryKey: ['chronological-feed-activities', currentUserName, hotel, friends.length],
    queryFn: async (): Promise<ChronologicalActivity[]> => {
            if (friends.length === 0) {
                return [];
      }

      try {
        // Trigger daily activities tracking for the user first (async, don't wait)
        if (currentUserName && profileData?.uniqueId) {
          trackUserActivities(currentUserName, profileData.uniqueId, hotel).catch(console.error);
        }

        // Get friend IDs for the query
        const friendIds = friends.map(f => f.habbo_id || f.id).filter(Boolean).slice(0, 100);
        
                // Query activities from the last 48 hours
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        const { data: activities, error } = await supabase
          .from('daily_friend_activities')
          .select(`
            id,
            user_habbo_id,
            user_habbo_name,
            hotel,
            activity_date,
            badges_gained,
            groups_joined,
            rooms_created,
            photos_posted,
            motto_changed,
            figure_changes,
            session_start,
            last_updated,
            total_changes
          `)
          .in('user_habbo_id', friendIds)
          .eq('hotel', hotel)
          .gte('last_updated', twoDaysAgo.toISOString())
          .gt('total_changes', 0) // Only activities with changes
          .order('last_updated', { ascending: false })
          .limit(100);

        if (error) {
                    throw error;
        }

        if (!activities || activities.length === 0) {
                    return [];
        }

                // Process activities and generate summaries
        const processedActivities = activities
          .map(activity => {
            // Generate human-readable summary like the example
            const summaryParts: string[] = [];
            
            const groupsJoined = Array.isArray(activity.groups_joined) ? activity.groups_joined : [];
            const roomsCreated = Array.isArray(activity.rooms_created) ? activity.rooms_created : [];
            const badgesGained = Array.isArray(activity.badges_gained) ? activity.badges_gained : [];
            const photosPosted = Array.isArray(activity.photos_posted) ? activity.photos_posted : [];
            
            if (groupsJoined.length > 0) {
              summaryParts.push(`${groupsJoined.length} novo(s) grupo(s)`);
            }
            
            if (roomsCreated.length > 0) {
              summaryParts.push(`${roomsCreated.length} novo(s) quarto(s)`);
            }
            
            if (badgesGained.length > 0) {
              const badgeCount = badgesGained.length;
              if (badgeCount >= 5) {
                summaryParts.push(`mais de ${badgeCount} novo(s) emblema(s)`);
              } else {
                summaryParts.push(`${badgeCount} novo(s) emblema(s)`);
              }
            }
            
            if (activity.figure_changes) {
              summaryParts.push('mudou seu visual');
            }
            
            if (activity.motto_changed) {
              summaryParts.push('mudou sua missão');
            }
            
            if (photosPosted.length > 0) {
              summaryParts.push(`${photosPosted.length} nova(s) foto(s)`);
            }
            
            const summary = summaryParts.length > 0 
              ? `adicionou ${summaryParts.join(', ')}`
              : 'teve atividade no perfil';
            
            // Calculate time ago
            const lastUpdate = new Date(activity.last_updated);
            const now = new Date();
            const diffMs = now.getTime() - lastUpdate.getTime();
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMinutes / 60);
            
            let timeAgo: string;
            if (diffMinutes < 1) {
              timeAgo = 'agora mesmo';
            } else if (diffMinutes < 60) {
              timeAgo = `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
            } else if (diffHours < 24) {
              timeAgo = `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
            } else {
              const diffDays = Math.floor(diffHours / 24);
              timeAgo = `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
            }

            return {
              ...activity,
              groups_joined: groupsJoined,
              rooms_created: roomsCreated,
              badges_gained: badgesGained,
              photos_posted: photosPosted,
              summary,
              timeAgo
            } as ChronologicalActivity;
          })
          // Group activities from same user within 1 hour
          .reduce((acc: ChronologicalActivity[], activity) => {
            const lastActivity = acc[acc.length - 1];
            
            if (lastActivity && 
                lastActivity.user_habbo_id === activity.user_habbo_id) {
              
              const lastTime = new Date(lastActivity.last_updated).getTime();
              const currentTime = new Date(activity.last_updated).getTime();
              const timeDiff = Math.abs(lastTime - currentTime) / (1000 * 60); // minutes
              
              // If activities are within 60 minutes, group them
              if (timeDiff <= 60) {
                // Merge the activities
                const mergedBadges = [...(Array.isArray(lastActivity.badges_gained) ? lastActivity.badges_gained : []), ...(Array.isArray(activity.badges_gained) ? activity.badges_gained : [])];
                const mergedGroups = [...(Array.isArray(lastActivity.groups_joined) ? lastActivity.groups_joined : []), ...(Array.isArray(activity.groups_joined) ? activity.groups_joined : [])];
                const mergedRooms = [...(Array.isArray(lastActivity.rooms_created) ? lastActivity.rooms_created : []), ...(Array.isArray(activity.rooms_created) ? activity.rooms_created : [])];
                const mergedPhotos = [...(Array.isArray(lastActivity.photos_posted) ? lastActivity.photos_posted : []), ...(Array.isArray(activity.photos_posted) ? activity.photos_posted : [])];
                
                // Update the last activity with merged data
                lastActivity.badges_gained = mergedBadges;
                lastActivity.groups_joined = mergedGroups;
                lastActivity.rooms_created = mergedRooms;
                lastActivity.photos_posted = mergedPhotos;
                lastActivity.total_changes += activity.total_changes;
                
                // Use the more recent timestamp
                if (currentTime > lastTime) {
                  lastActivity.last_updated = activity.last_updated;
                  lastActivity.timeAgo = activity.timeAgo;
                }
                
                // Regenerate summary for merged activity
                const summaryParts: string[] = [];
                
                if (mergedGroups.length > 0) {
                  summaryParts.push(`${mergedGroups.length} novo(s) grupo(s)`);
                }
                
                if (mergedRooms.length > 0) {
                  summaryParts.push(`${mergedRooms.length} novo(s) quarto(s)`);
                }
                
                if (mergedBadges.length > 0) {
                  const badgeCount = mergedBadges.length;
                  if (badgeCount >= 5) {
                    summaryParts.push(`mais de ${badgeCount} novo(s) emblema(s)`);
                  } else {
                    summaryParts.push(`${badgeCount} novo(s) emblema(s)`);
                  }
                }
                
                if (lastActivity.figure_changes || activity.figure_changes) {
                  summaryParts.push('mudou seu visual');
                }
                
                if (lastActivity.motto_changed || activity.motto_changed) {
                  summaryParts.push('mudou sua missão');
                }
                
                if (mergedPhotos.length > 0) {
                  summaryParts.push(`${mergedPhotos.length} nova(s) foto(s)`);
                }
                
                lastActivity.summary = summaryParts.length > 0 
                  ? `adicionou ${summaryParts.join(', ')}`
                  : 'teve atividade no perfil';
                
                return acc; // Don't add the current activity as it was merged
              }
            }
            
            acc.push(activity);
            return acc;
          }, [])
          .slice(0, 30); // Limit for display

                return processedActivities;
      } catch (error: any) {
                throw error;
      }
    },
    enabled: !!currentUserName && !profileLoading && friends.length > 0,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });

  return {
    activities: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isEmpty: !queryResult.isLoading && (queryResult.data?.length || 0) === 0,
    lastUpdate: queryResult.dataUpdatedAt
  };
};