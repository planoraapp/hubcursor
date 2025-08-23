
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Loader2, AlertCircle } from 'lucide-react';
import { UserSearchInput } from './UserSearchInput';
import { UserCard } from './UserCard';
import { UserProfileDetailView } from './UserProfileDetailView';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useInfiniteUserSearch } from '@/hooks/useInfiniteUserSearch';

export const UserDiscoveryColumn: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const { 
    searchResults, 
    isSearching, 
    error: searchError,
    searchUser 
  } = useUserSearch();
  
  const { 
    users: discoveredUsers, 
    isLoading: isDiscovering,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteUserSearch({
    enabled: !searchQuery.trim()
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchUser(query.trim());
    }
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
  };

  const handleBackToSearch = () => {
    setSelectedUser(null);
  };

  // Se um usuário está selecionado, mostrar o perfil detalhado
  if (selectedUser) {
    return (
      <UserProfileDetailView 
        user={selectedUser} 
        onBack={handleBackToSearch} 
      />
    );
  }

  const displayUsers = searchQuery.trim() ? searchResults : discoveredUsers;
  const isLoading = searchQuery.trim() ? isSearching : isDiscovering;

  return (
    <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full backdrop-blur-sm">
      <CardHeader className="border-b border-dashed border-white/20">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Descobrir Usuários
          {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <UserSearchInput 
          onSearch={handleSearch}
          isLoading={isLoading}
          placeholder="Buscar usuários por nome..."
        />

        {searchError && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-dashed border-red-400/50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-200">{searchError}</span>
          </div>
        )}

        {searchQuery.trim() && (
          <div className="text-sm text-white/60">
            {isSearching ? (
              'Buscando usuários...'
            ) : (
              `${searchResults.length} resultados para "${searchQuery}"`
            )}
          </div>
        )}

        <div 
          className="grid gap-4 max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar"
          onScroll={useCallback((e) => {
            const target = e.target as HTMLDivElement;
            const { scrollTop, scrollHeight, clientHeight } = target;
            
            // Carregar mais quando próximo do final (apenas para descoberta, não busca)
            if (!searchQuery.trim() && scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }, [hasNextPage, isFetchingNextPage, fetchNextPage, searchQuery])}
        >
          {displayUsers.length > 0 ? (
            displayUsers.map((user, index) => (
              <UserCard
                key={`${user.habbo_id || user.id || user.name}-${index}`}
                user={user}
                onSelect={handleUserSelect}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50 text-white/50" />
              <p className="text-white/60 text-sm">
                {isLoading ? (
                  'Descobrindo usuários...'
                ) : searchQuery.trim() ? (
                  searchQuery.trim().length < 2 ? 
                    'Digite pelo menos 2 caracteres para buscar' : 
                    'Nenhum usuário encontrado'
                ) : (
                  'Nenhum usuário disponível'
                )}
              </p>
            </div>
          )}
          
          {/* Loading para scroll infinito */}
          {isFetchingNextPage && !searchQuery.trim() && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-white/60" />
              <span className="ml-2 text-xs text-white/60">Carregando mais usuários...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
