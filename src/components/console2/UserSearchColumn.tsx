
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Loader2, User, RefreshCw } from 'lucide-react';
import { useOptimizedUserDiscovery } from '@/hooks/useOptimizedUserDiscovery';
import { useUserSearch } from '@/hooks/useUserSearch';
import { UnifiedProfileView } from '../console/UnifiedProfileView';

export const UserSearchColumn: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { searchUser, searchResults, isSearching, error: searchError } = useUserSearch();
  
  const { 
    users: discoveredUsers, 
    isLoading: isDiscovering, 
    refetch 
  } = useOptimizedUserDiscovery({
    method: 'random',
    limit: 8,
    enabled: !searchQuery.trim()
  });

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchUser(query.trim());
    }
  }, [searchUser]);

  const handleUserClick = (user: any) => {
    setSelectedUser(user.habbo_name || user.name || 'Unknown');
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <UnifiedProfileView
        habboName={selectedUser}
        hotel="com.br"
        onBack={handleBack}
      />
    );
  }

  const displayUsers = searchQuery.trim() ? searchResults : discoveredUsers;
  const isLoading = searchQuery.trim() ? isSearching : isDiscovering;

  return (
    <Card className="h-full flex flex-col bg-[#4A5568] text-white border-0 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Search className="w-5 h-5" />
            Buscar Usuários
          </CardTitle>
          {!searchQuery.trim() && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isDiscovering}
              className="text-white/80 hover:text-white hover:bg-white/10 border-white/30"
            >
              {isDiscovering ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
          <Input
            placeholder="Digite o nome do usuário..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        {searchError && (
          <div className="text-sm text-red-300 bg-red-500/20 p-2 rounded border border-red-400/30">
            {searchError}
          </div>
        )}

        <div className="text-sm text-white/60">
          {searchQuery.trim() ? (
            isSearching ? (
              'Buscando usuários...'
            ) : (
              `${searchResults.length} resultado(s) para "${searchQuery}"`
            )
          ) : (
            `Sugestões (${discoveredUsers.length})`
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-12 h-12 bg-white/10 rounded border" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayUsers.length > 0 ? (
            displayUsers.map((user, index) => (
              <div
                key={user.habbo_name || user.id || index}
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
                    <span className={`w-2 h-2 rounded-full ${user.online ? 'bg-green-400' : 'bg-gray-400'}`} />
                    <span className="text-xs text-white/50">
                      {user.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-white/60">
              <Users className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery.trim() ? 'Nenhum usuário encontrado' : 'Nenhuma sugestão disponível'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
