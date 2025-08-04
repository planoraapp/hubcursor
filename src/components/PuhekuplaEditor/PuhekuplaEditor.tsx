
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { PuhekuplaAvatarPreviewClean } from './PuhekuplaAvatarPreviewClean';
import { HabboEmotionClothingGrid } from './HabboEmotionClothingGrid';
import { PuhekuplaFigureManager, PuhekuplaFigure } from '@/lib/puhekuplaFigureManager';
import { useToast } from '@/hooks/use-toast';
import type { HabboEmotionClothingItem } from '@/hooks/useHabboEmotionClothing';

// Configuração das categorias (igual ao sistema anterior)
const categoryGroups = [
  {
    id: 'head',
    name: 'Cabeça e Acessórios',
    icon: '👤',
    categories: [
      { id: 'hd', name: 'Rostos', icon: '👤' },
      { id: 'hr', name: 'Cabelos', icon: '💇' },
      { id: 'ea', name: 'Óculos', icon: '👓' },
      { id: 'ha', name: 'Chapéus', icon: '🎩' }
    ]
  },
  {
    id: 'body',
    name: 'Corpo e Costas',
    icon: '👕',
    categories: [
      { id: 'ch', name: 'Camisetas', icon: '👕' },
      { id: 'cc', name: 'Casacos', icon: '🧥' },
      { id: 'ca', name: 'Acessórios Peito', icon: '🎖️' },
      { id: 'cp', name: 'Estampas', icon: '🎨' }
    ]
  },
  {
    id: 'legs',
    name: 'Calças e Pés',
    icon: '👖',
    categories: [
      { id: 'lg', name: 'Calças', icon: '👖' },
      { id: 'sh', name: 'Sapatos', icon: '👟' },
      { id: 'wa', name: 'Cintura', icon: '👔' }
    ]
  }
];

