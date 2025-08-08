
import React, { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { useFlashAssets } from '@/hooks/useFlashAssets';
import ImprovedAvatarPreview from './ImprovedAvatarPreview';
import SkinToneBar from './SkinToneBar';
import ColorPickerPopover from './ColorPickerPopover';
import GenderFilterButtons from './GenderFilterButtons';

const FlashAssetsV3Complete: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('hr');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('U');
  const [figureString, setFigureString] = useState('hd-180-1.hr-100-61.ch-210-66.lg-270-82.sh-305-62.ha-1012-110.wa-2007-62');
  const [skinTone, setSkinTone] = useState('1');

  const { data: assets, isLoading, error } = useFlashAssets();

  // Category configuration with icons from editor_images bucket
  const categories = [
    { id: 'hr', name: 'Cabelo', icon: 'hair.gif' },
    { id: 'hd', name: 'Cabeça', icon: 'head.gif' },
    { id: 'ch', name: 'Camisa', icon: 'chest.gif' },
    { id: 'lg', name: 'Calça', icon: 'legs.gif' },
    { id: 'sh', name: 'Sapato', icon: 'shoes.gif' },
    { id: 'ha', name: 'Chapéu', icon: 'hat.gif' },
    { id: 'wa', name: 'Acessório', icon: 'waist.gif' }
  ];

  const getIconUrl = (iconName: string) => {
    return `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/${iconName}`;
  };

  // Filter assets based on current tab, search term, and gender
  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    
    let filtered = assets.filter(asset => asset.category === currentTab);
    
    if (searchTerm) {
      filtered = filtered.filter(asset => 
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toString().includes(searchTerm)
      );
    }

    // Gender filtering
    if (selectedGender !== 'U') {
      filtered = filtered.filter(asset => 
        asset.gender === selectedGender || asset.gender === 'U'
      );
    }

    return filtered;
  }, [assets, currentTab, searchTerm, selectedGender]);

  const handleRandomize = useCallback(() => {
    const randomParts = [
      `hd-180-${Math.floor(Math.random() * 8) + 1}`,
      `hr-${Math.floor(Math.random() * 1000) + 100}-${Math.floor(Math.random() * 100) + 1}`,
      `ch-${Math.floor(Math.random() * 500) + 210}-${Math.floor(Math.random() * 100) + 1}`,
      `lg-${Math.floor(Math.random() * 500) + 270}-${Math.floor(Math.random() * 100) + 1}`,
      `sh-${Math.floor(Math.random() * 500) + 300}-${Math.floor(Math.random() * 100) + 1}`
    ];
    setFigureString(randomParts.join('.'));
  }, []);

  const handleAssetClick = (asset: any) => {
    // Update figure string with the selected asset
    const parts = figureString.split('.');
    const categoryIndex = parts.findIndex(part => part.startsWith(asset.category));
    const newPart = `${asset.category}-${asset.id}-${asset.colors?.[0] || '1'}`;
    
    if (categoryIndex >= 0) {
      parts[categoryIndex] = newPart;
    } else {
      parts.push(newPart);
    }
    
    setFigureString(parts.join('.'));
  };

  const handleColorSelect = (asset: any, color: string) => {
    const parts = figureString.split('.');
    const categoryIndex = parts.findIndex(part => part.startsWith(asset.category));
    const newPart = `${asset.category}-${asset.id}-${color}`;
    
    if (categoryIndex >= 0) {
      parts[categoryIndex] = newPart;
    } else {
      parts.push(newPart);
    }
    
    setFigureString(parts.join('.'));
  };

  const handleSkinToneChange = (newSkinTone: string) => {
    setSkinTone(newSkinTone);
    const parts = figureString.split('.');
    const hdIndex = parts.findIndex(part => part.startsWith('hd'));
    if (hdIndex >= 0) {
      const hdParts = parts[hdIndex].split('-');
      hdParts[2] = newSkinTone;
      parts[hdIndex] = hdParts.join('-');
      setFigureString(parts.join('.'));
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Carregando assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 mb-2">Erro ao carregar assets</div>
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

      {/* Right Panel - Asset Selection */}
      <div className="flex-1 flex flex-col">
        {/* Category Tabs with Icons */}
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
              <img
                src={getIconUrl(category.icon)}
                alt={category.name}
                className="w-4 h-4"
                style={{ imageRendering: 'pixelated' }}
                title={category.name}
              />
            </Button>
          ))}
        </div>

        {/* Controls Row */}
        <div className="flex gap-2 mb-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar assets..."
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

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-6 gap-2">
            {filteredAssets.map((asset) => (
              <div key={`${asset.category}-${asset.id}`} className="relative group">
                <Card 
                  className="p-2 cursor-pointer hover:shadow-md transition-shadow border-black aspect-square"
                  onClick={() => handleAssetClick(asset)}
                >
                  <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    {asset.thumbnail_url ? (
                      <img
                        src={asset.thumbnail_url}
                        alt={asset.name || `Asset ${asset.id}`}
                        className="max-w-full max-h-full object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="text-xs text-gray-500 text-center p-1">
                        {asset.id}
                      </div>
                    )}
                  </div>
                </Card>
                
                {/* Color Picker - appears on hover */}
                {asset.colors && asset.colors.length > 1 && (
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ColorPickerPopover
                      colors={asset.colors}
                      onColorSelect={(color) => handleColorSelect(asset, color)}
                      itemName={asset.name || `Asset ${asset.id}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {filteredAssets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum asset encontrado para esta categoria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashAssetsV3Complete;
