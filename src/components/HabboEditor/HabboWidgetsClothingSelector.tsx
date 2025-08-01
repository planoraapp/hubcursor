
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette, Shirt, PaintBucket, Crown, Glasses, Footprints, User, AlertCircle, RefreshCw } from 'lucide-react';
import { useHabboWidgetsClothing, HabboWidgetsItem } from '@/hooks/useHabboWidgetsClothing';

interface HabboWidgetsClothingSelectorProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  selectedPart: string;
  onPartSelect: (item: HabboWidgetsItem) => void;
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

const HabboWidgetsClothingSelector = ({
  activeCategory,
  setActiveCategory,
  selectedPart,
  onPartSelect,
  searchTerm,
  setSearchTerm,
  selectedHotel
}: HabboWidgetsClothingSelectorProps) => {
  const { data: clothingData, isLoading, error, refetch } = useHabboWidgetsClothing(selectedHotel);

  // Filter and group clothing items
  const categoryItems = useMemo(() => {
    if (!clothingData) return [];
    
    let items = clothingData.filter(item => item.category === activeCategory);
    
    // Apply search filter
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.swfName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  }, [clothingData, activeCategory, searchTerm]);

  // Group by club status
  const groupedByClub = useMemo(() => {
    const groups = {
      HC: categoryItems.filter(item => item.club === 'HC'),
      FREE: categoryItems.filter(item => item.club === 'FREE')
    };
    
    return groups;
  }, [categoryItems]);

  const renderClothingItem = (item: HabboWidgetsItem) => {
    return (
      <Button
        key={item.id}
        variant={selectedPart === item.id ? "default" : "outline"}
        size="sm"
        className={`h-28 p-2 flex flex-col items-center gap-1 text-xs relative ${
          selectedPart === item.id 
            ? 'bg-amber-500 text-white border-2 border-amber-600' 
            : 'habbo-card hover:bg-amber-50'
        }`}
        onClick={() => onPartSelect(item)}
        title={`${item.name} (${item.swfName})`}
      >
        <Badge 
          className={`absolute top-1 right-1 text-xs px-1 py-0 ${
            item.club === 'HC' ? 'bg-yellow-500' : 'bg-gray-500'
          } text-white`}
        >
          {item.club}
        </Badge>
        
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center mb-1 overflow-hidden">
          <img 
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-contain pixelated"
            style={{ imageRendering: 'pixelated' }}
            onError={(e) => {
              // Fallback to text display if image fails
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="text-xs font-bold text-center">${item.swfName}</div>`;
              }
            }}
          />
        </div>
        
        <div className="truncate w-full text-center text-xs leading-tight">
          {item.name}
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
            Carregando HabboWidgets...
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
              <Skeleton key={i} className="h-28 w-full" />
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
            Erro ao Carregar HabboWidgets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados do HabboWidgets</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalItems = clothingData?.length || 0;
  const categoryCount = categoryItems.length;

  return (
    <Card className="habbo-panel">
      <CardHeader className="habbo-header">
        <CardTitle className="flex items-center gap-2 text-white">
          <Palette className="w-5 h-5" />
          HabboWidgets Catálogo ({totalItems} itens)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Category Tabs */}
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(PART_CATEGORIES).map(([key, label]) => {
            const IconComponent = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
            const categoryItemCount = clothingData?.filter(item => item.category === key).length || 0;
            
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
                {categoryItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-0">
                    {categoryItemCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar roupas HabboWidgets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="habbo-input"
        />

        {/* Items Grid by Club Status */}
        <div className="max-h-80 overflow-y-auto space-y-4">
          {categoryCount === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma peça encontrada nesta categoria</p>
              <p className="text-xs mt-2">Experimente uma categoria diferente</p>
            </div>
          ) : (
            ['HC', 'FREE'].map(clubStatus => {
              const clubItems = groupedByClub[clubStatus as keyof typeof groupedByClub];
              if (!clubItems || clubItems.length === 0) return null;

              return (
                <div key={clubStatus} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${clubStatus === 'HC' ? 'bg-yellow-500' : 'bg-gray-500'} text-white`}>
                      {clubStatus === 'HC' ? 'HABBO CLUB' : 'GRATUITO'}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {clubItems.length} {clubItems.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {clubItems.map(renderClothingItem)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 border-t pt-2">
          Total: {categoryCount} itens em {activeCategory.toUpperCase()} | HabboWidgets Integrado
          <br />
          <span className="text-green-600">✅ Sistema HabboWidgets Ativo</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabboWidgetsClothingSelector;
