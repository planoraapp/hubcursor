
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Activity, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFriendsActivitiesDirect } from '@/hooks/useFriendsActivitiesDirect';
import { useAuth } from '@/hooks/useAuth';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FeedActivityTabbedColumn: React.FC = () => {
  const { habboAccount } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);
  
  // Ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useScrollDirection(scrollContainerRef.current);

  const { 
    activities, 
    isLoading, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchActivities,
    metadata,
    error
  } = useFriendsActivitiesDirect();

  const handleUserClick = (userName: string) => {
    setSelectedUser(userName);
    setShowProfile(true);
  };

  const handleRefresh = async () => {
    console.log('[⚡ ACTIVITIES] Forcing refresh with enhanced direct API');
    await refetchActivities();
  };

  const formatActivityTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch (error) {
      return 'há alguns momentos';
    }
  };

  const getSystemStatus = () => {
    if (error) {
      return { status: 'error', message: 'Erro na conexão', icon: AlertCircle, color: 'text-red-400' };
    }
    if (isLoading) {
      return { status: 'loading', message: 'Carregando...', icon: Loader2, color: 'text-yellow-400' };
    }
    if (activities.length > 0) {
      return { status: 'success', message: 'Sistema ativo', icon: CheckCircle, color: 'text-green-400' };
    }
    return { status: 'idle', message: 'Aguardando dados', icon: Activity, color: 'text-blue-400' };
  };

  const systemStatus = getSystemStatus();

  return (
    <>
      <div className="h-full flex flex-col bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg">
        <div className="flex-shrink-0 p-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white habbo-text-shadow" />
              <span className="text-sm font-bold text-white habbo-text-shadow">
                Feed dos Amigos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <systemStatus.icon className={cn("w-3 h-3", systemStatus.color, isLoading && "animate-spin")} />
                <span className={cn("text-xs", systemStatus.color)}>
                  {systemStatus.message}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="text-white/80 hover:text-white p-1 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
          
          {/* System Status Info */}
          <div className="mt-2 flex items-center justify-between text-xs text-white/60">
            <span>
              {metadata.is_authenticated ? '🔐 Autenticado' : '❌ Não autenticado'} • 
              {metadata.count} atividades
            </span>
            <span>
              Hotel: {metadata.hotel?.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 flex flex-col">
          <div 
            ref={scrollContainerRef}
            className="flex-1 min-h-0 overflow-y-auto space-y-2 p-3" 
            style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'}}
          >
            {isLoading && activities.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                  <span className="text-xs text-white/60">Carregando atividades dos amigos...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-400/60" />
                <p className="text-white/60 text-xs mb-2">Erro ao carregar atividades</p>
                <p className="text-white/40 text-[10px] mb-4">
                  {error.message || 'Problema de conectividade'}
                </p>
                <button
                  onClick={handleRefresh}
                  className="text-white/70 hover:text-white text-xs border border-white/20 px-3 py-1 rounded hover:bg-white/10 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            ) : activities.length > 0 ? (
              <>
                <div className="text-[10px] text-white/60 text-center py-1">
                  Sistema aprimorado ativo • {activities.length} atividades encontradas
                </div>
                {activities.map((activity, index) => (
                  <div key={`${activity.username}-${activity.timestamp}-${index}`}>
                    <div className="bg-white/5 border border-white/10 hover:bg-white/10 transition-colors p-3 rounded">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          {activity.figureString ? (
                            <img
                              src={`https://www.habbo.com/habbo-imaging/avatarimage?figure=${activity.figureString}&size=s&direction=2&head_direction=3`}
                              alt={activity.username}
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <Activity className="w-4 h-4 text-blue-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => handleUserClick(activity.username)}
                            className="text-white/90 text-xs font-medium hover:text-white transition-colors volter-font"
                          >
                            {activity.username}
                          </button>
                          <p className="text-white/70 text-[10px] leading-relaxed mt-1">
                            {activity.activity}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-white/50 text-[9px]">
                              {formatActivityTime(activity.timestamp)}
                            </span>
                            {activity.type && (
                              <span className={cn(
                                "text-[8px] px-1.5 py-0.5 rounded",
                                activity.type === 'photos' && "bg-pink-500/20 text-pink-300",
                                activity.type === 'badge' && "bg-yellow-500/20 text-yellow-300",
                                activity.type === 'friends' && "bg-green-500/20 text-green-300"
                              )}>
                                {activity.type === 'photos' && '📸'}
                                {activity.type === 'badge' && '🏆'}
                                {activity.type === 'friends' && '👥'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < activities.length - 1 && (
                      <div className="w-full h-px bg-white/10 my-1" />
                    )}
                  </div>
                ))}
                {hasNextPage && (
                  <div className="flex justify-center py-3">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="text-white/70 hover:text-white text-xs border border-white/20 px-3 py-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      {isFetchingNextPage ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Carregando...
                        </div>
                      ) : (
                        'Carregar mais atividades'
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 mx-auto mb-3 text-white/40" />
                <p className="text-white/60 text-xs mb-2">
                  {metadata.is_authenticated ? 
                    'Nenhuma atividade de amigos encontrada' : 
                    'Faça login para ver atividades dos amigos'
                  }
                </p>
                <p className="text-white/40 text-[10px] mb-4">
                  {metadata.is_authenticated ? 
                    'As atividades dos seus amigos aparecerão aqui' :
                    'Sistema de feed cronológico aprimorado'
                  }
                </p>
                {!metadata.is_authenticated && (
                  <div className="text-[9px] text-white/30 mt-2">
                    Status: {metadata.source} • Hotel: {metadata.hotel}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
