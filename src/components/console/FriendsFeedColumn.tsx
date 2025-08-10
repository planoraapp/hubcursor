
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, Activity, Loader2, UserPlus } from 'lucide-react';
import { useFriendsFeed } from '@/hooks/useFriendsFeed';
import { habboProxyService } from '@/services/habboProxyService';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export const FriendsFeedColumn: React.FC = () => {
  const { isLoggedIn } = useUnifiedAuth();
  const { friends, friendsActivities, isLoading, hasFriends } = useFriendsFeed();

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <Card className="bg-[#5A6573] text-white border-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Feed de Amigos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Login necessário
            </h3>
            <p className="text-white/70">
              Conecte sua conta Habbo para ver as atividades dos seus amigos
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Feed de Amigos ({friends.length})
            {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center text-white/70 py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Carregando atividades dos amigos...</p>
              </div>
            ) : !hasFriends ? (
              <div className="text-center text-white/70 py-8">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum amigo encontrado</p>
                <p className="text-xs mt-1">Adicione amigos no Habbo para ver suas atividades aqui</p>
              </div>
            ) : friendsActivities.length > 0 ? (
              friendsActivities.map((friendActivity, index) => (
                <div key={`${friendActivity.friend.name}-${index}`} className="p-4 mb-3">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-12 h-12 rounded-none border-0 bg-transparent">
                      <AvatarImage 
                        className="rounded-none"
                        src={habboProxyService.getAvatarUrl(friendActivity.friend.figureString, 'm')} 
                        alt={friendActivity.friend.name} 
                      />
                      <AvatarFallback className="text-sm font-bold rounded-none bg-transparent">
                        {friendActivity.friend.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-blue-200">{friendActivity.friend.name}</h4>
                        <div className={`w-2 h-2 rounded-full ${
                          friendActivity.friend.online ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <p className="text-sm text-white/70 italic mb-2">
                        "{friendActivity.friend.motto}"
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-15">
                    {friendActivity.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-start gap-2 text-sm">
                        <Activity className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-white/90 flex-1">
                          {activity.type === 'login' ? 'entrou no hotel' : 'fez uma atividade'}
                        </span>
                        <span className="text-xs text-white/60 ml-2">
                          {formatTime(activity.time)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-white/70 py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
                <p className="text-xs mt-1">As atividades dos seus amigos aparecerão aqui</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
