
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Loader2 } from 'lucide-react';
import { useHabboConsoleData } from '@/hooks/useHabboConsoleData';
import { UserProfileModal } from '@/components/console/UserProfileModal';

export const UserSearchColumn: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { 
    searchUsername, 
    setSearchUsername, 
    userProfile, 
    isLoading, 
    searchUser 
  } = useHabboConsoleData();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchUser(searchTerm.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleUserClick = (username: string) => {
    setSelectedUser(username);
  };

  return (
    <>
      <Card className="bg-gray-800/50 border-gray-700 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            Descobrir Usuários
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Nome do usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
            />
            <Button 
              onClick={handleSearch}
              disabled={isLoading || !searchTerm.trim()}
              className="px-3"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-400" />
              <p className="text-sm text-gray-400">Buscando usuário...</p>
            </div>
          )}

          {userProfile && !isLoading && (
            <div 
              className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600/50 transition-colors"
              onClick={() => handleUserClick(userProfile.name)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-gray-600">
                  <AvatarImage 
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${userProfile.figureString}&size=s&direction=2&head_direction=3&action=std`}
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <AvatarFallback className="bg-gray-600 text-white">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white truncate">{userProfile.name}</h3>
                    <Badge className={userProfile.online ? 'bg-green-600' : 'bg-red-600'}>
                      {userProfile.online ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 truncate italic">
                    "{userProfile.motto || 'Sem motto'}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {searchUsername && !userProfile && !isLoading && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-400">Usuário não encontrado</p>
            </div>
          )}

          {!searchUsername && !isLoading && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-400">Digite um nome para buscar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        username={selectedUser || ''}
      />
    </>
  );
};
