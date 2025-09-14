import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Globe, Zap, Shield, RefreshCw } from 'lucide-react';
import { useHabboEmotionClothing, triggerHabboEmotionSync } from '@/hooks/useHabboEmotionClothing';
import { useToast } from '@/hooks/use-toast';
import EnhancedAvatarPreview from './EnhancedAvatarPreview';

// Mapeamento de categorias baseado nos prefixos identificados
const CATEGORY_MAPPING: Record<string, { category: string; icon: string; name: string }> = {
  // Cabeça e Acessórios
  'face': { category: 'face', icon: '🎭', name: 'Acessórios de Rosto' },
  'acc_face': { category: 'acc_face', icon: '🎭', name: 'Acessórios de Rosto' },
  'acc_head': { category: 'acc_head', icon: '👑', name: 'Acessórios de Cabeça' },
  'acc_eye': { category: 'acc_eye', icon: '👁️', name: 'Acessórios de Olho' },
  'hat': { category: 'hat', icon: '🧢', name: 'Chapéus e Toucas' },
  'hair': { category: 'hair', icon: '💇‍♂️', name: 'Cabelos' },
  'ha': { category: 'ha', icon: '💇‍♂️', name: 'Cabelos' },
  'hd': { category: 'hd', icon: '👤', name: 'Cabeças' },
  'fa': { category: 'fa', icon: '🎭', name: 'Acessórios de Rosto' },
  'ea': { category: 'ea', icon: '👁️', name: 'Acessórios de Olho' },
  
  // Corpo e Roupas
  'acc_chest': { category: 'acc_chest', icon: '🎖️', name: 'Acessórios de Peito' },
  'acc_waist': { category: 'acc_waist', icon: '🔗', name: 'Acessórios de Cintura' },
  'shirt': { category: 'shirt', icon: '👕', name: 'Camisas e Tops' },
  'jacket': { category: 'jacket', icon: '🧥', name: 'Jaquetas e Casacos' },
  'ch': { category: 'ch', icon: '👕', name: 'Camisas' },
  'cc': { category: 'cc', icon: '👕', name: 'Camisas' },
  'ca': { category: 'ca', icon: '👕', name: 'Camisas' },
  
  // Calças e Pés
  'trousers': { category: 'trousers', icon: '👖', name: 'Calças e Saias' },
  'shoes': { category: 'shoes', icon: '👟', name: 'Sapatos e Sandálias' },
  'lg': { category: 'lg', icon: '👖', name: 'Calças' },
  'sh': { category: 'sh', icon: '👟', name: 'Sapatos' },
  'wa': { category: 'wa', icon: '👟', name: 'Sapatos' },
  
  // Acessórios
  'pet': { category: 'pet', icon: '🐾', name: 'Animais de Estimação' },
  'cp': { category: 'cp', icon: '🎭', name: 'Acessórios' }
};

interface AvatarState extends Record<string, string> {
  // Cabeça e Acessórios
  hd?: string;  // Cabeças
  ha?: string;  // Cabelos
  fa?: string;  // Acessórios de Rosto
  ea?: string;  // Acessórios de Olho
  
  // Corpo e Roupas
  ch?: string;  // Camisas
  cc?: string;  // Camisas
  ca?: string;  // Camisas
  
  // Calças e Pés
  lg?: string;  // Calças
  sh?: string;  // Sapatos
  wa?: string;  // Sapatos
  
  // Acessórios
  cp?: string;  // Acessórios
}

