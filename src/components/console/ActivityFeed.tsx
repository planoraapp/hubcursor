
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RefreshCw, Clock, Globe, AlertTriangle, Activity as ActivityIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getAvatarUrl } from '@/services/habboApi';

interface Activity {
  time: string;
  activity: string;
  timestamp: string;
  username?: string;
  figureString?: string;
}

interface ActivityGroup {
  username: string;
  activities: Activity[];
  latestTime: string;
  figureString?: string;
}

interface ActivityFeedProps {
  followedUsers: string[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ followedUsers }) => {
  const [activityGroups, setActivityGroups] = useState<ActivityGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [serviceStatus, setServiceStatus] = useState<'online' | 'offline' | 'limited'>('online');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const MOCK_ACTIVITIES: Activity[] = [
    { time: '14:30', activity: 'entrou no quarto "Sala de Jogos"', timestamp: new Date(Date.now() - 30000).toISOString(), username: 'ExemploUser1' },
    { time: '14:28', activity: 'ganhou uma conquista "Primeira Vitória"', timestamp: new Date(Date.now() - 120000).toISOString(), username: 'ExemploUser2' },
    { time: '14:25', activity: 'comprou um novo móvel', timestamp: new Date(Date.now() - 300000).toISOString(), username: 'ExemploUser3' },
    { time: '14:22', activity: 'fez um amigo novo', timestamp: new Date(Date.now() - 480000).toISOString(), username: 'ExemploUser4' },
    { time: '14:20', activity: 'atualizou o visual', timestamp: new Date(Date.now() - 600000).toISOString(), username: 'ExemploUser5' }
  ];

  const fetchHotelTicker = async (loadMore = false) => {
    if (!loadMore) {
      setLoading(true);
      setErrorMessage('');
    }

    try {
      console.log('🔄 [ActivityFeed] Fetching hotel ticker data...');
      
      const response = await supabase.functions.invoke('habbo-widgets-proxy', {
        body: { username: 'habbohub' } // Using a known user to get ticker data
      });
      
      console.log('📨 [ActivityFeed] Response:', response);
      
      if (response.data?.success && response.data?.activities) {
        const activities = response.data.activities.map((activity: Activity) => ({
          ...activity,
          username: activity.username || 'Usuario',
          figureString: 'hd-180-1.ch-255-66.lg-280-110.sh-305-62'
        }));

        const grouped = groupActivitiesByUser(activities);
        
        if (loadMore) {
          setActivityGroups(prev => [...prev, ...grouped]);
        } else {
          setActivityGroups(grouped);
        }
        
        setServiceStatus('online');
        console.log(`✅ [ActivityFeed] Loaded ${grouped.length} activity groups`);
      } else {
        console.warn('⚠️ [ActivityFeed] No ticker data found, using mock data');
        const mockGroups = groupActivitiesByUser(MOCK_ACTIVITIES);
        setActivityGroups(mockGroups);
        setServiceStatus('limited');
        setErrorMessage('Usando dados de exemplo. HabboWidgets pode estar indisponível.');
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ [ActivityFeed] Error fetching ticker:', error);
      const mockGroups = groupActivitiesByUser(MOCK_ACTIVITIES);
      setActivityGroups(mockGroups);
      setServiceStatus('offline');
      setErrorMessage('Feed temporariamente indisponível. Exibindo dados de exemplo.');
    } finally {
      setLoading(false);
    }
  };

  const groupActivitiesByUser = (activities: Activity[]): ActivityGroup[] => {
    // Group activities by user and 30-minute time windows
    const grouped = activities.reduce((acc, activity) => {
      const username = activity.username || 'Usuario';
      const timeKey = Math.floor(new Date(activity.timestamp).getTime() / (30 * 60 * 1000));
      const key = `${username}-${timeKey}`;
      
      if (!acc[key]) {
        acc[key] = {
          username,
          activities: [],
          latestTime: activity.time,
          figureString: activity.figureString
        };
      }
      
      acc[key].activities.push(activity);
      return acc;
    }, {} as { [key: string]: ActivityGroup });

    // Convert to array and sort by most recent
    return Object.values(grouped).sort((a, b) => {
      const timeA = new Date(a.activities[0]?.timestamp || 0).getTime();
      const timeB = new Date(b.activities[0]?.timestamp || 0).getTime();
      return timeB - timeA;
    });
  };

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore && !loading) {
        console.log('📜 [ActivityFeed] Loading more activities...');
        setPage(prev => prev + 1);
        fetchHotelTicker(true);
      }
    }
  }, [hasMore, loading]);

  useEffect(() => {
    fetchHotelTicker();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      console.log('⏰ [ActivityFeed] Auto-refreshing ticker...');
      fetchHotelTicker();
    }, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const getStatusColor = () => {
    switch (serviceStatus) {
      case 'online': return 'text-green-600';
      case 'limited': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (serviceStatus) {
      case 'online': return <ActivityIcon className="w-4 h-4 text-green-600" />;
      case 'limited': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'offline': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <ActivityIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Feed Geral do Hotel
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchHotelTicker()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </div>
          <div className={`flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="capitalize">{serviceStatus}</span>
          </div>
        </div>
        {errorMessage && (
          <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
            {errorMessage}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div 
          ref={scrollRef}
          className="space-y-4 max-h-96 overflow-y-auto"
          style={{ scrollbarWidth: 'thin' }}
        >
          {activityGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Carregando feed do hotel...
                </div>
              ) : (
                <p>Nenhuma atividade encontrada</p>
              )}
            </div>
          ) : (
            activityGroups.map((group, index) => (
              <div key={`${group.username}-${index}`} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage 
                      src={group.figureString ? getAvatarUrl(group.figureString, 's') : undefined} 
                      alt={group.username}
                    />
                    <AvatarFallback>{group.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{group.username}</span>
                      <span className="text-xs text-muted-foreground">{group.latestTime}</span>
                      {serviceStatus === 'limited' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">simulado</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {group.activities.map((activity, actIndex) => (
                        <p key={actIndex} className="text-sm text-gray-700">
                          • {activity.activity}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && activityGroups.length > 0 && (
            <div className="text-center py-4">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
