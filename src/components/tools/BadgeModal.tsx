import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X, RefreshCw } from 'lucide-react';
import SimpleBadgeImage from './SimpleBadgeImage';
import BadgeTooltip from './BadgeTooltip';
import { getBadges, getBadgeStats, getAvailableCategories, getAvailableCountries, getRecentBadges, getClassicBadges, getLoadingProgress, type Badge as SupabaseBadgeType, type BadgeFilters } from '@/lib/supabase-badges';

// Usar o tipo Badge do Supabase
type BadgeItem = SupabaseBadgeType;

interface BadgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Lista de países/regiões com bandeiras (será carregada dinamicamente)
const BADGE_COUNTRIES = [
  { name: 'Todos', flag: null },
  { name: 'Brasil/Portugal', flag: '/flags/flagbrpt.png' },
  { name: 'Espanha', flag: '/flags/flagspain.png' },
  { name: 'França', flag: '/flags/flagfrance.png' },
  { name: 'Alemanha', flag: '/flags/flagdeus.png' },
  { name: 'Itália', flag: '/flags/flagitaly.png' },
  { name: 'Holanda', flag: '/flags/flagnetl.png' },
  { name: 'Turquia', flag: '/flags/flagtrky.png' },
  { name: 'Finlândia', flag: '/flags/flafinland.png' },
  { name: 'Estados Unidos', flag: '/flags/flagcom.png' },
  { name: 'Reino Unido', flag: '/flags/flagcom.png' }
];

// Lista de categorias especiais (será carregada dinamicamente)
const BADGE_CATEGORIES = [
  { name: 'Todos', code: 'all' },
  { name: 'Staff', code: 'staff' },
  { name: 'Achievements', code: 'achievements' },
  { name: 'Fã-Sites', code: 'fansites' }
];

// Removido: função antiga de geração de badges
// Agora usamos o banco de dados diretamente

