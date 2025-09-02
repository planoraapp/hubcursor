import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, RefreshCw, Clock, Wifi, Activity } from 'lucide-react';
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

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`;
    return `${Math.floor(minutes / 1440)}d atrás`;
  };

  return (
    <Card className="h-full flex flex-col border-0 bg-background/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-dashed border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="w-5 h-5 text-blue-500" />
            Feed do Hotel
            {hotel && (
              <Badge variant="outline" className="ml-2">
                {hotel.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-blue-500/10 text-blue-700 border-blue-200">
              {activities.length} atividades
            </Badge>
            {meta?.source && (
              <Badge variant={meta.source === 'database' ? 'default' : 'secondary'} className="text-xs">
                {meta.source === 'edge-function' ? 'Edge' : 'DB'}
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
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-4">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-3 rounded-lg">
                    <div className="w-8 h-8 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2 bg-muted rounded w-1/2" />
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
                <p className="font-medium">Nenhuma atividade</p>
                <p className="text-sm">Não há atividades recentes no hotel</p>
              </div>
            </div>
          )}

          {activities.length > 0 && (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors border-l-2 border-dashed border-primary/20 hover:border-primary/40 pl-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {activity.user_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    {activity.activity_type && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {activity.activity_type}
                      </Badge>
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