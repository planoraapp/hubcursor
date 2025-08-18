
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Home,
  Users,
  ShoppingCart,
  Calendar,
  MessageSquare,
  User,
  Edit,
  Camera,
  Trophy,
  Newspaper,
  Monitor,
  Wrench
} from 'lucide-react';

const menuItems = [
  { title: 'Início', url: '/', icon: Home },
  { title: 'Console', url: '/console', icon: Monitor },
  { title: 'Perfil', url: '/profile/Beebop', icon: User },
  { title: 'Homes', url: '/homes', icon: Camera },
  { title: 'Notícias', url: '/noticias', icon: Newspaper },
  { title: 'Eventos', url: '/eventos', icon: Calendar },
  { title: 'Catálogo', url: '/catalogo', icon: ShoppingCart },
  { title: 'Mercado', url: '/mercado', icon: Users },
  { title: 'Emblemas', url: '/emblemas', icon: Trophy },
  { title: 'Fórum', url: '/forum', icon: MessageSquare },
  { title: 'Editor', url: '/editor', icon: Edit },
  { title: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
  { title: 'Ferramentas', url: '/tools', icon: Wrench },
];

export function NewAppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path) ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted/50';

  return (
    <Sidebar
      className="w-60 border-r-2 border-black bg-white/95 backdrop-blur-sm"
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end border-2 border-black" />

      <SidebarContent className="scrollbar-hide">
        <SidebarGroup>
          <SidebarGroupLabel className="volter-font text-lg font-bold text-gray-800">
            HabboHub
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getNavCls(item.url)} volter-font`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
