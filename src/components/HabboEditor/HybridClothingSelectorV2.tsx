
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Shirt, Users, Crown } from 'lucide-react';
import { useHybridClothingDataV2, HybridClothingItemV2 } from '@/hooks/useHybridClothingDataV2';
import IntelligentClothingThumbnail from './IntelligentClothingThumbnail';

interface HybridClothingSelectorV2Props {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  selectedPart: string;
  onPartSelect: (item: HybridClothingItemV2) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedHotel: string;
  selectedColor?: string;
}

const CATEGORY_CONFIG = {
  'hd': { name: 'Cabeça', icon: '👤', color: 'bg-blue-500' },
  'hr': { name: 'Cabelo', icon: '💇', color: 'bg-purple-500' },
  'ch': { name: 'Camisa', icon: '👕', color: 'bg-green-500' },
  'lg': { name: 'Calça', icon: '👖', color: 'bg-indigo-500' },
  'sh': { name: 'Sapato', icon: '👟', color: 'bg-orange-500' },
  'ha': { name: 'Chapéu', icon: '🎩', color: 'bg-yellow-500' },
  'ea': { name: 'Óculos', icon: '👓', color: 'bg-pink-500' },
  'fa': { name: 'Rosto', icon: '😷', color: 'bg-teal-500' },
  'cc': { name: 'Casaco', icon: '🧥', color: 'bg-red-500' },
  'ca': { name: 'Peito', icon: '🎖️', color: 'bg-amber-500' },
  'wa': { name: 'Cintura', icon: '🔗', color: 'bg-cyan-500' },
  'cp': { name: 'Estampa', icon: '🎨', color: 'bg-emerald-500' }
};