const BadgeModal = ({ open, onOpenChange }: BadgeModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Todos');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayedBadges, setDisplayedBadges] = useState<BadgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, filtered: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [recentBadges, setRecentBadges] = useState<BadgeItem[]>([]);
  const [classicBadges, setClassicBadges] = useState<BadgeItem[]>([]);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0, isGenerating: false });

  const ITEMS_PER_PAGE = 50;

  // Monitorar progresso de carregamento
  useEffect(() => {
    const interval = setInterval(() => {
      const progress = getLoadingProgress();
      setLoadingProgress(progress);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Carregar países e categorias disponíveis
      const [countries, categories, badgeStats] = await Promise.all([
        getAvailableCountries(),
        getAvailableCategories(),
        getBadgeStats()
      ]);
      
      setAvailableCountries(countries);
      setAvailableCategories(categories);
      setStats({ total: badgeStats.total, filtered: badgeStats.total });
      
    } catch (error) {
          } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar emblemas mais recentes (100 mais recentes)
  const loadRecentBadgesData = useCallback(async () => {
    try {
      const badges = await getRecentBadges(100);
      setRecentBadges(badges);
    } catch (error) {
          }
  }, []);

  // Carregar emblemas clássicos (100 aleatórios dos 5000 mais antigos)
  const loadClassicBadgesData = useCallback(async () => {
    try {
      // Buscar 5000 mais antigos e pegar 100 aleatórios
      const allClassic = await getClassicBadges(5000);
      
      // Embaralhar e pegar 100 aleatórios
      const shuffled = allClassic.sort(() => Math.random() - 0.5);
      setClassicBadges(shuffled.slice(0, 100));
    } catch (error) {
          }
  }, []);

  // Carregar badges com filtros
  const loadBadges = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setDisplayedBadges([]);
        setHasMore(true);
      }
      
      if (!hasMore && !reset) return;
      
      setIsLoading(true);
      
      const filters: BadgeFilters = {
        search: searchTerm || undefined,
        country: selectedCountry !== 'Todos' ? selectedCountry : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        limit: ITEMS_PER_PAGE,
        offset: reset ? 0 : displayedBadges.length
      };
      
      const badges = await getBadges(filters);
      
      if (reset) {
        setDisplayedBadges(badges);
      } else {
        setDisplayedBadges(prev => [...prev, ...badges]);
      }
      
      setHasMore(badges.length === ITEMS_PER_PAGE);
      setStats(prev => ({ ...prev, filtered: badges.length }));
      
    } catch (error) {
          } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCountry, selectedCategory, displayedBadges.length, hasMore]);

  // Carregar grid completo com 1000 emblemas inicialmente
  const loadFullGrid = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Carregar 1000 emblemas inicialmente
      const initialBadges = await getBadges({
        search: searchTerm || undefined,
        country: selectedCountry !== 'Todos' ? selectedCountry : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        offset: 0,
        limit: 1000
      });
      
      setDisplayedBadges(initialBadges);
      setHasMore(initialBadges.length === 1000);
      
    } catch (error) {
          } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCountry, selectedCategory]);

  // Atualizar dados (refresh)
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadInitialData();
      await loadRecentBadgesData();
      await loadClassicBadgesData();
      if (showAllGrid) {
        await loadBadges(true);
      }
    } catch (error) {
          } finally {
      setIsRefreshing(false);
    }
  }, [loadInitialData, loadRecentBadgesData, loadClassicBadgesData, loadBadges, showAllGrid]);

  // Alternar entre grids e visão completa
  const toggleShowAll = useCallback(async () => {
    if (!showAllGrid) {
      setShowAllGrid(true);
      await loadFullGrid();
    } else {
      setShowAllGrid(false);
    }
  }, [showAllGrid, loadFullGrid]);

  // Carregar mais emblemas (scroll infinito)
  const loadMoreBadges = useCallback(() => {
    if (isLoading || !hasMore) return;
    loadBadges(false);
  }, [isLoading, hasMore, loadBadges]);

  // Reset quando filtros mudam
  useEffect(() => {
    loadBadges(true);
  }, [searchTerm, selectedCountry, selectedCategory, loadBadges]);

  // Carregar inicial
  useEffect(() => {
    if (open) {
      loadInitialData();
      loadRecentBadgesData();
      loadClassicBadgesData();
    }
  }, [open, loadInitialData, loadRecentBadgesData, loadClassicBadgesData]);

  // Scroll infinito
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Recolher filtros quando scroll para baixo
    if (scrollTop > 50 && showFilters) {
      setShowFilters(false);
    }
    
    // Mostrar filtros quando scroll para cima (próximo ao topo)
    if (scrollTop < 20 && !showFilters) {
      setShowFilters(true);
    }
    
    // Carregar mais emblemas
    if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !isLoading) {
      loadMoreBadges();
    }
    
    setScrollPosition(scrollTop);
  }, [hasMore, isLoading, loadMoreBadges, showFilters]);

  const handleBadgeClick = (badge: BadgeItem) => {
    // Copiar código do emblema para clipboard
    navigator.clipboard.writeText(badge.code);
    // Aqui você pode adicionar uma notificação de sucesso
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="volter-font text-2xl">🏆 Emblemas do Habbo Hotel</DialogTitle>
              <DialogDescription className="volter-font">
                Explore todos os emblemas disponíveis. Clique para copiar o código.
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="volter-font text-xs"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </DialogHeader>

        {/* Barra de pesquisa compacta */}
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <Input
            placeholder="Buscar emblemas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-8 text-sm volter-font"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Seções de filtro */}
        <div className="mb-4">
          <div className="flex items-start gap-4">
            {/* Botão para mostrar/ocultar filtros */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="volter-font text-xs h-7 flex-shrink-0"
            >
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>

            {/* Seções de filtro */}
            <div className={`flex-1 transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="grid grid-cols-2 gap-4">
                {/* Países - Coluna Esquerda */}
                <div>
                  <h3 className="text-xs font-medium text-gray-700 mb-2 volter-font">Países/Regiões:</h3>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedCountry === 'Todos' 
                          ? 'bg-green-500 text-white shadow-md' 
                          : 'bg-gray-100 hover:bg-green-100 text-gray-700'
                      }`}
                      onClick={() => setSelectedCountry('Todos')}
                    >
                      <span className="volter-font text-xs font-medium">Todos</span>
                    </div>
                    {availableCountries.map((country) => {
                      const countryInfo = BADGE_COUNTRIES.find(c => c.name === country);
                      return (
                        <div
                          key={country}
                          className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-all ${
                            selectedCountry === country 
                              ? 'bg-green-500 text-white shadow-md' 
                              : 'bg-gray-100 hover:bg-green-100 text-gray-700'
                          }`}
                          onClick={() => setSelectedCountry(country)}
                        >
                          {countryInfo?.flag && (
                            <img 
                              src={countryInfo.flag} 
                              alt={country}
                              className="w-4 h-3 object-cover rounded-sm"
                            />
                          )}
                          <span className="volter-font text-xs font-medium">
                            {country}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Categorias - Coluna Direita */}
                <div>
                  <h3 className="text-xs font-medium text-gray-700 mb-2 volter-font">Categorias:</h3>
                  <div className="flex flex-wrap gap-2">
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedCategory === 'all' 
                          ? 'bg-purple-500 text-white shadow-md' 
                          : 'bg-gray-100 hover:bg-purple-100 text-gray-700'
                      }`}
                      onClick={() => setSelectedCategory('all')}
                    >
                      <span className="volter-font text-xs font-medium">Todos</span>
                    </div>
                    {availableCategories.filter(cat => cat !== 'all').map((category) => (
                      <div
                        key={category}
                        className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-all ${
                          selectedCategory === category 
                            ? 'bg-purple-500 text-white shadow-md' 
                            : 'bg-gray-100 hover:bg-purple-100 text-gray-700'
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        <span className="volter-font text-xs font-medium">
                          {category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-y-auto">
          {!showAllGrid ? (
            // Dois grids lado a lado com scroll independente
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Grid de emblemas recentes */}
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 volter-font flex items-center gap-2">
                  🆕 Últimos Emblemas
                  <span className="text-sm text-gray-500">({recentBadges.length})</span>
                </h3>
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                  <div className="grid grid-cols-8 gap-2 p-2">
                    {recentBadges.map((badge, index) => (
                      <BadgeTooltip
                        key={`recent-${badge.code}-${index}`}
                        code={badge.code}
                        name={badge.name}
                        description={badge.description}
                        categories={badge.categories}
                        countries={badge.countries}
                        showOnHover={true}
                        showOnClick={true}
                      >
                        <div
                          className="group cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={() => handleBadgeClick(badge)}
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <SimpleBadgeImage 
                              code={badge.code} 
                              name={badge.name}
                              size="md"
                            />
                            <span className="text-xs text-center text-gray-600 volter-font truncate w-full">
                              {badge.name}
                            </span>
                          </div>
                        </div>
                      </BadgeTooltip>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid de emblemas clássicos */}
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 volter-font flex items-center gap-2">
                  🏛️ Mais Antigos
                  <span className="text-sm text-gray-500">({classicBadges.length})</span>
                </h3>
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                  <div className="grid grid-cols-8 gap-2 p-2">
                    {classicBadges.map((badge, index) => (
                      <BadgeTooltip
                        key={`classic-${badge.code}-${index}`}
                        code={badge.code}
                        name={badge.name}
                        description={badge.description}
                        categories={badge.categories}
                        countries={badge.countries}
                        showOnHover={true}
                        showOnClick={true}
                      >
                        <div
                          className="group cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={() => handleBadgeClick(badge)}
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <SimpleBadgeImage 
                              code={badge.code} 
                              name={badge.name}
                              size="md"
                            />
                            <span className="text-xs text-center text-gray-600 volter-font truncate w-full">
                              {badge.name}
                            </span>
                          </div>
                        </div>
                      </BadgeTooltip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Grid completo com filtros
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 volter-font">
                  📋 Todos os Emblemas
                </h3>
                <Button
                  variant="outline"
                  onClick={toggleShowAll}
                  className="volter-font text-sm"
                >
                  ← Voltar aos Grids
                </Button>
              </div>
              
              <div 
                className="overflow-y-auto"
                onScroll={handleScroll}
                style={{ maxHeight: '60vh' }}
              >
                <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-2 p-2">
                  {displayedBadges.map((badge, index) => (
                    <BadgeTooltip
                      key={`all-${badge.code}-${index}`}
                      code={badge.code}
                      name={badge.name}
                      description={badge.description}
                      categories={badge.categories}
                      countries={badge.countries}
                      showOnHover={true}
                      showOnClick={true}
                    >
                      <div
                        className="group cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => handleBadgeClick(badge)}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <SimpleBadgeImage 
                            code={badge.code} 
                            name={badge.name}
                            size="md"
                          />
                          <span className="text-xs text-center text-gray-600 volter-font truncate w-full">
                            {badge.name}
                          </span>
                        </div>
                      </div>
                    </BadgeTooltip>
                  ))}
                </div>

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-center py-6">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="text-sm text-gray-500 volter-font">Carregando emblemas...</span>
                      {loadingProgress.total > 0 && (
                        <div className="w-64 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(loadingProgress.loaded / loadingProgress.total) * 100}%` }}
                          ></div>
                        </div>
                      )}
                      {loadingProgress.total > 0 && (
                        <span className="text-xs text-gray-500 volter-font">
                          {loadingProgress.loaded} de {loadingProgress.total} emblemas carregados
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* No more items */}
                {!hasMore && displayedBadges.length > 0 && (
                  <div className="text-center py-4 text-gray-500 volter-font">
                    Todos os emblemas foram carregados
                  </div>
                )}

                {/* No results */}
                {displayedBadges.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500 volter-font">
                    Nenhum emblema encontrado
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botão Ver Todos - só aparece quando não está no grid completo */}
        {!showAllGrid && (
          <div className="flex justify-center pt-4 border-t mt-4">
            <Button onClick={toggleShowAll} className="habbo-button-blue sidebar-font-option-4 px-8 py-2" size="lg"
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                letterSpacing: '0.2px'
              }}>
              📋 Ver Todos os Emblemas
            </Button>
          </div>
        )}

        {/* Footer com estatísticas */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-sm text-gray-600 volter-font">
            <span>
              {showAllGrid 
                ? `Mostrando ${displayedBadges.length} de ${stats.filtered} emblemas`
                : `Últimos: ${recentBadges.length} | Antigos: ${classicBadges.length}`
              }
            </span>
            <span className="text-xs text-gray-500">
              {stats.total} emblemas no total
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeModal;
