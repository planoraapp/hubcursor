
import React, { useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw, Activity, Clock, Loader2 } from 'lucide-react';
import { useFriendsFeed } from '@/hooks/useFriendsFeed';
import { useRealFriendsActivities } from '@/hooks/useRealFriendsActivities';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          console.log('[🔄 INFINITE SCROLL] Loading next page...');
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
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
      
      <CardContent ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-3 scrollbar-hide">
        {isLoading && realActivities.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
          </div>
        ) : realActivities.length > 0 ? (
          <>
            {realActivities.map((activity) => (
              <div key={activity.id} className="bg-white/10 rounded-lg p-3 space-y-2">
                {/* Activity Header */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex-shrink-0">
                    {activity.avatarPreviewUrl ? (
                      <img
                        src={activity.avatarPreviewUrl}
                        alt={`Avatar de ${activity.habbo_name}`}
                        className="w-full h-full object-contain bg-transparent rounded"
                      />
                    ) : (
                      <img
                        src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${activity.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`}
                        alt={`Avatar de ${activity.habbo_name}`}
                        className="w-full h-full object-contain bg-transparent"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${activity.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`;
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {activity.habbo_name}
                    </div>
                    <div className="text-xs text-white/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatActivityTime(activity.created_at)}
                    </div>
                  </div>
                  {activity.badgeImageUrl && (
                    <img
                      src={activity.badgeImageUrl}
                      alt="Badge"
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Activity Description */}
                <div className="text-sm text-white/80 pl-11">
                  {activity.activity_description}
                </div>
              </div>
            ))}
            
            {/* Loading indicator for next page */}
            {(hasNextPage || isFetchingNextPage) && (
              <div ref={loadingRef} className="flex justify-center items-center py-4">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-white/60">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando mais atividades...
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => fetchNextPage()}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    Carregar mais atividades
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/60">Nenhuma atividade de amigos encontrada</p>
            <p className="text-white/40 text-sm mt-2">
              Atividades dos seus amigos aparecerão aqui
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
