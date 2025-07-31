import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/use-mobile';
import { useAuth } from '../hooks/useAuth';
import { getUserByName, getUserProfile, getAvatarUrl, getBadgeUrl } from '../services/habboApi';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Users, Search, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PanelCard } from '../components/PanelCard';
import MobileLayout from '../layouts/MobileLayout';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';

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

const Console: React.FC = () => {
  const { isLoggedIn, habboAccount } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // State management
  const [searchInput, setSearchInput] = useState('');
  const [currentUser, setCurrentUser] = useState<HabboUser | null>(null);
  const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [friendsActivities, setFriendsActivities] = useState<Activity[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [photoComments, setPhotoComments] = useState<{[key: string]: any[]}>({});
  const [activeSection, setActiveSection] = useState('console');

  const searchUser = async () => {
    if (!searchInput.trim()) {
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
      const userData = await getUserByName(searchInput.trim());
      
      if (!userData) {
        setError('Usuário não encontrado.');
        setCurrentUser(null);
        return;
      }

      setCurrentUser(userData);
      
      // Fetch user photos
      await fetchUserPhotos(userData.uniqueId);
      
      // Check if following (only if logged in)
      if (isLoggedIn && habboAccount) {
        await checkFollowingStatus(userData.uniqueId);
      }
      
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

  const fetchUserPhotos = async (uniqueId: string) => {
    try {
      const response = await fetch(`https://www.habbo.com.br/api/public/users/${uniqueId}/photos`);
      if (response.ok) {
        const photos = await response.json();
        
        // Transform photos and get like counts (only if logged in)
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
        // Unfollow
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
        // Follow
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
        // Remove like
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
        // Add like
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

  const fetchFriendsActivity = async () => {
    if (!currentUser?.friends) return;
    if (!isLoggedIn) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para ver atividades de amigos.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get activities from friends using the proxy
      const activities: Activity[] = [];
      
      for (const friend of currentUser.friends.slice(0, 10)) { // Limit to avoid rate limiting
        try {
          const response = await supabase.functions.invoke('habbo-widgets-proxy', {
            body: { username: friend.name }
          });
          
          if (response.data?.activities) {
            activities.push(...response.data.activities.map((activity: Activity) => ({
              ...activity,
              friendName: friend.name
            })));
          }
        } catch (err) {
          console.error(`Error fetching activity for ${friend.name}:`, err);
        }
      }
      
      setFriendsActivities(activities.slice(0, 20)); // Show recent 20 activities
    } catch (err) {
      console.error('Error fetching friends activities:', err);
    }
  };

  const renderAuthNotice = () => {
    if (isLoggedIn) return null;
    
    return (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-800">Console Público</h3>
            <p className="text-sm text-blue-600">
              Você pode buscar usuários sem estar logado, mas funcionalidades como seguir, curtir e ver feed de amigos requerem login.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {currentUser ? (
        <>
          {/* User Info Card */}
          <PanelCard>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage 
                  src={getAvatarUrl(currentUser.figureString, 'l')} 
                  alt={currentUser.name}
                />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold text-primary mb-2">{currentUser.name}</h2>
                <p className="text-lg text-muted-foreground mb-4">{currentUser.motto}</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Membro desde: {new Date(currentUser.memberSince).toLocaleDateString('pt-BR')}</p>
                  <p>Status: {currentUser.online ? '🟢 Online' : '🔴 Offline'}</p>
                  {currentUser.friends && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setActiveTab('friends')}
                      className="text-primary hover:text-primary/80"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {currentUser.friends.length} Amigos
                    </Button>
                  )}
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
          </PanelCard>

          {/* Badges */}
          <PanelCard title={`Emblemas (${currentUser.selectedBadges?.length || 0})`}>
            <div className="flex flex-wrap gap-2">
              {currentUser.selectedBadges?.map((badge, index) => (
                <div key={index} className="text-center">
                  <img 
                    src={getBadgeUrl(badge.code)} 
                    alt={badge.name}
                    className="w-12 h-12 mx-auto"
                    title={badge.description}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{badge.name}</p>
                </div>
              ))}
            </div>
          </PanelCard>

          {/* Photos */}
          <PanelCard title={`Fotos Públicas (${userPhotos.length})`}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img 
                    src={photo.url} 
                    alt="User photo"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                    <Button
                      size="sm"
                      variant={photo.isLiked ? "default" : "secondary"}
                      onClick={() => togglePhotoLike(photo.id)}
                      disabled={!isLoggedIn}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {photo.likes}
                    </Button>
                    <Badge variant="secondary">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {photo.comments}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        </>
      ) : (
        <PanelCard>
          <div className="text-center py-8">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Busque um usuário para ver o perfil</p>
          </div>
        </PanelCard>
      )}
    </div>
  );

  const renderFeedTab = () => {
    if (!isLoggedIn) {
      return (
        <div className="space-y-6">
          <PanelCard title="Feed de Atividades">
            <div className="text-center py-8">
              <Info className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                O feed de atividades requer login para funcionar.
              </p>
              <Button onClick={() => navigate('/connect-habbo')}>
                Fazer Login
              </Button>
            </div>
          </PanelCard>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <PanelCard title="Feed de Atividades">
          <Button onClick={fetchFriendsActivity} className="mb-4">
            Atualizar Feed
          </Button>
          <div className="space-y-4">
            {friendsActivities.length > 0 ? (
              friendsActivities.map((activity, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{(activity as any).friendName}</span>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                  <p className="text-sm">{activity.activity}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma atividade recente encontrada
              </p>
            )}
          </div>
        </PanelCard>
      </div>
    );
  };

  const renderFriendsTab = () => {
    if (!currentUser) {
      return (
        <div className="space-y-6">
          <PanelCard title="Amigos">
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Busque um usuário primeiro para ver seus amigos
              </p>
            </div>
          </PanelCard>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <PanelCard title="Amigos">
          <Tabs defaultValue="activity">
            <TabsList>
              <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
              <TabsTrigger value="list">Lista Completa</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity">
              {!isLoggedIn ? (
                <div className="text-center py-8">
                  <Info className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Login necessário para ver atividades de amigos
                  </p>
                  <Button onClick={() => navigate('/connect-habbo')}>
                    Fazer Login
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button onClick={fetchFriendsActivity}>
                    Carregar Atividades
                  </Button>
                  {friendsActivities.map((activity, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <p>{activity.activity}</p>
                      <small className="text-muted-foreground">{activity.time}</small>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="list">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentUser?.friends?.map((friend) => (
                  <div key={friend.uniqueId} className="p-4 border rounded-lg flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={getAvatarUrl(friend.figureString)} />
                      <AvatarFallback>{friend.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">{friend.motto}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchInput(friend.name);
                          searchUser();
                          setActiveTab('profile');
                        }}
                        className="text-xs mt-1"
                      >
                        Ver Perfil
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </PanelCard>
      </div>
    );
  };

  const renderContent = () => (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">HabboHub Console</h1>
        <p className="text-muted-foreground">Seu centro de informações do Habbo!</p>
      </div>

      {/* Auth Notice */}
      {renderAuthNotice()}

      {/* Search */}
      <PanelCard>
        <div className="flex gap-4">
          <Input
            placeholder="Digite o nome do usuário Habbo"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUser()}
            className="flex-1"
          />
          <Button onClick={searchUser} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </Button>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive">{error}</p>
          </div>
        )}
      </PanelCard>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="friends">Amigos</TabsTrigger>
        </TabsList>
        
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
        <main className={`flex-1 overflow-y-auto transition-all duration-300`}>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg m-4 min-h-[calc(100vh-2rem)]">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Console;
