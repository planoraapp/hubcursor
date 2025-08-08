import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useHomeAssets } from '../../hooks/useHomeAssets';

interface EnhancedStickerInventoryProps {
  isOpen: boolean;
  onClose: () => void;
  onStickerDrop: (sticker: any) => void;
}

export const EnhancedStickerInventory: React.FC<EnhancedStickerInventoryProps> = ({
  isOpen,
  onClose,
  onStickerDrop
}) => {
  const { assets, loading, getAssetUrl, syncAssets } = useHomeAssets();
  const [selectedCategory, setSelectedCategory] = useState<'Stickers' | 'Mockups' | 'Montáveis' | 'Ícones' | 'Animados'>('Stickers');
  const [syncing, setSyncing] = useState(false);

  // Auto-sync assets when modal opens if no assets are available
  useEffect(() => {
    if (isOpen && Object.values(assets).flat().length === 0 && !loading) {
      handleSync();
    }
  }, [isOpen, assets, loading]);

  const categories = [
    { id: 'Stickers', label: 'Stickers', icon: '✨', count: assets.Stickers?.length || 0 },
    { id: 'Mockups', label: 'Mockups', icon: '🎭', count: assets.Mockups?.length || 0 },
    { id: 'Montáveis', label: 'Montáveis', icon: '🧩', count: assets.Montáveis?.length || 0 },
    { id: 'Ícones', label: 'Ícones', icon: '🎯', count: assets.Ícones?.length || 0 },
    { id: 'Animados', label: 'Animados', icon: '🎬', count: assets.Animados?.length || 0 }
  ] as const;

  const handleStickerClick = (asset: any) => {
    const stickerData = {
      sticker_id: asset.id,
      sticker_src: getAssetUrl(asset),
      category: asset.category?.toLowerCase() || 'decorative',
      rotation: 0,
      scale: 1
    };

    onStickerDrop(stickerData);
    onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 volter-font">
            ✨ Inventário de Assets
            <Badge className="bg-blue-100 text-blue-800">
              {Object.values(assets).flat().length} assets disponíveis
            </Badge>
            <Button
              onClick={handleSync}
              disabled={syncing}
              size="sm"
              variant="outline"
              className="ml-auto volter-font"
            >
              {syncing ? '🔄' : '🔄'} {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          </DialogTitle>
          <DialogDescription className="text-slate-700 volter-font">
            Selecione stickers, mockups e outros elementos para adicionar à sua Habbo Home
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="h-full">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center gap-2 volter-font"
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category.id} value={category.id} className="h-[calc(100%-80px)]">
                <div className="mb-3">
                  <h3 className="font-bold text-lg volter-font flex items-center gap-2">
                    {category.icon} {category.label}
                  </h3>
                  <p className="text-sm text-gray-600 volter-font">
                    Clique nos {category.label.toLowerCase()} para adicionar à sua home
                  </p>
                </div>
                
                <ScrollArea className="h-[calc(100%-80px)]">
                  {loading || syncing ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 volter-font">Carregando {category.label.toLowerCase()}...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-8 gap-4 p-2">
                      {assets[category.id]?.map(asset => (
                        <div key={asset.id} className="group relative">
                          <button
                            onClick={() => handleStickerClick(asset)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-lg hover:scale-105"
                          >
                            <div className="flex items-center justify-center h-16">
                              <img
                                src={getAssetUrl(asset)}
                                alt={asset.name}
                                className="max-w-full max-h-full object-contain"
                                style={{ imageRendering: 'pixelated' }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/assets/frank.png'; // Fallback
                                }}
                              />
                            </div>
                          </button>
                          
                          {/* Tooltip with asset name */}
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs volter-font opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {asset.name}
                          </div>
                        </div>
                      ))}
                      
                      {assets[category.id]?.length === 0 && (
                        <div className="col-span-8 text-center py-8">
                          <div className="text-gray-400 text-6xl mb-4">{category.icon}</div>
                          <p className="text-gray-500 volter-font">
                            Nenhum {category.label.toLowerCase()} encontrado
                          </p>
                          <Button
                            onClick={handleSync}
                            disabled={syncing}
                            size="sm"
                            className="mt-4 volter-font"
                          >
                            {syncing ? 'Sincronizando...' : 'Sincronizar Assets'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        <div className="flex items-center justify-between text-sm text-slate-700 volter-font pt-3 border-t">
          <span>💡 Dica: Clique em qualquer asset para adicioná-lo à sua home</span>
          <div className="flex gap-2">
            <span>🎯 Máximo: 50 stickers por home</span>
            <Button onClick={onClose} variant="outline" className="volter-font">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
