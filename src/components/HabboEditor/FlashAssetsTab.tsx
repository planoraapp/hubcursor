import React, { useState, useMemo } from 'react';
import { useFlashAssetsClothing } from '@/hooks/useFlashAssetsClothing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface FlashAssetsTabProps {
  onItemSelect?: (item: any) => void;
}

export const FlashAssetsTab: React.FC<FlashAssetsTabProps> = ({ onItemSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    data: clothingItems = [],
    isLoading,
    error
  } = useFlashAssetsClothing({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    gender: selectedGender === 'all' ? undefined : selectedGender,
    search: searchTerm || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage
  });

  const filteredItems = useMemo(() => {
    return clothingItems.filter(item => {
      const matchesSearch = !searchTerm || 
        item.part?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_id?.toString().includes(searchTerm);
      
      const matchesCategory = selectedCategory === 'all' || item.part === selectedCategory;
      const matchesGender = selectedGender === 'all' || item.gender === selectedGender;
      
      return matchesSearch && matchesCategory && matchesGender;
    });
  }, [clothingItems, searchTerm, selectedCategory, selectedGender]);

  const handleItemClick = (item: any) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
    toast.success(`Item ${item.part} ${item.item_id} selecionado!`);
  };

  const getImageUrl = (item: any) => {
    if (item.image_url) {
      return item.image_url;
    }
    
    // Fallback to Habbo Imaging API
    const baseUrl = 'https://www.habbo.com/habbo-imaging/avatarimage';
    const figureParam = `${item.part}=${item.item_id}`;
    return `${baseUrl}?figure=${figureParam}&direction=2&head_direction=2&size=s`;
  };

  const categories = ['all', 'hd', 'hr', 'ch', 'lg', 'sh', 'ca', 'wa', 'fa', 'ea', 'ha'];
  const genders = ['all', 'M', 'F', 'U'];

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">Erro ao carregar itens: {error.message}</p>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por parte ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'Todas' : cat.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedGender} onValueChange={setSelectedGender}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Gênero" />
          </SelectTrigger>
          <SelectContent>
            {genders.map(gender => (
              <SelectItem key={gender} value={gender}>
                {gender === 'all' ? 'Todos' : gender}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Carregando itens...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.map((item, index) => (
            <Card 
              key={`${item.part}-${item.item_id}-${index}`}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleItemClick(item)}
            >
              <CardContent className="p-3">
                <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={getImageUrl(item)}
                    alt={`${item.part} ${item.item_id}`}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAyOEgzNlYzNkgyOFYyOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                    }}
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    {item.part?.toUpperCase()} {item.item_id}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 justify-center">
                    <Badge variant="outline" className="text-xs">
                      {item.gender || 'U'}
                    </Badge>
                    {item.club && item.club !== 'normal' && (
                      <Badge variant="secondary" className="text-xs">
                        {item.club.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredItems.length === 0 && !isLoading && (
        <div className="text-center p-8 text-gray-500">
          <p>Nenhum item encontrado</p>
          <p className="text-sm mt-2">Tente ajustar os filtros ou termo de busca</p>
        </div>
      )}
    </div>
  );
};
