
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Trophy, Users, Loader2, Hotel, RefreshCw, Wifi, Archive, Heart, Camera, UserPlus, MessageSquare, Database, Clock, Star, Quote } from 'lucide-react';
import { useRealHotelFeed } from '@/hooks/useRealHotelFeed';
import { habboFeedService } from '@/services/habboFeedService';
import { useUserFigures } from '@/hooks/useUserFigures';

export const RealHotelFeedColumn: React.FC = () => {
  const [onlineWindowSec, setOnlineWindowSec] = useState<number | null>(1800);
  const { activities, aggregatedActivities, isLoading, error, hotel, metadata, refetch } = useRealHotelFeed(
    onlineWindowSec ? { onlineWithinSeconds: onlineWindowSec } : undefined
  );
  
  const usernames = activities.map(activity => activity.username);
  const { figureMap } = useUserFigures(usernames);

  useEffect(() => {
    if (activities.length > 0) {
      console.log(`📊 [RealHotelFeedColumn] Displaying ${activities.length} feed activities for hotel ${hotel}`);
      console.log(`👥 [RealHotelFeedColumn] Total unique users: ${usernames.length} (source: ${metadata.source})`);
    }
  }, [activities, usernames.length, hotel, metadata.source]);

  // Refresh feed when a global event is dispatched (e.g., after login)
  useEffect(() => {
    const handler = () => {
      console.log('🔄 [RealHotelFeedColumn] feed:refresh received -> refetch');
      refetch();
    };
    // @ts-ignore - Custom event type
    window.addEventListener('feed:refresh', handler);
    return () => {
      // @ts-ignore - Custom event type
      window.removeEventListener('feed:refresh', handler);
    };
  }, [refetch]);

  // Handle infinite scroll to expand time window in 30min steps
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const target = e.currentTarget;
    const threshold = 120; // px from bottom
    if (target.scrollHeight - target.scrollTop - target.clientHeight < threshold && !isLoading) {
      setOnlineWindowSec((prev) => (prev ? prev + 1800 : 1800));
      // slight delay to allow refetch
      setTimeout(() => refetch(), 50);
    }
  };

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

  const handleBatchSync = async () => {
    try {
      await habboFeedService.triggerBatchSync(hotel);
      // Refetch after sync
      setTimeout(() => refetch(), 2000);
    } catch (error) {
      console.error('Failed to trigger batch sync:', error);
    }
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
                onClick={handleBatchSync}
                disabled={isLoading}
                className="text-white hover:bg-white/10 p-1 h-auto mr-1"
                title="Sincronizar dados"
              >
                <Database className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="text-white hover:bg-white/10 p-1 h-auto"
                title="Atualizar feed"
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
            {onlineWindowSec && (
              <span>• janela: {Math.floor((onlineWindowSec || 0) / 60)}min</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div ref={scrollRef} onScroll={handleScroll} className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-stealth">
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
                    <div className="flex-shrink-0 relative">
                      {(activity.profile?.figureString || figureMap[activity.username]) ? (
                        <img 
                          src={habboFeedService.getAvatarUrl(
                            activity.profile?.figureString || figureMap[activity.username], 
                            'l', false
                          )} 
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
                      
                      {/* Online status indicator */}
                      {activity.profile?.isOnline && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-blue-200">{activity.username}</h4>
                        {activity.profile?.isOnline && (
                          <Badge className="bg-green-500/20 text-green-300 text-xs border-green-500/30">
                            Online
                          </Badge>
                        )}
                      </div>
                      
                      {activity.profile?.motto && (
                        <div className="flex items-center gap-1 mb-2">
                          <Quote className="w-3 h-3 text-white/50" />
                          <p className="text-white/70 text-xs italic">"{activity.profile.motto}"</p>
                        </div>
                      )}
                      
                      <p className="text-white/90 text-sm mb-2">{activity.description}</p>
                      
                      {/* Profile stats */}
                      <div className="flex items-center gap-4 mb-2 text-xs text-white/60">
                        {activity.profile?.groupsCount !== undefined && activity.profile.groupsCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{activity.profile.groupsCount} grupos</span>
                          </div>
                        )}
                        {activity.profile?.friendsCount !== undefined && activity.profile.friendsCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{activity.profile.friendsCount} amigos</span>
                          </div>
                        )}
                        {activity.profile?.badgesCount !== undefined && activity.profile.badgesCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            <span>{activity.profile.badgesCount} emblemas</span>
                          </div>
                        )}
                        {activity.profile?.photosCount !== undefined && activity.profile.photosCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>{activity.profile.photosCount} fotos</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Clock className="w-3 h-3" />
                        <span>Última atualização {habboFeedService.formatTimeAgo(activity.lastUpdate)}</span>
                        {activity.profile?.memberSince && (
                          <>
                            <span>•</span>
                            <span>Membro desde {new Date(activity.profile.memberSince).getFullYear()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* HabboWidgets-style sections */}
                  <div className="space-y-3 ml-[4.5rem]">
                    {activity.groups.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Grupos Recentes
                        </h3>
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
                        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          Amigos Recentes
                        </h3>
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
                        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          Emblemas Selecionados
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                          {activity.badges.slice(0, 5).map((badge, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1 p-2 bg-white/5 rounded text-center">
                              <img 
                                src={habboFeedService.getBadgeUrl(badge.code)} 
                                alt={badge.code}
                                className="w-6 h-6"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <span className="text-white/70 text-xs truncate w-full" title={badge.name || badge.code}>
                                {badge.code}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fotos recentes */}
                    {Array.isArray((activity as any).photos) && (activity as any).photos.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
                          <Camera className="w-4 h-4" />
                          Fotos recentes
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {(activity as any).photos.slice(0, 6).map((photo: any, idx: number) => (
                            <img
                              key={idx}
                              src={photo.url}
                              alt={photo.caption || `${activity.username} photo ${idx+1}`}
                              className="w-full h-24 object-cover rounded bg-white/5"
                              loading="lazy"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
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
