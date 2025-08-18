
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface Asset {
  id: string;
  name: string;
  url: string;
  category: string;
  file_path: string;
  bucket_name: string;
}

interface AssetSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssetSelect: (asset: Asset) => void;
  type: 'backgrounds' | 'stickers';
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  open,
  onOpenChange,
  onAssetSelect,
  type
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadAssets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('home_assets')
        .select('*');

      if (type === 'backgrounds') {
        query = query.eq('category', 'Backgrounds');
      } else {
        query = query.neq('category', 'Backgrounds');
      }

      const { data, error } = await query;

      if (!error && data) {
        const formattedAssets = data.map(asset => {
          // Generate the public URL using Supabase storage
          const { data: urlData } = supabase.storage
            .from(asset.bucket_name)
            .getPublicUrl(asset.file_path);
          
          return {
            id: asset.id || asset.name,
            name: asset.name,
            url: urlData.publicUrl,
            category: asset.category,
            file_path: asset.file_path,
            bucket_name: asset.bucket_name
          };
        });
        setAssets(formattedAssets);
      }
    } catch (error) {
      console.error('Erro ao carregar assets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAssets();
    }
  }, [open, type]);

  const categories = [...new Set(assets.map(asset => asset.category))];
  const filteredAssets = selectedCategory === 'all' 
    ? assets 
    : assets.filter(asset => asset.category === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="volter-font">
            {type === 'backgrounds' ? '🖼️ Papéis de Parede' : '🎯 Stickers'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid-cols-4 volter-font">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {categories.slice(0, 3).map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-4">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-gray-500 volter-font">Carregando...</div>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-4">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="relative group cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors"
                      onClick={() => {
                        onAssetSelect(asset);
                        onOpenChange(false);
                      }}
                    >
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-20 object-cover"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/frank.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="volter-font truncate">{asset.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
