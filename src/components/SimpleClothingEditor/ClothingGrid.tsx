import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, Crown, Star } from 'lucide-react';
import { ClothingItem, useOfficialClothingData } from '@/hooks/useOfficialClothingData';

interface ClothingGridProps {
  category: string;
  gender: 'M' | 'F';
  hotel?: string;
  onItemSelect: (item: ClothingItem, colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  className?: string;
}

const ClothingGrid: React.FC<ClothingGridProps> = ({
  category,
  gender,
  hotel = 'com.br',
  onItemSelect,
  selectedItem = '',
  selectedColor = '1',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showHCOnly, setShowHCOnly] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  
  const { items, loading, error } = useOfficialClothingData(category, gender, hotel);

  // Filtrar itens
  const filteredItems = items.filter(item => {
    // Filtro de busca
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !item.figureId.includes(searchTerm)) {
      return false;
    }
    
    // Filtro HC
    if (showHCOnly && item.club !== 'HC') {
      return false;
    }
    
    return true;
  });

  // Agrupar por club
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.club]) {
      acc[item.club] = [];
    }
    acc[item.club].push(item);
    return acc;
  }, {} as Record<string, ClothingItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando roupas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <p className="text-sm">Erro ao carregar roupas</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`clothing-grid ${className}`}>
      {/* Controles */}
      <div className="mb-4 space-y-3">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar roupas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={showHCOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHCOnly(!showHCOnly)}
            className="flex items-center gap-1"
          >
            <Crown className="w-4 h-4" />
            {showHCOnly ? 'Todos' : 'Apenas HC'}
          </Button>
          
          <Badge variant="secondary" className="px-3 py-1">
            {filteredItems.length} itens
          </Badge>
        </div>
      </div>

      {/* Grid de Roupas */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([club, clubItems]) => (
          <div key={club} className="space-y-2">
            {/* Cabeçalho da categoria */}
            <div className="flex items-center gap-2">
              {club === 'HC' ? (
                <Crown className="w-4 h-4 text-yellow-600" />
              ) : (
                <Star className="w-4 h-4 text-blue-600" />
              )}
              <h3 className="font-semibold text-sm">
                {club === 'HC' ? 'Habbo Club' : 'Gratuitas'}
              </h3>
              <Badge variant="outline" className="text-xs">
                {clubItems.length}
              </Badge>
            </div>

            {/* Grid de itens */}
            <div className="grid grid-cols-6 gap-2">
              {clubItems.map(item => (
                <ClothingItemCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItem === item.figureId}
                  onSelect={(colorId) => onItemSelect(item, colorId)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma roupa encontrada</p>
          {searchTerm && (
            <p className="text-sm mt-1">Tente outro termo de busca</p>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para cada item de roupa
const ClothingItemCard: React.FC<{
  item: ClothingItem;
  isSelected: boolean;
  onSelect: (colorId: string) => void;
}> = ({ item, isSelected, onSelect }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200' 
          : 'border-transparent hover:border-blue-300'
      }`}
      onClick={() => onSelect(item.colors[0])}
    >
      {/* Imagem */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {!imageError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">?</span>
          </div>
        )}
      </div>

      {/* Overlay com informações */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-colors duration-200">
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-xs font-medium truncate">{item.name}</p>
          <p className="text-xs text-gray-300">ID: {item.figureId}</p>
        </div>
      </div>

      {/* Special rarity indicators */}
      <div className="absolute top-1 right-1 flex gap-1">
        {/* HC Icon */}
        {item.club === 'HC' && (
          <img 
            src="/assets/icon_HC_wardrobe.png" 
            alt="HC" 
            className="w-4 h-4"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
        
        {/* LTD Icon - baseado no nome do item */}
        {(item.name.toLowerCase().includes('ltd') || item.name.toLowerCase().includes('limited')) && (
          <img 
            src="/assets/icon_LTD_habbo.png" 
            alt="LTD" 
            className="w-4 h-4"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
        
        {/* NFT Icon - baseado no nome do item */}
        {item.name.toLowerCase().includes('nft') && (
          <img 
            src="/assets/icon_wardrobe_nft_on.png" 
            alt="NFT" 
            className="w-4 h-4"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
        
        {/* Sellable Icon - baseado no nome do item */}
        {(item.name.toLowerCase().includes('sell') || item.name.toLowerCase().includes('vend')) && (
          <img 
            src="/assets/icon_sellable_wardrobe.png" 
            alt="Vendável" 
            className="w-4 h-4"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
      </div>

      {/* Indicador de seleção */}
      {isSelected && (
        <div className="absolute top-1 left-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default ClothingGrid;
