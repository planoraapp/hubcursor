import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, UserPlus, Clock, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useFriendsFeed } from '@/hooks/useFriendsFeed';
import { useAuth } from '@/hooks/useAuth';
import { habboProxyService } from '@/services/habboProxyService';
import { habboFeedService } from '@/services/habboFeedService';
import { HabboUser } from '@/types/habbo';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useUserFigures } from '@/hooks/useUserFigures';

interface UserSearchProps {
  onUserFound: (user: HabboUser) => void;
  suggestions: string[];
}

const UserSearch: React.FC<UserSearchProps> = ({ onUserFound, suggestions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Approximate search in suggestions
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
        // Ensure all required properties are present for type compatibility
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
        
        {/* Suggestions dropdown */}
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

interface ExpandedUserCardProps {
  user: HabboUser;
  hotel: string;
}

const ExpandedUserCard: React.FC<ExpandedUserCardProps> = ({ user, hotel }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Fetch user's mini-feed when expanded
  const { data: userFeed, isLoading: feedLoading, refetch } = useQuery({
    queryKey: ['user-feed', user.name, hotel],
    queryFn: () => habboFeedService.getUserFeed(hotel, user.name),
    enabled: isExpanded,
    staleTime: 60 * 1000, // 1 minute
  });

  const triggerSync = async () => {
    try {
      await habboFeedService.triggerUserSync(user.name, hotel);
      toast.success('Sincronização iniciada!');
      setTimeout(() => refetch(), 2000); // Refetch after 2 seconds
    } catch (error) {
      toast.error('Erro ao sincronizar');
    }
  };

  const handleVisitProfile = () => {
    window.open(`/home/${user.name}`, '_blank');
  };

  return (
    <div className="p-3 bg-white/10 rounded-lg border border-white/20 mb-2">
      <div className="flex items-center gap-3 mb-2">
        <Avatar className="w-12 h-12">
          <AvatarImage 
            src={habboProxyService.getAvatarUrl(user.figureString)} 
            alt={user.name}
          />
          <AvatarFallback className="bg-white/20 text-white">
            {(user.name || '?').substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-white">{user.name}</h4>
          <p className="text-xs text-white/70">{user.motto}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={user.online ? "default" : "secondary"} className="text-xs bg-white/20 text-white">
              {user.online ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            onClick={handleVisitProfile}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-400/20 text-xs h-7"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Perfil
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/70 hover:bg-white/10 text-xs h-7"
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Expanded mini-feed */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/20">
          {feedLoading ? (
            <div className="text-center py-4">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
              <p className="text-xs text-white/60">Carregando atividades...</p>
            </div>
          ) : userFeed?.activities && userFeed.activities.length > 0 ? (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-green-300">Atividades Recentes:</h5>
                {(userFeed.activities || []).slice(0, 5).map((activity, index) => (
                  <div key={index} className="text-xs text-white/80 bg-white/5 p-2 rounded">
                    <p>{activity.description}</p>
                    <p className="text-white/60 mt-1">
                      {habboFeedService.formatTimeAgo(activity.lastUpdate)}
                    </p>
                    {/* Show some details */}
                    {Array.isArray(activity.groups) && activity.groups.length > 0 && (
                      <div className="mt-2">
                        <span className="text-yellow-300">Grupos: </span>
                        {(activity.groups || []).slice(0, 2).map(g => g.name).join(', ')}
                      </div>
                    )}
                    {Array.isArray(activity.friends) && activity.friends.length > 0 && (
                      <div className="mt-1">
                        <span className="text-green-300">Amigos: </span>
                        {(activity.friends || []).slice(0, 3).map(f => f.name).join(', ')}
                      </div>
                    )}
                    {Array.isArray(activity.badges) && activity.badges.length > 0 && (
                      <div className="mt-1">
                        <span className="text-purple-300">Emblemas: </span>
                        {(activity.badges || []).slice(0, 2).map(b => b.code).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-white/60 mb-2">Nenhuma atividade encontrada</p>
              <Button
                size="sm"
                onClick={triggerSync}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 border-yellow-400/20 text-xs"
              >
                Sincronizar Agora
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const EnhancedFriendsFeedColumn: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { friendsActivities, isLoading } = useFriendsFeed();
  const [foundUsers, setFoundUsers] = useState<HabboUser[]>([]);
  const { figureMap } = useUserFigures(friendsActivities.map(fa => fa.friend.name));

  // Extract usernames for suggestions
  const usernameSuggestions = useMemo(() => {
    const names = friendsActivities.map(activity => activity.friend.name);
    return [...new Set(names)]; // Remove duplicates
  }, [friendsActivities]);

  const handleUserFound = (user: HabboUser) => {
    setFoundUsers(prev => {
      const exists = prev.some(u => u.name === user.name);
      if (exists) return prev;
      return [user, ...prev].slice(0, 5); // Keep max 5 recent searches
    });
  };

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
              <h4 className="text-sm font-semibold mb-2 text-green-300">Usuários Encontrados:</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-stealth">
                {foundUsers.map((user, index) => (
                  <ExpandedUserCard key={`${user.name}-${index}`} user={user} hotel="com.br" />
                ))}
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-hidden">
            {!isLoggedIn ? (
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
                      <div key={index} className="flex items-center gap-3 p-2 bg-white/10 rounded border border-white/20">
                        <Avatar className="w-8 h-8">
                          <AvatarImage 
                            src={habboProxyService.getAvatarUrl(activity.friend.figureString || '')} 
                            alt={activity.friend.name}
                          />
                          <AvatarFallback className="bg-white/20 text-white">
                            {(activity.friend.name || '?').substring(0, 2).toUpperCase()}
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
