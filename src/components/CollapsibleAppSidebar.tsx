import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
import { useChatNotifications } from '@/contexts/ChatNotificationContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { HabboUserPanel } from '@/components/HabboUserPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

function CollapsibleAppSidebarComponent() {
  const location = useLocation();
  const { habboAccount, isLoggedIn } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const { hasNotifications, unreadCount } = useChatNotifications();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { toast } = useToast();
  
  const isMobileViewport = useIsMobile();
  const [isHeaderHidden, setIsHeaderHidden] = React.useState(false);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    if (!isMobileViewport) {
      setIsHeaderHidden(false);
      return;
    }

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY <= 24) {
        setIsHeaderHidden(false);
      } else if (delta > 4) {
        setIsHeaderHidden(true);
      } else if (delta < -6) {
        setIsHeaderHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileViewport]);

  const isAdmin = habboAccount?.habbo_name?.toLowerCase() === 'habbohub' && habboAccount?.is_admin === true;

  // Detectar se há modais abertos
  const [hasModalOpen, setHasModalOpen] = React.useState(false);

  React.useEffect(() => {
    const checkForModals = () => {
      // Verificar se há DialogOverlay ou DialogContent com data-state="open"
      // Radix UI usa diferentes seletores
      const dialogOverlays = document.querySelectorAll('[role="dialog"][data-state="open"], [data-radix-dialog-overlay][data-state="open"]');
      const dialogContents = document.querySelectorAll('[data-radix-dialog-content][data-state="open"]');
      // Também verificar por elementos com z-50 que são tipicamente modais
      const modalElements = document.querySelectorAll('[data-state="open"][class*="z-50"]');
      const hasOpen = dialogOverlays.length > 0 || dialogContents.length > 0 || modalElements.length > 0;
      setHasModalOpen(hasOpen);
    };

    // Verificar inicialmente
    checkForModals();

    // Observar mudanças no DOM para detectar modais abertos/fechados
    const observer = new MutationObserver(checkForModals);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state', 'role']
    });

    // Também verificar periodicamente para garantir detecção
    const interval = setInterval(checkForModals, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const removeAccents = (text: string) => {
    return text
      .replace(/[áàâã]/g, 'a')
      .replace(/[éê]/g, 'e')
      .replace(/[í]/g, 'i')
      .replace(/[óôõ]/g, 'o')
      .replace(/[ú]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ÁÀÂÃ]/g, 'A')
      .replace(/[ÉÊ]/g, 'E')
      .replace(/[Í]/g, 'I')
      .replace(/[ÓÔÕ]/g, 'O')
      .replace(/[Ú]/g, 'U')
      .replace(/[Ç]/g, 'C');
  };

  const handleLanguageChange = (newLanguage: 'pt' | 'en' | 'es') => {
    if (newLanguage !== language) {
      setLanguage(newLanguage);
      
      // Nomes dos idiomas traduzidos em cada idioma
      const languageNames: Record<string, Record<string, string>> = {
        'pt': {
          'pt': 'Português',
          'en': 'Inglês',
          'es': 'Espanhol'
        },
        'en': {
          'pt': 'Portuguese',
          'en': 'English',
          'es': 'Spanish'
        },
        'es': {
          'pt': 'Portugués',
          'en': 'Inglés',
          'es': 'Español'
        }
      };
      
      // Usar o novo idioma para a tradução
      const tempT = (key: string, params?: Record<string, string | number>) => {
        const translations: Record<string, Record<string, string>> = {
          'pt': {
            'toast.languageChanged': 'Idioma alterado',
            'toast.languageChangedTo': 'O idioma foi alterado para {language}'
          },
          'en': {
            'toast.languageChanged': 'Language changed',
            'toast.languageChangedTo': 'Language has been changed to {language}'
          },
          'es': {
            'toast.languageChanged': 'Idioma cambiado',
            'toast.languageChangedTo': 'El idioma ha sido cambiado a {language}'
          }
        };
        
        let text = translations[newLanguage]?.[key] || key;
        if (params) {
          Object.entries(params).forEach(([paramKey, paramValue]) => {
            text = text.replace(`{${paramKey}}`, String(paramValue));
          });
        }
        return text;
      };
      
      toast({
        title: `✅ ${tempT('toast.languageChanged')}`,
        description: tempT('toast.languageChangedTo', { language: languageNames[newLanguage][newLanguage] }),
      });
    }
  };

  // Calcular ícone do console baseado no estado de notificações
  const consoleIcon = React.useMemo(() => {
    const iconPath = hasNotifications 
      ? '/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png' 
      : '/assets/console/consoleoff.gif';
    return iconPath;
  }, [hasNotifications, unreadCount]);

  const menuItems = [
    { nameKey: 'nav.home', path: '/', icon: '/assets/buttons/homebutton.png' },
    { 
      nameKey: 'nav.console', 
      path: '/console', 
      icon: consoleIcon
    },
    { nameKey: 'nav.homes', path: '/homes', icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/home.gif' },
    { nameKey: 'nav.journal', path: '/journal', icon: '/assets/journal/news.png' },
    { nameKey: 'nav.tools', path: '/ferramentas', icon: '/assets/ferramentas.png' },
  ];

  if (isAdmin) {
    menuItems.push({
      nameKey: 'nav.admin',
      path: '/admin',
      icon: '/assets/1044__-IT.png',
    });
  }

  const dockItems = menuItems.slice(0, 5);

  const handleIconError = React.useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    const current = target.src || '';

    if (target.hasAttribute('data-fallback-attempted')) {
      return;
    }

    let fallback = '';
    if (current.includes('/assets/buttons/homebutton.png')) {
      fallback = '/assets/homebutton.png';
    } else if (current.includes('/assets/console/consoleoff.gif')) {
      fallback = '/assets/consoleoff.gif';
    } else if (current.includes('/assets/journal/news.png')) {
      fallback = '/assets/news.png';
    } else if (current.includes('/assets/ferramentas.png')) {
      fallback = '/assets/ferramentas.png';
    } else if (current.includes('/assets/1044__-IT.png')) {
      fallback = '/placeholder.svg';
    }

    target.setAttribute('data-fallback-attempted', 'true');

    if (fallback) {
      target.src = fallback;
    }
  }, []);

  const getIsActive = React.useCallback(
    (path: string) => {
      if (path === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  const userHeadSrc = React.useMemo(() => {
    if (!habboAccount?.habbo_name) {
      return '';
    }

    const username = encodeURIComponent(habboAccount.habbo_name);
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${username}&size=l&direction=2&head_direction=3&headonly=1`;
  }, [habboAccount?.habbo_name]);

  const userFullFigureSrc = React.useMemo(() => {
    if (!habboAccount?.habbo_name) {
      return '';
    }

    const username = encodeURIComponent(habboAccount.habbo_name);
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${username}&size=m&direction=4&head_direction=4&gesture=sml`;
  }, [habboAccount?.habbo_name]);

  const MobileHeader = () => (
    <header
      className={`fixed inset-x-0 top-0 z-50 md:hidden border-b-2 border-black bg-[#f5f5dc] overflow-hidden transition-transform duration-200 ease-out ${isHeaderHidden ? '-translate-y-full' : 'translate-y-0'}`}
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 0px)',
      }}
    >
      <div className="relative flex items-center justify-between px-4 py-1.5">
        <Link to="/" className="flex items-center">
          <img
            src="/assets/hubbeta.gif"
            alt="Habbo Hub"
            className="h-12 w-auto"
            style={{
              imageRendering: 'pixelated',
              objectFit: 'contain',
            }}
            onError={(event) => {
              const target = event.currentTarget as HTMLImageElement;
              target.src = '/assets/hubbeta.gif';
            }}
          />
        </Link>

        <div className="h-11 w-11" aria-hidden="true" />

        {isLoggedIn && habboAccount ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="absolute right-4 bottom-[-6px] flex h-20 w-16 items-end justify-center overflow-hidden bg-transparent p-0 transition-transform hover:scale-105"
                aria-label={removeAccents(t('sidebar.userPanel.settings'))}
              >
                <img
                  src={userFullFigureSrc}
                  alt={habboAccount.habbo_name}
                  className="object-contain"
                  style={{
                    imageRendering: 'pixelated',
                    width: 'auto',
                    height: 'auto',
                    transform: 'translateY(12px)',
                  }}
                  onError={(event) => {
                    const target = event.currentTarget as HTMLImageElement;
                    target.src = userHeadSrc || '/assets/habbouserhead.png';
                  }}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={0}
              className="w-[min(20rem,calc(100vw-1.5rem))] max-h-[80vh] overflow-y-auto border-2 border-black border-t-0 bg-[#f5f5dc] p-2 shadow-xl"
            >
              <HabboUserPanel />
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/login" className="inline-flex">
            <button
              className="flex items-center gap-2 rounded border-2 border-black bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700"
              style={{
                fontFamily: 'Volter',
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '0.3px',
              }}
            >
              <User className="h-4 w-4" />
              {removeAccents(t('nav.login'))}
            </button>
          </Link>
        )}
      </div>
    </header>
  );

  const MobileDock = () => (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 md:hidden border-t-2 border-black bg-[#f5f5dc]"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
      }}
    >
      <div className="flex items-stretch justify-between">
        {dockItems.map((item) => {
          const translatedName = removeAccents(t(item.nameKey));
          const isActive = getIsActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-1 flex-col items-center justify-center px-1 py-1 transition-colors ${
                isActive ? 'bg-yellow-300/70' : 'hover:bg-yellow-200/60'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center">
                <img
                  src={item.icon}
                  alt={translatedName}
                  className="object-contain"
                  style={{
                    imageRendering: 'pixelated',
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '48px',
                    maxHeight: '48px',
                  }}
                  onError={handleIconError}
                />
              </div>
              <span
                className="mt-1 text-center text-xs font-bold text-black leading-none"
                style={{
                  fontFamily: 'Volter',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}
              >
                {translatedName}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const translatedName = t(item.nameKey);
    const content = (
      <Link to={item.path} className="flex w-full min-h-[48px] items-center gap-2">
        <div className="flex w-12 flex-shrink-0 items-center justify-center">
          <img
            src={item.icon}
            alt={translatedName}
            className="object-contain"
            style={{
              imageRendering: 'pixelated',
              width: 'auto',
              height: 'auto',
              maxWidth: '48px',
              maxHeight: '48px',
            }}
            onError={handleIconError}
          />
        </div>
        {!isCollapsed && (
          <span
            className="flex flex-1 items-center text-white"
            style={{
              fontFamily: 'Volter',
              fontSize: '16px',
              fontWeight: 'bold',
              letterSpacing: '0.3px',
              textShadow: '-1.5px 0 black, 0 1.5px black, 1.5px 0 black, 0 -1.5px black',
              lineHeight: '1.2',
              paddingLeft: '2px',
            }}
          >
            {removeAccents(translatedName)}
          </span>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.path}
                className="w-full justify-center px-2 py-3 transition-colors hover:bg-yellow-200/50 data-[active=true]:bg-yellow-300/70 min-h-[48px]"
              >
                {content}
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{translatedName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <SidebarMenuButton
        asChild
        isActive={location.pathname === item.path}
        className="w-full justify-start px-3 py-3 transition-colors hover:bg-yellow-200/50 data-[active=true]:bg-yellow-300/70 min-h-[48px]"
      >
        {content}
      </SidebarMenuButton>
    );
  };

  if (isMobileViewport) {
    return (
      <>
        <MobileHeader />
        <MobileDock />
      </>
    );
  }

  return (
    <div className="relative">
      <Sidebar className="bg-[#f5f5dc] border-r-2 border-black" collapsible="icon">
        <SidebarHeader className="px-2 pt-6 pb-2">
          <div className="flex flex-col gap-2">
            <div className="flex w-full items-center justify-center">
              {isCollapsed ? (
                <img
                  src="/assets/hub.gif"
                  alt="Hub"
                  className="h-auto max-h-16 w-auto max-w-full"
                  style={{
                    imageRendering: 'pixelated',
                    objectFit: 'contain',
                  }}
                  onError={(event) => {
                    const target = event.currentTarget as HTMLImageElement;
                    target.src = '/assets/hub.gif';
                  }}
                />
              ) : (
                <img
                  src="/assets/hubbeta.gif"
                  alt="Habbo Hub"
                  className="h-auto w-auto"
                  style={{
                    imageRendering: 'pixelated',
                    objectFit: 'contain',
                    maxHeight: '3.6rem',
                  }}
                  onError={(event) => {
                    const target = event.currentTarget as HTMLImageElement;
                    target.src = '/assets/hubbeta.gif';
                  }}
                />
              )}
            </div>
            
            {/* Seleção de Idioma */}
            {!isCollapsed && (
              <div className="flex gap-2 justify-center items-center">
                <button
                  onClick={() => handleLanguageChange('pt')}
                  className={`rounded transition-all ${
                    language === 'pt' 
                      ? 'bg-yellow-300/70' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title="Português"
                >
                  <img 
                    src="/flags/flagbrazil.png" 
                    alt="Português" 
                    className="w-auto object-contain"
                    style={{ imageRendering: 'pixelated', height: 'auto', maxHeight: 'none', background: 'transparent' }}
                  />
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`rounded transition-all ${
                    language === 'en' 
                      ? 'bg-yellow-300/70' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title="English"
                >
                  <img 
                    src="/flags/flagcom.png" 
                    alt="English" 
                    className="w-auto object-contain"
                    style={{ imageRendering: 'pixelated', height: 'auto', maxHeight: 'none', background: 'transparent' }}
                  />
                </button>
                <button
                  onClick={() => handleLanguageChange('es')}
                  className={`rounded transition-all ${
                    language === 'es' 
                      ? 'bg-yellow-300/70' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title="Español"
                >
                  <img 
                    src="/flags/flagspain.png" 
                    alt="Español" 
                    className="w-auto object-contain"
                    style={{ imageRendering: 'pixelated', height: 'auto', maxHeight: 'none', background: 'transparent' }}
                  />
                </button>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 pt-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <MenuItem item={item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className={`${isCollapsed ? 'p-1 gap-0' : 'p-3.5 gap-2'}`}>
          <div className={isCollapsed ? 'space-y-0' : 'space-y-2.5'}>
            {isLoggedIn && habboAccount ? (
              <HabboUserPanel sidebarCollapsed={isCollapsed} onExpandSidebar={toggleSidebar} />
            ) : (
              <div className="space-y-2">
                {!isCollapsed ? (
                  <Link to="/login" className="block">
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700"
                      style={{
                        fontFamily: 'Volter',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        letterSpacing: '0.3px',
                        textShadow: '-1.5px 0 black, 0 1.5px black, 1.5px 0 black, 0 -1.5px black',
                      }}
                    >
                      <User className="h-3 w-3" />
                      {removeAccents(t('nav.login'))}
                    </button>
                  </Link>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/login">
                          <button
                            className="flex w-full items-center justify-center rounded bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700"
                            style={{
                              fontFamily: 'Volter',
                              fontWeight: 'bold',
                              textShadow: '-1.5px 0 black, 0 1.5px black, 1.5px 0 black, 0 -1.5px black',
                            }}
                          >
                            <User className="h-4 w-4" />
                          </button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{t('nav.login')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      <button
        onClick={toggleSidebar}
        className="hidden md:flex fixed top-24 z-[60] h-8 w-6 items-center justify-center rounded-r-md border-l-0 border-r-2 border-black bg-[#f5f5dc] transition-all duration-200 hover:bg-yellow-200/70"
        style={{ 
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
          left: isCollapsed ? 'calc(6rem - 12px)' : 'calc(16rem - 12px)',
          opacity: hasModalOpen ? 0.3 : 1,
          pointerEvents: hasModalOpen ? 'none' : 'auto'
        }}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3 text-[#8B4513]" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-[#8B4513]" />
        )}
      </button>
    </div>
  );
}

// Removido React.memo para garantir que atualizações do contexto sejam refletidas imediatamente
export const CollapsibleAppSidebar = CollapsibleAppSidebarComponent;
CollapsibleAppSidebar.displayName = 'CollapsibleAppSidebar';
