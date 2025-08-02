
import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Package } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { IntelligentFurniImage } from './IntelligentFurniImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface HabboFurniItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  source: string;
  description?: string;
  releaseDate?: string;
  rarity?: string;
}

export const CatalogInfiniteV2 = () => {
  const [furnis, setFurnis] = useState<HabboFurniItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>(['all']);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFurnis = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    console.log(`🔍 [CatalogV2] Fetching furnis - Page: ${reset ? 1 : page}, Category: ${selectedCategory}, Search: "${searchTerm}"`);
    
    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('habbo-furni-api', {
        body: {
          limit: 50, // Menor limite para melhor performance
          offset: reset ? 0 : (page - 1) * 50,
          search: searchTerm,
          category: selectedCategory === 'all' ? '' : selectedCategory
        }
      });

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      if (!data) {
        throw new Error('No data received from API');
      }
      
      if (data?.furnis && Array.isArray(data.furnis)) {
        const typedFurnis = data.furnis as HabboFurniItem[];
        
        // Ordenar por data de lançamento (se disponível) ou alfabeticamente
        const sortedFurnis = typedFurnis.sort((a, b) => {
          if (a.releaseDate && b.releaseDate) {
            return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
          }
          return a.name.localeCompare(b.name);
        });
        
        setFurnis(prev => reset ? sortedFurnis : [...prev, ...sortedFurnis]);
        setHasMore(data.metadata?.hasMore || false);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(typedFurnis.map(f => f.category))];
        setCategories(prev => {
          const allCategories = ['all', ...uniqueCategories];
          return [...new Set([...prev, ...allCategories])];
        });
        
        console.log(`✅ [CatalogV2] Loaded ${sortedFurnis.length} furnis`);
      }
    } catch (error) {
      console.error('❌ [CatalogV2] Error:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchTerm, loading]);

  // Reset and fetch on filter changes
  useEffect(() => {
    setPage(1);
    setFurnis([]);
    fetchFurnis(true);
  }, [searchTerm, selectedCategory]);

  // Load more on page change
  useEffect(() => {
    if (page > 1) {
      fetchFurnis();
    }
  }, [page]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-600 mb-2">Erro ao Carregar Catálogo</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => fetchFurnis(true)} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar móveis por nome..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="text-gray-600 w-4 h-4" />
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.filter(cat => cat !== 'all').map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium shadow-sm">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          🌐 {furnis.length} Móveis Carregados
          <span className="bg-blue-200 px-3 py-1 rounded-full text-sm font-bold">
            HabboFurni API
          </span>
        </div>
      </div>

      {/* Furnis Grid */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        {furnis.length === 0 && loading ? (
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
            {Array.from({ length: 50 }, (_, i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        ) : furnis.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum móvel encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
              {furnis.map((furni) => (
                <div
                  key={furni.id}
                  className="group aspect-square p-1 rounded transition-all duration-200 hover:scale-110 hover:z-10 hover:shadow-lg bg-gray-50 hover:bg-gray-100"
                  title={furni.name}
                >
                  <IntelligentFurniImage
                    furni={furni}
                    className="w-full h-full object-contain pixelated"
                  />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-6">
                <Button 
                  onClick={handleLoadMore} 
                  disabled={loading}
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  {loading ? 'Carregando...' : 'Carregar Mais Móveis'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
        <div className="flex justify-center items-center gap-6 flex-wrap">
          <span>📊 Total: {furnis.length} móveis</span>
          <span>🎯 Categoria: {selectedCategory === 'all' ? 'Todas' : selectedCategory}</span>
          {searchTerm && <span>🔍 Busca: "{searchTerm}"</span>}
          <span>🌐 API HabboFurni.com</span>
        </div>
      </div>
    </div>
  );
};
