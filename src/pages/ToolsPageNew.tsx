
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

interface HandItem {
  id: string;
  name: string;
  code: string;
  mobiSource: string;
  imageUrl: string;
  type: string;
}

// Componente para um card de Painel
function HabboPanel({ title, children, headerComponent }: { 
  title: string; 
  children: React.ReactNode; 
  headerComponent?: React.ReactNode; 
}) {
  return (
    <div className="bg-white border border-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        {headerComponent ? (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 volter-font" style={{ textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black' }}>{title}</h2>
            {headerComponent}
          </div>
        ) : (
          <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg mb-4">
            <h3 className="text-2xl font-semibold leading-none tracking-tight text-center volter-font" style={{ textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black' }}>{title}</h3>
          </div>
        )}
        <div className="p-6 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}

// Dados de exemplo para Itens de Mão
const sampleHandItems: HandItem[] = [
  { id: '1', name: 'Hotdog', code: 'hotdog_food', mobiSource: 'Máquina de Comida', imageUrl: 'https://images.habbo.com/dcr/hof_furni/icons/icon_hotdog.png', type: 'food' },
  { id: '2', name: 'Milkshake', code: 'milkshake_drink', mobiSource: 'Máquina de Bebidas', imageUrl: 'https://images.habbo.com/dcr/hof_furni/icons/icon_milkshake.png', type: 'drink' },
  { id: '3', name: 'Pizza', code: 'pizza_slice', mobiSource: 'Máquina de Pizza', imageUrl: 'https://images.habbo.com/dcr/hof_furni/icons/icon_pizza.png', type: 'food' },
  { id: '4', name: 'Cerveja', code: 'beer_pint', mobiSource: 'Bar Molen', imageUrl: 'https://images.habbo.com/dcr/hof_furni/icons/icon_beer.png', type: 'drink' },
  { id: '5', name: 'Bolo de Aniversário', code: 'cake_birthday', mobiSource: 'Bolo Festivo', imageUrl: 'https://images.habbo.com/dcr/hof_furni/icons/icon_cake.png', type: 'food' },
  { id: '6', name: 'Maçã do Amor', code: 'apple_candy', mobiSource: 'Feira Junina', imageUrl: 'https://images.habbo.com/dcr/hof_furni/icons/icon_apple.png', type: 'food' },
];

// Componente para o Modal de Detalhes do Item
function ItemDetailModal({ isOpen, onClose, item }: {
  isOpen: boolean;
  onClose: () => void;
  item: HandItem | null;
}) {
  if (!isOpen || !item) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('ID copiado para a área de transferência!');
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1001]" onClick={onClose}>
      <div className="bg-white border border-gray-900 rounded-lg shadow-xl p-6 relative max-w-lg w-11/12" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-700 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
            <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
          </svg>
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-contain bg-gray-200 p-2 rounded-lg border border-gray-400" />
          <h3 className="text-2xl font-bold text-gray-800 volter-font" style={{ textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black' }}>{item.name}</h3>
          <p className="text-gray-700 text-sm italic">Tipo: {item.type}</p>

          <div className="space-y-2 w-full text-left">
            <p className="text-gray-600">
              <span className="font-semibold">Código ID:</span>
              <code className="bg-gray-100 p-1 rounded cursor-pointer ml-2" onClick={() => copyToClipboard(item.code)} title="Clique para copiar">
                {item.code}
              </code>
            </p>
            {item.mobiSource && (
              <p className="text-gray-600">
                <span className="font-semibold">Obtido de:</span> {item.mobiSource}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ToolsPageNew() {
  const [activeSection, setActiveSection] = useState('ferramentas');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<HandItem[]>(sampleHandItems);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedItem, setSelectedItem] = useState<HandItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    let results = sampleHandItems.filter(item =>
      item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.code.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.mobiSource.toLowerCase().includes(lowerCaseSearchTerm)
    );

    if (selectedCategory !== 'Todos') {
      results = results.filter(item => item.type === selectedCategory);
    }
    setFilteredItems(results);
  }, [searchTerm, selectedCategory]);

  const handleItemClick = (item: HandItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const categories = [
    { name: 'Todos', type: 'Todos' },
    { name: 'Comidas', type: 'food' },
    { name: 'Bebidas', type: 'drink' },
    { name: 'Mobis (que dão itens)', type: 'mobi' },
  ];

  const renderContent = () => (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar de Categorias/Filtros */}
      <div className="w-full md:w-80">
        <HabboPanel title="Categorias">
          <div className="flex flex-col space-y-2">
            {categories.map(cat => (
              <button
                key={cat.type}
                onClick={() => setSelectedCategory(cat.type)}
                className={`px-4 py-2 rounded-md text-left volter-font ${
                  selectedCategory === cat.type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </HabboPanel>
      </div>

      {/* Lista de Itens */}
      <div className="flex-1">
        <HabboPanel title="Lista de Itens">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou código..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredItems.length === 0 ? (
              <p className="col-span-full text-center text-gray-600">Nenhum item encontrado.</p>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  className="flex flex-col items-center p-2 bg-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleItemClick(item)}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-16 h-16 object-contain" 
                    onError={(e) => {
                      e.currentTarget.src = '/assets/ferramentas.png';
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </HabboPanel>
      </div>

      {/* Modal de Detalhes do Item */}
      <ItemDetailModal isOpen={showModal} onClose={() => setShowModal(false)} item={selectedItem} />
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Ferramentas"
            icon="/assets/ferramentas.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderContent()}
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <PageHeader 
            title="Ferramentas"
            icon="/assets/ferramentas.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
