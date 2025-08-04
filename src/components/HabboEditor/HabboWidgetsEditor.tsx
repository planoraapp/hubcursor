
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, User, Shuffle, Copy, Download, Search, Palette, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { useUnifiedClothingAPI } from '@/hooks/useUnifiedClothingAPI';
import { useToast } from '@/hooks/use-toast';
import OptimizedItemThumbnail from './OptimizedItemThumbnail';
import HabboColorPalette from '../HabboColorPalette';

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

const HabboWidgetsEditor = () => {
  const { toast } = useToast();
  const { data: clothingItems, isLoading, error, refetch } = useUnifiedClothingAPI({
    limit: 2000,
    enabled: true
  });
  
  // Estados principais
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({
    'hd': '180',
    'hr': '828',
    'ch': '665',
    'lg': '700',
    'sh': '705'
  });
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('U');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ch');
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});

  // Geração da figura otimizada
  const generateFigureString = useCallback(() => {
    const parts = Object.entries(selectedItems)
      .filter(([, itemId]) => itemId && itemId !== 'none')
      .map(([category, itemId]) => {
        const colorId = selectedColors[category] || '1';
        return `${category}-${itemId}-${colorId}`;
      });
    
    return parts.length > 0 ? parts.join('.') : 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1';
  }, [selectedItems, selectedColors]);

  // URL do avatar otimizada
  const getAvatarUrl = useCallback(() => {
    const figureString = generateFigureString();
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${selectedGender}&size=l&direction=2&head_direction=3&gesture=nor&headonly=0`;
  }, [generateFigureString, selectedGender]);

  // Handlers otimizados
  const handleItemSelect = useCallback((category: string, figureId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: figureId
    }));
    
    toast({
      title: "✨ Item Aplicado!",
      description: `${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} ${figureId} aplicado ao avatar`,
      duration: 1200
    });
  }, [toast]);

  const handleColorSelect = useCallback((category: string, colorId: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [category]: colorId
    }));
    
    toast({
      title: "🎨 Cor Alterada!",
      description: `Nova cor aplicada em ${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}`,
      duration: 1000
    });
  }, [toast]);

  const handleRandomize = useCallback(() => {
    if (!clothingItems || clothingItems.length === 0) return;
    
    const newItems: Record<string, string> = {};
    const newColors: Record<string, string> = {};
    
    // Group items by category
    const categorizedItems = clothingItems.reduce((acc, item) => {
      if (!acc[item.part]) acc[item.part] = [];
      acc[item.part].push(item);
      return acc;
    }, {} as Record<string, typeof clothingItems>);
    
    Object.entries(categorizedItems).forEach(([category, items]) => {
      if (items.length > 0) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        newItems[category] = randomItem.item_id.toString();
        
        if (randomItem.colors && randomItem.colors.length > 0) {
          const randomColor = randomItem.colors[Math.floor(Math.random() * randomItem.colors.length)];
          newColors[category] = randomColor;
        }
      }
    });
    
    setSelectedItems(newItems);
    setSelectedColors(newColors);
    
    toast({
      title: "🎲 Avatar Randomizado!",
      description: "Novo visual gerado com itens aleatórios",
      duration: 2000
    });
  }, [clothingItems, toast]);

  const handleCopyUrl = useCallback(() => {
    const url = getAvatarUrl();
    navigator.clipboard.writeText(url);
    toast({
      title: "📋 URL Copiada!",
      description: "Link da imagem do avatar copiado",
      duration: 1500
    });
  }, [getAvatarUrl, toast]);

  const handleExportFigure = useCallback(() => {
    const figureString = generateFigureString();
    navigator.clipboard.writeText(figureString);
    toast({
      title: "💾 Figure Copiada!",
      description: "Código figure do avatar copiado",
      duration: 1500
    });
  }, [generateFigureString, toast]);

  // Filtro otimizado de itens
  const getFilteredItems = useMemo(() => {
    return (category: string) => {
      if (!clothingItems || clothingItems.length === 0) return [];
      
      let items = clothingItems.filter(item => item.part === category);
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        items = items.filter(item => 
          (item.name && item.name.toLowerCase().includes(searchLower)) ||
          item.code.toLowerCase().includes(searchLower) ||
          item.item_id.toString().includes(searchTerm)
        );
      }
      
      return items.sort((a, b) => {
        if (a.club === 'HC' && b.club !== 'HC') return -1;
        if (a.club !== 'HC' && b.club === 'HC') return 1;
        return a.item_id - b.item_id;
      });
    };
  }, [clothingItems, searchTerm]);

  // Stats em tempo real
  const totalItems = clothingItems ? clothingItems.length : 0;
  const filteredItems = getFilteredItems(activeCategory);
  
  // Categorias disponíveis baseadas nos dados
  const availableCategories = useMemo(() => {
    if (!clothingItems) return [];
    const categories = [...new Set(clothingItems.map(item => item.part))];
    return categories.sort();
  }, [clothingItems]);

  // Agrupar itens por categoria para estatísticas
  const categorizedItems = useMemo(() => {
    if (!clothingItems) return {};
    return clothingItems.reduce((acc, item) => {
      if (!acc[item.part]) acc[item.part] = [];
      acc[item.part].push(item);
      return acc;
    }, {} as Record<string, typeof clothingItems>);
  }, [clothingItems]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <Zap className="w-4 h-4 text-yellow-500 absolute top-0 right-0 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-blue-800 mb-2">Carregando Editor</h3>
          <p className="text-blue-600 mb-2">Buscando roupas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 mb-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Erro no Carregamento</h3>
          <p className="text-sm mt-2">Problema ao carregar itens</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="border-red-300 text-red-600">
          <RefreshCw className="w-4 h-4 mr-2" />
          Recarregar
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Preview do Avatar */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-blue-800 flex items-center justify-center gap-2 text-lg">
            <User className="w-6 h-6" />
            Preview
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-green-100 text-green-800 mx-auto">
            {totalItems.toLocaleString()} roupas
          </Badge>
        </CardHeader>
        
        <CardContent className="p-4 text-center">
          {/* Avatar Image */}
          <div className="bg-white/80 rounded-lg p-6 mb-4 shadow-inner relative">
            <img
              src={getAvatarUrl()}
              alt="Avatar Preview"
              className="w-full h-48 mx-auto transition-all duration-500 hover:scale-105 object-contain"
              style={{ 
                imageRendering: 'pixelated',
                aspectRatio: '1/1.2'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1&gender=U&size=l&direction=2&head_direction=3';
              }}
            />
          </div>
          
          {/* Gender Selector */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { key: 'M', label: '👨 Masc.', color: 'bg-blue-600 hover:bg-blue-700' },
              { key: 'F', label: '👩 Fem.', color: 'bg-pink-600 hover:bg-pink-700' },
              { key: 'U', label: '👤 Unissex', color: 'bg-purple-600 hover:bg-purple-700' }
            ].map(({ key, label, color }) => (
              <Button
                key={key}
                variant={selectedGender === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGender(key as 'M' | 'F' | 'U')}
                className={selectedGender === key ? `${color} text-white` : 'hover:bg-gray-50'}
              >
                {label}
              </Button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button onClick={handleRandomize} variant="outline" size="sm" className="hover:bg-purple-50" title="Randomizar Avatar">
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button onClick={handleCopyUrl} variant="outline" size="sm" className="hover:bg-blue-50" title="Copiar URL da Imagem">
              <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={handleExportFigure} variant="outline" size="sm" className="hover:bg-green-50" title="Copiar Código Figure">
              <Download className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Figure Code */}
          <div className="bg-gray-100 rounded p-2 text-xs font-mono text-gray-700 break-all cursor-pointer hover:bg-gray-200 transition-colors"
               onClick={handleExportFigure}
               title="Clique para copiar">
            {generateFigureString()}
          </div>
        </CardContent>
      </Card>

      {/* Editor Principal - 2 colunas */}
      <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Seletor de Roupas - 2/3 da largura */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Palette className="w-6 h-6" />
                Roupas
              </CardTitle>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Pesquisar roupas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-2 border-gray-200 focus:border-blue-400"
                />
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                {/* Category Tabs */}
                <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-1 mb-6 bg-gray-100 p-1">
                  {availableCategories.map(category => {
                    const count = categorizedItems[category]?.length || 0;
                    return (
                      <TabsTrigger 
                        key={category} 
                        value={category}
                        className="text-xs px-2 py-2 relative data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all"
                      >
                        <div className="text-center">
                          <div className="font-medium">
                            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]?.split(' ')[0] || category.toUpperCase()}
                          </div>
                          <div className="text-[10px] opacity-75">{count}</div>
                        </div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {/* Category Content */}
                {availableCategories.map(category => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <div className="mb-4">
                      <h3 className="font-bold text-xl text-gray-800 mb-2">
                        {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} 
                      </h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {filteredItems.length} itens
                      </Badge>
                    </div>
                    
                    {/* Items Grid - 5 colunas */}
                    <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-5 gap-2">
                        {/* Remove Option */}
                        <Button
                          variant={selectedItems[category] === 'none' ? "default" : "outline"}
                          className={`aspect-square p-2 relative ${
                            selectedItems[category] === 'none' 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'hover:bg-red-50 border-dashed'
                          }`}
                          onClick={() => handleItemSelect(category, 'none')}
                        >
                          <div className="text-xs font-bold text-center">
                            <div>❌</div>
                            <div>Remover</div>
                          </div>
                        </Button>
                        
                        {/* Items */}
                        {filteredItems.map((item) => (
                          <Button
                            key={item.item_id}
                            variant={selectedItems[category] === item.item_id.toString() ? "default" : "outline"}
                            className={`aspect-square p-1 relative group transition-all duration-200 ${
                              selectedItems[category] === item.item_id.toString() 
                                ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-lg scale-105' 
                                : 'hover:bg-blue-50 hover:scale-105 hover:shadow-md'
                            }`}
                            onClick={() => handleItemSelect(category, item.item_id.toString())}
                            title={`${item.name || item.code} - ID: ${item.item_id}${item.club === 'HC' ? ' (HC)' : ''}`}
                          >
                            <OptimizedItemThumbnail
                              category={category}
                              figureId={item.item_id.toString()}
                              colorId={selectedColors[category] || '1'}
                              itemName={item.name || item.code}
                              className="w-full h-full"
                              size="md"
                            />
                            
                            {/* Badges */}
                            {item.club === 'HC' && (
                              <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1 py-0">
                                HC
                              </Badge>
                            )}
                            
                            {/* Selected Indicator */}
                            {selectedItems[category] === item.item_id.toString() && (
                              <div className="absolute inset-0 bg-blue-600/20 rounded flex items-center justify-center">
                                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                  ✓
                                </div>
                              </div>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Seletor de Cores - 1/3 da largura */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5" />
                Cores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedItems[activeCategory] && selectedItems[activeCategory] !== 'none' ? (
                <HabboColorPalette
                  selectedColor={selectedColors[activeCategory] || '1'}
                  onColorSelect={(colorId) => handleColorSelect(activeCategory, colorId)}
                  compact={true}
                />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Selecione um item para escolher cores</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HabboWidgetsEditor;
