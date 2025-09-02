
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Shirt, User } from 'lucide-react';
import { UnifiedClothingItem } from '@/hooks/useUnifiedClothingAPI';
import { UnifiedCatalogGrid } from '@/components/catalog/UnifiedCatalogGrid';

interface HybridClothingSelectorV3Props {
  onItemSelect: (item: UnifiedClothingItem) => void;
}

export const HybridClothingSelectorV3: React.FC<HybridClothingSelectorV3Props> = ({
  onItemSelect
}) => {
  const [selectedItem, setSelectedItem] = useState<UnifiedClothingItem | null>(null);

  const handleItemSelect = (item: UnifiedClothingItem) => {
    setSelectedItem(item);
    onItemSelect(item);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Seletor de Roupas Híbrido</h3>
        </div>
        {selectedItem && (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            {selectedItem.name} ({selectedItem.figureId})
          </Badge>
        )}
      </div>

      {/* Main Grid */}
      <UnifiedCatalogGrid onItemSelect={handleItemSelect} />
    </div>
  );
};
