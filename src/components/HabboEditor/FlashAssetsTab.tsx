
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, ImageOff } from 'lucide-react';
import { useFlashAssetsClothing } from '@/hooks/useFlashAssetsClothing';
import ImprovedAvatarPreview from './ImprovedAvatarPreview';
import SkinToneBar from './SkinToneBar';
import ColorPickerPopover from './ColorPickerPopover';
import GenderFilterButtons from './GenderFilterButtons';

interface FlashAssetsTabProps {
  figureString: string;
  onFigureChange: (figure: string) => void;
}

const FlashAssetsTab: React.FC<FlashAssetsTabProps> = ({ figureString, onFigureChange }) => {
  const [currentTab, setCurrentTab] = useState('hr');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('U');
  const [skinTone, setSkinTone] = useState('1');

  const { data: items, isLoading, error } = useFlashAssetsClothing({
    category: currentTab,
    search: searchTerm,
    gender: selectedGender,
    limit: 100
  });

  // Category configuration
  const categories = [
    { id: 'hr', name: 'Cabelo', icon: '💇' },
    { id: 'hd', name: 'Cabeça', icon: '👤' },
    { id: 'ch', name: 'Camisa', icon: '👕' },
    { id: 'lg', name: 'Calça', icon: '👖' },
    { id: 'sh', name: 'Sapato', icon: '👟' },
    { id: 'ha', name: 'Chapéu', icon: '🎩' },
    { id: 'wa', name: 'Acessório', icon: '🎖️' }
  ];

  const handleAssetClick = (asset: any) => {
    // Update figure string with the selected asset
    const parts = figureString.split('.');
    const categoryIndex = parts.findIndex(part => part.startsWith(asset.category));
    const newPart = `${asset.category}-${asset.figureId}-${asset.colors?.[0] || '1'}`;
    
    if (categoryIndex >= 0) {
      parts[categoryIndex] = newPart;
    } else {
      parts.push(newPart);
    }
    
    onFigureChange(parts.join('.'));
  };

  const handleColorSelect = (asset: any, color: string) => {
    const parts = figureString.split('.');
    const categoryIndex = parts.findIndex(part => part.startsWith(asset.category));
    const newPart = `${asset.category}-${asset.figureId}-${color}`;
    
    if (categoryIndex >= 0) {
      parts[categoryIndex] = newPart;
    } else {
      parts.push(newPart);
    }
    
    onFigureChange(parts.join('.'));
  };

  const handleRandomize = () => {
    const randomParts = [
      `hd-180-${Math.floor(Math.random() * 8) + 1}`,
      `hr-${Math.floor(Math.random() * 1000) + 100}-${Math.floor(Math.random() * 100) + 1}`,
      `ch-${Math.floor(Math.random() * 500) + 210}-${Math.floor(Math.random() * 100) + 1}`,
      `lg-${Math.floor(Math.random() * 500) + 270}-${Math.floor(Math.random() * 100) + 1}`,
      `sh-${Math.floor(Math.random() * 500) + 300}-${Math.floor(Math.random() * 100) + 1}`
    ];
    onFigureChange(randomParts.join('.'));
  };

  const handleSkinToneChange = (newSkinTone: string) => {
    setSkinTone(newSkinTone);
    const parts = figureString.split('.');
    const hdIndex = parts.findIndex(part => part.startsWith('hd'));
    if (hdIndex >= 0) {
      const hdParts = parts[hdIndex].split('-');
      hdParts[2] = newSkinTone;
      parts[hdIndex] = hdParts.join('-');
      onFigureChange(parts.join('.'));
    }
  };

  // Improved placeholder component for failed images
  const AssetPlaceholder = ({ asset }: { asset: any }) => (
    <div className="w-full h-full bg-gray-100 rounded flex flex-col items-center justify-center p-2 border-2 border-dashed border-gray-300">
      <ImageOff size={16} className="text-gray-400 mb-1" />
      <span className="text-xs text-gray-500 text-center font-mono">
        {asset.figureId || asset.swfName || 'Item'}
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Carregando Flash Assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 mb-2">Erro ao carregar Flash Assets</div>
        <p className="text-sm text-gray-600">Tente recarregar a página</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Left Panel - Avatar Preview and Controls */}
      <div className="w-80 space-y-4">
        <ImprovedAvatarPreview 
          figureString={figureString}
          onRandomize={handleRandomize}
        />
        
        <SkinToneBar 
          currentSkinTone={skinTone}
          onSkinToneChange={handleSkinToneChange}
        />
      </div>

      {/* Right Panel - Flash Assets Selection */}
      <div className="flex-1 flex flex-col">
        {/* Category Tabs */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setCurrentTab(category.id)}
              variant={currentTab === category.id ? "default" : "outline"}
              className={`border-black ${
                currentTab === category.id 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-gray-100'
              }`}
              size="sm"
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Controls Row */}
        <div className="flex gap-2 mb-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar Flash Assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-black"
            />
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm('')}
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <GenderFilterButtons 
            currentGender={selectedGender}
            onGenderChange={setSelectedGender}
          />
        </div>

        {/* Flash Assets Grid */}
        <div className="flex-1 overflow-y-auto">
          {items && items.length > 0 ? (
            <div className="grid grid-cols-6 gap-2">
              {items.map((asset) => (
                <div key={`${asset.category}-${asset.figureId}`} className="relative group">
                  <div 
                    className="p-2 cursor-pointer hover:shadow-md transition-shadow border border-black aspect-square bg-white rounded"
                    onClick={() => handleAssetClick(asset)}
                  >
                    <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {asset.imageUrl ? (
                        <img
                          src={asset.imageUrl}
                          alt={asset.name || `Asset ${asset.figureId}`}
                          className="max-w-full max-h-full object-contain"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => {
                            // Replace failed image with placeholder
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={{ display: asset.imageUrl ? 'none' : 'flex' }} className="w-full h-full">
                        <AssetPlaceholder asset={asset} />
                      </div>
                    </div>
                    
                    {asset.club === 'HC' && (
                      <Badge className="absolute top-1 left-1 bg-yellow-400 text-yellow-800 text-xs">
                        HC
                      </Badge>
                    )}
                  </div>

                  {/* Color picker on hover */}
                  {asset.colors && asset.colors.length > 1 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="flex flex-wrap gap-1">
                        {asset.colors.slice(0, 6).map((color: string) => (
                          <ColorPickerPopover
                            key={color}
                            colorId={color}
                            onColorSelect={(selectedColor) => handleColorSelect(asset, selectedColor)}
                            category={asset.category}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ImageOff size={48} className="mb-4" />
              <p className="text-lg font-medium">Nenhum item encontrado</p>
              <p className="text-sm">Tente ajustar os filtros ou busca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashAssetsTab;
