import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Loader2 } from 'lucide-react';
import { UserSearchInput } from './UserSearchInput';
import { UserCard } from './UserCard';
import { UserProfileDetailView } from './UserProfileDetailView';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useOptimizedUserDiscovery } from '@/hooks/useOptimizedUserDiscovery';

export const UserDiscoveryColumn: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const { 
    searchResults, 
    isSearching, 
    searchUser 
  } = useUserSearch();
  
  const { 
    users: discoveredUsers, 
    isLoading: isDiscovering 
  } = useOptimizedUserDiscovery({
    method: 'random',
    limit: 12,
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
    <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Descobrir Usuários
          {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UserSearchInput 
          onSearch={handleSearch}
          isLoading={isLoading}
          placeholder="Buscar usuários por nome..."
        />

        {searchQuery.trim() && (
          <div className="text-sm text-white/60">
            {isSearching ? (
              'Buscando usuários...'
            ) : (
              `${searchResults.length} resultados para "${searchQuery}"`
            )}
          </div>
        )}

        <div className="grid gap-3 max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar">
          {displayUsers.length > 0 ? (
            displayUsers.map((user) => (
              <UserCard
                key={user.habbo_id || user.id}
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
                  'Nenhum usuário encontrado'
                ) : (
                  'Nenhum usuário disponível'
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};