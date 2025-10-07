// Versão corrigida - cache atualizado - v2
import React, { useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, RefreshCw, Loader2, AlertCircle, Users, MessageSquare, Search, Trophy, Home, Crown, Camera, Heart, MessageCircle, Globe } from 'lucide-react';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { useUnifiedPhotoSystem } from '@/hooks/useUnifiedPhotoSystem';
import { useAuth } from '@/hooks/useAuth';
import { PixelFrame } from './PixelFrame';
import { cn } from '@/lib/utils';
import { BadgesModal } from '@/components/profile/modals/BadgesModal';
import { FriendsModal } from '@/components/profile/modals/FriendsModal';
import { RoomsModal } from '@/components/profile/modals/RoomsModal';
import { GroupsModal } from '@/components/profile/modals/GroupsModal';
import { usePhotoInteractions } from '@/hooks/usePhotoInteractions';
import { PhotoCommentsModal } from '@/components/console/modals/PhotoCommentsModal';
import { PhotoLikesModal } from '@/components/console/modals/PhotoLikesModal';
import { IndividualPhotoView } from '@/components/console2/IndividualPhotoView';

const FriendsPhotoFeed = lazy(() => import('./FriendsPhotoFeed').then(module => ({ default: module.FriendsPhotoFeed })));
const FindPhotoFeedColumn = lazy(() => import('@/components/console2/FindPhotoFeedColumn').then(module => ({ default: module.FindPhotoFeedColumn })));
const GlobalPhotoFeedColumn = lazy(() => import('@/components/console2/GlobalPhotoFeedColumn').then(module => ({ default: module.GlobalPhotoFeedColumn })));


// Componentes de ícones pixelizados no estilo Habbo

// Função para mapear hotel para flag
const getHotelFlag = (hotel?: string) => {
  const hotelFlags: { [key: string]: string } = {
    'com': '/flags/flagcom.png',      // USA/UK
    'br': '/flags/flagbrazil.png',    // Brasil/Portugal
    'de': '/flags/flagdeus.png',      // Alemanha
    'fr': '/flags/flagfrance.png',    // França
    'it': '/flags/flagitaly.png',     // Itália
    'es': '/flags/flagspain.png',     // Espanha
    'nl': '/flags/flagnetl.png',      // Holanda
    'tr': '/flags/flagtrky.png',      // Turquia
    'fi': '/flags/flafinland.png',    // Finlândia
  };
  return hotelFlags[hotel || ''] || '/flags/flagcom.png'; // Default para com
};

const PixelSearchIcon = ({ className }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" className={className} style={{ imageRendering: 'pixelated' }}>
    {/* Background */}
    <rect x="0" y="0" width="40" height="40" fill="#ECAE00" />
    
    {/* Lupa */}
    <rect x="6" y="6" width="16" height="16" fill="none" stroke="#8B4513" strokeWidth="1" />
    <rect x="20" y="20" width="8" height="2" fill="#8B4513" />
    <rect x="22" y="22" width="6" height="2" fill="#8B4513" />
    <rect x="24" y="24" width="2" height="2" fill="#8B4513" />
  </svg>
);

type TabType = 'account' | 'friends' | 'chat' | 'photos' | 'photo';

interface TabButton {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  activeColor: string;
}

const tabs: TabButton[] = [
  {
    id: 'account',
    label: 'My Info',
    icon: <img src="/assets/console/my-info.png" alt="My Info" className="h-7 w-auto" style={{ imageRendering: 'pixelated' }} />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'friends',
    label: 'Friends',
    icon: <img src="/assets/console/friends-icon.png" alt="Friends" className="h-7 w-auto" style={{ imageRendering: 'pixelated' }} />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: <img src="/assets/console/chat-icon.png" alt="Chat" className="h-8 w-auto" style={{ imageRendering: 'pixelated' }} />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'photos',
    label: 'Photos',
    icon: <img src="/assets/console/photos-icon.png" alt="Photos" className="h-8 w-auto" style={{ imageRendering: 'pixelated' }} />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  }
];

export const FunctionalConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [viewingUser, setViewingUser] = useState<string | null>(null); // Estado para usuário sendo visualizado
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null); // Foto selecionada para o modal
  const [activeModal, setActiveModal] = useState<string | null>(null); // Estado global para modais
  
  // Modal states for photo interactions
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bodyDirection, setBodyDirection] = useState(2);
  const [headDirection, setHeadDirection] = useState(3);
  const [hiddenPhotos, setHiddenPhotos] = useState<string[]>([]);
  const [showAllPhotosModal, setShowAllPhotosModal] = useState(false);
  


  // Modal handlers
  const handleShowLikesModal = (photo: any) => {
    setSelectedPhotoForModal(photo);
    setShowLikesModal(true);
  };

  const handleShowCommentsModal = (photo: any) => {
    setSelectedPhotoForModal(photo);
    setShowCommentsModal(true);
  };

  // Estados para navegação de fotos individuais
  const [selectedIndividualPhoto, setSelectedIndividualPhoto] = useState<{
    id: string;
    imageUrl: string;
    date: string;
    likes: number;
  } | null>(null);

  // Handlers para navegação de fotos individuais
  const handlePhotoClick = (photo: any, index: number) => {
    const photoId = photo.id || `photo-${index}`;
    
    setSelectedIndividualPhoto({
      id: photoId,
      imageUrl: photo.imageUrl || photo.url || `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-${1755308009079 + index}.png`,
      date: photo.date || new Date().toLocaleDateString('pt-BR'),
      likes: photo.likes || 0
    });
    setActiveTab('photo'); // Ativa a aba 'photo'
  };

  const handleBackFromPhoto = () => {
    setActiveTab('account'); // Volta para a aba account
    setSelectedIndividualPhoto(null);
  };

  
  // Modal state tracking
  // PhotoModal temporariamente removido
  const { habboAccount, isLoggedIn } = useAuth();
  const { getPhotoInteractions, toggleLike, addComment } = usePhotoInteractions();
  
  // Usar o usuário logado como padrão, ou o usuário sendo visualizado
  const currentUser = habboAccount?.habbo_name;
  const username = viewingUser || currentUser || 'Beebop'; // Fallback para Beebop se não logado
  
  // Buscar dados reais usando useCompleteProfile
  const { data: completeProfile, isLoading, error: profileError } = useCompleteProfile(username, habboAccount?.hotel || 'com.br');
  const { photos: photosData, isLoading: photosLoading } = useUnifiedPhotoSystem(username, habboAccount?.hotel || 'br');
  
  // Debug logs removidos para evitar flicker

  // Estados derivados dos dados reais
  const userData = completeProfile ? {
    name: completeProfile.name,
    motto: completeProfile.motto,
    memberSince: completeProfile.memberSince,
    lastWebAccess: completeProfile.lastAccessTime,
    figure_string: completeProfile.figureString,
    homeRoom: { name: "HabboHub" },
    uniqueId: completeProfile.uniqueId,
    hotel: "br",
    online: completeProfile.online,
    profileVisible: completeProfile.profileVisible ?? true // Assume público se não especificado
  } : null;

  // Função para formatar datas de forma mais robusta
  const formatDate = (dateString: string | undefined, includeTime: boolean = false) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      };
      
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      
      return date.toLocaleDateString('pt-BR', options);
    } catch (error) {
      console.warn('Erro ao formatar data:', dateString, error);
      return 'Data inválida';
    }
  };

  // Debug temporário para verificar dados
  React.useEffect(() => {
    if (viewingUser && completeProfile) {
      // Debug info removed for production
    }
  }, [viewingUser, completeProfile]);

  const badges = completeProfile?.data?.badges || [];
  const friends = completeProfile?.data?.friends || [];
  const rooms = completeProfile?.data?.rooms || [];
  const groups = completeProfile?.data?.groups || [];
  const photos = photosData || [];
  
  const error = profileError?.message || null;
  
  // Função para navegar para perfil de outro usuário
  const navigateToProfile = (targetUsername: string) => {
    setViewingUser(targetUsername);
    setActiveTab('friends'); // Vai para a aba Friends ao ver perfil de outro usuário
    
    // Fecha qualquer modal que esteja aberto
    if (activeModal) {
      setActiveModal(null);
    }
  };

  // Função para voltar ao próprio perfil
  const backToMyProfile = () => {
    setViewingUser(null);
    setActiveTab('account');
  };
  
  // Função para refresh dos dados
  const refreshData = React.useCallback(() => {
    // Os dados serão atualizados automaticamente pelos hooks
  }, []);

  const renderTabContent = () => {

    const isLoadingData = isLoading || photosLoading;
    
    switch (activeTab) {
      case 'account':
        return <AccountTab 
          user={userData} 
          badges={badges} 
          rooms={rooms} 
          groups={groups} 
          friends={friends} 
          photos={photos} 
          isLoading={isLoadingData}
          onNavigateToProfile={navigateToProfile}
          isViewingOtherUser={!!viewingUser}
          viewingUsername={viewingUser}
          currentUser={currentUser}
          getPhotoInteractions={getPhotoInteractions}
          setSelectedPhoto={setSelectedPhoto}
          toggleLike={toggleLike}
          addComment={addComment}
          habboAccount={habboAccount}
          username={username}
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          handlePhotoClick={handlePhotoClick}
        />;
      case 'friends':
        return <FeedTab 
          user={userData}
          badges={badges} 
          rooms={rooms} 
          groups={groups} 
          friends={friends} 
          photos={photos}
          isLoading={isLoadingData}
          onNavigateToProfile={navigateToProfile}
          isViewingOtherUser={!!viewingUser}
          viewingUsername={viewingUser}
          currentUser={currentUser}
          getPhotoInteractions={getPhotoInteractions}
          setSelectedPhoto={setSelectedPhoto}
          toggleLike={toggleLike}
          addComment={addComment}
          habboAccount={habboAccount}
          username={username}
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          handleShowLikesModal={handleShowLikesModal}
          handleShowCommentsModal={handleShowCommentsModal}
        />;
      case 'chat':
        return <FriendsTab 
          friends={friends} 
          isLoading={isLoadingData}
          onNavigateToProfile={navigateToProfile}
        />;
      case 'photos':
        return <PhotosTab 
          isLoading={isLoading}
        />;
      case 'photo':
        return selectedIndividualPhoto ? (
          <IndividualPhotoView
            photo={selectedIndividualPhoto}
            userName={userData?.name || currentUser || 'Usuário'}
            onBack={handleBackFromPhoto}
            onUserClick={() => {}}
          />
        ) : (
          <Card className="bg-transparent text-white border-0 shadow-none h-full flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Nenhuma foto selecionada</h3>
              <p className="text-white/60 text-sm mb-4">Volte ao perfil para selecionar uma foto</p>
              <Button 
                onClick={handleBackFromPhoto}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              >
                Voltar ao Perfil
              </Button>
            </div>
          </Card>
        );
      default:
        return (
          <Card className="bg-transparent text-white border-0 shadow-none h-full flex items-center justify-center">
            <div className="text-center">
              <User className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Perfil Temporariamente Desabilitado</h3>
              <p className="text-white/60 text-sm mb-4">Para evitar flickering durante desenvolvimento</p>
              <div className="space-y-2 text-sm text-white/50">
                <p>✅ Console funcionando</p>
                <p>✅ Navegação entre abas</p>
                <p>✅ Sem re-renderizações infinitas</p>
              </div>
            </div>
          </Card>
        );
    }
  };

  if (error) {
    return (
      <Card className="bg-transparent text-white border-0 shadow-none h-full overflow-x-hidden">
        <CardContent className="p-6 text-center space-y-4 overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent overflow-y-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white volter-font">❌ Erro ao Carregar</h3>
            <p className="text-white/80 text-sm">{error}</p>
          </div>
          <Button onClick={refreshData} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto h-[750px] w-[375px] overflow-x-hidden">
      <div className="pixel-frame-outer h-full max-w-full">
        <div className="pixel-header-bar">
          <div className="pixel-title">
            {viewingUser ? `Perfil de ${viewingUser}` : (currentUser ? 'Meu Console' : 'Console do Habbo')}
          </div>
          <div className="pixel-pattern"></div>
        </div>
        
        {/* Main content area */}
        <div className="pixel-inner-content">
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 overflow-hidden">
              {renderTabContent()}
            </div>
          </div>
          
          {/* Photo modals rendered at console level */}
          {selectedPhotoForModal && (
            <>
              <PhotoLikesModal
                likes={[]} // TODO: Get actual likes data
                isOpen={showLikesModal}
                onClose={() => {
                  setShowLikesModal(false);
                  setSelectedPhotoForModal(null);
                }}
              />
              
              <PhotoCommentsModal
                comments={[]} // TODO: Get actual comments data
                isOpen={showCommentsModal}
                onClose={() => {
                  setShowCommentsModal(false);
                  setSelectedPhotoForModal(null);
                }}
                onAddComment={(comment) => {
                  // TODO: Implement add comment
                  // Comment functionality removed for production
                }}
                onDeleteComment={(commentId) => {
                  // TODO: Implement delete comment
                  // Delete functionality removed for production
                }}
                canDeleteComment={(comment) => {
                  // TODO: Implement permission check
                  return false;
                }}
              />
            </>
          )}
        </div>

        {/* Tab navigation at bottom - now part of external frame */}
        {/* Tab navigation at bottom - Habbo Classic Style */}
        <div className="relative bg-yellow-400">
          
          <div className="grid grid-cols-4 gap-0 p-1">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'account' && viewingUser) {
                    // Se clicou em "My Info" e está visualizando outro usuário, volta ao próprio perfil
                    backToMyProfile();
                  } else if (tab.id === 'friends' && viewingUser) {
                    // Se clicou em "Friends" e está visualizando outro usuário, volta ao feed normal
                    setViewingUser(null);
                    setActiveTab('friends');
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center p-2 transition-all duration-200",
                  "border border-[#9C6300]",
                  activeTab === tab.id ? "bg-[#CD9700]" : "bg-[#ECAE00]"
                )}
                style={{
                  boxShadow: activeTab === tab.id 
                    ? "inset 0px 2px 0px #FFCC00" 
                    : "inset 0px 2px 0px #FFCC00",
                  minHeight: '86px'
                }}
              >
                {/* Icon */}
                <div className={cn(
                  "mb-2 transition-transform duration-200",
                  activeTab === tab.id ? "scale-110" : "scale-100"
                )}>
                  {tab.icon}
                </div>
                
                {/* Text */}
                <span 
                  className="text-[9px] font-bold uppercase leading-none text-center"
                  style={{ 
                    color: '#B57600',
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.01em',
                    textShadow: 'none'
                  }}
                >
                  {tab.label}
                </span>
                
                {/* Bottom lines */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="flex flex-col gap-0.5">
                    <div 
                      className="w-[67px] h-[1px] border-t border-[#B57600]"
                      style={{
                        boxShadow: '0px -1px 0px #FCCA00',
                        opacity: activeTab === tab.id ? '0.4' : '1'
                      }}
                    ></div>
                    <div 
                      className="w-[67px] h-[1px] border-t border-[#B57600]"
                      style={{
                        boxShadow: '0px -1px 0px #FCCA00',
                        opacity: activeTab === tab.id ? '0.4' : '1'
                      }}
                    ></div>
                    <div 
                      className="w-[67px] h-[1px] border-t border-[#B57600]"
                      style={{
                        boxShadow: '0px -1px 0px #FCCA00',
                        opacity: activeTab === tab.id ? '0.4' : '1'
                      }}
                    ></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals Globais */}
      <BadgesModal 
        isOpen={activeModal === 'badges'} 
        onClose={() => setActiveModal(null)}
        badges={badges || []}
        userName={userData?.name || 'Usuário'}
        onNavigateToProfile={navigateToProfile}
      />
      
      <FriendsModal 
        isOpen={activeModal === 'friends'} 
        onClose={() => setActiveModal(null)}
        friends={friends || []}
        userName={userData?.name || 'Usuário'}
        onNavigateToProfile={navigateToProfile}
      />
      
      <GroupsModal 
        isOpen={activeModal === 'groups'} 
        onClose={() => setActiveModal(null)}
        groups={groups || []}
        userName={userData?.name || 'Usuário'}
        onNavigateToProfile={navigateToProfile}
      />
      
      <RoomsModal 
        isOpen={activeModal === 'rooms'} 
        onClose={() => setActiveModal(null)}
        rooms={rooms || []}
        userName={userData?.name || 'Usuário'}
        onNavigateToProfile={navigateToProfile}
      />
    </div>
  );
};



