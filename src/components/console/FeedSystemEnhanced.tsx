import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RefreshCw, Clock, Users, Globe, AlertTriangle, Activity as ActivityIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getAvatarUrl } from '../../services/habboApi';

interface Activity {
  time: string;
  activity: string;
  timestamp: string;
  friendName?: string;
  figureString?: string;
}

interface FeedSystemEnhancedProps {
  feedType: 'general' | 'friends';
  followedUsers: string[];
}

export const FeedSystemEnhanced: React.FC<FeedSystemEnhancedProps> = ({ feedType, followedUsers }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [serviceStatus, setServiceStatus] = useState<'online' | 'offline' | 'limited'>('online');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const MOCK_ACTIVITIES = [
    { time: '14:30', activity: 'entrou no quarto "Sala de Jogos"', timestamp: new Date().toISOString(), friendName: 'ExemploUser1', figureString: 'hd-180-1.ch-255-66.lg-280-110.sh-305-62' },
    { time: '14:28', activity: 'ganhou uma conquista "Primeira Vitória"', timestamp: new Date().toISOString(), friendName: 'ExemploUser2', figureString: 'hd-180-2.ch-255-67.lg-280-111.sh-305-63' },
    { time: '14:25', activity: 'comprou um novo móvel', timestamp: new Date().toISOString(), friendName: 'ExemploUser3', figureString: 'hd-180-3.ch-255-68.lg-280-112.sh-305-64' },
    { time: '14:22', activity: 'fez um amigo novo', timestamp: new Date().toISOString(), friendName: 'ExemploUser4', figureString: 'hd-180-4.ch-255-69.lg-280-113.sh-305-65' },
    { time: '14:20', activity: 'atualizou o visual', timestamp: new Date().toISOString(), friendName: 'ExemploUser5', figureString: 'hd-180-5.ch-255-70.lg-280-114.sh-305-66' }
  ];

  const fetchGeneralFeed = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
            const sampleUsers = ['habbohub', 'Beebop', 'joao123'];
      const allActivities: Activity[] = [];

      for (const username of sampleUsers) {
        try {
                    const response = await supabase.functions.invoke('habbo-unified-api', {
            body: { 
              endpoint: 'feed',
              action: 'activities',
              params: { username, hotel: 'br' }
            }
          });
          
                    if (response.data?.success && response.data?.activities) {
            const userActivities = response.data.activities.map((activity: Activity) => ({
              ...activity,
              friendName: username,
              figureString: 'hd-180-1.ch-255-66.lg-280-110.sh-305-62'
            }));
            allActivities.push(...userActivities);
                        setServiceStatus('online');
          } else {
                      }
        } catch (error) {
                  }
      }

      if (allActivities.length === 0) {
                setActivities(MOCK_ACTIVITIES);
        setServiceStatus('limited');
        setErrorMessage('Usando dados de exemplo. HabboWidgets pode estar indisponível.');
      } else {
        const groupedActivities = groupActivitiesByUser(allActivities);
        setActivities(groupedActivities.slice(0, 20));
        setServiceStatus('online');
      }
      
      setLastUpdate(new Date());
          } catch (error) {
            setActivities(MOCK_ACTIVITIES);
      setServiceStatus('offline');
      setErrorMessage('Serviço temporariamente indisponível. Exibindo dados de exemplo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendsFeed = async () => {
    if (followedUsers.length === 0) {
            setActivities(MOCK_ACTIVITIES.slice(0, 3));
      setServiceStatus('limited');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
            const allActivities: Activity[] = [];

      for (const username of followedUsers.slice(0, 5)) {
        try {
                    const response = await supabase.functions.invoke('habbo-unified-api', {
            body: { 
              endpoint: 'feed',
              action: 'activities',
              params: { username, hotel: 'br' }
            }
          });
          
          if (response.data?.success && response.data?.activities) {
            const userActivities = response.data.activities.map((activity: Activity) => ({
              ...activity,
              friendName: username,
              figureString: 'hd-180-1.ch-255-66.lg-280-110.sh-305-62'
            }));
            allActivities.push(...userActivities);
                      }
        } catch (error) {
                  }
      }

      if (allActivities.length === 0) {
        const friendsMockData = MOCK_ACTIVITIES.map(activity => ({
          ...activity,
          friendName: followedUsers[Math.floor(Math.random() * followedUsers.length)]
        }));
        setActivities(friendsMockData.slice(0, 10));
        setServiceStatus('limited');
        setErrorMessage('Atividades dos amigos indisponíveis. Exibindo simulação.');
      } else {
        const groupedActivities = groupActivitiesByUser(allActivities);
        setActivities(groupedActivities.slice(0, 15));
        setServiceStatus('online');
      }
      
      setLastUpdate(new Date());
          } catch (error) {
            setActivities(MOCK_ACTIVITIES.slice(0, 5));
      setServiceStatus('offline');
      setErrorMessage('Feed de amigos indisponível. Exibindo dados de exemplo.');
    } finally {
      setLoading(false);
    }
  };

  const groupActivitiesByUser = (activities: Activity[]): Activity[] => {
    const grouped = activities.reduce((acc, activity) => {
      const key = `${activity.friendName}-${Math.floor(new Date(activity.timestamp).getTime() / (30 * 60 * 1000))}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(activity);
      return acc;
    }, {} as { [key: string]: Activity[] });

    return Object.values(grouped)
      .map(group => group[0])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const refreshFeed = () => {
        if (feedType === 'general') {
      fetchGeneralFeed();
    } else {
      fetchFriendsFeed();
    }
  };

  useEffect(() => {
        refreshFeed();
    
    // Auto-refresh every 10 minutes (reduced from 5 to avoid rate limits)
    const interval = setInterval(() => {
            refreshFeed();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [feedType, followedUsers]);

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
                    {serviceStatus === 'limited' && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">simulado</span>
                    )}
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
