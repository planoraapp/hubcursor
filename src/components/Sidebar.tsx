
import React from 'react';
import { Home, Users, Package, Trophy, Search, User, Settings, MessageSquare, ShoppingCart, Wrench } from 'lucide-react';
import { UserProfile } from './UserProfile';
import { LogoText } from './LogoText';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'catalog', label: 'Catálogo', icon: Package },
    { id: 'catalog-enhanced', label: 'Catálogo+', icon: Package },
    { id: 'badges', label: 'Guia de Emblemas', icon: Trophy },
    { id: 'badges-enhanced', label: 'Emblemas+', icon: Trophy },
    { id: 'profile-checker', label: 'Verificar Perfil', icon: User },
    { id: 'explore-rooms', label: 'Explorar Quartos', icon: Search },
    { id: 'rankings', label: 'Rankings', icon: Users },
    { id: 'news', label: 'Notícias', icon: MessageSquare },
    { id: 'forum', label: 'Fórum', icon: MessageSquare },
    { id: 'marketplace', label: 'Mercado', icon: ShoppingCart },
    { id: 'avatar-editor', label: 'Editor de Avatar', icon: User },
    { id: 'tools', label: 'Ferramentas', icon: Wrench },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#e7e0d4] border-r-2 border-[#5a5a5a] p-6 shadow-lg">
      <div className="mb-8">
        <LogoText />
      </div>

      <div className="mb-8">
        <UserProfile />
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                ${activeSection === item.id
                  ? 'bg-[#b0e0e6] text-[#1a1a1a] font-bold border-2 border-[#66b0bb] shadow-[1px_1px_0px_0px_#70c6d1] transform translate-x-[1px] translate-y-[1px]'
                  : 'bg-[#eaddc7] text-[#38332c] border border-[#d1c6b3] shadow-[1px_1px_0px_0px_#c7c0b3] hover:bg-[#f0e6da] hover:transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none'
                }
              `}
            >
              <Icon size={18} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
