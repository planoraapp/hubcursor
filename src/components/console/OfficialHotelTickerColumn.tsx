
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Camera, UserPlus, Trophy, Palette, Radio, Filter } from 'lucide-react';
import { useRealHotelFeed } from '@/hooks/useRealHotelFeed';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { habboFeedService } from '@/services/habboFeedService';
import { supabase } from '@/integrations/supabase/client';

export const OfficialHotelTickerColumn: React.FC = () => {
  const { habboAccount } = useUnifiedAuth();
  const [onlyOnline, setOnlyOnline] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'friends' | 'following'>('all');
  
  const { 
    activities, 
    isLoading, 
    error, 
    hotel, 
    refetch, 
    discoverOnlineUsers 
  } = useRealHotelFeed({ 
    mode: 'hybrid',
    onlineWithinSeconds: (() => {
      const now = new Date();
      const target = new Date();
      target.setHours(20, 0, 0, 0);
      if (now.getTime() < target.getTime()) {
        target.setDate(target.getDate() - 1);
      }
      return Math.floor((now.getTime() - target.getTime()) / 1000);
    })(),
    onlyOnline,
  });

  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initializeFeed = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      console.log('🎯 [Feed Hotel] Inicializando feed do hotel...');
      
      try {
        if (habboAccount?.habbo_name && habboAccount?.habbo_id) {
          console.log(`🧭 [Feed Hotel] Ensuring user ${habboAccount.habbo_name} is tracked`);
          await habboFeedService.ensureTrackedAndSynced({
            habbo_name: habboAccount.habbo_name,
            habbo_id: habboAccount.habbo_id,
            hotel: hotel === 'com.br' ? 'br' : hotel
          });
        }

        await discoverOnlineUsers();
        await habboFeedService.triggerBatchSync(hotel);
        
        setTimeout(() => refetch(), 3000);
        
        console.log('✅ [Feed Hotel] Inicialização concluída');
      } catch (error) {
        console.warn('⚠️ [Feed Hotel] Erro na inicialização:', error);
      }

      syncIntervalRef.current = setInterval(async () => {
        try {
          console.log('🔄 [Feed Hotel] Sync periódico iniciado');
          await habboFeedService.triggerBatchSync(hotel);
          setTimeout(() => refetch(), 2000);
        } catch (error) {
          console.warn('⚠️ [Feed Hotel] Erro no sync periódico:', error);
        }
      }, 4 * 60 * 1000);
    };

    if (habboAccount && hotel) {
      initializeFeed();
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [hotel, habboAccount, discoverOnlineUsers, refetch]);

  const handleRefresh = async () => {
    try {
      console.log('🔄 [Feed Hotel] Refresh manual iniciado');
      await discoverOnlineUsers();
      await habboFeedService.triggerBatchSync(hotel);
      setTimeout(() => refetch(), 3000);
    } catch (error) {
      console.error('❌ [Feed Hotel] Erro na atualização:', error);
    }
  };

  const getActivityItems = (activity: any) => {
    const items: Array<{ type: string; icon: any; text: string; data?: any }> = [];
    
    if (activity.friends && activity.friends.length > 0) {
      items.push({
        type: 'friends',
        icon: UserPlus,
        text: `${activity.friends.length} novo(s) amigo(s)`,
        data: activity.friends
      });
    } else if (activity.counts?.friends > 0) {
      items.push({ type: 'friends', icon: UserPlus, text: `${activity.counts.friends} novo(s) amigo(s)` });
    }
    
    if (activity.badges && activity.badges.length > 0) {
      items.push({
        type: 'badges',
        icon: Trophy,
        text: `${activity.badges.length} novo(s) emblema(s)`,
        data: activity.badges
      });
    } else if (activity.counts?.badges > 0) {
      items.push({ type: 'badges', icon: Trophy, text: `${activity.counts.badges} novo(s) emblema(s)` });
    }
    
    if (activity.photos && activity.photos.length > 0) {
      items.push({
        type: 'photos',
        icon: Camera,
        text: `${activity.photos.length} nova(s) foto(s)`,
        data: activity.photos
      });
    } else if (activity.counts?.photos > 0) {
      items.push({ type: 'photos', icon: Camera, text: `${activity.counts.photos} nova(s) foto(s)` });
    }
    
    if (activity.counts?.avatarChanged) {
      items.push({ type: 'avatar', icon: Palette, text: 'mudou o visual' });
    }
    
    return items;
  };

  const filteredActivities = activities.filter(activity => {
    if (filterMode === 'all') return true;
    // TODO: Implementar filtros de amigos/seguindo quando houver backend
    return true;
  });

  return (
    <div className="space-y-4">
      <Card className="bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Feed do Hotel
              <Badge variant="outline" className="text-green-300 border-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Ao Vivo
              </Badge>
            </div>
            
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterMode(filterMode === 'all' ? 'friends' : 'all')}
                className={`px-2 py-1 h-auto text-xs ${filterMode !== 'all' ? 'bg-white/10' : ''}`}
                title="Filtrar atividades"
              >
                <Filter className="w-3 h-3 mr-1" />
                {filterMode === 'all' ? 'Todos' : 'Amigos'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOnlyOnline((v) => !v)}
                className={`px-2 py-1 h-auto text-xs ${onlyOnline ? 'bg-white/10' : ''}`}
                title="Alternar: apenas online"
              >
                {onlyOnline ? 'Apenas online' : 'Todos'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="text-white hover:bg-white/10 p-1 h-auto"
                title="Atualizar"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-stealth">
            {isLoading && activities.length === 0 ? (
              <div className="text-center text-white/70 py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Carregando feed do hotel...</p>
                <p className="text-xs mt-1 opacity-70">Buscando atividades em tempo real</p>
              </div>
            ) : error ? (
              <div className="text-center text-white/70 py-8">
                <p className="text-red-300">Erro ao carregar feed</p>
                <p className="text-xs mt-1">{error.message || 'Erro desconhecido'}</p>
                <Button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Tentar Novamente
                </Button>
              </div>
            ) : filteredActivities.length > 0 ? (
              <>
                {filteredActivities.map((activity, index) => {
                  const activityItems = getActivityItems(activity);
                  
                  return (
                    <div key={`${activity.username}-${activity.lastUpdate}-${index}`} className="p-4 mb-3 bg-transparent hover:bg-white/5 rounded-lg transition-colors border-l-2 border-blue-400/50">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {activity.profile?.figureString ? (
                            <img 
                              src={habboFeedService.getAvatarUrl(activity.profile.figureString, 'l', false)} 
                              alt={activity.username}
                              className="h-[100px] w-auto object-contain bg-transparent cursor-pointer hover:scale-105 transition-transform"
                              loading="lazy"
                              onClick={() => window.open(`https://www.habbo.${hotel}/profile/${activity.username}`, '_blank')}
                              title={`Ver perfil de ${activity.username}`}
                            />
                            ) : (
                              <div className="h-[100px] w-16 bg-white/10 flex items-center justify-center rounded cursor-pointer hover:bg-white/20 transition-colors"
                                   onClick={() => window.open(`https://www.habbo.${hotel}/profile/${activity.username}`, '_blank')}>
                                <span className="text-xl font-bold">
                                  {activity.username[0]?.toUpperCase()}
                                </span>
                              </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 
                              className="font-semibold text-blue-200 cursor-pointer hover:text-blue-100 transition-colors"
                              onClick={() => window.open(`https://www.habbo.${hotel}/profile/${activity.username}`, '_blank')}
                            >
                              {activity.username}
                            </h4>
                            {activity.profile?.isOnline && (
                              <Badge variant="default" className="bg-green-500/20 text-green-200 border-0 text-xs">
                                Online
                              </Badge>
                            )}
                          </div>
                          
                          {activityItems.length > 0 ? (
                            <div className="space-y-2 mb-3">
                              {activityItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-white/90">
                                  <item.icon className="w-4 h-4 text-blue-300" />
                                  <span>{item.text}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/70 text-sm mb-3">{activity.description}</p>
                          )}
                          
                          <div className="text-xs text-white/50">
                            {habboFeedService.formatTimeAgo(activity.lastUpdate)}
                          </div>
                        </div>
                      </div>

                      {/* Detailed sections */}
                      <div className="space-y-3 ml-[7rem] mt-3">
                        {activity.friends && activity.friends.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-white/80 mb-2">Novos Amigos</h5>
                            <div className="space-y-1">
                              {activity.friends.slice(0, 5).map((friend: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-white/5 rounded">
                                  {friend.figureString ? (
                                    <img 
                                      src={habboFeedService.getAvatarUrl(friend.figureString, 'b', true)} 
                                      alt={friend.name}
                                      className="w-6 h-6 cursor-pointer"
                                      loading="lazy"
                                      onClick={() => window.open(`https://www.habbo.${hotel}/profile/${friend.name}`, '_blank')}
                                    />
                                  ) : (
                                    <UserPlus className="w-4 h-4 text-green-500" />
                                  )}
                                  <span 
                                    className="text-white/90 cursor-pointer hover:text-white"
                                    onClick={() => window.open(`https://www.habbo.${hotel}/profile/${friend.name}`, '_blank')}
                                  >
                                    {friend.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activity.badges && activity.badges.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-white/80 mb-2">Novos Emblemas</h5>
                            <div className="grid grid-cols-4 gap-2">
                              {activity.badges.slice(0, 8).map((badge: any, idx: number) => (
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

                        {activity.photos && activity.photos.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-white/80 mb-2">Novas Fotos</h5>
                            <div className="grid grid-cols-3 gap-2">
                              {activity.photos.slice(0, 6).map((photo: any, idx: number) => (
                                <img
                                  key={idx}
                                  src={photo.url}
                                  alt={photo.caption || `Foto ${idx+1}`}
                                  className="w-full h-20 object-cover rounded bg-white/5 cursor-pointer hover:opacity-80 transition-opacity"
                                  loading="lazy"
                                  onClick={() => window.open(`https://www.habbo.${hotel}/profile/${activity.username}`, '_blank')}
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center text-white/70 py-8">
                <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma atividade encontrada</p>
                <p className="text-xs mt-1">Aguarde alguns minutos para que os dados sejam coletados...</p>
                <Button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Iniciar Coleta
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
