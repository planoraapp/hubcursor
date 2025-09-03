
import { useState, useEffect } from 'react';
import { useOfficialFigureData } from '@/hooks/useFigureDataOfficial';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, Crown, Gem } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ExpandedClothingSelectorProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  selectedColor: string;
  onItemSelect: (itemId: string) => void;
  selectedItem: string;
}

const ExpandedClothingSelector = ({
  selectedCategory,
  selectedGender,
  selectedColor,
  onItemSelect,
  selectedItem
}: ExpandedClothingSelectorProps) => {
  const { data: figureData, isLoading, error } = useOfficialFigureData();
  const [filteredItems, setFilteredItems] = useState<any[]>([]);

  // Category icons mapping
  const categoryIcons = {
    hd: '👤', hr: '💇', ch: '👕', lg: '👖', sh: '👟',
    ha: '🎩', ea: '👓', fa: '😷', cc: '🧥', ca: '🎖️', wa: '👔', cp: '🎨'
  };

  // Category names in Portuguese
  const categoryNames = {
    hd: 'Rostos', hr: 'Cabelos', ch: 'Camisetas', lg: 'Calças/Saias', sh: 'Sapatos',
    ha: 'Chapéus', ea: 'Óculos', fa: 'Acessórios Faciais', cc: 'Casacos', 
    ca: 'Acessórios Peito', wa: 'Cintura', cp: 'Estampas'
  };

  useEffect(() => {
    if (figureData && selectedCategory) {
      const categoryData = figureData[selectedCategory] || [];
      
      // Filter by gender and sort by club status
      const filtered = categoryData
        .filter(item => item.gender === selectedGender || item.gender === 'U')
        .sort((a, b) => {
          // HC items first, then regular items
          if (a.club === '1' && b.club !== '1') return -1;
          if (b.club === '1' && a.club !== '1') return 1;
          return parseInt(a.id) - parseInt(b.id);
        });

      setFilteredItems(filtered);
    }
  }, [figureData, selectedCategory, selectedGender]);

  const getItemImageUrl = (itemId: string) => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${selectedCategory}-${itemId}-${selectedColor}&gender=${selectedGender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
  };

  const getRarityBadge = (item: any) => {
    if (item.club === '1') {
      return (
        <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs bg-yellow-500 text-black border-yellow-600">
          <Crown className="w-3 h-3 mr-1" />
          HC
        </Badge>
      );
    }
    
    // Special items (higher IDs often indicate rarer items)
    if (parseInt(item.id) > 1000) {
      return (
        <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs bg-purple-500 text-white border-purple-600">
          <Gem className="w-3 h-3 mr-1" />
          VIP
        </Badge>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <Card className="h-64">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-sm text-gray-600">Carregando {categoryNames[selectedCategory as keyof typeof categoryNames]}...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !figureData) {
    return (
      <Card className="h-64">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <p className="mb-2">❌ Erro ao carregar itens</p>
            <p className="text-sm">Tente novamente mais tarde</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-80">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{categoryIcons[selectedCategory as keyof typeof categoryIcons]}</span>
          <h3 className="font-semibold text-lg">{categoryNames[selectedCategory as keyof typeof categoryNames]}</h3>
          <Badge variant="outline" className="ml-auto">
            {filteredItems.length} itens
          </Badge>
        </div>

        <div className="grid grid-cols-8 gap-2 max-h-60 overflow-y-auto">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative">
              <Button
                variant="outline"
                size="sm"
                className={`w-12 h-12 p-0 relative border-2 transition-all duration-200 ${
                  selectedItem === item.id 
                    ? 'border-blue-500 ring-2 ring-blue-300 scale-105' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => onItemSelect(item.id)}
                title={`Item ${item.id} ${item.club === '1' ? '(HC)' : ''}`}
              >
                <img
                  src={getItemImageUrl(item.id)}
                  alt={`Item ${item.id}`}
                  className="w-full h-full object-contain rounded"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    // Fallback: mostrar ID do item se imagem falhar
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-xs font-bold">${item.id}</span>`;
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
            <p>Nenhum item disponível nesta categoria</p>
            <p className="text-sm">para o gênero selecionado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpandedClothingSelector;
