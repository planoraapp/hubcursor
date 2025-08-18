
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
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

export function NewAppSidebar() {
  const location = useLocation();
  const { habboAccount, isLoggedIn } = useAuth();

  const menuItems = [
    { name: 'Início', path: '/', icon: '/assets/home.png' },
    { name: 'Console', path: '/console', icon: '/assets/console.png' },
    { name: 'Homes', path: '/homes', icon: '/assets/home.png' },
    { name: 'Notícias', path: '/noticias', icon: '/assets/news.png' },
    { name: 'Emblemas', path: '/emblemas', icon: '/assets/badges.png' },
    { name: 'Catálogo', path: '/catalogo', icon: '/assets/catalog.png' },
    { name: 'Ferramentas', path: '/ferramentas', icon: '/assets/tools.png' },
    { name: 'Eventos', path: '/eventos', icon: '/assets/events.png' },
    { name: 'Mercado', path: '/mercado', icon: '/assets/market.png' },
  ];

  return (
    <Sidebar className="bg-[#f5f5dc] border-r-2 border-black">
      <SidebarHeader className="p-4">
        <div className="w-full">
          <img 
            src="/assets/habbohub.gif" 
            alt="Habbo Hub" 
            className="w-full h-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/assets/habbohub.png";
            }}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.path}
                    className="w-full justify-start px-3 py-2 hover:bg-yellow-200/50 data-[active=true]:bg-yellow-300/70 transition-colors"
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <img 
                        src={item.icon} 
                        alt={item.name}
                        className="w-4 h-4 flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <span className="habbo-text text-sm font-bold text-[#8B4513]">
                        {item.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t-2 border-black">
        <div className="space-y-2">
          {isLoggedIn && habboAccount ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <img
                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`}
                  alt={`Avatar de ${habboAccount.habbo_name}`}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${habboAccount.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`;
                  }}
                />
                <span className="habbo-text text-sm font-bold text-[#8B4513]">
                  {habboAccount.habbo_name}
                </span>
              </div>
              <Link to="/profile" className="block">
                <button className="habbo-button-blue w-full px-3 py-1.5 text-xs font-bold text-white rounded">
                  Meu Perfil
                </button>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="block">
              <button className="habbo-button-blue w-full px-3 py-2 text-sm font-bold text-white rounded">
                Conectar Conta Habbo
              </button>
            </Link>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
