
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Settings,
  User,
  Newspaper,
  Gamepad2,
  ShoppingBag,
  MessageSquare,
  Image,
  Cog,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const mainItems = [
  { title: "Início", url: "/", icon: Home },
  { title: "Console", url: "/console", icon: LayoutDashboard },
  { title: "Notícias", url: "/noticias", icon: Newspaper },
  { title: "Eventos", url: "/eventos", icon: Gamepad2 },
];

const communityItems = [
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "Fórum", url: "/forum", icon: MessageSquare },
  { title: "Emblemas", url: "/emblemas", icon: Image },
];

const toolsItems = [
  { title: "Ferramentas", url: "/ferramentas", icon: Cog },
  { title: "Catálogo", url: "/catalogo", icon: LayoutDashboard },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { habboAccount } = useUnifiedAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = (active: boolean) =>
    active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          {state !== "collapsed" && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HH</span>
              </div>
              <span className="font-semibold text-sidebar-foreground">Habbo Hub</span>
            </div>
          )}
          {state === "collapsed" && (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">HH</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(isActive(item.url))}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Comunidade</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(isActive(item.url))}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(isActive(item.url))}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {habboAccount && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Minha Conta</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/profile/${habboAccount.habbo_name}`} 
                        className={getNavCls(isActive(`/profile/${habboAccount.habbo_name}`))}
                      >
                        <User className="h-4 w-4" />
                        {state !== "collapsed" && <span>Meu Perfil</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {habboAccount && state !== "collapsed" && (
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={`https://www.habbo.com.br/habbo-imaging/avatarimage?size=s&user=${habboAccount.habbo_name}&action=wav&direction=2&head_direction=2&gesture=sml`} />
              <AvatarFallback>{habboAccount.habbo_name[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {habboAccount.habbo_name}
              </p>
              <p className="text-xs text-sidebar-foreground/70">Habbo Membro</p>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
