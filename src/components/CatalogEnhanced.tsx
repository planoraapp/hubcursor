
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { HabboIcon } from './HabboIcon';
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
      name: 'Créditos Habbo',
      category: 'currency',
      rarity: 'common',
      price: 0,
      image: '/assets/credits_icon.gif',
      description: 'Moeda oficial do Habbo Hotel.',
      animated: true
    },
    {
      id: 2,
      name: 'Diamantes',
      category: 'currency',
      rarity: 'rare',
      price: 0,
      image: '/assets/Diamantes.png',
      description: 'Moeda premium do Habbo Hotel.',
      animated: false
    },
    {
      id: 3,
      name: 'Habbo Club',
      category: 'membership',
      rarity: 'special',
      price: 25,
      image: '/assets/HC.png',
      description: 'Assinatura premium do Habbo Club.',
      animated: false
    },
    {
      id: 4,
      name: 'Elevador',
      category: 'furniture',
      rarity: 'common',
      price: 150,
      image: '/assets/Elevador.png',
      description: 'Elevador funcional para seu quarto.',
      animated: false
    },
    {
      id: 5,
      name: 'Patinho',
      category: 'decorations',
      rarity: 'cute',
      price: 50,
      image: '/assets/patinho.gif',
      description: 'Patinho animado para decoração.',
      animated: true
    },
    {
      id: 6,
      name: 'Estrela Promocional',
      category: 'decorations',
      rarity: 'special',
      price: 200,
      image: '/assets/promo_star.gif',
      description: 'Estrela especial de eventos.',
      animated: true
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
      case 'special': return 'text-yellow-600';
      case 'cute': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100';
      case 'uncommon': return 'bg-blue-100';
      case 'rare': return 'bg-purple-100';
      case 'special': return 'bg-yellow-100';
      case 'cute': return 'bg-pink-100';
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
                className="habbo-input w-full pl-10 pr-4 py-2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="habbo-input px-4 py-2"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="habbo-card">
                <div className={`p-4 ${getRarityBg(item.rarity)} flex justify-center`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-medium ${getRarityColor(item.rarity)}`}>
                      {item.rarity.toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <HabboIcon icon="credits" size="sm" />
                      <span className="text-sm font-bold text-green-600">
                        {item.price} 
                      </span>
                    </div>
                  </div>
                  <button className="habbo-button-green w-full flex items-center justify-center space-x-2">
                    <HabboIcon icon="cart" size="sm" />
                    <span>Comprar</span>
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
