
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Loader2, User } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { ConsoleProfileModal } from '@/components/console/ConsoleProfileModal';

export const UserSearchColumn: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { searchResults, isSearching, error, searchUser } = useUserSearch();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUser(searchQuery.trim());
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUser]);

  const handleUserClick = (userName: string) => {
    setSelectedUser(userName);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="bg-[#3D4852] text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            Buscar Usuários
          </CardTitle>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <Input
              placeholder="Digite o nome do usuário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-white/60" />
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-2">
          {error && (
            <div className="text-red-300 text-sm text-center py-4">
              {error}
            </div>
          )}
          
          {!searchQuery.trim() ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p className="text-white/60">Digite um nome para buscar</p>
            </div>
          ) : isSearching ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white/60" />
              <p className="text-white/60">Buscando usuários...</p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user, index) => (
              <div
                key={user.habbo_id || index}
                className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors cursor-pointer"
                onClick={() => handleUserClick(user.habbo_name)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`}
                    alt={`Avatar de ${user.habbo_name}`}
                    className="w-8 h-8 bg-transparent"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${user.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">
                      {user.habbo_name}
                    </h4>
                    <p className="text-white/60 text-sm truncate">
                      {user.motto || 'Sem motto'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
              </div>
            ))
          ) : searchQuery.length >= 2 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p className="text-white/60">Nenhum usuário encontrado</p>
              <p className="text-white/40 text-sm mt-2">
                Tente outro nome
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Modal para exibir perfil do usuário */}
      <ConsoleProfileModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        habboName={selectedUser}
      />
    </>
  );
};
