
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw, Activity, Clock } from 'lucide-react';
import { useFriendsFeed } from '@/hooks/useFriendsFeed';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FriendsActivityColumn: React.FC = () => {
  const { friendsActivities, isLoading, tickerMetadata } = useFriendsFeed();

  const formatActivityTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch (error) {
      console.warn('Erro ao formatar a data:', error);
      return 'há alguns momentos';
    }
  };

  return (
    <Card className="bg-[#4A5568] text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5" />
            Atividades dos Amigos
          </CardTitle>
          <div className="flex items-center gap-2">
            {tickerMetadata && (
              <div className="text-xs text-white/60">
                Fonte: {tickerMetadata.source}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-3 scrollbar-hide">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
          </div>
        ) : friendsActivities.length > 0 ? (
          friendsActivities.map((friendActivity) => (
            <div key={friendActivity.friend.uniqueId} className="bg-white/10 rounded-lg p-3 space-y-2">
              {/* Friend Header */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex-shrink-0">
                  <img
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${friendActivity.friend.name}&size=s&direction=2&head_direction=3&headonly=1`}
                    alt={`Avatar de ${friendActivity.friend.name}`}
                    className="w-full h-full object-contain bg-transparent"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${friendActivity.friend.name}&size=s&direction=2&head_direction=3&headonly=1`;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {friendActivity.friend.name}
                  </div>
                  <div className="text-xs text-white/60 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatActivityTime(friendActivity.lastActivityTime)}
                  </div>
                </div>
                {friendActivity.friend.online && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
                )}
              </div>

              {/* Activities */}
              <div className="space-y-1">
                {friendActivity.activities.length > 0 ? (
                  friendActivity.activities.slice(0, 3).map((activity, index) => (
                    <div key={index} className="text-sm text-white/80 pl-11">
                      {activity.activity || activity.description || 'fez uma atividade'}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-white/60 italic pl-11">
                    Nenhuma atividade recente
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/60">Nenhuma atividade de amigos encontrada</p>
            <p className="text-white/40 text-sm mt-2">
              Atividades dos seus amigos aparecerão aqui
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
