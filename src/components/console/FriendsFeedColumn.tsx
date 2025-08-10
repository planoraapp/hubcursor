
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, Loader2, UserPlus } from 'lucide-react';
import { useFriendsFeed } from '@/hooks/useFriendsFeed';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { habboProxyService } from '@/services/habboProxyService';

interface FriendsFeedColumnProps {
  onSearchUser?: (uniqueId: string) => void;
  activeTab?: 'recent' | 'list';
  onTabChange?: (tab: 'recent' | 'list') => void;
}

export const FriendsFeedColumn: React.FC<FriendsFeedColumnProps> = ({ 
  onSearchUser, 
  activeTab = 'recent', 
  onTabChange 
}) => {
  const { isLoggedIn } = useUnifiedAuth();
  const { friends, friendsActivities, isLoading, hasFriends } = useFriendsFeed();
  const [searchTerm, setSearchTerm] = useState('');

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleSearch = () => {
    if (onSearchUser && searchTerm.trim()) {
      onSearchUser(searchTerm.trim());
    }
  };

  const handleTabChange = (tab: 'recent' | 'list') => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <Card className="bg-[#5A6573] text-white border-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Feed de Amigos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Login necessário
            </h3>
            <p className="text-white/70">
              Conecte sua conta Habbo para ver as atividades dos seus amigos
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Feed de Amigos ({friends.length})
            {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-4 flex items-center">
            <Input
              type="text"
              placeholder="Buscar usuário..."
              className="flex-grow bg-gray-700 border-gray-600 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              className="ml-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex mb-4 border-b border-gray-600">
            <Button
              onClick={() => handleTabChange('recent')}
              variant={activeTab === 'recent' ? 'default' : 'ghost'}
              className="flex-1 text-white"
            >
              Atividade Recente
            </Button>
            <Button
              onClick={() => handleTabChange('list')}
              variant={activeTab === 'list' ? 'default' : 'ghost'}
              className="flex-1 text-white"
            >
              Lista Completa
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {activeTab === 'recent' ? (
              isLoading ? (
                <div className="text-center text-white/70 py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Carregando atividades dos amigos...</p>
                </div>
              ) : friendsActivities.length > 0 ? (
                friendsActivities.map((friendActivity, index) => (
                  <div key={`${friendActivity.friend.name}-${index}`} className="p-4 mb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={habboProxyService.getAvatarUrl(friendActivity.friend.figureString, 's')}
                        alt={friendActivity.friend.name}
                        className="w-12 h-12 object-contain bg-transparent"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-blue-200">{friendActivity.friend.name}</h4>
                          <div className={`w-2 h-2 rounded-full ${
                            friendActivity.friend.online ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <p className="text-sm text-white/70 italic mb-2">
                          "{friendActivity.friend.motto}"
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 ml-15">
                      {friendActivity.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-start gap-2 text-sm">
                          <span className="text-white/90 flex-1">
                            {activity.description}
                          </span>
                          <span className="text-xs text-white/60 ml-2">
                            {formatTime(activity.time)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-white/70 py-8">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma atividade recente</p>
                  <p className="text-xs mt-1">As atividades dos seus amigos aparecerão aqui</p>
                </div>
              )
            ) : (
              // Friends List Tab
              isLoading ? (
                <div className="text-center text-white/70 py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Carregando lista de amigos...</p>
                </div>
              ) : friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend.name}
                    className="flex items-center p-3 bg-gray-700 rounded-lg shadow-sm mb-2 hover:bg-gray-600 cursor-pointer transition-colors"
                    onClick={() => onSearchUser && onSearchUser(friend.name)}
                  >
                    <img
                      src={habboProxyService.getAvatarUrl(friend.figureString, 's')}
                      alt={friend.name}
                      className="w-10 h-10 object-contain bg-transparent mr-4"
                    />
                    <span className="font-semibold text-white text-lg">{friend.name}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-white/70 py-8">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum amigo encontrado</p>
                  <p className="text-xs mt-1">Adicione amigos no Habbo para ver aqui</p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
