import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFlashAssetsClothing } from '@/hooks/useFlashAssetsClothing';
import { Search, Palette, Loader2 } from 'lucide-react';
import ColorPickerPopover from './ColorPickerPopover';

interface FlashAssetsTabProps {
  onItemSelect: (itemId: string, part: string, color?: string) => void;
}

interface ClothingItem {
  item_id: string;
  part: string;
  gender: string;
  colors: string[];
  image_url: string | null;
}

const categories = ['head', 'chest', 'legs', 'feet'];
const genders = ['M', 'F'];

const FlashAssetsTab: React.FC<FlashAssetsTabProps> = ({ onItemSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedColors, setSelectedColors] = useState<{ [itemId: string]: string }>({});
  
  const { fetchClothing } = useFlashAssetsClothing();

  useEffect(() => {
    loadClothingItems();
  }, [searchTerm, selectedCategory, selectedGender]);

  const loadClothingItems = async () => {
    setLoading(true);
    try {
      const items = await fetchClothing(searchTerm, selectedCategory, selectedGender);
      setClothingItems(items);
    } catch (error) {
      console.error('Erro ao carregar itens de roupa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleColorSelect = (itemId: string, color: string) => {
    setSelectedColors(prevColors => ({
      ...prevColors,
      [itemId]: color
    }));
  };

  const renderClothingGrid = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Carregando itens...</span>
        </div>
      );
    }

    if (clothingItems.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum item encontrado para os filtros selecionados.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-4 gap-2">
        {clothingItems.map((item) => (
          <div key={item.item_id} className="border rounded-lg p-2 hover:bg-gray-50 cursor-pointer">
            <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.item_id}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100"
                style={{ display: item.image_url ? 'none' : 'flex' }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">👔</div>
                  <div>{item.item_id}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium truncate">{item.item_id}</p>
              <Badge variant="secondary" className="text-xs">
                {item.part}
              </Badge>
              
              {item.colors && item.colors.length > 0 && (
                <ColorPickerPopover
                  key={item.item_id}
                  colors={item.colors.map(c => `#${c}`)}
                  selectedColor={selectedColors[item.item_id]}
                  onColorSelect={(color) => handleColorSelect(item.item_id, color)}
                  itemName={item.item_id}
                />
              )}
              
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => onItemSelect(item.item_id, item.part, selectedColors[item.item_id])}
              >
                Usar
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-2 border-black">
      <CardHeader className="pb-3">
        <CardTitle className="volter-font text-lg">Flash Assets - Database</CardTitle>
        <p className="text-sm text-gray-600">
          Itens de roupas do banco de dados com fallback para Habbo Imaging
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por item ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Categoria:</label>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className="volter-font text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Gênero:</label>
            <div className="flex gap-2">
              {genders.map(gender => (
                <Button
                  key={gender}
                  size="sm"
                  variant={selectedGender === gender ? "default" : "outline"}
                  onClick={() => setSelectedGender(gender)}
                  className="volter-font text-xs"
                >
                  {gender}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="h-[400px]">
          {renderClothingGrid()}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FlashAssetsTab;
