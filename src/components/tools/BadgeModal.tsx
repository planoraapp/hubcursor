import React, { useState, useMemo } from 'react';
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
  { code: 'tr', name: 'Turquia', flag: '/flags/flagtrky.png' },
  { code: 'fi', name: 'Finlândia', flag: '/flags/flafinland.png' }
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
  const [showAllGrid, setShowAllGrid] = useState(false);
  
  // Usar o hook da API do Habbo
  const { data: badgesData, isLoading, refetch } = useHabboApiBadges({
    limit: showAllGrid ? 5000 : 200,
    search: searchTerm,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    enabled: open
  });

  const badges = badgesData?.badges || [];
  
  // Filtrar por hotel
  const filteredBadges = useMemo(() => {
    let result = [...badges];
    
    if (selectedHotel !== 'all') {
      result = result.filter(badge => {
        const code = badge.code.toUpperCase();
        // Inferir hotel pelo código
        if (selectedHotel === 'com.br' && (code.startsWith('BR') || code.startsWith('PT'))) return true;
        if (selectedHotel === 'com' && code.startsWith('US')) return true;
        if (selectedHotel === 'es' && code.startsWith('ES')) return true;
        if (selectedHotel === 'fr' && code.startsWith('FR')) return true;
        if (selectedHotel === 'de' && code.startsWith('DE')) return true;
        if (selectedHotel === 'it' && code.startsWith('IT')) return true;
        if (selectedHotel === 'nl' && code.startsWith('NL')) return true;
        if (selectedHotel === 'tr' && code.startsWith('TR')) return true;
        if (selectedHotel === 'fi' && code.startsWith('FI')) return true;
        
        // Badges sem código de país específico
        return true;
      });
    }
    
    return result;
  }, [badges, selectedHotel]);
  
  const recentBadges = useMemo(() => filteredBadges.slice(0, 100), [filteredBadges]);
  const classicBadges = useMemo(() => filteredBadges.slice(-100), [filteredBadges]);

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

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {!showAllGrid ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recentes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 volter-font">
                  🆕 Últimos Emblemas ({recentBadges.length})
                </h3>
                <div className="grid grid-cols-8 gap-2 p-2 max-h-[50vh] overflow-y-auto">
                  {recentBadges.map((badge) => (
                    <BadgeTooltip
                      key={`recent-${badge.code}`}
                      code={badge.code}
                      name={badge.name}
                      description={badge.description}
                    >
                      <div
                        className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => handleBadgeClick(badge)}
                      >
                        <SimpleBadgeImage code={badge.code} name={badge.name} size="md" />
                      </div>
                    </BadgeTooltip>
                  ))}
                </div>
              </div>

              {/* Clássicos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 volter-font">
                  🏛️ Mais Antigos ({classicBadges.length})
                </h3>
                <div className="grid grid-cols-8 gap-2 p-2 max-h-[50vh] overflow-y-auto">
                  {classicBadges.map((badge) => (
                    <BadgeTooltip
                      key={`classic-${badge.code}`}
                      code={badge.code}
                      name={badge.name}
                      description={badge.description}
                    >
                      <div
                        className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => handleBadgeClick(badge)}
                      >
                        <SimpleBadgeImage code={badge.code} name={badge.name} size="md" />
                      </div>
                    </BadgeTooltip>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-12 gap-2 p-2">
                {filteredBadges.map((badge) => (
                  <BadgeTooltip
                    key={`all-${badge.code}`}
                    code={badge.code}
                    name={badge.name}
                    description={badge.description}
                  >
                    <div
                      className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => handleBadgeClick(badge)}
                    >
                      <SimpleBadgeImage code={badge.code} name={badge.name} size="md" />
                    </div>
                  </BadgeTooltip>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão Ver Todos */}
        {!showAllGrid && (
          <div className="flex justify-center pt-4 border-t mt-4">
            <Button
              onClick={() => setShowAllGrid(true)}
              className="habbo-button-blue sidebar-font-option-4 px-8 py-2"
            >
              📋 Ver Todos os Emblemas ({badgesData?.metadata?.totalAvailable || filteredBadges.length})
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-sm text-gray-600 volter-font">
            <span>
              {showAllGrid
                ? `Mostrando ${filteredBadges.length} emblemas`
                : `Últimos: ${recentBadges.length} | Antigos: ${classicBadges.length}`
              }
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeModal;
