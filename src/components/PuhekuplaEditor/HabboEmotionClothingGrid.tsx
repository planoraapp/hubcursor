
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Shirt, Palette, Search, Filter, RefreshCw, Zap } from 'lucide-react';
import { useHabboEmotionClothing, triggerHabboEmotionSync, type HabboEmotionClothingItem } from '@/hooks/useHabboEmotionClothing';
import { getColorById } from '@/data/habboColors';

interface HabboEmotionClothingGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  onItemSelect: (item: HabboEmotionClothingItem) => void;
  onColorSelect: (colorId: string, item: HabboEmotionClothingItem) => void;
  selectedItem?: string;
  selectedColor?: string;
}

const CATEGORY_NAMES = {
  'hr': '💇 Cabelos',
  'hd': '👤 Rostos', 
  'ch': '👕 Camisetas',
  'lg': '👖 Calças',
  'sh': '👟 Sapatos',
  'ha': '🎩 Chapéus',
  'ea': '👓 Óculos',
  'fa': '😷 Acess. Faciais',
  'cc': '🧥 Casacos',
  'ca': '🎖️ Acess. Peito',
  'wa': '👔 Cintura',
  'cp': '🎨 Estampas'
};

export const HabboEmotionClothingGrid: React.FC<HabboEmotionClothingGridProps> = ({
  selectedCategory,
  selectedGender,
  onItemSelect,
  onColorSelect,
  selectedItem,
  selectedColor
}) => {
  const [colorPopoverOpen, setColorPopoverOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clubFilter, setClubFilter] = useState<'all' | 'HC' | 'FREE'>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { data: clothingItems, isLoading, error, refetch } = useHabboEmotionClothing(
    2000, 
    selectedCategory,
    selectedGender
  );

  // Filtrar e organizar itens
  const filteredItems = useMemo(() => {
    if (!clothingItems) return [];
    
    return clothingItems.filter(item => {
      const categoryMatch = item.category === selectedCategory || item.part === selectedCategory;
      const genderMatch = item.gender === selectedGender || item.gender === 'U';
      const searchMatch = !searchTerm || 
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const clubMatch = clubFilter === 'all' || item.club === clubFilter;
      
      return categoryMatch && genderMatch && searchMatch && clubMatch;
    }).sort((a, b) => {
      // Priorizar itens HC no topo se filtro não for específico
      if (clubFilter === 'all') {
        if (a.club === 'HC' && b.club === 'FREE') return -1;
        if (a.club === 'FREE' && b.club === 'HC') return 1;
      }
      // Depois ordenar por código
      return a.code.localeCompare(b.code);
    });
  }, [clothingItems, selectedCategory, selectedGender, searchTerm, clubFilter]);

  // Agrupar por raridade
  const groupedItems = useMemo(() => {
    const groups = {
      hc: filteredItems.filter(item => item.club === 'HC'),
      free: filteredItems.filter(item => item.club === 'FREE')
    };
    return groups;
  }, [filteredItems]);

  const handleItemClick = useCallback((item: HabboEmotionClothingItem) => {
    onItemSelect(item);
    
    // Se o item tem cores disponíveis, abrir popover
    if (item.colors && item.colors.length > 1) {
      setColorPopoverOpen(item.code);
    }
  }, [onItemSelect]);

  const handleColorClick = useCallback((colorId: string, item: HabboEmotionClothingItem) => {
    onColorSelect(colorId, item);
    setColorPopoverOpen(null);
  }, [onColorSelect]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await triggerHabboEmotionSync();
      await refetch();
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const renderColorButton = (colorId: string, item: HabboEmotionClothingItem) => {
    const colorInfo = getColorById(colorId);
    const isSelected = selectedColor === colorId;
    
    return (
      <Button
        key={colorId}
        size="sm"
        variant={isSelected ? "default" : "outline"}
        className={`w-8 h-8 p-0 relative ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
        style={{
          backgroundColor: colorInfo ? `#${colorInfo.hex}` : '#DDDDDD',
          color: colorInfo && ['1', '26', '5', '15', '16', '25'].includes(colorId) ? '#000' : '#fff'
        }}
        onClick={() => handleColorClick(colorId, item)}
        title={colorInfo?.name || `Cor ${colorId}`}
      >
        {colorInfo?.isHC && (
          <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
            ★
          </div>
        )}
        <span className="text-xs font-bold">{colorId}</span>
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-purple-800 mb-2">Carregando HabboEmotion</h3>
          <p className="text-purple-600">Buscando catálogo completo de roupas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <Shirt className="w-12 h-12 mx-auto mb-3 text-red-500" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar HabboEmotion</h3>
        <p className="text-sm text-red-600 mb-4">
          Não foi possível conectar com o sistema HabboEmotion
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => refetch()} variant="outline" className="border-red-300 text-red-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar
          </Button>
          <Button onClick={handleManualSync} disabled={isSyncing} className="bg-purple-600 hover:bg-purple-700">
            {isSyncing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Sincronizar
          </Button>
        </div>
      </div>
    );
  }

  const totalItems = clothingItems?.length || 0;
  const categoryName = CATEGORY_NAMES[selectedCategory as keyof typeof CATEGORY_NAMES] || selectedCategory.toUpperCase();

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border-2 border-purple-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shirt className="w-5 h-5 text-purple-700" />
            <div>
              <h3 className="font-bold text-purple-800">
                HabboEmotion - {categoryName}
              </h3>
              <p className="text-sm text-purple-600">
                {filteredItems.length} itens • {groupedItems.hc.length} HC • {groupedItems.free.length} Gratuitos
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              ✅ Cache Ativo
            </Badge>
            <Button
              onClick={handleManualSync}
              disabled={isSyncing}
              size="sm"
              variant="outline"
              className="text-purple-700 border-purple-300 hover:bg-purple-50"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-1" />
              )}
              Sync
            </Button>
          </div>
        </div>
      </div>

      {/* Controles de busca e filtro */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por código ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-1">
          {(['all', 'HC', 'FREE'] as const).map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={clubFilter === filter ? "default" : "outline"}
              onClick={() => setClubFilter(filter)}
              className={`${clubFilter === filter ? 'bg-purple-600 text-white' : 'text-purple-700 border-purple-300'}`}
            >
              <Filter className="w-3 h-3 mr-1" />
              {filter === 'all' ? 'Todos' : filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid de itens */}
      <div className="max-h-80 overflow-y-auto space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Shirt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma roupa encontrada</h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou termo de busca
            </p>
          </div>
        ) : (
          <>
            {/* Items HC */}
            {groupedItems.hc.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    ⭐ HABBO CLUB ({groupedItems.hc.length})
                  </Badge>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                  {groupedItems.hc.map((item) => (
                    <ItemCard
                      key={item.code}
                      item={item}
                      isSelected={selectedItem === item.code}
                      onItemClick={handleItemClick}
                      colorPopoverOpen={colorPopoverOpen}
                      setColorPopoverOpen={setColorPopoverOpen}
                      renderColorButton={renderColorButton}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Items Gratuitos */}
            {groupedItems.free.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                    🆓 GRATUITO ({groupedItems.free.length})
                  </Badge>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                  {groupedItems.free.map((item) => (
                    <ItemCard
                      key={item.code}
                      item={item}
                      isSelected={selectedItem === item.code}
                      onItemClick={handleItemClick}
                      colorPopoverOpen={colorPopoverOpen}
                      setColorPopoverOpen={setColorPopoverOpen}
                      renderColorButton={renderColorButton}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer com informações */}
      <div className="text-xs text-gray-500 border-t pt-3 space-y-1">
        <div className="flex justify-between">
          <span>Total carregado: {totalItems} itens</span>
          <span>Filtrado: {filteredItems.length} itens</span>
        </div>
        <div className="flex justify-between">
          <span>Fonte: {clothingItems?.[0]?.source || 'N/A'}</span>
          <span className="text-green-600">✅ Sistema HabboEmotion 2.0 Ativo</span>
        </div>
      </div>
    </div>
  );
};

// Componente do card individual do item
interface ItemCardProps {
  item: HabboEmotionClothingItem;
  isSelected: boolean;
  onItemClick: (item: HabboEmotionClothingItem) => void;
  colorPopoverOpen: string | null;
  setColorPopoverOpen: (value: string | null) => void;
  renderColorButton: (colorId: string, item: HabboEmotionClothingItem) => React.ReactNode;
}

const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  isSelected, 
  onItemClick, 
  colorPopoverOpen, 
  setColorPopoverOpen, 
  renderColorButton 
}) => (
  <Popover 
    open={colorPopoverOpen === item.code} 
    onOpenChange={(open) => setColorPopoverOpen(open ? item.code : null)}
  >
    <PopoverTrigger asChild>
      <Card 
        className={`group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 ${
          isSelected ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-200 hover:border-purple-300'
        }`}
        onClick={() => onItemClick(item)}
      >
        <CardContent className="p-2">
          <div className="relative">
            <img
              src={item.imageUrl}
              alt={`${item.name} (${item.code})`}
              className="w-full h-16 object-contain rounded bg-gradient-to-br from-gray-50 to-gray-100"
              style={{ imageRendering: 'pixelated' }}
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://habboemotion.com/usables/clothing/${item.part}_U_${item.code}_2_0.png`;
              }}
            />
            
            {/* Indicadores */}
            {item.colors && item.colors.length > 1 && (
              <div className="absolute top-1 right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {item.colors.length}
              </div>
            )}
            
            {item.club === 'HC' && (
              <div className="absolute bottom-1 right-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-1 py-0.5 rounded font-bold shadow">
                HC
              </div>
            )}

            {item.source === 'supabase-cache' && (
              <div className="absolute top-1 left-1 bg-green-500 text-white text-xs rounded-full w-3 h-3"></div>
            )}
          </div>
          
          <div className="mt-1 text-center">
            <div className="text-xs font-medium truncate" title={item.code}>
              {item.code}
            </div>
          </div>
        </CardContent>
      </Card>
    </PopoverTrigger>
    
    {/* Popover de cores */}
    {item.colors && item.colors.length > 1 && (
      <PopoverContent className="w-56 p-3" align="center">
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Cores Disponíveis ({item.colors.length})
          </h4>
          <div className="grid grid-cols-6 gap-1">
            {item.colors.map((colorId) => renderColorButton(colorId, item))}
          </div>
          <div className="text-xs text-gray-500 border-t pt-2">
            Item: {item.code} • Categoria: {item.part}
          </div>
        </div>
      </PopoverContent>
    )}
  </Popover>
);