// Componente da aba Feed
const FeedTab: React.FC<any> = ({ 
  user, badges, rooms, groups, friends, photos, isLoading, 
  onNavigateToProfile, isViewingOtherUser, viewingUsername, currentUser,
  getPhotoInteractions, setSelectedPhoto, toggleLike, addComment, habboAccount, username,
  activeModal, setActiveModal, handleShowLikesModal, handleShowCommentsModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // Fechar dropdown quando clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.country-dropdown')) {
        setShowCountryDropdown(false);
      }
    };
    
    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);
  
  // Mapeamento dos países disponíveis
  const countries = [
    { code: 'com', name: 'USA/UK', flag: '/flags/flagcom.png' },
    { code: 'br', name: 'Brasil/Portugal', flag: '/flags/flagbrazil.png' },
    { code: 'de', name: 'Alemanha', flag: '/flags/flagdeus.png' },
    { code: 'fr', name: 'França', flag: '/flags/flagfrance.png' },
    { code: 'it', name: 'Itália', flag: '/flags/flagitaly.png' },
    { code: 'es', name: 'Espanha', flag: '/flags/flagspain.png' },
    { code: 'nl', name: 'Holanda', flag: '/flags/flagnetl.png' },
    { code: 'tr', name: 'Turquia', flag: '/flags/flagtrky.png' },
    { code: 'fi', name: 'Finlândia', flag: '/flags/flafinland.png' }
  ];
  
  // Função para buscar usuários
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // Aqui você pode integrar com a API de busca do Habbo
      // Por enquanto, vamos simular uma busca
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock de resultados (substitua pela API real)
      setSearchResults([
        {
          name: searchTerm,
          motto: 'HUB-XXXXX',
          online: true,
          figureString: 'hd-180-1.ch-255-66.lg-285-110.sh-290-62.ha-1012-110.hr-828-61',
          uniqueId: '12345'
        }
      ]);
    } catch (error) {
      // Error handled silently
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Detectar perfil privado: se não há dados completos ou se explicitamente privado
  const isProfilePrivate = isViewingOtherUser && (
    !user?.profileVisible || 
    (badges.length === 0 && friends.length === 0 && rooms.length === 0 && groups.length === 0)
  );
  
  // Detectar se o usuário não tem fotos (mesmo com perfil público)
  const hasNoPhotos = (photos?.length || 0) === 0;
  const isPrivateProfile = user?.profileVisible === false;
  
  const isOwnProfile = !isViewingOtherUser || viewingUsername === currentUser;
  if (isLoading) {
    return (
      <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-4" />
            <p className="text-white/60">Carregando informações do usuário...</p>
          </div>
        </div>
      </div>
    );
  }

  // Se estiver visualizando outro usuário, mostrar o perfil completo
  if (isViewingOtherUser) {
    return (
      <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
        {/* Mensagem para perfil privado */}
        {isProfilePrivate && (
          <div className="p-4 bg-yellow-600/20 border-b border-yellow-400/30">
            <div className="flex items-center gap-3">
              <div className="text-yellow-400 text-lg">🔒</div>
              <div>
                <h4 className="text-yellow-200 font-semibold">
                  {isPrivateProfile ? 'Perfil Privado' : 'Dados Limitados'}
                </h4>
                <p className="text-yellow-200/80 text-sm">
                  {isPrivateProfile 
                    ? 'Este usuário tem o perfil privado. Para exibir mais informações, o usuário precisa tornar seu perfil público nas configurações do jogo.'
                    : 'Este usuário não tem dados públicos disponíveis ou tem o perfil restrito.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Header do usuário com borda inferior */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <img 
                src={user?.figure_string ? 
                  `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${encodeURIComponent(user.figure_string)}&size=m&direction=2&head_direction=3` :
                  `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user?.name || 'Beebop'}&size=m&direction=2&head_direction=3`
                }
                alt={`Avatar de ${user?.name || 'Beebop'}`}
                className="h-28 w-auto object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // Fallback para busca por nome se o figure_string falhar
                  target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user?.name || 'Beebop'}&size=m&direction=2&head_direction=3`;
                }}
              />
              
              {/* Ícones de país e online/offline - canto superior direito */}
              <div className="absolute top-0 right-0 flex items-center gap-1">
                {/* Flag do país */}
                <img
                  src={getHotelFlag(user?.hotel)}
                  alt=""
                  className="h-6 w-auto object-contain"
                  style={{ imageRendering: 'pixelated' }}
              />
              {/* Ícone de online/offline */}
                <img 
                  src={user?.online ? 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/online.gif' : 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/offline.gif'}
                  alt={user?.online ? 'Online' : 'Offline'}
                  className="h-6 w-auto object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white mb-2 truncate">{user?.name || 'Beebop'}</h2>
              <p className="text-white/70 italic mb-4 truncate">
                "{user?.motto && user.motto.trim() ? user.motto : 'null'}"
              </p>
              
              <div className="space-y-1 text-xs text-white/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-nowrap">Criado em:</span>
                  <span className="truncate">
                    {user?.memberSince ? 
                      new Date(user.memberSince).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      }) : 
                      'Data não disponível'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-nowrap">Último acesso:</span>
                  <span className="truncate">
                    {user?.lastWebAccess ? 
                      new Date(user.lastWebAccess).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 
                      'Data não disponível'
                    }
                  </span>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Contadores de Interação */}
        <div className="p-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {isProfilePrivate ? '0' : (photos?.length || 0)}
              </div>
              <div className="text-xs text-white/60">Fotos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">0</div>
              <div className="text-xs text-white/60">Seguidores</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">0</div>
              <div className="text-xs text-white/60">Seguindo</div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-1">
            <button 
              onClick={() => {
                setActiveModal('badges');
              }}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <img 
                src="/assets/console/badgestab-icon.png" 
                alt="Emblemas" 
                className="max-h-none w-auto object-contain" 
                style={{ imageRendering: 'pixelated', transform: 'scale(1.5)' }}
              />
              <div className="text-center">
                <div className="text-sm font-medium text-white">
                  {isProfilePrivate ? '0' : badges.length}
                </div>
                <div className="text-xs text-white/60">Emblemas</div>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveModal('rooms')}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <img 
                src="/assets/console/roomstab-icon.png" 
                alt="Quartos" 
                className="h-8 w-auto object-contain" 
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="text-center">
                <div className="text-sm font-medium text-white">
                  {isProfilePrivate ? '0' : rooms.length}
                </div>
                <div className="text-xs text-white/60">Quartos</div>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveModal('friends')}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <img 
                src="/assets/console/friendstab-icon.png" 
                alt="Amigos" 
                className="h-8 w-auto object-contain" 
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="text-center">
                <div className="text-sm font-medium text-white">
                  {isProfilePrivate ? '0' : friends.length}
                </div>
                <div className="text-xs text-white/60">Amigos</div>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveModal('groups')}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <img 
                src="/assets/console/groupstab-icon.png" 
                alt="Grupos" 
                className="h-8 w-auto object-contain" 
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="text-center">
                <div className="text-sm font-medium text-white">
                  {isProfilePrivate ? '0' : groups.length}
                </div>
                <div className="text-xs text-white/60">Grupos</div>
              </div>
            </button>
          </div>
        </div>

        {/* Fotos com borda superior */}
        <div className="p-0 border-t border-white/20">
          <div className="px-4 pt-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera w-5 h-5">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                <circle cx="12" cy="13" r="3"></circle>
              </svg>
              Fotos ({isProfilePrivate ? '0' : (photos?.length || 0)})
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {!isProfilePrivate && photos?.length > 0 ? (
              photos.map((photo, index) => {
                const photoId = photo.id || `photo-${index}`;
                const interactions = getPhotoInteractions(photoId);
                
                return (
                  <div 
                    key={photoId} 
                    className="relative group cursor-pointer"
                    onClick={() => {
                      setSelectedPhoto({
                        id: photoId,
                        url: photo.imageUrl || photo.url || `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-${1755308009079 + index}.png`,
                        likes: interactions.likes,
                        comments: interactions.comments,
                        isLiked: interactions.isLiked
                      });
                      // Modal temporariamente desabilitado
                    }}
                  >
                    <div className="w-full aspect-square bg-gray-700 overflow-hidden">
                      <img 
                        src={photo.imageUrl || photo.url || `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-${1755308009079 + index}.png`} 
                        alt={photo.caption || `Foto ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-${1755308009079 + index}.png`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-2 right-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                                <Heart className="w-3 h-3 text-white" />
                                <span className="text-xs text-white">{interactions.likes}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                                <MessageCircle className="w-3 h-3 text-white" />
                                <span className="text-xs text-white">{interactions.comments.length}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : !isProfilePrivate && hasNoPhotos ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-8 text-white/60">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">O usuário não tem fotos :(</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Feed normal quando estiver no próprio perfil
  return (
    <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
      
      {/* Campo de Busca */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Campo de busca com dropdown integrado */}
          <div className="flex-1 relative">
            <div className="flex items-center bg-white/10 border border-white/20 rounded focus-within:border-white/60 transition-colors h-8">
              {/* Dropdown de países */}
              <div className="relative country-dropdown z-10">
                <button
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className={`flex items-center justify-center transition-colors border-r border-white/20 relative z-20 h-full ${
                    selectedCountry 
                      ? 'px-1 min-w-[50px]' 
                      : 'px-2 min-w-[35px] text-white hover:bg-white/10'
                  }`}
                  title={selectedCountry ? countries.find(c => c.code === selectedCountry)?.name : 'Selecionar país'}
                >
                  {selectedCountry ? (
                    <img
                      src={countries.find(c => c.code === selectedCountry)?.flag}
                      alt=""
                      className="h-5 w-auto object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <img
                      src="/assets/console/hotelfilter.png"
                      alt="Filtro"
                      className="h-6 w-auto object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                </button>
                
                {/* Dropdown menu */}
                {showCountryDropdown && (
                  <div 
                    className="absolute top-full left-0 mt-1 border border-black rounded-lg shadow-lg z-50 min-w-[200px] overflow-hidden"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
                      backgroundSize: '100% 2px'
                    }}
                  >
                    {/* Borda superior amarela com textura pontilhada */}
                    <div className="bg-yellow-400 border-b border-black relative overflow-hidden" style={{
                      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                      backgroundSize: '8px 8px'
                    }}>
                      <div className="pixel-pattern absolute inset-0 opacity-20"></div>
                      <div className="p-2 relative z-10">
                        <div className="text-white font-bold text-sm" style={{
                          textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                        }}>
                          Selecionar País
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setSelectedCountry(null);
                          setShowCountryDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-white hover:bg-white/10 flex items-center transition-colors"
                      >
                        <img
                          src="/assets/console/hotelfilter.png"
                          alt="Filtro"
                          className="h-6 w-auto object-contain mr-2"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <span className="text-sm">Todos os países</span>
                      </button>
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => {
                            setSelectedCountry(country.code);
                            setShowCountryDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-white hover:bg-white/10 flex items-center transition-colors"
                        >
                          <div className="w-10 h-8 flex items-center justify-center mr-2">
                          <img
                            src={country.flag}
                            alt=""
                              className="h-8 w-auto object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          </div>
                          <span className="text-sm">{country.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input de texto */}
              <input
                type="text"
                placeholder="Digite o nome do usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-1 bg-transparent text-white placeholder-white/50 focus:outline-none text-sm h-full"
              />
              
              {/* Botão de busca integrado */}
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                className="px-2 py-1 text-white/60 hover:text-white disabled:text-white/30 transition-colors flex items-center justify-center h-full"
                title="Buscar"
              >
                {isSearching ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Search className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Resultados da busca */}
        {searchResults.length > 0 && (
          <div className="mt-2 space-y-1">
            <h4 className="text-xs font-semibold text-white/80">Resultados da busca:</h4>
            {searchResults.map((user, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-white/10 rounded border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                onClick={() => onNavigateToProfile(user.name)}
              >
                <img
                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${user.figureString}&size=s`}
                  alt={user.name}
                  className="w-6 h-6 rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{user.name}</div>
                  <div className="text-xs text-white/60 truncate">{user.motto}</div>
                </div>
                <div className={`w-2 h-2 rounded-full ${user.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Feed de Fotos dos Amigos */}
      <div className="py-4 relative">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-4" />
              <p className="text-white/60">Carregando feed de fotos...</p>
            </div>
          </div>
        }>
          <FriendsPhotoFeed
            currentUserName={currentUser || 'Beebop'}
            hotel={habboAccount?.hotel || 'br'}
            onNavigateToProfile={onNavigateToProfile}
          />
        </Suspense>
      </div>
      
    </div>
  );
};

// Componente da aba Photos (Feed Global)
const PhotosTab: React.FC<any> = ({ isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const countries = [
    { code: 'com', name: 'USA/UK', flag: '/flags/flagcom.png' },
    { code: 'br', name: 'Brasil/Portugal', flag: '/flags/flagbrazil.png' },
    { code: 'de', name: 'Alemanha', flag: '/flags/flagdeus.png' },
    { code: 'fr', name: 'França', flag: '/flags/flagfrance.png' },
    { code: 'it', name: 'Itália', flag: '/flags/flagitaly.png' },
    { code: 'es', name: 'Espanha', flag: '/flags/flagspain.png' },
    { code: 'nl', name: 'Holanda', flag: '/flags/flagnetl.png' },
    { code: 'tr', name: 'Turquia', flag: '/flags/flagtrky.png' },
    { code: 'fi', name: 'Finlândia', flag: '/flags/flafinland.png' },
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Simular busca
    setTimeout(() => {
      setSearchResults([
        {
          id: 1,
          name: searchTerm,
          hotel: selectedCountry || 'br',
          online: Math.random() > 0.5,
          motto: 'Motto do usuário'
        }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="h-full">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-4" />
            <p className="text-white/60">Carregando feed global...</p>
          </div>
        </div>
      }>
        <div className="space-y-4 relative">
          {/* Campo de Busca */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              {/* Campo de busca com dropdown integrado */}
              <div className="flex-1 relative">
                <div className="flex items-center bg-white/10 border border-white/20 rounded focus-within:border-white/60 transition-colors h-8">
                  {/* Dropdown de países */}
                  <div className="relative country-dropdown z-10">
                    <button
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className={`flex items-center justify-center transition-colors border-r border-white/20 relative z-20 h-full ${
                        selectedCountry 
                          ? 'px-1 min-w-[50px]' 
                          : 'px-2 min-w-[35px] text-white hover:bg-white/10'
                      }`}
                      title={selectedCountry ? countries.find(c => c.code === selectedCountry)?.name : 'Selecionar país'}
                    >
                      {selectedCountry ? (
                        <img
                          src={countries.find(c => c.code === selectedCountry)?.flag}
                          alt=""
                          className="h-5 w-auto object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <img
                          src="/assets/console/hotelfilter.png"
                          alt="Filtro"
                          className="h-6 w-auto object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      )}
                    </button>
                    
                    {/* Dropdown menu */}
                    {showCountryDropdown && (
                      <div 
                        className="absolute top-full left-0 mt-1 border border-black rounded-lg shadow-lg z-50 min-w-[200px] overflow-hidden"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
                          backgroundSize: '100% 2px'
                        }}
                      >
                        {/* Borda superior amarela com textura pontilhada */}
                        <div className="bg-yellow-400 border-b border-black relative overflow-hidden" style={{
                          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                          backgroundSize: '8px 8px'
                        }}>
                          <div className="pixel-pattern absolute inset-0 opacity-20"></div>
                          <div className="p-2 relative z-10">
                            <div className="text-white font-bold text-sm" style={{
                              textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                            }}>
                              Selecionar País
                            </div>
                          </div>
                        </div>
                        
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setSelectedCountry(null);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-white hover:bg-white/10 flex items-center transition-colors"
                          >
                            <img
                              src="/assets/console/hotelfilter.png"
                              alt="Filtro"
                              className="h-6 w-auto object-contain mr-2"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            <span className="text-sm">Todos os países</span>
                          </button>
                          {countries.map((country) => (
                            <button
                              key={country.code}
                              onClick={() => {
                                setSelectedCountry(country.code);
                                setShowCountryDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left text-white hover:bg-white/10 flex items-center transition-colors"
                            >
                              <div className="w-10 h-8 flex items-center justify-center mr-2">
                                <img
                                  src={country.flag}
                                  alt=""
                                  className="h-8 w-auto object-contain"
                                  style={{ imageRendering: 'pixelated' }}
                                />
                              </div>
                              <span className="text-sm">{country.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Input de texto */}
                  <input
                    type="text"
                    placeholder="Digite o nome do usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-3 py-1 bg-transparent text-white placeholder-white/50 focus:outline-none text-sm h-full"
                  />
                  
                  {/* Botão de busca integrado */}
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchTerm.trim()}
                    className="px-2 py-1 text-white/60 hover:text-white disabled:text-white/30 transition-colors flex items-center justify-center h-full"
                    title="Buscar"
                  >
                    {isSearching ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Search className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Título do feed */}
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <img
                src="/assets/console/hotelfilter.png"
                alt="Filtro"
                className="h-5 w-auto object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              Feed do Hotel
            </h3>
          </div>

          {/* Feed de fotos */}
          <GlobalPhotoFeedColumn hotel={selectedCountry || 'br'} />
        </div>
      </Suspense>
    </div>
  );
};

// Componente da aba Friends
const FriendsTab: React.FC<any> = ({ friends, isLoading, onNavigateToProfile }) => {
  if (isLoading) {
    return (
      <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-4" />
            <p className="text-white/60">Carregando amigos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-bold">Feed de Amigos</h3>
        <p className="text-sm text-white/60 mt-1">{friends.length} amigos</p>
      </div>
      <div className="flex-1 p-4 space-y-3">
        {friends.length > 0 ? (
          friends.map((friend) => (
            <div 
              key={friend.uniqueId} 
              className="flex items-center space-x-3 p-3 bg-white/10 rounded border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
              onClick={() => onNavigateToProfile(friend.name)}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 overflow-hidden">
                  <img 
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${friend.name}&size=l&direction=2&head_direction=3&headonly=1`}
                    alt={friend.name}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${friend.name}&size=l&direction=2&head_direction=3&headonly=1`;
                    }}
                  />
                </div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-3 h-3 border border-white rounded-full",
                  friend.online ? "bg-green-500" : "bg-red-500"
                )}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate">{friend.name}</div>
                <div className="text-white/60 text-sm truncate">"{friend.motto}"</div>
                <div className="text-white/40 text-xs">
                  {friend.online ? '🟢 Online' : '🔴 Offline'}
                </div>
              </div>
              <button 
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToProfile(friend.name);
                }}
              >
                Ver Perfil
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-white/60">
            <div className="text-4xl mb-4">👥</div>
            <h4 className="text-lg font-semibold mb-2">Nenhum amigo encontrado</h4>
            <p className="text-sm text-center">
              Você ainda não tem amigos adicionados ou seus amigos não estão visíveis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente da aba Buscar
const SearchTab: React.FC<any> = ({ onStartConversation }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-bold">🔍 Buscar Usuários</h3>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Digite o nome do usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/10 border border-black rounded text-white placeholder-white/50"
          />
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Search className="w-8 h-8" />
          </Button>
        </div>
        
        <div className="text-center text-white/60 text-sm">
          <p>Busque por usuários do Habbo Hotel</p>
          <p>Digite o nome exato para encontrar</p>
        </div>
      </div>
    </div>
  );
};

const AccountTab: React.FC<any> = ({ 
  user, badges, rooms, groups, friends, photos, isLoading, 
  onNavigateToProfile, isViewingOtherUser, viewingUsername, currentUser,
  getPhotoInteractions, setSelectedPhoto, toggleLike, addComment, habboAccount, username,
  activeModal, setActiveModal, handlePhotoClick,
  isEditMode, toggleEditMode, bodyDirection, headDirection, rotateBody, rotateHead,
  hiddenPhotos, togglePhotoVisibility, showAllPhotosModal, setShowAllPhotosModal
}) => {
  // Detectar perfil privado: se não há dados completos ou se explicitamente privado
  const isProfilePrivate = isViewingOtherUser && (
    !user?.profileVisible || 
    (badges.length === 0 && friends.length === 0 && rooms.length === 0 && groups.length === 0)
  );
  
  // Detectar se o usuário não tem fotos (mesmo com perfil público)
  const hasNoPhotos = (photos?.length || 0) === 0;
  const isPrivateProfile = user?.profileVisible === false;
  
  const isOwnProfile = !isViewingOtherUser || viewingUsername === currentUser;

  if (isLoading) {
    return (
      <Card className="bg-transparent text-white border-0 shadow-none h-full overflow-x-hidden">
        <CardContent className="flex items-center justify-center h-full overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent overflow-y-auto">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-4" />
            <p className="text-white/60">Carregando informações do usuário...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="bg-transparent text-white border-0 shadow-none h-full overflow-x-hidden">
        <CardContent className="flex items-center justify-center h-full overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent overflow-y-auto">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
            <p className="text-white/60">Usuário não encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
      {/* Mensagem para perfil privado */}
      {isProfilePrivate && (
        <div className="p-4 bg-yellow-600/20 border-b border-yellow-400/30">
          <div className="flex items-center gap-3">
            <div className="text-yellow-400 text-lg">🔒</div>
            <div>
              <h4 className="text-yellow-200 font-semibold">Perfil Privado</h4>
              <p className="text-yellow-200/80 text-sm">
                Este usuário tem o perfil privado. Abra as configurações do jogo e torne seu perfil público para exibir mais informações.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header do usuário com borda inferior */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img 
              src={user?.figure_string ? 
                `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${encodeURIComponent(user.figure_string)}&size=m&direction=2&head_direction=3` :
                `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user?.name || 'Beebop'}&size=m&direction=2&head_direction=3`
              }
              alt={`Avatar de ${user?.name || 'Beebop'}`}
              className="h-28 w-auto object-contain"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Fallback para busca por nome se o figure_string falhar
                target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user?.name || 'Beebop'}&size=m&direction=2&head_direction=3`;
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white mb-2 truncate">{user?.name || 'Beebop'}</h2>
            <p className="text-white/70 italic mb-4 truncate">"{user?.motto || 'HUB-ACTI1'}"</p>
            
            <div className="space-y-1 text-xs text-white/60">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-nowrap">Criado em:</span>
                <span className="truncate">
                  {user?.memberSince ? 
                    new Date(user.memberSince).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric'
                    }) : 
                    'Data não disponível'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-nowrap">Online em:</span>
                <span className="truncate">
                  {user?.lastWebAccess ? 
                    new Date(user.lastWebAccess).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric'
                    }) : 
                    'Data não disponível'
                  }
                </span>
                <div className="flex items-center gap-1 ml-2">
                  {/* Flag do país */}
                  <img
                    src={getHotelFlag(user?.hotel)}
                    alt=""
                    className="h-4 w-auto object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {/* Ícone de online/offline */}
                  <img 
                    src={user?.online ? 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/online.gif' : 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/offline.gif'}
                    alt={user?.online ? 'Online' : 'Offline'}
                    className="h-4 w-auto object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
              </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Contadores de Interação */}
      <div className="p-4 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {isProfilePrivate ? '0' : (photos?.length || 0)}
            </div>
            <div className="text-xs text-white/60">Fotos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">0</div>
            <div className="text-xs text-white/60">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">0</div>
            <div className="text-xs text-white/60">Seguindo</div>
          </div>
        </div>
      </div>

      {/* Botões de Interação Social */}
      <div className="px-4">
        {isOwnProfile ? (
          <button onClick={toggleEditMode} className="w-full py-1 bg-transparent border border-white/30 hover:bg-white text-white hover:text-gray-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
            {isEditMode ? 'Salvar Alterações' : 'Editar Perfil'}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button className="py-1 bg-transparent border border-white/30 hover:bg-white text-white hover:text-gray-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
              Seguir
            </button>
            <button className="py-1 bg-transparent border border-white/30 hover:bg-white text-white hover:text-gray-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
              Mensagem
            </button>
          </div>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="p-3">
        <div className="grid grid-cols-4 gap-1">
          <button 
            onClick={() => setActiveModal('badges')}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <img 
              src="/assets/console/badgestab-icon.png" 
              alt="Emblemas" 
              className="max-h-none w-auto object-contain" 
              style={{ imageRendering: 'pixelated', transform: 'scale(1.5)' }}
            />
            <div className="text-center">
              <div className="text-sm font-medium text-white">
                {isProfilePrivate ? '0' : badges.length}
              </div>
              <div className="text-xs text-white/60">Emblemas</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveModal('rooms')}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <img 
              src="/assets/console/roomstab-icon.png" 
              alt="Quartos" 
              className="h-8 w-auto object-contain" 
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="text-center">
              <div className="text-sm font-medium text-white">
                {isProfilePrivate ? '0' : rooms.length}
              </div>
              <div className="text-xs text-white/60">Quartos</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveModal('friends')}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <img 
              src="/assets/console/friendstab-icon.png" 
              alt="Amigos" 
              className="h-8 w-auto object-contain" 
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="text-center">
              <div className="text-sm font-medium text-white">
                {isProfilePrivate ? '0' : friends.length}
              </div>
              <div className="text-xs text-white/60">Amigos</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveModal('groups')}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <img 
              src="/assets/console/groupstab-icon.png" 
              alt="Grupos" 
              className="h-8 w-auto object-contain" 
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="text-center">
              <div className="text-sm font-medium text-white">
                {isProfilePrivate ? '0' : groups.length}
              </div>
              <div className="text-xs text-white/60">Grupos</div>
            </div>
          </button>
        </div>
      </div>

      {/* Fotos com borda superior */}
      <div className="p-0 border-t border-white/20">
        <div className="px-4 pt-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera w-5 h-5">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
            <circle cx="12" cy="13" r="3"></circle>
          </svg>
            Fotos ({isProfilePrivate ? '0' : (photos?.length || 0)})
        </h3>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {!isProfilePrivate && photos?.length > 0 ? (
            photos.map((photo, index) => {
              const photoId = photo.id || `photo-${index}`;
              const interactions = getPhotoInteractions(photoId);
              
              return (
                <div 
                  key={photoId} 
                  className="relative group cursor-pointer"
                  onClick={() => handlePhotoClick(photo, index)}
                >
                  <div className="w-full aspect-square bg-gray-700 overflow-hidden">
                <img 
                  src={photo.imageUrl || photo.url || `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-${1755308009079 + index}.png`} 
                  alt={photo.caption || `Foto ${index + 1}`} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-2 right-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                              <Heart className="w-3 h-3 text-white" />
                              <span className="text-xs text-white">{interactions.likes}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                              <MessageCircle className="w-3 h-3 text-white" />
                              <span className="text-xs text-white">{interactions.comments.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : !isProfilePrivate && hasNoPhotos ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-8 text-white/60">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm">O usuário não tem fotos :(</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Arquivo corrigido - PhotoModal temporariamente removido para resolver erro de cache

