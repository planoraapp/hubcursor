
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, Filter, Grid3x3, List, Info } from 'lucide-react';
import { useHabboEmotionAPI, HabboEmotionClothing } from '@/hooks/useHabboEmotionAPI';
import { useToast } from '@/hooks/use-toast';
import EnhancedClothingThumbnail from '@/components/HabboEditor/EnhancedClothingThumbnail';

interface HabboEmotionClothingGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F' | 'U';
  onItemSelect: (item: HabboEmotionClothing) => void;
  onColorSelect?: (colorId: string, item: HabboEmotionClothing) => void;
  selectedItem?: string;
  selectedColor?: string;
  selectedColorId?: string;
  className?: string;
}

const CATEGORY_CONFIG = {
  hd: { name: 'Rostos', icon: '👤', color: 'bg-pink-100' },
  hr: { name: 'Cabelos', icon: '💇', color: 'bg-purple-100' },
  ch: { name: 'Camisetas', icon: '👕', color: 'bg-blue-100' },
  lg: { name: 'Calças', icon: '👖', color: 'bg-green-100' },
  sh: { name: 'Sapatos', icon: '👟', color: 'bg-yellow-100' },
  ha: { name: 'Chapéus', icon: '🎩', color: 'bg-red-100' },
  ea: { name: 'Óculos', icon: '👓', color: 'bg-indigo-100' },
  cc: { name: 'Casacos', icon: '🧥', color: 'bg-teal-100' },
  ca: { name: 'Acessórios Peito', icon: '🎖️', color: 'bg-orange-100' },
  wa: { name: 'Cintura', icon: '👔', color: 'bg-cyan-100' },
  fa: { name: 'Acessórios Rosto', icon: '😎', color: 'bg-lime-100' },
  cp: { name: 'Estampas', icon: '🎨', color: 'bg-rose-100' }
};

