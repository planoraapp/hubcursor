import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

// 7 Pastel colors matching design system
const PASTEL_COLORS = [
  { name: 'Rosa Suave', value: 'hsl(350 100% 88%)' },    
  { name: 'Azul Céu', value: 'hsl(200 100% 85%)' },     
  { name: 'Verde Menta', value: 'hsl(160 100% 85%)' },  
  { name: 'Amarelo Sol', value: 'hsl(50 100% 85%)' },   
  { name: 'Roxo Lavanda', value: 'hsl(280 100% 88%)' }, 
  { name: 'Laranja Pêssego', value: 'hsl(30 100% 85%)' }, 
  { name: 'Cinza Neutro', value: 'hsl(220 20% 88%)' }   
];

interface Asset {
  id: string;
  name: string;
  file_path: string;
  category: string;
  bucket_name: string;
  url?: string;
}

interface WallpaperSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWallpaperSelect: (type: 'color' | 'image', value: string) => void;
}

export const WallpaperSelector: React.FC<WallpaperSelectorProps> = ({
  open,
  onOpenChange,
  onWallpaperSelect
}) => {
  const [backgroundImages, setBackgroundImages] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBackgroundImages = async () => {
    if (!open) return;
    
    try {
      setLoading(true);
      console.log('🔍 Buscando imagens de fundo...');
      
      const { data, error } = await supabase
        .from('home_assets')
        .select('*')
        .eq('is_active', true)
        .or('category.eq.Background,category.eq.Backgrounds,category.eq.Papel de Parede,name.ilike.%bg%,name.ilike.%background%,name.ilike.%wallpaper%');

      if (error) {
        console.error('❌ Erro ao buscar backgrounds:', error);
        setBackgroundImages([]);
        return;
      }

      console.log(`✅ Backgrounds encontrados (${data?.length || 0})`);

      const assetsWithUrls = (data || []).map((asset) => ({
        ...asset,
        url: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/${asset.file_path}`
      }));

      setBackgroundImages(assetsWithUrls);
    } catch (err) {
      console.error('❌ Erro inesperado ao buscar backgrounds:', err);
      setBackgroundImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchBackgroundImages();
    }
  }, [open]);

  const handleColorSelect = (color: string) => {
    onWallpaperSelect('color', color);
    onOpenChange(false);
  };

  const handleImageSelect = (asset: Asset) => {
    onWallpaperSelect('image', asset.url!);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-volter text-xl">
            🖼️ Escolher Papel de Parede
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          
          {/* Colors Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-volter">Cores Pastéis</h3>
            <div className="grid grid-cols-1 gap-3">
              {PASTEL_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  className="flex items-center gap-4 p-3 rounded-lg border-2 border-transparent hover:border-primary transition-all hover:scale-105 bg-card"
                >
                  <div 
                    className="w-16 h-12 rounded-md border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="font-volter text-sm">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4 flex flex-col min-h-0">
            <h3 className="text-lg font-volter">Imagens de Fundo</h3>
            
            <ScrollArea className="flex-1 min-h-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
                {loading ? (
                  <div className="col-span-full text-center py-8">
                    <div className="text-muted-foreground">Carregando imagens...</div>
                  </div>
                ) : backgroundImages.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <div className="text-muted-foreground">Nenhuma imagem encontrada</div>
                  </div>
                ) : (
                  backgroundImages.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleImageSelect(asset)}
                      className="cursor-pointer group relative overflow-hidden rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <div className="aspect-video p-2">
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <div className="p-2 border-t">
                        <div className="text-xs font-medium truncate font-volter">{asset.name}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
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