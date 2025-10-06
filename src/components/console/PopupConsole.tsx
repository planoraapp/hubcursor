import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { useUnifiedPhotoSystem } from '@/hooks/useUnifiedPhotoSystem';
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

// Importações diretas (não lazy) para evitar problemas no popup
import { FriendsPhotoFeed } from './FriendsPhotoFeed';
import { FindPhotoFeedColumn } from '@/components/console2/FindPhotoFeedColumn';
import { GlobalPhotoFeedColumn } from '@/components/console2/GlobalPhotoFeedColumn';

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
    icon: <img src="/assets/my-info.png" alt="My Info" className="h-7 w-auto" style={{ imageRendering: 'pixelated' }} />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'friends',
    label: 'Friends',
    icon: <img src="/assets/friends-icon.png" alt="Friends" className="h-7 w-auto" style={{ imageRendering: 'pixelated' }} />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: <img src="/assets/chat-icon.png" alt="Chat" className="h-8 w-auto" style={{ imageRendering: 'pixelated' }} />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'photos',
    label: 'Photos',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="w-8 h-8" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="0" width="40" height="40" fill="#ECAE00"></rect>
        <rect x="4" y="8" width="32" height="24" fill="none" stroke="#8B4513" strokeWidth="2"></rect>
        <rect x="8" y="4" width="24" height="32" fill="none" stroke="#8B4513" strokeWidth="2"></rect>
        <rect x="20" y="8" width="2" height="24" fill="#8B4513"></rect>
        <rect x="4" y="20" width="32" height="2" fill="#8B4513"></rect>
        <rect x="12" y="32" width="16" height="4" fill="#8B4513"></rect>
      </svg>
    ),
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  }
];

