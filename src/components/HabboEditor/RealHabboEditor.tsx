import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import LocalClothingGrid from './LocalClothingGrid';
import { ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';
import { useToast } from '@/hooks/use-toast';

// Categorias EXATAS do ViaJovem - sem FA (máscaras)
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

interface AvatarState {
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
  const [avatarSize, setAvatarSize] = useState('l');
  const [selectedColor, setSelectedColor] = useState('1');
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  
  const { toast } = useToast();

  const hotels = [
    { code: 'com.br', name: 'Habbo.com.br', flag: '🇧🇷' },
    { code: 'com', name: 'Habbo.com', flag: '🌍' },
    { code: 'es', name: 'Habbo.es', flag: '🇪🇸' },
    { code: 'fr', name: 'Habbo.fr', flag: '🇫🇷' },
    { code: 'de', name: 'Habbo.de', flag: '🇩🇪' },
    { code: 'it', name: 'Habbo.it', flag: '🇮🇹' },
    { code: 'fi', name: 'Habbo.fi', flag: '🇫🇮' }
  ];

  const generateFigureString = (): string => {
    const parts: string[] = [];
    
    if (avatarState.hd) parts.push(`hd-${avatarState.hd}`);
    if (avatarState.hr) parts.push(`hr-${avatarState.hr}`);
    if (avatarState.ch) parts.push(`ch-${avatarState.ch}`);
    if (avatarState.lg) parts.push(`lg-${avatarState.lg}`);
    if (avatarState.sh) parts.push(`sh-${avatarState.sh}`);
    if (avatarState.ha) parts.push(`ha-${avatarState.ha}`);
    if (avatarState.ea) parts.push(`ea-${avatarState.ea}`);
    if (avatarState.cc) parts.push(`cc-${avatarState.cc}`);
    if (avatarState.ca) parts.push(`ca-${avatarState.ca}`);
    if (avatarState.wa) parts.push(`wa-${avatarState.wa}`);
    if (avatarState.cp) parts.push(`cp-${avatarState.cp}`);
    
    return parts.join('.');
  };

  const currentFigureString = generateFigureString();
  const currentAvatarUrl = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${currentFigureString}&gender=${selectedGender === 'U' ? 'M' : selectedGender}&direction=${currentDirection}&head_direction=${currentDirection}&img_format=png&action=gesture=nrm&size=${isPreviewExpanded ? 'xl' : avatarSize}`;

  const handleItemSelect = (item: ViaJovemFlashItem, colorId: string = '1') => {
    console.log('🎯 [RealHabboEditor] Item ViaJovem aplicado:', { item: item.name, category: item.category, colorId });
    
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

  const handleCopyFigureString = () => {
    navigator.clipboard.writeText(currentFigureString);
    toast({
      title: "📋 Figure String copiada!",
      description: "String copiada para área de transferência.",
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
      {/* Avatar Preview Melhorado (Esquerda) */}
      <div className={`${isPreviewExpanded ? 'lg:w-96' : 'lg:w-80'} transition-all duration-300`}>
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5" />
              Preview Avatar ViaJovem
              <Badge className="ml-auto bg-white/20 text-white text-xs">
                {selectedGender === 'M' ? 'Masculino' : selectedGender === 'F' ? 'Feminino' : 'Unissex'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 relative">
              <img
                src={currentAvatarUrl}
                alt="Avatar Preview ViaJovem"
                className={`max-w-full h-auto transition-all duration-300 ${isPreviewExpanded ? 'scale-125' : ''}`}
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.error('❌ [RealHabboEditor] Erro no preview:', target.src);
                  target.src = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=hd-190-7&gender=M&direction=2&head_direction=2&img_format=png&action=gesture=nrm&size=${avatarSize}`;
                }}
              />
              
              {/* Botão de expansão */}
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                title={isPreviewExpanded ? "Minimizar" : "Expandir"}
              >
                {isPreviewExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedGender} onValueChange={(value: 'M' | 'F' | 'U') => setSelectedGender(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">👨 Masculino</SelectItem>
                  <SelectItem value="F">👩 Feminino</SelectItem>
                  <SelectItem value="U">⚧ Unissex</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map(hotel => (
                    <SelectItem key={hotel.code} value={hotel.code}>
                      {hotel.flag} {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={currentDirection} onValueChange={setCurrentDirection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">⬆️ Norte</SelectItem>
                  <SelectItem value="1">↗️ Nordeste</SelectItem>
                  <SelectItem value="2">➡️ Leste</SelectItem>
                  <SelectItem value="3">↘️ Sudeste</SelectItem>
                  <SelectItem value="4">⬇️ Sul</SelectItem>
                  <SelectItem value="5">↙️ Sudoeste</SelectItem>
                  <SelectItem value="6">⬅️ Oeste</SelectItem>
                  <SelectItem value="7">↖️ Noroeste</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={avatarSize} onValueChange={setAvatarSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="s">📱 Pequeno</SelectItem>
                  <SelectItem value="m">💻 Médio</SelectItem>
                  <SelectItem value="l">🖥️ Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Itens Equipados */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Itens ViaJovem Equipados:</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Object.entries(avatarState).map(([category, value]) => (
                  <div key={category} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                    <span className="font-mono">{category.toUpperCase()}: {value}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleRemoveItem(category)}
                      className="h-6 w-6 p-0 hover:bg-red-100"
                    >
                      ❌
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleResetAvatar} variant="outline" className="flex-1">
                🔄 Reset
              </Button>
              <Button onClick={handleCopyFigureString} variant="outline" className="flex-1">
                📋 Copiar
              </Button>
            </div>

            <div className="bg-gray-50 rounded p-2">
              <p className="text-xs text-gray-600 mb-1">Figure String ViaJovem:</p>
              <code className="text-xs font-mono text-purple-600 break-all">
                {currentFigureString}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor Tabs (Direita) */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Editor HabboHub - ViaJovem Flash Assets
              <Badge className="ml-auto bg-white/20 text-white text-xs">
                11 Categorias Padrão
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
