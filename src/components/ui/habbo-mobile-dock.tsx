
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Home, Newspaper, MessageCircle, Menu, Calendar, ShoppingBag, Award, Palette, Banknote, X, Users, Cog } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

// Define o tipo para os itens do menu
type IconComponentType = React.ElementType<{ className?: string }>;

export interface DockItem {
  id: string;
  label: string;
  icon: IconComponentType | string;
  isAvatar?: boolean;
  order: number; // Ordem de exibição
}

export interface HabboMobileDockProps {
  menuItems: DockItem[]; 
  userAvatarUrl?: string;
  onItemClick: (itemId: string) => void;
  activeItemId?: string;
  isLoggedIn?: boolean;
}

const HabboMobileDock: React.FC<HabboMobileDockProps> = ({ 
  menuItems, 
  userAvatarUrl, 
  onItemClick, 
  activeItemId,
  isLoggedIn = false 
}) => {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Define os 5 itens principais da dock com ordem específica
  const mainDockItems: DockItem[] = useMemo(() => {
    const homeItem: DockItem = { 
      id: 'home', 
      label: t('home'), 
      icon: Home, 
      order: 1 
    };
    
    const forumItem: DockItem = { 
      id: 'forum', 
      label: t('forum'), 
      icon: MessageCircle, 
      order: 2 
    };
    
    // Avatar central
    const avatarUrl = isLoggedIn 
      ? userAvatarUrl || 'https://www.habbo.com/habbo-imaging/avatarimage?user=Habbo&action=std&direction=2&head_direction=2&gesture=sml&size=s&frame=1'
      : '/assets/frank.png';
    
    const avatarItem: DockItem = { 
      id: 'console', 
      label: t('console'), 
      icon: avatarUrl, 
      isAvatar: true,
      order: 3
    };
    
    const toolsItem: DockItem = { 
      id: 'ferramentas', 
      label: t('tools'), 
      icon: Cog, 
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

  // Define os itens que irão para o dropdown (excluindo os 5 principais)
  const dropdownItems: DockItem[] = useMemo(() => {
    const mainIds = new Set(['home', 'forum', 'console', 'ferramentas', 'more']);
    const filtered = menuItems.filter(item => !mainIds.has(item.id));
    
    // Adicionar itens padrão se não existirem
    const defaultItems: DockItem[] = [
      { id: 'emblemas', label: 'Emblemas', icon: Award, order: 6 },
      { id: 'noticias', label: 'Notícias', icon: Newspaper, order: 7 },
      { id: 'catalogo', label: 'Catálogo', icon: ShoppingBag, order: 8 },
      { id: 'eventos', label: 'Eventos', icon: Calendar, order: 9 },
      { id: 'mercado', label: 'Mercado', icon: Banknote, order: 10 },
      { id: 'editor', label: 'Editor', icon: Palette, order: 11 },
    ];

    const combined = [...filtered];
    
    // Adicionar itens padrão que não existem
    defaultItems.forEach(defaultItem => {
      if (!combined.find(item => item.id === defaultItem.id)) {
        combined.push(defaultItem);
      }
    });

    return combined.sort((a, b) => (a.order || 999) - (b.order || 999));
  }, [menuItems]);

  const handleMoreClick = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const handleDropdownItemClick = useCallback((itemId: string) => {
    onItemClick(itemId);
    setIsDropdownOpen(false);
  }, [onItemClick]);

  const handleMainDockItemClick = useCallback((item: DockItem) => {
    if (item.id === 'more') {
      handleMoreClick();
    } else {
      onItemClick(item.id);
      setIsDropdownOpen(false);
    }
  }, [onItemClick, handleMoreClick]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          !(event.target as HTMLElement).closest('.dock-more-button')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 flex justify-center w-full md:hidden">
      {/* Dropdown Menu Aprimorado */}
      {isDropdownOpen && (
        <div 
          ref={dropdownRef}
          className="mb-2 p-4 rounded-t-xl shadow-2xl flex flex-col space-y-2 max-h-[60vh] overflow-y-auto"
          style={{
            backgroundColor: '#2a2a2a',
            border: '3px solid #d4af37',
            borderBottom: 'none',
            boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)'
          }}
        >
          {/* Header do dropdown */}
          <div className="text-center pb-2 border-b border-amber-600/30">
            <span 
              className="font-bold text-lg text-yellow-300 volter-font"
              style={{ 
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
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
                      ? 'rgba(212, 175, 55, 0.3)' 
                      : 'rgba(212, 175, 55, 0.1)',
                    border: `2px solid ${activeItemId === item.id ? '#f4d03f' : '#d4af37'}`,
                    boxShadow: activeItemId === item.id 
                      ? '0 0 10px rgba(244, 208, 63, 0.5)' 
                      : '0 2px 5px rgba(0, 0, 0, 0.2)'
                  }}
                  onClick={() => handleDropdownItemClick(item.id)}
                >
                  {typeof item.icon === 'string' ? (
                    <img src={item.icon} alt={item.label} className="w-6 h-6 object-contain" />
                  ) : (
                    <item.icon className="w-6 h-6 text-yellow-300" />
                  )}
                  <span className="text-xs font-medium text-center leading-tight text-gray-200">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-400">
              Nenhuma página adicional.
            </p>
          )}
        </div>
      )}

      {/* Main Dock com design HabboHub */}
      <nav 
        className="w-full max-w-sm flex justify-around items-center p-3 rounded-xl shadow-2xl"
        style={{
          backgroundColor: '#2a2a2a',
          border: '3px solid #d4af37',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)',
          background: 'linear-gradient(135deg, #2a2a2a 0%, #333 50%, #2a2a2a 100%)'
        }}
      >
        {mainDockItems.map((item) => {
          const isActive = activeItemId === item.id;
          const isMore = item.id === 'more';
          
          let IconDisplay;
          if (item.isAvatar) {
            IconDisplay = (
              <div className="relative">
                {/* Background circular dourado para avatar */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
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
                    />
                  </div>
                </div>
                <div className="w-10 h-10" /> {/* Spacer para manter tamanho */}
              </div>
            );
          } else if (typeof item.icon === 'string') {
            IconDisplay = (
              <img 
                src={item.icon} 
                alt={item.label} 
                className="w-6 h-6 object-contain" 
              />
            );
          } else {
            IconDisplay = (
              <item.icon 
                className={`w-6 h-6 ${isActive ? 'text-yellow-300' : 'text-gray-200'}`}
              />
            );
          }

          return (
            <button
              key={item.id}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isMore ? 'dock-more-button' : ''
              }`}
              style={{
                backgroundColor: isActive 
                  ? 'rgba(212, 175, 55, 0.3)' 
                  : 'transparent',
                border: `2px solid ${isActive ? '#f4d03f' : 'transparent'}`,
                boxShadow: isActive 
                  ? '0 0 15px rgba(244, 208, 63, 0.4)' 
                  : 'none',
                minWidth: '60px'
              }}
              onClick={() => handleMainDockItemClick(item)}
            >
              {/* Ícone com efeito especial para "Mais" */}
              <div className={item.isAvatar ? '' : 'relative'}>
                {isMore && isDropdownOpen ? (
                  <X className="w-6 h-6 text-yellow-300" />
                ) : (
                  IconDisplay
                )}
                {/* Glow effect para avatar */}
                {item.isAvatar && (
                  <div 
                    className="absolute inset-0 rounded-full opacity-50"
                    style={{
                      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)',
                      filter: 'blur(8px)'
                    }}
                  />
                )}
              </div>
              
              {/* Label com fonte do site */}
              <span 
                className={`text-xs font-medium text-center leading-tight ${
                  isActive ? 'text-yellow-300' : 'text-gray-200'
                }`}
                style={{ 
                  fontFamily: "'Arial', sans-serif",
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export { HabboMobileDock };
