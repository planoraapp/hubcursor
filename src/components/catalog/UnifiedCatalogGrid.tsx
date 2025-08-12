
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useUnifiedClothing, UnifiedClothingItem } from '@/hooks/useUnifiedClothingAPI';
import { EnhancedClothingThumbnail } from '@/components/HabboEditor/EnhancedClothingThumbnail';

interface UnifiedCatalogGridProps {
  onItemSelect?: (item: UnifiedClothingItem) => void;
  selectedCategory?: string;
  className?: string;
}

export const UnifiedCatalogGrid: React.FC<UnifiedCatalogGridProps> = ({
  onItemSelect,
  selectedCategory = 'all',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<'all' | 'M' | 'F' | 'U'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'club'>('name');

  const {
    data: clothingItems = [],
    isLoading,
    error
  } = useUnifiedClothing({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    gender: selectedGender === 'all' ? undefined : selectedGender,
    search: searchTerm || undefined,
    limit: 200
  });

  const filteredAndSortedItems = useMemo(() => {
    let filtered = clothingItems.filter((item: UnifiedClothingItem) => {
      const matchesSearch = !searchTerm || 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_id.toString().includes(searchTerm);
      
      const matchesCategory = selectedCategory === 'all' || item.part === selectedCategory;
      const matchesGender = selectedGender === 'all' || item.gender === selectedGender || item.gender === 'U';
      
      return matchesSearch && matchesCategory && matchesGender;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'category':
          return a.part.localeCompare(b.part);
        case 'club':
          return a.club.localeCompare(b.club);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [clothingItems, searchTerm, selectedCategory, selectedGender, sortBy]);

  const categories = ['all', 'hd', 'hr', 'ch', 'lg', 'sh', 'ha', 'ea', 'fa', 'cc', 'ca', 'wa', 'cp'];
  const genders: ('all' | 'M' | 'F' | 'U')[] = ['all', 'M', 'F', 'U'];

  const handleItemClick = (item: UnifiedClothingItem) => {
    onItemSelect?.(item);
  };

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-lg mb-4">❌ Erro ao carregar catálogo</div>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          🔄 Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, código ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={() => {}}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'Todas' : cat.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Gender Filter */}
            <Select value={selectedGender} onValueChange={(value: 'all' | 'M' | 'F' | 'U') => setSelectedGender(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Gênero" />
              </SelectTrigger>
              <SelectContent>
                {genders.map(gender => (
                  <SelectItem key={gender} value={gender}>
                    {gender === 'all' ? 'Todos' : gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: 'name' | 'category' | 'club') => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="category">Categoria</SelectItem>
                <SelectItem value="club">Club</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid className="w-4 h-4" />
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

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            {isLoading ? (
              'Carregando...'
            ) : (
              `${filteredAndSortedItems.length} itens encontrados`
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando catálogo...</p>
          </div>
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4'
            : 'space-y-2'
          }
        `}>
          {filteredAndSortedItems.map((item: UnifiedClothingItem) => (
            <Card 
              key={`${item.source}-${item.part}-${item.item_id}`}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleItemClick(item)}
            >
              <CardContent className={viewMode === 'grid' ? 'p-3' : 'p-4 flex items-center gap-4'}>
                {/* Thumbnail */}
                <div className={viewMode === 'grid' ? 'aspect-square mb-2' : 'flex-shrink-0'}>
                  <EnhancedClothingThumbnail
                    item={item}
                    size={viewMode === 'grid' ? 's' : 'm'}
                    className="w-full h-full"
                  />
                </div>
                
                {/* Info */}
                <div className={`${viewMode === 'grid' ? 'text-center' : 'flex-1'}`}>
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    ID: {item.item_id} | {item.part.toUpperCase()}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 justify-center">
                    <Badge variant="outline" className="text-xs">
                      {item.gender}
                    </Badge>
                    {item.club === 'HC' && (
                      <Badge variant="secondary" className="text-xs bg-yellow-500 text-black">
                        HC
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {item.source}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredAndSortedItems.length === 0 && !isLoading && (
        <div className="text-center p-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum item encontrado</h3>
          <p className="text-gray-500">Tente ajustar os filtros ou termo de busca</p>
        </div>
      )}
    </div>
  );
};
