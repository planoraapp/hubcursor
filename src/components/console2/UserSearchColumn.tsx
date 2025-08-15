
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, Loader2 } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { UserProfileDetailView } from '../console/UserProfileDetailView';

export const UserSearchColumn: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { searchResults, isSearching, error, searchUser } = useUserSearch();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      searchUser(query);
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
  };

  const handleBackToSearch = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <Card className="h-full">
        <CardContent className="p-0 h-full">
          <UserProfileDetailView
            user={selectedUser}
            hotel="br"
            onBack={handleBackToSearch}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-purple-500" />
          Buscar Usuários
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 space-y-4">
        {/* Campo de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Digite o nome do usuário..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Resultados da busca */}
        <ScrollArea className="flex-1">
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Buscando...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!isSearching && !error && searchQuery.length < 2 && (
            <div className="text-center py-8 space-y-3">
              <Search className="w-12 h-12 text-muted-foreground mx-auto" />
              <div className="text-muted-foreground">
                <p className="font-medium">Busque por usuários</p>
                <p className="text-sm">Digite pelo menos 2 caracteres</p>
              </div>
            </div>
          )}

          {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum usuário encontrado</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <Button
                  key={user.habbo_name}
                  variant="ghost"
                  className="w-full p-3 h-auto justify-start hover:bg-muted/50"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar - apenas cabeça */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                      <img
                        src={`https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${user.habbo_name}&direction=2&head_direction=3&size=m&headonly=1`}
                        alt={`Avatar de ${user.habbo_name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user.habbo_name}&size=m&direction=2&head_direction=3&action=std&headonly=1`;
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{user.habbo_name}</div>
                      <div className="text-xs text-muted-foreground">
                        Habbo {user.hotel?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
