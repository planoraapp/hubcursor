import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import ViaJovemStyleGrid from '../HabboEditor/ViaJovemStyleGrid';
import EnhancedAvatarPreview from '../HabboEditor/EnhancedAvatarPreview';
import { ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';
import { useToast } from '@/hooks/use-toast';

// Categorias organizadas igual ViaJovem
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

const OfficialHabboEditor = () => {
  // State igual ViaJovem
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
  const [selectedItem, setSelectedItem] = useState('');

  const { toast } = useToast();

  const generateFigureString = (): string => {
    const parts: string[] = [];
    const categoryOrder = ['hd', 'hr', 'ch', 'cc', 'lg', 'sh', 'ha', 'ea', 'fa', 'ca', 'wa', 'cp'];
    
    categoryOrder.forEach(category => {
      if (avatarState[category as keyof AvatarState]) {
        parts.push(`${category}-${avatarState[category as keyof AvatarState]}`);
      }
    });
    
    return parts.join('.');
  };

  const handleItemSelect = (item: ViaJovemFlashItem, colorId: string = '1') => {
    console.log('🎯 [OfficialHabboEditor] Flash Asset selecionado:', { 
      item: item.name, 
      category: item.category, 
      figureId: item.figureId,
      colorId,
      swfName: item.swfName
    });
    
    // Sistema melhorado de substituição de peças
    const itemString = `${item.figureId}-${colorId}`;
    
    setAvatarState(prevState => {
      const newState = { ...prevState };
      
      // Substituir apenas a categoria específica
      newState[item.category as keyof AvatarState] = itemString;
      
      console.log('✅ [OfficialHabboEditor] Estado do avatar atualizado:', {
        categoria: item.category,
        novoValor: itemString,
        figuraCompleta: Object.entries(newState)
          .filter(([_, value]) => value)
          .map(([cat, value]) => `${cat}-${value}`)
          .join('.')
      });
      
      return newState;
    });

    setSelectedColor(colorId);
    setSelectedItem(item.figureId);
    
    const clubBadge = item.club === 'hc' ? '🟨 HC' : '⭐ FREE';
    
    toast({
      title: "✨ Peça aplicada!",
      description: `${item.name} (${clubBadge}) aplicado na categoria ${item.category.toUpperCase()}.`,
    });
  };

  const handleRemoveItem = (category: string) => {
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

  // Update selected category when section changes
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

      {/* Editor melhorado */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg py-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Flash Assets Editor - Sistema Melhorado
              <Badge className="ml-auto bg-white/20 text-white text-xs">
                2800+ Assets • Cores Interativas
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
                        <ViaJovemStyleGrid 
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

export default OfficialHabboEditor;
