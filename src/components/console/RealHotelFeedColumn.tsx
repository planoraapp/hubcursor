
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Trophy, Users, Loader2, Hotel, RefreshCw, Wifi, Archive, Heart, Camera, UserPlus, MessageSquare } from 'lucide-react';
import { useRealHotelFeed } from '@/hooks/useRealHotelFeed';
import { habboFeedService } from '@/services/habboFeedService';
import { useUserFigures } from '@/hooks/useUserFigures';

export const RealHotelFeedColumn: React.FC = () => {
  const { activities, aggregatedActivities, isLoading, error, hotel, metadata, refetch } = useRealHotelFeed();
  
  const usernames = activities.map(activity => activity.username);
  const { figureMap } = useUserFigures(usernames);

  useEffect(() => {
    if (activities.length > 0) {
      console.log(`📊 [RealHotelFeedColumn] Displaying ${activities.length} feed activities for hotel ${hotel}`);
      console.log(`👥 [RealHotelFeedColumn] Total unique users: ${usernames.length} (source: ${metadata.source})`);
    }
  }, [activities, usernames.length, hotel, metadata.source]);

  const getSourceIcon = () => {
    switch (metadata.source) {
      case 'live':
        return <Wifi className="w-4 h-4 text-green-500" />;
      default:
        return <Archive className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSourceColor = () => {
    switch (metadata.source) {
      case 'live':
        return 'bg-green-500/20 text-green-200';
      default:
        return 'bg-gray-500/20 text-gray-200';
    }
  };

  const getSourceLabel = () => {
    switch (metadata.source) {
      case 'live':
        return 'Dados Oficiais';
      default:
        return 'Cache';
    }
  };

  const getLastUpdateText = () => {
    return habboFeedService.formatTimeAgo(metadata.timestamp);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5" />
            Feed Oficial ({hotel})
            {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
            
            <div className="ml-auto flex items-center gap-2">
              <Badge className={`text-xs ${getSourceColor()} border-0`}>
                {getSourceIcon()}
                <span className="ml-1">{getSourceLabel()}</span>
              </Badge>
              
              {activities.length > 0 && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {activities.length} usuários
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="text-white hover:bg-white/10 p-1 h-auto"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
          
          <div className="text-xs text-white/70 flex items-center gap-2">
            <span>Última atualização: {getLastUpdateText()}</span>
            {metadata.count > 0 && (
              <span>• {metadata.count} atividades</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-stealth">
            {isLoading && activities.length === 0 ? (
              <div className="text-center text-white/70 py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Carregando feed oficial...</p>
              </div>
            ) : error ? (
              <div className="text-center text-white/70 py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Erro ao carregar feed</p>
                <p className="text-xs mt-1">Tentando novamente...</p>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={`${activity.username}-${index}`} className="p-4 mb-3 bg-transparent hover:bg-white/5 rounded-lg transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      {figureMap[activity.username] ? (
                        <img 
                          src={habboFeedService.getAvatarUrl(figureMap[activity.username], 'l', false)} 
                          alt={activity.username}
                          className="h-[130px] w-auto object-contain bg-transparent"
                        />
                      ) : (
                        <div className="h-[130px] w-16 bg-white/10 flex items-center justify-center rounded">
                          <span className="text-2xl font-bold">
                            {activity.username[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-blue-200 mb-1">{activity.username}</h4>
                      <p className="text-white/90 text-sm mb-2">{activity.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-white/60">
                          Última atualização {habboFeedService.formatTimeAgo(activity.lastUpdate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* HabboWidgets-style sections */}
                  <div className="space-y-3 ml-[4.5rem]">
                    {activity.groups.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2">Grupos</h3>
                        <div className="space-y-2">
                          {activity.groups.slice(0, 3).map((group, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-white/5 rounded">
                              <img 
                                src={habboFeedService.getGroupBadgeUrl(group.badgeCode)} 
                                alt={group.name}
                                className="w-6 h-6"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <span className="text-white/90">{group.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activity.friends.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2">Amigos</h3>
                        <div className="space-y-2">
                          {activity.friends.slice(0, 5).map((friend, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-white/5 rounded">
                              {friend.figureString ? (
                                <img 
                                  src={habboFeedService.getAvatarUrl(friend.figureString, 'b', true)} 
                                  alt={friend.name}
                                  className="w-8 h-8"
                                />
                              ) : (
                                <UserPlus className="w-4 h-4 text-green-500" />
                              )}
                              <span className="text-white/90">{friend.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activity.badges.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2">Emblemas</h3>
                        <div className="space-y-2">
                          {activity.badges.slice(0, 5).map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-white/5 rounded">
                              <img 
                                src={habboFeedService.getBadgeUrl(badge.code)} 
                                alt={badge.code}
                                className="w-6 h-6"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <span className="text-white/90">{badge.code}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-white/70 py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
                <p className="text-xs mt-1">Aguardando sincronização automática</p>
                <p className="text-xs mt-2 text-blue-300">ℹ️ Sistema coletando dados da API oficial do Habbo</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
