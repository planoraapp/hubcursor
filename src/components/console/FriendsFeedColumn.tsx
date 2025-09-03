import React, { useMemo } from 'react';
import { HabboFriend, TickerActivity } from '@/services/habboProxyService';
import { habboProxyService } from '@/services/habboProxyService';
import { useUserFigures } from '@/hooks/useUserFigures';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FriendsFeedColumnProps {
  friendsActivities: {
    friend: HabboFriend;
    activities: TickerActivity[];
    lastActivityTime: string;
  }[];
  isLoading: boolean;
}

export const FriendsFeedColumn: React.FC<FriendsFeedColumnProps> = ({ friendsActivities, isLoading }) => {
  const friendNames = useMemo(() => friendsActivities.map(fa => fa.friend.name), [friendsActivities]);
  const { figureMap } = useUserFigures(friendsActivities.map(fa => fa.friend.name));

  const formatActivityTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR });
    } catch (error) {
      console.warn('Erro ao formatar a data:', error);
      return 'há alguns segundos';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!friendsActivities || friendsActivities.length === 0) {
    return (
      <div className="p-4 text-center text-white/60">
        Nenhum amigo esteve online recentemente.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {friendsActivities.map((friendActivity) => (
        <div key={friendActivity.friend.uniqueId} className="bg-habbo-blue/10 border-t border-dashed border-white/20 first:border-t-0">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <Avatar>
                {figureMap && figureMap[friendActivity.friend.name] ? (
                  <AvatarImage src={habboProxyService.getAvatarUrl(figureMap[friendActivity.friend.name], 's', true)} alt={friendActivity.friend.name} />
                ) : (
                  <AvatarFallback>{friendActivity.friend.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white/90">{friendActivity.friend.name}</p>
                <p className="text-[0.7rem] text-white/40">
                  Visto por último {formatActivityTime(friendActivity.lastActivityTime)}
                </p>
              </div>
            </div>
            {friendActivity.friend.online && (
              <div className="rounded-full w-3 h-3 bg-green-500 shadow-sm shadow-green-500/50" title="Online"></div>
            )}
          </div>
          <div className="px-3 pb-3">
            {friendActivity.activities.length > 0 ? (
              friendActivity.activities.map((activity, index) => (
                <div key={index} className="text-white/80 text-xs">
                  <span className="font-semibold">{activity.username}</span> {activity.activity || activity.description || 'fez uma atividade'}
                </div>
              ))
            ) : (
              <div className="text-white/60 text-xs italic">
                Nenhuma atividade recente.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