export const HabboEmotionClothingGrid = ({
  selectedCategory,
  selectedGender,
  onItemSelect,
  onColorSelect,
  selectedItem,
  selectedColor = '1',
  selectedColorId = '1',
  className = ''
}: HabboEmotionClothingGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [selectedItemState, setSelectedItemState] = useState<any>(null);
  const { toast } = useToast();

  // Usar diretamente a API real do HabboEmotion
  const { 
    data: realApiData, 
    isLoading, 
    error, 
    refetch 
  } = useHabboEmotionAPI({ limit: 200, enabled: true });

  console.log(`📊 [HabboEmotionGrid] Real API data received:`, {
    dataLength: realApiData?.length || 0,
    sampleData: realApiData?.slice(0, 2),
    isLoading,
    hasError: !!error
  });

  // Filter and sort REAL items directly from API
  const filteredItems = useMemo(() => {
    if (!realApiData || !Array.isArray(realApiData)) {
      console.log('⚠️ [HabboEmotionGrid] No real data available');
      return [];
    }
    
    console.log(`🔍 [HabboEmotionGrid] Filtering ${realApiData.length} real items`, {
      selectedCategory,
      selectedGender,
      searchTerm
    });
    
    let filtered = realApiData.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.part !== selectedCategory) return false;
      
      // Gender filter
      if (selectedGender !== 'U' && item.gender !== 'U' && item.gender !== selectedGender) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.name?.toLowerCase().includes(searchLower) ||
          item.code?.toLowerCase().includes(searchLower) ||
          item.part?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || a.code || '').localeCompare(b.name || b.code || '');
        case 'id':
          return (a.id || 0) - (b.id || 0);
        case 'newest':
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        case 'club':
          if (a.club === 'HC' && b.club !== 'HC') return -1;
          if (b.club === 'HC' && a.club !== 'HC') return 1;
          return 0;
        default:
          return 0;
      }
    });

    console.log(`✅ [HabboEmotionGrid] Filtered to ${filtered.length} real items`);
    return filtered;
  }, [realApiData, selectedCategory, selectedGender, searchTerm, sortBy]);

  const handleItemClick = (item: HabboEmotionClothing) => {
    console.log(`🎯 [HabboEmotionGrid] Real item selected:`, item);
    setSelectedItemState(item);
    onItemSelect(item);
    toast({
      title: "✅ Item Real Selecionado",
      description: `${item.name || item.code} da API HabboEmotion aplicado`,
    });
  };

  const handleSync = async () => {
    try {
      toast({
        title: "🔄 Atualizando API Real...",
        description: "Recarregando dados reais da API HabboEmotion",
      });
      
      await refetch();
      
      toast({
        title: "✅ API Real Atualizada",
        description: "Dados reais recarregados com sucesso",
      });
    } catch (error) {
      toast({
        title: "❌ Erro na API Real",
        description: "Falha ao recarregar dados da API",
        variant: "destructive"
      });
    }
  };

  // Statistics for REAL data
  const stats = useMemo(() => {
    if (!realApiData) return { total: 0, byCategory: {}, bySource: {} };
    
    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    
    realApiData.forEach(item => {
      byCategory[item.part] = (byCategory[item.part] || 0) + 1;
      bySource['habboemotion-api'] = (bySource['habboemotion-api'] || 0) + 1;
    });
    
    return {
      total: realApiData.length,
      byCategory,
      bySource,
      filtered: filteredItems.length
    };
  }, [realApiData, filteredItems]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Carregando API Real HabboEmotion...</p>
        <p className="text-sm text-gray-500 mt-2">Conectando com api.habboemotion.com</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded p-6">
          <p className="text-red-600 font-medium mb-2">❌ Erro na API Real</p>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reconectar API Real
          </Button>
        </div>
      </div>
    );
  }

  const categoryConfig = CATEGORY_CONFIG[selectedCategory as keyof typeof CATEGORY_CONFIG];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Real API Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {categoryConfig && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded ${categoryConfig.color}`}>
              <span className="text-lg">{categoryConfig.icon}</span>
              <span className="font-medium">{categoryConfig.name}</span>
            </div>
          )}
          <Badge variant="secondary">
            {stats.filtered} itens
          </Badge>
        </div>
        
        <Button onClick={handleSync} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>


      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar roupas reais por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="id">ID</SelectItem>
            <SelectItem value="newest">Mais Recentes</SelectItem>
            <SelectItem value="club">HC Primeiro</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border rounded">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="border-0"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="border-0"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Real Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">Nenhum item real encontrado</p>
          <p className="text-sm text-gray-500">
            Tente ajustar os filtros ou fazer uma nova busca
          </p>
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3' 
            : 'space-y-2'
        }`}>
          {filteredItems.map((item, index) => (
            <Card
              key={`real_${item.id}_${item.code}_${index}`}
              className={`cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                selectedItemState?.id === item.id ? 'ring-2 ring-green-500 shadow-lg' : ''
              } ${viewMode === 'grid' ? '' : 'flex flex-row'}`}
              onClick={() => handleItemClick(item)}
            >
              <CardContent className={`${viewMode === 'grid' ? 'p-2' : 'flex items-center p-3 space-x-3'}`}>
                <div className={`relative ${viewMode === 'grid' ? '' : 'flex-shrink-0'}`}>
                  <EnhancedClothingThumbnail 
                    item={item}
                    selectedColorId={selectedColorId}
                    size={viewMode === 'grid' ? 'm' : 's'}
                    className={`${viewMode === 'grid' ? 'w-full h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded' : ''}`}
                  />
                  
                  {/* Color count indicator */}
                  {item.colors && item.colors.length > 1 && (
                    <div className="absolute top-1 right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {item.colors.length}
                    </div>
                  )}
                </div>
                
                <div className={`${viewMode === 'grid' ? 'mt-1 text-center' : 'flex-1 min-w-0'}`}>
                  <div className={`text-xs font-medium truncate ${viewMode === 'list' ? 'text-sm' : ''}`} 
                       title={item.name || item.code}>
                    {item.name || item.code}
                  </div>
                  
                  {viewMode === 'list' && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">Real ID: {item.id}</span>
                      {item.club === 'HC' && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          HC
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabboEmotionClothingGrid;
