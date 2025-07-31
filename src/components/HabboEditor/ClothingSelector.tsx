
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette, Shirt, PaintBucket, Crown, Glasses, Footprints, User, AlertCircle, RefreshCw } from 'lucide-react';
import { useFigureData } from '@/hooks/useFigureData';

interface ClothingSelectorProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  selectedPart: string;
  onPartSelect: (partId: string) => void;
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

const ClothingSelector = ({
  activeCategory,
  setActiveCategory,
  selectedPart,
  onPartSelect,
  searchTerm,
  setSearchTerm,
  selectedHotel
}: ClothingSelectorProps) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  const { data: figureData, isLoading, error, refetch } = useFigureData();

  // Processar dados do figuredata
  const categoryItems = useMemo(() => {
    if (!figureData || !figureData[activeCategory]) return [];
    
    let items = figureData[activeCategory];
    
    // Filtrar por busca
    if (searchTerm) {
      items = items.filter(item => 
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${activeCategory}-${item.id}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  }, [figureData, activeCategory, searchTerm]);

  // Agrupar por raridade baseado no club
  const groupedByRarity = useMemo(() => {
    const groups = {
      hc: categoryItems.filter(item => item.club === '1'),
      normal: categoryItems.filter(item => item.club === '0' || !item.club)
    };
    
    return groups;
  }, [categoryItems]);

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set([...prev, itemId]));
  };

  const renderClothingItem = (item: any) => {
    const hasError = imageErrors.has(item.id);
    const thumbnailUrl = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${activeCategory}-${item.id}-${item.colors[0] || '1'}&direction=2&head_direction=3&size=s&img_format=png&gesture=std&action=std`;

    return (
      <Button
        key={item.id}
        variant={selectedPart === item.id ? "default" : "outline"}
        size="sm"
        className={`h-24 p-2 flex flex-col items-center gap-1 text-xs relative ${
          selectedPart === item.id 
            ? 'bg-amber-500 text-white border-2 border-amber-600' 
            : 'habbo-card hover:bg-amber-50'
        }`}
        onClick={() => onPartSelect(item.id)}
        title={`${activeCategory}-${item.id} ${item.club === '1' ? '(HC)' : ''}`}
      >
        <Badge 
          className={`absolute top-1 right-1 text-xs px-1 py-0 ${
            item.club === '1' ? 'bg-yellow-500' : 'bg-gray-500'
          } text-white`}
        >
          {item.club === '1' ? 'HC' : 'FREE'}
        </Badge>
        
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center mb-1 overflow-hidden">
          {!hasError ? (
            <img 
              src={thumbnailUrl}
              alt={`${activeCategory}-${item.id}`}
              className="w-full h-full object-contain pixelated"
              style={{ imageRendering: 'pixelated' }}
              onError={() => handleImageError(item.id)}
              loading="lazy"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">
                {item.id}
              </span>
            </div>
          )}
        </div>
        
        <div className="truncate w-full text-center text-xs leading-tight">
          {activeCategory}-{item.id}
        </div>
      </Button>
    );
  };

  if (isLoading) {
    return (
      <Card className="habbo-panel">
        <CardHeader className="habbo-header">
          <CardTitle className="flex items-center gap-2 text-white">
            <Palette className="w-5 h-5" />
            Carregando Roupas Oficiais...
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
              <Skeleton key={i} className="h-24 w-full" />
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
            Erro ao Carregar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados oficiais do Habbo</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalItems = figureData ? Object.values(figureData).reduce((acc, items) => acc + items.length, 0) : 0;

  return (
    <Card className="habbo-panel">
      <CardHeader className="habbo-header">
        <CardTitle className="flex items-center gap-2 text-white">
          <Palette className="w-5 h-5" />
          Roupas Oficiais ({totalItems} itens)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Category Tabs */}
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(PART_CATEGORIES).map(([key, label]) => {
            const IconComponent = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
            const categoryCount = figureData?.[key]?.length || 0;
            
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
          placeholder="Buscar itens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="habbo-input"
        />

        {/* Parts Grid by Rarity */}
        <div className="max-h-80 overflow-y-auto space-y-4">
          {categoryItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma peça encontrada nesta categoria</p>
              <p className="text-xs mt-2">Experimente uma categoria diferente</p>
            </div>
          ) : (
            ['hc', 'normal'].map(rarity => {
              const rarityItems = groupedByRarity[rarity as keyof typeof groupedByRarity];
              if (!rarityItems || rarityItems.length === 0) return null;

              return (
                <div key={rarity} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${rarity === 'hc' ? 'bg-yellow-500' : 'bg-gray-500'} text-white`}>
                      {rarity === 'hc' ? 'HABBO CLUB' : 'GRATUITO'}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {rarityItems.length} {rarityItems.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {rarityItems.map(renderClothingItem)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 border-t pt-2">
          Total: {categoryItems.length} itens em {activeCategory.toUpperCase()}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClothingSelector;
