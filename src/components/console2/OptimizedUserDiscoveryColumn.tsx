
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw, AlertCircle, ExternalLink, User } from 'lucide-react';
import { useOptimizedUserDiscovery } from '@/hooks/useOptimizedUserDiscovery';
import { UserProfileModal } from '@/components/UserProfileModal';
import { CompleteProfileModal } from '@/components/profile/CompleteProfileModal';

interface HabboUser {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  figure_string?: string;
  motto?: string;
  online?: boolean;
  last_seen: string;
}

export const OptimizedUserDiscoveryColumn: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [profileModalUser, setProfileModalUser] = useState<string | null>(null);
  const { users, isLoading, error, refetch, method, hotel } = useOptimizedUserDiscovery({
    refreshInterval: 2 * 60 * 1000, // 2 minutes
    limit: 25
  });

  const handleUserClick = (username: string) => {
    setSelectedUser(username);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getAvatarUrl = (figureString: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${figureString}&size=s&direction=2&head_direction=3&action=std`;
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diff / (1000 * 60));

    if (diffMinutes < 60) {
      return `Online há ${diffMinutes} minutos`;
    } else if (diffMinutes < 24 * 60) {
      return `Online hoje`;
    } else {
      return `Online em ${date.toLocaleDateString()}`;
    }
  };

  return (
    <Card className="h-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          Descobrir Usuários
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {isLoading ? 'Carregando...' : 'Atualizar'}
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 h-full">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {isLoading && (
              <div className="text-center text-slate-500 py-6">
                Carregando usuários...
              </div>
            )}

            {error && (
              <div className="text-center text-red-500 py-6">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                Erro ao carregar usuários.
              </div>
            )}

            {users.map((user) => (
              <div 
                key={user.id}
                className="group flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg"
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12 border-2 border-white/20 group-hover:border-white/40 transition-colors">
                    <AvatarImage 
                      src={getAvatarUrl(user.figure_string)} 
                      alt={user.habbo_name}
                    />
                    <AvatarFallback className="bg-slate-700 text-white">
                      {user.habbo_name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white/20"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => handleUserClick(user.habbo_name)}
                      className="font-medium text-white group-hover:text-blue-300 transition-colors truncate text-left"
                    >
                      {user.habbo_name}
                    </button>
                    {user.online && (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        Online
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-400 truncate italic">
                    "{user.motto || 'Sem motto'}"
                  </p>
                  
                  <p className="text-xs text-slate-500 mt-1">
                    {formatLastSeen(user.last_seen)}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileModalUser(user.habbo_name);
                    }}
                    className="text-slate-400 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/home/${user.habbo_name}`, '_blank');
                    }}
                    className="text-slate-400 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {!isLoading && users.length === 0 && (
              <div className="text-center text-slate-500 py-6">
                Nenhum usuário encontrado.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Modals */}
      {selectedUser && (
        <UserProfileModal
          open={!!selectedUser}
          setOpen={() => setSelectedUser(null)}
          habboName={selectedUser}
        />
      )}

      {profileModalUser && (
        <CompleteProfileModal
          isOpen={!!profileModalUser}
          onClose={() => setProfileModalUser(null)}
          habboName={profileModalUser}
          hotel="com.br"
        />
      )}
    </Card>
  );
};
