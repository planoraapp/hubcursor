
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { BadgeIcon } from './BadgeIcon';
import { Search, Filter, Star, Award } from 'lucide-react';
import { useState } from 'react';

export const BadgesEnhanced = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: Award },
    { id: 'staff', name: 'Staff', icon: Star },
    { id: 'achievement', name: 'Conquistas', icon: Award },
    { id: 'special', name: 'Especiais', icon: Star },
    { id: 'rare', name: 'Raros', icon: Star },
  ];

  const mockBadges = [
    {
      id: 1,
      code: 'ADM',
      name: 'Administrador',
      description: 'Emblema exclusivo da administração',
      category: 'staff',
      rarity: 'legendary',
      obtained: true
    },
    {
      id: 2,
      code: 'MOD',
      name: 'Moderador',
      description: 'Emblema para moderadores do hotel',
      category: 'staff',
      rarity: 'epic',
      obtained: true
    },
    {
      id: 3,
      code: 'VIP',
      name: 'VIP',
      description: 'Emblema VIP exclusivo',
      category: 'special',
      rarity: 'rare',
      obtained: false
    },
    {
      id: 4,
      code: 'HC',
      name: 'Habbo Club',
      description: 'Membro do Habbo Club',
      category: 'achievement',
      rarity: 'common',
      obtained: true
    },
    {
      id: 5,
      code: 'STAR',
      name: 'Estrela',
      description: 'Emblema de destaque',
      category: 'achievement',
      rarity: 'uncommon',
      obtained: true
    },
    {
      id: 6,
      code: 'CROWN',
      name: 'Coroa',
      description: 'Emblema real',
      category: 'rare',
      rarity: 'legendary',
      obtained: false
    },
    {
      id: 7,
      code: 'DIAMOND',
      name: 'Diamante',
      description: 'Emblema de diamante',
      category: 'rare',
      rarity: 'epic',
      obtained: false
    },
    {
      id: 8,
      code: 'BUILDER',
      name: 'Construtor',
      description: 'Emblema de construtor expert',
      category: 'achievement',
      rarity: 'rare',
      obtained: true
    }
  ];

  const filteredBadges = mockBadges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100';
      case 'uncommon': return 'bg-green-100';
      case 'rare': return 'bg-blue-100';
      case 'epic': return 'bg-purple-100';
      case 'legendary': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <PanelCard title={t('badgesEnhancedTitle')}>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar emblemas..."
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
            {filteredBadges.map((badge) => (
              <div key={badge.id} className="habbo-card">
                <div className={`p-4 ${getRarityBg(badge.rarity)} flex justify-center`}>
                  <BadgeIcon 
                    badgeCode={badge.code} 
                    alt={badge.name} 
                    size="lg"
                    className={badge.obtained ? '' : 'grayscale opacity-60'}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity.toUpperCase()}
                    </span>
                    <span className={`text-xs font-bold ${badge.obtained ? 'text-green-600' : 'text-red-600'}`}>
                      {badge.obtained ? 'OBTIDO' : 'NÃO OBTIDO'}
                    </span>
                  </div>
                  <button className={`w-full ${badge.obtained ? 'habbo-button-green' : 'habbo-button-red'}`}>
                    {badge.obtained ? 'Visualizar' : 'Como Obter'}
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