const HybridClothingSelectorV2 = ({
  activeCategory,
  setActiveCategory,
  selectedPart,
  onPartSelect,
  searchTerm,
  setSearchTerm,
  selectedHotel,
  selectedColor = '1'
}: HybridClothingSelectorV2Props) => {
  const { data: clothingData, isLoading, error } = useHybridClothingDataV2(selectedHotel);
  const [activeFilter, setActiveFilter] = useState<'all' | 'hc' | 'free'>('all');

  // Filter and organize clothing data
  const { filteredItems, categoryStats } = useMemo(() => {
    if (!clothingData) return { filteredItems: [], categoryStats: {} };

    // Filter by category
    let items = clothingData.filter(item => item.category === activeCategory);
    
    // Filter by search term
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.figureId.includes(searchTerm) ||
        (item.metadata?.code && item.metadata.code.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by club type
    if (activeFilter !== 'all') {
      items = items.filter(item => 
        activeFilter === 'hc' ? item.club === 'HC' : item.club === 'FREE'
      );
    }

    // Calculate category stats
    const stats = clothingData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { total: 0, hc: 0, free: 0 };
      }
      acc[item.category].total++;
      if (item.club === 'HC') {
        acc[item.category].hc++;
      } else {
        acc[item.category].free++;
      }
      return acc;
    }, {} as Record<string, { total: number; hc: number; free: number }>);

    return { 
      filteredItems: items,
      categoryStats: stats
    };
  }, [clothingData, activeCategory, searchTerm, activeFilter]);

  // Group items by source for better organization
  const itemsBySource = useMemo(() => {
    const grouped = {
      habboemotion: filteredItems.filter(i => i.source === 'habboemotion'),
      habbowidgets: filteredItems.filter(i => i.source === 'habbowidgets'),
      official: filteredItems.filter(i => i.source === 'official')
    };
    return grouped;
  }, [filteredItems]);

  if (error) {
    return (
      <Card className="habbo-panel">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-2">❌ Erro ao carregar dados</div>
          <p className="text-sm text-gray-600">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="habbo-panel">
      <CardHeader className="habbo-header">
        <CardTitle className="flex items-center gap-2 text-white">
          <Shirt className="w-5 h-5" />
          Seletor de Roupas Híbrido
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Category Tabs */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const stats = categoryStats[key];
              return (
                <Button
                  key={key}
                  variant={activeCategory === key ? "default" : "outline"}
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto p-2 habbo-card"
                  onClick={() => setActiveCategory(key)}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span className="text-xs">{config.name}</span>
                  {stats && (
                    <Badge variant="secondary" className="text-xs">
                      {stats.total}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 space-y-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, código ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 habbo-input"
            />
          </div>
          
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
            <TabsList className="grid grid-cols-3 w-full habbo-card">
              <TabsTrigger value="all" className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="hc" className="flex items-center gap-1">
                <Crown className="w-4 h-4" />
                HC
              </TabsTrigger>
              <TabsTrigger value="free" className="flex items-center gap-1">
                <Shirt className="w-4 h-4" />
                Free
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Items Display */}
        <ScrollArea className="h-96">
          <div className="p-4">
            {isLoading ? (
              <div className="grid grid-cols-4 gap-3">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-16 h-16 bg-gray-200 animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <Tabs defaultValue="combined" className="w-full">
                <TabsList className="grid grid-cols-4 w-full mb-4">
                  <TabsTrigger value="combined">Todos ({filteredItems.length})</TabsTrigger>
                  <TabsTrigger value="habboemotion">Emotion ({itemsBySource.habboemotion.length})</TabsTrigger>
                  <TabsTrigger value="habbowidgets">Widgets ({itemsBySource.habbowidgets.length})</TabsTrigger>
                  <TabsTrigger value="official">Oficial ({itemsBySource.official.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="combined">
                  <ItemGrid 
                    items={filteredItems} 
                    selectedPart={selectedPart}
                    onPartSelect={onPartSelect}
                    selectedHotel={selectedHotel}
                    selectedColor={selectedColor}
                  />
                </TabsContent>
                
                <TabsContent value="habboemotion">
                  <ItemGrid 
                    items={itemsBySource.habboemotion} 
                    selectedPart={selectedPart}
                    onPartSelect={onPartSelect}
                    selectedHotel={selectedHotel}
                    selectedColor={selectedColor}
                  />
                </TabsContent>
                
                <TabsContent value="habbowidgets">
                  <ItemGrid 
                    items={itemsBySource.habbowidgets} 
                    selectedPart={selectedPart}
                    onPartSelect={onPartSelect}
                    selectedHotel={selectedHotel}
                    selectedColor={selectedColor}
                  />
                </TabsContent>
                
                <TabsContent value="official">
                  <ItemGrid 
                    items={itemsBySource.official} 
                    selectedPart={selectedPart}
                    onPartSelect={onPartSelect}
                    selectedHotel={selectedHotel}
                    selectedColor={selectedColor}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Helper component for item grid
interface ItemGridProps {
  items: HybridClothingItemV2[];
  selectedPart: string;
  onPartSelect: (item: HybridClothingItemV2) => void;
  selectedHotel: string;
  selectedColor?: string;
}

const ItemGrid = ({ items, selectedPart, onPartSelect, selectedHotel, selectedColor }: ItemGridProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🔍</div>
        <p>Nenhum item encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onPartSelect(item)}
          className={`relative p-2 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-md ${
            selectedPart === item.id
              ? 'border-amber-400 bg-amber-50'
              : 'border-gray-200 hover:border-amber-300'
          }`}
          title={`${item.name} (${item.source})`}
        >
          <IntelligentClothingThumbnail
            item={item}
            hotel={selectedHotel}
            selectedColorId={selectedColor}
            size="m"
          />
          <div className="mt-1 text-center">
            <div className="text-xs font-bold text-gray-700 truncate">
              {item.figureId}
            </div>
            {item.club === 'HC' && (
              <Badge variant="secondary" className="text-xs mt-1">
                HC
              </Badge>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default HybridClothingSelectorV2;
