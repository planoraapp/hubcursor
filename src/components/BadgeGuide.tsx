
import { useState } from 'react';
import { Search } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { mockData } from '../data/mockData';

export const BadgeGuide = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'hobbies', label: 'Hobbies' },
  ];

  const filteredBadges = mockData.badges.filter(badge => 
    (activeCategory === 'todos' || badge.category === activeCategory) &&
    badge.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <PanelCard title="Guia de Emblemas">
        <p className="text-lg text-gray-600 mb-4">
          Explore a vasta coleção de emblemas do Habbo. Descubra como obtê-los e os mais raros!
        </p>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por nome do emblema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
          />
        </div>

        <div className="flex space-x-1 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 font-bold border-2 border-[#5a5a5a] rounded-t-lg transition-all duration-100 ${
                activeCategory === category.id
                  ? 'bg-white border-b-white text-[#38332c]'
                  : 'bg-[#d1d1d1] text-[#38332c] hover:bg-[#e1e1e1]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </PanelCard>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredBadges.map((badge, index) => (
          <PanelCard key={index}>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-200 to-yellow-400 mx-auto rounded-lg flex items-center justify-center text-yellow-800 font-bold text-lg border-2 border-yellow-500">
                🏅
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{badge.name}</h3>
              <p className="text-xs text-gray-500">{badge.desc}</p>
              <div className="flex flex-col space-y-1 text-xs">
                <span className={`px-2 py-1 rounded text-white font-medium ${
                  badge.category === 'eventos' ? 'bg-[#dd0000]' : 'bg-[#008800]'
                }`}>
                  {badge.category}
                </span>
                <button className="text-[#007bff] hover:underline">Guia</button>
              </div>
            </div>
          </PanelCard>
        ))}
      </div>
    </div>
  );
};
