import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Package } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { supabase } from '@/integrations/supabase/client';
import IntelligentFurniImage from './IntelligentFurniImage';

interface HabboFurniItem {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  rarity: string;
  type: string;
  swfName: string;
  colors: string[];
  club: 'HC' | 'FREE';
  source: 'habbofurni';
}

interface FurniModalProps {
  furni: HabboFurniItem;
  onClose: () => void;
}

const FurniModal = ({ furni, onClose }: FurniModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{furni.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="text-center mb-4">
        <div className="inline-block p-4 bg-gray-50 rounded-lg">
          <IntelligentFurniImage
            swfName={furni.swfName}
            name={furni.name}
            originalUrl={furni.imageUrl}
            size="lg"
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <span className="font-semibold">Categoria:</span> 
          <span className="ml-2 capitalize">{furni.category}</span>
        </div>
        
        <div>
          <span className="font-semibold">Tipo:</span> 
          <span className="ml-2 capitalize">{furni.type}</span>
        </div>
        
        <div>
          <span className="font-semibold">Raridade:</span> 
          <span className={`ml-2 capitalize px-2 py-1 rounded text-sm font-medium ${
            furni.rarity === 'rare' ? 'bg-purple-100 text-purple-800' :
            furni.rarity === 'ltd' ? 'bg-red-100 text-red-800' :
            furni.rarity === 'hc' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {furni.rarity}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Club:</span> 
          <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
            furni.club === 'HC' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {furni.club}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Descrição:</span>
          <p className="mt-1 text-gray-600">{furni.description}</p>
        </div>
        
        <div>
          <span className="font-semibold">Fonte:</span> 
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
            HabboFurni.com API
          </span>
        </div>
      </div>
    </div>
  </div>
);

export const CatalogInfiniteV2 = () => {
  const [furnis, setFurnis] = useState<HabboFurniItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFurni, setSelectedFurni] = useState<HabboFurniItem | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchFurnis = useCallback(async (pageNum: number, category: string, reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log(`🔄 Fetching HabboFurni.com API data - page ${pageNum}, category: ${category}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-furni-api', {
        body: { page: pageNum, limit: 150, category }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.furnis && Array.isArray(data.furnis)) {
        const typedFurnis = data.furnis as HabboFurniItem[];
        setFurnis(prev => reset ? typedFurnis : [...prev, ...typedFurnis]);
        setHasMore(data.metadata?.hasMore || false);
        
        // Extract unique categories with proper typing
        const uniqueCategories = [...new Set(typedFurnis.map(f => f.category))];
        setCategories(['all', ...uniqueCategories]);
        
        console.log(`✅ Loaded ${typedFurnis.length} furnis from HabboFurni.com API`);
        console.log(`📊 Total furnis loaded: ${reset ? typedFurnis.length : furnis.length + typedFurnis.length}`);
      }
    } catch (error) {
      console.error('❌ Error fetching HabboFurni.com data:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, furnis.length]);

  useEffect(() => {
    setFurnis([]);
    setPage(1);
    fetchFurnis(1, selectedCategory, true);
  }, [selectedCategory]);

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFurnis(nextPage, selectedCategory);
    }
  };

  // Auto-load more when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.furnis-scroll-container-v2');
      if (!scrollContainer || loading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMore();
      }
    };

    const scrollContainer = document.querySelector('.furnis-scroll-container-v2');
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, page]);

  const filteredFurnis = furnis.filter(furni =>
    furni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    furni.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    furni.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryDisplayName = (category: string) => {
    const names: Record<string, string> = {
      'all': 'Todas as Categorias',
      'cadeiras': '🪑 Cadeiras',
      'mesas': '🪑 Mesas', 
      'camas': '🛏️ Camas',
      'sofas': '🛋️ Sofás',
      'plantas': '🌱 Plantas',
      'iluminacao': '💡 Iluminação',
      'parede': '🖼️ Itens de Parede',
      'piso': '📐 Pisos',
      'armazenamento': '📦 Armazenamento',
      'eletronicos': '📺 Eletrônicos',
      'diversos': '📦 Diversos'
    };
    return names[category] || category;
  };

  return (
    <div className="space-y-6">
      <PanelCard title="Catálogo HabboFurni.com - API Oficial">
        <div className="space-y-4">
          {/* API Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-green-800 font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              ✅ Conectado à API HabboFurni.com
              <span className="bg-green-200 px-2 py-1 rounded text-xs">
                Dados em Tempo Real
              </span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar móveis na API HabboFurni.com..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="habbo-input w-full pl-10 pr-4 py-3 text-base"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="habbo-input px-4 py-3 min-w-[200px]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryDisplayName(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Furnis Grid */}
          <div className="bg-white border-2 border-gray-300 rounded-lg h-[700px] overflow-y-auto p-4 furnis-scroll-container-v2">
            <div className="grid grid-cols-12 md:grid-cols-16 lg:grid-cols-20 xl:grid-cols-24 gap-1">
              {filteredFurnis.map((furni) => (
                <button
                  key={furni.id}
                  onClick={() => setSelectedFurni(furni)}
                  className="group relative w-8 h-8 md:w-10 md:h-10 hover:bg-gray-100 rounded transition-colors duration-200 p-0.5"
                  title={furni.name}
                >
                  {/* Rarity indicator */}
                  {furni.rarity !== 'common' && (
                    <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full shadow-sm ${
                      furni.rarity === 'ltd' ? 'bg-red-500' :
                      furni.rarity === 'rare' ? 'bg-purple-500' : 
                      furni.rarity === 'hc' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                  )}
                  
                  {/* Club indicator */}
                  {furni.club === 'HC' && (
                    <div className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-yellow-500 rounded-full" />
                  )}
                  
                  <IntelligentFurniImage
                    swfName={furni.swfName}
                    name={furni.name}
                    originalUrl={furni.imageUrl}
                    size="md"
                    className="w-full h-full"
                  />
                </button>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && filteredFurnis.length > 0 && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="habbo-button-blue px-6 py-2 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Carregando da API...
                    </span>
                  ) : (
                    'Carregar Mais da API'
                  )}
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && filteredFurnis.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-semibold">Conectando à API HabboFurni.com...</p>
                  <p className="text-gray-500 text-sm mt-1">Carregando móveis oficiais em tempo real</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredFurnis.length === 0 && (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-semibold mb-2">Nenhum móvel encontrado</p>
                <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="text-sm text-gray-500 text-center bg-blue-50 rounded-lg p-3">
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <span className="flex items-center gap-1">
                🌐 <strong>API:</strong> HabboFurni.com
              </span>
              <span className="flex items-center gap-1">
                📊 <strong>Total:</strong> {furnis.length} móveis
              </span>
              <span className="flex items-center gap-1">
                🔍 <strong>Filtrados:</strong> {filteredFurnis.length}
              </span>
              <span className="flex items-center gap-1">
                🏆 <strong>Raros:</strong> {furnis.filter(f => f.rarity !== 'common').length}
              </span>
              <span className="flex items-center gap-1">
                👑 <strong>HC:</strong> {furnis.filter(f => f.club === 'HC').length}
              </span>
              <span className="flex items-center gap-1">
                📈 <strong>Página:</strong> {page}
              </span>
            </div>
          </div>
        </div>
      </PanelCard>

      {/* Modal */}
      {selectedFurni && (
        <FurniModal
          furni={selectedFurni}
          onClose={() => setSelectedFurni(null)}
        />
      )}
    </div>
  );
};
