
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useHomeAssets } from '@/hooks/useHomeAssets';
import { Loader2 } from 'lucide-react';

interface AssetSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssetSelect: (asset: any) => void;
  type: 'stickers' | 'backgrounds';
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  open,
  onOpenChange,
  onAssetSelect,
  type
}) => {
  const { assets, loading, error, getAssetUrl } = useHomeAssets();

  console.log('🎨 AssetSelector renderizado:', { type, loading, error, assets });

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="volter-font">Carregando Assets...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 volter-font">Carregando assets do Supabase...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="volter-font text-red-600">Erro ao Carregar Assets</DialogTitle>
          </DialogHeader>
          <p className="text-red-500 volter-font">{error}</p>
        </DialogContent>
      </Dialog>
    );
  }

  const handleAssetClick = (asset: any) => {
    console.log('🎯 Asset selecionado:', asset);
    const assetWithUrl = {
      ...asset,
      src: getAssetUrl(asset),
      url: getAssetUrl(asset)
    };
    onAssetSelect(assetWithUrl);
    onOpenChange(false);
  };

  if (type === 'stickers') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="volter-font">Escolher Stickers ({assets.Stickers.length} disponíveis)</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-6 gap-3 p-4">
            {assets.Stickers.map((asset) => (
              <Button
                key={asset.id}
                variant="outline"
                className="p-3 h-20 aspect-square hover:bg-blue-50 border-2 hover:border-blue-300"
                onClick={() => handleAssetClick(asset)}
                title={asset.name}
              >
                <img
                  src={getAssetUrl(asset)}
                  alt={asset.name}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    console.error(`❌ Erro ao carregar sticker: ${asset.name}`, asset);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </Button>
            ))}
          </div>
          
          {assets.Stickers.length === 0 && (
            <div className="text-center p-8 text-gray-500 volter-font">
              Nenhum sticker encontrado
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  if (type === 'backgrounds') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="volter-font">Escolher Papéis de Parede ({assets['Papel de Parede'].length} disponíveis)</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4 p-4">
            {assets['Papel de Parede'].map((asset) => (
              <Button
                key={asset.id}
                variant="outline"
                className="p-2 h-32 hover:bg-blue-50 border-2 hover:border-blue-300"
                onClick={() => handleAssetClick(asset)}
                title={asset.name}
              >
                <img
                  src={getAssetUrl(asset)}
                  alt={asset.name}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    console.error(`❌ Erro ao carregar background: ${asset.name}`, asset);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </Button>
            ))}
          </div>
          
          {assets['Papel de Parede'].length === 0 && (
            <div className="text-center p-8 text-gray-500 volter-font">
              Nenhum papel de parede encontrado
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};
