import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, RefreshCw } from 'lucide-react';
import SimpleBadgeImage from './SimpleBadgeImage';
import BadgeTooltip from './BadgeTooltip';
import { useHabboApiBadges } from '@/hooks/useHabboApiBadges';

// Interface para BadgeItem
interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: string;
  rarity?: string;
  source?: string;
  scrapedAt?: string;
  hotel?: string;
  isNew?: boolean;
}

interface BadgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Lista de hotéis com bandeiras
const BADGE_HOTELS = [
  { code: 'all', name: 'Todos', flag: null },
  { code: 'com', name: 'Estados Unidos', flag: '/flags/flagcom.png' },
  { code: 'com.br', name: 'Brasil', flag: '/flags/flagbrazil.png' },
  { code: 'es', name: 'Espanha', flag: '/flags/flagspain.png' },
  { code: 'fr', name: 'França', flag: '/flags/flagfrance.png' },
  { code: 'de', name: 'Alemanha', flag: '/flags/flagdeus.png' },
  { code: 'it', name: 'Itália', flag: '/flags/flagitaly.png' },
  { code: 'nl', name: 'Holanda', flag: '/flags/flagnetl.png' },
  { code: 'com.tr', name: 'Turquia', flag: '/flags/flagtrky.png' },
  { code: 'fi', name: 'Finlândia', flag: '/flags/flafinland.png' },
  { code: 'sandbox', name: 'Sandbox', flag: null }
];

const BADGE_CATEGORIES = [
  { name: 'Todos', code: 'all' },
  { name: 'Official', code: 'official' },
  { name: 'Achievements', code: 'achievements' },
  { name: 'Fã-Sites', code: 'fansites' },
  { name: 'Outros', code: 'others' }
];

