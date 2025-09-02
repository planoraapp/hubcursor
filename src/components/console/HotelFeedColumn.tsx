
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Trophy, Users, Loader2, Hotel, RefreshCw, Wifi, WifiOff, Archive, Heart, Camera, UserPlus, MessageSquare } from 'lucide-react';
import { useHotelActivities } from '@/hooks/useHotelActivities';
import { useUserFigures } from '@/hooks/useUserFigures';
import { habboProxyService } from '@/services/habboProxyService';

export const HotelFeedColumn: React.FC = () => {
  const { aggregatedActivities, isLoading, error, hotel, metadata, refetch } = useHotelActivities();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const usernames = aggregatedActivities.map(group => group.username);
  const { figureMap } = useUserFigures(usernames);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      console.log('✅ [HotelFeedColumn] Feed refreshed successfully');
    } catch (error) {
      console.error('❌ [HotelFeedColumn] Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (aggregatedActivities.length > 0) {
      console.log(`📊 [HotelFeedColumn] Displaying ${aggregatedActivities.length} user groups for hotel ${hotel}`);
      console.log(`👥 [HotelFeedColumn] Total unique users: ${usernames.length} (source: ${metadata.source})`);
      const totalActivities = aggregatedActivities.reduce((sum, group) => sum + group.activityCount, 0);
      console.log(`⚡ [HotelFeedColumn] Total activities: ${totalActivities}`);
    }
  }, [aggregatedActivities, usernames.length, hotel, metadata.source]);

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'motto_change':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'avatar_update':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'new_badge':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'new_photo':
        return <Camera className="w-4 h-4 text-pink-500" />;
      case 'new_friend':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'status_change':
        return <Activity className="w-4 h-4 text-orange-500" />;
      case 'user_tracked':
        return <Heart className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSourceIcon = () => {
    switch (metadata.source) {
      case 'live':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'empty':
        return <Archive className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSourceColor = () => {
    switch (metadata.source) {
      case 'live':
        return 'bg-green-500/20 text-green-200';
      case 'empty':
        return 'bg-gray-500/20 text-gray-200';
      default:
        return 'bg-gray-500/20 text-gray-200';
    }
  };

  const getSourceLabel = () => {
    switch (metadata.source) {
      case 'live':
        return 'Dados Reais';
      case 'empty':
        return 'Aguardando Dados';
      default:
        return 'Desconhecido';
    }
  };

  const getLastUpdateText = () => {
    const lastUpdate = new Date(metadata.timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'agora há pouco';
    if (diffMinutes < 60) return `há ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    return lastUpdate.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5" />
            Feed do Hotel ({hotel})
            {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
            
            <div className="ml-auto flex items-center gap-2">
              <Badge className={`text-xs ${getSourceColor()} border-0`}>
                {getSourceIcon()}
                <span className="ml-1">{getSourceLabel()}</span>
              </Badge>
              
              {aggregatedActivities.length > 0 && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {aggregatedActivities.length} usuários
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="text-white hover:bg-white/10 p-1 h-auto"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
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
            {isLoading && aggregatedActivities.length === 0 ? (
              <div className="text-center text-white/70 py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Carregando atividades do hotel...</p>
              </div>
            ) : error ? (
              <div className="text-center text-white/70 py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Erro ao carregar feed</p>
                <p className="text-xs mt-1">Tentando novamente...</p>
              </div>
            ) : aggregatedActivities.length > 0 ? (
              aggregatedActivities.map((userGroup, index) => (
                <div key={`${userGroup.username}-${index}`} className="p-4 mb-3 bg-transparent hover:bg-white/5 rounded-lg transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      {figureMap[userGroup.username] ? (
                        <img 
                          src={habboProxyService.getAvatarUrl(figureMap[userGroup.username], 'l')} 
                          alt={userGroup.username}
                          className="h-[130px] w-auto object-contain bg-transparent"
                        />
                      ) : (
                        <div className="h-[130px] w-16 bg-white/10 flex items-center justify-center rounded">
                          <span className="text-2xl font-bold">
                            {userGroup.username[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-blue-200 mb-1">{userGroup.username}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                          {userGroup.activityCount} atividade{userGroup.activityCount !== 1 ? 's' : ''}
                        </Badge>
                        <span className="text-xs text-white/60">
                          há {Math.floor((Date.now() - new Date(userGroup.lastActivityTime).getTime()) / 60000)} min
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-[4.5rem]">
                    {userGroup.activities.slice(0, 3).map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-start gap-2 text-sm p-2 bg-white/5 rounded">
                        {getActivityIcon(activity.activity_type)}
                        <span className="text-white/90 flex-1">
                          {activity.description}
                        </span>
                        <span className="text-xs text-white/60 ml-2">
                          {formatTime(activity.created_at)}
                        </span>
                      </div>
                    ))}
                    {userGroup.activities.length > 3 && (
                      <p className="text-xs text-white/60 ml-6 italic">
                        +{userGroup.activities.length - 3} outras atividades
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-white/70 py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
                <p className="text-xs mt-1">Os usuários monitorados aparecerão aqui em breve</p>
                {metadata.source === 'empty' && (
                  <p className="text-xs mt-2 text-blue-300">ℹ️ Sistema coletando dados da API oficial do Habbo</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
