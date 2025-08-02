import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, User, Shuffle, Copy, Download, Search, Palette, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { useHabboWidgetsClothing } from '@/hooks/useHabboWidgetsClothing';
import { useToast } from '@/hooks/use-toast';
import OptimizedItemThumbnail from './OptimizedItemThumbnail';

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
  const { data: clothingData, isLoading, error, refetch } = useHabboWidgetsClothing();
  
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
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${selectedGender}&size=l&direction=2&head_direction=3`;
  }, [generateFigureString, selectedGender]);

  // Handlers otimizados com feedback
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
      title: "🎲 Avatar Randomizado!",
      description: "Novo visual gerado com itens aleatórios",
      duration: 2000
    });
  }, [clothingData, toast]);

  const handleCopyUrl = useCallback(() => {
    const url = getAvatarUrl();
    navigator.clipboard.writeText(url);
    toast({
      title: "📋 URL Copiada!",
      description: "Link da imagem do avatar copiado para a área de transferência",
      duration: 1500
    });
  }, [getAvatarUrl, toast]);

  const handleExportFigure = useCallback(() => {
    const figureString = generateFigureString();
    navigator.clipboard.writeText(figureString);
    toast({
      title: "💾 Figure Copiada!",
      description: "Código figure do avatar copiado para a área de transferência",
      duration: 1500
    });
  }, [generateFigureString, toast]);

  // Filtro otimizado de itens com cache
  const getFilteredItems = useMemo(() => {
    return (category: string) => {
      if (!clothingData?.[category]) return [];
      
      let items = clothingData[category];
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(searchLower) ||
          item.figureId.includes(searchTerm)
        );
      }
      
      // Ordenar por rarity e figureId
      return items.sort((a, b) => {
        // Primeiro por club status (HC primeiro)
        if (a.club && !b.club) return -1;
        if (!a.club && b.club) return 1;
        
        // Depois por figureId numérico
        return parseInt(a.figureId) - parseInt(b.figureId);
      });
    };
  }, [clothingData, searchTerm]);

  // Stats em tempo real
  const totalItems = clothingData ? Object.values(clothingData).reduce((sum, items) => sum + items.length, 0) : 0;
  const filteredItems = getFilteredItems(activeCategory);
  const availableCategories = clothingData ? Object.keys(clothingData).sort() : [];
  const hcItemsCount = filteredItems.filter(item => item.club).length;
  const freeItemsCount = filteredItems.filter(item => !item.club).length;

  // Loading state melhorado
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <Zap className="w-4 h-4 text-yellow-500 absolute top-0 right-0 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-blue-800 mb-2">Carregando Sistema MASSIVO</h3>
          <p className="text-blue-600 mb-2">Buscando milhares de roupas do HabboWidgets...</p>
          <div className="text-sm text-blue-500 space-y-1">
            <div>🔄 Conectando com APIs oficiais</div>
            <div>🕸️ Fazendo scraping inteligente</div>
            <div>💎 Carregando base de dados massiva</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state melhorado
  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 mb-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Erro no Sistema de Roupas</h3>
          <p className="text-sm mt-2">Problema na comunicação com as APIs de roupas</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="border-red-300 text-red-600">
          <RefreshCw className="w-4 h-4 mr-2" />
          Recarregar Sistema
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Preview do Avatar Melhorado */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-blue-800 flex items-center justify-center gap-2 text-lg">
            <User className="w-6 h-6" />
            Preview Avatar
          </CardTitle>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
              ✨ {totalItems.toLocaleString()} roupas carregadas
            </Badge>
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
              📊 Sistema MASSIVO Ativo
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 text-center">
          {/* Avatar Image com loading */}
          <div className="bg-white/80 rounded-lg p-6 mb-4 shadow-inner relative">
            <img
              src={getAvatarUrl()}
              alt="Avatar Preview"
              className="w-44 h-44 mx-auto transition-all duration-500 hover:scale-105"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1&gender=U&size=l&direction=2&head_direction=3';
              }}
            />
            <div className="text-xs text-gray-600 mt-2 space-y-1">
              <div>{Object.keys(selectedItems).length} peças ativas</div>
              <div className="text-green-600">✅ Preview em tempo real</div>
            </div>
          </div>
          
          {/* Gender Selector Melhorado */}
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
          
          {/* Action Buttons Melhorados */}
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
          
          {/* Figure Code com copy */}
          <div className="bg-gray-100 rounded p-2 text-xs font-mono text-gray-700 break-all cursor-pointer hover:bg-gray-200 transition-colors"
               onClick={handleExportFigure}
               title="Clique para copiar">
            {generateFigureString()}
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Roupas MASSIVO */}
      <div className="xl:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Palette className="w-6 h-6" />
              Catálogo HabboWidgets MASSIVO
            </CardTitle>
            
            {/* Search Bar Melhorado */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Pesquisar entre milhares de roupas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-2 border-gray-200 focus:border-blue-400"
              />
              {searchTerm && (
                <Badge className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white text-xs">
                  {filteredItems.length} encontrados
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              {/* Category Tabs Melhorados */}
              <TabsList className="grid grid-cols-6 lg:grid-cols-12 gap-1 mb-6 bg-gray-100 p-1">
                {availableCategories.map(category => {
                  const count = clothingData?.[category]?.length || 0;
                  return (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="text-xs px-2 py-2 relative data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all"
                    >
                      <div className="text-center">
                        <div className="font-medium">
                          {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category.toUpperCase()}
                        </div>
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center p-0">
                          {count}
                        </Badge>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Category Content Melhorado */}
              {availableCategories.map(category => (
                <TabsContent key={category} value={category} className="mt-4">
                  <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">
                        {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} 
                      </h3>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          📦 {filteredItems.length} itens
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          👑 {hcItemsCount} HC
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          🆓 {freeItemsCount} Gratuitos
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Color Selector Melhorado */}
                    {selectedItems[category] && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Cores:</span>
                        <div className="flex gap-1">
                          {['1', '2', '3', '4', '5', '6', '7', '8'].map(colorId => (
                            <Button
                              key={colorId}
                              variant={selectedColors[category] === colorId ? "default" : "outline"}
                              size="sm"
                              className={`w-8 h-8 p-0 ${
                                selectedColors[category] === colorId 
                                  ? 'bg-blue-600 text-white' 
                                  : 'hover:bg-blue-50'
                              }`}
                              onClick={() => handleColorSelect(category, colorId)}
                            >
                              {colorId}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Items Grid Otimizada */}
                  <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
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
                      
                      {/* Items com Thumbnail Otimizada */}
                      {filteredItems.map((item) => (
                        <Button
                          key={item.id}
                          variant={selectedItems[category] === item.figureId ? "default" : "outline"}
                          className={`aspect-square p-1 relative group transition-all duration-200 ${
                            selectedItems[category] === item.figureId 
                              ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-lg scale-105' 
                              : 'hover:bg-blue-50 hover:scale-105 hover:shadow-md'
                          }`}
                          onClick={() => handleItemSelect(category, item.figureId)}
                          title={`${item.name} - ID: ${item.figureId}${item.club ? ' (HC)' : ''}`}
                        >
                          <OptimizedItemThumbnail
                            category={category}
                            figureId={item.figureId}
                            colorId={selectedColors[category] || '1'}
                            itemName={item.name}
                            className="w-full h-full"
                            size="md"
                          />
                          
                          {/* Badges */}
                          {item.club && (
                            <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1 py-0">
                              HC
                            </Badge>
                          )}
                          
                          {/* Selected Indicator */}
                          {selectedItems[category] === item.figureId && (
                            <div className="absolute inset-0 bg-blue-600/20 rounded flex items-center justify-center">
                              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                ✓
                              </div>
                            </div>
                          )}
                        </Button>
                      ))}
                    </div>
                    
                    {/* No Results */}
                    {filteredItems.length === 0 && (
                      <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma roupa encontrada</h3>
                        <p className="text-gray-500 mb-4">Tente ajustar o termo de busca ou escolher outra categoria</p>
                        <Button onClick={() => setSearchTerm('')} variant="outline">
                          Limpar Busca
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Footer com Stats */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="text-center space-y-2">
                <div className="text-lg font-bold text-gray-800">
                  🎨 Sistema HabboWidgets MASSIVO Ativo
                </div>
                <div className="flex justify-center gap-4 text-sm text-gray-600">
                  <span>📦 {totalItems.toLocaleString()} roupas disponíveis</span>
                  <span>🎯 {availableCategories.length} categorias</span>
                  <span>⚡ Cache inteligente ativo</span>
                </div>
                <div className="text-xs text-green-600 font-medium">
                  ✅ Dados oficiais + Scraping + Base massiva + Fallback garantido
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HabboWidgetsEditor;
