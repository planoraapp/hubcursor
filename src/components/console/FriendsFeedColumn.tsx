
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, UserPlus, Clock, MapPin, Loader2 } from 'lucide-react';
import { useFriendsFeed } from '@/hooks/useFriendsFeed';
import { useAuth } from '@/hooks/useAuth';
import { habboProxyService } from '@/services/habboProxyService';
import { HabboUser } from '@/types/habbo';
import { toast } from 'sonner';

interface UserSearchProps {
  onUserFound: (user: HabboUser) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onUserFound }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const user = await habboProxyService.getUserByName(searchQuery.trim());
      if (user) {
        onUserFound(user);
        toast.success(`Usuário ${user.name} encontrado!`);
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
      <div className="flex gap-2">
        <Input
          placeholder="Digite o nome do usuário..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
        />
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !searchQuery.trim()}
          size="sm"
          className="bg-white/20 hover:bg-white/30 text-white border-white/20"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
        </Button>
      </div>
    </div>
  );
};

interface UserCardProps {
  user: HabboUser;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20 mb-2">
      <Avatar className="w-12 h-12">
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
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={user.online ? "default" : "secondary"} className="text-xs bg-white/20 text-white">
            {user.online ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export const FriendsFeedColumn: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { friendsActivities, isLoading } = useFriendsFeed();
  const [foundUser, setFoundUser] = useState<HabboUser | null>(null);

  const handleUserFound = (user: HabboUser) => {
    setFoundUser(user);
  };

  return (
    <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Amigos & Busca
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <div className="h-full flex flex-col">
          <UserSearch onUserFound={handleUserFound} />
          
          {foundUser && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 text-green-300">Resultado da Busca:</h4>
              <UserCard user={foundUser} />
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
                            {activity.friend.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate text-white">{activity.friend.name}</p>
                          <p className="text-xs text-white/70 truncate">
                            {activity.activities && activity.activities.length > 0 
                              ? (activity.activities[0].description || 'Atividade recente')
                              : 'Atividade recente'
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
