
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, RefreshCw, Clock, Wifi, Search, Shuffle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOptimizedUserDiscovery } from '@/hooks/useOptimizedUserDiscovery';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const OptimizedUserDiscoveryColumn: React.FC = () => {
  const [method, setMethod] = useState<'random' | 'recent' | 'active'>('random');
  
  const { 
    users, 
    meta, 
    hotel, 
    isLoading, 
    error, 
    refetch, 
    isEmpty,
    lastUpdate 
  } = useOptimizedUserDiscovery({
    method,
    refreshInterval: 120000, // 2 minutos
    limit: 25
  });

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

  const getMethodIcon = (selectedMethod: string) => {
    switch (selectedMethod) {
      case 'random': return <Shuffle className="w-4 h-4" />;
      case 'recent': return <Clock className="w-4 h-4" />;
      case 'active': return <TrendingUp className="w-4 h-4" />;
      default: return <Compass className="w-4 h-4" />;
    }
  };

  const getMethodLabel = (selectedMethod: string) => {
    switch (selectedMethod) {
      case 'random': return 'Aleatórios';
      case 'recent': return 'Recentes';
      case 'active': return 'Ativos';
      default: return 'Descobrir';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Compass className="w-5 h-5 text-purple-500" />
            Descobrir Usuários
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

        <div className="flex items-center justify-between">
          <Select value={method} onValueChange={(value: 'random' | 'recent' | 'active') => setMethod(value)}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="random">
                <div className="flex items-center gap-2">
                  <Shuffle className="w-3 h-3" />
                  Aleatórios
                </div>
              </SelectItem>
              <SelectItem value="recent">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Recentes
                </div>
              </SelectItem>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  Ativos
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {lastUpdate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(lastUpdate)}
              {meta?.count && (
                <span className="ml-1">• {meta.count} usuários</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-4">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-8 h-8 bg-muted rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-muted rounded w-2/3" />
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
                <p className="font-medium">Erro na descoberta</p>
                <p className="text-sm">{error.message}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}

          {isEmpty && !isLoading && !error && (
            <div className="text-center py-8 space-y-3">
              <Search className="w-12 h-12 text-muted-foreground mx-auto" />
              <div className="text-muted-foreground">
                <p className="font-medium">Nenhum usuário encontrado</p>
                <p className="text-sm">Tente outro método de descoberta</p>
              </div>
              <Button variant="outline" onClick={() => setMethod('random')}>
                Buscar aleatórios
              </Button>
            </div>
          )}

          {users.length > 0 && (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={getAvatarUrl(user.figure_string || '')}
                      alt={user.habbo_name}
                      className="w-8 h-8 rounded-full bg-muted"
                      onError={(e) => {
                        e.currentTarget.src = 'https://www.habbo.com.br/habbo-imaging/avatarimage?figure=lg-3023-1335.sh-300-64.hd-180-1.hr-831-49.ch-255-66.ca-1813-62&size=s&direction=2&head_direction=3&action=std';
                      }}
                    />
                    {user.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {user.habbo_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(user.last_seen)}
                      </span>
                    </div>
                    {user.motto && (
                      <p className="text-xs text-muted-foreground truncate">
                        "{user.motto}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {getMethodIcon(method)}
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
