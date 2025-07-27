
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { Search, Filter, Award, Calendar, Users } from 'lucide-react';
import { useState } from 'react';

export const BadgesEnhanced = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');

  const rarityLevels = [
    { id: 'all', name: 'Todos', color: 'text-gray-600' },
    { id: 'common', name: 'Comum', color: 'text-green-600' },
    { id: 'uncommon', name: 'Incomum', color: 'text-blue-600' },
    { id: 'rare', name: 'Raro', color: 'text-purple-600' },
    { id: 'legendary', name: 'Lendário', color: 'text-orange-600' }
  ];

  const mockBadges = [
    {
      id: 1,
      code: 'ACH_BasicClub1',
      name: 'Habbo Club',
      description: 'Seja membro do Habbo Club por 1 mês',
      rarity: 'common',
      category: 'Achievement',
      dateAdded: '2024-01-01',
      obtainedBy: 12543,
      howToGet: 'Assine o Habbo Club'
    },
    {
      id: 2,
      code: 'ACH_RoomDecorator1',
      name: 'Decorador',
      description: 'Decore 10 quartos diferentes',
      rarity: 'uncommon',
      category: 'Achievement',
      dateAdded: '2024-01-05',
      obtainedBy: 8234,
      howToGet: 'Decore quartos com mobis'
    },
    {
      id: 3,
      code: 'ACH_EventWinner1',
      name: 'Vencedor de Evento',
      description: 'Vença um evento oficial',
      rarity: 'rare',
      category: 'Event',
      dateAdded: '2024-01-10',
      obtainedBy: 1532,
      howToGet: 'Participe e vença eventos oficiais'
    },
    {
      id: 4,
      code: 'ACH_BetaTester1',
      name: 'Beta Tester',
      description: 'Participou dos testes beta',
      rarity: 'legendary',
      category: 'Special',
      dateAdded: '2023-12-15',
      obtainedBy: 234,
      howToGet: 'Não disponível mais'
    }
  ];

  const filteredBadges = mockBadges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = selectedRarity === 'all' || badge.rarity === selectedRarity;
    return matchesSearch && matchesRarity;
  });

  const getRarityColor = (rarity: string) => {
    const rarityObj = rarityLevels.find(r => r.id === rarity);
    return rarityObj ? rarityObj.color : 'text-gray-600';
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-green-100';
      case 'uncommon': return 'bg-blue-100';
      case 'rare': return 'bg-purple-100';
      case 'legendary': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <PanelCard title={t('badgesEnhancedTitle')} subtitle={t('badgesEnhancedSubtitle')}>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar emblemas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#5a5a5a] rounded-lg focus:outline-none focus:border-[#007bff]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="px-4 py-2 border-2 border-[#5a5a5a] rounded-lg focus:outline-none focus:border-[#007bff]"
              >
                {rarityLevels.map(rarity => (
                  <option key={rarity.id} value={rarity.id}>{rarity.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => (
              <div key={badge.id} className="bg-white rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] shadow-[2px_2px_0px_0px_#cccccc] overflow-hidden hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100">
                <div className={`p-4 ${getRarityBg(badge.rarity)}`}>
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://images.habbo.com/c_images/album1584/${badge.code}.gif`}
                      alt={badge.name}
                      className="w-16 h-16"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.habbo.com/c_images/album1584/ACH_BasicClub1.gif';
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-[#38332c]">{badge.name}</h3>
                      <p className={`text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                        {badge.rarity.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Award size={12} />
                      <span>Categoria: {badge.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={12} />
                      <span>Adicionado: {new Date(badge.dateAdded).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={12} />
                      <span>Obtido por: {badge.obtainedBy.toLocaleString()} usuários</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-700">
                      <strong>Como obter:</strong> {badge.howToGet}
                    </p>
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
