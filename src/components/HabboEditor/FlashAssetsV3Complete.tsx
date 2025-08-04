import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Sparkles, Crown, Zap, Heart, Music, Filter, Star, Palette, User } from 'lucide-react';
import { useEnhancedFlashAssetsV2 } from '@/hooks/useEnhancedFlashAssetsV2';
import { getRarityColor, CATEGORY_SECTIONS } from '@/lib/enhancedCategoryMapperV2';
import { SkinColorSelector } from './SkinColorSelector';
import { OfficialHabboColorPalette } from './OfficialHabboColorPalette';
import { isValidColorForCategory, getDefaultColorForCategory } from '@/utils/habboColorValidator';

interface FlashAssetsV3CompleteProps {
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: any, colorId: string) => void;
  selectedItem: string;
  selectedColor: string;
  className?: string;
}

const FlashAssetsV3Complete = ({
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem,
  selectedColor,
  className = ''
}: FlashAssetsV3CompleteProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('hd');
  const [selectedSection, setSelectedSection] = useState<string>('head');
  const [selectedRarity, setSelectedRarity] = useState<'all' | 'nft' | 'hc' | 'ltd' | 'rare' | 'common'>('all');
  const [currentColor, setCurrentColor] = useState<string>('1');

  const { 
    items, 
    categoryStats, 
    rarityStats,
    sectionStats,
    isLoading, 
    error, 
    totalItems,
    getCategoryMetadata,
    getSectionMetadata,
    getAllSections
  } = useEnhancedFlashAssetsV2({
    category: selectedCategory,
    gender: selectedGender,
    search: searchTerm,
    rarity: selectedRarity === 'all' ? undefined : selectedRarity
  });

  console.log('🎯 [FlashAssetsV3Complete] Sistema V3 COMPLETO carregado:', {
    category: selectedCategory,
    section: selectedSection,
    gender: selectedGender,
    rarity: selectedRarity,
    itemsCount: items.length,
    totalItems,
    stats: { categoryStats, rarityStats, sectionStats }
  });

  const sections = getAllSections();
  const currentSection = getSectionMetadata(selectedSection);

  // Atualizar categoria quando mudar seção
  useEffect(() => {
    if (currentSection && currentSection.categories.length > 0 && !currentSection.categories.some(cat => cat === selectedCategory)) {
      setSelectedCategory(currentSection.categories[0]);
    }
  }, [selectedSection, currentSection, selectedCategory]);

  // Validar cor quando mudar categoria
  useEffect(() => {
    if (!isValidColorForCategory(currentColor, selectedCategory)) {
      const defaultColor = getDefaultColorForCategory(selectedCategory);
      setCurrentColor(defaultColor);
    }
  }, [selectedCategory, currentColor]);

  const handleItemClick = (item: any) => {
    console.log('🎯 [FlashAssetsV3Complete] Item selecionado:', item);
    
    // Validar cor antes de aplicar
    const validColor = isValidColorForCategory(currentColor, item.category) 
      ? currentColor 
      : getDefaultColorForCategory(item.category);
    
    onItemSelect(item, validColor);
  };

  const handleColorSelect = (colorId: string) => {
    console.log('🎨 [FlashAssetsV3Complete] Cor selecionada:', { category: selectedCategory, colorId });
    setCurrentColor(colorId);
  };

  const handleSkinColorSelect = (colorId: string) => {
    console.log('🤏 [FlashAssetsV3Complete] Cor de pele selecionada:', colorId);
    // Aplicar cor de pele imediatamente
    const skinItem = {
      id: `sk_${colorId}_${selectedGender}`,
      name: `Pele Cor ${colorId}`,
      category: 'sk',
      figureId: '180',
      gender: selectedGender,
      colors: [colorId],
      rarity: 'common',
      source: 'skin-color-selector'
    };
    onItemSelect(skinItem, colorId);
  };

  const getItemImageUrl = (item: any) => {
    if (item.thumbnailUrl) return item.thumbnailUrl;
    if (item.imageUrl) return item.imageUrl;
    
    // Fallback para Supabase storage
    return `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/flash-assets/${item.swfName || item.id}.png`;
  };

  const filteredItems = items.filter(item => 
    !searchTerm || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.figureId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.swfName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRarityIcon = (rarity: string) => {
    const icons = {
      'nft': <Star className="w-3 h-3" />,
      'ltd': <Crown className="w-3 h-3" />,
      'hc': <Zap className="w-3 h-3" />,
      'rare': <Heart className="w-3 h-3" />,
      'common': null
    };
    return icons[rarity as keyof typeof icons];
  };

  const handleRarityChange = (value: string) => {
    setSelectedRarity(value as 'all' | 'nft' | 'hc' | 'ltd' | 'rare' | 'common');
  };

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ Erro ao carregar assets: {error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex flex-col h-full`}>
      {/* Header V3 COMPLETO */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-bold">Flash Assets System V3 - COMPLETO</h3>
          </div>
          <Badge className="bg-white/20 text-white">
            {totalItems}+ Assets • Sistema V3 • Cor de Pele • 98%+ Precisão
          </Badge>
        </div>
        
        {/* Estatísticas COMPLETAS */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          {Object.entries(sections).map(([id, section]) => (
            <div key={id} className="text-center">
              <div className="font-bold text-lg">{sectionStats[id] || 0}</div>
              <div className="opacity-80 flex items-center justify-center gap-1">
                <span>{section.icon}</span>
                <span>{section.name.split(' ')[0]}</span>
              </div>
              {/* Destaque especial para cor de pele */}
              {id === 'body' && categoryStats['sk'] && (
                <div className="text-xs opacity-70 text-orange-200">+7 tons de pele</div>
              )}
            </div>
          ))}
        </div>

        {/* Estatísticas de raridade */}
        <div className="mt-2 flex justify-center gap-3 text-xs">
          {Object.entries(rarityStats).map(([rarity, count]) => (
            <div key={rarity} className="flex items-center gap-1">
              {getRarityIcon(rarity)}
              <span className="font-medium">{count}</span>
              <span className="opacity-80">{rarity.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controles COMPLETOS */}
      <div className="p-4 border-b bg-gray-50 space-y-3">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nome, ID, categoria ou arquivo SWF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros e Cores */}
        <div className="flex gap-2 items-center">
          <Select value={selectedRarity} onValueChange={handleRarityChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Raridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🌟 Todas</SelectItem>
              <SelectItem value="nft">⭐ NFT</SelectItem>
              <SelectItem value="ltd">👑 Limitados</SelectItem>
              <SelectItem value="hc">⚡ HC Premium</SelectItem>
              <SelectItem value="rare">💎 Raros</SelectItem>
              <SelectItem value="common">📦 Comuns</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedRarity('all');
            }}
          >
            <Filter className="w-4 h-4 mr-1" />
            Limpar
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="text-sm font-medium">Cor Selecionada:</span>
            <div 
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: '#' + currentColor.padStart(6, '0') }}
            />
          </div>
        </div>
      </div>

      {/* Navegação por SEÇÕES V3 */}
      <Tabs value={selectedSection} onValueChange={setSelectedSection} className="flex-1 flex flex-col">
        <div className="p-2 border-b bg-white">
          <ScrollArea className="w-full">
            <TabsList className="grid grid-cols-4 w-full gap-1">
              {Object.entries(sections).map(([id, section]) => (
                <TabsTrigger 
                  key={id} 
                  value={id} 
                  className="flex flex-col items-center gap-1 p-3"
                >
                  <span className="text-xl">{section.icon}</span>
                  <span className="text-xs font-medium">{section.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {sectionStats[id] || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        {/* Conteúdo das SEÇÕES V3 */}
        {Object.entries(sections).map(([sectionId, section]) => (
          <TabsContent key={sectionId} value={sectionId} className="flex-1 p-0 m-0 flex flex-col">
            
            {/* ESPECIAL: Seção de Cor de Pele */}
            {sectionId === 'body' && selectedCategory === 'sk' ? (
              <div className="flex-1 p-4">
                <SkinColorSelector
                  selectedColor={currentColor}
                  onColorSelect={handleSkinColorSelect}
                  selectedGender={selectedGender}
                  className="max-w-md mx-auto"
                />
              </div>
            ) : (
              <>
                {/* Sub-categorias com destaque especial para 'sk' */}
                <div className="p-2 border-b bg-gray-50">
                  <ScrollArea className="w-full">
                    <div className="flex gap-1">
                      {section.categories.map(cat => {
                        const metadata = getCategoryMetadata(cat);
                        const isSpecialSkin = cat === 'sk';
                        return (
                          <Button
                            key={cat}
                            variant={selectedCategory === cat ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[80px] ${
                              isSpecialSkin ? 'border-orange-200 bg-orange-50 hover:bg-orange-100' : ''
                            }`}
                          >
                            <span className="text-lg">{metadata?.icon}</span>
                            <span className="text-xs">{metadata?.name}</span>
                            <Badge variant="secondary" className={`text-xs ${
                              isSpecialSkin ? 'bg-orange-200 text-orange-800' : ''
                            }`}>
                              {isSpecialSkin ? '7 tons' : (categoryStats[cat] || 0)}
                            </Badge>
                          </Button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {/* Seletor de Cores por Categoria */}
                <div className="p-2 border-b bg-white">
                  <OfficialHabboColorPalette
                    selectedCategory={selectedCategory}
                    selectedColor={currentColor}
                    onColorSelect={handleColorSelect}
                    showPaletteInfo={false}
                  />
                </div>

                {/* Grid de Assets */}
                <ScrollArea className="flex-1 p-4">
                  {isLoading ? (
                    <div className="grid grid-cols-4 gap-3">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">{section.icon}</div>
                      <p>Nenhum asset encontrado</p>
                      {searchTerm && <p className="text-sm">Tente buscar por outro termo</p>}
                      {selectedRarity !== 'all' && <p className="text-sm">Ou altere o filtro de raridade</p>}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-3">
                      {filteredItems.map(item => {
                        const metadata = getCategoryMetadata(item.category);
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`aspect-square rounded-lg border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-all duration-200 p-2 flex flex-col items-center justify-center relative ${
                              selectedItem === item.figureId ? 'ring-2 ring-blue-500 border-blue-500' : ''
                            }`}
                            style={{ 
                              backgroundColor: metadata?.color ? `${metadata.color}20` : '#f3f4f6'
                            }}
                          >
                            {/* Indicador de raridade */}
                            {item.rarity !== 'common' && (
                              <div 
                                className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                                style={{ backgroundColor: getRarityColor(item.rarity) }}
                              >
                                {getRarityIcon(item.rarity)}
                              </div>
                            )}

                            <div className="w-12 h-12 mb-1 flex items-center justify-center">
                              <img
                                src={getItemImageUrl(item)}
                                alt={item.name}
                                className="max-w-full max-h-full object-contain pixelated"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.style.display = 'none';
                                }}
                              />
                            </div>
                            
                            <div className="text-center text-xs">
                              <div className="font-medium truncate w-full">{item.name}</div>
                              <div className="text-gray-500 text-xs">#{item.figureId}</div>
                              {item.club === 'hc' && (
                                <Crown className="w-3 h-3 text-yellow-500 mx-auto mt-1" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FlashAssetsV3Complete;