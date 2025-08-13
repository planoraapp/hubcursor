import React from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Link } from 'react-router-dom';
import { Activity, Home, LayoutDashboard, ListChecks, LucideIcon, MessageSquarePlus, Settings, ShoppingBag, Users, Zap } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navigationItems = [
  {
    name: 'Início',
    href: '/',
    icon: Home
  },
  {
    name: 'Mural',
    href: '/feed',
    icon: MessageSquarePlus
  },
  {
    name: 'Catálogo',
    href: '/marketplace',
    icon: ShoppingBag
  },
  {
    name: 'Rankings',
    href: '/rankings',
    icon: ListChecks
  },
  {
    name: 'Comunidade',
    href: '/community',
    icon: Users
  },
  {
    name: 'Console v1',
    href: '/console',
    icon: Activity
  },
  {
    name: 'Console v2',
    href: '/console2', 
    icon: Zap
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings
  },
];

export const Navigation: React.FC = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navigationItems.map((item) => (
          <NavigationMenuItem key={item.name}>
            <Link to={item.href}>
              <div className="flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4 px-4 py-2 rounded-md transition-colors">
                <item.icon className="w-4 h-4" />
                {item.name}
              </div>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
