
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Home, MessageCircle, Menu, Calendar, Newspaper, X, Cog } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { ToolsPopover } from './tools-popover';

// Define o tipo para os itens do menu
type IconComponentType = React.ElementType<{ className?: string }>;

export interface DockItem {
  id: string;
  label: string;
  icon: IconComponentType | string;
  isAvatar?: boolean;
  order: number;
}

export interface HabboMobileDockProps {
  menuItems: DockItem[]; 
  userAvatarUrl?: string;
  onItemClick: (itemId: string) => void;
  activeItemId?: string;
  isLoggedIn?: boolean;
  currentPath?: string;
  customCenterElement?: React.ReactElement;
}

const HabboMobileDock: React.FC<HabboMobileDockProps> = ({ 
  menuItems, 
  userAvatarUrl, 
  onItemClick, 
  activeItemId,
  isLoggedIn = false,
  currentPath = '/',
  customCenterElement
}) => {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Define os 5 itens principais da dock usando os ícones da sidebar
  const mainDockItems: DockItem[] = useMemo(() => {
    const homeItem: DockItem = { 
      id: 'home', 
      label: t('home'), 
      icon: '/assets/home.png',
      order: 1 
    };
    
    const forumItem: DockItem = { 
      id: 'forum', 
      label: t('forum'), 
      icon: '/assets/BatePapo1.png',
      order: 2 
    };
    
    // Avatar central - usando API do Habbo para cabeça diagonal
    const avatarUrl = isLoggedIn 
      ? userAvatarUrl || 'https://www.habbo.com/habbo-imaging/avatarimage?user=Habbo&action=std&direction=4&head_direction=4&gesture=sml&size=s&frame=1&headonly=1'
      : '/assets/consoleon3.gif';
    
    const avatarItem: DockItem = { 
      id: 'console', 
      label: t('console'), 
      icon: avatarUrl, 
      isAvatar: true,
      order: 3
    };
    
    const toolsItem: DockItem = { 
      id: 'tools', 
      label: t('tools'), 
      icon: '/assets/ferramentas.png',
      order: 4 
    };
    
    const moreItem: DockItem = { 
      id: 'more', 
      label: t('more'), 
      icon: Menu, 
      order: 5 
    };

    return [homeItem, forumItem, avatarItem, toolsItem, moreItem];
  }, [t, userAvatarUrl, isLoggedIn]);

  // Items para o dropdown "Mais" (excluindo os principais e ferramentas)
  const dropdownItems: DockItem[] = useMemo(() => {
    const mainIds = new Set(['home', 'forum', 'console', 'tools', 'more', 'catalogo', 'emblemas', 'editor', 'mercado']);
    const filtered = menuItems.filter(item => !mainIds.has(item.id));
    
    // Adicionar itens padrão se não existirem
    const defaultItems: DockItem[] = [
      { id: 'noticias', label: t('noticias'), icon: '/assets/news.png', order: 6 },
      { id: 'eventos', label: 'Eventos', icon: '/assets/eventos.png', order: 7 },
    ];

    const combined = [...filtered];
    
    // Adicionar itens padrão que não existem
    defaultItems.forEach(defaultItem => {
      if (!combined.find(item => item.id === defaultItem.id)) {
        combined.push(defaultItem);
      }
    });

    return combined.sort((a, b) => (a.order || 999) - (b.order || 999));
  }, [menuItems, t]);

  const handleMoreClick = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
    setIsToolsOpen(false);
  }, []);

  const handleToolsClick = useCallback(() => {
    setIsToolsOpen(prev => !prev);
    setIsDropdownOpen(false);
  }, []);

  const handleDropdownItemClick = useCallback((itemId: string) => {
    onItemClick(itemId);
    setIsDropdownOpen(false);
  }, [onItemClick]);

  const handleMainDockItemClick = useCallback((item: DockItem) => {
    if (item.id === 'more') {
      handleMoreClick();
    } else if (item.id === 'tools') {
      handleToolsClick();
    } else {
      onItemClick(item.id);
      setIsDropdownOpen(false);
      setIsToolsOpen(false);
    }
  }, [onItemClick, handleMoreClick, handleToolsClick]);

  // Fecha os popups ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          !(event.target as HTMLElement).closest('.dock-more-button') &&
          !(event.target as HTMLElement).closest('.dock-tools-button')) {
        setIsDropdownOpen(false);
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full md:hidden">
      {/* Linha divisória */}
      <div className="h-px" style={{ backgroundColor: '#000' }}></div>
      
      {/* Container principal da dock */}
      <div className="p-0 flex justify-center w-full" style={{ backgroundColor: '#ffefd5' }}>
        {/* Tools Popover */}
        <ToolsPopover 
          isOpen={isToolsOpen} 
          onClose={() => setIsToolsOpen(false)}
          currentPath={currentPath}
        />

        {/* Dropdown Menu "Mais" - Ajustado para aparecer acima da dock */}
        {isDropdownOpen && (
          <div 
            ref={dropdownRef}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-72 p-4 rounded-t-xl shadow-2xl flex flex-col space-y-2 max-h-[60vh] overflow-y-auto border-t-2 border-black"
            style={{
              backgroundColor: '#ffefd5',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Header do dropdown */}
            <div className="text-center pb-2 border-b border-black/30">
              <span 
                className="font-bold text-lg text-white volter-font"
                style={{ 
                  textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                }}
              >
                {t('more')}
              </span>
            </div>

            {dropdownItems.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {dropdownItems.map(item => (
                  <button
                    key={item.id}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: activeItemId === item.id 
                        ? 'rgba(0, 0, 0, 0.2)' 
                        : 'rgba(0, 0, 0, 0.1)',
                      boxShadow: activeItemId === item.id 
                        ? '0 0 10px rgba(0, 0, 0, 0.5)' 
                        : '0 2px 5px rgba(0, 0, 0, 0.2)'
                    }}
                    onClick={() => handleDropdownItemClick(item.id)}
                  >
                    {typeof item.icon === 'string' ? (
                      <img 
                        src={item.icon} 
                        alt={item.label} 
                        className="w-8 h-8 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <item.icon className="w-8 h-8 text-black" />
                    )}
                    <span className="text-xs font-medium text-center leading-tight text-white volter-font" style={{
                      textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                    }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-600">
                Nenhuma página adicional.
              </p>
            )}
          </div>
        )}

        {/* Main Dock */}
        <nav className="w-full max-w-sm flex justify-around items-center py-4 px-3">
          {mainDockItems.map((item) => {
            const isActive = activeItemId === item.id;
            const isMore = item.id === 'more';
            const isTools = item.id === 'tools';
            
            let IconDisplay;
            if (item.isAvatar) {
              // Use custom center element if provided, otherwise use avatar
              if (customCenterElement) {
                IconDisplay = customCenterElement;
              } else {
                IconDisplay = (
                  <div className="relative">
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                        padding: '3px'
                      }}
                    >
                      <div 
                        className="w-full h-full rounded-full overflow-hidden"
                        style={{ backgroundColor: '#1a1a1a' }}
                      >
                        <img 
                          src={item.icon as string} 
                          alt={item.label} 
                          className="w-full h-full object-cover"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    </div>
                    <div className="w-12 h-12" />
                  </div>
                );
              }
            } else if (typeof item.icon === 'string') {
              IconDisplay = (
                <img 
                  src={item.icon} 
                  alt={item.label} 
                  className="w-8 h-8 object-contain" 
                  style={{ imageRendering: 'pixelated' }}
                />
              );
            } else {
              IconDisplay = (
                <item.icon 
                  className={`w-8 h-8 ${isActive ? 'text-black' : 'text-gray-700'}`}
                />
              );
            }

            return (
              <button
                key={item.id}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                  isMore ? 'dock-more-button' : ''
                } ${isTools ? 'dock-tools-button' : ''}`}
                style={{
                  backgroundColor: isActive || (isMore && isDropdownOpen) || (isTools && isToolsOpen)
                    ? 'rgba(0, 0, 0, 0.2)' 
                    : 'transparent',
                  boxShadow: isActive || (isMore && isDropdownOpen) || (isTools && isToolsOpen)
                    ? '0 0 15px rgba(0, 0, 0, 0.4)' 
                    : 'none',
                  minWidth: '60px'
                }}
                onClick={() => handleMainDockItemClick(item)}
              >
                <div className={item.isAvatar ? '' : 'relative'}>
                  {isMore && isDropdownOpen ? (
                    <X className="w-8 h-8 text-black" />
                  ) : (
                    IconDisplay
                  )}
                </div>
                
                <span 
                  className={`text-xs font-medium text-center leading-tight volter-font text-white`}
                  style={{ 
                    textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export { HabboMobileDock };
