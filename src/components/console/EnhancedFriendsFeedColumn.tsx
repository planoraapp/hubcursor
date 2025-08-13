
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, UserPlus, Clock, Loader2, ExternalLink, Star } from 'lucide-react';
import { useFriendsFeed } from '@/hooks/useFriendsFeed';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { habboProxyService } from '@/services/habboProxyService';
import { habboFeedService } from '@/services/habboFeedService';
import { HabboUser } from '@/types/habbo';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { UserProfileDetailView } from './UserProfileDetailView';

interface UserSearchProps {
  onUserFound: (user: HabboUser) => void;
  suggestions: string[];
}

const UserSearch: React.FC<UserSearchProps> = ({ onUserFound, suggestions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return suggestions.filter(name => 
      name.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery, suggestions]);

  const handleSearch = async (username?: string) => {
    const nameToSearch = username || searchQuery.trim();
    if (!nameToSearch) return;
    
    setIsSearching(true);
    try {
      const user = await habboProxyService.getUserProfile(nameToSearch);
      if (user) {
        const userWithRequiredProps: HabboUser = {
          uniqueId: user.uniqueId || user.id || '',
          name: user.name,
          figureString: user.figureString,
          motto: user.motto || '',
          online: user.online || false,
          profileVisible: user.profileVisible ?? true,
          memberSince: user.memberSince,
          lastAccessTime: user.lastWebVisit,
          selectedBadges: user.selectedBadges || []
        };
        onUserFound(userWithRequiredProps);
        toast.success(`Usuário ${user.name} encontrado!`);
        setSearchQuery('');
        setShowSuggestions(false);
      } else {
        toast.error('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('Erro ao buscar usuário');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3 mb-4 p-3 bg-white/10 rounded-lg border border-white/20">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-white/80" />
        <h4 className="text-sm font-semibold text-white/90">Buscar Usuário</h4>
      </div>
      <div className="relative">
        <div className="flex gap-2">
          <Input
            placeholder="Digite o nome do usuário..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => setShowSuggestions(searchQuery.length > 0)}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
          <Button 
            onClick={() => handleSearch()} 
            disabled={isSearching || !searchQuery.trim()}
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
          </Button>
        </div>
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg"
                onClick={() => handleSearch(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const EnhancedFriendsFeedColumn: React.FC = () => {
  const { habboAccount } = useUnifiedAuth();
  const { friendsActivities, isLoading } = useFriendsFeed();
  const [foundUsers, setFoundUsers] = useState<HabboUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<HabboUser | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'profile'>('list');

  const usernameSuggestions = useMemo(() => {
    const names = friendsActivities.map(activity => activity.friend.name);
    return [...new Set(names)];
  }, [friendsActivities]);

  const handleUserFound = (user: HabboUser) => {
    setFoundUsers(prev => {
      const exists = prev.some(u => u.name === user.name);
      if (exists) return prev;
      return [user, ...prev].slice(0, 5);
    });
  };

  const handleUserSelect = (user: HabboUser) => {
    setSelectedUser(user);
    setViewMode('profile');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedUser(null);
  };

  if (viewMode === 'profile' && selectedUser) {
    return (
      <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full flex flex-col">
        <UserProfileDetailView user={selectedUser} onBack={handleBackToList} />
      </Card>
    );
  }

  return (
    <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Busca & Amigos
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-hidden">
        <div className="h-full flex flex-col">
          <UserSearch onUserFound={handleUserFound} suggestions={usernameSuggestions} />
          
          {foundUsers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 text-green-300 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Usuários Encontrados:
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-stealth">
                {foundUsers.map((user, index) => (
                  <div
                    key={`${user.name}-${index}`}
                    className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20 cursor-pointer hover:bg-white/15 transition-colors"
                    onClick={() => handleUserSelect(user)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage 
                        src={habboProxyService.getAvatarUrl(user.figureString)} 
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-white/20 text-white">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-white">{user.name}</h4>
                      <p className="text-xs text-white/70">{user.motto}</p>
                      <Badge variant={user.online ? "default" : "secondary"} className="text-xs mt-1">
                        {user.online ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/50" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-hidden">
            {!habboAccount ? (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-white/50 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white/80 mb-2">Entre para ver amigos</h3>
                <p className="text-white/60 text-sm">
                  Faça login para ver a atividade dos seus amigos
                </p>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-white/20 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/20 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-white/20 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="scrollbar-stealth overflow-y-auto h-full">
                <h4 className="text-sm font-semibold mb-3 text-blue-300">Atividade dos Amigos:</h4>
                {friendsActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-white/50 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">Nenhuma atividade recente</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friendsActivities.map((activity, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-2 bg-white/10 rounded border border-white/20 cursor-pointer hover:bg-white/15 transition-colors"
                        onClick={() => handleUserSelect({
                          uniqueId: activity.friend.uniqueId || '',
                          name: activity.friend.name,
                          figureString: activity.friend.figureString || '',
                          motto: '',
                          online: false,
                          profileVisible: true,
                          memberSince: '',
                          lastAccessTime: '',
                          selectedBadges: []
                        })}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage 
                            src={habboProxyService.getAvatarUrl(activity.friend.figureString || '')} 
                            alt={activity.friend.name}
                          />
                          <AvatarFallback className="bg-white/20 text-white">
                            {activity.friend.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate text-white">{activity.friend.name}</p>
                          <p className="text-xs text-white/60 mb-1">
                            {activity.activities.length > 0 
                              ? activity.activities[0].activity || activity.activities[0].description || 'fez uma atividade'
                              : 'fez uma atividade'
                            }
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-white/50" />
                            <span className="text-xs text-white/60">{activity.lastActivityTime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
