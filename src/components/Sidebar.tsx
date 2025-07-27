
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
    <aside className="w-64 habbo-sidebar">
      <div className="text-center mb-8">
        <img 
          src="/assets/LogoHabbo.png" 
          alt="HABBO HUB" 
          className="mx-auto mb-4 max-w-[200px] h-auto"
        />
      </div>
      
      <LanguageSelector />
      
      <UserProfile />
      
      <nav className="flex flex-col space-y-2 mb-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                habbo-nav-link
                ${activeSection === item.id ? 'active' : ''}
              `}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="habbo-premium">
        <h3 className="font-bold text-gray-800">{t('habboPremiumTitle')}</h3>
        <p className="text-sm text-gray-600 mt-1">{t('habboPremiumDesc')}</p>
        <button className="habbo-button-green w-full mt-3">
          {t('subscribeNow')}
        </button>
      </div>
    </aside>
  );
};
