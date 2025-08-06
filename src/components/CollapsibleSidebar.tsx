
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  Newspaper,
  Gamepad2,
  ShoppingBag,
  MessageSquare,
  Image,
  Cog,
  LayoutDashboard,
  User,
  Settings,
  DoorOpen,
  Menu,
  X
} from "lucide-react";
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CollapsibleSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, href, isActive, isCollapsed }) => (
  <Link 
    to={href} 
    className={`
      flex items-center px-3 py-2 rounded-md transition-all duration-200 group
      ${isActive 
        ? 'bg-yellow-400 text-black font-bold shadow-lg' 
        : 'text-black hover:bg-yellow-300 hover:text-black'
      }
      ${isCollapsed ? 'justify-center' : 'justify-start'}
    `}
  >
    <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} />
    {!isCollapsed && (
      <span className="text-sm font-medium">{label}</span>
    )}
  </Link>
);

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({ activeSection, setActiveSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, habboAccount, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const shouldCollapse = window.innerWidth < 768;
      if (shouldCollapse) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const event = new CustomEvent('sidebarStateChange', { detail: { isCollapsed } });
    window.dispatchEvent(event);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Sucesso",
        description: "Logout realizado com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || 'Erro ao fazer logout',
        variant: "destructive"
      });
    }
  };

  const navItems = [
    { icon: Home, label: "Início", href: "/" },
    { icon: Home, label: "Homes", href: "/homes" },
    { icon: Newspaper, label: "Notícias", href: "/noticias" },
    { icon: Gamepad2, label: "Eventos", href: "/eventos" },
    { icon: ShoppingBag, label: "Marketplace", href: "/marketplace" },
    { icon: MessageSquare, label: "Fórum", href: "/forum" },
    { icon: Image, label: "Emblemas", href: "/emblemas" },
    { icon: Cog, label: "Ferramentas", href: "/ferramentas" },
    { icon: LayoutDashboard, label: "Catálogo", href: "/catalogo" },
  ];

  const userItems = user ? [
    { icon: User, label: "Meu Perfil", href: `/profile/${habboAccount?.habbo_name}` },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
  ] : [];

  // Mobile view
  if (window.innerWidth < 768) {
    return (
      <>
        {/* Mobile toggle button */}
        <Button
          variant="ghost"
          className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-sm"
          onClick={toggleMobileSidebar}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Mobile sidebar overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div
          className={`
            fixed top-0 left-0 h-full w-64 bg-[#f5f5dc] border-r-2 border-black z-50 transform transition-transform duration-300 md:hidden
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="p-4">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src="/assets/habbohub.gif"
                alt="Habbo Hub"
                className="h-12"
              />
            </div>

            {/* User Profile */}
            {user && habboAccount && (
              <div className="flex items-center space-x-3 mb-6 p-3 bg-white/50 rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?size=m&user=${habboAccount.habbo_name}&action=wav&direction=2&head_direction=2&gesture=sml`} 
                  />
                  <AvatarFallback>HH</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold text-black">{habboAccount.habbo_name}</h3>
                  <p className="text-xs text-gray-600">Habbo Membro</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="space-y-2 mb-6">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isActive={location.pathname === item.href}
                  isCollapsed={false}
                />
              ))}
            </div>

            {/* User items */}
            {userItems.length > 0 && (
              <div className="space-y-2 border-t border-gray-300 pt-4 mb-4">
                {userItems.map((item) => (
                  <NavItem
                    key={item.href}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    isActive={location.pathname === item.href}
                    isCollapsed={false}
                  />
                ))}
              </div>
            )}

            {/* Logout button */}
            {user && (
              <Button
                variant="ghost"
                className="w-full justify-start text-black hover:bg-red-200 hover:text-red-800"
                onClick={handleLogout}
              >
                <DoorOpen className="w-4 h-4 mr-3" />
                <span className="text-sm font-medium">Sair</span>
              </Button>
            )}

            {/* Login button for non-authenticated users */}
            {!user && (
              <Link to="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Conectar Conta Habbo
                </Button>
              </Link>
            )}
          </div>
        </div>
      </>
    );
  }

  // Desktop view
  return (
    <div
      ref={sidebarRef}
      className={`
        fixed top-0 left-0 h-full bg-[#f5f5dc] border-r-2 border-black shadow-lg z-40 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div className="p-4">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={isCollapsed ? "/assets/hub.gif" : "/assets/habbohub.gif"}
            alt="Habbo Hub"
            className={`${isCollapsed ? 'h-8' : 'h-12'} transition-all duration-300`}
          />
        </div>

        {/* Toggle button */}
        <Button
          variant="ghost"
          className="w-full mb-4 text-black hover:bg-yellow-300"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {!isCollapsed && <span className="ml-2">Recolher</span>}
        </Button>

        {/* User Profile */}
        {user && habboAccount && !isCollapsed && (
          <div className="flex items-center space-x-3 mb-6 p-3 bg-white/50 rounded-lg">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?size=m&user=${habboAccount.habbo_name}&action=wav&direction=2&head_direction=2&gesture=sml`} 
              />
              <AvatarFallback>HH</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-bold text-black">{habboAccount.habbo_name}</h3>
              <p className="text-xs text-gray-600">Habbo Membro</p>
            </div>
          </div>
        )}

        {/* Collapsed user avatar */}
        {user && habboAccount && isCollapsed && (
          <div className="flex justify-center mb-6">
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?size=m&user=${habboAccount.habbo_name}&action=wav&direction=2&head_direction=2&gesture=sml`} 
              />
              <AvatarFallback>HH</AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Navigation */}
        <div className="space-y-2 mb-6">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={location.pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>

        {/* User items */}
        {userItems.length > 0 && (
          <div className="space-y-2 border-t border-gray-300 pt-4 mb-4">
            {userItems.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={location.pathname === item.href}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        )}

        {/* Logout button */}
        {user && (
          <Button
            variant="ghost"
            className={`
              w-full text-black hover:bg-red-200 hover:text-red-800
              ${isCollapsed ? 'justify-center px-2' : 'justify-start'}
            `}
            onClick={handleLogout}
          >
            <DoorOpen className={`${isCollapsed ? 'w-4 h-4' : 'w-4 h-4 mr-3'}`} />
            {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
          </Button>
        )}

        {/* Login button for non-authenticated users */}
        {!user && !isCollapsed && (
          <Link to="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
              Conectar Conta Habbo
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
