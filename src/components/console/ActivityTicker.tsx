import React from 'react';
import { TickerActivity } from '@/services/habboProxyService';
import { unifiedHabboService } from '@/services/unifiedHabboService';
import { useFigureData } from '@/hooks/useFigureData';
import { useUserFigures } from '@/hooks/useUserFigures';

interface ActivityTickerProps {
  activities: TickerActivity[];
}

const formatActivityTime = (timestamp: string | undefined): string => {
  if (!timestamp) return 'agora';

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return 'agora';
  } else if (minutes < 60) {
    return `há ${minutes} min`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `há ${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `há ${days} dia${days > 1 ? 's' : ''}`;
  }
};

export const ActivityTicker: React.FC<ActivityTickerProps> = ({ activities }) => {
  const usernames = activities.map(activity => activity.username);
  const { figureMap, isLoading } = useUserFigures(usernames);

  if (isLoading) {
    return <p className="text-sm text-white/50">Carregando atividades...</p>;
  }

  return (
    <div className="space-y-2">
      {activities.map((activity, index) => (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-habbo-blue/10 border border-habbo-blue/20">
                <img
                  src={unifiedHabboService.getAvatarUrl(figureMap[activity.username] || 'lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62', 'xs', true)}
                  alt={activity.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/90 font-medium truncate">
                    {activity.username}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {activity.activity || activity.description || 'fez uma atividade'}
                  </p>
                </div>
                <p className="text-xs text-white/40">
                  {formatActivityTime(activity.timestamp || activity.time)}
                </p>
              </div>
      ))}
      {activities.length === 0 && (
        <p className="text-sm text-white/50">Nenhuma atividade recente.</p>
      )}
    </div>
  );
};
