import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, Filter, Grid3x3, List, Info } from 'lucide-react';
import { useHabboEmotionClothing, triggerHabboEmotionSync, HabboEmotionClothingItem } from '@/hooks/useHabboEmotionClothing';
import { useToast } from '@/hooks/use-toast';
import EnhancedClothingThumbnail from '@/components/HabboEditor/EnhancedClothingThumbnail';

interface HabboEmotionClothingGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F' | 'U';
  onItemSelect: (item: HabboEmotionClothingItem) => void;
  onColorSelect?: (colorId: string, item: HabboEmotionClothingItem) => void;
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

  // Fetch comprehensive HabboEmotion clothing data
  const { 
    data: clothingData, 
    isLoading, 
    error, 
    refetch 
  } = useHabboEmotionClothing(2000, selectedCategory, selectedGender);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    if (!clothingData) return [];
    
    let filtered = clothingData.filter(item => {
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

    return filtered;
  }, [clothingData, selectedCategory, selectedGender, searchTerm, sortBy]);

  const handleItemClick = (item: any) => {
    setSelectedItemState(item);
    onItemSelect(item);
    toast({
      title: "✅ Item Selecionado",
      description: `${item.name || item.code} aplicado ao avatar`,
    });
  };

  const handleSync = async () => {
    try {
      toast({
        title: "🔄 Sincronizando...",
        description: "Atualizando catálogo HabboEmotion",
      });
      
      await triggerHabboEmotionSync();
      await refetch();
      
      toast({
        title: "✅ Sincronização Completa",
        description: "Catálogo atualizado com sucesso",
      });
    } catch (error) {
      toast({
        title: "❌ Erro na Sincronização",
        description: "Falha ao atualizar o catálogo",
        variant: "destructive"
      });
    }
  };

  // Statistics
  const stats = useMemo(() => {
    if (!clothingData) return { total: 0, byCategory: {}, bySource: {} };
    
    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    
    clothingData.forEach(item => {
      byCategory[item.part] = (byCategory[item.part] || 0) + 1;
      bySource[item.source] = (bySource[item.source] || 0) + 1;
    });
    
    return {
      total: clothingData.length,
      byCategory,
      bySource,
      filtered: filteredItems.length
    };
  }, [clothingData, filteredItems]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Carregando catálogo HabboEmotion...</p>
        <p className="text-sm text-gray-500 mt-2">Milhares de itens sendo processados</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded p-6">
          <p className="text-red-600 font-medium mb-2">❌ Erro ao carregar itens</p>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const categoryConfig = CATEGORY_CONFIG[selectedCategory as keyof typeof CATEGORY_CONFIG];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {categoryConfig && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded ${categoryConfig.color}`}>
              <span className="text-lg">{categoryConfig.icon}</span>
              <span className="font-medium">{categoryConfig.name}</span>
            </div>
          )}
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {stats.filtered} de {stats.total} itens
          </Badge>
        </div>
        
        <Button onClick={handleSync} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Sincronizar
        </Button>
      </div>

      {/* Statistics Panel */}
      {stats.total > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Estatísticas do Catálogo</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-900">{stats.total}</div>
              <div className="text-gray-600">Total de Itens</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{Object.keys(stats.byCategory).length}</div>
              <div className="text-gray-600">Categorias</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{stats.bySource['habboemotion-scraping'] || 0}</div>
              <div className="text-gray-600">HE Originais</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{stats.bySource['enhanced-generation'] || 0}</div>
              <div className="text-gray-600">Gerados</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar roupas por nome ou código..."
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

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">Nenhum item encontrado</p>
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
              key={`${item.id}_${item.code}_${index}`}
              className={`cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                selectedItemState?.id === item.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
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
                      <span className="text-xs text-gray-500">ID: {item.id}</span>
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