const PuhekuplaEditor = () => {
  const [currentFigure, setCurrentFigure] = useState<PuhekuplaFigure>(() => 
    PuhekuplaFigureManager.getDefaultFigure('M')
  );
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [currentDirection, setCurrentDirection] = useState('2');
  const [selectedSection, setSelectedSection] = useState('head');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [selectedColor, setSelectedColor] = useState('1');
  const [selectedItem, setSelectedItem] = useState('');
  
  const { toast } = useToast();

  // Hotéis disponíveis
  const hotels = [
    { code: 'com', name: 'Habbo.com', flag: '🌍', url: 'habbo.com' },
    { code: 'com.br', name: 'Habbo.com.br', flag: '🇧🇷', url: 'habbo.com.br' },
    { code: 'es', name: 'Habbo.es', flag: '🇪🇸', url: 'habbo.es' },
    { code: 'fr', name: 'Habbo.fr', flag: '🇫🇷', url: 'habbo.fr' },
    { code: 'de', name: 'Habbo.de', flag: '🇩🇪', url: 'habbo.de' },
    { code: 'it', name: 'Habbo.it', flag: '🇮🇹', url: 'habbo.it' },
    { code: 'fi', name: 'Habbo.fi', flag: '🇫🇮', url: 'habbo.fi' }
  ];

  // Load figure from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const figureParam = urlParams.get('figure');
    const genderParam = urlParams.get('gender') as 'M' | 'F';
    const hotelParam = urlParams.get('hotel');
    
    if (figureParam) {
      try {
        const figure = PuhekuplaFigureManager.parseFigureString(figureParam);
        setCurrentFigure(figure);
      } catch (error) {
        console.error('Error parsing figure from URL:', error);
      }
    }
    
    if (genderParam && ['M', 'F'].includes(genderParam)) {
      setSelectedGender(genderParam);
    }
    
    if (hotelParam) {
      setSelectedHotel(hotelParam);
    }
  }, []);

  const handleItemSelect = (item: HabboEmotionClothingItem) => {
    console.log('🎯 [PuhekuplaEditor] Item HabboEmotion selecionado:', item);
    
    setSelectedItem(item.code);
    
    // Aplicar item usando o FigureManager
    const updatedFigure = PuhekuplaFigureManager.applyClothingItem(
      currentFigure, 
      item, 
      selectedColor
    );
    
    setCurrentFigure(updatedFigure);
    
    toast({
      title: "👕 Roupa HabboEmotion aplicada!",
      description: `${item.name} foi aplicado ao seu avatar.`,
    });
  };

  const handleColorSelect = (colorId: string, item: HabboEmotionClothingItem) => {
    console.log('🎨 [PuhekuplaEditor] Cor selecionada:', { colorId, item: item.name });
    
    setSelectedColor(colorId);
    
    // Aplicar nova cor
    const updatedFigure = PuhekuplaFigureManager.applyClothingItem(
      currentFigure, 
      item, 
      colorId
    );
    
    setCurrentFigure(updatedFigure);
    
    toast({
      title: "🎨 Cor aplicada!",
      description: `Nova cor ${colorId} aplicada em ${item.name}`,
    });
  };

  // Update selected category when section changes
  useEffect(() => {
    const currentGroup = categoryGroups.find(group => group.id === selectedSection);
    if (currentGroup && currentGroup.categories.length > 0) {
      setSelectedCategory(currentGroup.categories[0].id);
    }
  }, [selectedSection]);

  // Update figure when gender changes
  const handleGenderChange = (gender: 'M' | 'F') => {
    setSelectedGender(gender);
    const newFigure = PuhekuplaFigureManager.getDefaultFigure(gender);
    setCurrentFigure(newFigure);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4">
      {/* Avatar Preview (Esquerda) - Layout Clean ViaJovem */}
      <div className="lg:w-80">
        <Card>
          <CardContent className="p-4">
            <PuhekuplaAvatarPreviewClean
              currentFigure={currentFigure}
              selectedGender={selectedGender}
              selectedHotel={selectedHotel}
              currentDirection={currentDirection}
              hotels={hotels}
              onFigureChange={setCurrentFigure}
              onDirectionChange={setCurrentDirection}
              onGenderChange={handleGenderChange}
              onHotelChange={setSelectedHotel}
            />
          </CardContent>
        </Card>
      </div>

      {/* Editor Tabs (Direita) - HabboEmotion Grid */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Editor Puhekupla - HabboEmotion API
              <Badge className="ml-auto bg-white/20 text-white text-xs">Nova Geração</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs value={selectedSection} onValueChange={setSelectedSection} className="h-full">
              {/* Abas Principais */}
              <TabsList className="grid w-full grid-cols-3 mb-4">
                {categoryGroups.map(group => (
                  <TabsTrigger 
                    key={group.id} 
                    value={group.id} 
                    className="text-xs px-3 py-2"
                  >
                    <div className="text-center">
                      <div className="text-base">{group.icon}</div>
                      <div className="text-[10px] mt-1">{group.name}</div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Conteúdo das Abas */}
              {categoryGroups.map(group => (
                <TabsContent key={group.id} value={group.id} className="min-h-[500px]">
                  <div className="mb-3">
                    <h3 className="font-bold text-base text-purple-800">{group.name}</h3>
                    <p className="text-sm text-gray-600">Roupas da HabboEmotion API</p>
                  </div>
                  
                  {/* Sub-categorias */}
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList 
                      className="grid gap-1 mb-4" 
                      style={{ gridTemplateColumns: `repeat(${group.categories.length}, 1fr)` }}
                    >
                      {group.categories.map(category => (
                        <TabsTrigger 
                          key={category.id} 
                          value={category.id} 
                          className="text-xs px-2 py-2"
                        >
                          <div className="text-center">
                            <div className="text-sm">{category.icon}</div>
                            <div className="text-[9px] mt-1">{category.name}</div>
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* HabboEmotion Clothing Grids */}
                    {group.categories.map(category => (
                      <TabsContent key={category.id} value={category.id}>
                        <HabboEmotionClothingGrid 
                          selectedCategory={category.id}
                          selectedGender={selectedGender}
                          onItemSelect={handleItemSelect}
                          onColorSelect={handleColorSelect}
                          selectedItem={selectedItem}
                          selectedColor={selectedColor}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PuhekuplaEditor;
