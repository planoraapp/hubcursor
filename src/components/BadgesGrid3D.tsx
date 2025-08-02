
import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Award } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { supabase } from '@/integrations/supabase/client';

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  rarity: string;
}

interface BadgeModalProps {
  badge: BadgeItem;
  onClose: () => void;
}

const BadgeModal = ({ badge, onClose }: BadgeModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{badge.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="text-center mb-4">
        <div className="inline-block p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full shadow-lg">
          <img
            src={badge.imageUrl}
            alt={badge.code}
            className="w-16 h-16 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.innerHTML = '🏅';
            }}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-mono">
            {badge.code}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Categoria:</span> 
          <span className="ml-2 capitalize">{badge.category}</span>
        </div>
        
        <div>
          <span className="font-semibold">Raridade:</span> 
          <span className={`ml-2 capitalize font-semibold ${
            badge.rarity === 'legendary' ? 'text-yellow-600' :
            badge.rarity === 'rare' ? 'text-purple-600' :
            badge.rarity === 'uncommon' ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {badge.rarity === 'legendary' ? 'Lendário' :
             badge.rarity === 'rare' ? 'Raro' :
             badge.rarity === 'uncommon' ? 'Incomum' : 'Comum'}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Descrição:</span>
          <p className="mt-1 text-gray-600">{badge.description}</p>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <Award className="w-5 h-5 text-yellow-600 mx-auto" />
        <p className="text-xs text-gray-500 mt-1">Emblema Oficial do Habbo</p>
      </div>
    </div>
  </div>
);

export const BadgesGrid3D = () => {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchBadges = useCallback(async (pageNum: number, category: string, reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log(`🔄 Fetching badges page ${pageNum}, category: ${category}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-emotion-badges', {
        body: { page: pageNum, limit: 100, category }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.badges && Array.isArray(data.badges)) {
        setBadges(prev => reset ? data.badges : [...prev, ...data.badges]);
        setHasMore(data.metadata?.hasMore || false);
        
        if (data.metadata?.categories) {
          setCategories(['all', ...data.metadata.categories]);
        }
        
        console.log(`✅ Loaded ${data.badges.length} badges`);
      }
    } catch (error) {
      console.error('❌ Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    setBadges([]);
    setPage(1);
    fetchBadges(1, selectedCategory, true);
  }, [selectedCategory]);

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBadges(nextPage, selectedCategory);
    }
  };

  const filteredBadges = badges.filter(badge =>
    badge.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRarityClass = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-200 to-orange-200 border-yellow-400';
      case 'rare': return 'from-purple-200 to-pink-200 border-purple-400';
      case 'uncommon': return 'from-blue-200 to-indigo-200 border-blue-400';
      default: return 'from-gray-200 to-gray-300 border-gray-400';
    }
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'all': 'Todas as Categorias',
      'staff': 'Equipe',
      'conquistas': 'Conquistas',
      'eventos': 'Eventos',
      'especiais': 'Especiais',
      'jogos': 'Jogos',
      'gerais': 'Gerais'
    };
    return names[category] || category;
  };

  return (
    <div className="space-y-6">
      <PanelCard title="Emblemas do Habbo">
        <div className="space-y-4">
          {/* Search and Filter */}
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
                  <option key={category} value={category}>
                    {getCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Badges Grid with 3D Effect */}
          <div className="bg-white border-2 border-gray-300 rounded-lg h-[600px] overflow-y-auto p-6">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4">
              {filteredBadges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`group relative aspect-square bg-gradient-to-br ${getRarityClass(badge.rarity)} 
                    border-2 rounded-lg p-3 transition-all duration-300 
                    hover:scale-110 hover:shadow-2xl hover:-translate-y-2 
                    transform-gpu perspective-1000`}
                  style={{
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                  }}
                >
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <img
                    src={badge.imageUrl}
                    alt={badge.code}
                    className="w-full h-full object-contain relative z-10 filter drop-shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML += '<div class="w-full h-full flex items-center justify-center text-2xl">🏅</div>';
                    }}
                  />
                  
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 
                    opacity-0 group-hover:opacity-100 transition-all duration-300 
                    bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                    {badge.code}
                  </div>
                </button>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && filteredBadges.length > 0 && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="habbo-button-blue px-8 py-3"
                >
                  {loading ? 'Carregando...' : 'Carregar Mais Emblemas'}
                </button>
              </div>
            )}

            {loading && filteredBadges.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando emblemas...</p>
                </div>
              </div>
            )}

            {!loading && filteredBadges.length === 0 && (
              <div className="text-center py-16">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Nenhum emblema encontrado.</p>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 text-center">
            📊 Total: {badges.length} emblemas | 🔍 Filtrados: {filteredBadges.length}
          </div>
        </div>
      </PanelCard>

      {/* Modal */}
      {selectedBadge && (
        <BadgeModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};
