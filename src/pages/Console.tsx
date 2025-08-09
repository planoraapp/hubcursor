
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { UserSearch } from '../components/console/UserSearch';
import { EnhancedUserProfileCard } from '../components/console/EnhancedUserProfileCard';
import { ActivityTicker } from '../components/console/ActivityTicker';
import { ProfileNavigation } from '../components/console/ProfileNavigation';
import { ProfileSections } from '../components/console/ProfileSections';
import { useIsMobile } from '../hooks/use-mobile';
import { useHabboConsoleData } from '../hooks/useHabboConsoleData';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';
import MobileLayout from '../layouts/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const Console = () => {
  const [activeSection, setActiveSection] = useState('console');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeProfileSection, setActiveProfileSection] = useState('badges');
  const isMobile = useIsMobile();
  const { isLoggedIn } = useUnifiedAuth();

  const {
    searchUsername,
    userProfile,
    userBadges,
    userPhotos,
    isLoading,
    profileError,
    tickerActivities,
    tickerLoading,
    likes,
    comments,
    follows,
    hasLiked,
    isFollowing,
    interactionsLoading,
    searchUser,
    toggleLike,
    addComment,
    deleteComment,
    toggleFollow,
    getAvatarUrl,
    getBadgeUrl
  } = useHabboConsoleData();

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  const renderMainContent = () => {
    if (!userProfile) {
      return (
        <div className="space-y-6">
          <UserSearch 
            onSearch={searchUser} 
            isLoading={isLoading}
            placeholder="Digite o nome do usuário Habbo para ver o perfil..."
          />
          
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Bem-vindo ao Console Habbo
              </h3>
              <p className="text-gray-500 mb-4">
                Use a busca acima para encontrar um usuário e visualizar seu perfil completo
              </p>
              <div className="text-sm text-gray-400">
                <p>• Veja perfis, emblemas e atividades</p>
                <p>• Curta e comente perfis</p>
                <p>• Siga seus amigos favoritos</p>
              </div>
            </CardContent>
          </Card>
          
          <ActivityTicker 
            activities={tickerActivities}
            isLoading={tickerLoading}
          />
        </div>
      );
    }

    if (profileError) {
      return (
        <div className="space-y-6">
          <UserSearch 
            onSearch={searchUser} 
            isLoading={isLoading}
          />
          
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-red-500 mb-4">
                <Users className="w-16 h-16 mx-auto mb-2" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Usuário não encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                O usuário "{searchUsername}" não foi encontrado ou possui perfil privado
              </p>
              <p className="text-sm text-gray-400">
                Verifique o nome e tente novamente
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Search */}
        <div className="lg:col-span-2 space-y-6">
          <UserSearch 
            onSearch={searchUser} 
            isLoading={isLoading}
          />
          
          <EnhancedUserProfileCard
            user={userProfile}
            likes={likes}
            comments={comments}
            hasLiked={hasLiked}
            isFollowing={isFollowing}
            getAvatarUrl={getAvatarUrl}
            getBadgeUrl={getBadgeUrl}
            onToggleLike={toggleLike}
            onAddComment={addComment}
            onDeleteComment={deleteComment}
            onToggleFollow={toggleFollow}
          />
          
          {/* Profile Sections Navigation */}
          <ProfileNavigation 
            activeSection={activeProfileSection} 
            setActiveSection={setActiveProfileSection}
            badgeCount={userBadges.length}
            friendsCount={follows.length}
            roomsCount={0} // Mock data
            groupsCount={0} // Mock data
          />
          
          {/* Profile Sections Content */}
          <ProfileSections 
            activeSection={activeProfileSection}
            badges={userBadges.map(badge => ({
              code: badge.code,
              name: badge.name || badge.code,
              description: badge.description || ''
            }))}
            friends={[]} // Mock - would need friends API
            rooms={[]} // Mock - would need rooms API
            groups={[]} // Mock - would need groups API
            onUserClick={(username) => searchUser(username)}
          />
        </div>

        {/* Right Column - Activity Ticker */}
        <div className="space-y-6">
          <ActivityTicker 
            activities={tickerActivities}
            isLoading={tickerLoading}
          />
          
          {/* Additional Stats */}
          {userProfile && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Estatísticas do Perfil</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Curtidas:</span>
                    <span className="font-semibold">{likes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comentários:</span>
                    <span className="font-semibold">{comments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seguidores:</span>
                    <span className="font-semibold">{follows.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emblemas:</span>
                    <span className="font-semibold">{userBadges.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Console Habbo"
            icon="/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderMainContent()}
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
            title="Console Habbo"
            icon="/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default Console;
