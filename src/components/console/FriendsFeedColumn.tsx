
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, Activity, Loader2, UserPlus } from 'lucide-react';
import { useFriendsFeed } from '@/hooks/useFriendsFeed';
import { UserSearch } from './UserSearch';
import { habboProxyService } from '@/services/habboProxyService';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useQuery } from '@tanstack/react-query';

export const FriendsFeedColumn: React.FC = () => {
  const { isLoggedIn } = useUnifiedAuth();
  const { friends, friendsActivities, isLoading, hasFriends } = useFriendsFeed();

  // Hook para busca de usuário
  const [searchedUser, setSearchedUser] = React.useState<any>(null);
  const [searchLoading, setSearchLoading] = React.useState(false);

  const handleUserSearch = async (username: string) => {
    setSearchLoading(true);
    try {
      const user = await habboProxyService.getUserByName(username);
      setSearchedUser(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      setSearchedUser(null);
    } finally {
      setSearchLoading(false);
    }
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
            <Users className="w-5 h-5" />
            Feed de Amigos {isLoggedIn && `(${friends.length})`}
            {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Busca de Usuário */}
          <div className="mb-4">
            <UserSearch 
              onSearch={handleUserSearch}
              isLoading={searchLoading}
              placeholder="Buscar usuário do Habbo..."
            />
            
            {/* Resultado da busca */}
            {searchedUser && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 rounded-none border-0 bg-transparent">
                    <AvatarImage 
                      className="rounded-none"
                      src={habboProxyService.getAvatarUrl(searchedUser.figureString, 'm')} 
                      alt={searchedUser.name} 
                    />
                    <AvatarFallback className="text-sm font-bold rounded-none bg-transparent">
                      {searchedUser.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{searchedUser.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${
                        searchedUser.online ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <p className="text-sm text-white/70 italic">
                      "{searchedUser.motto}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-stealth">
            {!isLoggedIn ? (
              <div className="text-center py-6">
                <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Login necessário
                </h3>
                <p className="text-white/70 text-sm">
                  Conecte sua conta Habbo para ver as atividades dos seus amigos
                </p>
              </div>
            ) : isLoading ? (
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
                          {activity.description}
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
