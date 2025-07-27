
import { Home, Sofa, Package, Award, Trophy, User, Wrench } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const navItems = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'quartos', label: 'Explorar Quartos', icon: Sofa },
    { id: 'catalogo', label: 'Catálogo', icon: Package },
    { id: 'guias', label: 'Guia de Emblemas', icon: Award },
    { id: 'classificacao', label: 'Classificação', icon: Trophy },
    { id: 'perfil', label: 'Verificador de Perfil', icon: User },
    { id: 'ferramentas', label: 'Ferramentas', icon: Wrench },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  return (
    <aside className="w-64 bg-[#e7e0d4] p-6 flex flex-col shrink-0 border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg mr-6 shadow-[2px_2px_0px_0px_#cccccc]">
      <h1 className="text-3xl font-bold text-[#38332c] mb-8 text-center">HABBO HUB</h1>
      
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
        <h3 className="font-bold text-gray-800">Habbo Hub Premium</h3>
        <p className="text-sm text-gray-600 mt-1">Desbloqueie filtros avançados e alertas personalizados!</p>
        <button className="w-full mt-3 bg-[#008800] text-white px-4 py-2 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100">
          Assine Já!
        </button>
      </div>
    </aside>
  );
};
