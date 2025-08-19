import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loadedCount, setLoadedCount] = useState(50);
  const [hasMore, setHasMore] = useState(true);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);

  const fetchAssets = async () => {
    if (!open) return;
    
    try {
      setLoading(true);
      console.log(`🔍 Buscando TODOS os ${type}s...`);
      
      let query = supabase
        .from('home_assets')
        .select('*')
        .eq('is_active', true);

      if (type === 'stickers') {
        // Buscar TODOS os stickers primeiro, sem limitação
        query = query.or('category.eq.Stickers,category.eq.Sticker,category.eq.Adesivos,category.eq.Decorations,category.eq.Decorative,category.eq.Characters,category.eq.Furniture,category.eq.Items,category.eq.Effects,category.eq.Outros,name.ilike.%sticker%,name.ilike.%decor%');
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`❌ Erro ao buscar ${type}s:`, error);
        setAllAssets([]);
        return;
      }

      console.log(`✅ TODOS ${type}s carregados: ${data?.length || 0}`);
      
      const assetsWithUrls = (data || []).map((asset) => ({
        ...asset,
        url: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`,
        src: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`
      }));

      setAllAssets(assetsWithUrls);
      filterAssetsByCategory(assetsWithUrls, selectedCategory);
    } catch (err) {
      console.error(`❌ Erro inesperado ao buscar ${type}s:`, err);
      setAllAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAssetsByCategory = (allAssets: Asset[], category: string) => {
    let filtered = allAssets;
    
    if (category !== 'all') {
      filtered = allAssets.filter(asset => 
        asset.category?.toLowerCase() === category.toLowerCase()
      );
    }
    
    console.log(`🔍 Filtrando categoria "${category}": ${filtered.length} itens`);
    
    // Mostrar apenas os primeiros loadedCount itens
    const paginatedAssets = filtered.slice(0, loadedCount);
    setAssets(paginatedAssets);
    setHasMore(filtered.length > loadedCount);
  };

  useEffect(() => {
    if (open && type) {
      fetchAssets();
    }
  }, [open, type]);

  useEffect(() => {
    if (allAssets.length > 0) {
      filterAssetsByCategory(allAssets, selectedCategory);
    }
  }, [selectedCategory, loadedCount, allAssets]);

  const handleAssetClick = (asset: Asset) => {
    onAssetSelect(asset);
    onOpenChange(false);
  };

  const loadMoreAssets = () => {
    console.log('📦 Carregando mais assets...');
    setLoadedCount(prev => prev + 50);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-volter text-xl">
            {title || (type === 'backgrounds' ? 'Selecionar Background' : '✨ Escolher Adesivo')}
          </DialogTitle>
        </DialogHeader>

        {type === 'stickers' && (
          <div className="space-y-2">
            <h4 className="text-sm font-volter">Categorias</h4>
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <div className="flex w-max space-x-2 p-4">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className="font-volter whitespace-nowrap"
                >
                  Todos ({allAssets.length})
                </Button>
                <Button
                  variant={selectedCategory === 'Outros' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('Outros')}
                  className="font-volter whitespace-nowrap"
                >
                  Outros ({allAssets.filter(a => a.category === 'Outros').length})
                </Button>
                <Button
                  variant={selectedCategory === 'Decorations' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('Decorations')}
                  className="font-volter whitespace-nowrap"
                >
                  Decorações ({allAssets.filter(a => a.category === 'Decorations').length})
                </Button>
                <Button
                  variant={selectedCategory === 'Characters' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('Characters')}
                  className="font-volter whitespace-nowrap"
                >
                  Personagens ({allAssets.filter(a => a.category === 'Characters').length})
                </Button>
                <Button
                  variant={selectedCategory === 'Furniture' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('Furniture')}
                  className="font-volter whitespace-nowrap"
                >
                  Móveis ({allAssets.filter(a => a.category === 'Furniture').length})
                </Button>
                <Button
                  variant={selectedCategory === 'Effects' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('Effects')}
                  className="font-volter whitespace-nowrap"
                >
                  Efeitos ({allAssets.filter(a => a.category === 'Effects').length})
                </Button>
              </div>
            </ScrollArea>
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 p-2">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-muted-foreground font-volter">Carregando adesivos...</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-muted-foreground font-volter">Nenhum adesivo encontrado</div>
              </div>
            ) : (
              <>
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => handleAssetClick(asset)}
                    className="cursor-pointer group relative overflow-hidden rounded-lg border bg-card hover:bg-accent transition-all hover:scale-105"
                  >
                    <div className="aspect-square p-2">
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-contain rounded group-hover:scale-110 transition-transform"
                        style={{ imageRendering: 'pixelated' }}
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2 border-t">
                      <div className="text-xs font-volter truncate">{asset.name}</div>
                      <div className="text-xs text-muted-foreground">{asset.category}</div>
                    </div>
                  </div>
                ))}
                
                {hasMore && !loading && (
                  <div className="col-span-full text-center py-4">
                    <Button 
                      variant="outline" 
                      onClick={loadMoreAssets}
                      className="font-volter"
                    >
                      📦 Carregar mais ({assets.length} de {allAssets.filter(a => selectedCategory === 'all' || a.category === selectedCategory).length})
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="font-volter"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};