
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Activity } from 'lucide-react';
import { useChronologicalFeedActivities } from '@/hooks/useChronologicalFeedActivities';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface FeedActivityTabbedColumnProps {
  onUserClick: (username: string) => void;
}

export const FeedActivityTabbedColumn: React.FC<FeedActivityTabbedColumnProps> = ({ onUserClick }) => {
  const { habboAccount } = useUnifiedAuth();
  
  const { 
    activities, 
    isLoading, 
    refetch, 
    isEmpty,
    lastUpdate,
    systemStatus,
    friendsCount 
  } = useChronologicalFeedActivities(
    habboAccount?.habbo_name || '',
    habboAccount?.hotel || 'br'
  );

  const handleRefresh = () => {
    refetch();
  };

  const getAvatarUrl = (habboName: string, hotel: string = 'br') => {
    const domain = hotel === 'br' ? 'com.br' : hotel;
    return `https://www.habbo.${domain}/habbo-imaging/avatarimage?user=${habboName}&size=s&direction=2&head_direction=3&action=std`;
  };

  return (
    <Card className="bg-black/40 text-white border-white/20 shadow-none h-full flex flex-col backdrop-blur-sm">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white volter-font">Feed de Atividades</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
        {lastUpdate && (
          <p className="text-xs text-white/60">
            Última atualização: {new Date(lastUpdate).toLocaleTimeString('pt-BR')}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-3" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'}}>
        {isLoading && activities.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-2" />
            <p className="text-white/60 text-sm">Carregando atividades...</p>
          </div>
        ) : isEmpty ? (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-white/40 mx-auto mb-2" />
            <p className="text-white/60 text-sm">Nenhuma atividade recente</p>
            <p className="text-white/40 text-xs mt-1">
              {systemStatus === 'no_friends' ? 
                'Adicione amigos no Habbo para ver atividades' :
                systemStatus === 'tracking_disabled' ?
                'Sistema de rastreamento ativo. Atividades aparecerão em breve' :
                `${friendsCount} amigos monitorados - sem atividades nas últimas 12h`
              }
            </p>
            {systemStatus === 'tracking_disabled' && (
              <div className="mt-3">
                <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Sistema ativo</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white/5 rounded-lg border border-white/10 p-3 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => onUserClick(activity.user_habbo_name)}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <img
                  src={getAvatarUrl(activity.user_habbo_name, activity.hotel)}
                  alt={`Avatar de ${activity.user_habbo_name}`}
                  className="w-10 h-10 rounded bg-white/10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/habbo-avatar-placeholder.png';
                  }}
                />
                
                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-white text-sm truncate">
                      {activity.user_habbo_name}
                    </h4>
                    <span className="text-xs text-white/60 flex-shrink-0 ml-2">
                      {activity.timeAgo}
                    </span>
                  </div>
                  
                  {/* Summary */}
                  <p className="text-xs text-white/80 mb-2">
                    Atualizou: {activity.summary}
                  </p>
                  
                  {/* Detailed Activities */}
                  {activity.activityDetails && activity.activityDetails.length > 0 && (
                    <div className="space-y-1">
                      {activity.activityDetails.slice(0, 3).map((detail, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-white/40 rounded-full flex-shrink-0"></div>
                          <span className="text-xs text-white/70">{detail}</span>
                        </div>
                      ))}
                      {activity.activityDetails.length > 3 && (
                        <div className="text-xs text-white/50 mt-1">
                          +{activity.activityDetails.length - 3} outras atividades
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Activity Count */}
                  {activity.total_changes > 1 && (
                    <div className="mt-2 inline-flex items-center space-x-1 bg-white/10 rounded px-2 py-1">
                      <Activity className="w-3 h-3 text-white/60" />
                      <span className="text-xs text-white/70">
                        {activity.total_changes} alterações
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
