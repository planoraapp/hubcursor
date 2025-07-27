
import { Newspaper, MessageCircle, Package, Award, Palette, ShoppingCart } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { UserProfile } from './UserProfile';
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
    <aside className="w-64 bg-gradient-to-b from-slate-100 to-slate-200 shadow-xl flex flex-col min-h-screen">
      <div className="text-center mb-6 p-6">
        <img 
          src="/assets/habbohub.png" 
          alt="HABBO HUB" 
          className="mx-auto mb-4 max-w-[180px] h-auto"
        />
      </div>
      
      <UserProfile />
      
      <nav className="flex flex-col space-y-2 px-4 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                ${activeSection === item.id 
                  ? 'bg-sky-400 text-white shadow-md' 
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-sm'
                }
              `}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 bg-white/80 backdrop-blur-sm mx-4 rounded-lg mb-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-2">{t('habboPremiumTitle')}</h3>
        <p className="text-sm text-gray-600 mb-3">{t('habboPremiumDesc')}</p>
        <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200">
          {t('subscribeNow')}
        </button>
      </div>
      
      <LanguageSelector />
    </aside>
  );
};
