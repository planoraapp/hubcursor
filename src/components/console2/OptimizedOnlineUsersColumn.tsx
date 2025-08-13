
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, RefreshCw, Clock, Wifi, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOptimizedOnlineUsers } from '@/hooks/useOptimizedOnlineUsers';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const OptimizedOnlineUsersColumn: React.FC = () => {
  const { 
    users, 
    onlineCount, 
    meta, 
    hotel, 
    isLoading, 
    error, 
    refetch, 
    isEmpty,
    lastUpdate 
  } = useOptimizedOnlineUsers();

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-green-500" />
            Usuários Online
            {hotel && (
              <Badge variant="outline" className="ml-2">
                {hotel.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-500/10 text-green-700 border-green-200">
              {onlineCount} online
            </Badge>
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
                <p className="font-medium">Erro ao carregar usuários</p>
                <p className="text-sm">{error.message}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}

          {isEmpty && !isLoading && !error && (
            <div className="text-center py-8 space-y-3">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto" />
              <div className="text-muted-foreground">
                <p className="font-medium">Nenhum usuário online</p>
                <p className="text-sm">Não encontramos usuários ativos recentemente</p>
              </div>
            </div>
          )}

          {users.length > 0 && (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
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
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
