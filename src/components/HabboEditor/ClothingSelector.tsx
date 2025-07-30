
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Palette, Shirt, PaintBucket, Crown, Glasses, Footprints, User } from 'lucide-react';

interface FigurePart {
  id: string;
  name: string;
  colors: string[];
  category: 'normal' | 'hc' | 'sellable';
  gender: 'M' | 'F' | 'U';
}

interface ClothingSelectorProps {
  figureParts: { [key: string]: FigurePart[] };
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  selectedPart: string;
  onPartSelect: (partId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const CATEGORY_ICONS = {
  hd: User,
  hr: Crown,
  ch: Shirt,
  lg: PaintBucket,
  sh: Footprints,
  ha: Crown,
  ea: Glasses,
  fa: User,
  cc: Shirt,
  ca: PaintBucket,
  wa: PaintBucket
} as const;

const PART_CATEGORIES = {
  hd: 'Rosto',
  hr: 'Cabelo',
  ch: 'Camiseta',
  lg: 'Calça',
  sh: 'Sapatos',
  ha: 'Chapéu',
  ea: 'Óculos',
  fa: 'Rosto',
  cc: 'Casaco',
  ca: 'Capa',
  wa: 'Cinto'
};

const ClothingSelector = ({
  figureParts,
  activeCategory,
  setActiveCategory,
  selectedPart,
  onPartSelect,
  searchTerm,
  setSearchTerm
}: ClothingSelectorProps) => {
  const filteredParts = figureParts[activeCategory]?.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Card className="habbo-panel">
      <CardHeader className="habbo-header">
        <CardTitle className="flex items-center gap-2 text-white">
          <Palette className="w-5 h-5" />
          Roupas & Acessórios
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Category Tabs */}
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(PART_CATEGORIES).map(([key, label]) => {
            const IconComponent = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
            return (
              <Button
                key={key}
                variant={activeCategory === key ? "default" : "outline"}
                size="sm"
                className={`flex flex-col items-center p-2 h-auto ${
                  activeCategory === key ? 'bg-amber-500 text-white' : 'habbo-card'
                }`}
                onClick={() => setActiveCategory(key)}
              >
                <IconComponent className="w-4 h-4 mb-1" />
                <span className="text-xs">{label}</span>
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar peças..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="habbo-input"
        />

        {/* Parts Grid */}
        <div className="max-h-80 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {filteredParts.map((part) => (
              <Button
                key={part.id}
                variant={selectedPart === part.id ? "default" : "outline"}
                size="sm"
                className={`h-20 p-2 flex flex-col items-center gap-1 text-xs ${
                  selectedPart === part.id 
                    ? 'bg-amber-500 text-white border-2 border-amber-600' 
                    : 'habbo-card hover:bg-amber-50'
                }`}
                onClick={() => onPartSelect(part.id)}
              >
                {/* Miniatura da peça */}
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mb-1">
                  <img 
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${activeCategory}-${part.id}-${part.colors[0]}&direction=2&head_direction=3&size=s&img_format=png&gesture=std&action=std`}
                    alt={part.name}
                    className="w-full h-full object-contain pixelated"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                
                <div className="truncate w-full text-center text-xs">
                  {part.name}
                </div>
                
                <Badge 
                  variant={part.category === 'hc' ? 'default' : 'secondary'} 
                  className="text-xs px-1 py-0"
                >
                  {part.category.toUpperCase()}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClothingSelector;
