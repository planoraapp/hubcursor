
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Asset {
  id: string;
  name: string;
  file_path: string;
  category: string;
  bucket_name: string;
  url?: string;
  src?: string;
}

interface AssetSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssetSelect: (asset: Asset) => void;
  type: 'backgrounds' | 'stickers';
  title?: string;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  open,
  onOpenChange,
  onAssetSelect,
  type,
  title
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  const getDisplayTitle = () => {
    if (title) return title;
    return type === 'backgrounds' ? 'Backgrounds' : 'Stickers';
  };

  const getCategoryFilter = () => {
    if (type === 'backgrounds') {
      return ['backgrounds', 'Papel de Parede', 'wallpapers'];
    }
    return ['stickers', 'Stickers', 'decorations'];
  };

  const loadAssets = async () => {
    if (!open) return;
    
    setLoading(true);
    try {
      console.log(`🔍 Carregando assets do tipo: ${type}`);
      
      const categories = getCategoryFilter();
      
      const { data, error } = await supabase
        .from('home_assets')
        .select('*')
        .in('category', categories)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Erro ao carregar assets:', error);
        return;
      }

      console.log(`✅ Assets carregados:`, data);

      const assetsWithUrls = data?.map(asset => ({
        ...asset,
        url: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`,
        src: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`
      })) || [];

      setAssets(assetsWithUrls);
    } catch (error) {
      console.error('❌ Erro ao carregar assets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [open, type]);

  const handleAssetClick = (asset: Asset) => {
    console.log(`🎯 Asset selecionado:`, asset);
    onAssetSelect(asset);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="volter-font text-xl">
            {getDisplayTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 volter-font">Carregando {type}...</span>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 volter-font">
                Nenhum {type === 'backgrounds' ? 'papel de parede' : 'sticker'} encontrado
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="group cursor-pointer border-2 border-gray-200 rounded-lg p-2 hover:border-blue-500 transition-colors"
                  onClick={() => handleAssetClick(asset)}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/frank.png';
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs volter-font text-gray-700 truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <Badge variant="outline" className="text-xs volter-font mt-1">
                      {asset.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="volter-font">
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
