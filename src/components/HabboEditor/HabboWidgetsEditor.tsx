
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Shuffle, Copy, Download } from 'lucide-react';
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

  const generateFigureString = useCallback(() => {
    const parts = Object.entries(selectedItems)
      .filter(([, itemId]) => itemId && itemId !== 'none')
      .map(([category, itemId]) => `${category}-${itemId}-1`);
    
    return parts.length > 0 ? parts.join('.') : 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1';
  }, [selectedItems]);

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
      description: `${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} alterado`,
      duration: 1000
    });
  };

  const handleRandomize = () => {
    if (!clothingData) return;
    
    const newItems: Record<string, string> = {};
    
    Object.entries(clothingData).forEach(([category, items]) => {
      if (items.length > 0) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        newItems[category] = randomItem.figureId;
      }
    });
    
    setSelectedItems(newItems);
    toast({
      title: "Avatar randomizado!",
      description: "Novo visual gerado aleatoriamente"
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <span className="text-gray-600">Carregando roupas do HabboWidgets...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
        <p className="font-semibold mb-2">Erro ao carregar roupas</p>
        <p className="text-sm">Tente novamente mais tarde</p>
      </div>
    );
  }

  const availableCategories = clothingData ? Object.keys(clothingData).sort() : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Preview do Avatar */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-blue-800 flex items-center justify-center gap-2">
            <User className="w-5 h-5" />
            Preview HabboWidgets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="bg-white/80 rounded-lg p-4 mb-4 shadow-inner">
            <img
              src={getAvatarUrl()}
              alt="Avatar Preview"
              className="w-40 h-40 mx-auto"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1&gender=U&size=l&direction=2&head_direction=3';
              }}
            />
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
            
            <Badge variant="secondary" className="text-xs">
              {Object.keys(selectedItems).length} peças selecionadas
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Roupas */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Guarda-roupa HabboWidgets</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={availableCategories[0]} className="w-full">
              <TabsList className="grid grid-cols-6 lg:grid-cols-12 gap-1 mb-4">
                {availableCategories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="text-xs px-2 py-1"
                  >
                    {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>

              {availableCategories.map(category => (
                <TabsContent key={category} value={category} className="mt-4">
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} 
                      <Badge variant="outline" className="ml-2">
                        {clothingData?.[category]?.length || 0} itens
                      </Badge>
                    </h3>
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
                      <span className="text-xs">Sem</span>
                    </Button>
                    
                    {clothingData?.[category]?.map((item) => (
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
