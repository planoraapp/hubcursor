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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, LogOut, User, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CountryFlags } from '@/components/marketplace/CountryFlags';

export function CollapsibleAppSidebar() {
  const location = useLocation();
  const { habboAccount, isLoggedIn, logout } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Verificar se o usuário é admin usando o campo is_admin do banco
  const isAdmin = habboAccount?.is_admin === true;

  // Debug logs
      console.log('🔍 [CollapsibleAppSidebar] Is admin (from DB):', isAdmin);

  const menuItems = [
    { name: 'Início', path: '/', icon: '/assets/home.png' },
    { name: 'Console', path: '/console', icon: '/assets/consoleoff.gif' },
    { name: 'Homes', path: '/homes', icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/home.gif' },
    { name: 'Jornal', path: '/journal', icon: '/assets/news.png' },
    { name: 'Emblemas', path: '/emblemas', icon: '/assets/emblemas.png' },
    { name: 'Catálogo', path: '/catalogo', icon: '/assets/Carrinho.png' },
    { name: 'Ferramentas', path: '/ferramentas', icon: '/assets/ferramentas.png' },
    { name: 'Eventos', path: '/eventos', icon: '/assets/eventos.png' },
    { name: 'Mercado', path: '/mercado', icon: '/assets/Diamante.png' },
  ];

  // Adicionar menu de admin se o usuário for admin
  if (isAdmin) {
    menuItems.push({ 
      name: 'Admin', 
      path: '/admin', 
      icon: '/assets/shield.png' 
    });
  }

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const content = (
      <Link to={item.path} className="flex items-center gap-3 w-full">
        {item.name === 'Admin' ? (
          <Shield className="w-9 h-9 text-yellow-500" />
        ) : (
          <img 
            src={item.icon} 
            alt={item.name}
            className={`flex-shrink-0`}
            style={{ 
              imageRendering: 'pixelated',
              objectFit: 'contain',
              width: 'auto',
              height: 'auto',
              maxWidth: '48px',
              maxHeight: '48px',
              minWidth: '24px',
              minHeight: '24px'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        )}
        {!isCollapsed && (
          <span 
            className="sidebar-font-option-4 text-white"
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              letterSpacing: '0.3px',
              textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
            }}
          >
            {item.name}
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
                className="w-full justify-center px-2 py-2 hover:bg-yellow-200/50 data-[active=true]:bg-yellow-300/70 transition-colors"
              >
                {content}
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <SidebarMenuButton 
        asChild
        isActive={location.pathname === item.path}
        className="w-full justify-start px-3 py-2 hover:bg-yellow-200/50 data-[active=true]:bg-yellow-300/70 transition-colors"
      >
        {content}
      </SidebarMenuButton>
    );
  };

  return (
    <div className="relative">
      <Sidebar className="bg-[#f5f5dc] border-r-2 border-black" collapsible="icon">
        <SidebarHeader className="pt-6 pb-2 px-2">
          <div className="w-full flex justify-center items-center">
            {isCollapsed ? (
              <img 
                src="/assets/hubbeta.gif" 
                alt="Hub" 
                className="w-auto h-auto max-w-full max-h-16"
                style={{ 
                  imageRendering: 'pixelated',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/assets/hub.gif";
                }}
              />
            ) : (
              <img 
                src="/assets/hubbeta.gif" 
                alt="Habbo Hub" 
                className="w-auto h-auto max-w-full max-h-16"
                style={{ 
                  imageRendering: 'pixelated',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/assets/hub.gif";
                }}
              />
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 pt-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <MenuItem item={item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t-2 border-black">
          <div className="space-y-2">
                         {isLoggedIn && habboAccount ? (
               <div className={`${isCollapsed ? 'px-1 text-center' : 'text-left'}`}>
                 <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-3'} mb-2`}>
                   <img
                    src={habboAccount.figure_string ? `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${habboAccount.figure_string}&size=m&direction=2&head_direction=3&headonly=1` : `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&size=m&direction=2&head_direction=3&headonly=1`}
                    alt={`Avatar de ${habboAccount.habbo_name}`}
                     className={`w-16 h-16`}
                     style={{ 
                       imageRendering: 'pixelated',
                       objectFit: 'contain'
                     }}
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${habboAccount.habbo_name}&size=m&direction=2&head_direction=3&headonly=1`;
                     }}
                   />
                    {!isCollapsed && (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <CountryFlags hotelId={habboAccount.hotel || 'br'} className="w-3 h-4" />
                          <span 
                            className="sidebar-font-option-4 text-white truncate"
                            style={{
                              fontSize: '16px',
                              fontWeight: 'bold',
                              letterSpacing: '0.3px',
                              textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                            }}
                          >
                            {habboAccount.habbo_name}
                          </span>
                        </div>
                      </div>
                    )}
                 </div>
                {!isCollapsed && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={logout}
                          className="bg-red-600 hover:bg-red-700 w-full px-3 py-1.5 text-white rounded transition-colors flex items-center justify-center gap-2 sidebar-font-option-4"
                          style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            letterSpacing: '0.3px',
                            textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                          }}
                        >
                          <img 
                            src="/assets/logout.png" 
                            alt="Logout" 
                            className="w-3 h-3"
                            style={{ 
                              imageRendering: 'pixelated',
                              objectFit: 'contain'
                            }}
                          />
                          Sair
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Desconectar conta Habbo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {!isCollapsed ? (
                  <Link to="/login" className="block">
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 w-full px-3 py-2 text-white rounded transition-colors flex items-center justify-center gap-2 sidebar-font-option-4"
                      style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        letterSpacing: '0.3px',
                        textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                      }}
                    >
                      <User className="w-3 h-3" />
                      Conectar Conta Habbo
                    </button>
                  </Link>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/login">
                          <button className="bg-blue-600 hover:bg-blue-700 w-full p-3 text-white rounded transition-colors flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Fazer Login</p>
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
        className="absolute top-24 -right-3 z-50 w-6 h-8 bg-[#f5f5dc] border-r-2 border-black border-l-0 rounded-r-md hover:bg-yellow-200/70 transition-colors flex items-center justify-center"
        style={{ boxShadow: '2px 0 4px rgba(0,0,0,0.1)' }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-[#8B4513]" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-[#8B4513]" />
        )}
      </button>
    </div>
  );
}