
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Filter } from 'lucide-react';
import { useFlashViaJovemCategory, ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';
import ViaJovemStyleThumbnail from './ViaJovemStyleThumbnail';

interface ViaJovemStyleGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: ViaJovemFlashItem, colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  className?: string;
}

const ViaJovemStyleGrid = ({
  selectedCategory,
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem = '',
  selectedColor = '1',
  className = ''
}: ViaJovemStyleGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clubFilter, setClubFilter] = useState<'ALL' | 'FREE' | 'HC'>('ALL');
  
  const { items, isLoading, error } = useFlashViaJovemCategory(selectedCategory, selectedGender);

  // Filtrar itens baseado na busca e filtros
  const filteredItems = useMemo(() => {
    let filtered = items || [];
    
    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.figureId.includes(searchTerm) || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.swfName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro por clube
    if (clubFilter !== 'ALL') {
      filtered = filtered.filter(item => 
        clubFilter === 'HC' ? item.club === 'hc' : item.club === 'normal'
      );
    }
    
    return filtered;
  }, [items, searchTerm, clubFilter]);

  const handleItemClick = (item: ViaJovemFlashItem) => {
    console.log('🎯 [ViaJovemGrid] Flash Asset selecionado:', item.name, item.figureId);
    onItemSelect(item, selectedColor);
  };

  const handleColorChange = (item: ViaJovemFlashItem, colorId: string) => {
    console.log('🎨 [ViaJovemGrid] Cor alterada:', { item: item.name, colorId });
    onItemSelect(item, colorId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando Flash Assets locais...</span>
      </div>
    );
  }

  if (error) {
    console.error('❌ [ViaJovemGrid] Erro:', error);
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p className="font-medium">Erro ao carregar Flash Assets</p>
          <p className="text-sm text-gray-600 mt-1">Verifique seus assets locais</p>
        </div>
      </Card>
    );
  }

  if (!items?.length) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">Nenhum asset encontrado</p>
          <p className="text-sm mt-2">Categoria: {selectedCategory} - Gênero: {selectedGender}</p>
          <Badge variant="outline" className="mt-2">Flash Assets Local</Badge>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com controles igual ViaJovem */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span>Flash Assets Editor</span>
              <Badge variant="secondary">{filteredItems.length} assets</Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Seus Assets Locais
              </Badge>
            </CardTitle>
          </div>
          
          {/* Controles de busca e filtro */}
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, ID ou arquivo SWF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-1">
              {(['ALL', 'FREE', 'HC'] as const).map((club) => (
                <Button
                  key={club}
                  variant={clubFilter === club ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setClubFilter(club)}
                  className="text-xs px-2"
                >
                  {club === 'ALL' ? 'Todos' : club}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grid de thumbnails dos flash assets */}
      <div className="max-h-96 overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg border">
        <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {filteredItems.map((item) => (
            <ViaJovemStyleThumbnail
              key={item.id}
              item={item}
              colorId={selectedColor}
              gender={selectedGender}
              hotel={selectedHotel}
              isSelected={selectedItem === item.figureId}
              onClick={() => handleItemClick(item)}
              onColorChange={(colorId) => handleColorChange(item, colorId)}
            />
          ))}
        </div>
      </div>

      {/* Footer com estatísticas */}
      <Card>
        <CardContent className="p-3">
          <div className="text-xs text-gray-600 flex items-center justify-between">
            <span>🎯 Fonte: Flash Assets Locais (Supabase Storage)</span>
            <span>
              📊 {filteredItems.length} assets • 
              {filteredItems.filter(i => i.club === 'hc').length} HC • 
              {filteredItems.filter(i => i.club === 'normal').length} FREE
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViaJovemStyleGrid;
