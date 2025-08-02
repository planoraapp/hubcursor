
import { useState } from 'react';
import { useOfficialHabboClothing } from '@/hooks/useOfficialHabboClothing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Crown } from 'lucide-react';

interface HabboHubClothingGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F' | 'U';
  selectedColor: string;
  onItemSelect: (itemId: string) => void;
  selectedItem: string;
}

const HabboHubClothingGrid = ({
  selectedCategory,
  selectedGender,
  selectedColor,
  onItemSelect,
  selectedItem
}: HabboHubClothingGridProps) => {
  const { data: items = [], isLoading, error } = useOfficialHabboClothing(selectedCategory, selectedGender);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.figureId.includes(searchTerm)
  );

  // Gerar URL correta com cor selecionada
  const getItemThumbnail = (item: any) => {
    const headOnlyCategories = ['hd', 'hr', 'ha', 'ea', 'fa'];
    const headOnly = headOnlyCategories.includes(item.category) ? '&headonly=1' : '';
    
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.category}-${item.figureId}-${selectedColor}&gender=${selectedGender}&size=l&direction=2&head_direction=3${headOnly}`;
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
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-sm text-gray-600">Carregando {currentCategory?.name}...</p>
            <p className="text-xs text-gray-500 mt-1">Dados Oficiais Habbo</p>
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
            <p className="text-sm">Dados oficiais indisponíveis</p>
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
          <Badge variant="secondary" className="bg-green-50 text-green-700">
            Oficial Habbo
          </Badge>
        </CardTitle>
        
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
              
              {/* Badge HC limpa (sem sobreposição no thumbnail) */}
              {item.club && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-2 h-2 text-black" />
                </div>
              )}
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

export default HabboHubClothingGrid;
