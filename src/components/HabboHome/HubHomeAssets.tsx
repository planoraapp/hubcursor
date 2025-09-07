import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHomeAssets, HomeAsset } from '@/hooks/useHomeAssets';

interface HubHomeAssetsProps {
  type: 'stickers' | 'widgets' | 'backgrounds';
  onSelect: (asset: any) => void;
  onClose: () => void;
}

export const HubHomeAssets: React.FC<HubHomeAssetsProps> = ({
  type,
  onSelect,
  onClose
}) => {
  console.log('🎯 [HubHomeAssets] Componente renderizado com tipo:', type);
  const { assets, loading, getAssetUrl } = useHomeAssets();
  const [displayAssets, setDisplayAssets] = useState<HomeAsset[]>([]);
  console.log('🎯 [HubHomeAssets] Assets carregados:', Object.keys(assets).map(key => `${key}: ${assets[key as keyof typeof assets].length}`));
  console.log('🎯 [HubHomeAssets] Loading:', loading);

  useEffect(() => {
    if (type === 'stickers') {
      // Para stickers, mostrar todas as categorias de stickers
      const stickerAssets = [
        ...assets['Stickers'],
        ...assets['Mockups'],
        ...assets['Montáveis'],
        ...assets['Ícones'],
        ...assets['Animados']
      ];
      setDisplayAssets(stickerAssets);
    } else if (type === 'widgets') {
      // Para widgets, mostrar apenas ícones (que são widgets)
      setDisplayAssets(assets['Ícones']);
    } else if (type === 'backgrounds') {
      // Para backgrounds, mostrar papel de parede
      setDisplayAssets(assets['Papel de Parede']);
    }
  }, [type, assets]);

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'Stickers': 'Stickers',
      'Mockups': 'Mockups',
      'Montáveis': 'Montáveis',
      'Ícones': 'Ícones',
      'Papel de Parede': 'Papel de Parede',
      'Animados': 'Animados'
    };
    return categories[category] || category;
  };

  const handleAssetSelect = (asset: HomeAsset) => {
    console.log('🎯 [HubHomeAssets] Asset clicado:', asset);
    console.log('🎯 [HubHomeAssets] Chamando onSelect...');
    
    // Converter HomeAsset para o formato esperado pelo onSelect
    const assetData = {
      id: asset.id,
      name: asset.name,
      src: getAssetUrl(asset),
      category: asset.category,
      type: type === 'stickers' ? 'sticker' : type === 'widgets' ? 'widget' : 'background'
    };
    
    onSelect(assetData);
    console.log('🎯 [HubHomeAssets] Chamando onClose...');
    onClose(); // Fecha o modal/dropdown automaticamente
    console.log('🎯 [HubHomeAssets] Asset selecionado com sucesso!');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 shadow-xl border-2 border-black">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 volter-font">Carregando assets...</p>
          </div>
        </div>
      </div>
    );
  }

  const categories = [...new Set(displayAssets.map(asset => asset.category))];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 shadow-xl border-2 border-black max-h-[80vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 volter-font">
            {type === 'stickers' && '✨ Stickers'}
            {type === 'widgets' && '📦 Widgets'}
            {type === 'backgrounds' && '🖼️ Backgrounds'}
          </h2>
          <Button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white volter-font"
          >
            ❌ Fechar
          </Button>
        </div>

        {categories.length > 0 ? (
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="volter-font">
                  {getCategoryName(category)}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category}>
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {displayAssets
                      .filter(asset => asset.category === category)
                      .map(asset => (
                        <Card
                          key={asset.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-gray-200 hover:border-blue-400"
                          onClick={() => handleAssetSelect(asset)}
                        >
                          <CardHeader className="p-3">
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                              <img
                                src={getAssetUrl(asset)}
                                alt={asset.name}
                                className="w-16 h-16 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/assets/home/widgets/icons/default.png';
                                }}
                              />
                            </div>
                            <CardTitle className="text-sm text-center volter-font">
                              {asset.name}
                            </CardTitle>
                          </CardHeader>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 volter-font">Nenhum asset encontrado para esta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