const BadgeModal = ({ open, onOpenChange }: BadgeModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [allBadges, setAllBadges] = useState<BadgeItem[]>([]);
  const pageSize = 100;
  
  // Usar o hook da API do Habbo com paginação
  const { data: badgesData, isLoading, refetch, isFetchingNextPage } = useHabboApiBadges({
    search: searchTerm,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    enabled: open,
    page: currentPage,
    pageSize
  });

  const currentBadges = badgesData?.badges || [];
  const hasMore = badgesData?.metadata?.hasMore || false;
  
  // Acumular badges para scroll infinito
  useEffect(() => {
    if (currentBadges.length > 0) {
      if (currentPage === 1) {
        // Primeira página - substituir tudo
        setAllBadges(currentBadges);
      } else {
        // Páginas seguintes - adicionar aos existentes
        setAllBadges(prev => [...prev, ...currentBadges]);
      }
    }
  }, [currentBadges, currentPage]);

  // Reset quando mudar filtros ou busca
  useEffect(() => {
    setCurrentPage(1);
    setAllBadges([]);
  }, [searchTerm, selectedCategory, selectedHotel]);

  // Filtrar por hotel
  const filteredBadges = useMemo(() => {
    let result = [...allBadges];
    
    if (selectedHotel !== 'all') {
      result = result.filter(badge => {
        // Usar campo hotel se disponível
        if (badge.hotel) {
          return badge.hotel === selectedHotel;
        }
        
        // Fallback: inferir hotel pelo código
        const code = badge.code.toUpperCase();
        if (selectedHotel === 'com.br' && (code.startsWith('BR') || code.startsWith('PT'))) return true;
        if (selectedHotel === 'com' && code.startsWith('US')) return true;
        if (selectedHotel === 'es' && code.startsWith('ES')) return true;
        if (selectedHotel === 'fr' && code.startsWith('FR')) return true;
        if (selectedHotel === 'de' && code.startsWith('DE')) return true;
        if (selectedHotel === 'it' && code.startsWith('IT')) return true;
        if (selectedHotel === 'nl' && code.startsWith('NL')) return true;
        if (selectedHotel === 'com.tr' && code.startsWith('TR')) return true;
        if (selectedHotel === 'fi' && code.startsWith('FI')) return true;
        
        return false;
      });
    }
    
    return result;
  }, [allBadges, selectedHotel]);

  // Carregar mais badges (scroll infinito)
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && !isFetchingNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, isLoading, isFetchingNextPage]);

  const handleBadgeClick = (badge: BadgeItem) => {
    navigator.clipboard.writeText(badge.code);
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
              onClick={() => refetch()}
              disabled={isLoading}
              className="volter-font text-xs"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </DialogHeader>

        {/* Barra de pesquisa */}
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

        {/* Filtros */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="volter-font text-xs h-7 mb-2"
          >
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
          
          {showFilters && (
            <div className="grid grid-cols-2 gap-4">
              {/* Filtro por Hotel */}
              <div>
                <h3 className="text-xs font-medium text-gray-700 mb-2 volter-font">Hotel:</h3>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {BADGE_HOTELS.map((hotel) => (
                    <div
                      key={hotel.code}
                      className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedHotel === hotel.code
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-gray-100 hover:bg-green-100 text-gray-700'
                      }`}
                      onClick={() => setSelectedHotel(hotel.code)}
                    >
                      {hotel.flag && (
                        <img
                          src={hotel.flag}
                          alt={hotel.name}
                          className="w-4 h-3 object-cover rounded-sm"
                        />
                      )}
                      <span className="volter-font text-xs font-medium">{hotel.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtro por Categoria */}
              <div>
                <h3 className="text-xs font-medium text-gray-700 mb-2 volter-font">Categorias:</h3>
                <div className="flex flex-wrap gap-2">
                  {BADGE_CATEGORIES.map((category) => (
                    <div
                      key={category.code}
                      className={`px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedCategory === category.code
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-gray-100 hover:bg-purple-100 text-gray-700'
                      }`}
                      onClick={() => setSelectedCategory(category.code)}
                    >
                      <span className="volter-font text-xs font-medium">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Conteúdo com Scroll Infinito */}
        <div 
          className="flex-1 overflow-y-auto"
          onScroll={(e) => {
            const target = e.target as HTMLElement;
            const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
            // Carregar mais quando estiver a 200px do final
            if (scrollBottom < 200 && hasMore && !isLoading && !isFetchingNextPage) {
              loadMore();
            }
          }}
        >
          {isLoading && filteredBadges.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 p-2">
              {filteredBadges.map((badge) => (
                <BadgeTooltip
                  key={`badge-${badge.code}-${badge.id}`}
                  code={badge.code}
                  name={badge.name}
                  description={badge.description}
                >
                  <div
                    className="relative cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                    onClick={() => handleBadgeClick(badge)}
                  >
                    {/* Tag NEW para badges novos */}
                    {badge.isNew && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10 shadow-md">
                        NEW
                      </div>
                    )}
                    <SimpleBadgeImage code={badge.code} name={badge.name} size="md" />
                  </div>
                </BadgeTooltip>
              ))}
              
              {/* Loading indicator para próxima página */}
              {isFetchingNextPage && (
                <div className="col-span-full flex items-center justify-center py-4">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              )}
              
              {/* Mensagem quando não há mais badges */}
              {!hasMore && filteredBadges.length > 0 && (
                <div className="col-span-full text-center py-4 text-sm text-gray-500 volter-font">
                  Todos os emblemas foram carregados ({filteredBadges.length} total)
                </div>
              )}
            </div>
          )}
        </div>


        {/* Footer */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-sm text-gray-600 volter-font">
            <span>
              Mostrando {filteredBadges.length} de {badgesData?.metadata?.totalAvailable || 0} emblemas
              {badgesData?.metadata?.totalAvailable && filteredBadges.length < badgesData.metadata.totalAvailable && (
                <span className="ml-2 text-blue-600">(Scroll para carregar mais)</span>
              )}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeModal;
