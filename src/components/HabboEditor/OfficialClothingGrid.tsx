import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, RefreshCw, Shirt } from 'lucide-react';
import { useOfficialHabboFigureData, type OfficialHabboItem } from '@/hooks/useOfficialHabboFigureData';

interface OfficialClothingGridProps {
  selectedCategory: string;
  selectedGender?: 'M' | 'F' | 'U';
  onItemSelect?: (item: OfficialHabboItem) => void;
  selectedItem?: string;
  className?: string;
}

// Configuração das categorias oficiais do Habbo (baseado na documentação ViaJovem)
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

const OfficialClothingGrid = ({
  selectedCategory,
  selectedGender = 'U',
  onItemSelect,
  selectedItem,
  className = ''
}: OfficialClothingGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'club'>('id');
  
  const { data: officialData, isLoading, error, refetch } = useOfficialHabboFigureData();

  // Filtrar e ordenar itens
  const filteredItems = useMemo(() => {
    if (!officialData || !officialData[selectedCategory]) {
      return [];
    }

    let items = officialData[selectedCategory];

    // Filtrar por gênero
    if (selectedGender !== 'U') {
      items = items.filter(item => item.gender === 'U' || item.gender === selectedGender);
    }

    // Filtrar por busca
    if (searchTerm) {
      items = items.filter(item => 
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    items = items.sort((a, b) => {
      if (sortBy === 'club') {
        if (a.club === b.club) return a.id.localeCompare(b.id);
        return a.club === 'HC' ? -1 : 1;
      }
      return a.id.localeCompare(b.id);
    });

    return items;
  }, [officialData, selectedCategory, selectedGender, searchTerm, sortBy]);

  const categoryInfo = CATEGORY_CONFIG[selectedCategory as keyof typeof CATEGORY_CONFIG];

  const handleItemClick = (item: OfficialHabboItem) => {
    console.log('🎯 [OfficialGrid] Item selecionado:', item);
    onItemSelect?.(item);
  };

  const handleSync = () => {
    console.log('🔄 [OfficialGrid] Sincronizando dados oficiais...');
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados oficiais do Habbo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p>Erro ao carregar dados oficiais</p>
          <Button onClick={handleSync} variant="outline" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
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
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: 'id' | 'club') => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Por ID</SelectItem>
                <SelectItem value="club">Por Club</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de itens */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {filteredItems.map((item) => (
          <Card 
            key={`${item.category}-${item.id}`}
            className={`cursor-pointer transition-all hover:shadow-md border-2 ${
              selectedItem === item.id ? 'border-primary shadow-lg' : 'border-transparent'
            }`}
            onClick={() => handleItemClick(item)}
          >
            <CardContent className="p-2">
              <div className="aspect-square relative mb-2">
                <img
                  src={item.imageUrl}
                  alt={`${item.category}-${item.id}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute top-0 right-0">
                  {item.club === 'HC' && (
                    <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">
                      HC
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-mono">{item.id}</p>
                <div className="flex justify-center gap-1 mt-1">
                  {item.colors.slice(0, 4).map((color, idx) => (
                    <div
                      key={`${item.id}-color-${idx}`}
                      className="w-2 h-2 bg-gray-300 rounded-sm border"
                      title={`Cor ${color}`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <Shirt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum item encontrado para esta categoria</p>
            {searchTerm && (
              <p className="text-sm mt-2">
                Tente ajustar sua busca ou verificar a categoria selecionada
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default OfficialClothingGrid;