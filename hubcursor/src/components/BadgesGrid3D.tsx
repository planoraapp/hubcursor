
import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Award, Smartphone, Monitor } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { supabase } from '@/integrations/supabase/client';
import IntelligentBadgeImage from './IntelligentBadgeImage';
import { MobileBadgesViewer } from './MobileBadgesViewer';
import { MobileBadgeModal } from './MobileBadgeModal';
import { useIsMobile } from '../hooks/use-mobile';

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  rarity: string;
}

export const BadgesGrid3D = () => {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showMobileViewer, setShowMobileViewer] = useState(false);
  
  const isMobile = useIsMobile();

  const fetchBadges = useCallback(async (pageNum: number, category: string, reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log(`🔄 Fetching mega badges V2 page ${pageNum}, category: ${category}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-emotion-badges', {
        body: { page: pageNum, limit: 400, category }
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
        
        console.log(`✅ Loaded ${data.badges.length} mega badges V2`);
        console.log(`📊 Total badges loaded: ${reset ? data.badges.length : badges.length + data.badges.length}`);
      }
    } catch (error) {
      console.error('❌ Error fetching mega badges V2:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, badges.length]);

  useEffect(() => {
    setBadges([]);
    setPage(1);
    fetchBadges(1, selectedCategory, true);
  }, [selectedCategory]);

  // Auto-detectar modo mobile
  useEffect(() => {
    if (isMobile && !showMobileViewer) {
      // Manter interface normal no mobile também
    }
  }, [isMobile, showMobileViewer]);

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBadges(nextPage, selectedCategory);
    }
  };

  // Auto-load more when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.badges-scroll-container');
      if (!scrollContainer || loading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMore();
      }
    };

    const scrollContainer = document.querySelector('.badges-scroll-container');
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, page]);

  const filteredBadges = badges.filter(badge =>
    badge.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBadgeSelect = (badge: BadgeItem) => {
    setSelectedBadge(badge);
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

  // Renderizar viewer mobile em tela cheia
  if (showMobileViewer) {
    return (
      <>
        <MobileBadgesViewer 
          badges={filteredBadges} 
          onBadgeSelect={handleBadgeSelect}
        />
        {selectedBadge && (
          <MobileBadgeModal
            badge={selectedBadge}
            onClose={() => setSelectedBadge(null)}
          />
        )}
        <button
          onClick={() => setShowMobileViewer(false)}
          className="fixed top-4 right-4 z-50 p-3 bg-black/80 text-white rounded-full"
        >
          <Monitor size={20} />
        </button>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PanelCard title="Emblemas do Habbo - Mega Collection V2">
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar emblemas por código ou nome..."
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
              
              {/* Botão do Mobile Viewer */}
              {isMobile && (
                <button
                  onClick={() => setShowMobileViewer(true)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  title="Abrir visualizador com gestos"
                >
                  <Smartphone size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Interface Limpa - Grid Otimizado */}
          <div className="bg-white border-2 border-gray-300 rounded-lg h-[650px] overflow-y-auto p-4 badges-scroll-container">
            <div className={`grid gap-1 ${
              isMobile 
                ? 'grid-cols-8 sm:grid-cols-10' 
                : 'grid-cols-15 md:grid-cols-20 lg:grid-cols-25 xl:grid-cols-30'
            }`}>
              {filteredBadges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => handleBadgeSelect(badge)}
                  className="group relative w-8 h-8 md:w-10 md:h-10 hover:bg-gray-100 rounded transition-colors duration-200 p-0.5"
                  title={`${badge.code} - ${badge.name}`}
                >
                  {/* Badge image - tamanho original, sem bordas */}
                  <IntelligentBadgeImage
                    code={badge.code}
                    name={badge.name}
                    size="md"
                    transparent={true}
                    className="w-full h-full"
                  />
                  
                  {/* Indicador de raridade - sutil */}
                  {badge.rarity !== 'common' && (
                    <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full shadow-sm ${
                      badge.rarity === 'legendary' ? 'bg-yellow-500' :
                      badge.rarity === 'rare' ? 'bg-purple-500' : 'bg-blue-500'
                    }`} />
                  )}
                </button>
              ))}
            </div>

            {/* Load More Button - sempre visível se há mais */}
            {hasMore && filteredBadges.length > 0 && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="habbo-button-blue px-6 py-2 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Carregando...
                    </span>
                  ) : (
                    'Carregar Mais Emblemas'
                  )}
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && filteredBadges.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-semibold">Carregando Mega Collection V2...</p>
                  <p className="text-gray-500 text-sm mt-1">Buscando 1000+ emblemas</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredBadges.length === 0 && (
              <div className="text-center py-20">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-semibold mb-2">Nenhum emblema encontrado</p>
                <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
              </div>
            )}
          </div>

          {/* Estatísticas Otimizadas */}
          <div className="text-sm text-gray-500 text-center bg-gray-50 rounded-lg p-3">
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <span className="flex items-center gap-1">
                📊 <strong>Total:</strong> {badges.length} emblemas
              </span>
              <span className="flex items-center gap-1">
                🔍 <strong>Filtrados:</strong> {filteredBadges.length}
              </span>
              <span className="flex items-center gap-1">
                ⭐ <strong>Raros:</strong> {badges.filter(b => b.rarity !== 'common').length}
              </span>
              <span className="flex items-center gap-1">
                🎯 <strong>Página:</strong> {page}
              </span>
              {hasMore && (
                <span className="flex items-center gap-1">
                  📈 <strong>Mais disponíveis</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </PanelCard>

      {/* Desktop Modal - limpo */}
      {selectedBadge && !showMobileViewer && !isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedBadge.name}</h3>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="text-center mb-4">
              <div className="inline-block p-4 bg-gray-50 rounded-lg">
                <IntelligentBadgeImage
                  code={selectedBadge.code}
                  name={selectedBadge.name}
                  size="lg"
                  transparent={false}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-mono">
                  {selectedBadge.code}
                </span>
              </div>
              
              <div>
                <span className="font-semibold">Categoria:</span> 
                <span className="ml-2 capitalize">{getCategoryName(selectedBadge.category)}</span>
              </div>
              
              <div>
                <span className="font-semibold">Raridade:</span> 
                <span className={`ml-2 capitalize font-semibold ${
                  selectedBadge.rarity === 'legendary' ? 'text-yellow-600' :
                  selectedBadge.rarity === 'rare' ? 'text-purple-600' :
                  selectedBadge.rarity === 'uncommon' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {selectedBadge.rarity === 'legendary' ? 'Lendário' :
                   selectedBadge.rarity === 'rare' ? 'Raro' :
                   selectedBadge.rarity === 'uncommon' ? 'Incomum' : 'Comum'}
                </span>
              </div>
              
              <div>
                <span className="font-semibold">Descrição:</span>
                <p className="mt-1 text-gray-600">{selectedBadge.description}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <Award className="w-5 h-5 text-yellow-600 mx-auto" />
              <p className="text-xs text-gray-500 mt-1">Emblema Oficial do Habbo</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Modal */}
      {selectedBadge && (isMobile || showMobileViewer) && (
        <MobileBadgeModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};
