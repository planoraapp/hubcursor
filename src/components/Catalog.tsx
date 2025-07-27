
import { useState } from 'react';
import { Search, Award, Package } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { ImageWithFallback } from './ImageWithFallback';
import { useAchievements } from '../hooks/useHabboData';
import { getBadgeUrl } from '../services/habboApi';

export const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const { data: achievements, isLoading, error } = useAchievements();

  const categories = [
    { id: 'todos', label: 'Todos os Items', icon: Package },
    { id: 'emblemas', label: 'Emblemas', icon: Award },
  ];

  const filteredItems = achievements?.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'todos' || activeCategory === 'emblemas';
    return matchesSearch && matchesCategory;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PanelCard title="Catálogo de Items">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando catálogo do Habbo BR...</p>
            </div>
          </div>
        </PanelCard>
      </div>
    );
  }

  if (error || !achievements) {
    return (
      <div className="space-y-8">
        <PanelCard title="Catálogo de Items">
          <div className="text-center py-8">
            <Package className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="font-bold text-gray-800 mb-2">Erro ao carregar catálogo</h3>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar o catálogo do Habbo BR.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#008800] text-white px-6 py-2 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
            >
              Tentar Novamente
            </button>
          </div>
        </PanelCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PanelCard title="Catálogo de Items">
        <p className="text-lg text-gray-600 mb-4">
          Explore todos os emblemas disponíveis no Habbo Hotel BR através da nossa API oficial.
        </p>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por nome do item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
          />
        </div>

        <div className="flex flex-wrap gap-1 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 font-bold border-2 border-[#5a5a5a] rounded-t-lg transition-all duration-100 ${
                  activeCategory === category.id
                    ? 'bg-white border-b-white text-[#38332c]'
                    : 'bg-[#d1d1d1] text-[#38332c] hover:bg-[#e1e1e1]'
                }`}
              >
                <Icon size={16} />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            📊 Total de emblemas: {achievements.length} | 🔍 Resultados da pesquisa: {filteredItems.length}
          </p>
        </div>
      </PanelCard>

      <PanelCard title="Emblemas Populares">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.slice(0, 24).map((item, index) => (
            <PanelCard key={index}>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center bg-gray-100">
                  <ImageWithFallback
                    src={getBadgeUrl(item.code)}
                    alt={item.name || 'Emblema'}
                    className="w-12 h-12"
                    fallback="/placeholder.svg"
                  />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{item.name || 'Emblema'}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{item.description || 'Sem descrição'}</p>
                <div className="flex flex-col items-center space-y-1 text-xs">
                  <span className="px-2 py-1 rounded text-white font-medium bg-[#dd0000]">
                    Emblema
                  </span>
                  <button className="text-[#007bff] hover:underline mt-1">
                    Ver detalhes
                  </button>
                </div>
              </div>
            </PanelCard>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <Search className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="font-bold text-gray-800 mb-2">Nenhum item encontrado</h3>
            <p className="text-gray-600">Tente ajustar sua pesquisa.</p>
          </div>
        )}
      </PanelCard>
    </div>
  );
};
