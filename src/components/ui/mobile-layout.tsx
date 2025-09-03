import React from 'react';
import { HabboMobileDock } from './habbo-mobile-dock';
import { DockItem } from './habbo-mobile-dock';

interface MobileLayoutProps {
  children: React.ReactNode;
  menuItems: DockItem[];
  userAvatarUrl?: string;
  onItemClick: (itemId: string) => void;
  activeItemId?: string;
  isLoggedIn?: boolean;
  currentPath?: string;
  showHeader?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  menuItems,
  userAvatarUrl,
  onItemClick,
  activeItemId,
  isLoggedIn = false,
  currentPath = '/',
  showHeader = true
}) => {
  return (
    <div className="flex flex-col min-h-screen md:hidden">
      {/* Header Mobile */}
      {showHeader && (
        <header 
          className="flex items-center justify-between p-4 border-b"
          style={{ backgroundColor: '#ffefd5' }}
        >
          {/* Logo à esquerda */}
          <div className="flex items-center">
            <img 
              src="/assets/logo-habbohub.png" 
              alt="HabboHub" 
              className="h-8 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          
          {/* Avatar/Login à direita */}
          <div className="flex items-center">
            {isLoggedIn && userAvatarUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-black">
                <img 
                  src={userAvatarUrl} 
                  alt="Avatar do usuário" 
                  className="w-full h-full object-cover"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            ) : (
              <button
                onClick={() => onItemClick('login')}
                className="px-3 py-2 bg-primary text-primary-foreground rounded font-volter text-sm"
              >
                Login
              </button>
            )}
          </div>
        </header>
      )}
      
      {/* Conteúdo principal */}
      <main className="flex-1 pb-20">
        {children}
      </main>
      
      {/* Dock inferior */}
      <HabboMobileDock
        menuItems={menuItems}
        userAvatarUrl={userAvatarUrl}
        onItemClick={onItemClick}
        activeItemId={activeItemId}
        isLoggedIn={isLoggedIn}
        currentPath={currentPath}
      />
    </div>
  );
};