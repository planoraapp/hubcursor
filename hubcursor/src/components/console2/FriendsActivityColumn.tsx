
import React, { useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw, Activity, Clock, Loader2 } from 'lucide-react';
import { useFriendsActivitiesDirect } from '@/hooks/useFriendsActivitiesDirect';
import { EnhancedActivityRenderer } from './EnhancedActivityRenderer';

export const FriendsActivityColumn: React.FC = () => {
  const { 
    activities: directActivities,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    hotel,
    metadata
  } = useFriendsActivitiesDirect();

  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage && directActivities.length >= 10) {
          console.log('[🔄 DIRECT ACTIVITIES] Loading next page...');
          fetchNextPage();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, directActivities.length]);

  const handleRefresh = useCallback(() => {
    console.log('[🔄 DIRECT ACTIVITIES] Manual refresh triggered');
    refetch();
  }, [refetch]);

  // Get unique friends count from activities
  const uniqueFriendsCount = React.useMemo(() => {
    const uniqueUsernames = new Set(directActivities.map(activity => activity.username));
    return uniqueUsernames.size;
  }, [directActivities]);

  return (
    <Card className="bg-[#4A5568] text-white border-none h-full flex flex-col overflow-hidden">
      <CardHeader className="border-b border-dashed border-white/20 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5" />
            Atividades dos Amigos
            {uniqueFriendsCount > 0 && (
              <span className="text-sm font-normal text-white/60">
                ({uniqueFriendsCount} amigos • {metadata.source})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
            <div className="text-xs text-white/60">
              {directActivities.length} atividades
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-2 scrollbar-hide">
        {isLoading && directActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-white/60 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-white/60">Buscando atividades dos amigos...</p>
            <p className="text-xs text-white/40 mt-1">Hotel: {hotel} • Sistema aprimorado</p>
          </div>
        ) : directActivities.length > 0 ? (
          <>
            <div className="space-y-1">
              {directActivities.map((activity, index) => (
                <EnhancedActivityRenderer 
                  key={`${activity.username}-${activity.timestamp}-${index}`} 
                  activity={activity} 
                />
              ))}
            </div>
            
            {/* Loading indicator */}
            <div 
              ref={loadingRef}
              className="h-4 flex items-center justify-center"
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-white/60">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Carregando mais atividades...</span>
                </div>
              )}
            </div>

            {hasNextPage && !isFetchingNextPage && directActivities.length >= 10 && (
              <div className="text-center py-4 border-t border-white/10">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => fetchNextPage()}
                  className="text-white/60 hover:text-white hover:bg-white/10 text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Carregar mais atividades
                </Button>
              </div>
            )}

            {!hasNextPage && directActivities.length > 0 && (
              <div className="text-center py-4 border-t border-white/10">
                <p className="text-xs text-white/40">
                  ✅ Todas as atividades carregadas
                </p>
              </div>
            )}
          </>
        ) : uniqueFriendsCount === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/60 font-medium mb-1">Nenhum amigo encontrado</p>
            <p className="text-white/40 text-sm mb-4">
              Adicione amigos no Habbo para ver suas atividades aqui.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/60 font-medium mb-1">Nenhuma atividade recente</p>
            <p className="text-white/40 text-sm mb-4">
              {uniqueFriendsCount} amigos • Última verificação: {new Date().toLocaleTimeString()}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="text-white/60 hover:text-white border-white/20 hover:bg-white/10"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Atualizar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
