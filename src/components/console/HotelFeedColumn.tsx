
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
    return new Date(timeString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
      <Card className="bg-[#5A6573] text-white border-0 shadow-none">
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
              <div className="text-center text-white/70 py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Carregando atividades do hotel...</p>
              </div>
            ) : aggregatedActivities.length > 0 ? (
              aggregatedActivities.map((userGroup, index) => (
                <div key={`${userGroup.username}-${index}`} className="p-4 mb-3 bg-transparent">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10 rounded-none border-0 bg-transparent">
                      <AvatarImage 
                        className="rounded-none"
                        src={habboProxyService.getAvatarUrl('', 'm')} 
                        alt={userGroup.username} 
                      />
                      <AvatarFallback className="text-sm font-bold rounded-none bg-transparent">
                        {userGroup.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-200">{userGroup.username}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                          {userGroup.activityCount} atividade{userGroup.activityCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-13">
                    {userGroup.activities.slice(0, 3).map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-start gap-2 text-sm">
                        {getActivityIcon(activity.type)}
                        <span className="text-white/90 flex-1">
                          {getActivityText(activity)}
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
