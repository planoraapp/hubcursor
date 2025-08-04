
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import LocalClothingGrid from './LocalClothingGrid';
import EnhancedAvatarPreview from './EnhancedAvatarPreview';
import { ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';
import { useToast } from '@/hooks/use-toast';

// Categorias EXATAS do ViaJovem - 11 categorias padrão
const categoryGroups = [
  {
    id: 'head',
    name: 'Cabeça e Acessórios',
    icon: '👤',
    categories: [
      { id: 'hd', name: 'Rostos', icon: '👤' },
      { id: 'hr', name: 'Cabelos', icon: '💇' },
      { id: 'ha', name: 'Chapéus', icon: '🎩' },
      { id: 'ea', name: 'Óculos', icon: '👓' }
    ]
  },
  {
    id: 'body', 
    name: 'Corpo e Roupas',
    icon: '👕',
    categories: [
      { id: 'ch', name: 'Camisetas', icon: '👕' },
      { id: 'cc', name: 'Casacos', icon: '🧥' },
      { id: 'ca', name: 'Acess. Peito', icon: '🎖️' },
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
      { id: 'wa', name: 'Cintura', icon: '🔗' }
    ]
  }
];

// Fixed AvatarState to extend Record<string, string> for compatibility
interface AvatarState extends Record<string, string> {
  hd?: string;
  hr?: string;
  ch?: string;
  lg?: string;
  sh?: string;
  ha?: string;
  ea?: string;
  cc?: string;
  ca?: string;
  wa?: string;
  cp?: string;
}

const RealHabboEditor = () => {
  const [avatarState, setAvatarState] = useState<AvatarState>({
    hd: '190-7',
    hr: '3811-61',
    ch: '3030-66',
    lg: '275-82',
    sh: '290-80'
  });
  
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com.br');
  const [currentDirection, setCurrentDirection] = useState('2');
  const [selectedSection, setSelectedSection] = useState('head');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [selectedColor, setSelectedColor] = useState('1');
  
  const { toast } = useToast();

  const generateFigureString = (): string => {
    const parts: string[] = [];
    
    // Ordem específica das categorias como no ViaJovem
    const categoryOrder = ['hd', 'hr', 'ch', 'cc', 'lg', 'sh', 'ha', 'ea', 'ca', 'wa', 'cp'];
    
    categoryOrder.forEach(category => {
      if (avatarState[category as keyof AvatarState]) {
        parts.push(`${category}-${avatarState[category as keyof AvatarState]}`);
      }
    });
    
    return parts.join('.');
  };

  const handleItemSelect = (item: ViaJovemFlashItem, colorId: string = '1') => {
    console.log('🎯 [RealHabboEditor] Item ViaJovem aplicado:', { 
      item: item.name, 
      category: item.category, 
      figureId: item.figureId,
      colorId 
    });
    
    const itemString = `${item.figureId}-${colorId}`;
    
    setAvatarState(prevState => ({
      ...prevState,
      [item.category]: itemString
    }));

    setSelectedColor(colorId);
    
    toast({
      title: "✨ Roupa ViaJovem aplicada!",
      description: `${item.name} foi aplicado ao avatar.`,
    });
  };

  const handleRemoveItem = (category: string) => {
    console.log('🗑️ [RealHabboEditor] Removendo categoria:', category);
    
    setAvatarState(prevState => {
      const newState = { ...prevState };
      delete newState[category as keyof AvatarState];
      return newState;
    });
    
    toast({
      title: "🗑️ Item removido",
      description: `Item da categoria ${category.toUpperCase()} removido.`,
    });
  };

  const handleResetAvatar = () => {
    setAvatarState({
      hd: '190-7',
      hr: '3811-61', 
      ch: '3030-66',
      lg: '275-82',
      sh: '290-80'
    });
    
    toast({
      title: "🔄 Avatar resetado",
      description: "Avatar voltou ao estado padrão ViaJovem.",
    });
  };

  // Update selected category when section changes
  useEffect(() => {
    const currentGroup = categoryGroups.find(group => group.id === selectedSection);
    if (currentGroup && currentGroup.categories.length > 0) {
      setSelectedCategory(currentGroup.categories[0].id);
    }
  }, [selectedSection]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4">
      {/* Enhanced Avatar Preview (Esquerda) */}
      <div className="lg:w-80">
        <EnhancedAvatarPreview
          figureString={generateFigureString()}
          selectedGender={selectedGender}
          selectedHotel={selectedHotel}
          currentDirection={currentDirection}
          avatarState={avatarState}
          onGenderChange={setSelectedGender}
          onHotelChange={setSelectedHotel}
          onDirectionChange={setCurrentDirection}
          onRemoveItem={handleRemoveItem}
          onResetAvatar={handleResetAvatar}
        />
      </div>

      {/* Editor Tabs (Direita) */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Editor HabboHub - ViaJovem Flash Assets
              <Badge className="ml-auto bg-white/20 text-white text-xs">
                11 Categorias ViaJovem
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs value={selectedSection} onValueChange={setSelectedSection} className="h-full">
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

              {categoryGroups.map(group => (
                <TabsContent key={group.id} value={group.id} className="min-h-[500px]">
                  <div className="mb-3">
                    <h3 className="font-bold text-base text-indigo-800">{group.name}</h3>
                    <p className="text-sm text-gray-600">
                      Sistema ViaJovem Flash Assets - Gênero: {selectedGender} - {group.categories.length} categorias
                    </p>
                  </div>
                  
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

                    {group.categories.map(category => (
                      <TabsContent key={category.id} value={category.id}>
                        <LocalClothingGrid 
                          selectedCategory={category.id}
                          selectedGender={selectedGender === 'U' ? 'M' : selectedGender}
                          onItemSelect={handleItemSelect}
                          selectedItem={avatarState[category.id as keyof AvatarState]?.split('-')[0]}
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

export default RealHabboEditor;
