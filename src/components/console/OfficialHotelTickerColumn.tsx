
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Camera, UserPlus, Trophy, Palette } from 'lucide-react';
import { useRealHotelFeed } from '@/hooks/useRealHotelFeed';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { habboFeedService } from '@/services/habboFeedService';

export const OfficialHotelTickerColumn: React.FC = () => {
  const { habboAccount } = useUnifiedAuth();
  
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
      target.setHours(20, 0, 0, 0); // 20:00 today
      if (now.getTime() < target.getTime()) {
        target.setDate(target.getDate() - 1); // if before 20:00, use yesterday 20:00
      }
      return Math.floor((now.getTime() - target.getTime()) / 1000);
    })()
  });

  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const hasInitialized = useRef(false);

  // Initialize feed and set up periodic sync
  useEffect(() => {
    const initializeFeed = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      console.log('🎯 [Feed Hotel] Inicializando feed do hotel...');
      
      try {
        // Ensure current user is tracked first
        if (habboAccount?.habbo_name && habboAccount?.habbo_id) {
          console.log(`🧭 [Feed Hotel] Ensuring user ${habboAccount.habbo_name} is tracked`);
          await habboFeedService.ensureTrackedAndSynced({
            habbo_name: habboAccount.habbo_name,
            habbo_id: habboAccount.habbo_id,
            hotel: hotel === 'com.br' ? 'br' : hotel
          });
        }

        // Start data discovery and sync
        await discoverOnlineUsers();
        await habboFeedService.triggerBatchSync(hotel);
        
        // Refresh feed after sync
        setTimeout(() => refetch(), 3000);
        
        console.log('✅ [Feed Hotel] Inicialização concluída');
      } catch (error) {
        console.warn('⚠️ [Feed Hotel] Erro na inicialização:', error);
      }

      // Set up periodic sync every 4 minutes
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
    
    // Added friends (detailed list)
    if (activity.friends && activity.friends.length > 0) {
      items.push({
        type: 'friends',
        icon: UserPlus,
        text: `${activity.friends.length} novo(s) amigo(s)`,
        data: activity.friends
      });
    } else if (activity.counts?.friends > 0) {
      // Fallback to counts
      items.push({ type: 'friends', icon: UserPlus, text: `${activity.counts.friends} novo(s) amigo(s)` });
    }
    
    // Earned badges
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
    
    // Posted photos
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
    
    // Changed look (avatar)
    if (activity.counts?.avatarChanged) {
      items.push({ type: 'avatar', icon: Palette, text: 'mudou o visual' });
    }
    
    return items;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Feed do Hotel
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-white hover:bg-white/10 p-1 h-auto ml-auto"
              title="Atualizar"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-stealth">
            {isLoading && activities.length === 0 ? (
              <div className="text-center text-white/70 py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Carregando feed do hotel...</p>
              </div>
            ) : error ? (
              <div className="text-center text-white/70 py-8">
                <p>Erro ao carregar feed</p>
                <Button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Tentar Novamente
                </Button>
              </div>
            ) : activities.length > 0 ? (
              <>
                {activities.map((activity, index) => {
                  const activityItems = getActivityItems(activity);
                  
                  return (
                    <div key={`${activity.username}-${activity.lastUpdate}-${index}`} className="p-4 mb-3 bg-transparent hover:bg-white/5 rounded-lg transition-colors">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {activity.profile?.figureString ? (
                            <img 
                              src={habboFeedService.getAvatarUrl(activity.profile.figureString, 'l', false)} 
                              alt={activity.username}
                              className="h-[100px] w-auto object-contain bg-transparent cursor-pointer"
                              loading="lazy"
                              onClick={() => window.open(`https://www.habbo.${hotel}/profile/${activity.username}`, '_blank')}
                              title={`Ver perfil de ${activity.username}`}
                            />
                            ) : (
                              <div className="h-[100px] w-16 bg-white/10 flex items-center justify-center rounded cursor-pointer"
                                   onClick={() => window.open(`https://www.habbo.${hotel}/profile/${activity.username}`, '_blank')}>
                                <span className="text-xl font-bold">
                                  {activity.username[0]?.toUpperCase()}
                                </span>
                              </div>
                            )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 
                              className="font-semibold text-blue-200 cursor-pointer hover:text-blue-100"
                              onClick={() => window.open(`https://www.habbo.${hotel}/profile/${activity.username}`, '_blank')}
                            >
                              {activity.username}
                            </h4>
                          </div>
                          
                          {/* Activity items */}
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
                          
                          {/* Time */}
                          <div className="text-xs text-white/50">
                            {habboFeedService.formatTimeAgo(activity.lastUpdate)}
                          </div>
                        </div>
                      </div>

                      {/* Detailed sections */}
                      <div className="space-y-3 ml-[7rem] mt-3">
                        {/* Friends */}
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
                                    onClick={() => window.open(`https://www.habbo.${hotel}/profile/${friend.name}`, '_blank`)}
                                  >
                                    {friend.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Badges */}
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

                        {/* Photos */}
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
                                  onClick={() => window.open(`https://www.habbo.com.br/profile/${activity.username}`, '_blank')}
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
