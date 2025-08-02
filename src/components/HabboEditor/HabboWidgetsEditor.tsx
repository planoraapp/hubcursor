
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, User, Shuffle, Copy, Download, Search, Palette, RefreshCw } from 'lucide-react';
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

  // Geração da figura
  const generateFigureString = useCallback(() => {
    const parts = Object.entries(selectedItems)
      .filter(([, itemId]) => itemId && itemId !== 'none')
      .map(([category, itemId]) => {
        const colorId = selectedColors[category] || '1';
        return `${category}-${itemId}-${colorId}`;
      });
    
    return parts.length > 0 ? parts.join('.') : 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1';
  }, [selectedItems, selectedColors]);

  // URL do avatar
  const getAvatarUrl = useCallback(() => {
    const figureString = generateFigureString();
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${selectedGender}&size=l&direction=2&head_direction=3`;
  }, [generateFigureString, selectedGender]);

  // Handlers otimizados
  const handleItemSelect = useCallback((category: string, figureId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: figureId
    }));
    
    toast({
      title: "Item selecionado!",
      description: `${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} alterado`,
      duration: 1500
    });
  }, [toast]);

  const handleColorSelect = useCallback((category: string, colorId: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [category]: colorId
    }));
  }, []);

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
      title: "Avatar randomizado!",
      description: "Novo visual gerado aleatoriamente"
    });
  }, [clothingData, toast]);

  const handleCopyUrl = useCallback(() => {
    const url = getAvatarUrl();
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada!",
      description: "Link do avatar copiado"
    });
  }, [getAvatarUrl, toast]);

  const handleExportFigure = useCallback(() => {
    const figureString = generateFigureString();
    navigator.clipboard.writeText(figureString);
    toast({
      title: "Figure copiada!",
      description: "Código do avatar copiado"
    });
  }, [generateFigureString, toast]);

  // Filtro otimizado de itens
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
      
      return items.sort((a, b) => parseInt(a.figureId) - parseInt(b.figureId));
    };
  }, [clothingData, searchTerm]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <span className="text-gray-600">Carregando catálogo COMPLETO...</span>
          <p className="text-sm text-gray-500 mt-2">Buscando milhares de itens do HabboWidgets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
        <p className="font-semibold mb-2">Erro ao carregar catálogo</p>
        <p className="text-sm mb-4">Problema na comunicação com HabboWidgets</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const availableCategories = clothingData ? Object.keys(clothingData).sort() : [];
  const totalItems = clothingData ? Object.values(clothingData).reduce((sum, items) => sum + items.length, 0) : 0;
  const filteredItems = getFilteredItems(activeCategory);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Preview do Avatar */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-blue-800 flex items-center justify-center gap-2">
            <User className="w-5 h-5" />
            Preview Avatar
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalItems.toLocaleString()} itens carregados
          </Badge>
        </CardHeader>
        <CardContent className="p-6 text-center">
          {/* Avatar Image */}
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
            <div className="text-xs text-gray-600 mt-2">
              {Object.keys(selectedItems).length} peças ativas
            </div>
          </div>
          
          {/* Gender Selector */}
          <div className="flex gap-2 justify-center mb-3">
            {[
              { key: 'M', label: '👨 Masculino', color: 'bg-blue-600' },
              { key: 'F', label: '👩 Feminino', color: 'bg-pink-600' },
              { key: 'U', label: '👤 Unissex', color: 'bg-purple-600' }
            ].map(({ key, label, color }) => (
              <Button
                key={key}
                variant={selectedGender === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGender(key as 'M' | 'F' | 'U')}
                className={selectedGender === key ? `${color} text-white` : ''}
              >
                {label}
              </Button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Button onClick={handleRandomize} variant="outline" size="sm" title="Randomizar">
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button onClick={handleCopyUrl} variant="outline" size="sm" title="Copiar URL">
              <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={handleExportFigure} variant="outline" size="sm" title="Exportar Figure">
              <Download className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 break-all">
            {generateFigureString()}
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Roupas */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Catálogo HabboWidgets Completo
            </CardTitle>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Pesquisar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              {/* Category Tabs */}
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

              {/* Category Content */}
              {availableCategories.map(category => (
                <TabsContent key={category} value={category} className="mt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} 
                      <Badge variant="outline" className="ml-2">
                        {filteredItems.length} itens
                      </Badge>
                    </h3>
                    
                    {/* Color Selector */}
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
                  
                  {/* Items Grid */}
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto">
                    {/* Remove Option */}
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
                    
                    {/* Items */}
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
                          className="w-full h-full object-contain rounded"
                          style={{ imageRendering: 'pixelated' }}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="text-xs font-bold text-center">${item.figureId}</div>`;
                            }
                          }}
                        />
                        
                        {/* HC Badge */}
                        {item.club && (
                          <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1">
                            HC
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                  
                  {/* No Results */}
                  {filteredItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhum item encontrado</p>
                      <p className="text-xs mt-2">Tente outro termo de busca</p>
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

export default HabboWidgetsEditor;
