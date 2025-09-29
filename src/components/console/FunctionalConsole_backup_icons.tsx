// Versão corrigida - cache atualizado - v2
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, RefreshCw, Loader2, AlertCircle, Users, MessageSquare, Search, Trophy, Home, Crown, Camera, Heart, MessageCircle } from 'lucide-react';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { useUnifiedPhotoSystem } from '@/hooks/useUnifiedPhotoSystem';
import { useAuth } from '@/hooks/useAuth';
import { PixelFrame } from './PixelFrame';
import { cn } from '@/lib/utils';
import { BadgesModal } from '@/components/profile/modals/BadgesModal';
import { FriendsModal } from '@/components/profile/modals/FriendsModal';
import { RoomsModal } from '@/components/profile/modals/RoomsModal';
import { GroupsModal } from '@/components/profile/modals/GroupsModal';
// import { PhotoModal } from '@/components/profile/modals/PhotoModal'; // Temporariamente removido
import { usePhotoInteractions } from '@/hooks/usePhotoInteractions';
// Temporariamente comentado para acelerar carregamento
// import { FeedActivityTabbedColumn } from '@/components/console2/FeedActivityTabbedColumn';
// import { UserSearchColumn } from '@/components/console2/UserSearchColumn';
// import { HotelPhotoFeedColumn } from '@/components/console2/HotelPhotoFeedColumn';

type TabType = 'account' | 'feed' | 'photos' | 'chat';

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
    icon: <User className="w-4 h-4" />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'feed',
    label: 'Friends',
    icon: <Users className="w-4 h-4" />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'photos',
    label: 'Find',
    icon: <Search className="w-4 h-4" />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'chat',
    label: 'Help',
    icon: <MessageSquare className="w-4 h-4" />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  }
];

export const FunctionalConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [viewingUser, setViewingUser] = useState<string | null>(null); // Estado para usuário sendo visualizado
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null); // Foto selecionada para o modal
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

  const badges = completeProfile?.data?.badges || [];
  const friends = completeProfile?.data?.friends || [];
  const rooms = completeProfile?.data?.rooms || [];
  const groups = completeProfile?.data?.groups || [];
  const photos = photosData || [];
  
  const error = profileError?.message || null;
  
  // Função para navegar para perfil de outro usuário
  const navigateToProfile = (targetUsername: string) => {
    console.log('🔄 [FunctionalConsole] Navegando para perfil:', targetUsername);
    setViewingUser(targetUsername);
    setActiveTab('feed'); // Vai para a aba Friends ao ver perfil de outro usuário
  };

  // Função para voltar ao próprio perfil
  const backToMyProfile = () => {
    console.log('🔙 [FunctionalConsole] Voltando para perfil próprio');
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
        />;
      case 'feed':
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
        />;
      case 'photos':
        return <PhotosTab 
          badges={badges} 
          rooms={rooms} 
          photos={photos} 
          isLoading={isLoading}
          onNavigateToProfile={navigateToProfile}
        />;
      case 'chat':
        return <ChatTab 
          friends={friends} 
          isLoading={isLoading}
          onNavigateToProfile={navigateToProfile}
        />;
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
    <div className="mx-auto ml-12 h-[calc(100vh-12rem)] w-full max-w-full overflow-x-hidden">
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
        </div>

        {/* Tab navigation at bottom - now part of external frame */}
        {/* Tab navigation at bottom - Habbo Classic Style */}
        <div className="relative bg-yellow-400 border-t-2 border-black">
          {/* Separator lines between buttons */}
          <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
            <div className="absolute left-1/4 top-0 w-0.5 h-full bg-[#C38A00]"></div>
            <div className="absolute left-2/4 top-0 w-0.5 h-full bg-[#C38A00]"></div>
            <div className="absolute left-3/4 top-0 w-0.5 h-full bg-[#C38A00]"></div>
            <div className="absolute left-0 bottom-0 w-full h-0.5 bg-[#CA8F00]"></div>
          </div>
          
          <div className="grid grid-cols-4 gap-0 p-1">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'account' && viewingUser) {
                    // Se clicou em "My Info" e está visualizando outro usuário, volta ao próprio perfil
                    backToMyProfile();
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center p-2 transition-all duration-200",
                  "border border-[#9C6300] hover:scale-105 active:scale-95",
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
    </div>
  );
};



