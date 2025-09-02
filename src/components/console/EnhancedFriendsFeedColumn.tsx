
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Settings, Zap } from 'lucide-react';
import { useRealHotelFeed } from '@/hooks/useRealHotelFeed';
import { BadgeDiscoveryPanel } from './BadgeDiscoveryPanel';
import { toast } from 'sonner';

export const EnhancedFriendsFeedColumn: React.FC = () => {
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [onlyOnline, setOnlyOnline] = useState(false);
  
  const { activities, isLoading, isFetching, error, hotel, metadata, mode, refetch } = useRealHotelFeed({
    onlineWithinSeconds: 1800, // 30 minutes
    mode: 'hybrid',
    onlyOnline,
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Feed atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar feed');
    }
  };

  if (showDiscovery) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setShowDiscovery(false)}
          className="text-white hover:bg-white/10"
        >
          ← Voltar ao Feed
        </Button>
        <BadgeDiscoveryPanel />
      </div>
    );
  }

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
              onClick={() => setShowDiscovery(true)}
              className="h-8 px-2 rounded hover:bg-white/10 text-yellow-400 hover:text-yellow-300"
            >
              <Zap className="w-4 h-4 mr-1" />
              Discovery
            </Button>
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
              disabled={isLoading}
              className="h-8 w-8 p-1 rounded-full hover:bg-white/10"
            >
              {isLoading ? (
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
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-blue-300">
                Atividade Recente:
              </h4>
              <Badge variant="outline" className="text-xs">
                {mode}
              </Badge>
            </div>
            <p className="text-xs text-white/60">
              {metadata.count} atividades | {metadata.onlineCount} online
            </p>
            <p className="text-xs text-white/60">
              Atualizado: {new Date(metadata.timestamp).toLocaleTimeString()}
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
                <p className="text-white/60 text-sm mb-4">Erro ao carregar feed</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDiscovery(true)}
                  className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Descobrir Usuários
                </Button>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60 text-sm mb-4">Nenhuma atividade recente</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDiscovery(true)}
                  className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Descobrir Usuários
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {isFetching && (
                  <div className="sticky top-0 z-10 -mt-2 mb-1 flex items-center gap-2 text-xs text-white/70 bg-white/10 px-2 py-1 rounded">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
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
                      className={`flex items-center gap-3 p-2 bg-white/10 rounded border border-white/20 transition-all ${
                        isNew ? 'animate-enter bg-blue-500/20' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-white">{a.username}</p>
                        <p className="text-xs text-white/60 mb-1">{a.description}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] text-white/60 mr-2">
                            {new Date(a.lastUpdate).toLocaleTimeString()}
                          </span>
                          {a.counts?.friends > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/30">
                              +{a.counts.friends} amigos
                            </span>
                          )}
                          {a.counts?.badges > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 border border-yellow-400/30">
                              +{a.counts.badges} emblemas
                            </span>
                          )}
                          {a.counts?.photos > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 border border-green-400/30">
                              +{a.counts.photos} fotos
                            </span>
                          )}
                          {a.counts?.avatarChanged && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/30">
                              Mudou o visual
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