const HabboEmotionEditor = () => {
  const [avatarState, setAvatarState] = useState<AvatarState>({});
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [selectedSection, setSelectedSection] = useState('head');
  const [selectedCategory, setSelectedCategory] = useState('hair');
  const [selectedColor, setSelectedColor] = useState('1');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { toast } = useToast();
  const { data: allItems, isLoading: isLoadingAll } = useHabboEmotionClothing(2000);

  // Agrupar categorias por seção baseado nos dados reais
  const categoryGroups = useMemo(() => {
    if (!allItems || allItems.length === 0) return [];

        console.log('🎯 [HabboEmotionEditor] Sample items:', allItems.slice(0, 3));

    // Extrair categorias únicas dos dados
    const uniqueCategories = [...new Set(allItems.map(item => item.category))];
        const groups = [
      {
        id: 'head',
        name: 'Cabeça e Acessórios',
        icon: '👤',
        categories: uniqueCategories
          .filter(cat => ['face', 'acc_face', 'acc_head', 'acc_eye', 'hat', 'hair', 'ha', 'hd', 'fa', 'ea'].includes(cat))
          .map(cat => ({
            id: cat,
            name: CATEGORY_MAPPING[cat]?.name || cat.toUpperCase(),
            icon: CATEGORY_MAPPING[cat]?.icon || '❓',
            count: allItems.filter(item => item.category === cat).length
          }))
      },
      {
        id: 'body', 
        name: 'Corpo e Roupas',
        icon: '👕',
        categories: uniqueCategories
          .filter(cat => ['shirt', 'jacket', 'acc_chest', 'acc_waist', 'ch', 'cc', 'ca'].includes(cat))
          .map(cat => ({
            id: cat,
            name: CATEGORY_MAPPING[cat]?.name || cat.toUpperCase(),
            icon: CATEGORY_MAPPING[cat]?.icon || '❓',
            count: allItems.filter(item => item.category === cat).length
          }))
      },
      {
        id: 'legs',
        name: 'Calças e Pés', 
        icon: '👖',
        categories: uniqueCategories
          .filter(cat => ['trousers', 'shoes', 'lg', 'sh', 'wa'].includes(cat))
          .map(cat => ({
            id: cat,
            name: CATEGORY_MAPPING[cat]?.name || cat.toUpperCase(),
            icon: CATEGORY_MAPPING[cat]?.icon || '❓',
            count: allItems.filter(item => item.category === cat).length
          }))
      },
      {
        id: 'accessories',
        name: 'Acessórios',
        icon: '🎭',
        categories: uniqueCategories
          .filter(cat => ['cp', 'pet'].includes(cat))
          .map(cat => ({
            id: cat,
            name: CATEGORY_MAPPING[cat]?.name || cat.toUpperCase(),
            icon: CATEGORY_MAPPING[cat]?.icon || '❓',
            count: allItems.filter(item => item.category === cat).length
          }))
      }
    ];

    const filteredGroups = groups.filter(group => group.categories.length > 0);
        return filteredGroups;
  }, [allItems]);

  const generateFigureString = (): string => {
    const parts: string[] = [];
    const categoryOrder = ['hd', 'ha', 'ch', 'lg', 'sh', 'fa', 'ea', 'cp', 'cc', 'ca', 'wa'];
    
    categoryOrder.forEach(category => {
      if (avatarState[category as keyof AvatarState]) {
        parts.push(`${category}-${avatarState[category as keyof AvatarState]}`);
      }
    });
    
    const figureString = parts.join('.');
    
        return figureString;
  };

  const handleItemSelect = (item: any, colorId: string = '1') => {
        const itemString = `${item.id}-${colorId}`;
    
    setAvatarState(prevState => {
      const newState = {
        ...prevState,
        [item.category]: itemString
      };
      
            return newState;
    });

    setSelectedColor(colorId);
    
    toast({
      title: "✅ Item HabboEmotion aplicado!",
      description: `${item.name} foi aplicado com sucesso.`,
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
    setAvatarState({});
    
        toast({
      title: "🔄 Avatar resetado",
      description: "Avatar voltou ao estado vazio.",
    });
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await triggerHabboEmotionSync();
      toast({
        title: "✅ Sincronização concluída!",
        description: "Dados atualizados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro na sincronização",
        description: "Não foi possível atualizar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const currentGroup = categoryGroups.find(group => group.id === selectedSection);
    if (currentGroup && currentGroup.categories.length > 0) {
      setSelectedCategory(currentGroup.categories[0].id);
    }
  }, [selectedSection, categoryGroups]);

  if (isLoadingAll) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do HabboEmotion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full flex flex-col lg:flex-row gap-4">
      {/* Enhanced Avatar Preview */}
      <div className="lg:w-80 lg:sticky lg:top-4 lg:self-start">
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

      {/* Editor HabboEmotion */}
      <div className="flex-1">
        <Card className="min-h-full">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              HabboHub - Editor HabboEmotion
              <div className="ml-auto flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-200 text-xs flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  API Real
                </Badge>
                <Badge className="bg-pink-500/20 text-pink-200 text-xs flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  HabboEmotion
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-200 text-xs flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Categorização
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
              </div>
            </CardTitle>
            <div className="text-sm text-purple-100 mt-1">
              Sistema baseado na API HabboEmotion • Categorização automática • Hotel: {selectedHotel}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs value={selectedSection} onValueChange={setSelectedSection} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
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
                <TabsContent key={group.id} value={group.id} className="w-full">
                  <div className="mb-3">
                    <h3 className="font-bold text-base text-purple-800">{group.name}</h3>
                    <p className="text-sm text-gray-600">
                      HabboEmotion API • Categorização automática • Gênero: {selectedGender}
                    </p>
                  </div>
                  
                  {group.categories.length > 0 ? (
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
                              <div className="text-[8px] text-gray-500">({category.count})</div>
                            </div>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {group.categories.map(category => (
                        <TabsContent key={category.id} value={category.id} className="w-full">
                          <div className="max-h-[70vh] overflow-y-auto p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                              {allItems
                                ?.filter(item => item.category === category.id)
                                .filter(item => item.gender === selectedGender || item.gender === 'U')
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="aspect-square cursor-pointer transition-all duration-200 hover:scale-105 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 relative"
                                    onClick={() => handleItemSelect(item)}
                                    title={`${item.name} - HabboEmotion`}
                                    style={{ width: '80px', height: '80px' }}
                                  >
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-1 py-0.5 rounded font-bold shadow-sm">
                                      HE
                                    </div>
                                    {item.club === 'HC' && (
                                      <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded font-bold shadow-sm">
                                        HC
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <div className="text-center text-gray-500 p-8">
                      <p>Nenhuma categoria disponível nesta seção</p>
                      <p className="text-sm mt-1">Aguarde o carregamento dos dados da API</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HabboEmotionEditor;
