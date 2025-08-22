import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSearch } from './UserSearch';
import { OptimizedUserDiscoveryColumn } from '../console2/OptimizedUserDiscoveryColumn';
import { UserProfileInColumn } from '../console2/UserProfileInColumn';
import { Search, Users } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';

export const SearchColumn: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);
  const { searchUser, isSearching, searchResults } = useUserSearch();

  const handleUserSearch = async (username: string) => {
    await searchUser(username);
    if (searchResults.length > 0) {
      setSelectedUser(username);
      setShowProfile(true);
    }
  };

  const handleUserClick = (username: string) => {
    setSelectedUser(username);
    setShowProfile(true);
  };

  // Show profile if selected
  if (showProfile && selectedUser) {
    return (
      <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
        <UserProfileInColumn 
          username={selectedUser} 
          onBack={() => {
            setShowProfile(false);
            setSelectedUser('');
          }} 
        />
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Search Section */}
      <Card className="bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5" />
            Buscar Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserSearch 
            onSearch={handleUserSearch}
            isLoading={isSearching}
            placeholder="Digite o nome do usuário..."
          />
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-white/80">
                Resultados ({searchResults.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {searchResults.map((user: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleUserClick(user.name)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20 hover:border-white/30"
                  >
                    <img
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${user.figureString}&size=s&direction=2&head_direction=3`}
                      alt={`Avatar de ${user.name}`}
                      className="w-8 h-8 rounded border border-white/20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white text-sm">
                        {user.name}
                      </div>
                      {user.motto && (
                        <div className="text-xs text-white/60 truncate">
                          {user.motto}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discovery Section */}
      <div className="flex-1 min-h-0">
        <OptimizedUserDiscoveryColumn />
      </div>
    </div>
  );
};