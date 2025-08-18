
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  User,
  Calendar,
  ShoppingBag,
  MessageSquare,
  Crown,
  Building,
  Settings,
  Users,
  Trophy,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const navigationItems = [
  { title: "Início", url: "/", icon: Home },
  { title: "Console", url: "/console", icon: LayoutDashboard },
  { title: "Catálogo", url: "/catalogo", icon: ShoppingBag },
  { title: "Eventos", url: "/eventos", icon: Calendar },
  { title: "Mercado", url: "/mercado", icon: Building },
  { title: "Emblemas", url: "/emblemas", icon: Crown },
  { title: "Homes", url: "/homes", icon: Home },
  { title: "Forum", url: "/forum", icon: MessageSquare },
  { title: "Ranking", url: "/tops", icon: Trophy },
  { title: "Comunidade", url: "/comunidade", icon: Users },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function NewAppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { habboAccount } = useUnifiedAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (active: boolean) =>
    active 
      ? "bg-[#D4B896] text-[#8B4513] font-semibold border-l-4 border-[#8B4513]" 
      : "text-[#8B4513] hover:bg-[#E6D2B3] hover:text-[#654321]";

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r bg-[#F5E6D3] border-[#D4B896]"
      style={{ backgroundColor: '#F5E6D3' }}
    >
      <SidebarHeader className="bg-[#F5E6D3] border-b border-[#D4B896]">
        <div className="flex items-center gap-2 px-2 py-2">
          {state !== "collapsed" && (
            <div className="flex items-center gap-2">
              <img 
                src="/assets/LogoHabbo.png" 
                alt="HabboHub" 
                className="w-8 h-8"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzAwN0FGRiIvPgo8dGV4dCB4PSIxNiIgeT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj5ISDwvdGV4dD4KPC9zdmc+'
                }}
              />
              <span className="font-semibold text-[#8B4513] volter-font">HabboHub</span>
            </div>
          )}
          {state === "collapsed" && (
            <img 
              src="/hub.gif" 
              alt="HH" 
              className="w-8 h-8 mx-auto"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const target = e.currentTarget;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzAwN0FGRiIvPgo8dGV4dCB4PSIxNiIgeT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj5ISDwvdGV4dD4KPC9zdmc+'
              }}
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#F5E6D3]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(isActive(item.url))}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span className="volter-font">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {habboAccount && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`/home/${habboAccount.habbo_name}`} 
                      className={getNavCls(isActive(`/home/${habboAccount.habbo_name}`))}
                    >
                      <User className="h-4 w-4" />
                      {state !== "collapsed" && <span className="volter-font">Meu Perfil</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {habboAccount && state !== "collapsed" && (
        <div className="mt-auto p-4 border-t border-[#D4B896] bg-[#F5E6D3]">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 border-2 border-[#D4B896]">
              <AvatarImage src={`https://www.habbo.com.br/habbo-imaging/avatarimage?size=s&user=${habboAccount.habbo_name}&action=wav&direction=2&head_direction=2&gesture=sml`} />
              <AvatarFallback className="bg-[#D4B896] text-[#8B4513]">{habboAccount.habbo_name[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#8B4513] truncate volter-font">
                {habboAccount.habbo_name}
              </p>
              <p className="text-xs text-[#8B4513]/70 volter-font">Habbo Membro</p>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
