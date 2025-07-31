
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/use-mobile';
import { useAuth } from '../hooks/useAuth';
import { getUserByName, getUserProfile, getAvatarUrl, getBadgeUrl, getUserBadges, getUserFriends, getUserRooms, getUserGroups } from '../services/habboApi';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MobileLayout from '../layouts/MobileLayout';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { ProfileNavigation } from '../components/console/ProfileNavigation';
import { ProfileSections } from '../components/console/ProfileSections';
import { PhotoGrid } from '../components/console/PhotoGrid';
import { FeedSystem } from '../components/console/FeedSystem';

interface HabboUser {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  lastAccessTime: string;
  memberSince: string;
  profileVisible: boolean;
  selectedBadges: Array<{
    code: string;
    name: string;
    description: string;
  }>;
  friends?: HabboUser[];
}

interface Photo {
  id: string;
  url: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

interface Activity {
  time: string;
  activity: string;
  timestamp: string;
}

// Simple cache to avoid repeated API calls
const userCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const Console: React.FC = () => {
  const { isLoggedIn, habboAccount } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [currentUser, setCurrentUser] = useState<HabboUser | null>(null);
  const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeSection, setActiveSection] = useState('console');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [profileSection, setProfileSection] = useState('badges');
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [userFriends, setUserFriends] = useState<any[]>([]);
  const [userRooms, setUserRooms] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);

  // Auto-load current user's profile when logged in
  useEffect(() => {
    if (isLoggedIn && habboAccount && !currentUser) {
      console.log('🔄 Auto-loading current user profile:', habboAccount.habbo_name);
      loadCurrentUserProfile();
    }
  }, [isLoggedIn, habboAccount]);

  const loadCurrentUserProfile = async () => {
    if (!habboAccount) return;
    
    setSearchInput(habboAccount.habbo_name);
    await searchUserWithCaching(habboAccount.habbo_name);
  };

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput && searchInput !== currentUser?.name) {
        searchUserWithCaching(searchInput);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  const getCachedUser = (username: string) => {
    const cached = userCache.get(username.toLowerCase());
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Using cached data for:', username);
      return cached.data;
    }
    return null;
  };

  const setCachedUser = (username: string, data: any) => {
    userCache.set(username.toLowerCase(), {
      data,
      timestamp: Date.now()
    });
  };

  const searchUserWithCaching = async (username: string) => {
    if (!username.trim()) return;

    const cachedData = getCachedUser(username);
    if (cachedData) {
      setCurrentUser(cachedData.user);
      setAllBadges(cachedData.badges || []);
      setUserFriends(cachedData.friends || []);
      setUserRooms(cachedData.rooms || []);
      setUserGroups(cachedData.groups || []);
      await fetchUserPhotos(cachedData.user.uniqueId);
      return;
    }

    await searchUser(username);
  };

  const searchUser = async (username?: string) => {
    const targetUser = username || searchInput.trim();
    
    if (!targetUser) {
      toast({
        title: "Campo obrigatório",
        description: "Digite um nome de usuário para buscar.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Searching for user:', targetUser);
      const userData = await getUserByName(targetUser);
      
      if (!userData) {
        setError('Usuário não encontrado.');
        setCurrentUser(null);
        return;
      }

      setCurrentUser(userData);
      
      const [badgesData, friendsData, roomsData, groupsData] = await Promise.all([
        getUserBadges(userData.uniqueId),
        getUserFriends(userData.uniqueId),
        getUserRooms(userData.uniqueId),
        getUserGroups(userData.uniqueId)
      ]);

      setAllBadges(badgesData || []);
      setUserFriends(friendsData || []);
      setUserRooms(roomsData || []);
      setUserGroups(groupsData || []);

      // Cache the complete user data
      setCachedUser(targetUser, {
        user: userData,
        badges: badgesData,
        friends: friendsData,
        rooms: roomsData,
        groups: groupsData
      });

      await Promise.all([
        fetchUserPhotos(userData.uniqueId),
        isLoggedIn && habboAccount ? checkFollowingStatus(userData.uniqueId) : null
      ]);
      
      toast({
        title: "Usuário encontrado!",
        description: `Perfil de ${userData.name} carregado com sucesso.`
      });

    } catch (err) {
      console.error('Error searching user:', err);
      setError('Erro ao buscar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedUsers = async () => {
    if (!isLoggedIn || !habboAccount) return;

    try {
      const { data } = await supabase
        .from('user_followers')
        .select('followed_habbo_name')
        .eq('follower_user_id', habboAccount.supabase_user_id);
      
      setFollowedUsers(data?.map(f => f.followed_habbo_name) || []);
    } catch (error) {
      console.error('Error fetching followed users:', error);
    }
  };

  const fetchUserPhotos = async (uniqueId: string) => {
    try {
      const response = await fetch(`https://www.habbo.com.br/api/public/users/${uniqueId}/photos`);
      if (response.ok) {
        const photos = await response.json();
        
        const transformedPhotos = await Promise.all(
          photos.map(async (photo: any) => {
            let likes = [];
            let comments = [];
            let isLiked = false;

            if (isLoggedIn) {
              const { data: likesData } = await supabase
                .from('photo_likes')
                .select('*')
                .eq('photo_id', photo.id);
              
              const { data: commentsData } = await supabase
                .from('photo_comments')
                .select('*')
                .eq('photo_id', photo.id);

              likes = likesData || [];
              comments = commentsData || [];
              isLiked = likes?.some(like => like.user_id === habboAccount?.supabase_user_id) || false;
            }

            return {
              id: photo.id,
              url: photo.url,
              likes: likes.length,
              comments: comments.length,
              isLiked
            };
          })
        );
        
        setUserPhotos(transformedPhotos);
      }
    } catch (err) {
      console.error('Error fetching user photos:', err);
    }
  };

  const checkFollowingStatus = async (habboId: string) => {
    if (!habboAccount) return;
    
    try {
      const { data } = await supabase
        .from('user_followers')
        .select('*')
        .eq('follower_user_id', habboAccount.supabase_user_id)
        .eq('followed_habbo_id', habboId)
        .single();
      
      setIsFollowing(!!data);
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  };

  const toggleFollow = async () => {
    if (!currentUser || !habboAccount || !isLoggedIn) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para seguir usuários.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from('user_followers')
          .delete()
          .eq('follower_user_id', habboAccount.supabase_user_id)
          .eq('followed_habbo_id', currentUser.uniqueId);
        
        setIsFollowing(false);
        toast({
          title: "Deixou de seguir",
          description: `Você não segue mais ${currentUser.name}`
        });
      } else {
        await supabase
          .from('user_followers')
          .insert({
            follower_user_id: habboAccount.supabase_user_id,
            follower_habbo_name: habboAccount.habbo_name,
            followed_habbo_id: currentUser.uniqueId,
            followed_habbo_name: currentUser.name
          });
        
        setIsFollowing(true);
        toast({
          title: "Seguindo!",
          description: `Agora você segue ${currentUser.name}`
        });
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status de seguidor",
        variant: "destructive"
      });
    }
  };

  const togglePhotoLike = async (photoId: string) => {
    if (!habboAccount || !isLoggedIn) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para curtir fotos.",
        variant: "destructive"
      });
      return;
    }

    try {
      const photo = userPhotos.find(p => p.id === photoId);
      if (!photo) return;

      if (photo.isLiked) {
        await supabase
          .from('photo_likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', habboAccount.supabase_user_id);
        
        setUserPhotos(prev => prev.map(p => 
          p.id === photoId 
            ? { ...p, likes: p.likes - 1, isLiked: false }
            : p
        ));
      } else {
        await supabase
          .from('photo_likes')
          .insert({
            photo_id: photoId,
            user_id: habboAccount.supabase_user_id,
            habbo_name: habboAccount.habbo_name
          });
        
        setUserPhotos(prev => prev.map(p => 
          p.id === photoId 
            ? { ...p, likes: p.likes + 1, isLiked: true }
            : p
        ));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleUserClick = (username: string) => {
    setSearchInput(username);
    searchUserWithCaching(username);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchFollowedUsers();
    }
  }, [isLoggedIn, habboAccount]);

  const renderAuthNotice = () => {
    if (isLoggedIn) return null;
    
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-800 mb-2">Console Público</CardTitle>
              <p className="text-sm text-blue-700">
                Você pode buscar usuários sem estar logado, mas funcionalidades como seguir, curtir e ver feed de amigos requerem login.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {currentUser ? (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="w-32 h-32">
                  <AvatarImage 
                    src={getAvatarUrl(currentUser.figureString, 'l')} 
                    alt={currentUser.name}
                  />
                  <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="text-center md:text-left flex-1">
                  <CardTitle className="text-3xl text-primary mb-2">{currentUser.name}</CardTitle>
                  <p className="text-lg text-muted-foreground mb-4">{currentUser.motto}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Membro desde: {new Date(currentUser.memberSince).toLocaleDateString('pt-BR')}</p>
                    <p>Status: {currentUser.online ? '🟢 Online' : '🔴 Offline'}</p>
                  </div>
                  
                  {isLoggedIn && (
                    <Button 
                      onClick={toggleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className="mt-4"
                    >
                      {isFollowing ? 'Deixar de Seguir' : 'Seguir'}
                    </Button>
                  )}
                  
                  {!isLoggedIn && (
                    <Button 
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/connect-habbo')}
                    >
                      Fazer Login para Seguir
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <ProfileNavigation
            activeSection={profileSection}
            setActiveSection={setProfileSection}
            badgeCount={allBadges.length}
            friendsCount={userFriends.length}
            roomsCount={userRooms.length}
            groupsCount={userGroups.length}
          />

          <ProfileSections
            activeSection={profileSection}
            badges={allBadges}
            friends={userFriends}
            rooms={userRooms}
            groups={userGroups}
            onUserClick={handleUserClick}
          />

          <Card>
            <CardHeader>
              <CardTitle>Fotos Públicas ({userPhotos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoGrid
                photos={userPhotos}
                onLikeToggle={togglePhotoLike}
                isLoggedIn={isLoggedIn}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {isLoggedIn ? 'Busque um usuário para ver o perfil' : 'Seu perfil será carregado automaticamente quando fizer login'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderFeedTab = () => (
    <div className="space-y-6">
      <FeedSystem
        feedType="general"
        followedUsers={followedUsers}
      />
    </div>
  );

  const renderFriendsTab = () => (
    <div className="space-y-6">
      <FeedSystem
        feedType="friends"
        followedUsers={followedUsers}
      />
    </div>
  );

  const renderContent = () => (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">HabboHub Console</h1>
        <p className="text-muted-foreground">Sua rede social do Habbo!</p>
      </div>

      {renderAuthNotice()}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="feed">Feed Geral</TabsTrigger>
          <TabsTrigger value="friends">Feed de Amigos</TabsTrigger>
        </TabsList>
        
        {/* Search bar positioned below tabs */}
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                placeholder="Digite o nome do usuário Habbo"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUser()}
                className="flex-1"
              />
              <Button onClick={() => searchUser()} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Buscar
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <TabsContent value="profile">{renderProfileTab()}</TabsContent>
        <TabsContent value="feed">{renderFeedTab()}</TabsContent>
        <TabsContent value="friends">{renderFriendsTab()}</TabsContent>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return <MobileLayout>{renderContent()}</MobileLayout>;
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg m-4 min-h-[calc(100vh-2rem)]">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Console;
