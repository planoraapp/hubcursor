
import { useState } from 'react';
import { useFlashViaJovemCategory, ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Crown, Star, Gem } from 'lucide-react';

interface ViaJovemClothingGridExpandedProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  selectedColor: string;
  onItemSelect: (itemId: string) => void;
  selectedItem: string;
}

const ViaJovemClothingGridExpanded = ({
  selectedCategory,
  selectedGender,
  selectedColor,
  onItemSelect,
  selectedItem
}: ViaJovemClothingGridExpandedProps) => {
  const { items, isLoading, error } = useFlashViaJovemCategory(selectedCategory, selectedGender);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.figureId.includes(searchTerm) ||
    item.swfName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getItemThumbnail = (item: ViaJovemFlashItem) => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.category}-${item.figureId}-${selectedColor}&gender=${selectedGender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
  };

  const getRarityBadge = (item: ViaJovemFlashItem) => {
    if (item.club === 'hc') {
      return (
        <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1">
          <Crown className="w-3 h-3 mr-1" />
          HC
        </Badge>
      );
    }

    // Badge especial para itens do Flash Assets
    return (
      <Badge className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1">
        <Gem className="w-3 h-3 mr-1" />
        SWF
      </Badge>
    );
  };

  const categoryInfo = {
    'hd': { name: 'Rostos', icon: '👤' },
    'hr': { name: 'Cabelos', icon: '💇' },
    'ch': { name: 'Camisetas', icon: '👕' },
    'lg': { name: 'Calças/Saias', icon: '👖' },
    'sh': { name: 'Sapatos', icon: '👟' },
    'ha': { name: 'Chapéus', icon: '🎩' },
    'ea': { name: 'Óculos', icon: '👓' },
    'fa': { name: 'Acessórios Faciais', icon: '😷' },
    'cc': { name: 'Casacos', icon: '🧥' },
    'ca': { name: 'Acessórios Peito', icon: '🎖️' },
    'wa': { name: 'Cintura', icon: '👔' },
    'cp': { name: 'Estampas', icon: '🎨' }
  };

  const currentCategory = categoryInfo[selectedCategory as keyof typeof categoryInfo];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Carregando {currentCategory?.name}...</p>
            <p className="text-xs text-gray-500 mt-1">Flash Assets Supabase</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !currentCategory) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <p>❌ Erro ao carregar itens</p>
            <p className="text-sm">Dados do Flash Assets indisponíveis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{currentCategory.icon}</span>
          {currentCategory.name}
          <Badge variant="outline" className="ml-auto bg-blue-50">
            {filteredItems.length} itens
          </Badge>
          <Badge variant="secondary" className="bg-green-50">
            Flash Assets
          </Badge>
        </CardTitle>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder={`Buscar em ${currentCategory.name}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Grid 8x8 ViaJovem Style */}
        <div className="grid grid-cols-8 gap-2 max-h-80 overflow-y-auto">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative">
              <Button
                variant="outline"
                size="sm"
                className={`w-12 h-12 p-0 relative border-2 transition-all duration-200 ${
                  selectedItem === item.figureId 
                    ? 'border-blue-500 ring-2 ring-blue-300 scale-105 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => onItemSelect(item.figureId)}
                title={`${item.name} (ID: ${item.figureId})`}
              >
                <img
                  src={getItemThumbnail(item)}
                  alt={item.name}
                  className="w-full h-full object-contain rounded"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    // Fallback para ID textual se imagem falhar
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const span = document.createElement('span');
                      span.className = 'text-xs font-bold text-gray-600 fallback-text';
                      span.textContent = item.figureId;
                      parent.appendChild(span);
                    }
                  }}
                />
              </Button>
              {getRarityBadge(item)}
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhum item encontrado</p>
            {searchTerm && (
              <p className="text-sm">para "{searchTerm}"</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ViaJovemClothingGridExpanded;
