
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette, Shirt, PaintBucket, Crown, Glasses, Footprints, User, AlertCircle, RefreshCw } from 'lucide-react';
import { useHybridClothingSystem, HybridClothingItem } from '@/hooks/useHybridClothingSystem';
import OptimizedClothingThumbnail from './OptimizedClothingThumbnail';

interface HybridClothingSelectorProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  selectedPart: string;
  onPartSelect: (item: HybridClothingItem) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedHotel: string;
}

const CATEGORY_ICONS = {
  hd: User,
  hr: Crown,
  ch: Shirt,
  lg: PaintBucket,
  sh: Footprints,
  ha: Crown,
  ea: Glasses,
  fa: User,
  cc: Shirt,
  ca: PaintBucket,
  wa: PaintBucket,
  cp: Palette
} as const;

const PART_CATEGORIES = {
  hd: 'Rosto',
  hr: 'Cabelo',
  ch: 'Camiseta',
  lg: 'Calça',
  sh: 'Sapatos',
  ha: 'Chapéu',
  ea: 'Óculos',
  fa: 'Rosto',
  cc: 'Casaco',
  ca: 'Capa',
  wa: 'Cinto',
  cp: 'Estampa'
};

const HybridClothingSelector = ({
  activeCategory,
  setActiveCategory,
  selectedPart,
  onPartSelect,
  searchTerm,
  setSearchTerm,
  selectedHotel
}: HybridClothingSelectorProps) => {
  const { data: clothingData, isLoading, error, refetch } = useHybridClothingSystem(selectedHotel);

  // Filter and process items
  const categoryItems = useMemo(() => {
    if (!clothingData) return [];
    
    let items = clothingData.filter(item => item.category === activeCategory);
    
    // Apply search filter
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.swfName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.figureId && item.figureId.includes(searchTerm))
      );
    }
    
    // Sort by source priority and then by ID
    return items.sort((a, b) => {
      // Hybrid items first, then official, then HabboWidgets
      const sourceOrder = { hybrid: 0, official: 1, habbowidgets: 2 };
      const aOrder = sourceOrder[a.source] || 3;
      const bOrder = sourceOrder[b.source] || 3;
      
      if (aOrder !== bOrder) return aOrder - bOrder;
      
      // Then sort by figure ID numerically
      const aId = parseInt(a.figureId || '0');
      const bId = parseInt(b.figureId || '0');
      return aId - bId;
    });
  }, [clothingData, activeCategory, searchTerm]);

  // Group by club and source
  const groupedItems = useMemo(() => {
    const groups = {
      hybridHC: categoryItems.filter(item => item.club === 'HC' && item.source === 'hybrid'),
      hybridFree: categoryItems.filter(item => item.club === 'FREE' && item.source === 'hybrid'),
      officialHC: categoryItems.filter(item => item.club === 'HC' && item.source === 'official'),
      officialFree: categoryItems.filter(item => item.club === 'FREE' && item.source === 'official'),
      widgetsHC: categoryItems.filter(item => item.club === 'HC' && item.source === 'habbowidgets'),
      widgetsFree: categoryItems.filter(item => item.club === 'FREE' && item.source === 'habbowidgets')
    };
    
    return groups;
  }, [categoryItems]);

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'hybrid': return 'bg-purple-600';
      case 'official': return 'bg-blue-600';
      case 'habbowidgets': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'hybrid': return 'HÍBRIDO';
      case 'official': return 'OFICIAL';
      case 'habbowidgets': return 'WIDGETS';
      default: return 'UNKNOWN';
    }
  };

  const renderClothingItem = (item: HybridClothingItem) => {
    return (
      <Button
        key={item.id}
        variant={selectedPart === item.id ? "default" : "outline"}
        size="sm"
        className={`h-32 p-2 flex flex-col items-center gap-1 text-xs relative ${
          selectedPart === item.id 
            ? 'bg-amber-500 text-white border-2 border-amber-600' 
            : 'habbo-card hover:bg-amber-50'
        }`}
        onClick={() => onPartSelect(item)}
        title={`${item.name} (${item.swfName}) - ${getSourceLabel(item.source)}`}
      >
        {/* Club Badge */}
        <Badge 
          className={`absolute top-1 right-1 text-xs px-1 py-0 ${
            item.club === 'HC' ? 'bg-yellow-500' : 'bg-gray-500'
          } text-white z-10`}
        >
          {item.club}
        </Badge>

        {/* Source Badge */}
        <Badge 
          className={`absolute top-1 left-1 text-xs px-1 py-0 ${getSourceBadgeColor(item.source)} text-white z-10`}
        >
          {getSourceLabel(item.source)[0]}
        </Badge>
        
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center mb-1 overflow-hidden">
          <OptimizedClothingThumbnail
            item={item}
            hotel={selectedHotel}
            className="w-full h-full"
          />
        </div>
        
        <div className="truncate w-full text-center text-xs leading-tight">
          {item.name}
        </div>
        
        {item.figureId && (
          <div className="text-xs text-gray-500">
            ID: {item.figureId}
          </div>
        )}
      </Button>
    );
  };

  if (isLoading) {
    return (
      <Card className="habbo-panel">
        <CardHeader className="habbo-header">
          <CardTitle className="flex items-center gap-2 text-white">
            <Palette className="w-5 h-5" />
            Carregando Sistema Híbrido...
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: 12 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="habbo-panel">
        <CardHeader className="habbo-header">
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertCircle className="w-5 h-5" />
            Erro no Sistema Híbrido
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados híbridos</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalItems = clothingData?.length || 0;
  const sourceStats = {
    hybrid: clothingData?.filter(i => i.source === 'hybrid').length || 0,
    official: clothingData?.filter(i => i.source === 'official').length || 0,
    habbowidgets: clothingData?.filter(i => i.source === 'habbowidgets').length || 0
  };

  return (
    <Card className="habbo-panel">
      <CardHeader className="habbo-header">
        <CardTitle className="flex items-center gap-2 text-white">
          <Palette className="w-5 h-5" />
          Sistema Híbrido ({totalItems} itens)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Statistics */}
        <div className="flex gap-2 text-xs">
          <Badge className="bg-purple-600 text-white">Híbrido: {sourceStats.hybrid}</Badge>
          <Badge className="bg-blue-600 text-white">Oficial: {sourceStats.official}</Badge>
          <Badge className="bg-green-600 text-white">Widgets: {sourceStats.habbowidgets}</Badge>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(PART_CATEGORIES).map(([key, label]) => {
            const IconComponent = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
            const categoryCount = clothingData?.filter(item => item.category === key).length || 0;
            
            return (
              <Button
                key={key}
                variant={activeCategory === key ? "default" : "outline"}
                size="sm"
                className={`flex flex-col items-center p-2 h-auto relative ${
                  activeCategory === key ? 'bg-amber-500 text-white' : 'habbo-card'
                }`}
                onClick={() => setActiveCategory(key)}
              >
                <IconComponent className="w-4 h-4 mb-1" />
                <span className="text-xs">{label}</span>
                {categoryCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-0">
                    {categoryCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar itens híbridos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="habbo-input"
        />

        {/* Items Grid by Source and Club */}
        <div className="max-h-80 overflow-y-auto space-y-4">
          {categoryItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma peça encontrada nesta categoria</p>
              <p className="text-xs mt-2">Experimente uma categoria diferente</p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([groupKey, groupItems]) => {
              if (!groupItems || groupItems.length === 0) return null;

              const [source, club] = groupKey.includes('HC') 
                ? [groupKey.replace('HC', ''), 'HC'] 
                : [groupKey.replace('Free', ''), 'FREE'];

              const sourceLabel = getSourceLabel(source);
              const sourceBadgeColor = getSourceBadgeColor(source);

              return (
                <div key={groupKey} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${sourceBadgeColor} text-white`}>
                      {sourceLabel}
                    </Badge>
                    <Badge className={`${club === 'HC' ? 'bg-yellow-500' : 'bg-gray-500'} text-white`}>
                      {club === 'HC' ? 'HABBO CLUB' : 'GRATUITO'}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {groupItems.length} {groupItems.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {groupItems.map(renderClothingItem)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Enhanced Info */}
        <div className="text-xs text-gray-500 border-t pt-2">
          Total: {categoryItems.length} itens em {activeCategory.toUpperCase()}
          <br />
          <span className="text-purple-600">🔥 Sistema Híbrido Ativo</span> | 
          <span className="text-green-600"> ✅ Múltiplas Fontes</span> | 
          <span className="text-blue-600"> 🚀 Cache Otimizado</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default HybridClothingSelector;
