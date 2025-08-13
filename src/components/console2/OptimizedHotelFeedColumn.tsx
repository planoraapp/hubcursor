
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, RefreshCw, Clock, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOptimizedHotelFeed } from '@/hooks/useOptimizedHotelFeed';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const OptimizedHotelFeedColumn: React.FC = () => {
  const { 
    activities, 
    meta, 
    hotel, 
    isLoading, 
    error, 
    refetch, 
    isEmpty,
    lastUpdate 
  } = useOptimizedHotelFeed();

  const getAvatarUrl = (figureString: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${figureString}&size=s&direction=2&head_direction=3&action=std`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`;
    return `${Math.floor(minutes / 1440)}d atrás`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-blue-500" />
            Feed do Hotel
            {hotel && (
              <Badge variant="outline" className="ml-2">
                {hotel.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {meta?.source && (
              <Badge variant={meta.source === 'database' ? 'default' : 'secondary'} className="text-xs">
                {meta.source === 'database' ? 'DB' : 'Cache'}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {lastUpdate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Atualizado {formatTimeAgo(lastUpdate)}
            {meta?.count && (
              <span className="ml-2">• {meta.count} atividades</span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-4">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8 space-y-3">
              <Wifi className="w-12 h-12 text-muted-foreground mx-auto" />
              <div className="text-muted-foreground">
                <p className="font-medium">Erro ao carregar feed</p>
                <p className="text-sm">{error.message}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}

          {isEmpty && !isLoading && !error && (
            <div className="text-center py-8 space-y-3">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto" />
              <div className="text-muted-foreground">
                <p className="font-medium">Nenhuma atividade recente</p>
                <p className="text-sm">O hotel está muito quieto no momento</p>
              </div>
            </div>
          )}

          {activities.length > 0 && (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={getAvatarUrl(activity.profile.figureString)}
                    alt={activity.username}
                    className="w-10 h-10 rounded-full bg-muted"
                    onError={(e) => {
                      e.currentTarget.src = 'https://www.habbo.com.br/habbo-imaging/avatarimage?figure=lg-3023-1335.sh-300-64.hd-180-1.hr-831-49.ch-255-66.ca-1813-62&size=s&direction=2&head_direction=3&action=std';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {activity.username}
                      </span>
                      {activity.profile.online && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    {activity.profile.motto && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{activity.profile.motto}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
