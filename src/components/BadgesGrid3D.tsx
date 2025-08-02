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
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showMobileViewer, setShowMobileViewer] = useState(false);
  
  const isMobile = useIsMobile();

  const fetchBadges = useCallback(async (pageNum: number, category: string, reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log(`🔄 Fetching mega badges page ${pageNum}, category: ${category}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-emotion-badges', {
        body: { page: pageNum, limit: 200, category }
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
        
        console.log(`✅ Loaded ${data.badges.length} mega badges`);
      }
    } catch (error) {
      console.error('❌ Error fetching mega badges:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    setBadges([]);
    setPage(1);
    fetchBadges(1, selectedCategory, true);
  }, [selectedCategory]);

  // Auto-detectar modo mobile
  useEffect(() => {
    setViewMode(isMobile ? 'mobile' : 'desktop');
  }, [isMobile]);

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

  const handleBadgeSelect = (badge: BadgeItem) => {
    setSelectedBadge(badge);
  };

  const getRarityClass = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-200 to-orange-200 border-yellow-400 shadow-yellow-200';
      case 'rare': return 'from-purple-200 to-pink-200 border-purple-400 shadow-purple-200';
      case 'uncommon': return 'from-blue-200 to-indigo-200 border-blue-400 shadow-blue-200';
      default: return 'from-gray-200 to-gray-300 border-gray-400 shadow-gray-200';
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
      <PanelCard title="Emblemas do Habbo - Mega Collection">
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

          {/* Enhanced Badges Grid with 3D Effect */}
          <div className="bg-white border-2 border-gray-300 rounded-lg h-[650px] overflow-y-auto p-6">
            <div className={`grid gap-3 ${
              isMobile 
                ? 'grid-cols-4 md:grid-cols-6' 
                : 'grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16'
            }`}>
              {filteredBadges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => handleBadgeSelect(badge)}
                  className={`group relative aspect-square bg-gradient-to-br ${getRarityClass(badge.rarity)} 
                    border-2 rounded-lg p-2 transition-all duration-300 
                    hover:scale-110 hover:shadow-2xl hover:-translate-y-3 hover:rotate-2
                    transform-gpu perspective-1000 hover:z-10 active:scale-95`}
                  style={{
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)'
                  }}
                  title={`${badge.code} - ${badge.name}`}
                >
                  {/* 3D depth effect background */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  
                  {/* Badge image */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <IntelligentBadgeImage
                      code={badge.code}
                      name={badge.name}
                      size="md"
                      className="filter drop-shadow-sm group-hover:drop-shadow-lg transition-all duration-300"
                    />
                  </div>
                  
                  {/* Floating tooltip */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                    opacity-0 group-hover:opacity-100 transition-all duration-300 
                    bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 
                    shadow-lg border border-gray-300">
                    {badge.code}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 
                      border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-black">
                    </div>
                  </div>
                  
                  {/* Rarity indicator */}
                  {badge.rarity !== 'common' && (
                    <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
                      badge.rarity === 'legendary' ? 'bg-yellow-500' :
                      badge.rarity === 'rare' ? 'bg-purple-500' : 'bg-blue-500'
                    } shadow-lg`}>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && filteredBadges.length > 0 && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="habbo-button-blue px-8 py-3 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Carregando Mega Emblemas...
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
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
                  <p className="text-gray-600 text-lg font-semibold">Carregando Mega Collection...</p>
                  <p className="text-gray-500 text-sm mt-2">Buscando nas melhores fontes disponíveis</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredBadges.length === 0 && (
              <div className="text-center py-20">
                <Award className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <p className="text-gray-600 text-xl font-semibold mb-2">Nenhum emblema encontrado</p>
                <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
              </div>
            )}
          </div>

          {/* Enhanced Statistics */}
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
              {isMobile && (
                <span className="flex items-center gap-1">
                  📱 <strong>Modo:</strong> Mobile com gestos
                </span>
              )}
            </div>
          </div>
        </div>
      </PanelCard>

      {/* Desktop Modal */}
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
              <div className="inline-block p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full shadow-lg">
                <IntelligentBadgeImage
                  code={selectedBadge.code}
                  name={selectedBadge.name}
                  size="lg"
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
