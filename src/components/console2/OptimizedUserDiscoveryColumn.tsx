
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw, Loader2, Search } from 'lucide-react';
import { useOptimizedUserDiscovery } from '@/hooks/useOptimizedUserDiscovery';
import { UserProfileDetailView } from '../console/UserProfileDetailView';

export const OptimizedUserDiscoveryColumn: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { users, isLoading, refetch, isEmpty, lastUpdate } = useOptimizedUserDiscovery({
    method: 'random',
    limit: 12,
    enabled: true
  });

  const handleUserClick = (user: any) => {
    // Ensure the user object has all required properties for UserProfileDetailView
    const completeUser = {
      name: user.habbo_name || user.name || 'Unknown',
      motto: user.motto || '',
      online: user.online || user.is_online || false,
      figureString: user.figure_string || '',
      memberSince: user.member_since || new Date().toISOString(),
      selectedBadges: user.selected_badges || [],
      badges: user.badges || [],
      ...user
    };
    setSelectedUser(completeUser);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (selectedUser) {
    return (
      <Card className="h-full flex flex-col bg-white/10 backdrop-blur-sm border-white/20">
        <UserProfileDetailView
          user={selectedUser}
          hotel="br"
          onBack={() => setSelectedUser(null)}
        />
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            Descobrir Usuários
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-white/30 text-white hover:bg-white/10"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/70">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Descobrindo usuários...</p>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/70">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="mt-2 border-white/30 text-white hover:bg-white/10"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 h-full overflow-y-auto">
            {users.map((user, index) => (
              <div
                key={user.habbo_name || index}
                onClick={() => handleUserClick(user)}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/10"
              >
                <img
                  src={`https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${user.habbo_name}&direction=2&head_direction=3&size=s&action=std`}
                  alt={`Avatar de ${user.habbo_name}`}
                  className="w-12 h-12 rounded border border-white/20"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user.habbo_name}&size=s&direction=2&head_direction=3&action=std`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">
                    {user.habbo_name}
                  </h4>
                  <p className="text-sm text-white/60 italic truncate">
                    "{user.motto || 'Sem motto'}"
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${(user.online || user.is_online) ? 'bg-green-400' : 'bg-gray-400'}`} />
                    <span className="text-xs text-white/50">
                      {(user.online || user.is_online) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {lastUpdate && !isLoading && (
          <div className="mt-3 pt-2 border-t border-white/10">
            <p className="text-xs text-white/40 text-center">
              Última atualização: {new Date(lastUpdate).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