const PopupConsole: React.FC = () => {
  const { habboAccount, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [showPhotoComments, setShowPhotoComments] = useState(false);
  const [showPhotoLikes, setShowPhotoLikes] = useState(false);

  // Hooks principais
  const { profile, isLoading: profileLoading } = useCompleteProfile();
  const { photos, isLoading: photosLoading } = useUnifiedPhotoSystem();
  const { 
    likePhoto, 
    unlikePhoto, 
    commentOnPhoto, 
    deleteComment,
    isLoading: interactionsLoading 
  } = usePhotoInteractions();

  const handlePhotoClick = (photo: any) => {
    setSelectedPhoto(photo);
  };

  const handlePhotoLike = async (photoId: string) => {
    try {
      await likePhoto(photoId);
    } catch (error) {
      console.error('Erro ao curtir foto:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <>
            {/* Profile Header */}
            <div className="p-4 border-b border-white/20">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  {habboAccount ? (
                    <>
                      <img 
                        src={`https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${habboAccount.figure}&size=m&direction=2&head_direction=3`}
                        alt={`Avatar de ${habboAccount.name}`}
                        className="h-28 w-auto object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <div className="absolute bottom-0 right-0">
                        <img 
                          src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/offline.gif"
                          alt="Offline"
                          style={{ imageRendering: 'pixelated', width: 'auto', height: 'auto', maxWidth: '38px', maxHeight: '38px' }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="h-28 w-20 bg-gray-600 flex items-center justify-center">
                      <span className="text-white text-xs">No Avatar</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-white mb-2 truncate">
                    {habboAccount?.name || 'Guest'}
                  </h2>
                  <p className="text-white/70 italic mb-4 truncate">
                    {habboAccount?.motto || 'Welcome to HabboHub!'}
                  </p>
                  <div className="space-y-1 text-sm text-white/60">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-nowrap">Status:</span>
                      <span className="truncate">{isLoggedIn ? 'Online' : 'Offline'}</span>
                    </div>
                    {habboAccount && (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-nowrap">Criado em:</span>
                          <span className="truncate">{habboAccount.created || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-nowrap">Online em:</span>
                          <span className="truncate">{habboAccount.lastOnline || 'N/A'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{photos?.length || 0}</div>
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

            {/* Quick Actions */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-4 gap-1">
                <button 
                  onClick={() => setShowBadgesModal(true)}
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
                    <div className="text-sm font-medium text-white">636</div>
                    <div className="text-xs text-white/60">Emblemas</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setShowRoomsModal(true)}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform">
                    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <div className="text-center">
                    <div className="text-sm font-medium text-white">35</div>
                    <div className="text-xs text-white/60">Quartos</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setShowFriendsModal(true)}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users h-5 w-5 text-green-400 group-hover:scale-110 transition-transform">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <div className="text-center">
                    <div className="text-sm font-medium text-white">489</div>
                    <div className="text-xs text-white/60">Amigos</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setShowGroupsModal(true)}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <polyline points="16 11 18 13 22 9"></polyline>
                  </svg>
                  <div className="text-center">
                    <div className="text-sm font-medium text-white">96</div>
                    <div className="text-xs text-white/60">Grupos</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Photos Preview */}
            <div className="p-0 border-t border-white/20">
              <div className="px-4 pt-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera w-5 h-5">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                    <circle cx="12" cy="13" r="3"></circle>
                  </svg>
                  Fotos ({photos?.length || 0})
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {photos?.slice(0, 6).map((photo: any, index: number) => (
                  <div key={index} className="relative group cursor-pointer" onClick={() => handlePhotoClick(photo)}>
                    <div className="w-full aspect-square bg-gray-700 overflow-hidden">
                      <img 
                        src={photo.url} 
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-2 right-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart w-3 h-3 text-white">
                                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                                </svg>
                                <span className="text-xs text-white">{photo.likes || 0}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-3 h-3 text-white">
                                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                                </svg>
                                <span className="text-xs text-white">{photo.comments || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      case 'friends':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Amigos</h3>
            <FriendsPhotoFeed />
          </div>
        );

      case 'chat':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Chat</h3>
            <div className="text-center text-white/60 py-8">
              <p>Sistema de chat em desenvolvimento...</p>
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="p-4">
            <FindPhotoFeedColumn />
          </div>
        );

      case 'photo':
        return selectedPhoto ? (
          <IndividualPhotoView photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <PixelFrame>
      <div className="mx-auto h-[calc(100vh-12rem)] w-full max-w-full overflow-x-hidden">
        <div className="pixel-frame-outer h-full max-w-full">
          <div className="pixel-header-bar">
            <div className="pixel-title">Meu Console</div>
            <div className="pixel-pattern"></div>
          </div>
          <div className="pixel-inner-content">
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
                  {renderContent()}
                  
                  {/* Navigation Buttons */}
                  <div className="relative bg-yellow-400">
                    <div className="grid grid-cols-4 gap-0 p-1">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            "relative flex flex-col items-center justify-center p-2 transition-all duration-200 border border-[#9C6300]",
                            activeTab === tab.id ? 'bg-[#CD9700]' : 'bg-[#ECAE00]'
                          )}
                          style={{ 
                            boxShadow: 'rgb(255, 204, 0) 0px 2px 0px inset',
                            minHeight: '86px'
                          }}
                        >
                          <div className={cn("mb-2 transition-transform duration-200", 
                            activeTab === tab.id ? 'scale-110' : 'scale-100'
                          )}>
                            {tab.icon}
                          </div>
                          <span 
                            className="text-[9px] font-bold uppercase leading-none text-center"
                            style={{ 
                              color: 'rgb(181, 118, 0)',
                              fontFamily: 'Inter, sans-serif',
                              letterSpacing: '0.01em',
                              textShadow: 'none'
                            }}
                          >
                            {tab.label}
                          </span>
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className="flex flex-col gap-0.5">
                              {[1, 2, 3].map((_, i) => (
                                <div 
                                  key={i}
                                  className="w-[67px] h-[1px] border-t border-[#B57600]"
                                  style={{ 
                                    boxShadow: 'rgb(252, 202, 0) 0px -1px 0px',
                                    opacity: activeTab === tab.id ? 0.4 : 1
                                  }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBadgesModal && (
        <BadgesModal onClose={() => setShowBadgesModal(false)} />
      )}
      {showFriendsModal && (
        <FriendsModal onClose={() => setShowFriendsModal(false)} />
      )}
      {showRoomsModal && (
        <RoomsModal onClose={() => setShowRoomsModal(false)} />
      )}
      {showGroupsModal && (
        <GroupsModal onClose={() => setShowGroupsModal(false)} />
      )}
      {showPhotoComments && selectedPhoto && (
        <PhotoCommentsModal 
          photo={selectedPhoto} 
          onClose={() => setShowPhotoComments(false)}
        />
      )}
      {showPhotoLikes && selectedPhoto && (
        <PhotoLikesModal 
          photo={selectedPhoto} 
          onClose={() => setShowPhotoLikes(false)}
        />
      )}
    </PixelFrame>
  );
};

export default PopupConsole;
