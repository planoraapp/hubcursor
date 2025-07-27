import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Home, Newspaper, MessageCircle, Menu, Calendar, ShoppingBag, Award, Palette, Banknote, X } from 'lucide-react';

// Define o tipo para os itens do menu, incluindo um para o elevador
type IconComponentType = React.ElementType<{ className?: string }>;

export interface DockItem {
  id: string;
  label: string;
  icon: IconComponentType | string; // icon pode ser um componente Lucide ou um URL/placeholder para avatar
  isAvatar?: boolean; // Para identificar o item central como avatar
}

export interface HabboMobileDockProps {
  // Array de todos os itens do menu (incluindo os que vão para o dropdown)
  menuItems: DockItem[]; 
  // URL do avatar do usuário (para o item central)
  userAvatarUrl?: string;
  // Função de callback quando um item é clicado (para navegação)
  onItemClick: (itemId: string) => void;
  // ID do item ativo (opcional, para destacar a página atual)
  activeItemId?: string;
  // Se o usuário está logado
  isLoggedIn?: boolean;
}

const HabboMobileDock: React.FC<HabboMobileDockProps> = ({ 
  menuItems, 
  userAvatarUrl, 
  onItemClick, 
  activeItemId,
  isLoggedIn = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Define os itens principais que sempre aparecem na dock
  const mainDockItems: DockItem[] = useMemo(() => {
    // Ícones fixos: Home, Notícias, Avatar, Fórum, Elevador
    const homeItem = menuItems.find(item => item.id === 'home') || { id: 'home', label: 'Início', icon: Home };
    const noticiasItem = menuItems.find(item => item.id === 'noticias') || { id: 'noticias', label: 'Notícias', icon: Newspaper };
    const forumItem = menuItems.find(item => item.id === 'forum') || { id: 'forum', label: 'Fórum', icon: MessageCircle };
    
    // Avatar baseado no status de login
    const avatarUrl = isLoggedIn 
      ? userAvatarUrl || 'https://www.habbo.com/habbo-imaging/avatarimage?user=Habbo&action=std&direction=2&head_direction=2&gesture=sml&size=s&frame=1'
      : '/assets/frank.png';
    
    const avatarItem: DockItem = { 
      id: 'user-avatar', 
      label: 'Avatar', 
      icon: avatarUrl, 
      isAvatar: true 
    };
    
    const elevatorItem: DockItem = { id: 'elevator', label: 'Mais', icon: Menu };

    return [homeItem, noticiasItem, avatarItem, forumItem, elevatorItem];
  }, [menuItems, userAvatarUrl, isLoggedIn]);

  // Define os itens que irão para o dropdown (todos os outros exceto os da dock principal)
  const dropdownItems: DockItem[] = useMemo(() => {
    const mainIds = new Set(mainDockItems.map(item => item.id));
    return menuItems.filter(item => !mainIds.has(item.id));
  }, [menuItems, mainDockItems]);

  const handleElevatorClick = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const handleDropdownItemClick = useCallback((itemId: string) => {
    onItemClick(itemId);
    setIsDropdownOpen(false); // Fecha o dropdown ao clicar
  }, [onItemClick]);

  const handleMainDockItemClick = useCallback((item: DockItem) => {
    if (item.id === 'elevator') {
      handleElevatorClick();
    } else if (!item.isAvatar) { // Avatar não é clicável como página
      onItemClick(item.id);
      setIsDropdownOpen(false); // Fecha o dropdown se aberto e clica em outro item
    }
  }, [onItemClick, handleElevatorClick]);

  // Fecha o dropdown ao clicar fora com debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleClickOutside = (event: MouseEvent) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest('.habbo-dock-button.elevator')) {
          setIsDropdownOpen(false);
        }
      }, 50);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 flex justify-center w-full md:hidden">
      {/* Dropdown Menu (Elevator) */}
      {isDropdownOpen && (
        <div 
          ref={dropdownRef}
          className="habbo-dropdown-menu mb-2 p-3 bg-white border-2 border-[#5a5a5a] border-b-0 rounded-t-lg shadow-lg flex flex-col space-y-2 max-h-[80vh] overflow-y-auto"
        >
          {dropdownItems.length > 0 ? (
            dropdownItems.map(item => (
              <button
                key={item.id}
                className={`habbo-dropdown-item ${activeItemId === item.id ? 'active' : ''}`}
                onClick={() => handleDropdownItemClick(item.id)}
              >
                {typeof item.icon === 'string' ? (
                  <img src={item.icon} alt={item.label} className="dock-icon-img" />
                ) : (
                  <item.icon className="dock-icon" />
                )}
                <span className="ml-2">{item.label}</span>
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-center">Nenhuma página adicional.</p>
          )}
        </div>
      )}

      {/* Main Dock */}
      <nav className="habbo-dock w-full max-w-sm flex justify-around items-center p-3">
        {mainDockItems.map((item) => {
          const isActive = activeItemId === item.id;
          const isElevator = item.id === 'elevator';
          
          let IconDisplay;
          if (item.isAvatar) {
            IconDisplay = (
              <div className="dock-avatar-container">
                <img src="/assets/1360__-3C7.png" alt="Avatar Background" className="dock-avatar-bg" />
                <img src={item.icon as string} alt={item.label} className="dock-avatar-img" />
              </div>
            );
          } else if (typeof item.icon === 'string') {
            IconDisplay = <img src={item.icon} alt={item.label} className="dock-icon-img" />;
          } else {
            IconDisplay = <item.icon className="dock-icon" />;
          }

          return (
            <button
              key={item.id}
              className={`habbo-dock-button ${isActive ? 'active' : ''} ${item.isAvatar ? 'center-avatar' : ''} ${isElevator ? 'elevator' : ''}`}
              onClick={() => handleMainDockItemClick(item)}
            >
              {isElevator && isDropdownOpen ? <X className="dock-icon" /> : IconDisplay}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export { HabboMobileDock };