
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RefreshCw, Clock, Users, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getAvatarUrl } from '../../services/habboApi';

interface Activity {
  time: string;
  activity: string;
  timestamp: string;
  friendName?: string;
  figureString?: string;
}

interface FeedSystemProps {
  feedType: 'general' | 'friends';
  followedUsers: string[];
}

export const FeedSystem: React.FC<FeedSystemProps> = ({ feedType, followedUsers }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchGeneralFeed = async () => {
    setLoading(true);
    try {
      console.log('🔄 [Feed] Fetching general feed...');
      const sampleUsers = ['habbohub', 'Beebop', 'joao123', 'maria456', 'pedro789'];
      const allActivities: Activity[] = [];

      for (const username of sampleUsers.slice(0, 3)) { // Reduced to 3 to avoid rate limits
        try {
          console.log(`📡 [Feed] Requesting activities for: ${username}`);
          
          const response = await supabase.functions.invoke('habbo-widgets-proxy', {
            body: { username }
          });
          
          console.log(`📨 [Feed] Response for ${username}:`, response);
          
          if (response.data?.success && response.data?.activities) {
            const userActivities = response.data.activities.map((activity: Activity) => ({
              ...activity,
              friendName: username,
              figureString: 'hd-180-1.ch-255-66.lg-280-110.sh-305-62' // Default figure
            }));
            allActivities.push(...userActivities);
            console.log(`✅ [Feed] Added ${userActivities.length} activities for ${username}`);
          } else {
            console.warn(`⚠️ [Feed] No activities found for ${username}:`, response.error);
          }
        } catch (error) {
          console.error(`❌ [Feed] Error fetching activities for ${username}:`, error);
        }
      }

      const groupedActivities = groupActivitiesByUser(allActivities);
      setActivities(groupedActivities.slice(0, 20));
      setLastUpdate(new Date());
      console.log(`📊 [Feed] Final activities count: ${groupedActivities.length}`);
    } catch (error) {
      console.error('❌ [Feed] Error fetching general feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendsFeed = async () => {
    if (followedUsers.length === 0) {
      console.log('ℹ️ [Feed] No followed users, skipping friends feed');
      setActivities([]);
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 [Feed] Fetching friends feed for:', followedUsers);
      const allActivities: Activity[] = [];

      for (const username of followedUsers.slice(0, 5)) { // Limit to prevent rate limits
        try {
          console.log(`📡 [Feed] Requesting activities for friend: ${username}`);
          
          const response = await supabase.functions.invoke('habbo-widgets-proxy', {
            body: { username }
          });
          
          if (response.data?.success && response.data?.activities) {
            const userActivities = response.data.activities.map((activity: Activity) => ({
              ...activity,
              friendName: username,
              figureString: 'hd-180-1.ch-255-66.lg-280-110.sh-305-62' // Would fetch actual figure
            }));
            allActivities.push(...userActivities);
            console.log(`✅ [Feed] Added ${userActivities.length} activities for friend ${username}`);
          }
        } catch (error) {
          console.error(`❌ [Feed] Error fetching activities for friend ${username}:`, error);
        }
      }

      const groupedActivities = groupActivitiesByUser(allActivities);
      setActivities(groupedActivities.slice(0, 15));
      setLastUpdate(new Date());
      console.log(`📊 [Feed] Final friends activities count: ${groupedActivities.length}`);
    } catch (error) {
      console.error('❌ [Feed] Error fetching friends feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupActivitiesByUser = (activities: Activity[]): Activity[] => {
    // Group activities by user and time periods (30 minutes)
    const grouped = activities.reduce((acc, activity) => {
      const key = `${activity.friendName}-${Math.floor(new Date(activity.timestamp).getTime() / (30 * 60 * 1000))}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(activity);
      return acc;
    }, {} as { [key: string]: Activity[] });

    // Convert back to array and sort by most recent
    return Object.values(grouped)
      .map(group => group[0]) // Take first activity from each group
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const refreshFeed = () => {
    console.log(`🔄 [Feed] Refreshing ${feedType} feed...`);
    if (feedType === 'general') {
      fetchGeneralFeed();
    } else {
      fetchFriendsFeed();
    }
  };

  useEffect(() => {
    console.log(`🚀 [Feed] Initializing ${feedType} feed...`);
    refreshFeed();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      console.log(`⏰ [Feed] Auto-refreshing ${feedType} feed...`);
      refreshFeed();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [feedType, followedUsers]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {feedType === 'general' ? (
              <>
                <Globe className="w-5 h-5" />
                Feed Geral do Hotel
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                Feed dos Amigos
              </>
            )}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshFeed}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
        </div>
      </CardHeader>
      <CardContent>
        {feedType === 'friends' && followedUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Você não está seguindo ninguém ainda.</p>
            <p className="text-sm">Procure usuários e comece a seguir para ver suas atividades aqui!</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Carregando atividades...
              </div>
            ) : (
              <p>Nenhuma atividade encontrada</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={`${activity.friendName}-${index}`} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={activity.figureString ? getAvatarUrl(activity.figureString, 's') : undefined} 
                    alt={activity.friendName}
                  />
                  <AvatarFallback>{activity.friendName?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{activity.friendName}</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-700">{activity.activity}</p>
                </div>
              </div>
            ))}
            
            {activities.length > 0 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm" onClick={refreshFeed}>
                  Carregar mais atividades
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
