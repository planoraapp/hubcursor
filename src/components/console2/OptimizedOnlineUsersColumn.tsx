
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, RefreshCw, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useOptimizedUserDiscovery } from '@/hooks/useOptimizedUserDiscovery';

export const OptimizedOnlineUsersColumn: React.FC = () => {
  const { 
    users, 
    isLoading, 
    error, 
    refetch, 
    hotel,
    isEmpty 
  } = useOptimizedUserDiscovery({
    method: 'active',
    limit: 30,
    refreshInterval: 1 * 60 * 1000 // 1 minute
  });

  const formatLastSeen = (lastSeen: string) => {
    const diff = Date.now() - new Date(lastSeen).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`;
    return `${Math.floor(minutes / 1440)}d atrás`;
  };

  const getAvatarUrl = (figureString: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${figureString}&size=s&direction=2&head_direction=3&action=std`;
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
              {users.filter(u => u.online).length} online
            </Badge>
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
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-4">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-3 rounded-lg">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8 space-y-3">
              <Users className="w-12 h-12 text-muted-foreground mx-auto" />
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
              <Users className="w-12 h-12 text-muted-foreground mx-auto" />
              <div className="text-muted-foreground">
                <p className="font-medium">Nenhum usuário online</p>
                <p className="text-sm">Não há usuários online no momento</p>
              </div>
            </div>
          )}

          {users.length > 0 && (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage 
                        src={getAvatarUrl(user.figure_string)} 
                        alt={user.habbo_name}
                      />
                      <AvatarFallback className="bg-muted">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    {user.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {user.habbo_name}
                      </span>
                      {user.online && (
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700">
                          Online
                        </Badge>
                      )}
                    </div>
                    
                    {user.motto && (
                      <p className="text-xs text-muted-foreground truncate italic mb-1">
                        "{user.motto}"
                      </p>
                    )}
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatLastSeen(user.last_seen)}</span>
                    </div>
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
