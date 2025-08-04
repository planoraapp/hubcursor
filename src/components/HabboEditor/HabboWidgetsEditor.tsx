
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Database, Zap, Shield } from 'lucide-react';
import UnifiedClothingGrid from './UnifiedClothingGrid';
import EnhancedAvatarPreview from './EnhancedAvatarPreview';
import { UnifiedHabboClothingItem } from '@/hooks/useUnifiedHabboClothing';
import { useToast } from '@/hooks/use-toast';

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

const HabboWidgetsEditor = () => {
  const [avatarState, setAvatarState] = useState<AvatarState>({
    hd: '180-1',
    hr: '1001-45',
    ch: '1001-61',
    lg: '280-82',
    sh: '300-80'
  });
  
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [selectedSection, setSelectedSection] = useState('head');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [selectedColor, setSelectedColor] = useState('1');
  
  const { toast } = useToast();

  const generateFigureString = (): string => {
    const parts: string[] = [];
    const categoryOrder = ['hd', 'hr', 'ch', 'cc', 'lg', 'sh', 'ha', 'ea', 'ca', 'wa', 'cp'];
    
    categoryOrder.forEach(category => {
      if (avatarState[category as keyof AvatarState]) {
        parts.push(`${category}-${avatarState[category as keyof AvatarState]}`);
      }
    });
    
    return parts.join('.');
  };

  const handleItemSelect = (item: UnifiedHabboClothingItem, colorId: string = '1') => {
    console.log('🎯 [HabboWidgetsEditor] Item unificado aplicado:', { 
      item: item.name, 
      category: item.category, 
      figureId: item.figureId,
      colorId,
      source: item.source
    });
    
    const itemString = `${item.figureId}-${colorId}`;
    
    setAvatarState(prevState => ({
      ...prevState,
      [item.category]: itemString
    }));

    setSelectedColor(colorId);
    
    const sourceBadges = {
      'viajovem': '🟢 ViaJovem',
      'habbowidgets': '🔵 HabboWidgets', 
      'official-habbo': '🟣 Oficial',
      'flash-assets': '🟠 Flash Assets'
    };
    
    toast({
      title: "✨ Item aplicado!",
      description: `${item.name} (${sourceBadges[item.source as keyof typeof sourceBadges] || item.source}) foi aplicado ao avatar.`,
    });
  };

  const handleRemoveItem = (category: string) => {
    console.log('🗑️ [HabboWidgetsEditor] Removendo categoria:', category);
    
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
      hd: '180-1',
      hr: '1001-45', 
      ch: '1001-61',
      lg: '280-82',
      sh: '300-80'
    });
    
    toast({
      title: "🔄 Avatar resetado",
      description: "Avatar voltou ao estado padrão.",
    });
  };

  useEffect(() => {
    const currentGroup = categoryGroups.find(group => group.id === selectedSection);
    if (currentGroup && currentGroup.categories.length > 0) {
      setSelectedCategory(currentGroup.categories[0].id);
    }
  }, [selectedSection]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4">
      {/* Enhanced Avatar Preview */}
      <div className="lg:w-80">
        <EnhancedAvatarPreview
          figureString={generateFigureString()}
          selectedGender={selectedGender}
          selectedHotel={selectedHotel}
          avatarState={avatarState}
          onGenderChange={setSelectedGender}
          onHotelChange={setSelectedHotel}
          onRemoveItem={handleRemoveItem}
          onResetAvatar={handleResetAvatar}
        />
      </div>

      {/* Editor Unificado */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              HabboHub - Sistema Unificado Híbrido
              <div className="ml-auto flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-200 text-xs flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  ViaJovem
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-200 text-xs flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  HabboWidgets
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-200 text-xs flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Oficial
                </Badge>
              </div>
            </CardTitle>
            <div className="text-sm text-purple-100 mt-1">
              Sistema híbrido com múltiplas fontes • Habbo-Imaging unificado • Hotel: {selectedHotel}
            </div>
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
                    <h3 className="font-bold text-base text-purple-800">{group.name}</h3>
                    <p className="text-sm text-gray-600">
                      Sistema Híbrido Unificado - Múltiplas fontes com habbo-imaging - Gênero: {selectedGender}
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
                        <UnifiedClothingGrid 
                          selectedCategory={category.id}
                          selectedGender={selectedGender === 'U' ? 'M' : selectedGender}
                          selectedHotel={selectedHotel}
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

export default HabboWidgetsEditor;
