import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, RefreshCw, Loader2, AlertCircle, Users, MessageSquare, Trophy, Home, Crown, Camera, Heart, MessageCircle, Globe } from 'lucide-react';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { useUnifiedPhotoSystem } from '@/hooks/useUnifiedPhotoSystem';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
import { PixelFrame } from './PixelFrame';
import { cn } from '@/lib/utils';
import { BadgesModal } from '@/components/profile/modals/BadgesModal';
import { FriendsModal } from '@/components/profile/modals/FriendsModal';
import { RoomsModal } from '@/components/profile/modals/RoomsModal';
import { GroupsModal } from '@/components/profile/modals/GroupsModal';
import { usePhotoInteractions } from '@/hooks/usePhotoInteractions';
import { PhotoCommentsModal } from '@/components/console/modals/PhotoCommentsModal';
import { PhotoLikesModal } from '@/components/console/modals/PhotoLikesModal';
import { IndividualPhotoView } from '@/components/console/IndividualPhotoView';
import { ChatInterface } from '@/components/console/ChatInterface';
import { PhotoLikesCounter } from '@/components/console/PhotoLikesCounter';
import { PhotoCommentsCounter } from '@/components/console/PhotoCommentsCounter';
import { toast } from 'sonner';
import { useStickyHeader } from '@/hooks/useStickyHeader';

const FriendsPhotoFeed = lazy(() => import('./FriendsPhotoFeed').then(module => ({ default: module.FriendsPhotoFeed })));
const FindPhotoFeedColumn = lazy(() => import('@/components/console/FindPhotoFeedColumn').then(module => ({ default: module.FindPhotoFeedColumn })));
const GlobalPhotoFeedColumn = lazy(() => import('@/components/console/GlobalPhotoFeedColumn'));


// Componentes de ícones pixelizados no estilo Habbo

// Função para mapear hotel para flag
const getHotelFlag = (hotel?: string) => {
  const hotelFlags: { [key: string]: string } = {
    'com': '/flags/flagcom.png',      // USA/UK
    'com.br': '/flags/flagbrazil.png',    // Brasil/Portugal
    'br': '/flags/flagbrazil.png',    // Brasil/Portugal
    'de': '/flags/flagdeus.png',      // Alemanha
    'fr': '/flags/flagfrance.png',    // França
    'it': '/flags/flagitaly.png',     // Itália
    'es': '/flags/flagspain.png',     // Espanha
    'nl': '/flags/flagnetl.png',      // Holanda
    'tr': '/flags/flagtrky.png',      // Turquia
    'com.tr': '/flags/flagtrky.png',  // Turquia
    'fi': '/flags/flafinland.png',    // Finlândia
  };
  return hotelFlags[hotel || ''] || '/flags/flagcom.png'; // Default para com
};

