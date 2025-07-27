
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
    <aside className="w-64 bg-[#e7e0d4] p-6 flex flex-col shrink-0 border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg mr-6 shadow-[2px_2px_0px_0px_#cccccc]">
      <div className="text-center mb-8">
        <img 
          src="/logo-habbohub.png" 
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
                flex items-center space-x-3 w-full p-3 rounded-lg font-medium transition-all duration-200
                border-2 shadow-[1px_1px_0px_0px_#c7c0b3]
                ${activeSection === item.id
                  ? 'bg-[#b0e0e6] text-[#1a1a1a] font-bold border-[#66b0bb] shadow-[1px_1px_0px_0px_#70c6d1]'
                  : 'bg-[#eaddc7] text-[#38332c] border-[#d1c6b3] hover:bg-[#f0e6da] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none'
                }
              `}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-8 bg-white p-4 rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] shadow-[2px_2px_0px_0px_#cccccc] text-center">
        <h3 className="font-bold text-gray-800">{t('habboPremiumTitle')}</h3>
        <p className="text-sm text-gray-600 mt-1">{t('habboPremiumDesc')}</p>
        <button className="w-full mt-3 bg-[#008800] text-white px-4 py-2 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100">
          {t('subscribeNow')}
        </button>
      </div>
    </aside>
  );
};
