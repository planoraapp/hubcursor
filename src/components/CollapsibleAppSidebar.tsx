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
import { ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CountryFlags } from '@/components/marketplace/CountryFlags';

export function CollapsibleAppSidebar() {
  const location = useLocation();
  const { habboAccount, isLoggedIn, logout } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Verificar se o usuário é admin usando o campo is_admin do banco
  const isAdmin = habboAccount?.is_admin === true;

  // Debug temporário para verificar status de admin// Função para remover acentos para compatibilidade com fonte Volter
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

  const menuItems = [
    { name: 'Inicio', path: '/', icon: '/assets/home.png' },
    { name: 'Console', path: '/console', icon: '/assets/consoleoff.gif' },
    { name: 'Homes', path: '/homes', icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/home.gif' },
    { name: 'Jornal', path: '/journal', icon: '/assets/news.png' },
    { name: 'Ferramentas', path: '/ferramentas', icon: '/assets/ferramentas.png' },
  ];

  // Adicionar menu de admin se o usuário for admin
  if (isAdmin) {
    menuItems.push({ 
      name: 'Admin', 
      path: '/admin', 
      icon: '/assets/1044__-IT.png' 
    });
  }

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const content = (
      <Link to={item.path} className="flex items-center gap-2 w-full min-h-[48px]">
        <div className="flex-shrink-0 flex items-center justify-center w-12">
          <img 
            src={item.icon} 
            alt={item.name}
            className="object-contain"
            style={{ 
              imageRendering: 'pixelated',
              width: 'auto',
              height: 'auto',
              maxWidth: '48px',
              maxHeight: '48px'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        {!isCollapsed && (
          <span 
            className="text-white flex-1 flex items-center"
            style={{
              fontFamily: 'Volter',
              fontSize: '16px',
              fontWeight: 'bold',
              letterSpacing: '0.3px',
              textShadow: '-1.5px 0 black, 0 1.5px black, 1.5px 0 black, 0 -1.5px black',
              lineHeight: '1.2',
              paddingLeft: '2px'
            }}
          >
            {removeAccents(item.name)}
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
                className="w-full justify-center px-2 py-3 hover:bg-yellow-200/50 data-[active=true]:bg-yellow-300/70 transition-colors min-h-[48px]"
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
        className="w-full justify-start px-3 py-3 hover:bg-yellow-200/50 data-[active=true]:bg-yellow-300/70 transition-colors min-h-[48px]"
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
                src="/assets/hub.gif" 
                alt="Hub" 
                className="w-auto h-auto max-w-full max-h-16"
                style={{ 
                  imageRendering: 'pixelated',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/assets/hubbeta.gif";
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

        <SidebarFooter className="p-4 border-t-2 border-black">
          <div className="space-y-2">
            {isLoggedIn && habboAccount ? (
              <div className={`${isCollapsed ? 'px-1 text-center' : 'text-left'}`}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-3'} mb-3`}>
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                    <img
                      src={habboAccount.figure_string ? `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${habboAccount.figure_string}&size=m&direction=2&head_direction=3&headonly=1` : `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&size=m&direction=2&head_direction=3&headonly=1`}
                      alt={`Avatar de ${habboAccount.habbo_name}`}
                      className="w-16 h-16 object-contain"
                      style={{ 
                        imageRendering: 'pixelated',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = habboAccount.figure_string 
                          ? `https://habbo-imaging.s3.amazonaws.com/avatarimage?figure=${habboAccount.figure_string}&size=m&direction=2&head_direction=3&headonly=1`
                          : `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${habboAccount.habbo_name}&size=m&direction=2&head_direction=3&headonly=1`;
                      }}
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <CountryFlags hotelId={habboAccount.hotel || 'br'} className="w-3 h-4 flex-shrink-0" />
                        <span 
                          className="text-white truncate"
                          style={{
                            fontFamily: 'Volter',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            letterSpacing: '0.3px',
                            textShadow: '-1.5px 0 black, 0 1.5px black, 1.5px 0 black, 0 -1.5px black',
                            lineHeight: '1.2',
                            paddingLeft: '2px'
                          }}
                        >
                          {removeAccents(habboAccount.habbo_name)}
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
                          className="bg-red-600 hover:bg-red-700 w-full px-3 py-2 text-white rounded transition-colors flex items-center justify-center gap-2 min-h-[40px]"
                          style={{
                            fontFamily: 'Volter',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            letterSpacing: '0.3px',
                            textShadow: '-1.5px 0 black, 0 1.5px black, 1.5px 0 black, 0 -1.5px black'
                          }}
                        >
                          <img 
                            src="/assets/logout.png" 
                            alt="Logout" 
                            className="w-4 h-4 flex-shrink-0"
                            style={{ 
                              imageRendering: 'pixelated',
                              objectFit: 'contain'
                            }}
                          />
                          <span>{removeAccents('Sair')}</span>
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
                      className="bg-blue-600 hover:bg-blue-700 w-full px-3 py-2 text-white rounded transition-colors flex items-center justify-center gap-2"
                      style={{
                        fontFamily: 'Volter',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        letterSpacing: '0.3px',
                        textShadow: '-1.5px 0 black, 0 1.5px black, 1.5px 0 black, 0 -1.5px black'
                      }}
                    >
                      <User className="w-3 h-3" />
                      {removeAccents('Conectar Conta Habbo')}
                    </button>
                  </Link>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/login">
                          <button className="bg-blue-600 hover:bg-blue-700 w-full p-3 text-white rounded transition-colors flex items-center justify-center"
                            style={{
                              fontFamily: 'Volter',
                              fontWeight: 'bold',
                              textShadow: '-1.5px 0 black, 0 1.5px black, 1.5px 0 black, 0 -1.5px black'
                            }}
                          >
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
