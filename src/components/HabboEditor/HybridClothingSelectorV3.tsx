
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shirt, Palette, Zap, Database, Sparkles } from 'lucide-react';
import { OptimizedClothingGrid } from '../OptimizedClothingGrid';
import { HybridClothingItemV2 } from '@/hooks/useHybridClothingDataV2';
import HabboEmotionClothingGrid from '../PuhekuplaEditor/HabboEmotionClothingGrid';
import { HabboEmotionClothingItem } from '@/hooks/useHabboEmotionClothing';

interface HybridClothingSelectorV3Props {
  onItemSelect: (item: HybridClothingItemV2 | HabboEmotionClothingItem) => void;
}

const CATEGORIES = [
  { id: 'hd', name: 'Rostos', icon: '👤', count: 10 },
  { id: 'hr', name: 'Cabelos', icon: '💇', count: 300 },
  { id: 'ch', name: 'Camisetas', icon: '👕', count: 200 },
  { id: 'lg', name: 'Calças', icon: '👖', count: 150 },
  { id: 'sh', name: 'Sapatos', icon: '👟', count: 100 },
  { id: 'ha', name: 'Chapéus', icon: '🎩', count: 80 },
  { id: 'ea', name: 'Óculos', icon: '👓', count: 50 },
  { id: 'fa', name: 'Acess. Face', icon: '😷', count: 20 },
  { id: 'cc', name: 'Casacos', icon: '🧥', count: 40 },
  { id: 'ca', name: 'Acess. Peito', icon: '🎖️', count: 30 },
  { id: 'wa', name: 'Cintura', icon: '👔', count: 25 },
  { id: 'cp', name: 'Estampas', icon: '🎨', count: 15 }
];

export const HybridClothingSelectorV3 = ({ onItemSelect }: HybridClothingSelectorV3Props) => {
  const [selectedCategory, setSelectedCategory] = useState('hr');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedItem, setSelectedItem] = useState<string>();
  const [selectedColor, setSelectedColor] = useState<string>('1');

  const handleHabboEmotionItemSelect = (item: HabboEmotionClothingItem) => {
    setSelectedItem(item.code);
    onItemSelect(item as any); // Type assertion para compatibilidade
  };

  const handleColorSelect = (colorId: string, item: HabboEmotionClothingItem) => {
    setSelectedColor(colorId);
    onItemSelect({ ...item, selectedColor: colorId } as any);
  };

  const handleHybridItemSelect = (item: HybridClothingItemV2) => {
    setSelectedItem(item.id);
    onItemSelect(item);
  };

  return (
    <Card className="habbo-panel">
      <CardHeader className="habbo-header">
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          Seletor de Roupas HybridV3
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            <Database className="w-3 h-3 mr-1" />
            Cache Supabase
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <Zap className="w-3 h-3 mr-1" />
            2000+ Itens
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Seletor de gênero */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Gênero:</span>
            {(['M', 'F'] as const).map((gender) => (
              <Button
                key={gender}
                size="sm"
                variant={selectedGender === gender ? "default" : "outline"}
                onClick={() => setSelectedGender(gender)}
                className={selectedGender === gender ? 'bg-purple-600' : ''}
              >
                {gender === 'M' ? '♂️ Masculino' : '♀️ Feminino'}
              </Button>
            ))}
          </div>

          {/* Seletor de categoria */}
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category.id}
                size="sm"
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center p-3 h-auto ${
                  selectedCategory === category.id 
                    ? 'bg-purple-600 text-white' 
                    : 'hover:bg-purple-50 hover:border-purple-300'
                }`}
              >
                <span className="text-lg mb-1">{category.icon}</span>
                <span className="text-xs font-medium">{category.name}</span>
                <Badge 
                  className={`mt-1 text-xs ${
                    selectedCategory === category.id 
                      ? 'bg-purple-800 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          <Tabs defaultValue="habboemotion" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="habboemotion" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                HabboEmotion (2000+)
              </TabsTrigger>
              <TabsTrigger value="official" className="flex items-center gap-2">
                <Shirt className="w-4 h-4" />
                Oficial Habbo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="habboemotion" className="mt-4">
              <HabboEmotionClothingGrid
                selectedCategory={selectedCategory}
                selectedGender={selectedGender}
                onItemSelect={handleHabboEmotionItemSelect}
                onColorSelect={handleColorSelect}
                selectedItem={selectedItem}
                selectedColor={selectedColor}
              />
            </TabsContent>
            
            <TabsContent value="official" className="mt-4">
              <OptimizedClothingGrid
                onItemSelect={handleHybridItemSelect}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer com estatísticas */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <span className="font-medium text-purple-800">
                🎯 Sistema Completo Ativo
              </span>
              <Badge className="bg-green-100 text-green-800">
                ✅ Cache Supabase
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                🔄 Sync Automático
              </Badge>
            </div>
            <div className="text-gray-600">
              Categoria: <strong>{selectedCategory.toUpperCase()}</strong>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
