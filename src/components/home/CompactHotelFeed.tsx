
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Hotel, RefreshCw, Wifi, Archive, ExternalLink, Trophy, Camera, UserPlus, MessageSquare, Heart } from 'lucide-react';
import { useHotelActivities } from '@/hooks/useHotelActivities';
import { useUserFigures } from '@/hooks/useUserFigures';
import { unifiedHabboService } from '@/services/unifiedHabboService';
import { Link } from 'react-router-dom';

export const CompactHotelFeed: React.FC = () => {
  const { aggregatedActivities, isLoading, hotel, metadata, refetch } = useHotelActivities();
  
  const usernames = aggregatedActivities.slice(0, 6).map(group => group.username);
  const { figureMap } = useUserFigures(usernames);

  const getSourceIcon = () => {
    switch (metadata.source) {
      case 'live':
        return <Wifi className="w-3 h-3 text-green-500" />;
      case 'empty':
        return <Archive className="w-3 h-3 text-gray-500" />;
      default:
        return <Activity className="w-3 h-3 text-gray-500" />;
    }
  };

  const getSourceColor = () => {
    switch (metadata.source) {
      case 'live':
        return 'bg-green-500/20 text-green-700';
      case 'empty':
        return 'bg-gray-500/20 text-gray-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getSourceLabel = () => {
    switch (metadata.source) {
      case 'live':
        return 'Dados Reais';
      case 'empty':
        return 'Coletando';
      default:
        return 'Desconhecido';
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'motto_change':
        return <MessageSquare className="w-3 h-3 text-blue-500" />;
      case 'avatar_update':
        return <Activity className="w-3 h-3 text-purple-500" />;
      case 'new_badge':
        return <Trophy className="w-3 h-3 text-yellow-500" />;
      case 'new_photo':
        return <Camera className="w-3 h-3 text-pink-500" />;
      case 'new_friend':
        return <UserPlus className="w-3 h-3 text-green-500" />;
      case 'status_change':
        return <Activity className="w-3 h-3 text-orange-500" />;
      case 'user_tracked':
        return <Heart className="w-3 h-3 text-red-500" />;
      default:
        return <Activity className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatTime = (timeString: string) => {
    const diffMinutes = Math.floor((Date.now() - new Date(timeString).getTime()) / 60000);
    if (diffMinutes < 1) return 'agora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Hotel className="w-5 h-5" />
          Feed do Hotel ({hotel})
          
          <div className="ml-auto flex items-center gap-2">
            <Badge className={`text-xs ${getSourceColor()} border-0`}>
              {getSourceIcon()}
              <span className="ml-1">{getSourceLabel()}</span>
            </Badge>
            
            {aggregatedActivities.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {aggregatedActivities.length} usuários
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-1 h-auto hover:bg-gray-100"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading && aggregatedActivities.length === 0 ? (
            <div className="text-center text-gray-600 py-6">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Carregando atividades...</p>
            </div>
          ) : aggregatedActivities.length > 0 ? (
            <>
              {aggregatedActivities.slice(0, 6).map((userGroup, index) => (
                <div key={`${userGroup.username}-${index}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    {figureMap[userGroup.username] ? (
                      <img 
                        src={unifiedHabboService.getAvatarUrl(figureMap[userGroup.username], 's')} 
                        alt={userGroup.username}
                        className="h-12 w-auto object-contain bg-transparent"
                      />
                    ) : (
                      <div className="h-12 w-8 bg-gray-200 flex items-center justify-center rounded text-xs font-bold">
                        {userGroup.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-blue-600 text-sm mb-1">{userGroup.username}</h4>
                    <div className="flex items-center gap-1 mb-1">
                      {userGroup.activities[0] && getActivityIcon(userGroup.activities[0].activity_type)}
                      <p className="text-xs text-gray-600 truncate">
                        {userGroup.activities[0]?.description || 'Atividade recente'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {userGroup.activityCount} atividade{userGroup.activityCount !== 1 ? 's' : ''}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTime(userGroup.lastActivityTime)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-3 border-t">
                <Link to="/console">
                  <Button variant="outline" size="sm" className="text-sm">
                    Ver Todas as Atividades
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600 py-6">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma atividade recente</p>
              <p className="text-xs mt-1 text-gray-500">
                {metadata.source === 'empty' && 'ℹ️ Sistema coletando dados da API oficial do Habbo'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
