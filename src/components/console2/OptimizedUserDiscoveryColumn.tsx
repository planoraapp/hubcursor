
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, Loader2, Search } from 'lucide-react';
import { useHotelGeneralFeed } from '@/hooks/useHotelGeneralFeed';
import { EnhancedActivityRenderer } from './EnhancedActivityRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';

export const OptimizedUserDiscoveryColumn: React.FC = () => {
  const { activities, isLoading, refetch, isEmpty, lastUpdate, hotel } = useHotelGeneralFeed({
    refreshInterval: 30 * 1000, // 30 segundos
    limit: 20
  });

  const handleRefresh = () => {
    refetch();
  };

  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return 'agora mesmo';
    } else if (minutes < 60) {
      return `${minutes}m atrás`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days}d atrás`;
    }
  };

  return (
    <Card className="h-full flex flex-col bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5" />
            Feed do Hotel
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
              {hotel}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-white/30 text-white hover:bg-white/10"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        {lastUpdate && !isLoading && (
          <p className="text-xs text-white/40 mt-1">
            Última atualização: {formatTimeAgo(lastUpdate)}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white/70">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Carregando atividades...</p>
              </div>
            </div>
          ) : isEmpty ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white/70">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma atividade encontrada</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  className="mt-2 border-white/30 text-white hover:bg-white/10"
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <EnhancedActivityRenderer
                  key={`${activity.username}-${activity.timestamp}-${index}`}
                  activity={activity}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
