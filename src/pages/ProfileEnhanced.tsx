
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useIsMobile } from '../hooks/use-mobile';
import { useAuth } from '../hooks/useAuth';
import { getUserByName, getAvatarUrl, getBadgeUrl } from '../services/habboApi';
import { supabase } from '../integrations/supabase/client';
import MobileLayout from '../layouts/MobileLayout';

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
    badgeIndex: number;
    code: string;
    name: string;
    description: string;
  }>;
}

interface UserPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  category: string;
}

const ProfileEnhanced: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isLoggedIn, habboAccount } = useAuth();
  
  const [userData, setUserData] = useState<HabboUser | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Handle sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (username) {
      fetchUserData();
      fetchUserPosts();
    }
  }, [username]);

  const fetchUserData = async () => {
    if (!username) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const habboUser = await getUserByName(username);
      
      if (!habboUser) {
        setError('Usuário não encontrado ou perfil privado');
        return;
      }
      
      setUserData(habboUser);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!username) return;
    
    try {
      const { data: posts, error } = await supabase
        .from('forum_posts')
        .select('id, title, content, created_at, likes, category')
        .eq('author_habbo_name', username)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching user posts:', error);
        return;
      }

      setUserPosts(posts || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const isOwnProfile = () => {
    return isLoggedIn && habboAccount && habboAccount.habbo_name.toLowerCase() === username?.toLowerCase();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <Card className="bg-white border-gray-900">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} className="volter-font">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (!userData) {
      return (
        <Card className="bg-white border-gray-900">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Usuário não encontrado</p>
            <Button onClick={() => navigate('/')} className="volter-font">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="bg-white border-gray-900">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={getAvatarUrl(userData.name)}
                  alt={`Avatar de ${userData.name}`}
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${userData.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <div>
                <CardTitle className="text-2xl volter-font">{userData.name}</CardTitle>
                <p className="text-white/80 italic">"{userData.motto}"</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={userData.online ? "default" : "secondary"}>
                    {userData.online ? 'Online' : 'Offline'}
                  </Badge>
                  {isOwnProfile() && (
                    <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                      Seu Perfil
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Informações Gerais</h3>
                <p className="text-sm text-gray-600">
                  <strong>Membro desde:</strong> {new Date(userData.memberSince).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Último acesso:</strong> {userData.lastAccessTime ? new Date(userData.lastAccessTime).toLocaleDateString('pt-BR') : 'Não disponível'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Posts no fórum:</strong> {userPosts.length}
                </p>
              </div>
              
              {userData.selectedBadges && userData.selectedBadges.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Emblemas Selecionados</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.selectedBadges.map((badge, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={getBadgeUrl(badge.code)}
                          alt={badge.name}
                          className="w-8 h-8 hover:scale-110 transition-transform cursor-pointer"
                          title={`${badge.name}: ${badge.description}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Posts */}
        {userPosts.length > 0 && (
          <Card className="bg-white border-gray-900">
            <CardHeader>
              <CardTitle className="volter-font">Posts Recentes no Fórum</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <div key={post.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {post.category && (
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {post.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        ❤️ {post.likes} curtidas
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/forum')}
                        className="text-xs"
                      >
                        Ver no Fórum
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card className="bg-white border-gray-900">
          <CardContent className="p-6">
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate('/forum')}
                className="volter-font"
              >
                Ir para o Fórum
              </Button>
              {isOwnProfile() && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/connect-habbo')}
                  className="volter-font"
                >
                  Editar Perfil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title={`Perfil de ${username}`}
            icon="/assets/frank.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-h-full">
            {renderContent()}
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <PageHeader 
            title={`Perfil de ${username}`}
            icon="/assets/frank.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileEnhanced;
