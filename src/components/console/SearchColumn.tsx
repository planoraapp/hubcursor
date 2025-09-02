import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSearch } from './UserSearch';
import { OptimizedUserDiscoveryColumn } from '../console2/OptimizedUserDiscoveryColumn';
import { useOfficialHotelTicker } from '@/hooks/useOfficialHotelTicker';
import { UserProfileInColumn } from '../console2/UserProfileInColumn';
import { Search, Users, Zap } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

interface SearchColumnProps {
  onStartConversation?: (targetHabboName: string) => void;
}

export const SearchColumn: React.FC<SearchColumnProps> = ({ onStartConversation }) => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);
  const { searchUser, isSearching, searchResults } = useUserSearch();
  const { activities: officialActivities, isLoading: tickerLoading, refetch: refetchTicker } = useOfficialHotelTicker({ limit: 15 });

  const handleForceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['official-hotel-ticker'] });
    queryClient.invalidateQueries({ queryKey: ['hotel-ticker'] });
    queryClient.invalidateQueries({ queryKey: ['friends-photos'] });
    queryClient.invalidateQueries({ queryKey: ['friends-activities'] });
    console.log('🔄 [SEARCH DEBUG] Force refreshed all feeds');
    refetchTicker();
  };

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
      <Card className="bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
        <UserProfileInColumn 
          username={selectedUser} 
          onBack={() => {
            setShowProfile(false);
            setSelectedUser('');
          }}
          onStartConversation={onStartConversation}
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

      {/* Official ticker below search */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-white habbo-text-shadow" />
          <span className="text-sm font-bold text-white habbo-text-shadow">
            Ticker Oficial do Hotel
          </span>
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => refetchTicker()}
              disabled={tickerLoading}
              className="text-white/80 hover:text-white p-1 transition-colors"
            >
              {tickerLoading ? (
                <Search className="w-3 h-3 animate-spin" />
              ) : (
                <Search className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={handleForceRefresh}
              disabled={tickerLoading}
              className="text-amber-400 hover:text-amber-300 p-1 transition-colors"
              title="Force Update (Debug)"
            >
              <Zap className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-2" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'}}>
          {tickerLoading ? (
            <div className="flex justify-center items-center h-32">
              <Search className="w-6 h-6 animate-spin text-white/60" />
            </div>
          ) : officialActivities.length > 0 ? (
            officialActivities.map((activity, index) => (
              <div
                key={`${activity.username}-${activity.lastUpdate}-${index}`}
                onClick={() => handleUserClick(activity.username)}
                className="flex items-center gap-2 p-2 bg-transparent border border-black hover:bg-white/10 cursor-pointer transition-colors"
              >
                <img
                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${activity.profile?.figureString || 'lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62'}&size=s&direction=3&head_direction=3`}
                  alt={`Avatar de ${activity.username}`}
                  className="w-6 h-6 habbo-avatar-no-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white habbo-text-shadow truncate">{activity.username}</p>
                  <p className="text-[10px] text-white/60 truncate">{activity.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Search className="w-8 h-8 mx-auto mb-3 text-white/40" />
              <p className="text-white/60 text-xs">Nenhuma atividade oficial encontrada</p>
              <p className="text-white/40 text-[10px] mt-1">
                Atividades do hotel aparecerão aqui
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};