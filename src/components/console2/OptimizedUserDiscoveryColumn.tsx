
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, Loader2, Search } from 'lucide-react';
import { useOfficialHotelTicker } from '@/hooks/useOfficialHotelTicker';
import { EnhancedActivityRenderer } from './EnhancedActivityRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';

export const OptimizedUserDiscoveryColumn: React.FC = () => {
  const { activities, isLoading, error, refetch, hotel, metadata } = useOfficialHotelTicker({
    limit: 20
  });
  
  const isEmpty = !isLoading && activities.length === 0;
  const lastUpdate = metadata?.timestamp;

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
    <Card className="h-full flex flex-col bg-[#4A5568] backdrop-blur-md border-white/10 shadow-xl">
      <CardHeader className="pb-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white font-semibold">
            <Activity className="w-5 h-5" />
            Ticker Oficial
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded-md border border-white/20">
              {hotel}
            </span>
            <span className="text-xs text-white/60 bg-green-500/20 px-2 py-1 rounded-md border border-green-500/30">
              {metadata?.count || 0} usuários
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-colors"
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
          <p className="text-xs text-white/60 mt-1">
            Última atualização: {formatTimeAgo(lastUpdate)}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white/80">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-400" />
                <p className="text-sm font-medium">Carregando ticker oficial...</p>
                <p className="text-xs text-white/60 mt-1">Conectando ao servidor do Habbo</p>
              </div>
            </div>
          ) : isEmpty ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white/80">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30 text-blue-400" />
                <p className="text-sm font-medium mb-2">Nenhuma atividade no ticker</p>
                <p className="text-xs text-white/60 mb-4">O servidor oficial pode estar indisponível</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity, index) => (
                <div
                  key={`${activity.username}-${activity.lastUpdate}-${index}`}
                  className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200"
                >
                  <EnhancedActivityRenderer
                    activity={{
                      username: activity.username,
                      activity: activity.description,
                      timestamp: activity.lastUpdate,
                      figureString: activity.profile?.figureString,
                      hotel: hotel
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
