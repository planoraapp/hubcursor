
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
  activityDetails: string[];
}

export const useChronologicalFeedActivities = (currentUserName: string, hotel: string = 'br') => {
  const { data: profileData, isLoading: profileLoading } = useCompleteProfile(currentUserName, hotel);
  const { trackUserActivities } = useDailyActivitiesTracker();
  const friends = profileData?.data?.friends || [];
  
  console.log(`[🎯 CHRONOLOGICAL] Init for ${currentUserName}, profile loading: ${profileLoading}, friends: ${friends.length}`);

  const queryResult = useQuery({
    queryKey: ['chronological-feed-activities', currentUserName, hotel, friends.length],
    queryFn: async (): Promise<ChronologicalActivity[]> => {
      console.log(`[🎯 CHRONOLOGICAL ACTIVITIES] Fetching activities for ${currentUserName} with ${friends.length} friends`);

      if (friends.length === 0) {
        console.log('[🎯 CHRONOLOGICAL ACTIVITIES] No friends found, will trigger tracking anyway');
        // Still trigger tracking for the user themselves
        if (currentUserName && profileData?.uniqueId) {
          trackUserActivities(currentUserName, profileData.uniqueId, hotel).catch(console.error);
        }
        return [];
      }

      try {
        // Trigger daily activities tracking para popular dados
        if (currentUserName && profileData?.uniqueId) {
          trackUserActivities(currentUserName, profileData.uniqueId, hotel).catch(console.error);
        }

        // Get friend IDs para a query - expandir para todos os amigos
        const friendIds = friends.map(f => f.habbo_id || f.id).filter(Boolean);
        
        console.log(`[🎯 CHRONOLOGICAL ACTIVITIES] Querying activities for ${friendIds.length} friends`);
        
        // Query activities das últimas 12 horas para dados mais recentes
        const twelveHoursAgo = new Date();
        twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
        
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
          .gte('last_updated', twelveHoursAgo.toISOString())
          .gt('total_changes', 0) // Only activities with changes
          .order('last_updated', { ascending: false })
          .limit(200);

        if (error) {
          console.error('[🎯 CHRONOLOGICAL ACTIVITIES] Query error:', error);
          throw error;
        }

        if (!activities || activities.length === 0) {
          console.log('[🎯 CHRONOLOGICAL ACTIVITIES] No activities found for friends');
          return [];
        }

        console.log(`[🎯 CHRONOLOGICAL ACTIVITIES] Found ${activities.length} activities, processing...`);
        
        // Process activities com descrições detalhadas
        const processedActivities = activities
          .map(activity => {
            const groupsJoined = Array.isArray(activity.groups_joined) ? activity.groups_joined : [];
            const roomsCreated = Array.isArray(activity.rooms_created) ? activity.rooms_created : [];
            const badgesGained = Array.isArray(activity.badges_gained) ? activity.badges_gained : [];
            const photosPosted = Array.isArray(activity.photos_posted) ? activity.photos_posted : [];
            
            // Criar detalhes específicos das atividades
            const activityDetails: string[] = [];
            
            if (groupsJoined.length > 0) {
              groupsJoined.forEach((group: any) => {
                activityDetails.push(`Entrou no grupo: ${group.name || 'Grupo'}`);
              });
            }
            
            if (roomsCreated.length > 0) {
              roomsCreated.forEach((room: any) => {
                activityDetails.push(`Criou o quarto: ${room.name || 'Novo Quarto'}`);
              });
            }
            
            if (badgesGained.length > 0) {
              if (badgesGained.length === 1) {
                activityDetails.push(`Conquistou o emblema: ${badgesGained[0]}`);
              } else {
                activityDetails.push(`Conquistou ${badgesGained.length} novos emblemas`);
              }
            }
            
            if (activity.figure_changes) {
              activityDetails.push('Mudou o visual do avatar');
            }
            
            if (activity.motto_changed) {
              activityDetails.push(`Nova missão: "${activity.motto_changed}"`);
            }
            
            if (photosPosted.length > 0) {
              photosPosted.forEach((photo: any) => {
                const roomName = photo.roomName || photo.room_name || 'um quarto';
                activityDetails.push(`Postou foto em ${roomName}`);
              });
            }
            
            // Generate summary baseado nas atividades reais
            const summaryParts: string[] = [];
            
            if (groupsJoined.length > 0) {
              summaryParts.push(`${groupsJoined.length} grupo(s)`);
            }
            
            if (roomsCreated.length > 0) {
              summaryParts.push(`${roomsCreated.length} quarto(s)`);
            }
            
            if (badgesGained.length > 0) {
              summaryParts.push(`${badgesGained.length} emblema(s)`);
            }
            
            if (activity.figure_changes) {
              summaryParts.push('visual');
            }
            
            if (activity.motto_changed) {
              summaryParts.push('missão');
            }
            
            if (photosPosted.length > 0) {
              summaryParts.push(`${photosPosted.length} foto(s)`);
            }
            
            const summary = summaryParts.length > 0 
              ? `${summaryParts.join(', ')}`
              : 'atividade no perfil';
            
            // Calculate time ago com precisão de segundos/minutos
            const lastUpdate = new Date(activity.last_updated);
            const now = new Date();
            const diffMs = now.getTime() - lastUpdate.getTime();
            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMinutes = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMinutes / 60);
            
            let timeAgo: string;
            if (diffSeconds < 30) {
              timeAgo = 'agora mesmo';
            } else if (diffSeconds < 60) {
              timeAgo = `há ${diffSeconds}s`;
            } else if (diffMinutes < 60) {
              timeAgo = `há ${diffMinutes}min`;
            } else if (diffHours < 24) {
              timeAgo = `há ${diffHours}h`;
            } else {
              const diffDays = Math.floor(diffHours / 24);
              timeAgo = `há ${diffDays}d`;
            }

            return {
              ...activity,
              groups_joined: groupsJoined,
              rooms_created: roomsCreated,
              badges_gained: badgesGained,
              photos_posted: photosPosted,
              summary,
              timeAgo,
              activityDetails
            } as ChronologicalActivity;
          })
          // Agrupar até 5 atividades por usuário dentro de 2 horas
          .reduce((acc: ChronologicalActivity[], activity) => {
            const recentUserActivities = acc.filter(a => 
              a.user_habbo_id === activity.user_habbo_id
            );
            
            if (recentUserActivities.length < 5) {
              const lastActivity = recentUserActivities[0];
              
              if (lastActivity) {
                const lastTime = new Date(lastActivity.last_updated).getTime();
                const currentTime = new Date(activity.last_updated).getTime();
                const timeDiff = Math.abs(lastTime - currentTime) / (1000 * 60); // minutes
                
                // Se as atividades são dentro de 2 horas, mesclar detalhes
                if (timeDiff <= 120) {
                  lastActivity.activityDetails = [
                    ...lastActivity.activityDetails,
                    ...activity.activityDetails
                  ].slice(0, 5); // Máximo 5 detalhes
                  
                  lastActivity.total_changes += activity.total_changes;
                  
                  // Usar o timestamp mais recente
                  if (currentTime > lastTime) {
                    lastActivity.last_updated = activity.last_updated;
                    lastActivity.timeAgo = activity.timeAgo;
                  }
                  
                  return acc;
                }
              }
            }
            
            acc.push(activity);
            return acc;
          }, [])
          .slice(0, 30); // Limit for display

        console.log(`[🎯 CHRONOLOGICAL ACTIVITIES] Processed ${processedActivities.length} chronological activities`);
        
        return processedActivities;
      } catch (error: any) {
        console.error('[🎯 CHRONOLOGICAL ACTIVITIES] Fetch failed:', error);
        throw error;
      }
    },
    enabled: !!currentUserName && !profileLoading && friends.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 2 * 60 * 1000, // Refresh a cada 2 minutos
  });

  // Determine system status
  const systemStatus = !currentUserName ? 'no_user' :
                      profileLoading ? 'loading' :
                      friends.length === 0 ? 'no_friends' :
                      !queryResult.isLoading && (queryResult.data?.length || 0) === 0 ? 'tracking_disabled' :
                      'active';

  return {
    activities: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isEmpty: !queryResult.isLoading && (queryResult.data?.length || 0) === 0,
    lastUpdate: queryResult.dataUpdatedAt,
    systemStatus,
    friendsCount: friends.length
  };
};
