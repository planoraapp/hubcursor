
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Grid3X3, 
  List, 
  Heart, 
  SortAsc,
  SortDesc,
  Palette
} from 'lucide-react';
import type { PuhekuplaClothing } from '@/hooks/usePuhekuplaData';

interface PuhekuplaClothingGridCleanProps {
  items: PuhekuplaClothing[];
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  onItemSelect: (itemId: string) => void;
  onColorSelect: (colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
}

const PuhekuplaClothingGridClean: React.FC<PuhekuplaClothingGridCleanProps> = ({
  items,
  selectedCategory,
  selectedGender,
  onItemSelect,
  onColorSelect,
  selectedItem,
  selectedColor = '1',
  searchTerm = '',
  onSearchChange
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'gender'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Mapear categorias Puhekupla para categorias Habbo
  const categoryMapping: Record<string, string[]> = {
    'hd': ['head', 'face'],
    'hr': ['hair'],
    'ha': ['hat', 'head_accessories'],
    'ea': ['eye_accessories', 'glasses'],
    'fa': ['face_accessories'],
    'ch': ['chest', 'shirt', 'top'],
    'cc': ['coat', 'jacket'],
    'ca': ['chest_accessories'],
    'cp': ['chest_print'],
    'lg': ['legs', 'pants', 'trousers'],
    'sh': ['shoes', 'footwear'],
    'wa': ['waist', 'belt']
  };

  // Filtrar itens por categoria e gênero
  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Filtro por categoria
      const allowedCategories = categoryMapping[selectedCategory] || [selectedCategory];
      const matchesCategory = allowedCategories.includes(item.category.toLowerCase());
      
      // Filtro por gênero
      const matchesGender = item.gender === 'U' || item.gender === selectedGender;
      
      // Filtro por busca
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesGender && matchesSearch;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'gender':
          comparison = a.gender.localeCompare(b.gender);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, selectedCategory, selectedGender, searchTerm, sortBy, sortOrder]);

  const toggleFavorite = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: PuhekuplaClothing) => {
    const itemId = item.code.replace(/^[a-z]{2}[-_]?/i, '') || item.guid;
    onItemSelect(itemId);
    console.log('🎯 [PuhekuplaClothingGrid] Item selecionado:', {
      name: item.name,
      code: item.code,
      extractedId: itemId,
      category: item.category
    });
  };

  const renderColorPalette = (item: PuhekuplaClothing) => {
    if (!item.colors) return null;
    
    const colors = item.colors.split(',');
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {colors.slice(0, 8).map(colorId => (
          <button
            key={colorId}
            onClick={(e) => {
              e.stopPropagation();
              onColorSelect(colorId);
            }}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              selectedColor === colorId 
                ? 'border-purple-500 scale-110' 
                : 'border-gray-300 hover:border-purple-300'
            }`}
            style={{ 
              backgroundColor: getHabboColor(colorId)
            }}
            title={`Cor ${colorId}`}
          />
        ))}
        {colors.length > 8 && (
          <div className="flex items-center justify-center w-4 h-4 text-xs text-gray-500">
            +{colors.length - 8}
          </div>
        )}
      </div>
    );
  };

  const getHabboColor = (colorId: string): string => {
    // Cores básicas do Habbo (simplificadas para demo)
    const colorMap: Record<string, string> = {
      '1': '#74551F', '2': '#000000', '3': '#1F1F1F', '4': '#7A463B',
      '5': '#E74C3C', '6': '#FA7921', '7': '#FAC51C', '8': '#82C341',
      '9': '#3498DB', '10': '#9B59B6', '11': '#71368A', '12': '#A0522D',
      '13': '#C0392B', '14': '#D35400', '15': '#F39C12', '16': '#27AE60',
      '17': '#2980B9', '18': '#8E44AD', '19': '#2C3E50', '20': '#95A5A6'
    };
    return colorMap[colorId] || '#74551F';
  };

  const renderGridView = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {filteredItems.map((item) => {
        const isSelected = selectedItem === item.code.replace(/^[a-z]{2}[-_]?/i, '');
        const isFavorite = favorites.includes(item.guid);
        const isHovered = hoveredItem === item.guid;

        return (
          <Card 
            key={item.guid}
            className={`group relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              isSelected 
                ? 'ring-2 ring-purple-500 shadow-lg scale-105' 
                : 'border-2 border-purple-200 hover:border-purple-400'
            } bg-white/90 backdrop-blur-sm overflow-hidden`}
            onClick={() => handleItemClick(item)}
            onMouseEnter={() => setHoveredItem(item.guid)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <CardContent className="p-2 text-center relative">
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
                  src={item.image}
                  alt={item.name}
                  className={`mx-auto object-contain rounded-lg bg-gray-50 p-1 transition-transform duration-200 w-12 h-12 ${
                    isHovered ? 'scale-110' : ''
                  }`}
                  style={{ imageRendering: 'pixelated' }}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                
                {/* Gender Badge */}
                {item.gender !== 'U' && (
                  <div className="absolute -top-1 -left-1">
                    <Badge className={`text-xs ${
                      item.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                    } text-white`}>
                      {item.gender === 'M' ? '👨' : '👩'}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Item Info */}
              <div className="space-y-1">
                <h4 className="font-medium text-xs text-gray-800 leading-tight line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {item.code}
                </p>
              </div>

              {/* Color Palette */}
              {renderColorPalette(item)}

              {/* Selection Overlay */}
              {isSelected && (
                <div className="absolute inset-0 bg-purple-500/20 rounded-lg pointer-events-none" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <span className="text-6xl mb-4 block">👕</span>
        <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma roupa encontrada</h3>
        <p className="text-gray-500">
          Tente selecionar uma categoria diferente ou ajustar os filtros
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2">
            <span className="text-xl">👕</span>
            Roupas
            <Badge variant="secondary">{filteredItems.length}</Badge>
          </h3>
          
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

        {/* Search and Sort Controls */}
        <div className="flex items-center gap-2">
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar roupas..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 w-48"
              />
            </div>
          )}
          
          <Select value={sortBy} onValueChange={(value: 'name' | 'gender') => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="gender">Gênero</SelectItem>
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
      {renderGridView()}
    </div>
  );
};

export default PuhekuplaClothingGridClean;
