import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedCount, setDisplayedCount] = useState(50);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchAssets = async () => {
    if (!open) return;
    
    try {
      setLoading(true);
      console.log(`🔍 Buscando TODOS os ${type}s sem filtros limitantes...`);
      
      let query = supabase
        .from('home_assets')
        .select('*')
        .eq('is_active', true);

      if (type === 'stickers') {
        // Para stickers, buscar TODOS sem filtros complexos
        // Os buckets são: animated, icons, mockups, mountable, stickers
        console.log('🎯 Buscando todos os assets para stickers (sem filtros limitantes)');
      } else if (type === 'backgrounds') {
        query = query.like('file_path', '%bg_%');
      }
      
      const { data, error } = await query
        .order('name', { ascending: true })
        .limit(1000); // Limite alto para garantir que pegamos todos

      if (error) {
        console.error(`❌ Erro ao buscar ${type}s:`, error);
        setAllAssets([]);
        return;
      }

      console.log(`✅ TODOS ${type}s carregados: ${data?.length || 0}`);
      console.log('📊 Amostra de categorias encontradas:', [...new Set(data?.map(d => d.category)?.filter(Boolean))]);
      
      const assetsWithUrls = (data || []).map((asset) => ({
        ...asset,
        url: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`,
        src: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`
      }));

      setAllAssets(assetsWithUrls);
      filterAndDisplayAssets(assetsWithUrls, selectedCategory, searchTerm);
    } catch (err) {
      console.error(`❌ Erro inesperado ao buscar ${type}s:`, err);
      setAllAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndDisplayAssets = (allAssets: Asset[], category: string, search: string) => {
    let filtered = allAssets;
    
    // Filtro por categoria
    if (category !== 'all') {
      // Mapear categorias corretas dos buckets do Supabase
      const categoryMap: Record<string, string[]> = {
        'animated': ['animated'],
        'icons': ['icons', 'icon'],
        'mockups': ['mockups', 'mockup'],
        'mountable': ['mountable', 'mount'],
        'outros': ['stickers', 'sticker', 'outros'] // Renomear "stickers" para "outros"
      };
      
      const validCategories = categoryMap[category.toLowerCase()] || [category];
      filtered = allAssets.filter(asset => {
        const assetCategory = asset.category?.toLowerCase() || '';
        const assetPath = asset.file_path?.toLowerCase() || '';
        
        // Verificar categoria OU path do arquivo para maior compatibilidade
        return validCategories.some(cat => 
          assetCategory.includes(cat) || assetPath.includes(`/${cat}/`) || assetPath.includes(`${cat}_`)
        );
      });
    }
    
    // Filtro por busca
    if (search.trim()) {
      filtered = filtered.filter(asset =>
        asset.name?.toLowerCase().includes(search.toLowerCase()) ||
        asset.category?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    console.log(`🔍 Filtrando categoria "${category}" + busca "${search}": ${filtered.length} itens`);
    
    // Mostrar apenas os primeiros displayedCount itens (scroll infinito)
    const paginated = filtered.slice(0, displayedCount);
    setAssets(paginated);
    
    return filtered.length; // Retorna o total para verificação
  };

  // Carregar assets quando modal abre
  useEffect(() => {
    if (open && type) {
      setSelectedCategory('all');
      setSearchTerm('');
      setDisplayedCount(50);
      fetchAssets();
    }
  }, [open, type]);

  // Filtrar e exibir assets quando dados ou filtros mudam  
  useEffect(() => {
    if (allAssets.length > 0) {
      filterAndDisplayAssets(allAssets, selectedCategory, searchTerm);
    }
  }, [selectedCategory, searchTerm, displayedCount, allAssets]);

  // Scroll infinito
  const handleScroll = useCallback(() => {
    const scrollDiv = scrollRef.current;
    if (!scrollDiv || loadingMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollDiv;
    
    // Se chegou a 90% do fim, carregar mais
    if (scrollTop + clientHeight >= scrollHeight * 0.9) {
      const totalFiltered = filterAndDisplayAssets(allAssets, selectedCategory, searchTerm);
      
      if (displayedCount < totalFiltered) {
        setLoadingMore(true);
        setTimeout(() => {
          setDisplayedCount(prev => prev + 50);
          setLoadingMore(false);
        }, 300);
      }
    }
  }, [allAssets, selectedCategory, searchTerm, displayedCount, loadingMore]);

  useEffect(() => {
    const scrollDiv = scrollRef.current;
    if (scrollDiv) {
      scrollDiv.addEventListener('scroll', handleScroll);
      return () => scrollDiv.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleAssetClick = (asset: Asset) => {
    console.log('🎯 Asset selecionado:', asset);
    onAssetSelect(asset);
    onOpenChange(false);
  };

  // Obter categorias reais dos dados carregados
  const getAvailableCategories = () => {
    const categories = new Map<string, number>();
    
    allAssets.forEach(asset => {
      const path = asset.file_path?.toLowerCase() || '';
      
      // Detectar categoria pelo path do arquivo (mais confiável)
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
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
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
                {Array.from(getAvailableCategories()).map(([category, count]) => {
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

        <ScrollArea className="flex-1 min-h-0 max-h-[60vh]" ref={scrollRef}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 p-2">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-muted-foreground font-volter">Carregando adesivos...</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-muted-foreground font-volter">
                  {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Nenhum adesivo encontrado'}
                </div>
                {searchTerm && (
                  <Button 
                    variant="link" 
                    onClick={() => setSearchTerm('')}
                    className="mt-2 font-volter"
                  >
                    Limpar busca
                  </Button>
                )}
              </div>
            ) : (
              <>
                {assets.map((asset) => (
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
                
                {loadingMore && (
                  <div className="col-span-full text-center py-4">
                    <Loader2 className="animate-spin h-6 w-6 mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground font-volter mt-2">
                      Carregando mais...
                    </p>
                  </div>
                )}
                
                {displayedCount < filterAndDisplayAssets(allAssets, selectedCategory, searchTerm) && !loadingMore && (
                  <div className="col-span-full text-center py-4">
                    <p className="text-xs text-muted-foreground font-volter">
                      📜 Scroll para carregar mais ({displayedCount} de {filterAndDisplayAssets(allAssets, selectedCategory, searchTerm)})
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