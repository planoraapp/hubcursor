
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { ImageWithFallback } from './ImageWithFallback';
import { Search, Filter, Star, Package } from 'lucide-react';
import { useState } from 'react';

export const CatalogEnhanced = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: Package },
    { id: 'furniture', name: 'Mobiliário', icon: Package },
    { id: 'decorations', name: 'Decorações', icon: Star },
    { id: 'rares', name: 'Raros', icon: Star },
    { id: 'clothing', name: 'Roupas', icon: Package },
  ];

  const mockItems = [
    {
      id: 1,
      name: 'Poltrona Clássica',
      category: 'furniture',
      rarity: 'common',
      price: 50,
      image: 'https://images.habbo.com/dcr/hof_furni/icons/chair_norja.png',
      description: 'Uma poltrona confortável para seu quarto.'
    },
    {
      id: 2,
      name: 'Trono Dourado',
      category: 'rares',
      rarity: 'rare',
      price: 5000,
      image: 'https://images.habbo.com/dcr/hof_furni/icons/throne_gold.png',
      description: 'Trono exclusivo para VIPs.'
    },
    {
      id: 3,
      name: 'Planta Tropical',
      category: 'decorations',
      rarity: 'uncommon',
      price: 150,
      image: 'https://images.habbo.com/dcr/hof_furni/icons/plant_jungle.png',
      description: 'Adicione vida ao seu ambiente.'
    },
    {
      id: 4,
      name: 'Camiseta Habbo',
      category: 'clothing',
      rarity: 'common',
      price: 25,
      image: 'https://images.habbo.com/dcr/hof_furni/icons/clothing_habbo_tshirt.png',
      description: 'Vista-se com estilo Habbo.'
    }
  ];

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-blue-600';
      case 'rare': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100';
      case 'uncommon': return 'bg-blue-100';
      case 'rare': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <PanelCard title={t('catalogEnhancedTitle')}>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[2px_2px_0px_0px_#cccccc]">
                <div className={`p-4 ${getRarityBg(item.rarity)}`}>
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 mx-auto object-contain"
                    fallback="/placeholder.svg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-medium ${getRarityColor(item.rarity)}`}>
                      {item.rarity.toUpperCase()}
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {item.price} moedas
                    </span>
                  </div>
                  <button className="w-full bg-[#008800] text-white px-4 py-2 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PanelCard>
    </div>
  );
};
