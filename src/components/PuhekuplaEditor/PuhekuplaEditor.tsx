
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import PuhekuplaAvatarSectionClean from './PuhekuplaAvatarSectionClean';
import PuhekuplaClothingGridClean from './PuhekuplaClothingGridClean';
import { usePuhekuplaClothing } from '@/hooks/usePuhekuplaData';
import type { PuhekuplaClothing } from '@/hooks/usePuhekuplaData';
import { PuhekuplaFigureManager, PuhekuplaFigure } from '@/lib/puhekuplaFigureManager';
import { useToast } from '@/hooks/use-toast';

// Configuração das categorias agrupadas (igual ao ViaJovem)
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
  const [selectedItem, setSelectedItem] = useState('665');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();

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

  const { 
    data: clothingData, 
    isLoading: clothingLoading,
    error: clothingError 
  } = usePuhekuplaClothing(1, selectedCategory, searchTerm);

  const hotels = [
    { code: 'com', name: 'Habbo.com', flag: '🌍' },
    { code: 'br', name: 'Habbo.com.br', flag: '🇧🇷' },
    { code: 'es', name: 'Habbo.es', flag: '🇪🇸' },
    { code: 'fr', name: 'Habbo.fr', flag: '🇫🇷' },
    { code: 'de', name: 'Habbo.de', flag: '🇩🇪' },
  ];

  const handleItemSelect = (itemId: string) => {
    console.log('🎯 [PuhekuplaEditor] Item selecionado:', {
      itemId,
      selectedCategory,
      selectedColor,
      currentFigure
    });
    
    setSelectedItem(itemId);
    
    // Aplicar ao avatar usando PuhekuplaFigureManager
    const figureParts = PuhekuplaFigureManager.figureToString(currentFigure).split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    const filteredParts = figureParts.filter(part => !categoryPattern.test(part));
    const newPart = `${selectedCategory}-${itemId}-${selectedColor}`;
    filteredParts.push(newPart);
    
    const newFigureString = filteredParts.join('.');
    const newFigure = PuhekuplaFigureManager.parseFigureString(newFigureString);
    setCurrentFigure(newFigure);
    
    toast({
      title: "👕 Roupa aplicada!",
      description: `Item ${itemId} foi aplicado ao seu avatar.`,
    });
  };

  const handleColorSelect = (colorId: string) => {
    console.log('🎨 [PuhekuplaEditor] Cor selecionada:', {
      colorId,
      selectedCategory,
      selectedItem
    });
    
    setSelectedColor(colorId);
    
    // Aplicar nova cor ao item atual
    const figureString = PuhekuplaFigureManager.figureToString(currentFigure);
    const figureParts = figureString.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    const updatedParts = figureParts.map(part => {
      if (categoryPattern.test(part)) {
        const [cat, item] = part.split('-');
        return `${cat}-${item}-${colorId}`;
      }
      return part;
    });
    
    const newFigureString = updatedParts.join('.');
    const newFigure = PuhekuplaFigureManager.parseFigureString(newFigureString);
    setCurrentFigure(newFigure);
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
      {/* Avatar Preview (Esquerda) - Largura reduzida e layout limpo */}
      <div className="lg:w-80">
        <PuhekuplaAvatarSectionClean
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
      </div>

      {/* Editor Tabs (Direita) */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Editor Puhekupla - Nova Geração
              <Badge className="ml-auto bg-white/20 text-white text-xs">Beta</Badge>
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

                    {/* Conteúdo das Sub-categorias */}
                    {group.categories.map(category => (
                      <TabsContent key={category.id} value={category.id}>
                        {clothingLoading ? (
                          <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                              <h3 className="text-xl font-bold text-purple-800 mb-2">Carregando Roupas</h3>
                              <p className="text-purple-600">Buscando itens na Puhekupla...</p>
                            </div>
                          </div>
                        ) : clothingError ? (
                          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
                            <div className="text-red-600 mb-2">Erro ao carregar roupas</div>
                            <div className="text-sm text-red-500">{clothingError.message || 'Erro desconhecido'}</div>
                            <button 
                              onClick={() => window.location.reload()} 
                              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              Recarregar
                            </button>
                          </div>
                        ) : (
                          <PuhekuplaClothingGridClean 
                            items={clothingData?.result?.clothing || []}
                            selectedCategory={category.id}
                            selectedGender={selectedGender}
                            onItemSelect={handleItemSelect}
                            onColorSelect={handleColorSelect}
                            selectedItem={selectedItem}
                            selectedColor={selectedColor}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                          />
                        )}
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
