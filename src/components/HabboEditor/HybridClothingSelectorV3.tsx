
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shirt, Palette } from 'lucide-react';
import { OptimizedClothingGrid } from '../OptimizedClothingGrid';
import { FlashAssetItem } from '@/hooks/useFlashAssetsClothing';

interface HybridClothingSelectorV3Props {
  onItemSelect: (item: FlashAssetItem) => void;
}

export const HybridClothingSelectorV3 = ({ onItemSelect }: HybridClothingSelectorV3Props) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <Card className="habbo-panel">
      <CardHeader className="habbo-header">
        <CardTitle className="flex items-center gap-2 text-white">
          <Shirt className="w-5 h-5" />
          Seletor de Roupas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="clothing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clothing" className="flex items-center gap-2">
              <Shirt className="w-4 h-4" />
              Roupas
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cores
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="clothing" className="mt-4">
            <OptimizedClothingGrid
              onItemSelect={onItemSelect}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </TabsContent>
          
          <TabsContent value="colors" className="mt-4">
            <div className="text-center py-12 text-gray-500">
              <Palette className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Seletor de cores será implementado em breve</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
