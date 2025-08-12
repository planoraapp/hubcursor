
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Trophy, Users, Loader2, Hotel, RefreshCw, Wifi, Archive, Heart, Camera, UserPlus, Database, Clock, Quote, Search, Radio } from 'lucide-react';
import { useRealHotelFeed } from '@/hooks/useRealHotelFeed';
import { habboFeedService } from '@/services/habboFeedService';
import { useUserFigures } from '@/hooks/useUserFigures';

export const RealHotelFeedColumn: React.FC = () => {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offsetHours, setOffsetHours] = useState(0);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  
  // Use official mode by default for live ticker behavior like HabboWidgets
  const { activities, isLoading, error, hotel, metadata, refetch, discoverOnlineUsers, loadMoreData } = useRealHotelFeed(
    { mode: 'official' }
  );
  
  const usernames = activities.map(activity => activity.username);
  const { figureMap } = useUserFigures(usernames);

  // Update allActivities when activities change
  useEffect(() => {
    if (activities.length > 0 && offsetHours === 0) {
      setAllActivities(activities);
    }
  }, [activities, offsetHours]);

  useEffect(() => {
    if (activities.length > 0) {
      console.log(`📊 [RealHotelFeedColumn] Displaying ${activities.length} official feed activities for hotel ${hotel}`);
      console.log(`👥 [RealHotelFeedColumn] Source: ${metadata.source}, Online users: ${metadata.onlineCount || 0}`);
    }
  }, [activities, hotel, metadata]);

  // Refresh feed when a global event is dispatched
  useEffect(() => {
    const handler = () => {
      console.log('🔄 [RealHotelFeedColumn] feed:refresh received -> refetch');
      setOffsetHours(0);
      setAllActivities([]);
      refetch();
    };
    // @ts-ignore - Custom event type
    window.addEventListener('feed:refresh', handler);
    return () => {
      // @ts-ignore - Custom event type
      window.removeEventListener('feed:refresh', handler);
    };
  }, [refetch]);

  // Handle infinite scroll to load older data
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll: React.UIEventHandler<HTMLDivElement> = useCallback(async (e) => {
    const target = e.currentTarget;
    const threshold = 120; // px from bottom
    
    if (target.scrollHeight - target.scrollTop - target.clientHeight < threshold && 
        !isLoading && !isLoadingMore && !isDiscovering) {
      
      setIsLoadingMore(true);
      const newOffsetHours = offsetHours + 2; // Load 2 more hours of data
      
      try {
        console.log(`📈 [RealHotelFeedColumn] Loading more data with ${newOffsetHours}h offset`);
        const olderData = await loadMoreData(newOffsetHours);
        
        if (olderData.activities.length > 0) {
          // Filter out duplicates and append new data
          const existingUsernames = new Set(allActivities.map(a => a.username));
          const newActivities = olderData.activities.filter(a => !existingUsernames.has(a.username));
          
          setAllActivities(prev => [...prev, ...newActivities]);
          setOffsetHours(newOffsetHours);
          console.log(`✅ [RealHotelFeedColumn] Added ${newActivities.length} more activities`);
        }
      } catch (error) {
        console.error('❌ [RealHotelFeedColumn] Failed to load more data:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [offsetHours, allActivities, isLoading, isLoadingMore, isDiscovering, loadMoreData]);

  const handleDiscoverUsers = useCallback(async () => {
    setIsDiscovering(true);
    try {
      console.log('🔍 [RealHotelFeedColumn] Manual user discovery triggered');
      await discoverOnlineUsers();
      // Refetch after discovery
      setTimeout(() => refetch(), 2000);
    } catch (error) {
      console.error('❌ [RealHotelFeedColumn] Discovery failed:', error);
    } finally {
      setIsDiscovering(false);
    }
  }, [discoverOnlineUsers, refetch]);

  const getSourceIcon = () => {
    switch (metadata.source) {
      case 'official':
        return <Radio className="w-4 h-4 text-green-500" />;
      case 'live':
        return <Wifi className="w-4 h-4 text-green-500" />;
      default:
        return <Archive className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSourceColor = () => {
    switch (metadata.source) {
      case 'official':
      case 'live':
        return 'bg-green-500/20 text-green-200';
      default:
        return 'bg-gray-500/20 text-gray-200';
    }
  };

  const getSourceLabel = () => {
    switch (metadata.source) {
      case 'official':
        return 'Ticker Oficial';
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

  const displayActivities = allActivities.length > 0 ? allActivities : activities;

  return (
    <div className="space-y-4">
      <Card className="bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5" />
            Feed Oficial ({hotel})
            {(isLoading || isDiscovering || isLoadingMore) && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
            
            <div className="ml-auto flex items-center gap-2">
              <Badge className={`text-xs ${getSourceColor()} border-0`}>
                {getSourceIcon()}
                <span className="ml-1">{getSourceLabel()}</span>
              </Badge>
              
              {metadata.onlineCount !== undefined && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-200">
                  {metadata.onlineCount} online
                </Badge>
              )}
              
              {displayActivities.length > 0 && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {displayActivities.length} usuários
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDiscoverUsers}
                disabled={isLoading || isDiscovering || isLoadingMore}
                className="text-white hover:bg-white/10 p-1 h-auto mr-1"
                title="Descobrir usuários online"
              >
                <Search className={`w-4 h-4 ${isDiscovering ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOffsetHours(0);
                  setAllActivities([]);
                  refetch();
                }}
                disabled={isLoading || isDiscovering || isLoadingMore}
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
            {offsetHours > 0 && (
              <span>• janela: {offsetHours}h expandida</span>
            )}
            {(isDiscovering || isLoadingMore) && (
              <span className="text-yellow-300">
                • {isDiscovering ? 'descobrindo usuários...' : 'carregando mais...'}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div ref={scrollRef} onScroll={handleScroll} className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-stealth">
            {isLoading && displayActivities.length === 0 ? (
              <div className="text-center text-white/70 py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Carregando ticker oficial...</p>
                <p className="text-xs mt-1">Conectando com API do Habbo...</p>
              </div>
            ) : error ? (
              <div className="text-center text-white/70 py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Erro ao carregar feed oficial</p>
                <p className="text-xs mt-1">Tentando novamente...</p>
              </div>
            ) : displayActivities.length > 0 ? (
              <>
                {displayActivities.map((activity, index) => (
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
                            loading="lazy"
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
                          {metadata.source === 'official' && (
                            <Badge className="bg-blue-500/20 text-blue-300 text-xs border-blue-500/30">
                              Ticker
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

                    {/* Content sections */}
                    <div className="space-y-3 ml-[4.5rem]">
                      {activity.groups && activity.groups.length > 0 && (
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
                                  loading="lazy"
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

                      {activity.friends && activity.friends.length > 0 && (
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
                                    loading="lazy"
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

                      {activity.badges && activity.badges.length > 0 && (
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
                                  loading="lazy"
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

                      {/* Photos section */}
                      {activity.photos && activity.photos.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
                            <Camera className="w-4 h-4" />
                            Fotos Recentes
                          </h3>
                          <div className="grid grid-cols-3 gap-2">
                            {activity.photos.slice(0, 6).map((photo, idx) => (
                              <img
                                key={idx}
                                src={photo.url}
                                alt={photo.caption || `${activity.username} foto ${idx+1}`}
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
                ))}
                
                {/* Loading more indicator */}
                {isLoadingMore && (
                  <div className="text-center text-white/70 py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Carregando atividades mais antigas...</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-white/70 py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente encontrada</p>
                <p className="text-xs mt-1">Conectando com o ticker oficial do Habbo...</p>
                <Button 
                  onClick={() => {
                    setOffsetHours(0);
                    setAllActivities([]);
                    refetch();
                  }}
                  disabled={isLoading}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Tentar Novamente
                </Button>
                <p className="text-xs mt-2 text-blue-300">ℹ️ Sistema conectado diretamente com o Ticker oficial do Habbo</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
