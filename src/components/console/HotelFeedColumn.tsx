
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Activity, Trophy, Users, Loader2, Hotel } from 'lucide-react';
import { useHotelTicker } from '@/hooks/useHotelTicker';
import { habboProxyService } from '@/services/habboProxyService';

export const HotelFeedColumn: React.FC = () => {
  const { aggregatedActivities, isLoading, error } = useHotelTicker();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Activity className="w-4 h-4 text-green-500" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'friend':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (timeString: string) => {
    const now = new Date();
    const activityTime = new Date(timeString);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return activityTime.toLocaleDateString('pt-BR');
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'login':
        return 'entrou no hotel';
      case 'achievement':
        return `conquistou "${activity.achievement}"`;
      case 'friend':
        return `fez amizade com ${activity.friend}`;
      default:
        return 'fez uma atividade';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5" />
            Feed do Hotel
            {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {isLoading && aggregatedActivities.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Carregando atividades do hotel...</p>
              </div>
            ) : aggregatedActivities.length > 0 ? (
              aggregatedActivities.map((userGroup, index) => (
                <div key={`${userGroup.username}-${index}`} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage 
                        src={habboProxyService.getAvatarUrl('', 'm')} 
                        alt={userGroup.username} 
                      />
                      <AvatarFallback className="text-sm font-bold">
                        {userGroup.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-600">{userGroup.username}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {userGroup.activityCount} atividade{userGroup.activityCount !== 1 ? 's' : ''}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTime(userGroup.lastActivityTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-13">
                    {userGroup.activities.slice(0, 3).map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-start gap-2 text-sm">
                        {getActivityIcon(activity.type)}
                        <span className="text-gray-700">
                          {getActivityText(activity)}
                        </span>
                      </div>
                    ))}
                    {userGroup.activities.length > 3 && (
                      <p className="text-xs text-gray-500 ml-6">
                        +{userGroup.activities.length - 3} outras atividades
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
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
