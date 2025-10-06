import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PixelFrame } from './PixelFrame';

const SimpleConsole: React.FC = () => {
  const { habboAccount, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'friends' | 'chat' | 'photos'>('account');

  const tabs = [
    {
      id: 'account' as const,
      label: 'My Info',
      icon: <img src="/assets/my-info.png" alt="My Info" className="h-7 w-auto" style={{ imageRendering: 'pixelated' }} />,
      color: '#FDCC00',
      hoverColor: '#FEE100',
      activeColor: '#FBCC00'
    },
    {
      id: 'friends' as const,
      label: 'Friends',
      icon: <img src="/assets/friends-icon.png" alt="Friends" className="h-7 w-auto" style={{ imageRendering: 'pixelated' }} />,
      color: '#FDCC00',
      hoverColor: '#FEE100',
      activeColor: '#FBCC00'
    },
    {
      id: 'chat' as const,
      label: 'Chat',
      icon: <img src="/assets/chat-icon.png" alt="Chat" className="h-8 w-auto" style={{ imageRendering: 'pixelated' }} />,
      color: '#FDCC00',
      hoverColor: '#FEE100',
      activeColor: '#FBCC00'
    },
    {
      id: 'photos' as const,
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

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
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
        );
      
      case 'friends':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Amigos</h3>
            <div className="text-center text-white/60 py-8">
              <p>Lista de amigos em desenvolvimento...</p>
            </div>
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
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                <circle cx="12" cy="13" r="3"></circle>
              </svg>
              Fotos
            </h3>
            <div className="text-center text-white/60 py-8">
              <p>Galeria de fotos em desenvolvimento...</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
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
                
                {/* Botões de navegação */}
                <div className="relative bg-yellow-400">
                  <div className="grid grid-cols-4 gap-0 p-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex flex-col items-center justify-center p-2 transition-all duration-200 border border-[#9C6300] ${
                          activeTab === tab.id ? 'bg-[#CD9700]' : 'bg-[#ECAE00]'
                        }`}
                        style={{ 
                          boxShadow: 'rgb(255, 204, 0) 0px 2px 0px inset',
                          minHeight: '86px'
                        }}
                      >
                        <div className={`mb-2 transition-transform duration-200 ${
                          activeTab === tab.id ? 'scale-110' : 'scale-100'
                        }`}>
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
  );
};

export default SimpleConsole;
