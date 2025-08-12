
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Trophy, Users, Loader2, Hotel } from 'lucide-react';
import { useHotelTicker } from '@/hooks/useHotelTicker';
import { useUserFigures } from '@/hooks/useUserFigures';
import { habboProxyService } from '@/services/habboProxyService';

export const HotelFeedColumn: React.FC = () => {
  const { aggregatedActivities, isLoading, error } = useHotelTicker();
  
  // Get unique usernames for figure fetching
  const usernames = aggregatedActivities.map(group => group.username);
  const { figureMap } = useUserFigures(usernames);

  // Add telemetry logging
  useEffect(() => {
    if (aggregatedActivities.length > 0) {
      console.log(`📊 [HotelFeedColumn] Displaying ${aggregatedActivities.length} user groups with activities`);
      console.log(`👥 [HotelFeedColumn] Total unique users: ${usernames.length}`);
      const totalActivities = aggregatedActivities.reduce((sum, group) => sum + group.activityCount, 0);
      console.log(`⚡ [HotelFeedColumn] Total activities: ${totalActivities}`);
    }
  }, [aggregatedActivities, usernames.length]);

  const getActivityIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('amigo') || desc.includes('friend')) {
      return <Users className="w-4 h-4 text-blue-500" />;
    }
    if (desc.includes('emblema') || desc.includes('badge') || desc.includes('achievement')) {
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    }
    if (desc.includes('grupo') || desc.includes('quarto') || desc.includes('group') || desc.includes('room')) {
      return <Hotel className="w-4 h-4 text-purple-500" />;
    }
    return <Activity className="w-4 h-4 text-green-500" />;
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5" />
            Feed do Hotel
            {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
            {aggregatedActivities.length > 0 && (
              <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                {aggregatedActivities.length} usuários ativos
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {isLoading && aggregatedActivities.length === 0 ? (
              <div className="text-center text-white/70 py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Carregando atividades do hotel...</p>
              </div>
            ) : aggregatedActivities.length > 0 ? (
              aggregatedActivities.map((userGroup, index) => (
                <div key={`${userGroup.username}-${index}`} className="p-4 mb-3 bg-transparent">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      {figureMap[userGroup.username] ? (
                        <img 
                          src={habboProxyService.getAvatarUrl(figureMap[userGroup.username], 'l')} 
                          alt={userGroup.username}
                          className="h-[130px] w-auto object-contain bg-transparent"
                        />
                      ) : (
                        <div className="h-[130px] w-16 bg-white/10 flex items-center justify-center">
                          <span className="text-2xl font-bold">
                            {userGroup.username[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-blue-200 mb-1">{userGroup.username}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                          {userGroup.activityCount} atividade{userGroup.activityCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-[4.5rem]">
                    {userGroup.activities.slice(0, 3).map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-start gap-2 text-sm">
                        {getActivityIcon(activity.description)}
                        <span className="text-white/90 flex-1">
                          {activity.description}
                        </span>
                        <span className="text-xs text-white/60 ml-2">
                          {formatTime(activity.time)}
                        </span>
                      </div>
                    ))}
                    {userGroup.activities.length > 3 && (
                      <p className="text-xs text-white/60 ml-6">
                        +{userGroup.activities.length - 3} outras atividades
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-white/70 py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
                <p className="text-xs mt-1">As atividades do hotel aparecerão aqui</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
