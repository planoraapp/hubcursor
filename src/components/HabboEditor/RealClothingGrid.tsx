
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, RefreshCw, Shirt, Crown, Sparkles } from 'lucide-react';
import { 
  useHabboRealAssets, 
  filterClothingByCategory,
  filterClothingByGender,
  filterClothingByRarity,
  filterClothingByClub,
  generateOfficialClothingUrl,
  type HabboRealClothingItem 
} from '@/hooks/useHabboRealAssets';

interface RealClothingGridProps {
  selectedCategory: string;
  selectedGender?: 'M' | 'F' | 'U';
  selectedHotel?: string;
  onItemSelect?: (item: HabboRealClothingItem, colorId?: string) => void;
  selectedItem?: string;
  className?: string;
}

const CATEGORY_CONFIG = {
  'hd': { name: 'Rosto', icon: '👤', bgColor: 'bg-pink-100 dark:bg-pink-900' },
  'hr': { name: 'Cabelo', icon: '💇', bgColor: 'bg-amber-100 dark:bg-amber-900' },
  'ch': { name: 'Camisetas', icon: '👕', bgColor: 'bg-blue-100 dark:bg-blue-900' },
  'lg': { name: 'Calças', icon: '👖', bgColor: 'bg-green-100 dark:bg-green-900' },
  'sh': { name: 'Sapatos', icon: '👟', bgColor: 'bg-purple-100 dark:bg-purple-900' },
  'ha': { name: 'Chapéus', icon: '🎩', bgColor: 'bg-yellow-100 dark:bg-yellow-900' },
  'ea': { name: 'Óculos', icon: '👓', bgColor: 'bg-red-100 dark:bg-red-900' },
  'fa': { name: 'Máscaras', icon: '🎭', bgColor: 'bg-indigo-100 dark:bg-indigo-900' },
  'cc': { name: 'Casacos', icon: '🧥', bgColor: 'bg-orange-100 dark:bg-orange-900' },
  'ca': { name: 'Bijuteria', icon: '💍', bgColor: 'bg-cyan-100 dark:bg-cyan-900' },
  'wa': { name: 'Cintos', icon: '🔗', bgColor: 'bg-slate-100 dark:bg-slate-900' },
  'cp': { name: 'Estampas', icon: '🎨', bgColor: 'bg-rose-100 dark:bg-rose-900' }
};

const RARITY_CONFIG = {
  'normal': { name: 'Normal', color: 'bg-gray-500', icon: '⚫' },
  'hc': { name: 'Habbo Club', color: 'bg-yellow-500', icon: '👑' },
  'rare': { name: 'Raro', color: 'bg-green-600', icon: '💎' },
  'ltd': { name: 'LTD', color: 'bg-purple-600', icon: '🏆' },
  'nft': { name: 'NFT', color: 'bg-blue-600', icon: '🌟' }
};

