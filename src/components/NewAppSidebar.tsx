
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
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

export function NewAppSidebar() {
  const location = useLocation();
  const { habboAccount, isLoggedIn, logout } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const menuItems = [
    { name: 'Início', path: '/', icon: '/assets/home.png' },
    { name: 'Console', path: '/console', icon: '/assets/consoleoff.gif' },
    { name: 'Homes', path: '/homes', icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/home.gif' },
    { name: 'Jornal', path: '/journal', icon: '/assets/news.png' },
    { name: 'Ferramentas', path: '/ferramentas', icon: '/assets/ferramentas.png' },
  ];

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const content = (
      <Link to={item.path} className="flex items-center gap-3 w-full">
        <img 
          src={item.icon} 
          alt={item.name}
          className={`flex-shrink-0`}
          style={{
            imageRendering: 'pixelated',
            objectFit: 'contain',
            width: 'auto',
            height: 'auto',
            maxWidth: isCollapsed ? '40px' : '24px',
            maxHeight: isCollapsed ? '40px' : '24px',
            minWidth: isCollapsed ? '20px' : '16px',
            minHeight: isCollapsed ? '20px' : '16px'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {!isCollapsed && (
          <span className="habbo-text text-sm font-bold text-[#8B4513]">
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
                className="w-full justify-center px-3 py-3 hover:bg-yellow-200/50 data-[active=true]:bg-yellow-300/70 transition-colors"
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
        <SidebarHeader className="p-4">
          <div className="w-full flex justify-center">
            {isCollapsed ? (
              <img 
                src="/assets/hub.gif" 
                alt="Hub" 
                className="w-12 h-12"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/assets/hub.png";
                }}
              />
            ) : (
              <img 
                src="/assets/bghabbohub.png" 
                alt="Habbo Hub" 
                className="w-full h-auto max-w-[200px]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/assets/habbohub.png";
                }}
              />
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2">
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
              <div className={`text-center ${isCollapsed ? 'px-1' : ''}`}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-2'} mb-2`}>
                  <img
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`}
                    alt={`Avatar de ${habboAccount.habbo_name}`}
                    className={`object-contain ${isCollapsed ? 'w-12 h-12' : 'w-8 h-8'}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${habboAccount.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`;
                    }}
                  />
                  {!isCollapsed && (
                    <span className="habbo-text text-sm font-bold text-[#8B4513] truncate">
                      {habboAccount.habbo_name}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={logout}
                          className="bg-red-600 hover:bg-red-700 w-full px-3 py-1.5 text-xs font-bold text-white rounded transition-colors flex items-center justify-center gap-2"
                        >
                          <img 
                            src="/assets/logout.png" 
                            alt="Logout" 
                            className="w-7 h-7"
                            style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
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
              !isCollapsed && (
                <Link to="/login" className="block">
                  <button className="habbo-button-blue w-full px-3 py-2 text-sm font-bold text-white rounded">
                    Conectar Conta Habbo
                  </button>
                </Link>
              )
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      <button
        onClick={toggleSidebar}
        className="absolute top-20 -right-3 z-50 w-6 h-8 bg-[#f5f5dc] border-2 border-black border-l-0 rounded-r-md hover:bg-yellow-200/70 transition-colors flex items-center justify-center"
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

