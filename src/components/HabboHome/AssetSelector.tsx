
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search } from 'lucide-react';

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
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedCount, setDisplayedCount] = useState(50);
  const [hasMoreToLoad, setHasMoreToLoad] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<boolean>(false);

  // Fetch assets from Supabase
  const fetchAssets = useCallback(async () => {
    if (!open || loadingRef.current) return;
    
    try {
      setLoading(true);
      loadingRef.current = true;
      console.log(`🔍 Buscando TODOS os ${type}s...`);
      
      let query = supabase
        .from('home_assets')
        .select('*')
        .eq('is_active', true);

      if (type === 'backgrounds') {
        query = query.like('file_path', '%bg_%');
      }
      
      const { data, error } = await query
        .order('name', { ascending: true })
        .limit(1000);

      if (error) {
        console.error(`❌ Erro ao buscar ${type}s:`, error);
        return;
      }

      console.log(`✅ Assets carregados: ${data?.length || 0}`);
      
      const assetsWithUrls = (data || []).map((asset) => ({
        ...asset,
        url: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`,
        src: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`
      }));

      setAllAssets(assetsWithUrls);
      setDisplayedCount(50);
      
    } catch (err) {
      console.error(`❌ Erro inesperado ao buscar ${type}s:`, err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [open, type]);

  // Filter and paginate assets
  const { filteredAssets, displayedAssets, totalCount } = useMemo(() => {
    let filtered = allAssets;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      const categoryMap: Record<string, string[]> = {
        'animated': ['animated'],
        'icons': ['icons', 'icon'],
        'mockups': ['mockups', 'mockup'],
        'mountable': ['mountable', 'mount'],
        'outros': ['stickers', 'sticker']
      };
      
      const validCategories = categoryMap[selectedCategory.toLowerCase()] || [selectedCategory];
      filtered = allAssets.filter(asset => {
        const assetCategory = asset.category?.toLowerCase() || '';
        const assetPath = asset.file_path?.toLowerCase() || '';
        
        return validCategories.some(cat => 
          assetCategory.includes(cat) || 
          assetPath.includes(`/${cat}/`) || 
          assetPath.includes(`${cat}_`)
        );
      });
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(asset =>
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const displayed = filtered.slice(0, displayedCount);
    
    return {
      filteredAssets: filtered,
      displayedAssets: displayed,
      totalCount: filtered.length
    };
  }, [allAssets, selectedCategory, searchTerm, displayedCount]);

  // Update hasMoreToLoad when filtered assets change
  useEffect(() => {
    setHasMoreToLoad(displayedAssets.length < totalCount);
  }, [displayedAssets.length, totalCount]);

  // Get available categories with counts
  const availableCategories = useMemo(() => {
    const categories = new Map<string, number>();
    
    allAssets.forEach(asset => {
      const path = asset.file_path?.toLowerCase() || '';
      
      if (path.includes('/animated/') || path.includes('anim')) {
        categories.set('animated', (categories.get('animated') || 0) + 1);
      } else if (path.includes('/icons/') || path.includes('icon')) {
        categories.set('icons', (categories.get('icons') || 0) + 1);
      } else if (path.includes('/mockups/') || path.includes('mockup')) {
        categories.set('mockups', (categories.get('mockups') || 0) + 1);
      } else if (path.includes('/mountable/') || path.includes('mount')) {
        categories.set('mountable', (categories.get('mountable') || 0) + 1);
      } else if (path.includes('/stickers/') || path.includes('sticker')) {
        categories.set('outros', (categories.get('outros') || 0) + 1);
      }
    });
    
    return categories;
  }, [allAssets]);

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    const scrollDiv = scrollRef.current;
    if (!scrollDiv || !hasMoreToLoad || loadingRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollDiv;
    
    if (scrollTop + clientHeight >= scrollHeight * 0.9) {
      setDisplayedCount(prev => prev + 50);
    }
  }, [hasMoreToLoad]);

  // Load assets when modal opens
  useEffect(() => {
    if (open && type) {
      setSelectedCategory('all');
      setSearchTerm('');
      setDisplayedCount(50);
      fetchAssets();
    }
  }, [open, type, fetchAssets]);

  // Setup scroll listener
  useEffect(() => {
    const scrollDiv = scrollRef.current;
    if (scrollDiv) {
      scrollDiv.addEventListener('scroll', handleScroll);
      return () => scrollDiv.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleAssetClick = useCallback((asset: Asset) => {
    console.log('🎯 Asset selecionado:', asset);
    onAssetSelect(asset);
    onOpenChange(false);
  }, [onAssetSelect, onOpenChange]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSearchTerm('');
    setDisplayedCount(50);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-volter text-xl">
            {title || (type === 'backgrounds' ? 'Selecionar Background' : '✨ Escolher Adesivo')}
          </DialogTitle>
        </DialogHeader>

        {type === 'stickers' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar adesivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-volter"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="font-volter whitespace-nowrap"
              >
                🔄 Limpar
              </Button>
            </div>
            
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
                {Array.from(availableCategories).map(([category, count]) => {
                  const categoryLabels: Record<string, string> = {
                    'animated': '🎬 Animados',
                    'icons': '🔰 Ícones', 
                    'mockups': '🖼️ Mockups',
                    'mountable': '📌 Montáveis',
                    'outros': '✨ Outros'
                  };
                  
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="font-volter whitespace-nowrap"
                    >
                      {categoryLabels[category]} ({count})
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 p-2">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-muted-foreground font-volter">Carregando adesivos...</p>
              </div>
            ) : displayedAssets.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-muted-foreground font-volter">
                  {searchTerm || selectedCategory !== 'all' 
                    ? `Nenhum resultado encontrado` 
                    : 'Nenhum adesivo encontrado'
                  }
                </div>
                {(searchTerm || selectedCategory !== 'all') && (
                  <Button 
                    variant="link" 
                    onClick={handleClearFilters}
                    className="mt-2 font-volter"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <>
                {displayedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => handleAssetClick(asset)}
                    className="cursor-pointer group relative overflow-hidden rounded-lg border bg-card hover:bg-accent transition-all hover:scale-105 active:scale-95"
                  >
                    <div className="aspect-square p-2">
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-contain rounded group-hover:scale-110 transition-transform"
                        style={{ imageRendering: 'pixelated' }}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="p-2 border-t">
                      <div className="text-xs font-volter truncate" title={asset.name}>
                        {asset.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {asset.category || 'Sem categoria'}
                      </div>
                    </div>
                  </div>
                ))}
                
                {hasMoreToLoad && (
                  <div className="col-span-full text-center py-4">
                    <p className="text-xs text-muted-foreground font-volter">
                      📜 Role para carregar mais ({displayedAssets.length} de {totalCount})
                    </p>
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