const RealClothingGrid = ({
  selectedCategory,
  selectedGender = 'U',
  selectedHotel = 'com.br',
  onItemSelect,
  selectedItem,
  className = ''
}: RealClothingGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'rarity' | 'name'>('id');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [showHCOnly, setShowHCOnly] = useState(false);
  const [selectedColor, setSelectedColor] = useState('1');
  
  const { data: assetsData, isLoading, error, refetch } = useHabboRealAssets(selectedHotel);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    if (!assetsData?.clothing) return [];

    let items = filterClothingByCategory(assetsData.clothing, selectedCategory);
    
    // Apply filters
    items = filterClothingByGender(items, selectedGender);
    items = filterClothingByRarity(items, filterRarity);
    items = filterClothingByClub(items, showHCOnly);

    // Apply search
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    items = items.sort((a, b) => {
      if (sortBy === 'rarity') {
        const rarityOrder = ['nft', 'ltd', 'rare', 'hc', 'normal'];
        const aIndex = rarityOrder.indexOf(a.rarity);
        const bIndex = rarityOrder.indexOf(b.rarity);
        if (aIndex !== bIndex) return aIndex - bIndex;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return a.id.localeCompare(b.id);
    });

    return items;
  }, [assetsData, selectedCategory, selectedGender, searchTerm, sortBy, filterRarity, showHCOnly]);

  const categoryInfo = CATEGORY_CONFIG[selectedCategory as keyof typeof CATEGORY_CONFIG];

  const handleItemClick = (item: HabboRealClothingItem) => {
    console.log('🎯 [RealClothingGrid] Item selecionado:', item);
    onItemSelect?.(item, selectedColor);
  };

  const handleSync = () => {
    console.log('🔄 [RealClothingGrid] Sincronizando dados reais...');
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando assets reais do Habbo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p>Erro ao carregar dados reais do Habbo</p>
          <p className="text-sm text-gray-600 mt-1">Verifique sua conexão e tente novamente</p>
          <Button onClick={handleSync} variant="outline" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </Card>
    );
  }

  if (!assetsData) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <p>Nenhum dado disponível</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header da categoria */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{categoryInfo?.icon}</span>
            <span>{categoryInfo?.name || selectedCategory.toUpperCase()}</span>
            <Badge variant="secondary">
              {filteredItems.length} itens
            </Badge>
            <Badge variant="outline" className="ml-2">
              {assetsData.metadata.hotel}
            </Badge>
            <Button 
              onClick={handleSync} 
              size="sm" 
              variant="ghost"
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Controles de filtro */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={sortBy} onValueChange={(value: 'id' | 'rarity' | 'name') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Por ID</SelectItem>
                <SelectItem value="rarity">Por Raridade</SelectItem>
                <SelectItem value="name">Por Nome</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Raridades</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="rare">Raro</SelectItem>
                <SelectItem value="ltd">LTD</SelectItem>
                <SelectItem value="nft">NFT</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={showHCOnly ? "default" : "outline"}
              onClick={() => setShowHCOnly(!showHCOnly)}
              className="w-full"
            >
              <Crown className="h-4 w-4 mr-2" />
              {showHCOnly ? 'Mostrar Todos' : 'Só HC'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seletor de cor */}
      {selectedCategory !== 'hd' && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Cor:</span>
              <div className="flex gap-1 overflow-x-auto">
                {['1', '2', '3', '4', '5', '61', '92', '104'].map(colorId => (
                  <Button
                    key={colorId}
                    size="sm"
                    variant={selectedColor === colorId ? "default" : "outline"}
                    onClick={() => setSelectedColor(colorId)}
                    className="min-w-[2rem]"
                  >
                    {colorId}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de itens */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
        {filteredItems.map((item) => (
          <Card 
            key={`${item.category}-${item.id}`}
            className={`cursor-pointer transition-all hover:shadow-md border-2 relative ${
              selectedItem === item.id ? 'border-primary shadow-lg' : 'border-transparent'
            }`}
            onClick={() => handleItemClick(item)}
          >
            <CardContent className="p-2">
              <div className="aspect-square relative mb-2">
                <img
                  src={generateOfficialClothingUrl(item.category, item.id, selectedColor, selectedHotel, 's')}
                  alt={item.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = generateOfficialClothingUrl(item.category, item.id, '1', selectedHotel, 's');
                  }}
                />
                
                {/* Special rarity indicators */}
                <div className="absolute top-0 right-0 flex gap-1">
                  {/* HC Icon */}
                  {item.club === 'hc' && (
                    <img 
                      src="/assets/icon_HC_wardrobe.png" 
                      alt="HC" 
                      className="w-4 h-4"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                  
                  {/* LTD Icon */}
                  {item.rarity === 'ltd' && (
                    <img 
                      src="/assets/icon_LTD_habbo.png" 
                      alt="LTD" 
                      className="w-4 h-4"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                  
                  {/* NFT Icon */}
                  {item.rarity === 'nft' && (
                    <img 
                      src="/assets/icon_wardrobe_nft_on.png" 
                      alt="NFT" 
                      className="w-4 h-4"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                  
                  {/* Sellable Icon */}
                  {item.sellable && (
                    <img 
                      src="/assets/icon_sellable_wardrobe.png" 
                      alt="Vendável" 
                      className="w-4 h-4"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs font-mono">{item.id}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <Shirt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum item encontrado</p>
            {searchTerm && (
              <p className="text-sm mt-2">
                Tente ajustar sua busca ou verificar os filtros selecionados
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Build info */}
      <Card>
        <CardContent className="p-3">
          <div className="text-xs text-gray-600 flex items-center justify-between">
            <span>Build: {assetsData.metadata.buildUrl.split('/').slice(-2)[0]}</span>
            <span>{filteredItems.length} / {assetsData.metadata.totalItems} itens</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealClothingGrid;
