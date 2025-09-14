
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Grid3X3, 
  List, 
  Heart, 
  Filter,
  SortAsc,
  SortDesc,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface EnhancedItemGridProps {
  items: any[];
  onItemSelect: (item: any) => void;
  selectedItems?: string[];
  loading?: boolean;
  type: 'furni' | 'clothing' | 'badges';
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
  category?: string;
  onCategoryChange?: (category: string) => void;
  categories?: any[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const EnhancedItemGrid: React.FC<EnhancedItemGridProps> = ({
  items = [],
  onItemSelect,
  selectedItems = [],
  loading = false,
  type,
  searchTerm = '',
  onSearchChange,
  category = 'all',
  onCategoryChange,
  categories = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'popular'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Debug log para verificar se os itens chegam ao componente
  console.log(`🔍 [EnhancedItemGrid] Rendering ${type} with ${items.length} items:`, {
    type,
    itemCount: items.length,
    loading,
    firstItem: items[0],
    sampleItems: items.slice(0, 3).map(item => ({ name: item.name, guid: item.guid, image: item.image }))
  });

  const typeConfig = {
    furni: {
      title: 'Móveis',
      color: 'blue',
      gridCols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
      icon: '🪑'
    },
    clothing: {
      title: 'Roupas',
      color: 'purple',
      gridCols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
      icon: '👕'
    },
    badges: {
      title: 'Emblemas',
      color: 'yellow',
      gridCols: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10',
      icon: '🏆'
    }
  };

  const config = typeConfig[type];

  const sortedItems = useMemo(() => {
    let sorted = [...items];
    
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => {
          const comparison = (a.name || '').localeCompare(b.name || '');
          return sortOrder === 'asc' ? comparison : -comparison;
        });
        break;
      case 'date':
        sorted.sort((a, b) => {
          const aDate = new Date(a.created_at || a.updated_at || 0);
          const bDate = new Date(b.created_at || b.updated_at || 0);
          const comparison = aDate.getTime() - bDate.getTime();
          return sortOrder === 'asc' ? comparison : -comparison;
        });
        break;
      case 'popular':
        sorted.sort((a, b) => {
          const aScore = (favorites.includes(a.guid) ? 10 : 0) + (a.status === 'active' ? 5 : 0);
          const bScore = (favorites.includes(b.guid) ? 10 : 0) + (b.status === 'active' ? 5 : 0);
          const comparison = aScore - bScore;
          return sortOrder === 'asc' ? comparison : -comparison;
        });
        break;
    }
    
    return sorted;
  }, [items, sortBy, sortOrder, favorites]);

  const toggleFavorite = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getItemImage = (item: any) => {
    // Log para debug da imagem
        // Usar a imagem fornecida pelos dados mock ou fallback
    return item.image || item.icon || '/placeholder.svg';
  };

  const getItemBadge = (item: any) => {
    if (item.status === 'active') {
      return <Badge className="bg-green-500 text-white text-xs">✓</Badge>;
    }
    if (item.rarity) {
      return <Badge className="bg-purple-500 text-white text-xs">{item.rarity.toUpperCase()}</Badge>;
    }
    if (type === 'clothing' && item.gender && item.gender !== 'U') {
      return (
        <Badge className={`text-white text-xs ${item.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
          {item.gender === 'M' ? '👨' : '👩'}
        </Badge>
      );
    }
    return null;
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as 'name' | 'date' | 'popular');
  };

  const renderGridView = () => {
        return (
      <div className={config.gridCols + ' gap-4'}>
        {sortedItems.map((item, index) => {
          const isSelected = selectedItems.includes(item.guid);
          const isFavorite = favorites.includes(item.guid);
          const isHovered = hoveredItem === item.guid;
          const itemImage = getItemImage(item);

                    return (
            <Card 
              key={item.guid || `item-${index}`}
              className={`group relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                isSelected 
                  ? 'ring-2 ring-purple-500 shadow-lg scale-105' 
                  : 'border-2 border-purple-200 hover:border-purple-400'
              } bg-white/90 backdrop-blur-sm overflow-hidden`}
              onClick={() => onItemSelect(item)}
              onMouseEnter={() => setHoveredItem(item.guid)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <CardContent className="p-3 text-center relative">
                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(item.guid, e)}
                  className={`absolute top-1 right-1 z-10 p-1 rounded-full transition-all duration-200 ${
                    isFavorite 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/80 text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className="w-3 h-3" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>

                {/* Item Image */}
                <div className="relative mb-2">
                  <img
                    src={itemImage}
                    alt={item.name || 'Item'}
                    className={`mx-auto object-contain rounded-lg bg-gray-50 p-1 transition-transform duration-200 ${
                      type === 'badges' ? 'w-12 h-12' : 'w-16 h-16'
                    } ${isHovered ? 'scale-110' : ''}`}
                    style={{ imageRendering: 'pixelated' }}
                    loading="lazy"
                    onError={(e) => {
                                            e.currentTarget.src = '/placeholder.svg';
                    }}
                    onLoad={() => {
                                          }}
                  />
                  
                  {/* Status Badge */}
                  {getItemBadge(item) && (
                    <div className="absolute -top-1 -left-1">
                      {getItemBadge(item)}
                    </div>
                  )}
                </div>
                
                {/* Item Info */}
                <div className="space-y-1">
                  <h4 className={`font-medium text-xs text-gray-800 leading-tight line-clamp-2 ${
                    isHovered ? 'text-gray-900' : ''
                  }`}>
                    {item.name || 'Item sem nome'}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {item.code || item.category || 'N/A'}
                  </p>
                </div>

                {/* Selection Overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-purple-500/20 rounded-lg pointer-events-none" />
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-lg transition-colors duration-200" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-2">
      {sortedItems.map((item) => {
        const isSelected = selectedItems.includes(item.guid);
        const isFavorite = favorites.includes(item.guid);

        return (
          <Card 
            key={item.guid}
            className={`group cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected 
                ? 'ring-2 ring-purple-500 shadow-md' 
                : 'border border-purple-200 hover:border-purple-400'
            } bg-white/90 backdrop-blur-sm`}
            onClick={() => onItemSelect(item)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-4">
                <img
                  src={getItemImage(item)}
                  alt={item.name}
                  className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1"
                  style={{ imageRendering: 'pixelated' }}
                  loading="lazy"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-800 truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {item.description || item.code || item.category}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getItemBadge(item)}
                  
                  <button
                    onClick={(e) => toggleFavorite(item.guid, e)}
                    className={`p-1 rounded-full transition-colors duration-200 ${
                      isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  if (loading) {
        return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-purple-800 mb-2">Carregando {config.title}</h3>
          <p className="text-purple-600">Buscando itens na Puhekupla...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-purple-800 flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            {config.title}
            <Badge variant="secondary">{sortedItems.length}</Badge>
          </h2>
          
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="date">Data</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Items Display */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <span className="text-6xl mb-4 block">{config.icon}</span>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum item encontrado</h3>
          <p className="text-gray-500">Tente ajustar os filtros ou busca</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? renderGridView() : renderListView()}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;
                  
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange?.(page)}
                      className={page === currentPage ? "bg-purple-600" : ""}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedItemGrid;
