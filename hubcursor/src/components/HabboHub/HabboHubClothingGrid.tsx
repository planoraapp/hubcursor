import React, { useState, useMemo } from 'react';
import { useHybridClothingSystem } from '@/hooks/useHybridClothingSystem';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { RarityBadge } from './RarityBadge';

interface HabboHubClothingGridProps {
  selectedCategory: string;
  selectedGender: string;
  selectedColor: string;
  onItemSelect: (itemId: string) => void;
  selectedItem?: string;
}

export const HabboHubClothingGrid: React.FC<HabboHubClothingGridProps> = ({
  selectedCategory,
  selectedGender,
  selectedColor,
  onItemSelect,
  selectedItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: clothingData, isLoading, error } = useHybridClothingSystem();

  const filteredItems = useMemo(() => {
    if (!clothingData || !clothingData[selectedCategory]) return [];
    
    let items = clothingData[selectedCategory];
    
    // Filter by gender if not 'all'
    if (selectedGender !== 'all') {
      items = items.filter(item => 
        item.gender === 'U' || item.gender === selectedGender
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.figureId.includes(searchTerm)
      );
    }
    
    return items;
  }, [clothingData, selectedCategory, selectedGender, searchTerm]);

  const getItemThumbnail = (item: any) => {
    const gender = selectedGender === 'all' ? 'M' : selectedGender;
    const color = selectedColor || '1';
    const headOnly = ['hr', 'hd', 'fa', 'ey'].includes(item.category) ? '&headonly=1' : '';
    
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.category}-${item.figureId}-${color}&gender=${gender}&size=l${headOnly}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-habbo-yellow" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Erro ao carregar itens: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={`Pesquisar itens de ${selectedCategory.toUpperCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        <div className="text-sm text-white/70">
          {filteredItems.length} itens
        </div>
      </div>
      
      <div className="grid grid-cols-8 gap-2 max-h-96 overflow-y-auto">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item.id)}
            className={`relative aspect-square bg-white/10 rounded border-2 transition-all duration-200 hover:bg-white/20 hover:scale-105 ${
              selectedItem === item.id 
                ? 'border-habbo-yellow shadow-lg scale-105' 
                : 'border-transparent'
            }`}
          >
            <img
              src={getItemThumbnail(item)}
              alt={item.name}
              className="w-full h-full object-cover rounded"
              loading="lazy"
            />
            <RarityBadge rarity={item.rarity} />
          </button>
        ))}
      </div>
    </div>
  );
};