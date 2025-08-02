
import { useState, useMemo } from 'react';
import { Search, Filter, Shirt } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFlashAssetsClothing, FlashAssetItem } from '@/hooks/useFlashAssetsClothing';
import IntelligentClothingThumbnail from './HabboEditor/IntelligentClothingThumbnail';

interface OptimizedClothingGridProps {
  onItemSelect: (item: FlashAssetItem) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORY_NAMES = {
  'all': 'Todas as Roupas',
  'hd': '👤 Cabeça/Pele',
  'hr': '💇 Cabelos',
  'ch': '👕 Camisas/Tops',
  'lg': '👖 Calças/Saias',
  'sh': '👟 Sapatos',
  'ha': '👒 Chapéus/Acessórios',
  'ea': '👓 Óculos/Olhos',
  'fa': '😊 Rosto/Face',
  'wa': '⌚ Cintura/Cinto',
  'ca': '🧥 Casacos',
  'cp': '🎨 Estampas'
};

export const OptimizedClothingGrid = ({ 
  onItemSelect, 
  selectedCategory, 
  onCategoryChange 
}: OptimizedClothingGridProps) => {
  const [search, setSearch] = useState('');
  const [clubFilter, setClubFilter] = useState('all');

  const { data: clothing, isLoading, error } = useFlashAssetsClothing({
    limit: 500,
    category: selectedCategory === 'all' ? '' : selectedCategory,
    search,
    enabled: true
  });

  // Filter and organize clothing
  const organizedClothing = useMemo(() => {
    if (!clothing) return {};

    let filtered = clothing;

    // Apply club filter
    if (clubFilter !== 'all') {
      filtered = filtered.filter(item => 
        clubFilter === 'hc' ? item.club === 'HC' : item.club === 'FREE'
      );
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.swfName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Group by category and club
    const grouped = filtered.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) acc[category] = { hc: [], free: [] };
      
      if (item.club === 'HC') {
        acc[category].hc.push(item);
      } else {
        acc[category].free.push(item);
      }
      
      return acc;
    }, {} as Record<string, { hc: FlashAssetItem[]; free: FlashAssetItem[] }>);

    return grouped;
  }, [clothing, search, clubFilter]);

  const totalItems = clothing?.length || 0;
  const categoryOptions = Object.entries(CATEGORY_NAMES);

  if (error) {
    return (
      <div className="text-center py-12">
        <Shirt className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-600 mb-2">Erro ao Carregar Roupas</h3>
        <p className="text-gray-600 mb-4">Não foi possível carregar as roupas do storage.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar roupas por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="text-gray-600 w-4 h-4" />
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(([key, name]) => (
                <SelectItem key={key} value={key}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={clubFilter} onValueChange={setClubFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="hc">HC</SelectItem>
              <SelectItem value="free">Gratuitos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium shadow-sm">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
          👕 {totalItems} Roupas Carregadas
          <span className="bg-purple-200 px-3 py-1 rounded-full text-sm font-bold">
            Flash Assets
          </span>
        </div>
      </div>

      {/* Clothing Grid */}
      <div className="bg-white rounded-lg border shadow-sm p-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {Array.from({ length: 48 }, (_, i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        ) : Object.keys(organizedClothing).length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma roupa encontrada</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(organizedClothing).map(([category, items]) => (
              <div key={category} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center gap-2 border-b pb-2">
                  <h4 className="font-semibold text-gray-700">
                    {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES] || category.toUpperCase()}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {items.hc.length + items.free.length} itens
                  </Badge>
                </div>

                {/* HC Items */}
                {items.hc.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500 text-white text-xs">HC</Badge>
                      <span className="text-xs text-gray-500">{items.hc.length} itens</span>
                    </div>
                    <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1">
                      {items.hc.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onItemSelect(item)}
                          className="aspect-square p-0.5 rounded hover:bg-yellow-50 hover:scale-110 transition-all duration-200"
                          title={`${item.name} (HC)`}
                        >
                          <IntelligentClothingThumbnail 
                            item={item} 
                            size="m" 
                            className="w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Free Items */}
                {items.free.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Gratuitos</Badge>
                      <span className="text-xs text-gray-500">{items.free.length} itens</span>
                    </div>
                    <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1">
                      {items.free.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onItemSelect(item)}
                          className="aspect-square p-0.5 rounded hover:bg-gray-50 hover:scale-110 transition-all duration-200"
                          title={item.name}
                        >
                          <IntelligentClothingThumbnail 
                            item={item} 
                            size="m" 
                            className="w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
