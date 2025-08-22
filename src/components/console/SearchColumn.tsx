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
    <div className="h-full flex flex-col space-y-4 bg-transparent">
      {/* Search input at top */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-white habbo-text-shadow" />
          <span className="text-sm font-bold text-white habbo-text-shadow">
            Buscar Usuários
          </span>
        </div>
        
        <UserSearch 
          onSearch={handleUserSearch}
          isLoading={isSearching}
          placeholder="Digite o nome do usuário..."
        />

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            <h3 className="text-xs font-bold text-white/80 habbo-text-shadow">
              Resultados:
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {searchResults.map((user: any, index: number) => (
                <div
                  key={index}
                  onClick={() => handleUserClick(user.name)}
                  className="flex items-center gap-2 p-2 bg-transparent border border-black hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <img
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${user.figureString}&size=s&direction=3&head_direction=3`}
                    alt={`Avatar de ${user.name}`}
                    className="w-6 h-6 habbo-avatar-no-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white habbo-text-shadow truncate">{user.name}</p>
                    <p className="text-[10px] text-white/60 truncate">{user.motto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unified ticker below search */}
      <div className="flex-1 min-h-0">
        <OptimizedUserDiscoveryColumn />
      </div>
    </div>
  );
};