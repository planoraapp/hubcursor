
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { Award, Star, Trophy, Target, Calendar, Users } from 'lucide-react';
import { useState } from 'react';

export const BadgesEnhanced = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const badgeCategories = [
    { id: 'all', name: 'Todos', icon: Award },
    { id: 'achievements', name: 'Conquistas', icon: Trophy },
    { id: 'events', name: 'Eventos', icon: Calendar },
    { id: 'social', name: 'Sociais', icon: Users },
    { id: 'games', name: 'Jogos', icon: Target },
    { id: 'rare', name: 'Raros', icon: Star },
  ];

  const mockBadges = [
    {
      id: 1,
      name: 'Primeiro Login',
      description: 'Fez seu primeiro login no Habbo',
      category: 'achievements',
      rarity: 'common',
      earned: true,
      earnedDate: '2024-01-01',
      image: 'https://images.habbo.com/c_images/album1584/ACH_Login1.png'
    },
    {
      id: 2,
      name: 'Explorador',
      description: 'Visitou 50 quartos diferentes',
      category: 'achievements',
      rarity: 'uncommon',
      earned: true,
      earnedDate: '2024-01-05',
      image: 'https://images.habbo.com/c_images/album1584/ACH_RoomEntry1.png'
    },
    {
      id: 3,
      name: 'Evento de Verão 2024',
      description: 'Participou do evento de verão',
      category: 'events',
      rarity: 'rare',
      earned: false,
      earnedDate: null,
      image: 'https://images.habbo.com/c_images/album1584/ACH_Summer24.png'
    },
    {
      id: 4,
      name: 'Amigo Fiel',
      description: 'Adicionou 10 amigos à sua lista',
      category: 'social',
      rarity: 'common',
      earned: true,
      earnedDate: '2024-01-03',
      image: 'https://images.habbo.com/c_images/album1584/ACH_FriendListSize1.png'
    },
    {
      id: 5,
      name: 'Campeão do Jogo',
      description: 'Venceu 25 partidas de jogos',
      category: 'games',
      rarity: 'uncommon',
      earned: false,
      earnedDate: null,
      image: 'https://images.habbo.com/c_images/album1584/ACH_GameWin1.png'
    },
    {
      id: 6,
      name: 'Veterano',
      description: 'Emblema especial para membros antigos',
      category: 'rare',
      rarity: 'legendary',
      earned: true,
      earnedDate: '2023-12-25',
      image: 'https://images.habbo.com/c_images/album1584/ACH_Veteran.png'
    }
  ];

  const filteredBadges = mockBadges.filter(badge => {
    return selectedCategory === 'all' || badge.category === selectedCategory;
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
      <PanelCard title={t('badgesEnhancedTitle')}>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {badgeCategories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    habbo-nav-link px-3 py-2 text-sm
                    ${selectedCategory === category.id ? 'active' : ''}
                  `}
                >
                  <Icon size={16} />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => (
              <div key={badge.id} className={`habbo-card ${!badge.earned ? 'opacity-60' : ''}`}>
                <div className="p-4 text-center">
                  <div className="relative inline-block">
                    <img
                      src={badge.image}
                      alt={badge.name}
                      className="w-16 h-16 mx-auto object-contain"
                    />
                    {!badge.earned && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">?</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 mt-2 mb-1">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                  <div className="space-y-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity.toUpperCase()}
                    </span>
                    {badge.earned && badge.earnedDate && (
                      <div className="text-xs text-gray-500">
                        Conquistado em {badge.earnedDate}
                      </div>
                    )}
                    {!badge.earned && (
                      <div className="text-xs text-gray-500">
                        Não conquistado
                      </div>
                    )}
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
