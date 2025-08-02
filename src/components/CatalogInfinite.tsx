
import { useState, useEffect, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { supabase } from '@/integrations/supabase/client';

interface FurniItem {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  rarity: string;
  type: string;
  swfName: string;
}

interface FurniModalProps {
  furni: FurniItem;
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
        <img
          src={furni.imageUrl}
          alt={furni.name}
          className="w-24 h-24 mx-auto object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
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
          <span className={`ml-2 capitalize ${furni.rarity === 'rare' ? 'text-purple-600' : 'text-gray-600'}`}>
            {furni.rarity}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Descrição:</span>
          <p className="mt-1 text-gray-600">{furni.description}</p>
        </div>
        
        {furni.swfName && (
          <div>
            <span className="font-semibold">Código:</span> 
            <span className="ml-2 font-mono text-sm">{furni.swfName}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export const CatalogInfinite = () => {
  const [furnis, setFurnis] = useState<FurniItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFurni, setSelectedFurni] = useState<FurniItem | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchFurnis = useCallback(async (pageNum: number, category: string, reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log(`🔄 Fetching furnis page ${pageNum}, category: ${category}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-emotion-furnis', {
        body: { page: pageNum, limit: 50, category }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.furnis && Array.isArray(data.furnis)) {
        setFurnis(prev => reset ? data.furnis : [...prev, ...data.furnis]);
        setHasMore(data.metadata?.hasMore || false);
        
        if (data.metadata?.categories) {
          setCategories(['all', ...data.metadata.categories]);
        }
        
        console.log(`✅ Loaded ${data.furnis.length} furnis`);
      }
    } catch (error) {
      console.error('❌ Error fetching furnis:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

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

  const filteredFurnis = furnis.filter(furni =>
    furni.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PanelCard title="Catálogo de Móveis">
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar móveis..."
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
                className="habbo-input px-4 py-2 capitalize"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="capitalize">
                    {category === 'all' ? 'Todas as Categorias' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Furnis Grid in Window Container */}
          <div className="bg-white border-2 border-gray-300 rounded-lg h-96 overflow-y-auto p-4">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {filteredFurnis.map((furni) => (
                <button
                  key={furni.id}
                  onClick={() => setSelectedFurni(furni)}
                  className="aspect-square bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg p-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
                >
                  <img
                    src={furni.imageUrl}
                    alt={furni.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTggMTJIMTYiIHN0cm9rZT0iIzlCA0E5QyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                    }}
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
                  className="habbo-button-blue px-6 py-2"
                >
                  {loading ? 'Carregando...' : 'Carregar Mais'}
                </button>
              </div>
            )}

            {loading && filteredFurnis.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Carregando móveis...</p>
                </div>
              </div>
            )}

            {!loading && filteredFurnis.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">Nenhum móvel encontrado.</p>
              </div>
            )}
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
