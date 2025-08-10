
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Trophy, Users, Loader2, Hotel } from 'lucide-react';
import { TickerActivity } from '@/services/habboProxyService';

interface ActivityTickerProps {
  activities: TickerActivity[];
  isLoading?: boolean;
}

export const ActivityTicker: React.FC<ActivityTickerProps> = ({ 
  activities, 
  isLoading = false 
}) => {
  const getActivityIcon = (description: string) => {
    if (!description) return <Activity className="w-4 h-4 text-gray-500" />;
    
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
    if (desc.includes('entrou') || desc.includes('login')) {
      return <Activity className="w-4 h-4 text-green-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Atividades Recentes
          {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {isLoading && activities.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Carregando atividades...</p>
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.description)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    <span className="font-semibold">{activity.username}</span> {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {formatTime(activity.time)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma atividade recente</p>
              <p className="text-xs mt-1">As atividades aparecerão aqui em tempo real</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