// Componente da aba Feed
const FeedTab: React.FC<any> = ({ 
  user, badges, rooms, groups, friends, photos, isLoading, 
  onNavigateToProfile, isViewingOtherUser, viewingUsername, currentUser,
  getPhotoInteractions, setSelectedPhoto, toggleLike, addComment, habboAccount, username
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
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
        <CardContent className="p-6 text-center overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent overflow-y-auto">
          <Loader2 className="w-8 h-8 text-white/50 mx-auto animate-spin" />
        </CardContent>
      </Card>
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
                className="h-32 w-auto object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              {/* Ícone de online/offline */}
              <div className="absolute bottom-0 right-0">
                <img 
                  src={user?.online ? 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/online.gif' : 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/offline.gif'}
                  alt={user?.online ? 'Online' : 'Offline'}
                  style={{ 
                    imageRendering: 'pixelated',
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '38px',
                    maxHeight: '38px'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Fallback para círculo colorido se o GIF não carregar
                    target.style.display = 'none';
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = `w-9 h-9 rounded-full border-2 border-white shadow-lg ${user?.online ? 'bg-green-500' : 'bg-red-500'}`;
                    fallbackDiv.style.boxShadow = 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px inset, rgba(255, 255, 255, 0.8) 0px 0px 0px 1px';
                    target.parentNode?.appendChild(fallbackDiv);
                  }}
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white mb-2 truncate">{user?.name || 'Beebop'}</h2>
              <p className="text-white/70 italic mb-4 truncate">"{user?.motto || 'HUB-ACTI1'}"</p>
              
              <div className="space-y-1 text-sm text-white/60">
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
          <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-4 gap-1">
            <button 
              onClick={() => setActiveModal('badges')}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
              </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users h-5 w-5 text-green-400 group-hover:scale-110 transition-transform">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <polyline points="16 11 18 13 22 9"></polyline>
              </svg>
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
    <Card className="bg-transparent text-white border-0 shadow-none h-full overflow-x-hidden">
      <CardHeader>
        <CardTitle className="text-lg">📰 Feed de Atividades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent overflow-y-auto">
        {/* Badges Activity */}
        {badges.length > 0 && (
          <div className="bg-white/10 p-4 rounded border border-black">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-yellow-500 rounded flex items-center justify-center">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">Beebop</span>
                  <span className="text-white/60 text-sm">ganhou {badges.length} emblemas</span>
                </div>
                <p className="text-white/80 text-sm mt-1">Novos emblemas conquistados no Habbo!</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {badges.slice(0, 3).map((badge) => (
                                       <span key={badge.code} className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                     {String(badge.code)}
                   </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rooms Activity */}
        {rooms.length > 0 && (
          <div className="bg-white/10 p-4 rounded border border-black">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">Beebop</span>
                  <span className="text-white/60 text-sm">tem {rooms.length} quartos</span>
                </div>
                <p className="text-white/80 text-sm mt-1">Quartos criados e decorados no Habbo!</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {rooms.slice(0, 2).map((room) => (
                    <span key={room.id} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      {room.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Groups Activity */}
        {groups.length > 0 && (
          <div className="bg-white/10 p-4 rounded border border-black">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-purple-500 rounded flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">Beebop</span>
                  <span className="text-white/60 text-sm">participa de {groups.length} grupos</span>
                </div>
                <p className="text-white/80 text-sm mt-1">Membro ativo da comunidade Habbo!</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {groups.slice(0, 2).map((group) => (
                    <span key={group.id} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                      {group.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Friends Activity */}
        {friends.length > 0 && (
          <div className="bg-white/10 p-4 rounded border border-black">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-pink-500 rounded flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">Beebop</span>
                  <span className="text-white/60 text-sm">tem {friends.length} amigos</span>
                </div>
                <p className="text-white/80 text-sm mt-1">Rede social ativa no Habbo!</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {friends.slice(0, 3).map((friend) => (
                    <span key={friend.uniqueId} className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded">
                      {friend.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Activity Message */}
        {badges.length === 0 && rooms.length === 0 && groups.length === 0 && friends.length === 0 && (
          <div className="text-center py-8">
            <div className="text-white/40 text-sm">
              <p>Nenhuma atividade disponível</p>
              <p className="mt-1">O perfil pode estar privado ou não ter conteúdo público</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente da aba Fotos
const PhotosTab: React.FC<any> = ({ badges, rooms, photos, isLoading, onNavigateToProfile }) => {
  if (isLoading) {
    return (
      <Card className="bg-transparent text-white border-0 shadow-none h-full overflow-x-hidden">
        <CardContent className="p-6 text-center overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent overflow-y-auto">
          <Loader2 className="w-8 h-8 text-white/50 mx-auto animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent text-white border-0 shadow-none h-full overflow-x-hidden">
      <CardHeader>
        <CardTitle className="text-lg">📸 Fotos e Conquistas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent overflow-y-auto">
        {/* Photos Grid */}
        {photos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-3">Fotos ({photos.length})</h4>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group cursor-pointer">
                  <img 
                    src={photo.url} 
                    alt={photo.caption || 'Foto'} 
                    className="w-full h-24 object-cover rounded border border-black"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center text-white text-xs p-2">
                      <div className="font-medium">{photo.type === 'SELFIE' ? '📸 Selfie' : '📷 Foto'}</div>
                      {photo.caption && (
                        <div className="text-white/80">{photo.caption}</div>
                      )}
                      <div className="text-white/60 mt-1">❤️ {photo.likes}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Grid */}
        {badges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-3">Emblemas Conquistados ({badges.length})</h4>
            <div className="grid grid-cols-4 gap-2">
              {badges.map((badge) => (
                <div key={badge.code} className="relative group cursor-pointer">
                  <div className="w-full h-24 bg-yellow-500 rounded border border-black flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black">{String(badge.code)}</div>
                      <div className="text-xs text-black/80 font-medium">{badge.name}</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center text-white text-xs p-2">
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-white/80">{badge.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {rooms.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-3">Quartos Criados ({rooms.length})</h4>
            <div className="grid grid-cols-3 gap-2">
              {rooms.map((room) => (
                <div key={room.id} className="relative group cursor-pointer">
                  <div className="w-full h-24 bg-green-500/20 rounded border border-black flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm font-medium text-white">{room.name}</div>
                      <div className="text-xs text-white/60">{room.description}</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center text-white text-xs p-2">
                      <div className="font-medium">{room.name}</div>
                      <div className="text-white/80">{room.description}</div>
                      <div className="text-white/60 mt-1">
                        ⭐ {room.rating} • {room.maximumVisitors} usuários
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Content Message */}
        {badges.length === 0 && rooms.length === 0 && photos.length === 0 && (
          <div className="text-center py-8">
            <div className="text-white/40 text-sm">
              <p>Nenhum conteúdo disponível</p>
              <p className="mt-1">O perfil pode estar privado ou não ter conteúdo público</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente da aba Chat
const ChatTab: React.FC<any> = ({ friends, isLoading, onNavigateToProfile }) => {
  if (isLoading) {
    return (
      <Card className="bg-transparent text-white border-0 shadow-none h-full overflow-x-hidden">
        <CardContent className="p-6 text-center overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent overflow-y-auto">
          <Loader2 className="w-8 h-8 text-white/50 mx-auto animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent text-white border-0 shadow-none h-full overflow-x-hidden">
      <CardHeader>
        <CardTitle className="text-lg">💬 Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent overflow-y-auto">
        {friends.map((friend) => (
          <div 
            key={friend.uniqueId} 
            className="flex items-center space-x-3 p-3 bg-white/10 rounded border border-black hover:bg-white/20 transition-colors cursor-pointer"
            onClick={() => onNavigateToProfile(friend.name)}
          >
            <div className="relative">
              <img 
                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${friend.name}&size=s`}
                alt={friend.name}
                className="w-10 h-10 rounded"
              />
              <div className={cn(
                "absolute -bottom-1 -right-1 w-3 h-3 border border-black rounded-full",
                friend.online ? "bg-green-500" : "bg-red-500"
              )}></div>
            </div>
            <div className="flex-1">
              <div className="font-bold text-white">{friend.name}</div>
              <div className="text-white/60 text-sm">{friend.motto}</div>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Componente da aba Buscar
const SearchTab: React.FC<any> = ({ onStartConversation }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Card className="bg-transparent text-white border-0 shadow-none h-full overflow-x-hidden">
      <CardHeader>
        <CardTitle className="text-lg">🔍 Buscar Usuários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent overflow-y-auto">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Digite o nome do usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/10 border border-black rounded text-white placeholder-white/50"
          />
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Search className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-center text-white/60 text-sm">
          <p>Busque por usuários do Habbo Hotel</p>
          <p>Digite o nome exato para encontrar</p>
        </div>
      </CardContent>
    </Card>
  );
};

const AccountTab: React.FC<any> = ({ 
  user, badges, rooms, groups, friends, photos, isLoading, 
  onNavigateToProfile, isViewingOtherUser, viewingUsername, currentUser,
  getPhotoInteractions, setSelectedPhoto, toggleLike, addComment, habboAccount, username
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
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
              className="h-32 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Fallback para busca por nome se o figure_string falhar
                target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user?.name || 'Beebop'}&size=m&direction=2&head_direction=3`;
              }}
            />
            <div className="absolute bottom-0 right-0">
              <img 
                src={user?.online ? 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/online.gif' : 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/offline.gif'}
                alt={user?.online ? 'Online' : 'Offline'}
                style={{ 
                  imageRendering: 'pixelated',
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '38px',
                  maxHeight: '38px'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // Fallback para círculo colorido se o GIF não carregar
                  target.style.display = 'none';
                  const fallbackDiv = document.createElement('div');
                  fallbackDiv.className = `w-9 h-9 rounded-full border-2 border-white shadow-lg ${user?.online ? 'bg-green-500' : 'bg-red-500'}`;
                  fallbackDiv.style.boxShadow = 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px inset, rgba(255, 255, 255, 0.8) 0px 0px 0px 1px';
                  target.parentNode?.appendChild(fallbackDiv);
                }}
              />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white mb-2 truncate">{user?.name || 'Beebop'}</h2>
            <p className="text-white/70 italic mb-4 truncate">"{user?.motto || 'HUB-ACTI1'}"</p>
            
            <div className="space-y-1 text-sm text-white/60">
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
        <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-4 gap-1">
          <button 
            onClick={() => setActiveModal('badges')}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users h-5 w-5 text-green-400 group-hover:scale-110 transition-transform">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <polyline points="16 11 18 13 22 9"></polyline>
            </svg>
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

      {/* Modals */}
      <BadgesModal 
        isOpen={activeModal === 'badges'} 
        onClose={() => setActiveModal(null)}
        badges={badges || []}
        userName={user?.name || 'Usuário'}
        onNavigateToProfile={onNavigateToProfile}
      />
      
      <FriendsModal 
        isOpen={activeModal === 'friends'} 
        onClose={() => setActiveModal(null)}
        friends={friends || []}
        userName={user?.name || 'Usuário'}
        onNavigateToProfile={onNavigateToProfile}
      />
      
      <GroupsModal 
        isOpen={activeModal === 'groups'} 
        onClose={() => setActiveModal(null)}
        groups={groups || []}
        userName={user?.name || 'Usuário'}
        onNavigateToProfile={onNavigateToProfile}
      />
      
      <RoomsModal 
        isOpen={activeModal === 'rooms'} 
        onClose={() => setActiveModal(null)}
        rooms={rooms || []}
        userName={user?.name || 'Usuário'}
        onNavigateToProfile={onNavigateToProfile}
      />
      
      {/* PhotoModal temporariamente removido para correção */}
      
    </div>
  );
};

// Arquivo corrigido - PhotoModal temporariamente removido para resolver erro de cache

