
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shuffle, RotateCcw, Search, Palette, User, Crown, Shirt, PaintBucket, Footprints, Glasses } from 'lucide-react';
import { useOfficialFigureData } from '@/hooks/useFigureDataOfficial';
import IntelligentClothingThumbnail from './HabboEditor/IntelligentClothingThumbnail';

// Hotel configurations
const HABBO_HOTELS = [
  { code: 'com.br', name: 'Brasil', flag: '🇧🇷' },
  { code: 'com', name: 'Global', flag: '🌎' },
  { code: 'es', name: 'España', flag: '🇪🇸' },
  { code: 'de', name: 'Deutschland', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'it', name: 'Italia', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederland', flag: '🇳🇱' },
  { code: 'tr', name: 'Türkiye', flag: '🇹🇷' }
];

// Category configurations
const CATEGORIES = {
  hd: { name: 'Rosto', icon: User, description: 'Aparência do rosto' },
  hr: { name: 'Cabelo', icon: Crown, description: 'Estilos de cabelo' },
  ch: { name: 'Camiseta', icon: Shirt, description: 'Roupas do torso' },
  lg: { name: 'Calça', icon: PaintBucket, description: 'Roupas das pernas' },
  sh: { name: 'Sapatos', icon: Footprints, description: 'Calçados' },
  ha: { name: 'Chapéu', icon: Crown, description: 'Acessórios para cabeça' },
  he: { name: 'Capacete', icon: Crown, description: 'Capacetes e elmos' },
  ea: { name: 'Óculos', icon: Glasses, description: 'Acessórios para olhos' },
  fa: { name: 'Rosto', icon: User, description: 'Acessórios faciais' },
  cp: { name: 'Estampa', icon: Palette, description: 'Estampas do peito' },
  cc: { name: 'Casaco', icon: Shirt, description: 'Casacos e jaquetas' },
  ca: { name: 'Acessório', icon: Shirt, description: 'Acessórios do peito' },
  wa: { name: 'Cinto', icon: PaintBucket, description: 'Cintos e acessórios da cintura' }
};

interface FigurePart {
  category: string;
  id: string;
  colors: string[];
  club?: string;
  gender?: string;
}

interface CurrentFigure {
  [key: string]: FigurePart;
}

// Generate clothing thumbnail URL (individual piece, not full avatar)
const getClothingThumbnailUrl = (category: string, itemId: string, colorId: string = '1', hotel: string = 'com.br') => {
  const urls = [
    `https://images.habbo.com/c_images/clothing/icon_${category}_${itemId}_${colorId}.png`,
    `https://www.habbo.${hotel}/habbo-imaging/clothing/${category}/${itemId}/${colorId}.png`,
    `https://habbo-stories-content.s3.amazonaws.com/clothing/${category}/${itemId}.png`,
    `https://www.habbowidgets.com/clothing/${category}/${itemId}_${colorId}.png`
  ];
  
  return urls[0]; // Primary URL, fallback handled by IntelligentClothingThumbnail
};

// Generate full avatar image URL
const getAvatarImageUrl = (figure: string, hotel: string = 'com.br', size: string = 'l') => {
  return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?figure=${figure}&gender=M&size=${size}&direction=2&head_direction=2`;
};

// Convert CurrentFigure to figure string
const figureToString = (figure: CurrentFigure): string => {
  return Object.values(figure)
    .filter(part => part && part.id && part.id !== '0')
    .map(part => `${part.category}-${part.id}-${part.colors.join('.')}`)
    .join('.');
};

// Parse figure string to CurrentFigure
const parseFigureString = (figureString: string): CurrentFigure => {
  const figure: CurrentFigure = {};
  
  if (!figureString) return figure;
  
  const parts = figureString.split('.');
  for (const part of parts) {
    const match = part.match(/^([a-z]{2,3})-(\d+)-(.+)$/);
    if (match) {
      const [_, category, id, colorsStr] = match;
      const colors = colorsStr.split(',');
      
      figure[category] = {
        category,
        id,
        colors
      };
    }
  }
  
  return figure;
};

// Generate random figure
const generateRandomFigure = (figureData: any): CurrentFigure => {
  const figure: CurrentFigure = {};
  const requiredCategories = ['hd', 'hr', 'ch', 'lg', 'sh'];
  const optionalCategories = ['ha', 'he', 'ea', 'fa', 'cp', 'cc', 'ca', 'wa'];
  
  // Add required categories
  for (const category of requiredCategories) {
    const categoryItems = figureData[category] || [];
    if (categoryItems.length > 0) {
      const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
      const randomColor = randomItem.colors[Math.floor(Math.random() * randomItem.colors.length)];
      
      figure[category] = {
        category,
        id: randomItem.id,
        colors: [randomColor],
        club: randomItem.club,
        gender: randomItem.gender
      };
    }
  }
  
  // Randomly add optional categories (30% chance each)
  for (const category of optionalCategories) {
    if (Math.random() < 0.3) {
      const categoryItems = figureData[category] || [];
      if (categoryItems.length > 0) {
        const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
        const randomColor = randomItem.colors[Math.floor(Math.random() * randomItem.colors.length)];
        
        figure[category] = {
          category,
          id: randomItem.id,
          colors: [randomColor],
          club: randomItem.club,
          gender: randomItem.gender
        };
      }
    }
  }
  
  return figure;
};

const ViaJovemEditor = () => {
  const [selectedHotel, setSelectedHotel] = useState('com.br');
  const [activeCategory, setActiveCategory] = useState('hd');
  const [currentFigure, setCurrentFigure] = useState<CurrentFigure>({
    hd: { category: 'hd', id: '180', colors: ['1'] },
    hr: { category: 'hr', id: '828', colors: ['45'] },
    ch: { category: 'ch', id: '665', colors: ['92'] },
    lg: { category: 'lg', id: '270', colors: ['61'] },
    sh: { category: 'sh', id: '300', colors: ['1'] }
  });
  const [searchUser, setSearchUser] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Load official figure data
  const { data: figureData, isLoading } = useOfficialFigureData();

  // Get current figure string
  const figureString = useMemo(() => figureToString(currentFigure), [currentFigure]);

  // Get current category items
  const categoryItems = useMemo(() => {
    if (!figureData || !figureData[activeCategory]) return [];
    return figureData[activeCategory] || [];
  }, [figureData, activeCategory]);

  // Get available colors for selected item
  const availableColors = useMemo(() => {
    const currentPart = currentFigure[activeCategory];
    if (!currentPart || !figureData || !figureData[activeCategory]) return ['1'];
    
    const item = figureData[activeCategory].find((item: any) => item.id === currentPart.id);
    return item ? item.colors || ['1'] : ['1'];
  }, [figureData, activeCategory, currentFigure]);

  // Handle clothing selection
  const selectClothing = (itemId: string, colorId?: string) => {
    const categoryData = figureData?.[activeCategory];
    if (!categoryData) return;
    
    const item = categoryData.find((item: any) => item.id === itemId);
    if (!item) return;
    
    const selectedColor = colorId || item.colors[0] || '1';
    
    setCurrentFigure(prev => ({
      ...prev,
      [activeCategory]: {
        category: activeCategory,
        id: itemId,
        colors: [selectedColor],
        club: item.club,
        gender: item.gender
      }
    }));
  };

  // Handle color selection
  const selectColor = (colorId: string) => {
    const currentPart = currentFigure[activeCategory];
    if (!currentPart) return;
    
    setCurrentFigure(prev => ({
      ...prev,
      [activeCategory]: {
        ...prev[activeCategory],
        colors: [colorId]
      }
    }));
  };

  // Handle random avatar generation
  const generateRandomAvatar = () => {
    if (!figureData) return;
    
    const randomFigure = generateRandomFigure(figureData);
    setCurrentFigure(randomFigure);
    console.log('🎲 Generated random avatar:', figureToString(randomFigure));
  };

  // Handle user search
  const searchHabboUser = async () => {
    if (!searchUser.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://www.habbo.${selectedHotel}/api/public/users?name=${encodeURIComponent(searchUser)}`);
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.figureString) {
          const parsedFigure = parseFigureString(userData.figureString);
          setCurrentFigure(parsedFigure);
          console.log('👤 Loaded user figure:', userData.figureString);
        }
      } else {
        console.warn('❌ User not found or API error');
      }
    } catch (error) {
      console.error('❌ Error searching user:', error);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando editor de visuais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Editor de Visuais Habbo</h2>
        <p className="text-gray-600">Crie e personalize seu visual Habbo com milhares de opções</p>
      </div>

      {/* Hotel Selection */}
      <Card className="habbo-panel">
        <CardHeader className="habbo-header">
          <CardTitle className="text-white text-center">Selecionar Hotel Habbo</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {HABBO_HOTELS.map(hotel => (
              <Button
                key={hotel.code}
                variant={selectedHotel === hotel.code ? "default" : "outline"}
                size="sm"
                className={`flex items-center gap-1 ${selectedHotel === hotel.code ? 'bg-amber-500 text-white' : ''}`}
                onClick={() => setSelectedHotel(hotel.code)}
              >
                <span>{hotel.flag}</span>
                <span className="text-xs">{hotel.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Preview */}
        <div className="lg:col-span-1">
          <Card className="habbo-panel">
            <CardHeader className="habbo-header">
              <CardTitle className="text-white text-center">Visualização</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <img 
                    src={getAvatarImageUrl(figureString, selectedHotel, 'l')}
                    alt="Avatar Preview" 
                    className="pixelated mx-auto border-4 border-amber-400 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      console.warn('❌ Avatar image failed to load');
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={generateRandomAvatar}
                    size="sm"
                    variant="outline"
                    className="habbo-card flex items-center gap-1"
                    title="Avatar Aleatório"
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={() => setCurrentFigure({
                      hd: { category: 'hd', id: '180', colors: ['1'] },
                      hr: { category: 'hr', id: '828', colors: ['45'] },
                      ch: { category: 'ch', id: '665', colors: ['92'] },
                      lg: { category: 'lg', id: '270', colors: ['61'] },
                      sh: { category: 'sh', id: '300', colors: ['1'] }
                    })}
                    size="sm"
                    variant="outline"
                    className="habbo-card flex items-center gap-1"
                    title="Resetar"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* User Search */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar usuário..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="habbo-input text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && searchHabboUser()}
                    />
                    <Button
                      onClick={searchHabboUser}
                      size="sm"
                      disabled={isSearching || !searchUser.trim()}
                      className="habbo-card"
                      title="Buscar"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  {isSearching && (
                    <p className="text-xs text-gray-500">Buscando usuário...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clothing Selection */}
        <div className="lg:col-span-1">
          <Card className="habbo-panel">
            <CardHeader className="habbo-header">
              <CardTitle className="text-white">Roupas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Category Tabs */}
              <div className="grid grid-cols-4 gap-1">
                {Object.entries(CATEGORIES).map(([key, config]) => {
                  const IconComponent = config.icon;
                  const isActive = activeCategory === key;
                  const categoryCount = figureData?.[key]?.length || 0;
                  
                  return (
                    <Button
                      key={key}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className={`flex flex-col items-center p-2 h-auto relative text-xs ${
                        isActive ? 'bg-amber-500 text-white' : 'habbo-card'
                      }`}
                      onClick={() => setActiveCategory(key)}
                      title={config.description}
                    >
                      <IconComponent className="w-3 h-3 mb-1" />
                      <span>{config.name}</span>
                      {categoryCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-0">
                          {categoryCount}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Clothing Grid */}
              <div className="max-h-80 overflow-y-auto">
                <div className="grid grid-cols-4 gap-2">
                  {categoryItems.map((item: any) => {
                    const isSelected = currentFigure[activeCategory]?.id === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-16 p-1 relative ${
                          isSelected 
                            ? 'bg-amber-500 text-white border-2 border-amber-600' 
                            : 'habbo-card hover:bg-amber-50'
                        }`}
                        onClick={() => selectClothing(item.id)}
                        title={`${CATEGORIES[activeCategory as keyof typeof CATEGORIES]?.name} ${item.id}`}
                      >
                        {/* Club Badge */}
                        {item.club === '1' && (
                          <Badge className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-1 py-0">
                            HC
                          </Badge>
                        )}
                        
                        {/* Thumbnail */}
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={getClothingThumbnailUrl(activeCategory, item.id, item.colors[0] || '1', selectedHotel)}
                            alt={`${activeCategory}-${item.id}`}
                            className="max-w-full max-h-full object-contain pixelated"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => {
                              // Fallback to avatar-based image
                              e.currentTarget.src = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${activeCategory}-${item.id}-${item.colors[0] || '1'}&gender=M&size=s&direction=2&head_direction=2`;
                            }}
                          />
                        </div>
                      </Button>
                    );
                  })}
                </div>
                
                {categoryItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum item encontrado nesta categoria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Selection */}
        <div className="lg:col-span-1">
          <Card className="habbo-panel">
            <CardHeader className="habbo-header">
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Cores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">
                  Selecione uma cor para {CATEGORIES[activeCategory as keyof typeof CATEGORIES]?.name?.toLowerCase()}:
                </p>
                
                <div className="grid grid-cols-8 gap-1 max-h-60 overflow-y-auto">
                  {availableColors.map((colorId: string) => {
                    const isSelected = currentFigure[activeCategory]?.colors[0] === colorId;
                    
                    return (
                      <Button
                        key={colorId}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0 relative ${
                          isSelected 
                            ? 'bg-amber-500 border-2 border-amber-600' 
                            : 'habbo-card hover:bg-amber-50'
                        }`}
                        onClick={() => selectColor(colorId)}
                        title={`Cor ${colorId}`}
                      >
                        <span className="text-xs font-bold">{colorId}</span>
                      </Button>
                    );
                  })}
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  {availableColors.length} cores disponíveis
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Debug Info */}
      <Card className="habbo-panel">
        <CardContent className="p-4">
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Hotel:</strong> {HABBO_HOTELS.find(h => h.code === selectedHotel)?.name}</p>
            <p><strong>Categoria Ativa:</strong> {CATEGORIES[activeCategory as keyof typeof CATEGORIES]?.name}</p>
            <p><strong>Código do Avatar:</strong> <code className="bg-gray-100 px-1 rounded">{figureString}</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViaJovemEditor;