// Função para buscar usuários globalmente em todos os hotéis
const searchUsersGlobally = async (username: string): Promise<any[]> => {
  const HOTEL_DOMAINS = [
    'com.br', // Brazil
    'com',    // International/US
    'es',     // Spain
    'fr',     // France
    'de',     // Germany
    'it',     // Italy
    'nl',     // Netherlands
    'fi',     // Finland
    'com.tr'  // Turkey
  ];

  // Buscar em todos os hotéis simultaneamente
  const searchPromises = HOTEL_DOMAINS.map(async (domain) => {
    try {
      const url = `https://www.habbo.${domain}/api/public/users?name=${encodeURIComponent(username)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HabboHub/1.0',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // A API pode retornar um objeto ou array
        const user = Array.isArray(data) ? data[0] : data;
        
        // Verificar correspondência exata do nome (case-insensitive)
        // Isso permite que nomes similares em diferentes países sejam retornados corretamente
        if (user && user.name && user.name.toLowerCase().trim() === username.toLowerCase().trim()) {
          // Converter domínio para código de hotel para a flag e navegação
          let hotelCode = domain;
          if (domain === 'com.br') hotelCode = 'br';
          else if (domain === 'com.tr') hotelCode = 'tr';
          else if (domain === 'com' || domain === 'us') hotelCode = 'com';
          // Outros domínios (es, fr, de, it, nl, fi) já são o código
          
          return {
            name: user.name, // Nome exato retornado pela API (preserva capitalização original)
            motto: user.motto || '',
            online: user.online || false,
            figureString: user.figureString || user.figure || '',
            uniqueId: user.uniqueId || user.id,
            hotelDomain: domain, // Manter domínio completo para API (com.br, com.tr, etc)
            hotelCode: hotelCode // Código do hotel para flag e identificação (br, tr, com, etc)
          };
        }
      }
    } catch (error) {
      // Ignorar erros e continuar
    }
    return null;
  });

  const results = await Promise.all(searchPromises);
  // Filtrar resultados nulos e retornar apenas usuários válidos
  return results.filter((user): user is any => user !== null);
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

const getTabs = (t: (key: string) => string): TabButton[] => [
  {
    id: 'account',
    label: t('pages.console.myInfo'),
    icon: <img src="/assets/console/my-info.png" alt={t('pages.console.myInfo')} className="h-7 w-auto" style={{ imageRendering: 'pixelated' }} />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'friends',
    label: t('pages.console.friends'),
    icon: <img src="/assets/console/friends-icon.png" alt={t('pages.console.friends')} className="h-7 w-auto" style={{ imageRendering: 'pixelated' }} />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'chat',
    label: t('pages.console.chat'),
    icon: <img src="/assets/console/chat-icon.png" alt={t('pages.console.chat')} className="h-8 w-auto" style={{ imageRendering: 'pixelated' }} />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'photos',
    label: t('pages.console.photos'),
    icon: <img src="/assets/console/photos-icon.png" alt={t('pages.console.photos')} className="h-8 w-auto" style={{ imageRendering: 'pixelated' }} />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  }
];

export const FunctionalConsole: React.FC = () => {
  const { t } = useI18n();
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

  // Modal handlers
  const handleShowLikesModal = (photo: any) => {
    setSelectedPhotoForModal(photo);
    setShowLikesModal(true);
  };

  const handleShowCommentsModal = (photo: any) => {
    setSelectedPhotoForModal(photo);
    setShowCommentsModal(true);
  };

  // Edit mode handlers
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const rotateBody = () => {
    setBodyDirection((prev) => (prev + 1) % 8);
    // Ajustar cabeça se diferença for maior que 2
    setHeadDirection((prevHead) => {
      const newBody = (bodyDirection + 1) % 8;
      const diff = Math.abs(newBody - prevHead);
      if (diff > 2 && diff < 6) {
        return newBody;
      }
      return prevHead;
    });
  };

  const rotateHead = () => {
    setHeadDirection((prevHead) => {
      const newHead = (prevHead + 1) % 8;
      const diff = Math.abs(bodyDirection - newHead);
      // Só permitir rotação se diferença for menor ou igual a 2
      if (diff <= 2 || diff >= 6) {
        return newHead;
      }
      return prevHead;
    });
  };

  const togglePhotoVisibility = (photoId: string) => {
    setHiddenPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  // Estados para navegação de fotos individuais
  const [selectedIndividualPhoto, setSelectedIndividualPhoto] = useState<{
    id: string;
    imageUrl: string;
    date: string;
    likes: number;
    roomName?: string;
    roomId?: string;
  } | null>(null);

  // Estado para perfil aberto a partir do feed de Photos (hotel)
  const [photosProfileUser, setPhotosProfileUser] = useState<string | null>(null);
  const [photosProfileHotel, setPhotosProfileHotel] = useState<string | null>(null);
  // Histórico de navegação de perfis na aba Photos (para botão voltar)
  const [photosProfileHistory, setPhotosProfileHistory] = useState<Array<{ username: string; hotel: string }>>([]);
  // Trigger para refresh do feed Photos (incrementa para forçar refresh)
  const [photosRefreshTrigger, setPhotosRefreshTrigger] = useState(0);
  // Cooldown para evitar múltiplos refreshes (última vez que fez refresh)
  const photosRefreshCooldownRef = useRef<number>(0);
  // Trigger para refresh do feed Friends (incrementa para forçar refresh)
  const [friendsRefreshTrigger, setFriendsRefreshTrigger] = useState(0);
  // Cooldown para evitar múltiplos refreshes do feed Friends
  const friendsRefreshCooldownRef = useRef<number>(0);

  // Handlers para navegação de fotos individuais
  const handlePhotoClick = (photo: any, index: number) => {
    // Usar photo_id (ID real da API do Habbo) como fonte de verdade
    const photoId = photo.photo_id || photo.id || `temp-photo-${Date.now()}-${index}`;
    
    console.log('📸 Foto clicada:', {
      photo_id: photo.photo_id || photo.id,
      photoId,
      imageUrl: photo.imageUrl || photo.s3_url || photo.url
    });
    
    const photoData = {
      id: photoId, // Usar o ID real da foto do Habbo
      imageUrl: photo.imageUrl || photo.url || `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-${1755308009079 + index}.png`,
      date: photo.date || new Date().toLocaleDateString('pt-BR'),
      likes: photo.likes || 0,
      roomName: photo.roomName || undefined,
      roomId: photo.roomId ? String(photo.roomId) : undefined
    };
    
    setSelectedIndividualPhoto(photoData);
    setActiveTab('photo'); // Ativa a aba 'photo'
  };

  const handleBackFromPhoto = () => {
    setActiveTab('account'); // Volta para a aba account
    setSelectedIndividualPhoto(null);
  };

  // Componente AccountTab definido dentro do escopo principal
  const AccountTab: React.FC<any> = ({ 
    user, badges, rooms, groups, friends, photos, isLoading, 
    onNavigateToProfile, isViewingOtherUser, viewingUsername, currentUser,
    getPhotoInteractions, setSelectedPhoto, toggleLike, addComment, habboAccount, username, setActiveTab,
    activeModal, setActiveModal, handlePhotoClick,
    isEditMode, toggleEditMode, bodyDirection, headDirection, rotateBody, rotateHead,
    hiddenPhotos, togglePhotoVisibility, viewingUser
  }) => {
    // Detectar perfil privado APENAS se a API indicar explicitamente
    const isProfilePrivate = isViewingOtherUser && user?.profileVisible === false;
    
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
              <p className="text-white/60">{t('pages.console.loadingUser')}</p>
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
        {/* Header do usuário com borda inferior */}
        <div className="p-4 border-b border-white/20 relative">
          {/* Bandeira no extremo superior direito */}
          <img 
            src={getHotelFlag(user?.hotel)} 
            alt="" 
            className="absolute top-2 right-2 w-auto object-contain" 
            style={{ imageRendering: 'pixelated', height: 'auto', maxHeight: 'none' }} 
          />
          
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="relative flex-shrink-0">
                <img 
                  src={`https://www.habbo.${(() => {
                    const hotel = user?.hotel || 'com.br';
                    if (hotel === 'br') return 'com.br';
                    if (hotel === 'tr') return 'com.tr';
                    return hotel;
                  })()}/habbo-imaging/avatarimage?figure=${encodeURIComponent(user?.figure_string || '')}&size=m&direction=2&head_direction=2`}
                  alt={`Avatar de ${user?.name || 'Habbo'}`}
                  className="h-28 w-auto object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-&size=m&direction=2&head_direction=2`;
                  }}
                />
              </div>
              {/* Status centralizado abaixo do avatar */}
              <img 
                src={user?.online ? 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/online.gif' : '/assets/offline_icon.png'}
                alt={user?.online ? 'Online' : 'Offline'}
                height="16"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white mb-2 truncate">{user?.name || habboAccount?.habbo_name || 'Usuário'}</h2>
              {user?.motto && user.motto.trim() ? (
                <p className="text-white/70 italic mb-4 line-clamp-2">
                  "{user.motto.trim()}"
                </p>
              ) : null}
              
              <div className="space-y-1 text-xs text-white/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-nowrap">{t('pages.console.createdAt')}</span>
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
                  <span className="font-medium text-nowrap">{t('pages.console.lastAccess')}</span>
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
              <div className="text-xs text-white/60">{t('pages.console.photos')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">0</div>
              <div className="text-xs text-white/60">{t('pages.console.followers')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">0</div>
              <div className="text-xs text-white/60">{t('pages.console.following')}</div>
            </div>
          </div>
        </div>

        {/* Botões de Interação Social */}
        <div className="px-4">
          {isOwnProfile ? (
            <button onClick={toggleEditMode} className="w-full py-1 bg-transparent border border-white/30 hover:bg-white text-white hover:text-gray-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              {isEditMode ? t('pages.console.saveChanges') : t('pages.console.editProfile')}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  if (viewingUser) {
                    alert(t('pages.console.followFunctionComingSoon', { username: viewingUser }));
                  }
                }}
                className="py-1 bg-transparent border border-white/30 hover:bg-white text-white hover:text-gray-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
                {t('pages.console.follow')}
              </button>
              <button 
                onClick={async () => {
                  setActiveTab('chat');
                  // Aguardar um pouco para garantir que o componente Chat foi montado
                  setTimeout(async () => {
                    if ((window as any).startChatWith && viewingUser) {
                      await (window as any).startChatWith(viewingUser);
                    }
                  }, 100);
                }}
                className="py-1 bg-transparent border border-white/30 hover:bg-white text-white hover:text-gray-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
                {t('pages.console.message')}
              </button>
            </div>
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="p-3">
          <div className="grid grid-cols-4 gap-1">
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
                <div className="text-xs text-white/60">{t('pages.console.friends')}</div>
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
                <div className="text-xs text-white/60">{t('pages.console.rooms')}</div>
              </div>
            </button>
            
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
                <div className="text-xs text-white/60">{t('pages.console.badges')}</div>
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
                <div className="text-xs text-white/60">{t('pages.console.groups')}</div>
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
            {t('pages.console.photosWithCount', { count: isProfilePrivate ? '0' : ((photos || []).filter((photo, index) => !(hiddenPhotos || []).includes(photo.id || `photo-${index}`)).length) })}
          </h3>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {!isProfilePrivate && photos?.length > 0 ? (
              photos
                .filter((photo, index) => {
                  const photoId = photo.id || `photo-${index}`;
                  const isHidden = (hiddenPhotos || []).includes(photoId);
                  // Em modo de edição, mostra todas; fora dele, só as visíveis
                  return isEditMode || !isHidden;
                })
                .map((photo, index) => {
                  const photoId = photo.id || `photo-${index}`;
                  const isHidden = (hiddenPhotos || []).includes(photoId);
                  const interactions = getPhotoInteractions(photoId);
                
                  return (
                    <div 
                      key={photoId} 
                      className={`relative group cursor-pointer ${isEditMode && isHidden ? 'opacity-30' : ''}`}
                      onClick={() => {
                        if (!isEditMode && handlePhotoClick) {
                          // Chamar handlePhotoClick para abrir a foto ampliada
                          handlePhotoClick(photo, index);
                          setActiveTab('photo'); // Mudar para a aba de foto individual
                        }
                      }}
                    >
                    <div className="w-full aspect-square bg-gray-700 overflow-hidden">
                  <img 
                    src={photo.imageUrl || photo.url || `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-${1755308009079 + index}.png`} 
                    alt={photo.caption || `Foto ${index + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                      {isEditMode && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); togglePhotoVisibility(photoId); }}
                          className={`absolute top-1 right-1 z-10 text-white p-1 rounded-full text-xs flex items-center justify-center w-6 h-6 transition-all ${
                            isHidden 
                              ? 'bg-green-500 hover:bg-green-600 hover:scale-110' 
                              : 'bg-transparent'
                          }`}
                          title={isHidden ? t('pages.console.restorePhoto') : t('pages.console.hidePhoto')}
                        >
                          {isHidden ? '↺' : <img src="/assets/console/minimize.png" alt="X" className="w-4 h-4" style={{ imageRendering: 'pixelated' }} />}
                        </button>
                      )}
                      {!isEditMode && (
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
                      )}
                    </div>
                  </div>
                );
              })
            ) : !isProfilePrivate && hasNoPhotos ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-8 text-white/60">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">{t('pages.console.userHasNoPhotos')}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  
  // Modal state tracking
  // PhotoModal temporariamente removido
  const { habboAccount, isLoggedIn } = useAuth();
  const { getPhotoInteractions, toggleLike, addComment } = usePhotoInteractions();
  
  // Usar o usuário logado como padrão, ou o usuário sendo visualizado
  // IMPORTANTE: Só usar habboAccount se estiver realmente disponível e carregado
  const currentUser = habboAccount?.habbo_name;
  // Só definir username se houver um valor válido - não usar fallback "Beebop"
  const username = viewingUser || (currentUser && currentUser.trim() ? currentUser : undefined);
  
  // Definir hotel efetivo para busca de perfil/fotos
  // Normalizar para formato de domínio (com.br, com, es, fr, etc.)
  const effectiveHotelForProfile = (() => {
    const hotel = photosProfileHotel || habboAccount?.hotel || 'com.br';
    // Se for 'br', converter para 'com.br'; se for 'tr', converter para 'com.tr'; se for 'us', converter para 'com'
    if (hotel === 'br') return 'com.br';
    if (hotel === 'tr') return 'com.tr';
    if (hotel === 'us') return 'com';
    return hotel;
  })();

  // Hotel base para fotos, antes de sabermos o hotel real do perfil
  const baseHotelForPhotos =
    photosProfileHotel
      ? (photosProfileHotel === 'com.br' ? 'br' : photosProfileHotel)
      : (habboAccount?.hotel || 'br');

  // Buscar dados reais usando useCompleteProfile / useUnifiedPhotoSystem
  // Só buscar se houver um username válido (não usar fallback "Beebop")
  const { data: completeProfile, isLoading, error: profileError } = useCompleteProfile(
    username || '', // Passar string vazia se não houver username - a query será desabilitada
    effectiveHotelForProfile,
  );
  const photosHotel =
    completeProfile?.hotelCode || baseHotelForPhotos;

  const { photos: photosData, isLoading: photosLoading } = useUnifiedPhotoSystem(
    username,
    photosHotel,
    {
      // Sempre que possível, passar o uniqueId já resolvido para a Edge Function
      uniqueId: completeProfile?.uniqueId,
    }
  );
  
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
    hotel: completeProfile.hotelCode || photosHotel,
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
  
  // Função para navegar para perfil de outro usuário (vai para aba Account)
  const navigateToProfile = (targetUsername: string, hotelDomain?: string) => {
    const cleanedUsername = (targetUsername || '').trim();
    
    // Se estiver na aba Photos, usar navigateToProfileFromPhotos para manter histórico
    if (activeTab === 'photos' && hotelDomain) {
      navigateToProfileFromPhotos(cleanedUsername, hotelDomain);
      setActiveTab('account'); // Mas vai para account para ver perfil completo
      return;
    }
    
    // Definir usuário e hotel para perfil
    setViewingUser(cleanedUsername);
    if (hotelDomain) {
      setPhotosProfileHotel(hotelDomain);
    }
    
    setActiveTab('account'); // Vai para a aba Account para ver perfil completo
    
    // Fecha qualquer modal que esteja aberto
    if (activeModal) {
      setActiveModal(null);
    }
  };

  // Função para navegar para perfil mantendo na aba Photos (com histórico)
  const navigateToProfileFromPhotos = (targetUsername: string, targetHotelOrUniqueId?: string) => {
    // Se já estamos visualizando um perfil, adicionar ao histórico antes de navegar
    if (photosProfileUser && viewingUser === photosProfileUser) {
      const currentHotel = photosProfileHotel || 'com.br';
      setPhotosProfileHistory(prev => [...prev, { username: photosProfileUser, hotel: currentHotel }]);
    }

    const cleanedUsername = (targetUsername || '').trim();
    
    // Extrair hotel do uniqueID se fornecido (formato: hhXX-... onde XX é o código do hotel)
    let hotelDomain: string = photosProfileHotel || 'com.br';
    if (targetHotelOrUniqueId) {
      // Tentar extrair do uniqueID (formato: hhbr-, hhfi-, etc)
      const uniqueIdMatch = targetHotelOrUniqueId.match(/^hh([a-z]{2})-/);
      if (uniqueIdMatch && uniqueIdMatch[1]) {
        const hotelCode = uniqueIdMatch[1];
        if (hotelCode === 'br') hotelDomain = 'com.br';
        else if (hotelCode === 'tr') hotelDomain = 'com.tr';
        else if (hotelCode === 'us' || hotelCode === 'com') hotelDomain = 'com';
        else hotelDomain = hotelCode; // es, fr, de, it, nl, fi
      } else if (targetHotelOrUniqueId.includes('.')) {
        // Se já é um domínio (com.br, com.tr, etc)
        hotelDomain = targetHotelOrUniqueId;
      } else {
        // Se é um código simples (br, tr, etc)
        const code = targetHotelOrUniqueId;
        if (code === 'br') hotelDomain = 'com.br';
        else if (code === 'tr') hotelDomain = 'com.tr';
        else if (code === 'us' || code === 'com') hotelDomain = 'com';
        else hotelDomain = code;
      }
    }
    
    setViewingUser(cleanedUsername);
    setPhotosProfileUser(cleanedUsername);
    setPhotosProfileHotel(hotelDomain);
    // Manter na aba Photos
    
    // Fecha qualquer modal que esteja aberto
    if (activeModal) {
      setActiveModal(null);
    }
  };

  // Função para voltar ao perfil anterior na navegação de Photos
  const navigateBackInPhotosHistory = () => {
    if (photosProfileHistory.length > 0) {
      const previousProfile = photosProfileHistory[photosProfileHistory.length - 1];
      const newHistory = photosProfileHistory.slice(0, -1);
      
      setPhotosProfileHistory(newHistory);
      setViewingUser(previousProfile.username);
      setPhotosProfileUser(previousProfile.username);
      setPhotosProfileHotel(previousProfile.hotel);
    } else {
      // Se não há histórico, voltar ao feed
      setPhotosProfileUser(null);
      setViewingUser(null);
      setPhotosProfileHotel(null);
    }
  };

  // Abrir perfil a partir do feed de Photos (hotel), mantendo a aba Photos
  const openPhotosProfile = (targetUsername: string, photo?: any) => {
    // Normalizar apenas espaços em branco; manter pontuação do nick
    const cleanedUsername = (targetUsername || '').trim();

    // Função auxiliar para extrair código do hotel da URL da foto (fonte de verdade)
    const extractHotelFromPhotoUrl = (url?: string): string | null => {
      if (!url) return null;
      // Padrão: hhXX onde XX é o código do hotel (ex: hhfi → fi, hhfr → fr)
      const match = url.match(/\/hh([a-z]{2})\//);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    };

    // Função auxiliar para converter código do hotel para domínio de API
    const hotelCodeToDomain = (code: string): string => {
      if (code === 'br') return 'com.br';
      if (code === 'tr') return 'com.tr';
      if (code === 'us' || code === 'com') return 'com';
      // Outros hotéis (es, fr, de, it, nl, fi) usam o código diretamente como domínio
      return code;
    };

    // Prioridade: 1) Extrair da URL da foto (fonte de verdade), 2) hotelDomain, 3) hotel
    let hotelDomain: string | null = null;
    
    // 1. Tentar extrair da URL da foto
    const photoUrl = photo?.s3_url || photo?.imageUrl || photo?.preview_url;
    const hotelCodeFromUrl = extractHotelFromPhotoUrl(photoUrl);
    if (hotelCodeFromUrl) {
      hotelDomain = hotelCodeToDomain(hotelCodeFromUrl);
    } else {
      // 2. Tentar usar hotelDomain anotado na foto
      const hotelDomainFromPhoto = photo?.hotelDomain;
      if (hotelDomainFromPhoto) {
        // Se já contém ponto, já é um domínio completo (com.br, com.tr, etc)
        if (hotelDomainFromPhoto.includes('.')) {
          hotelDomain = hotelDomainFromPhoto;
        } else {
          // Caso contrário, converter código para domínio
          hotelDomain = hotelCodeToDomain(hotelDomainFromPhoto);
        }
      } else {
        // 3. Tentar usar código do hotel anotado na foto
        const hotelCodeFromPhoto = photo?.hotel;
        if (hotelCodeFromPhoto) {
          hotelDomain = hotelCodeToDomain(hotelCodeFromPhoto);
        }
      }
    }

    // Definir o hotel para o perfil (ou null para busca global)
    if (hotelDomain) {
      setPhotosProfileHotel(hotelDomain);
    } else {
      setPhotosProfileHotel(null);
    }

    setViewingUser(cleanedUsername);
    setPhotosProfileUser(cleanedUsername);
    setActiveTab('photos');

    if (activeModal) {
      setActiveModal(null);
    }
  };

  // Função para voltar ao próprio perfil
  const backToMyProfile = () => {
    setViewingUser(null);
    setPhotosProfileUser(null);
    setPhotosProfileHotel(null); // CRÍTICO: Limpar hotel para usar o hotel do usuário logado
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
          handlePhotoClick={handlePhotoClick}
          viewingUsername={viewingUser}
          currentUser={currentUser}
          getPhotoInteractions={getPhotoInteractions}
          setSelectedPhoto={setSelectedPhoto}
          toggleLike={toggleLike}
          addComment={addComment}
          habboAccount={habboAccount}
          username={username}
          setActiveTab={setActiveTab}
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          isEditMode={isEditMode}
          toggleEditMode={toggleEditMode}
          bodyDirection={bodyDirection}
          headDirection={headDirection}
          rotateBody={rotateBody}
          rotateHead={rotateHead}
          hiddenPhotos={hiddenPhotos}
          togglePhotoVisibility={togglePhotoVisibility}
          viewingUser={viewingUser}
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
          handlePhotoClick={handlePhotoClick}
          isEditMode={isEditMode}
          toggleEditMode={toggleEditMode}
          bodyDirection={bodyDirection}
          headDirection={headDirection}
          rotateBody={rotateBody}
          rotateHead={rotateHead}
          hiddenPhotos={hiddenPhotos}
          togglePhotoVisibility={togglePhotoVisibility}
          handleShowCommentsModal={handleShowCommentsModal}
          setActiveTab={setActiveTab}
          viewingUser={viewingUser}
          friendsRefreshTrigger={friendsRefreshTrigger}
        />;
      case 'chat':
        return <ChatInterface 
          friends={friends}
          onNavigateToProfile={navigateToProfile}
        />;
      case 'photos':
        if (photosProfileUser && viewingUser === photosProfileUser) {
          // Reutilizar FeedTab para mostrar o perfil completo, mas dentro da aba Photos
          return <FeedTab 
            user={userData}
            badges={badges} 
            rooms={rooms} 
            groups={groups} 
            friends={friends} 
            photos={photos} 
            isLoading={isLoadingData}
            onNavigateToProfile={navigateToProfileFromPhotos}
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
            handlePhotoClick={handlePhotoClick}
            isEditMode={isEditMode}
            toggleEditMode={toggleEditMode}
            bodyDirection={bodyDirection}
            headDirection={headDirection}
            rotateBody={rotateBody}
            rotateHead={rotateHead}
            hiddenPhotos={hiddenPhotos}
            togglePhotoVisibility={togglePhotoVisibility}
            setActiveTab={setActiveTab}
            viewingUser={viewingUser}
            onBackToPhotosFeed={() => {
              setPhotosProfileUser(null);
            }}
          />;
        }

        return (
          <PhotosTab 
            isLoading={isLoadingData}
            onUserClickFromFeed={openPhotosProfile}
            refreshTrigger={photosRefreshTrigger}
          />
        );
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
              <h3 className="text-lg font-bold text-white mb-2">{t('pages.console.noPhotoSelected')}</h3>
              <p className="text-white/60 text-sm mb-4">{t('buttons.back')}</p>
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
            {getTabs(t).map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'account' && viewingUser) {
                    // Se clicou em "My Info" e está visualizando outro usuário, volta ao próprio perfil
                    backToMyProfile();
                  } else if (tab.id === 'account' && !viewingUser) {
                    // CRÍTICO: Se clicou em "My Info" e não está visualizando outro usuário,
                    // garantir que estamos usando o hotel do usuário logado
                    setPhotosProfileHotel(null);
                    setPhotosProfileUser(null);
                    setActiveTab(tab.id);
                  } else if (tab.id === 'friends' && viewingUser) {
                    // Se clicou em "Friends" e está visualizando outro usuário, volta ao feed normal
                    setViewingUser(null);
                    setActiveTab('friends');
                    // Scroll ao topo - será feito quando a aba mudar e o componente renderizar
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        const scrollContainer = document.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
                        if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
                          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }, 50);
                    });
                    // Fazer refresh e scroll ao topo
                    const now = Date.now();
                    const cooldownMs = 2000; // 2 segundos de cooldown
                    if (now - friendsRefreshCooldownRef.current > cooldownMs) {
                      console.log('[👥 FRIENDS TAB] Refresh triggered on tab click');
                      friendsRefreshCooldownRef.current = now;
                      setFriendsRefreshTrigger(prev => prev + 1);
                    }
                  } else {
                    // Se clicou na aba Photos e não está visualizando um perfil, fazer refresh
                    if (tab.id === 'photos' && !photosProfileUser) {
                      const now = Date.now();
                      const cooldownMs = 2000; // 2 segundos de cooldown
                      
                      // Só fazer refresh se passou o cooldown
                      if (now - photosRefreshCooldownRef.current > cooldownMs) {
                        console.log('[📸 PHOTOS TAB] Refresh triggered on tab click');
                        photosRefreshCooldownRef.current = now;
                        setPhotosRefreshTrigger(prev => prev + 1);
                      } else {
                        console.log('[📸 PHOTOS TAB] Refresh skipped (cooldown active)');
                      }
                    }
                    // Se clicou na aba Friends e não está visualizando um perfil, fazer refresh e scroll ao topo
                    if (tab.id === 'friends' && !viewingUser) {
                      const now = Date.now();
                      const cooldownMs = 2000; // 2 segundos de cooldown
                      
                      // Scroll ao topo - será feito quando a aba mudar e o componente renderizar
                      // Usar requestAnimationFrame para garantir que o DOM está atualizado
                      requestAnimationFrame(() => {
                        setTimeout(() => {
                          // Encontrar o container scrollável dentro do FeedTab
                          const scrollContainer = document.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
                          if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
                            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }, 50);
                      });
                      
                      // Só fazer refresh se passou o cooldown
                      if (now - friendsRefreshCooldownRef.current > cooldownMs) {
                        console.log('[👥 FRIENDS TAB] Refresh triggered on tab click');
                        friendsRefreshCooldownRef.current = now;
                        setFriendsRefreshTrigger(prev => prev + 1);
                      } else {
                        console.log('[👥 FRIENDS TAB] Refresh skipped (cooldown active)');
                      }
                    }
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
        onNavigateToProfile={activeTab === 'photos' && photosProfileUser ? navigateToProfileFromPhotos : navigateToProfile}
      />
      
      <FriendsModal 
        isOpen={activeModal === 'friends'} 
        onClose={() => setActiveModal(null)}
        friends={friends || []}
        userName={userData?.name || 'Usuário'}
        onNavigateToProfile={activeTab === 'photos' && photosProfileUser ? navigateToProfileFromPhotos : navigateToProfile}
      />
      
      <GroupsModal 
        isOpen={activeModal === 'groups'} 
        onClose={() => setActiveModal(null)}
        groups={groups || []}
        userName={userData?.name || 'Usuário'}
        onNavigateToProfile={activeTab === 'photos' && photosProfileUser ? navigateToProfileFromPhotos : navigateToProfile}
      />
      
      <RoomsModal 
        isOpen={activeModal === 'rooms'} 
        onClose={() => setActiveModal(null)}
        rooms={rooms || []}
        userName={userData?.name || 'Usuário'}
        onNavigateToProfile={activeTab === 'photos' && photosProfileUser ? navigateToProfileFromPhotos : navigateToProfile}
      />
    </div>
  );
};



// Função helper para estilos do header de busca sticky
const getSearchHeaderStyles = (isFixed: boolean) => ({
  position: (isFixed ? 'sticky' : 'relative') as 'sticky' | 'relative',
  top: isFixed ? 0 : 'auto',
  zIndex: isFixed ? 100 : 10,
  backgroundColor: 'transparent',
  backgroundImage: 'none',
  backgroundSize: 'auto'
});

// Componente da aba Feed
const FeedTab: React.FC<any> = ({ 
  user, badges, rooms, groups, friends, photos, isLoading, 
  onNavigateToProfile, isViewingOtherUser, viewingUsername, currentUser,
  getPhotoInteractions, setSelectedPhoto, toggleLike, addComment, habboAccount, username, setActiveTab,
  activeModal, setActiveModal, handleShowLikesModal, handleShowCommentsModal, handlePhotoClick,
  isEditMode, toggleEditMode, bodyDirection, headDirection, rotateBody, rotateHead,
  hiddenPhotos, togglePhotoVisibility, viewingUser,
  onBackToPhotosFeed,
  onNavigateBack,
  friendsRefreshTrigger = 0
}) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  // Ref para o container do dropdown de busca
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Hook para controlar sticky header
  const { isHeaderVisible, isHeaderFixed } = useStickyHeader(scrollContainerRef);
  
  // Fechar dropdown de países quando clicar fora
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
  
  // Fechar dropdown de resultados de busca quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setSearchResults([]);
        setSearchTerm(''); // Limpar também o termo de busca para ocultar a mensagem "nenhum resultado"
      }
    };
    
    // Mostrar dropdown se houver resultados OU se houver termo de busca (incluindo mensagem "nenhum resultado")
    const shouldShowDropdown = searchResults.length > 0 || (searchTerm.trim().length > 0 && !isSearching);
    if (shouldShowDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchResults.length, searchTerm, isSearching]);
  
  
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
  
  // Função para buscar usuários globalmente
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchUsersGlobally(searchTerm.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching user:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Detectar perfil privado APENAS se a API indicar explicitamente
  const isProfilePrivate = isViewingOtherUser && user?.profileVisible === false;
  
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
            <p className="text-white/60">{t('pages.console.loadingUser')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Se estiver visualizando outro usuário, mostrar o perfil completo
  if (isViewingOtherUser) {
    return (
      <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
        {/* Botões de navegação */}
        {(onBackToPhotosFeed || onNavigateBack) && (
          <div className="px-4 pt-3 flex gap-2">
            {/* Botão para voltar ao perfil anterior (quando navegado via modal) */}
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-lg border border-white/30 bg-transparent hover:bg-white hover:text-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span className="truncate">Voltar</span>
              </button>
            )}
            {/* Botão opcional para voltar ao feed do hotel (usado na aba Photos) */}
            {onBackToPhotosFeed && (
              <button
                onClick={onBackToPhotosFeed}
                className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-lg border border-white/30 bg-transparent hover:bg-white hover:text-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span className="truncate">Voltar ao feed do hotel</span>
              </button>
            )}
          </div>
        )}

        {/* Header do usuário com borda inferior */}
        <div className="p-4 border-b border-white/20 relative">
          {/* Bandeira no extremo superior direito */}
          <img 
            src={getHotelFlag(user?.hotel)} 
            alt="" 
            className="absolute top-2 right-2 w-auto object-contain" 
            style={{ imageRendering: 'pixelated', height: 'auto', maxHeight: 'none' }} 
          />
          
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="relative flex-shrink-0">
                <img 
                  src={`https://www.habbo.${(() => {
                    const hotel = user?.hotel || 'com.br';
                    if (hotel === 'br') return 'com.br';
                    if (hotel === 'tr') return 'com.tr';
                    return hotel;
                  })()}/habbo-imaging/avatarimage?figure=${encodeURIComponent(user?.figure_string || '')}&size=m&direction=2&head_direction=2`}
                  alt={`Avatar de ${user?.name || 'Habbo'}`}
                  className="h-28 w-auto object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-&size=m&direction=2&head_direction=2`;
                  }}
                />
              </div>
              {/* Status centralizado abaixo do avatar */}
                    <img 
                      src={user?.online ? 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/online.gif' : '/assets/offline_icon.png'}
                alt={user?.online ? 'Online' : 'Offline'}
                height="16"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white mb-2 truncate">{user?.name || habboAccount?.habbo_name || 'Usuário'}</h2>
              {user?.motto && user.motto.trim() && user.motto.trim().toLowerCase() !== 'null' ? (
                <p className="text-white/70 italic mb-4 line-clamp-2">
                  "{user.motto.trim()}"
                </p>
              ) : null}
              
              <div className="space-y-1 text-xs text-white/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-nowrap">{t('pages.console.createdAt')}</span>
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
                  <span className="font-medium text-nowrap">{t('pages.console.lastAccess')}</span>
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
                {isProfilePrivate ? '0' : ((photos || []).filter((photo, index) => !(hiddenPhotos || []).includes(photo.id || `photo-${index}`)).length)}
              </div>
              <div className="text-xs text-white/60">{t('pages.console.photos')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">0</div>
              <div className="text-xs text-white/60">{t('pages.console.followers')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">0</div>
              <div className="text-xs text-white/60">{t('pages.console.following')}</div>
            </div>
          </div>
        </div>

        {/* Botões de Interação Social */}
        <div className="px-4">
          {isOwnProfile ? (
            <button onClick={toggleEditMode} className="w-full py-1 bg-transparent border border-white/30 hover:bg-white text-white hover:text-gray-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              {isEditMode ? t('pages.console.saveChanges') : t('pages.console.editProfile')}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  if (viewingUser) {
                    alert(t('pages.console.followFunctionComingSoon', { username: viewingUser }));
                  }
                }}
                className="py-1 bg-transparent border border-white/30 hover:bg-white text-white hover:text-gray-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
                {t('pages.console.follow')}
              </button>
              <button 
                onClick={async () => {
                  setActiveTab('chat');
                  // Aguardar um pouco para garantir que o componente Chat foi montado
                  setTimeout(async () => {
                    if ((window as any).startChatWith && viewingUser) {
                      await (window as any).startChatWith(viewingUser);
                    }
                  }, 100);
                }}
                className="py-1 bg-transparent border border-white/30 hover:bg-white text-white hover:text-gray-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
                {t('pages.console.message')}
              </button>
            </div>
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-1">
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
                <div className="text-xs text-white/60">{t('pages.console.friends')}</div>
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
                <div className="text-xs text-white/60">{t('pages.console.rooms')}</div>
              </div>
            </button>
            
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
                <div className="text-xs text-white/60">{t('pages.console.badges')}</div>
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
                <div className="text-xs text-white/60">{t('pages.console.groups')}</div>
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
              {t('pages.console.photosWithCount', { count: isProfilePrivate ? '0' : (photos?.length || 0) })}
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {!isProfilePrivate && photos?.length > 0 ? (
              photos.map((photo, index) => {
                // Usar photo_id (ID real da API do Habbo) ao invés de gerar IDs temporários
                const photoId = photo.photo_id || photo.id || `temp-${Date.now()}-${index}`;
                const isHidden = (hiddenPhotos || []).includes(photoId);
                
                return (
                  <div 
                    key={photoId} 
                    className={`relative group cursor-pointer ${isHidden ? 'opacity-30' : ''}`}
                    onClick={() => {
                      if (!isEditMode && handlePhotoClick) {
                        // Chamar handlePhotoClick para abrir a foto ampliada
                        handlePhotoClick(photo, index);
                      }
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
                      {isEditMode && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); togglePhotoVisibility(photoId); }}
                          className="absolute top-1 right-1 bg-transparent text-white p-1 rounded-full text-xs flex items-center justify-center w-5 h-5"
                          title={isHidden ? t('pages.console.showPhoto') : t('pages.console.hidePhoto')}
                        >
                          {isHidden ? '+' : <img src="/assets/console/minimize.png" alt="X" className="w-4 h-4" style={{ imageRendering: 'pixelated' }} />}
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-2 right-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                                <PhotoLikesCounter photoId={photoId} className="text-white" />
                              </div>
                              <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                                <PhotoCommentsCounter photoId={photoId} className="text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : isProfilePrivate ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-8">
                <img 
                  src="/assets/console/locked.png" 
                  alt="Perfil privado"
                  className="w-auto h-auto mb-3"
                  style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                />
                <p className="text-sm text-white/60">Este usuário tem o perfil privado</p>
              </div>
            ) : hasNoPhotos ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-8 text-white/60">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">{t('pages.console.userHasNoPhotos')}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Feed normal quando estiver no próprio perfil
  return (
    <div 
      ref={scrollContainerRef}
      className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent"
    >
      
      {/* Campo de Busca */}
      <div 
        className={cn(
          "p-4 transition-all duration-300 ease-in-out",
          isHeaderVisible ? "translate-y-0" : "-translate-y-full pointer-events-none h-0 p-0 overflow-hidden"
        )}
        style={getSearchHeaderStyles(isHeaderFixed)}
      >
        <div className="flex items-center gap-2 rounded" style={{ backgroundColor: '#3a3a3a' }}>
          {/* Campo de busca com dropdown integrado */}
          <div className="flex-1 relative" style={{ zIndex: 100 }} ref={searchDropdownRef}>
                {/* Dropdown de resultados - posicionado relativamente ao container completo */}
                {((searchResults.length > 0) || (searchTerm.trim().length > 0 && !isSearching && searchResults.length === 0)) && (
                  <div className="absolute top-full left-0 right-0 mt-1 border border-white/20 rounded shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent" style={{ maxHeight: '224px', backgroundColor: '#3a3a3a', zIndex: 1000 }}>
                    {searchResults.length > 0 ? (
                      searchResults.map((user, index) => {
                        const hotelDomain = user.hotelDomain || 'com.br';
                        const hotelCode = user.hotelCode || (hotelDomain === 'com.br' ? 'br' : hotelDomain === 'com.tr' ? 'tr' : hotelDomain);
                        const figureString = user.figureString || '';
                        const avatarUrl = figureString 
                          ? `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?figure=${encodeURIComponent(figureString)}&size=m&head_direction=3&headonly=1`
                          : `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(user.name)}&size=m&head_direction=3&headonly=1`;
                        
                        return (
                          <div
                            key={`${user.uniqueId}-${index}`}
                            className="flex items-center gap-3 p-2 bg-transparent hover:bg-white/5 border-b border-white/10 last:border-b-0 transition-colors cursor-pointer"
                            onClick={() => {
                              const hotelDomain = user.hotelDomain || 'com.br';
                              onNavigateToProfile(user.name, hotelDomain);
                              setSearchResults([]);
                              setSearchTerm('');
                            }}
                          >
                            <img
                              src={getHotelFlag(hotelCode)}
                              alt={hotelCode}
                              className="w-6 h-6 object-contain flex-shrink-0"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            <div className="w-[52px] h-[52px] flex-shrink-0 overflow-hidden">
                              <img
                                src={avatarUrl}
                                alt={user.name}
                                className="w-full h-full object-cover"
                                style={{ imageRendering: 'pixelated' }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(user.name)}&size=m&head_direction=3&headonly=1`;
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white text-sm truncate">{user.name}</div>
                              <div className="text-xs text-white/60 truncate">{user.motto || ''}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className={`w-2 h-2 rounded-full ${user.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-center gap-3 p-4 bg-transparent">
                        <div className="text-white/60 text-sm">Nenhum resultado encontrado</div>
                      </div>
                    )}
                  </div>
                )}
            
            <div className="flex items-center bg-white/10 border border-white/30 rounded focus-within:border-white/70 transition-colors h-8">
              {/* Dropdown de países */}
              <div className="relative country-dropdown z-10">
                <button
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className={`flex items-center justify-center transition-colors border-r border-white/30 relative z-20 h-full ${
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
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={t('pages.console.searchUser')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-3 py-1 bg-transparent text-white placeholder-white/70 focus:outline-none text-sm h-full"
                />
              </div>
              
              {/* Botão de busca integrado */}
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                className="px-2 py-1 text-white/80 hover:text-white disabled:text-white/40 transition-colors flex items-center justify-center h-full"
                title="Buscar"
              >
                {isSearching ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                              <img 
                                src="/assets/console/search.png" 
                    alt="Buscar" 
                    className="w-auto h-auto"
                    style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Feed de Fotos dos Amigos */}
      <div className="py-4 relative">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-4" />
              <p className="text-white/60">{t('pages.console.loadingFeed')}</p>
            </div>
          </div>
        }>
          <FriendsPhotoFeed
            currentUserName={currentUser || ''}
            hotel={habboAccount?.hotel || 'br'}
            onNavigateToProfile={onNavigateToProfile}
            refreshTrigger={friendsRefreshTrigger}
            isHeaderVisible={isHeaderVisible}
          />
        </Suspense>
      </div>
      
    </div>
  );
};

// Componente da aba Photos (Feed Global)
const PhotosTab: React.FC<any> = ({ isLoading, onUserClickFromFeed, refreshTrigger = 0 }) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Ref para o container scrollável
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Hook para controlar sticky header (PhotosTab tem scroll em elemento filho)
  const { isHeaderVisible, isHeaderFixed } = useStickyHeader(scrollContainerRef, 50, '[class*="overflow-y-auto"]');

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
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchUsersGlobally(searchTerm.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users globally:', error);
      toast.error(t('messages.errorSearch'));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Incrementar o trigger local para forçar refresh
      setLocalRefreshTrigger(prev => prev + 1);
    } finally {
      // Aguardar um pouco antes de desabilitar o estado de loading
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Ref para o container do dropdown de busca
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  
  // Fechar dropdown de resultados de busca quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setSearchResults([]);
        setSearchTerm(''); // Limpar também o termo de busca para ocultar a mensagem "nenhum resultado"
      }
    };
    
    // Mostrar dropdown se houver resultados OU se houver termo de busca (incluindo mensagem "nenhum resultado")
    const shouldShowDropdown = searchResults.length > 0 || (searchTerm.trim().length > 0 && !isSearching);
    if (shouldShowDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchResults.length, searchTerm, isSearching]);
  

  return (
    <div ref={scrollContainerRef} className="h-full w-full flex flex-col overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-4" />
            <p className="text-white/60">{t('pages.console.loadingGlobalFeed')}</p>
          </div>
        </div>
      }>
        {/* Campo de Busca - Fixo no topo */}
        <div 
          className={cn(
            "p-4 flex-shrink-0 transition-all duration-300 ease-in-out",
            isHeaderVisible ? "translate-y-0" : "-translate-y-full pointer-events-none h-0 p-0 overflow-hidden"
          )}
          style={getSearchHeaderStyles(isHeaderFixed)}
        >
            <div className="flex items-center gap-2">
              {/* Campo de busca com dropdown integrado */}
              <div className="flex-1 relative" style={{ zIndex: 100 }} ref={searchDropdownRef}>
                {/* Dropdown de resultados - posicionado relativamente ao container completo */}
                {((searchResults.length > 0) || (searchTerm.trim().length > 0 && !isSearching && searchResults.length === 0)) && (
                  <div className="absolute top-full left-0 right-0 mt-1 border border-white/20 rounded shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent" style={{ maxHeight: '224px', backgroundColor: '#3a3a3a', zIndex: 1000 }}>
                    {searchResults.length > 0 ? (
                      searchResults.map((user, index) => {
                        const hotelDomain = user.hotelDomain || 'com.br';
                        const hotelCode = user.hotelCode || (hotelDomain === 'com.br' ? 'br' : hotelDomain === 'com.tr' ? 'tr' : hotelDomain);
                        const figureString = user.figureString || '';
                        const avatarUrl = figureString 
                          ? `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?figure=${encodeURIComponent(figureString)}&size=m&head_direction=3&headonly=1`
                          : `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(user.name)}&size=m&head_direction=3&headonly=1`;
                        
                        return (
                          <div
                            key={`${user.uniqueId}-${index}`}
                            className="flex items-center gap-3 p-2 bg-transparent hover:bg-white/5 border-b border-white/10 last:border-b-0 transition-colors cursor-pointer"
                            onClick={() => {
                              onUserClickFromFeed(user.name, { hotelDomain, hotelCode });
                              setSearchResults([]);
                              setSearchTerm('');
                            }}
                          >
                            <img
                              src={getHotelFlag(hotelCode)}
                              alt={hotelCode}
                              className="w-6 h-6 object-contain flex-shrink-0"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            <div className="w-[52px] h-[52px] flex-shrink-0 overflow-hidden">
                              <img
                                src={avatarUrl}
                                alt={user.name}
                                className="w-full h-full object-cover"
                                style={{ imageRendering: 'pixelated' }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(user.name)}&size=m&head_direction=3&headonly=1`;
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white text-sm truncate">{user.name}</div>
                              <div className="text-xs text-white/60 truncate">{user.motto || ''}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className={`w-2 h-2 rounded-full ${user.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-center gap-3 p-4 bg-transparent">
                        <div className="text-white/60 text-sm">Nenhum resultado encontrado</div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center bg-white/10 border border-white/30 rounded focus-within:border-white/70 transition-colors h-8">
                  {/* Dropdown de países */}
                  <div className="relative country-dropdown z-10">
                    <button
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className={`flex items-center justify-center transition-colors border-r border-white/30 relative z-20 h-full ${
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
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={t('pages.console.searchUser')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full px-3 py-1 bg-transparent text-white placeholder-white/70 focus:outline-none text-sm h-full"
                    />
                  </div>
                  
                  {/* Botão de busca integrado */}
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchTerm.trim()}
                    className="px-2 py-1 text-white/80 hover:text-white disabled:text-white/40 transition-colors flex items-center justify-center h-full"
                    title="Buscar"
                  >
                    {isSearching ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                  <img 
                    src="/assets/console/search.png" 
                        alt="Buscar" 
                        className="w-auto h-auto"
                        style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Título do feed - Fixo */}
        <div 
          className="flex items-center justify-between px-2 py-2 flex-shrink-0"
          style={{ 
            position: 'sticky', 
            top: 0,
            zIndex: 99
          }}
        >
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <img
              src="/assets/console/hotelfilter.png"
              alt="Filtro"
              className="h-5 w-auto object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            Feed do Hotel
          </h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-white/60 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Atualizar feed"
          >
            {isRefreshing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Linha tracejada abaixo do título */}
        <div className="border-t border-dashed border-white/20 my-2"></div>

        {/* Feed de fotos - Scrollável */}
        <div className="flex-1 min-h-0 overflow-hidden w-full">
          <GlobalPhotoFeedColumn
            hotel={selectedCountry || 'all'}
            className="h-full"
            onUserClick={onUserClickFromFeed}
            refreshTrigger={refreshTrigger + localRefreshTrigger}
          />
        </div>
      </Suspense>
    </div>
  );
};

// Componente da aba Friends
const FriendsTab: React.FC<any> = ({ friends, isLoading, onNavigateToProfile }) => {
  const { t } = useI18n();
  if (isLoading) {
    return (
      <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-4" />
            <p className="text-white/60">{t('pages.console.loadingFriends')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-bold">{t('pages.console.friendsFeed')}</h3>
        <p className="text-sm text-white/60 mt-1">{t('pages.console.friendsCount', { count: friends.length })}</p>
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
              {t('pages.console.noFriends')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente da aba Buscar
const SearchTab: React.FC<any> = ({ onStartConversation }) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-bold">{t('pages.console.searchUsers')}</h3>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder={t('pages.console.searchUser')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/10 border border-black rounded text-white placeholder-white/50"
          />
          <Button className="bg-blue-600 hover:bg-blue-700">
            <img 
              src="/assets/console/search.png" 
              alt="Buscar" 
              className="w-auto h-auto"
              style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
            />
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


export default FunctionalConsole;

