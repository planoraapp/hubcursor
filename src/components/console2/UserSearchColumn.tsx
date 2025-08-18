
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useOptimizedUserDiscovery } from '@/hooks/useOptimizedUserDiscovery';
import { ConsoleProfileModal } from '@/components/console/ConsoleProfileModal';

interface UserCardProps {
  user: any;
  onSelect: (user: any) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(user)}
      className="bg-white/5 hover:bg-white/10 transition-colors cursor-pointer rounded-lg p-3 border border-white/10"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex-shrink-0">
          <img
            src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user.habbo_name || user.name}&size=s&direction=2&head_direction=3&headonly=1`}
            alt={`Avatar de ${user.habbo_name || user.name}`}
            className="w-full h-full object-contain bg-transparent"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${user.habbo_name || user.name}&size=s&direction=2&head_direction=3&headonly=1`;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate">
            {user.habbo_name || user.name}
          </div>
          {user.motto && (
            <div className="text-xs text-white/60 truncate">
              {user.motto}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            {user.online && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                Online
              </Badge>
            )}
            <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
              {user.hotel || 'br'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserSearchInput: React.FC<{
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}> = ({ onSearch, isLoading = false, placeholder = "Buscar usuários..." }) => {
  const [searchInput, setSearchInput] = useState('');

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchInput);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
        disabled={isLoading}
      />
    </div>
  );
};

export const UserSearchColumn: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { 
    searchResults, 
    isSearching, 
    error: searchError,
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
    setSelectedUser(user.habbo_name || user.name);
    setIsModalOpen(true);
  };

  const displayUsers = searchQuery.trim() ? searchResults : discoveredUsers;
  const isLoading = searchQuery.trim() ? isSearching : isDiscovering;

  return (
    <>
      <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Descobrir Usuários
            </CardTitle>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-4 scrollbar-hide">
          <UserSearchInput 
            onSearch={handleSearch}
            isLoading={isLoading}
            placeholder="Buscar usuários por nome..."
          />

          {searchError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
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

          <div className="space-y-3">
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
                    searchQuery.trim().length < 2 ? 
                      'Digite pelo menos 2 caracteres para buscar' : 
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

      <ConsoleProfileModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        habboName={selectedUser}
      />
    </>
  );
};
