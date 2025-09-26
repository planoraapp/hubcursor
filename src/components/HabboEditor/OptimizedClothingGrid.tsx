import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Filter, Grid3X3, List, Star, Crown, Zap } from 'lucide-react';
import { useUnifiedHabboCategory, UnifiedHabboClothingItem } from '@/hooks/useUnifiedHabboClothing';
import { useImagePreloader } from '@/hooks/useAdvancedCache';
import { useToast } from '@/hooks/use-toast';

interface OptimizedClothingGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: UnifiedHabboClothingItem, colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  className?: string;
}

const OptimizedClothingGrid: React.FC<OptimizedClothingGridProps> = ({
  selectedCategory,
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem = '',
  selectedColor = '1',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showHCOnly, setShowHCOnly] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'figureId' | 'source'>('name');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const { data: items, isLoading, error } = useUnifiedHabboCategory(selectedCategory, selectedGender);
  const { preloadBatch } = useImagePreloader();

  // Filtrar e ordenar itens
  const filteredAndSortedItems = useMemo(() => {
    if (!items) return [];

    let filtered = items;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.figureId.includes(searchTerm)
      );
    }

    // Filtro por HC
    if (showHCOnly) {
      filtered = filtered.filter(item => item.club === 'HC');
    }

    // Filtro por fonte
    if (selectedSource !== 'all') {
      filtered = filtered.filter(item => item.source === selectedSource);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'figureId':
          return parseInt(a.figureId) - parseInt(b.figureId);
        case 'source':
          return a.source.localeCompare(b.source);
        default:
          return 0;
      }
    });

    // Favoritos primeiro
    filtered.sort((a, b) => {
      const aIsFavorite = favorites.has(a.id);
      const bIsFavorite = favorites.has(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return 0;
    });

    return filtered;
  }, [items, searchTerm, showHCOnly, selectedSource, sortBy, favorites]);

  // Estatísticas por fonte
  const sourceStats = useMemo(() => {
    const stats: Record<string, number> = {};
    items?.forEach(item => {
      stats[item.source] = (stats[item.source] || 0) + 1;
    });
    return stats;
  }, [items]);

  // Preload de imagens para itens visíveis
  useEffect(() => {
    if (filteredAndSortedItems.length > 0) {
      const urlsToPreload = filteredAndSortedItems
        .slice(0, 20) // Preload apenas os primeiros 20
        .map(item => item.thumbnailUrl);
      
      preloadBatch(urlsToPreload);
    }
  }, [filteredAndSortedItems, preloadBatch]);

  const handleItemClick = useCallback((item: UnifiedHabboClothingItem) => {
        onItemSelect(item, selectedColor);
  }, [onItemSelect, selectedColor]);

  const handleColorChange = useCallback((item: UnifiedHabboClothingItem, colorId: string) => {
        onItemSelect(item, colorId);
  }, [onItemSelect]);

  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  }, []);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'viajovem': return '🟢';
      case 'habbowidgets': return '🔵';
      case 'official-habbo': return '🟣';
      case 'flash-assets': return '🟠';
      default: return '⚪';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'viajovem': return 'bg-green-100 text-green-800';
      case 'habbowidgets': return 'bg-blue-100 text-blue-800';
      case 'official-habbo': return 'bg-purple-100 text-purple-800';
      case 'flash-assets': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Carregando sistema otimizado...</span>
      </div>
    );
  }

  if (error) {
        return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p className="font-medium">Erro ao carregar sistema otimizado</p>
          <p className="text-sm text-gray-600 mt-1">Múltiplas fontes indisponíveis</p>
        </div>
      </Card>
    );
  }

  if (!filteredAndSortedItems.length) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">Nenhum item encontrado</p>
          <p className="text-sm mt-2">Categoria: {selectedCategory} - Gênero: {selectedGender}</p>
          <Badge variant="outline" className="mt-2">Sistema Otimizado</Badge>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controles de Filtro e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>

            {/* Filtro por fonte */}
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fontes ({items?.length || 0})</SelectItem>
                {Object.entries(sourceStats).map(([source, count]) => (
                  <SelectItem key={source} value={source}>
                    {getSourceIcon(source)} {source} ({count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ordenação */}
            <Select value={sortBy} onValueChange={(value: 'name' | 'figureId' | 'source') => setSortBy(value)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="figureId">ID</SelectItem>
                <SelectItem value="source">Fonte</SelectItem>
              </SelectContent>
            </Select>

            {/* Controles */}
            <div className="flex gap-2">
              <Button
                variant={showHCOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowHCOnly(!showHCOnly)}
                className="h-9 text-xs"
              >
                <Crown className="w-3 h-3 mr-1" />
                HC
              </Button>
              <Button
                variant={viewMode === 'grid' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-9 text-xs"
              >
                <Grid3X3 className="w-3 h-3" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-9 text-xs"
              >
                <List className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Itens */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
          : "space-y-2"
      }>
        {filteredAndSortedItems.map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedItem === item.figureId ? 'ring-2 ring-purple-500' : ''
            } ${favorites.has(item.id) ? 'ring-1 ring-yellow-400' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <CardContent className="p-3">
              {viewMode === 'grid' ? (
                // Vista em Grid
                <div className="space-y-2">
                  <div className="relative">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="w-full h-16 object-cover rounded bg-gray-100"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-clothing.png';
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                    >
                      <Star className={`w-3 h-3 ${favorites.has(item.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getSourceColor(item.source)}`}>
                        {getSourceIcon(item.source)} {item.source}
                      </Badge>
                      {item.club === 'HC' && (
                        <Crown className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">ID: {item.figureId}</p>
                  </div>
                </div>
              ) : (
                // Vista em Lista
                <div className="flex items-center space-x-3">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded bg-gray-100"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-clothing.png';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getSourceColor(item.source)}`}>
                        {getSourceIcon(item.source)} {item.source}
                      </Badge>
                      {item.club === 'HC' && (
                        <Crown className="w-3 h-3 text-yellow-500" />
                      )}
                      <span className="text-xs text-gray-500">ID: {item.figureId}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                  >
                    <Star className={`w-4 h-4 ${favorites.has(item.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Mostrando {filteredAndSortedItems.length} de {items?.length || 0} itens</span>
            <div className="flex items-center space-x-4">
              <span>Favoritos: {favorites.size}</span>
              <div className="flex space-x-1">
                {Object.entries(sourceStats).map(([source, count]) => (
                  <Badge key={source} className={`text-xs ${getSourceColor(source)}`}>
                    {getSourceIcon(source)} {count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedClothingGrid;

