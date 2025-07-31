
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Palette, Shirt, PaintBucket, Crown, Glasses, Footprints, User } from 'lucide-react';
import { getClothingByCategory, getClothingThumbnailUrl, getRarityColor, getRarityText, HabboClothingItem } from '@/data/habboClothingData';

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

  // Obter itens reais da categoria ativa
  const categoryItems = getClothingByCategory(activeCategory);
  
  const filteredParts = categoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.swfCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar por raridade
  const groupedByRarity = filteredParts.reduce((acc, item) => {
    if (!acc[item.rarity]) {
      acc[item.rarity] = [];
    }
    acc[item.rarity].push(item);
    return acc;
  }, {} as Record<string, HabboClothingItem[]>);

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set([...prev, itemId]));
  };

  const renderClothingItem = (item: HabboClothingItem) => {
    const thumbnailUrl = getClothingThumbnailUrl(item, item.colors[0], selectedHotel);
    const hasError = imageErrors.has(item.id);

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
        title={item.name}
      >
        {/* Badge de Raridade */}
        <Badge 
          className={`absolute top-1 right-1 text-xs px-1 py-0 ${getRarityColor(item.rarity)} text-white`}
        >
          {getRarityText(item.rarity)}
        </Badge>
        
        {/* Miniatura da peça */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center mb-1 overflow-hidden">
          {!hasError ? (
            <img 
              src={thumbnailUrl}
              alt={item.name}
              className="w-full h-full object-contain pixelated"
              style={{ imageRendering: 'pixelated' }}
              onError={() => handleImageError(item.id)}
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">
                {item.swfCode.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="truncate w-full text-center text-xs leading-tight">
          {item.name}
        </div>
      </Button>
    );
  };

  const rarityOrder = ['nft', 'ltd', 'hc', 'sellable', 'normal'];

  return (
    <Card className="habbo-panel">
      <CardHeader className="habbo-header">
        <CardTitle className="flex items-center gap-2 text-white">
          <Palette className="w-5 h-5" />
          Roupas & Acessórios
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Category Tabs */}
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(PART_CATEGORIES).map(([key, label]) => {
            const IconComponent = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
            const categoryCount = getClothingByCategory(key).length;
            
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
          placeholder="Buscar peças..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="habbo-input"
        />

        {/* Parts Grid by Rarity */}
        <div className="max-h-80 overflow-y-auto space-y-4">
          {filteredParts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma peça encontrada nesta categoria</p>
              <p className="text-xs mt-2">Experimente uma categoria diferente</p>
            </div>
          ) : (
            rarityOrder.map(rarity => {
              const rarityItems = groupedByRarity[rarity];
              if (!rarityItems || rarityItems.length === 0) return null;

              return (
                <div key={rarity} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getRarityColor(rarity)} text-white`}>
                      {getRarityText(rarity)}
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
          Total: {categoryItems.length} peças disponíveis em {activeCategory.toUpperCase()}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClothingSelector;
