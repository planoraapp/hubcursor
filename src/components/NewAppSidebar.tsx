
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const menuItems = [
  { title: 'Início', url: '/', icon: '/assets/home.png' },
  { title: 'Console', url: '/console', icon: '/assets/console.png' },
  { title: 'Perfil', url: '/profile/Beebop', icon: '/assets/profile.png' },
  { title: 'Homes', url: '/homes', icon: '/assets/home.png' },
  { title: 'Notícias', url: '/noticias', icon: '/assets/news.png' },
  { title: 'Eventos', url: '/eventos', icon: '/assets/eventos.png' },
  { title: 'Catálogo', url: '/catalogo', icon: '/assets/Carrinho.png' },
  { title: 'Mercado', url: '/mercado', icon: '/assets/mercado.png' },
  { title: 'Emblemas', url: '/emblemas', icon: '/assets/emblemas.png' },
  { title: 'Fórum', url: '/forum', icon: '/assets/news.png' },
  { title: 'Editor', url: '/editor', icon: '/assets/editor.png' },
  { title: 'Marketplace', url: '/marketplace', icon: '/assets/Carrinho.png' },
  { title: 'Ferramentas', url: '/tools', icon: '/assets/ferramentas.png' },
];

export function NewAppSidebar() {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path) 
      ? 'bg-yellow-400 font-bold shadow-lg' 
      : 'hover:bg-yellow-300';

  return (
    <Sidebar
      className="fixed top-0 left-0 h-full bg-[#f5f5dc] border-r-2 border-black shadow-lg z-40 transition-all duration-300 w-64"
      collapsible="icon"
    >
      <div className="p-4">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/assets/habbohub.gif" 
            alt="Habbo Hub" 
            className="h-12 transition-all duration-300"
          />
        </div>

        {/* Collapse Button */}
        <SidebarTrigger asChild>
          <Button className="w-full mb-4 text-black hover:bg-yellow-300">
            <X className="w-4 h-4" />
            <span className="ml-2 habbo-text">Recolher</span>
          </Button>
        </SidebarTrigger>

        <SidebarContent className="space-y-0">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2 mb-6">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.url === '/'}
                        className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 group justify-start ${getNavCls(item.url)}`}
                      >
                        <img
                          src={item.icon}
                          alt={item.title}
                          className="w-4 h-4 mr-3"
                          onError={(e) => {
                            // Fallback para ícone padrão se a imagem não carregar
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="habbo-text text-sm font-medium">
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Login Button */}
        {!isLoggedIn && (
          <NavLink to="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4 habbo-button-blue">
              Conectar Conta Habbo
            </Button>
          </NavLink>
        )}
      </div>
    </Sidebar>
  );
}
