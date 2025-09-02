
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useHomeAssets } from '../../hooks/useHomeAssets';

interface BackgroundSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBackground: (background: { type: 'color' | 'repeat' | 'cover'; value: string }) => void;
  currentBackground: { background_type: string; background_value: string };
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  isOpen,
  onClose,
  onSelectBackground,
  currentBackground
}) => {
  const { assets, loading, getAssetUrl, syncAssets } = useHomeAssets();
  const [selectedTab, setSelectedTab] = useState<'colors' | 'patterns' | 'images'>('colors');
  const [syncing, setSyncing] = useState(false);

  // Auto-sync assets when modal opens if no background assets are available
  useEffect(() => {
    if (isOpen && !assets['Papel de Parede']?.length && !loading) {
      handleSync();
    }
  }, [isOpen, assets, loading]);

  // Predefined color palette
  const colors = [
    '#c7d2dc', '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
    '#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545',
    '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8',
    '#343a40', '#495057', '#6c757d', '#f1c0e8', '#cfbaf0',
    '#a3c4f3', '#90dbf4', '#8eecf5', '#98f5e1', '#b9fbc0',
    '#ffcfd2', '#fde68a', '#fed7aa', '#fbb6ce', '#d8b4fe'
  ];

  const handleColorSelect = (color: string) => {
    onSelectBackground({ type: 'color', value: color });
  };

  const handlePatternSelect = (asset: any) => {
    const imageUrl = getAssetUrl(asset);
    onSelectBackground({ type: 'repeat', value: imageUrl });
  };

  const handleImageSelect = (asset: any) => {
    const imageUrl = getAssetUrl(asset);
    onSelectBackground({ type: 'cover', value: imageUrl });
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncAssets();
    } catch (error) {
      console.error('Error syncing assets:', error);
    } finally {
      setSyncing(false);
    }
  };

  const backgroundAssets = assets['Papel de Parede'] || [];
  
  // Separate patterns (small, repeatable) from full images
  const patterns = backgroundAssets.filter(asset => 
    asset.name.includes('pattern') || asset.name.includes('tile') || asset.file_path.includes('pattern')
  );
  
  const images = backgroundAssets.filter(asset => 
    !patterns.includes(asset)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 volter-font">
            🎨 Selecionar Background da Home
            <Badge className="bg-blue-100 text-blue-800">
              {backgroundAssets.length} fundos disponíveis
            </Badge>
            {backgroundAssets.length === 0 && (
              <Button
                onClick={handleSync}
                disabled={syncing}
                size="sm"
                variant="outline"
                className="ml-auto volter-font"
              >
                {syncing ? '🔄' : '🔄'} {syncing ? 'Carregando...' : 'Carregar Fundos'}
              </Button>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600 volter-font">
            Escolha uma cor sólida, padrão repetitivo ou imagem de fundo para personalizar sua Habbo Home
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)} className="h-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="colors" className="flex items-center gap-2 volter-font">
                <span>🎨</span>
                <span>Cores Sólidas</span>
              </TabsTrigger>
              <TabsTrigger value="patterns" className="flex items-center gap-2 volter-font">
                <span>🔄</span>
                <span>Padrões</span>
                <Badge variant="secondary">{patterns.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2 volter-font">
                <span>🖼️</span>
                <span>Imagens</span>
                <Badge variant="secondary">{images.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Colors Tab */}
            <TabsContent value="colors" className="h-[calc(100%-60px)]">
              <div className="mb-3">
                <h3 className="font-bold text-lg volter-font mb-2">Cores Sólidas</h3>
                <p className="text-sm text-gray-600 volter-font">
                  Selecione uma cor sólida para o fundo da sua home
                </p>
              </div>
              
              <ScrollArea className="h-[calc(100%-80px)]">
                <div className="grid grid-cols-10 gap-3 p-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`w-16 h-16 rounded-lg border-2 hover:border-blue-400 transition-all duration-200 shadow-md hover:shadow-lg ${
                        currentBackground.background_value === color && currentBackground.background_type === 'color'
                          ? 'border-blue-600 ring-2 ring-blue-300'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {currentBackground.background_value === color && currentBackground.background_type === 'color' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-xl drop-shadow-lg">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Patterns Tab */}
            <TabsContent value="patterns" className="h-[calc(100%-60px)]">
              <div className="mb-3">
                <h3 className="font-bold text-lg volter-font mb-2">Padrões Repetitivos</h3>
                <p className="text-sm text-gray-600 volter-font">
                  Padrões pequenos que se repetem por toda a home
                </p>
              </div>
              
              <ScrollArea className="h-[calc(100%-80px)]">
                {loading || syncing ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 volter-font">Carregando padrões...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-4 p-2">
                    {patterns.map(asset => {
                      const imageUrl = getAssetUrl(asset);
                      const isSelected = currentBackground.background_value === imageUrl && currentBackground.background_type === 'repeat';
                      
                      return (
                        <button
                          key={asset.id}
                          onClick={() => handlePatternSelect(asset)}
                          className={`group relative p-3 border-2 rounded-lg hover:border-blue-400 transition-all duration-200 ${
                            isSelected ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-300'
                          }`}
                        >
                          <div 
                            className="w-20 h-20 border rounded bg-repeat bg-center"
                            style={{ 
                              backgroundImage: `url(${imageUrl})`,
                              backgroundSize: '32px 32px'
                            }}
                          />
                          <div className="mt-2 text-xs volter-font text-center truncate">
                            {asset.name}
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="h-[calc(100%-60px)]">
              <div className="mb-3">
                <h3 className="font-bold text-lg volter-font mb-2">Imagens de Fundo</h3>
                <p className="text-sm text-gray-600 volter-font">
                  Imagens completas que cobrem toda a área da home
                </p>
              </div>
              
              <ScrollArea className="h-[calc(100%-80px)]">
                {loading || syncing ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 volter-font">Carregando imagens...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4 p-2">
                    {images.map(asset => {
                      const imageUrl = getAssetUrl(asset);
                      const isSelected = currentBackground.background_value === imageUrl && currentBackground.background_type === 'cover';
                      
                      return (
                        <button
                          key={asset.id}
                          onClick={() => handleImageSelect(asset)}
                          className={`group relative border-2 rounded-lg overflow-hidden hover:border-blue-400 transition-all duration-200 ${
                            isSelected ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-300'
                          }`}
                        >
                          <div 
                            className="w-full h-32 bg-cover bg-center"
                            style={{ 
                              backgroundImage: `url(${imageUrl})`
                            }}
                          />
                          <div className="p-2 bg-white">
                            <div className="text-xs volter-font text-center truncate">
                              {asset.name}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 volter-font pt-3 border-t">
          <span>💡 Dica: Use padrões para texturas sutis e imagens para fundos temáticos</span>
          <Button onClick={onClose} variant="outline" className="volter-font">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
