
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, User, Shuffle, Copy, Download, Search, Palette } from 'lucide-react';
import { useHabboWidgetsClothing } from '@/hooks/useHabboWidgetsClothing';
import { useToast } from '@/hooks/use-toast';

const CATEGORY_LABELS = {
  'ca': 'Bijuterias',
  'cc': 'Casacos', 
  'ch': 'Camisas',
  'cp': 'Estampas',
  'ea': 'Óculos',
  'fa': 'Máscaras',
  'ha': 'Chapéus',
  'hd': 'Rosto & Corpo',
  'hr': 'Cabelo',
  'lg': 'Calças',
  'sh': 'Sapatos',
  'wa': 'Cintos'
};

const RARITY_COLORS = {
  'common': 'bg-gray-500',
  'rare': 'bg-yellow-500',
  'super_rare': 'bg-purple-500',
  'limited': 'bg-red-500'
};

const HabboWidgetsEditor = () => {
  const { toast } = useToast();
  const { data: clothingData, isLoading, error } = useHabboWidgetsClothing();
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({
    'hd': '180',
    'hr': '828',
    'ch': '665',
    'lg': '700',
    'sh': '705'
  });
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('U');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ca');
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});

  const generateFigureString = useCallback(() => {
    const parts = Object.entries(selectedItems)
      .filter(([, itemId]) => itemId && itemId !== 'none')
      .map(([category, itemId]) => {
        const colorId = selectedColors[category] || '1';
        return `${category}-${itemId}-${colorId}`;
      });
    
    return parts.length > 0 ? parts.join('.') : 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1';
  }, [selectedItems, selectedColors]);

  const getAvatarUrl = useCallback(() => {
    const figureString = generateFigureString();
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${selectedGender}&size=l&direction=2&head_direction=3`;
  }, [generateFigureString, selectedGender]);

  const handleItemSelect = (category: string, figureId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: figureId
    }));
    
    toast({
      title: "Item selecionado!",
      description: `${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} alterado para ${figureId}`,
      duration: 2000
    });
  };

  const handleColorSelect = (category: string, colorId: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [category]: colorId
    }));
  };

  const handleRandomize = () => {
    if (!clothingData) return;
    
    const newItems: Record<string, string> = {};
    const newColors: Record<string, string> = {};
    
    Object.entries(clothingData).forEach(([category, items]) => {
      if (items.length > 0) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        newItems[category] = randomItem.figureId;
        
        if (randomItem.colors.length > 0) {
          const randomColor = randomItem.colors[Math.floor(Math.random() * randomItem.colors.length)];
          newColors[category] = randomColor;
        }
      }
    });
    
    setSelectedItems(newItems);
    setSelectedColors(newColors);
    
    toast({
      title: "Avatar randomizado!",
      description: "Novo visual gerado aleatoriamente com cores variadas"
    });
  };

  const handleCopyUrl = () => {
    const url = getAvatarUrl();
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada!",
      description: "Link do avatar copiado para área de transferência"
    });
  };

  const handleExportFigure = () => {
    const figureString = generateFigureString();
    navigator.clipboard.writeText(figureString);
    toast({
      title: "Figure string copiada!",
      description: "Código do avatar copiado para área de transferência"
    });
  };

  const getFilteredItems = (category: string) => {
    if (!clothingData?.[category]) return [];
    
    let items = clothingData[category];
    
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.figureId.includes(searchTerm)
      );
    }
    
    return items.sort((a, b) => {
      // Ordenar por raridade primeiro, depois por ID
      if (a.rarity !== b.rarity) {
        const rarityOrder = ['common', 'rare', 'super_rare', 'limited'];
        return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity);
      }
      return parseInt(a.figureId) - parseInt(b.figureId);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <span className="text-gray-600">Carregando catálogo completo do HabboWidgets...</span>
          <p className="text-sm text-gray-500 mt-2">Buscando milhares de itens...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
        <p className="font-semibold mb-2">Erro ao carregar catálogo</p>
        <p className="text-sm">Usando dados de fallback. Tente novamente mais tarde</p>
      </div>
    );
  }

  const availableCategories = clothingData ? Object.keys(clothingData).sort() : [];
  const totalItems = clothingData ? Object.values(clothingData).reduce((sum, items) => sum + items.length, 0) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Preview do Avatar */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-blue-800 flex items-center justify-center gap-2">
            <User className="w-5 h-5" />
            Preview Avançado
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalItems} itens carregados
          </Badge>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="bg-white/80 rounded-lg p-4 mb-4 shadow-inner">
            <img
              src={getAvatarUrl()}
              alt="Avatar Preview"
              className="w-40 h-40 mx-auto transition-all duration-300"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1&gender=U&size=l&direction=2&head_direction=3';
              }}
            />
            
            {/* Informações do avatar */}
            <div className="text-xs text-gray-600 mt-2">
              {Object.keys(selectedItems).length} peças ativas
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Seletor de Gênero */}
            <div className="flex gap-2 justify-center">
              <Button
                variant={selectedGender === 'M' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGender('M')}
                className={selectedGender === 'M' ? 'bg-blue-600 text-white' : ''}
              >
                👨 Masculino
              </Button>
              <Button
                variant={selectedGender === 'F' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGender('F')}
                className={selectedGender === 'F' ? 'bg-pink-600 text-white' : ''}
              >
                👩 Feminino
              </Button>
              <Button
                variant={selectedGender === 'U' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGender('U')}
                className={selectedGender === 'U' ? 'bg-purple-600 text-white' : ''}
              >
                👤 Unissex
              </Button>
            </div>
            
            {/* Botões de Ação */}
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={handleRandomize} variant="outline" size="sm">
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button onClick={handleCopyUrl} variant="outline" size="sm">
                <Copy className="w-4 h-4" />
              </Button>
              <Button onClick={handleExportFigure} variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              Figure: {generateFigureString().substring(0, 30)}...
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Roupas */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Catálogo Completo HabboWidgets
            </CardTitle>
            
            {/* Barra de pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Pesquisar itens por nome ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid grid-cols-6 lg:grid-cols-12 gap-1 mb-4">
                {availableCategories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="text-xs px-2 py-1 relative"
                  >
                    {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category.toUpperCase()}
                    <Badge className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-0">
                      {clothingData?.[category]?.length || 0}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {availableCategories.map(category => {
                const filteredItems = getFilteredItems(category);
                
                return (
                  <TabsContent key={category} value={category} className="mt-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} 
                        <Badge variant="outline" className="ml-2">
                          {filteredItems.length} itens
                        </Badge>
                      </h3>
                      
                      {/* Seletor de cores para categoria ativa */}
                      {selectedItems[category] && (
                        <div className="flex gap-1">
                          {['1', '2', '3', '4', '5', '6', '7', '8'].map(colorId => (
                            <Button
                              key={colorId}
                              variant={selectedColors[category] === colorId ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => handleColorSelect(category, colorId)}
                            >
                              {colorId}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto">
                      {/* Opção "Remover" */}
                      <Button
                        variant={selectedItems[category] === 'none' ? "default" : "outline"}
                        className={`aspect-square p-2 ${
                          selectedItems[category] === 'none' 
                            ? 'bg-red-500 text-white' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleItemSelect(category, 'none')}
                      >
                        <span className="text-xs">Remover</span>
                      </Button>
                      
                      {filteredItems.map((item) => (
                        <Button
                          key={item.id}
                          variant={selectedItems[category] === item.figureId ? "default" : "outline"}
                          className={`aspect-square p-1 relative ${
                            selectedItems[category] === item.figureId 
                              ? 'bg-blue-600 text-white border-2 border-blue-600' 
                              : 'hover:bg-blue-50'
                          }`}
                          onClick={() => handleItemSelect(category, item.figureId)}
                          title={`${item.name} - ${item.figureId}`}
                        >
                          <img
                            src={item.thumbnailUrl}
                            alt={item.name}
                            className="w-full h-full object-contain rounded transition-transform hover:scale-110"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/assets/placeholder-item.png';
                            }}
                          />
                          
                          {/* Badge de raridade */}
                          <Badge 
                            className={`absolute -top-1 -right-1 text-xs px-1 ${RARITY_COLORS[item.rarity]} text-white`}
                          >
                            {item.rarity === 'common' ? 'C' : 
                             item.rarity === 'rare' ? 'R' : 
                             item.rarity === 'super_rare' ? 'SR' : 'LTD'}
                          </Badge>
                          
                          {/* Badge HC */}
                          {item.club && (
                            <Badge className="absolute -bottom-1 -left-1 bg-yellow-500 text-black text-xs px-1">
                              HC
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                    
                    {filteredItems.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Nenhum item encontrado com "{searchTerm}"</p>
                        <p className="text-xs mt-2">Tente um termo de busca diferente</p>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HabboWidgetsEditor;
