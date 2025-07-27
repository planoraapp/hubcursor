
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { Search, Filter, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { useState } from 'react';

export const Marketplace = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'furniture', name: 'Móveis' },
    { id: 'rares', name: 'Raros' },
    { id: 'clothing', name: 'Roupas' },
    { id: 'pets', name: 'Pets' },
  ];

  const marketplaceItems = [
    {
      id: 1,
      name: 'Trono de Ouro',
      category: 'rares',
      currentPrice: 2500,
      trend: 'up',
      change: '+15%',
      seller: 'RareCollector',
      image: 'https://images.habbo.com/dcr/hof_furni/icons/throne_gold.png',
      rarity: 'legendary'
    },
    {
      id: 2,
      name: 'Sofá Moderno',
      category: 'furniture',
      currentPrice: 75,
      trend: 'down',
      change: '-5%',
      seller: 'FurniShop',
      image: 'https://images.habbo.com/dcr/hof_furni/icons/sofa_modern.png',
      rarity: 'common'
    },
    {
      id: 3,
      name: 'Camiseta Rara',
      category: 'clothing',
      currentPrice: 150,
      trend: 'up',
      change: '+8%',
      seller: 'StyleMaster',
      image: 'https://images.habbo.com/dcr/hof_furni/icons/clothing_rare_tshirt.png',
      rarity: 'rare'
    },
    {
      id: 4,
      name: 'Dragão Pet',
      category: 'pets',
      currentPrice: 500,
      trend: 'up',
      change: '+25%',
      seller: 'PetLover',
      image: 'https://images.habbo.com/dcr/hof_furni/icons/pet_dragon.png',
      rarity: 'uncommon'
    }
  ];

  const marketStats = [
    { label: 'Itens Ativos', value: '15,432', change: '+2.5%', trend: 'up' },
    { label: 'Vendas Hoje', value: '1,234', change: '+8.1%', trend: 'up' },
    { label: 'Preço Médio', value: '156 moedas', change: '-1.2%', trend: 'down' },
  ];

  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-blue-100 text-blue-800';
      case 'rare': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <PanelCard title={t('marketplaceTitle')}>
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketStats.map((stat, index) => (
              <div key={index} className="habbo-card">
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="text-green-500 mr-2" size={20} />
                    ) : (
                      <TrendingDown className="text-red-500 mr-2" size={20} />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar itens no mercado..."
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

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="habbo-card">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityColor(item.rarity)}`}>
                      {item.rarity.toUpperCase()}
                    </span>
                    <div className="flex items-center">
                      {item.trend === 'up' ? (
                        <TrendingUp size={16} className="text-green-500 mr-1" />
                      ) : (
                        <TrendingDown size={16} className="text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.change}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 mx-auto object-contain mb-2"
                    />
                    <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600">por {item.seller}</p>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-green-600">
                      {item.currentPrice} moedas
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="habbo-button-green flex-1">
                      Comprar
                    </button>
                    <button className="habbo-button-red px-3">
                      <Star size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PanelCard>
    </div>
  );
};
