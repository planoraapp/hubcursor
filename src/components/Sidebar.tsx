
import { Newspaper, MessageCircle, Package, Award, Palette, ShoppingCart } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { UserAvatar } from './UserAvatar';
import { useLanguage } from '../hooks/useLanguage';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'noticias', label: t('noticias'), icon: Newspaper },
    { id: 'forum', label: t('forum'), icon: MessageCircle },
    { id: 'catalogo', label: t('catalogo'), icon: Package },
    { id: 'emblemas', label: t('emblemas'), icon: Award },
    { id: 'editor', label: t('editor'), icon: Palette },
    { id: 'mercado', label: t('mercado'), icon: ShoppingCart },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex flex-col min-h-screen shadow-2xl">
      {/* Logo */}
      <div className="text-center p-6 border-b border-blue-700">
        <img 
          src="/assets/habbohub.png" 
          alt="HABBO HUB" 
          className="mx-auto mb-2 max-w-[180px] h-auto"
        />
      </div>
      
      {/* Avatar do Usuário */}
      <UserAvatar />
      
      {/* Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${activeSection === item.id 
                  ? 'bg-[#4ECDC4] text-white shadow-lg transform scale-105' 
                  : 'hover:bg-blue-700 hover:text-[#4ECDC4]'
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Premium Section */}
      <div className="p-4 mx-4 mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-gray-900">
        <h3 className="font-bold text-sm">{t('habboPremiumTitle')}</h3>
        <p className="text-xs mt-1 opacity-90">{t('habboPremiumDesc')}</p>
        <button className="w-full mt-3 bg-white hover:bg-gray-100 text-gray-900 py-2 rounded-lg text-sm font-bold transition-colors">
          {t('subscribeNow')}
        </button>
      </div>
      
      {/* Seletor de Idioma */}
      <div className="border-t border-blue-700 pt-4">
        <LanguageSelector />
      </div>
    </aside>
  );
};
