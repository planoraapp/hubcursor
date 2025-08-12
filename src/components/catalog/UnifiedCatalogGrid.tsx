import { useState, useMemo } from 'react';
import { Search, Filter, Shirt } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUnifiedClothingAPI, UnifiedClothingItem } from '@/hooks/useUnifiedClothingAPI';
import IntelligentClothingThumbnail from '../HabboEditor/IntelligentClothingThumbnail';

interface UnifiedCatalogGridProps {
  onItemSelect: (item: UnifiedClothingItem) => void;
}

export const UnifiedCatalogGrid = ({ onItemSelect }: UnifiedCatalogGridProps) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('U');

  const { data: clothing, isLoading, error } = useUnifiedClothingAPI({
    limit: 500,
    category: categoryFilter === 'all' ? '' : categoryFilter,
    gender: genderFilter,
    search
  });

  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'Todas as Roupas' },
    { value: 'hd', label: 'Cabeças' },
    { value: 'hr', label: 'Cabelos' },
    { value: 'ch', label: 'Camisas' },
    { value: 'lg', label: 'Calças' },
    { value: 'sh', label: 'Sapatos' },
    { value: 'ha', label: 'Chapéus' },
    { value: 'ea', label: 'Óculos' },
  ], []);

  const genderOptions = useMemo(() => [
    { value: 'U', label: 'Unisex' },
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ], []);

  if (error) {
    return (
      <div className="text-center py-12">
        <Shirt className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-600 mb-2">Erro ao Carregar Roupas</h3>
        <p className="text-gray-600 mb-4">Não foi possível carregar as roupas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clothing Grid */}
      <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        {isLoading ? (
          Array.from({ length: 48 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded" />
          ))
        ) : clothing && clothing.length > 0 ? (
          clothing.map(item => (
            <button
              key={item.id}
              onClick={() => onItemSelect(item)}
              className="aspect-square p-0.5 rounded hover:bg-gray-50"
              title={item.name}
            >
              <IntelligentClothingThumbnail 
                item={item} 
                size="m" 
                className="w-full h-full"
              />
            </button>
          ))
        ) : (
          <div className="text-center py-12 col-span-full">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma roupa encontrada</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
          </div>
        )}
      </div>
    </div>
  );
};
