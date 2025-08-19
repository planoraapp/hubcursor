
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

// Cores disponíveis para o slider
const AVAILABLE_COLORS = [
  { name: 'Azul Claro', value: '#c7d2dc' },
  { name: 'Rosa Suave', value: 'hsl(350 100% 88%)' },    
  { name: 'Azul Céu', value: 'hsl(200 100% 85%)' },     
  { name: 'Verde Menta', value: 'hsl(160 100% 85%)' },  
  { name: 'Amarelo Sol', value: 'hsl(50 100% 85%)' },   
  { name: 'Roxo Lavanda', value: 'hsl(280 100% 88%)' }, 
  { name: 'Laranja Pêssego', value: 'hsl(30 100% 85%)' }, 
  { name: 'Cinza Neutro', value: 'hsl(220 20% 88%)' },
  { name: 'Branco', value: '#ffffff' },
  { name: 'Preto', value: '#000000' },
  { name: 'Vermelho', value: '#ff6b6b' },
  { name: 'Verde', value: '#51cf66' },
  { name: 'Azul', value: '#339af0' },
  { name: 'Roxo', value: '#845ef7' }
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
  onWallpaperSelect: (type: 'color' | 'image' | 'repeat' | 'cover', value: string) => void;
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
      console.log('🔍 Buscando imagens de fundo no bucket home-assets...');
      
      // Buscar backgrounds do bucket home-assets com category 'Papel de Parede'
      const { data, error } = await supabase
        .from('home_assets')
        .select('*')
        .eq('bucket_name', 'home-assets')
        .eq('category', 'Papel de Parede')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Erro ao buscar backgrounds:', error);
        setBackgroundImages([]);
        return;
      }

      console.log(`✅ ${data?.length || 0} backgrounds encontrados no banco`);

      // Construir URLs para o bucket home-assets
      const assetsWithUrls = (data || []).map((asset) => {
        const baseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public';
        const url = `${baseUrl}/home-assets/${asset.file_path}`;
        
        console.log(`📦 Asset: ${asset.name} -> URL: ${url}`);
        
        return {
          ...asset,
          url
        };
      });

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
    console.log('🎨 Cor selecionada:', color);
    onWallpaperSelect('color', color);
    onOpenChange(false);
  };

  const handleImageSelect = (asset: Asset) => {
    console.log('🖼️ Imagem selecionada:', asset);
    
    // Detectar se é bg_colour (pequeno, para repeat) ou imagem grande (para cover)
    const isSmallBg = asset.name.toLowerCase().includes('bg_colour') || 
                     asset.name.toLowerCase().includes('small') ||
                     asset.name.toLowerCase().includes('tile') ||
                     asset.file_path.includes('bg_colour');
    
    const backgroundType = isSmallBg ? 'repeat' : 'cover';
    console.log(`📐 Tipo detectado: ${backgroundType} para ${asset.name}`);
    
    onWallpaperSelect(backgroundType, asset.url!);
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

        {/* Layout unificado: cores à esquerda, imagens à direita */}
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Seção de cores - vertical à esquerda */}
          <div className="w-64 flex-shrink-0">
            <h3 className="text-lg font-volter mb-4">Cores Sólidas</h3>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg border-2 border-transparent hover:border-primary transition-all hover:scale-[1.02] bg-card"
                    title={color.name}
                  >
                    <div 
                      className="w-12 h-12 rounded-md border-2 border-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="font-volter text-sm text-left">{color.name}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Seção de imagens - grid à direita (maior) */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="text-lg font-volter mb-4">
              Imagens de Fundo ({backgroundImages.length})
            </h3>
            
            <ScrollArea className="flex-1 min-h-0">
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 p-2">
                {loading ? (
                  <div className="col-span-full text-center py-8">
                    <div className="text-muted-foreground">Carregando imagens...</div>
                  </div>
                ) : backgroundImages.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <div className="text-muted-foreground">
                      Nenhuma imagem encontrada. Verifique o bucket home-assets.
                    </div>
                  </div>
                ) : (
                  backgroundImages.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleImageSelect(asset)}
                      className="cursor-pointer group relative overflow-hidden rounded-lg border bg-card hover:bg-accent transition-colors aspect-square"
                    >
                      <div className="w-full h-full p-2">
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => {
                            console.error('❌ Falha ao carregar imagem:', asset.url);
                            const target = e.target as HTMLImageElement;
                            target.style.backgroundColor = '#f0f0f0';
                            target.alt = 'Erro ao carregar';
                          }}
                          onLoad={() => {
                            console.log('✅ Imagem carregada:', asset.name);
                          }}
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1">
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
