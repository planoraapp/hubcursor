
import React, { useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw, Activity, Clock, Loader2 } from 'lucide-react';
import { useFriendsFeed } from '@/hooks/useFriendsFeed';
import { useRealFriendsActivities } from '@/hooks/useRealFriendsActivities';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActivityPreview } from './ActivityPreview';

export const FriendsActivityColumn: React.FC = () => {
  const { 
    activities: realActivities, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch 
  } = useRealFriendsActivities(50);

  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    // ETAPA 3: Fix do scroll infinito - Melhor observador com detecção de elementos pequenos
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage && realActivities.length >= 10) {
          console.log('[🔄 INFINITE SCROLL] Loading next page...');
          fetchNextPage();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading a bit earlier
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const formatActivityTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch (error) {
      console.warn('Erro ao formatar a data:', error);
      return 'há alguns momentos';
    }
  };

  return (
    <Card className="bg-[#4A5568] text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5" />
            Atividades dos Amigos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <div className="text-xs text-white/60">
              {realActivities.length} atividades
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-2 scrollbar-hide">
        {isLoading && realActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-white/60 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-white/60">Carregando atividades dos amigos...</p>
            <p className="text-xs text-white/40 mt-1">Processando 495 amigos...</p>
          </div>
        ) : realActivities.length > 0 ? (
          <>
            <div className="space-y-1">
              {realActivities.map((activity) => (
                <div key={activity.id} className="bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <ActivityPreview activity={activity} />
                </div>
              ))}
            </div>
            
            {/* ETAPA 3: Scroll infinito melhorado */}
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

            {hasNextPage && !isFetchingNextPage && realActivities.length >= 10 && (
              <div className="text-center py-4 border-t border-white/10">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => fetchNextPage()}
                  className="text-white/60 hover:text-white hover:bg-white/10 text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Ver atividades mais antigas
                </Button>
              </div>
            )}

            {!hasNextPage && realActivities.length > 0 && (
              <div className="text-center py-4 border-t border-white/10">
                <p className="text-xs text-white/40">
                  ✅ Todas as atividades recentes carregadas
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/60 font-medium mb-1">Aguardando atividades dos amigos</p>
            <p className="text-white/40 text-sm mb-4">
              O sistema está processando as atividades dos seus 495 amigos.<br />
              Novas atividades aparecerão em breve!
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="text-white/60 hover:text-white border-white/20 hover:bg-white/10"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Verificar agora
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
