
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
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
          <div className="grid grid-cols-6 gap-2">
            {items?.map((asset) => (
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
                      />
                    ) : (
                      <div className="text-xs text-gray-500 text-center p-1">
                        {asset.figureId}
                      </div>
                    )}
                  </div>
                  
                  {asset.club === 'HC' && (
                    <Badge className="absolute top-1 left-1 bg-yellow-400 text-yellow-800 text-xs">
                      HC
                    </Badge>
                  )}
                </div>
                
                {/* Color Picker - appears on hover */}
                {asset.colors && asset.colors.length > 1 && (
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ColorPickerPopover
                      colors={asset.colors}
                      onColorSelect={(color) => handleColorSelect(asset, color)}
                      itemName={asset.name || `Asset ${asset.figureId}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {!items || items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum Flash Asset encontrado para esta categoria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashAssetsTab;
