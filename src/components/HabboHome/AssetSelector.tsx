
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Categories for stickers
  const stickerCategories = [
    { id: 'todos', label: 'Todos' },
    { id: 'mockup', label: 'Mockups' },
    { id: 'icons', label: 'Ícones' },
    { id: 'animated', label: 'Animados' },
    { id: 'decorative', label: 'Decorativos' }
  ];

  // Fetch assets from Supabase
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('home_assets')
        .select('*')
        .eq('category', type)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching assets:', error);
        return;
      }

      let filteredData = data || [];
      
      // Filter by category name patterns for stickers
      if (type === 'stickers' && selectedCategory !== 'todos') {
        filteredData = data?.filter(asset => {
          const name = asset.name.toLowerCase();
          switch(selectedCategory) {
            case 'mockup': return name.includes('mockup') || name.includes('mock');
            case 'icons': return name.includes('icon') || name.includes('ico');
            case 'animated': return name.includes('anim') || name.includes('gif');
            case 'decorative': return name.includes('decor') || name.includes('decoration');
            default: return true;
          }
        }) || [];
      }

      const assetsWithUrls = filteredData.map((asset) => ({
        ...asset,
        url: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`,
        src: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`
      }));

      setAssets(assetsWithUrls);
    } catch (error) {
      console.error('Error in fetchAssets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAssets();
    }
  }, [open, type, selectedCategory]);

  const handleAssetClick = (asset: Asset) => {
    onAssetSelect(asset);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="volter-font">
            {title || (type === 'backgrounds' ? 'Selecionar Background' : 'Selecionar Sticker')}
          </DialogTitle>
        </DialogHeader>

        {type === 'stickers' && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {stickerCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="text-muted-foreground">Carregando assets...</div>
              </div>
            ) : assets.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-muted-foreground">Nenhum asset encontrado</div>
              </div>
            ) : (
              assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => handleAssetClick(asset)}
                  className="cursor-pointer group relative overflow-hidden rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <div className="aspect-square p-2">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-contain rounded group-hover:scale-105 transition-transform"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div className="p-2 border-t">
                    <div className="text-xs font-medium truncate">{asset.name}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
