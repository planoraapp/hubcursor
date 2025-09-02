import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useRealHotelFeed } from '@/hooks/useRealHotelFeed';
import { toast } from 'sonner';

export const RealHotelFeedColumn: React.FC = () => {
  const [onlyOnline, setOnlyOnline] = useState(true);
  const { activities, isLoading, isFetching, error, hotel, metadata, mode, refetch, loadMoreData } = useRealHotelFeed({
    onlineWithinSeconds: 21600, // 6 horas
    mode: 'hybrid',
    onlyOnline,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      console.log('✅ [RealHotelFeedColumn] Feed refreshed successfully');
    } catch (error) {
      console.error('❌ [RealHotelFeedColumn] Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleModeChange = (newMode: 'official' | 'database' | 'hybrid') => {
    if (newMode === 'official') {
      // Use official mode for live data
      console.log('🔄 [RealHotelFeedColumn] Switching to official mode for live data');
    } else if (newMode === 'database') {
      // Use database mode for cached data
      console.log('🔄 [RealHotelFeedColumn] Switching to database mode for cached data');
    } else if (newMode === 'hybrid') {
      // Use hybrid mode for combined data
      console.log('🔄 [RealHotelFeedColumn] Switching to hybrid mode for combined data');
    }
    
    // Trigger refetch with new mode
    refetch();
  };

  const handleLoadMore = useCallback(async () => {
    try {
      const nextPage = currentPage + 1;
      console.log(`[RealHotelFeedColumn] Loading page ${nextPage}`);
      await loadMoreData(nextPage);
      setCurrentPage(nextPage);
    } catch (loadError) {
      console.error("Error loading more data:", loadError);
      toast.error('Erro ao carregar mais atividades');
    }
  }, [currentPage, loadMoreData]);

  return (
    <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>
            Feed do Hotel <Badge className="ml-2">{hotel}</Badge>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOnlyOnline((v) => !v)}
              className={`h-8 px-2 rounded hover:bg-white/10 ${onlyOnline ? 'bg-white/10' : ''}`}
            >
              {onlyOnline ? 'Apenas online' : 'Todos'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="h-8 w-8 p-1 rounded-full hover:bg-white/10"
            >
              {isRefreshing || isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 text-blue-300">
              Atividade Recente:
            </h4>
            <p className="text-xs text-white/60">
              {metadata.count} atividades | {metadata.onlineCount} online
            </p>
            <p className="text-xs text-white/60">
              Fonte: {mode} | {metadata.timestamp}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-stealth">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-white/20 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/20 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-white/20 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-white/60 text-sm">Erro ao carregar feed</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60 text-sm">Nenhuma atividade recente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {isFetching && (
                  <div className="sticky top-0 z-10 -mt-2 mb-1 flex items-center gap-2 text-xs text-white/70 bg-white/10 px-2 py-1 rounded">
                    <span className="w-2 h-2 rounded-full bg-green-400 pulse" />
                    Atualizando...
                  </div>
                )}
                {activities.map((activity, index) => {
                  const a: any = activity as any;
                  const isNew = !!a.isNew;
                  const itemKey = (a.key as string) || `${a.username}-${a.lastUpdate}-${index}`;
                  return (
                    <div
                      key={itemKey}
                      className={`flex items-center gap-3 p-2 bg-white/10 rounded border border-white/20 transition-all ${isNew ? 'animate-enter' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-white">{a.username}</p>
                        <p className="text-xs text-white/60 mb-1">{a.description}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] text-white/60 mr-2">{a.lastUpdate}</span>
                          {a.counts?.friends > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 border border-white/20">+{a.counts.friends} amigos</span>
                          )}
                          {a.counts?.badges > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 border border-white/20">+{a.counts.badges} emblemas</span>
                          )}
                          {a.counts?.photos > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 border border-white/20">+{a.counts.photos} fotos</span>
                          )}
                          {a.counts?.avatarChanged && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 border border-white/20">Mudou o visual</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="w-full mt-4"
          >
            Carregar Mais
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
