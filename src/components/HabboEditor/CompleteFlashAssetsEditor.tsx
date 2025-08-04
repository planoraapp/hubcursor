import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Sparkles, Crown, Zap, Heart, Music, Filter, Star } from 'lucide-react';
import { useEnhancedFlashAssetsV2 } from '@/hooks/useEnhancedFlashAssetsV2';
import { getRarityColor, CATEGORY_SECTIONS } from '@/lib/enhancedCategoryMapperV2';

interface CompleteFlashAssetsEditorProps {
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: any, colorId: string) => void;
  selectedItem: string;
  selectedColor: string;
  className?: string;
}

const CompleteFlashAssetsEditor = ({
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem,
  selectedColor,
  className = ''
}: CompleteFlashAssetsEditorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [selectedSection, setSelectedSection] = useState('head');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

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

  console.log('🎯 [CompleteFlashAssetsEditor] Stats COMPLETAS:', {
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
    if (currentSection && !currentSection.categories.includes(selectedCategory)) {
      setSelectedCategory(currentSection.categories[0]);
    }
  }, [selectedSection, currentSection, selectedCategory]);

  const handleItemClick = (item: any) => {
    console.log('🎯 [CompleteFlashAssetsEditor] Item selecionado:', item);
    onItemSelect(item, selectedColor);
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
      {/* Header COMPLETO com estatísticas */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-bold">Sistema Flash Assets COMPLETO - CORRIGIDO</h3>
          </div>
          <Badge className="bg-white/20 text-white">
            {totalItems}+ Assets • Categorização 95%+ • 3 Paletas Oficiais
          </Badge>
        </div>
        
        {/* Estatísticas por seção */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          {Object.entries(sections).map(([id, section]) => (
            <div key={id} className="text-center">
              <div className="font-bold text-lg">{sectionStats[id] || 0}</div>
              <div className="opacity-80 flex items-center justify-center gap-1">
                <span>{section.icon}</span>
                <span>{section.name.split(' ')[0]}</span>
              </div>
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

      {/* Controles de filtro EXPANDIDOS */}
      <div className="p-4 border-b bg-gray-50 space-y-3">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar assets por nome, ID ou arquivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <Select value={selectedRarity} onValueChange={setSelectedRarity}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Raridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="nft">NFT</SelectItem>
              <SelectItem value="ltd">Limitados</SelectItem>
              <SelectItem value="hc">HC</SelectItem>
              <SelectItem value="rare">Raros</SelectItem>
              <SelectItem value="common">Comuns</SelectItem>
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
        </div>
      </div>

      {/* Navegação por SEÇÕES */}
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

        {/* Conteúdo das SEÇÕES com sub-categorias */}
        {Object.entries(sections).map(([sectionId, section]) => (
          <TabsContent key={sectionId} value={sectionId} className="flex-1 p-0 m-0 flex flex-col">
            {/* Sub-categorias da seção */}
            <div className="p-2 border-b bg-gray-50">
              <ScrollArea className="w-full">
                <div className="flex gap-1">
                  {section.categories.map(cat => {
                    const metadata = getCategoryMetadata(cat);
                    return (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                        className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[80px]"
                      >
                        <span className="text-lg">{metadata?.icon}</span>
                        <span className="text-xs">{metadata?.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {categoryStats[cat] || 0}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Grid de itens */}
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
                  <p>Nenhum item encontrado</p>
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CompleteFlashAssetsEditor;
