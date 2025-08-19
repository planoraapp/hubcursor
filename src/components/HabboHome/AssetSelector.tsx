
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [displayedCount, setDisplayedCount] = useState(30);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchingComplete, setFetchingComplete] = useState(false);
  
  // Refs para scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fetch assets - removido 'loading' das dependências para evitar loop
  const fetchAssets = useCallback(async () => {
    if (fetchingComplete) return;
    
    try {
      setLoading(true);
      console.log(`🔍 Buscando ${type}s...`);
      
      let query = supabase
        .from('home_assets')
        .select('*')
        .eq('is_active', true);

      // Para stickers: excluir papel de parede
      if (type === 'stickers') {
        query = query.not('category', 'eq', 'Papel de Parede');
      } else {
        // Para backgrounds: só papel de parede ou backgrounds específicos
        query = query.like('file_path', '%bg_%');
      }
      
      const { data, error } = await query
        .order('name', { ascending: true })
        .limit(1000);

      if (error) {
        console.error(`❌ Erro ao buscar ${type}s:`, error);
        return;
      }

      console.log(`✅ ${type}s carregados:`, data?.length || 0);
      
      const assetsWithUrls = (data || []).map((asset) => ({
        ...asset,
        url: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`,
        src: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`
      }));

      setAllAssets(assetsWithUrls);
      setDisplayedCount(30);
      setFetchingComplete(true);
      
    } catch (err) {
      console.error(`❌ Erro inesperado ao buscar ${type}s:`, err);
    } finally {
      setLoading(false);
    }
  }, [type, fetchingComplete]);

  // Assets filtrados e exibidos
  const { filteredAssets, displayedAssets, hasMore } = useMemo(() => {
    let filtered = allAssets;
    
    // Filtro por categoria (usando nomes corretos da base)
    if (selectedCategory !== 'all') {
      const categoryMap: Record<string, string[]> = {
        'animados': ['Animados'],
        'icones': ['Ícones'], 
        'mockups': ['Mockups'],
        'montaveis': ['Montáveis'],
        'outros': ['Stickers']
      };
      
      const validCategories = categoryMap[selectedCategory.toLowerCase()] || [selectedCategory];
      filtered = allAssets.filter(asset => {
        const assetCategory = asset.category || '';
        return validCategories.some(cat => assetCategory === cat);
      });
    }
    
    // Filtro por busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.name?.toLowerCase().includes(searchLower) ||
        asset.category?.toLowerCase().includes(searchLower)
      );
    }
    
    const displayed = filtered.slice(0, displayedCount);
    const hasMoreItems = displayed.length < filtered.length;
    
    return {
      filteredAssets: filtered,
      displayedAssets: displayed,
      hasMore: hasMoreItems
    };
  }, [allAssets, selectedCategory, searchTerm, displayedCount]);

  // Categorias disponíveis com contadores
  const availableCategories = useMemo(() => {
    const categories = new Map<string, number>();
    
    allAssets.forEach(asset => {
      const category = asset.category || 'outros';
      
      // Mapear para nomes amigáveis
      let friendlyName = 'outros';
      switch (category) {
        case 'Animados': friendlyName = 'animados'; break;
        case 'Ícones': friendlyName = 'icones'; break;
        case 'Mockups': friendlyName = 'mockups'; break;
        case 'Montáveis': friendlyName = 'montaveis'; break;
        case 'Stickers': friendlyName = 'outros'; break;
        default: friendlyName = 'outros'; break;
      }
      
      categories.set(friendlyName, (categories.get(friendlyName) || 0) + 1);
    });
    
    return categories;
  }, [allAssets]);

  // Carregar mais itens
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    // Simular delay para UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setDisplayedCount(prev => prev + 30);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore]);

  // Setup intersection observer para scroll infinito
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(sentinelRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loadMore, loading]);

  // Carregar assets quando modal abre
  useEffect(() => {
    if (open && !fetchingComplete) {
      setSelectedCategory('all');
      setSearchTerm('');
      setDisplayedCount(30);
      setFetchingComplete(false);
      fetchAssets();
    }
  }, [open, fetchAssets, fetchingComplete]);

  const handleAssetClick = useCallback((asset: Asset) => {
    console.log('🎯 Asset selecionado:', asset);
    onAssetSelect(asset);
    onOpenChange(false);
  }, [onAssetSelect, onOpenChange]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSearchTerm('');
    setDisplayedCount(30);
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
            <div className="flex gap-2 overflow-x-auto pb-2">
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
                  'animados': '🎬 Animados',
                  'icones': '🔰 Ícones', 
                  'mockups': '🖼️ Mockups',
                  'montaveis': '📌 Montáveis',
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
                    {categoryLabels[category] || category} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Container de Scroll Nativo */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto border rounded-lg bg-background"
          style={{ height: '60vh' }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 p-4">
            {loading && displayedAssets.length === 0 ? (
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
                
                {/* Elemento sentinela para scroll infinito */}
                {hasMore && (
                  <div ref={sentinelRef} className="col-span-full text-center py-4">
                    {isLoadingMore ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground font-volter">
                          Carregando mais...
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground font-volter">
                        📜 Role para carregar mais ({displayedAssets.length} de {filteredAssets.length})
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

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
