
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

interface HandItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  image?: string;
}

export default function ToolsPage() {
  const [activeSection, setActiveSection] = useState('ferramentas');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Funções');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Todas');
  const [selectedItem, setSelectedItem] = useState<HandItem | null>(null);
  const [items, setItems] = useState<HandItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  const categories = {
    'Funções': ['Todas', 'Dança', 'Onda', 'Gestos'],
    'Itens de Mão': ['Todas', 'Bebidas', 'Comida', 'Objetos', 'Outros']
  };

  // Mock data - replace with actual API
  useEffect(() => {
    const mockItems = [
      { id: 'drk', name: 'Beber', category: 'Funções', subcategory: 'Gestos', description: 'Ação de beber' },
      { id: 'eat', name: 'Comer', category: 'Funções', subcategory: 'Gestos', description: 'Ação de comer' },
      { id: 'wav', name: 'Acenar', category: 'Funções', subcategory: 'Gestos', description: 'Acenar com a mão' },
      { id: 'dance1', name: 'Dança 1', category: 'Funções', subcategory: 'Dança', description: 'Estilo de dança 1' },
      { id: 'dance2', name: 'Dança 2', category: 'Funções', subcategory: 'Dança', description: 'Estilo de dança 2' },
      { id: 'cola', name: 'Cola', category: 'Itens de Mão', subcategory: 'Bebidas', description: 'Refrigerante de cola' },
      { id: 'juice', name: 'Suco', category: 'Itens de Mão', subcategory: 'Bebidas', description: 'Suco de frutas' },
      { id: 'pizza', name: 'Pizza', category: 'Itens de Mão', subcategory: 'Comida', description: 'Fatia de pizza' },
      { id: 'burger', name: 'Hambúrguer', category: 'Itens de Mão', subcategory: 'Comida', description: 'Hambúrguer' },
    ];
    setItems(mockItems);
    setLoading(false);
  }, []);

  const filteredItems = items.filter(item => {
    if (item.category !== selectedCategory) return false;
    if (selectedSubcategory !== 'Todas' && item.subcategory !== selectedSubcategory) return false;
    return true;
  });

  const handleItemClick = (item: HandItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    alert(`${type} copiado: ${text}`);
  };

  const renderContent = () => (
    <div className="flex gap-6">
      {/* Sidebar de Categorias */}
      <div className="w-64 space-y-4">
        <div className="bg-white border border-gray-900 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4 volter-font">Categorias</h3>
          <div className="space-y-2">
            {Object.keys(categories).map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedSubcategory('Todas');
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedCategory === category 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategorias */}
        <div className="bg-white border border-gray-900 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4 volter-font">Filtros</h3>
          <div className="space-y-2">
            {categories[selectedCategory as keyof typeof categories]?.map((subcategory) => (
              <button
                key={subcategory}
                onClick={() => setSelectedSubcategory(subcategory)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                  selectedSubcategory === subcategory 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {subcategory}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Área de Conteúdo */}
      <div className="flex-1">
        <div className="bg-white border border-gray-900 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 volter-font">
            {selectedCategory} - {selectedSubcategory} ({filteredItems.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando itens...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="bg-gray-200 shadow-sm rounded-lg p-4 cursor-pointer hover:bg-gray-300 transition-colors flex flex-col items-center justify-center"
                  title={item.name}
                >
                  <div className="w-8 h-8 bg-gray-400 rounded mb-2 flex items-center justify-center text-xs font-bold text-white">
                    {item.id.toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-600 text-center">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white border border-gray-900 rounded-lg shadow-xl p-6 max-w-md w-11/12" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 volter-font">{selectedItem.name}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gray-400 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold">
                {selectedItem.id.toUpperCase()}
              </div>
              <p className="text-gray-600 mb-2">{selectedItem.description}</p>
              <p className="text-sm text-gray-500">Categoria: {selectedItem.category}</p>
              <p className="text-sm text-gray-500">ID: {selectedItem.id}</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => copyToClipboard(selectedItem.id, 'ID')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors volter-font"
              >
                Copiar ID
              </button>
              <button
                onClick={() => copyToClipboard(`:${selectedItem.id}`, 'Comando')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors volter-font"
              >
                Copiar Comando
              </button>
            </div>
          </div>
        </div>
      )}
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
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-h-full border border-gray-900">
            {renderContent()}
          </div>
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
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full border border-gray-900">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
