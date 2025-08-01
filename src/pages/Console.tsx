import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileSections } from '@/components/console/ProfileSections';
import { FeedSystemEnhanced } from '@/components/console/FeedSystemEnhanced';
import { AdSpace } from '@/components/AdSpace';
import { PageHeader } from '@/components/PageHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileLayout from '@/layouts/MobileLayout';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { getUserByName, getAvatarUrl } from '@/services/habboApi';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserData {
  uniqueId?: string;
  id: string;
  name: string;
  motto: string;
  online: boolean;
  memberSince: string;
  selectedBadges: any[];
  figureString: string;
}

// Local cache for API calls
const userCache = new Map<string, { data: UserData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const Console = () => {
  const isMobile = useIsMobile();
  const { user, habboAccount } = useSupabaseAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('perfil');
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Load followed users
  useEffect(() => {
    const loadFollowedUsers = async () => {
      if (!user) return;

      try {
        const { data: following } = await supabase
          .from('user_followers')
          .select('followed_habbo_name')
          .eq('follower_user_id', user.id);

        if (following) {
          setFollowedUsers(following.map(f => f.followed_habbo_name));
        }
      } catch (error) {
        console.error('Error loading followed users:', error);
      }
    };

    loadFollowedUsers();
  }, [user]);

  // Auto-load current user's profile when logged in
  useEffect(() => {
    const loadCurrentUserProfile = async () => {
      if (habboAccount?.habbo_name && !selectedUser) {
        console.log(`🔄 [Console] Auto-loading profile for logged user: ${habboAccount.habbo_name}`);
        await searchUser(habboAccount.habbo_name);
      }
    };

    loadCurrentUserProfile();
  }, [habboAccount]);

  const getCachedUser = (username: string): UserData | null => {
    const cached = userCache.get(username.toLowerCase());
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.log(`💾 [Console] Using cached data for: ${username}`);
      return cached.data;
    }
    return null;
  };

  const setCachedUser = (username: string, data: UserData) => {
    userCache.set(username.toLowerCase(), {
      data,
      timestamp: Date.now()
    });
  };

  const searchUser = async (username: string) => {
    if (!username.trim()) {
      setSelectedUser(null);
      return;
    }

    // Check cache first
    const cachedUser = getCachedUser(username);
    if (cachedUser) {
      setSelectedUser(cachedUser);
      return;
    }

    setLoading(true);
    try {
      console.log(`🔍 [Console] Searching for user: ${username}`);
      const userData = await getUserByName(username);
      
      if (userData) {
        const processedUser: UserData = {
          uniqueId: userData.uniqueId,
          id: userData.uniqueId,
          name: userData.name,
          motto: userData.motto || '',
          online: userData.online || false,
          memberSince: userData.memberSince || '',
          selectedBadges: userData.selectedBadges || [],
          figureString: userData.figureString || ''
        };
        
        setCachedUser(username, processedUser);
        setSelectedUser(processedUser);
        console.log(`✅ [Console] User found: ${processedUser.name}`);
      } else {
        setSelectedUser(null);
        console.log(`❌ [Console] User not found: ${username}`);
      }
    } catch (error) {
      console.error('❌ [Console] Error searching user:', error);
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchUser(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchUser(searchTerm);
    }
  };

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Console"
            icon="/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <AdSpace type="horizontal" className="mb-6" />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="perfil">Perfil</TabsTrigger>
              <TabsTrigger value="feed-geral">Feed Geral</TabsTrigger>
              <TabsTrigger value="feed-amigos">Amigos</TabsTrigger>
            </TabsList>
            
            {/* Search bar below tabs */}
            <div className="mt-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Buscar usuário Habbo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>
            
            <TabsContent value="perfil" className="mt-6">
              {selectedUser ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Perfil de {selectedUser.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Motto: {selectedUser.motto}</p>
                    <p>Online: {selectedUser.online ? 'Sim' : 'Não'}</p>
                  </CardContent>
                </Card>
              ) : loading ? (
                <Card>
                  <CardContent className="p-6">
                    <p>Carregando...</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <p>Nenhum usuário selecionado</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="feed-geral" className="mt-6">
              <FeedSystemEnhanced feedType="general" followedUsers={followedUsers} />
            </TabsContent>
            
            <TabsContent value="feed-amigos" className="mt-6">
              <FeedSystemEnhanced feedType="friends" followedUsers={followedUsers} />
            </TabsContent>
          </Tabs>
          
          <AdSpace type="wide" className="mt-6" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat bg-cover" 
         style={{ 
           backgroundImage: 'url(/assets/bghabbohub.png)',
           margin: 0,
           padding: 0,
           width: '100vw',
           height: '100vh'
         }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection="console" setActiveSection={() => {}} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-4 md:p-8">
            <PageHeader 
              title="Console"
              icon="/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png"
              backgroundImage="/assets/1360__-3C7.png"
            />
            
            <AdSpace type="horizontal" className="mb-6" />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile */}
              <div className="lg:col-span-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="perfil">Perfil do Usuário</TabsTrigger>
                  </TabsList>
                  
                  {/* Search bar below tabs */}
                  <div className="mt-4">
                    <form onSubmit={handleSearchSubmit} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Buscar usuário Habbo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={loading}>
                        <Search className="w-4 h-4" />
                      </Button>
                    </form>
                    
                    {user && (
                      <div className="mt-2 text-sm text-gray-600">
                        Logado como: <Badge variant="outline">{habboAccount?.habbo_name}</Badge>
                      </div>
                    )}
                  </div>
                  
                  <TabsContent value="perfil" className="mt-6">
                    {selectedUser ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Perfil de {selectedUser.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Motto: {selectedUser.motto}</p>
                          <p>Online: {selectedUser.online ? 'Sim' : 'Não'}</p>
                        </CardContent>
                      </Card>
                    ) : loading ? (
                      <Card>
                        <CardContent className="p-6">
                          <p>Carregando...</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-6">
                          <p>Nenhum usuário selecionado</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Right Column - Feeds */}
              <div className="lg:col-span-2 space-y-6">
                <FeedSystemEnhanced feedType="general" followedUsers={followedUsers} />
                <FeedSystemEnhanced feedType="friends" followedUsers={followedUsers} />
              </div>
            </div>
            
            <AdSpace type="wide" className="mt-6" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Console;
