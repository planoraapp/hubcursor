
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

  // PADRÕES DE NOMENCLATURA PADRONIZADA PARA BACKGROUNDS:
  // 
  // 🔄 BACKGROUNDS REPEAT (padrões/texturas que se repetem):
  // - bg_pattern_[referencia] - TODOS os backgrounds que se repetem (ex: bg_pattern_clouds, bg_pattern_cars, bg_pattern_color_01)
  // - bg_pattern_simple_[numero] - IDs numéricos simples (ex: bg_pattern_simple_17, bg_pattern_simple_28)
  // - bg_pattern_color_[numero] - cores sólidas (ex: bg_pattern_color_01, bg_pattern_color_15)
  // - bg_pattern_[material]_[tipo] - materiais/texturas (ex: bg_pattern_bathroom_tile, bg_pattern_submarine)
  // - bg_pattern_[tema]_[variante] - temas específicos (ex: bg_pattern_xmas_starsky, bg_pattern_email)
  // - bg_pattern_[animacao]_[nome] - animações (ex: bg_pattern_rain_animated, bg_pattern_bubble)
  // - bg_pattern_[pais]_[campanha] - campanhas internacionais (ex: bg_pattern_australia_campaign)
  //
  // 🖼️ BACKGROUNDS COVER (cenários únicos que cobrem toda a tela):
  // - bg_wall_[referencia] - TODOS os backgrounds únicos (ex: bg_wall_abril_diado, bg_wall_kingcorp)
  // - bg_wall_[evento]_[nome] - eventos especiais (ex: bg_wall_abril_diado)
  // - bg_wall_[tema]_[cenario] - cenários únicos (ex: bg_wall_scifi_space)
  // - bg_wall_[estilo]_[ambiente] - ambientes específicos (ex: bg_wall_kingcorp)

  // Lista completa de backgrounds que devem usar "repeat" (padrões/texturas)
  const REPEAT_BACKGROUNDS = [
    // IDs numéricos simples
    'bg_pattern_simple_17', 'bg_pattern_simple_28',
    
    // Padrões decorativos
    'bg_pattern_abstract1', 'bg_pattern_bobbaskulls1', 'bg_pattern_carpants', 
    'bg_pattern_cars', 'bg_pattern_clouds', 'bg_pattern_cloud',
    
    // Cores sólidas
    'bg_pattern_color_01', 'bg_pattern_color_04', 'bg_pattern_color_05', 'bg_pattern_color_07', 
    'bg_pattern_color_08', 'bg_pattern_color_09', 'bg_pattern_color_11', 'bg_pattern_color_15',
    
    // Materiais/texturas
    'bg_pattern_bathroom_tile', 'bg_pattern_submarine',
    
    // Temas específicos
    'bg_pattern_xmas_starsky', 'bg_pattern_email', 'bg_pattern_summer_german', 'bg_pattern_metal',
    
    // Animações
    'bg_pattern_rain_animated', 'bg_pattern_bubble',
    
    // Campanhas internacionais
    'bg_pattern_australia_campaign',
    
    // Padrões genéricos
    'bg_pattern_generic_purple', 'bg_pattern_home_4', 'bg_pattern_disco', 'bg_pattern_hotel',
    'bg_pattern_beach_bunny', 'bg_pattern_toolbar'
  ];

  // Lista de backgrounds especiais que devem usar "cover" (cenários únicos)
  const COVER_BACKGROUNDS = [
    // Eventos especiais
    'bg_wall_abril_diado',
    
    // Cenários corporativos
    'bg_wall_kingcorp',
    'bg_wall_openbeta',
    'bg_wall_awards',
    'bg_wall_bg35',
    
    // Cenários temáticos
    'bg_wall_scifi_space',
    'bg_wall_habbos_group'
  ];

  // Função para renomear nomes de wallpapers seguindo padrões estabelecidos
  const getDisplayName = (assetName: string): string => {
    // Backgrounds COVER - bg_wall_[nome]
    if (assetName.startsWith('bg_wall_')) {
      const wallName = assetName.replace('bg_wall_', '').replace(/_/g, ' ');
      return `Parede ${wallName.charAt(0).toUpperCase() + wallName.slice(1)}`;
    }
    
    // Backgrounds REPEAT - bg_pattern_[nome]
    if (assetName.startsWith('bg_pattern_')) {
      const patternName = assetName.replace('bg_pattern_', '').replace(/_/g, ' ');
      return `Padrão ${patternName.charAt(0).toUpperCase() + patternName.slice(1)}`;
    }
    
    // IDs numéricos simples - manter como estão
    if (/^\d+$/.test(assetName)) {
      return assetName;
    }
    
    // Padrões decorativos antigos - bg_pattern_[nome]
    if (assetName.startsWith('bg_pattern_')) {
      const patternName = assetName.replace('bg_pattern_', '');
      return `Padrão ${patternName.charAt(0).toUpperCase() + patternName.slice(1)}`;
    }
    
    // Cores sólidas antigas - bg_colour_[numero]
    if (assetName.startsWith('bg_colour_')) {
      const colorNum = assetName.replace('bg_colour_', '');
      return `Cor ${colorNum}`;
    }
    
    // Materiais/texturas antigas - bg_[material]_[tipo]
    if (assetName.startsWith('bg_') && !assetName.startsWith('bg_pattern_') && !assetName.startsWith('bg_colour_') && !assetName.startsWith('bg_wall_')) {
      const materialName = assetName.replace('bg_', '').replace(/_/g, ' ');
      return `Material ${materialName.charAt(0).toUpperCase() + materialName.slice(1)}`;
    }
    
    // Temas específicos antigos - [tema]_[tipo]_[variante]
    if (assetName.includes('_') && !assetName.startsWith('bg_')) {
      const parts = assetName.split('_');
      if (parts.length >= 2) {
        const theme = parts[0].toUpperCase();
        const type = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        return `${theme} ${type}`;
      }
    }
    
    // Animações antigas - [animacao]_[nome]
    if (assetName.startsWith('bg') && assetName.includes('animated')) {
      const animName = assetName.replace('bganimated_', '').replace(/_/g, ' ');
      return `Animação ${animName.charAt(0).toUpperCase() + animName.slice(1)}`;
    }
    
    // Campanhas internacionais antigas - [pais]_[campanha]_[versao]
    if (assetName.match(/^[A-Z]{2}_/)) {
      const parts = assetName.split('_');
      if (parts.length >= 3) {
        const country = parts[0];
        const campaign = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        return `${country} ${campaign}`;
      }
    }
    
    // Eventos especiais antigos - [evento]_[nome]
    if (assetName.includes('-') && assetName.length > 10) {
      const parts = assetName.split('-');
      if (parts.length >= 2) {
        const event = parts[0].toUpperCase();
        const name = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        return `${event} ${name}`;
      }
    }
    
    // Cenários únicos antigos - [tema]_[cenario]_[variante]
    if (assetName.includes('_') && assetName.length > 15) {
      const parts = assetName.split('_');
      if (parts.length >= 2) {
        const theme = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const scene = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        return `${theme} ${scene}`;
      }
    }
    
    // Ambientes específicos antigos - [estilo]_[ambiente]_[versao]
    if (assetName.includes('_') && assetName.length > 10) {
      const parts = assetName.split('_');
      if (parts.length >= 2) {
        const style = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const environment = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        return `${style} ${environment}`;
      }
    }
    
    // Nomes simples - capitalizar primeira letra
    return assetName.charAt(0).toUpperCase() + assetName.slice(1);
  };

  const handleImageSelect = (asset: Asset) => {
    console.log('🖼️ Imagem selecionada:', asset);
    
    // Função para detectar dimensões da imagem automaticamente
    const detectImageDimensions = (url: string): Promise<{width: number, height: number}> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
          // Fallback: tentar extrair dimensões do nome do arquivo
          const dimensionMatch = asset.name.match(/(\d+)x(\d+)/);
          if (dimensionMatch) {
            resolve({ 
              width: parseInt(dimensionMatch[1]), 
              height: parseInt(dimensionMatch[2]) 
            });
          } else {
            // Se não conseguir detectar, assumir que é pequeno (repeat)
            resolve({ width: 100, height: 100 });
          }
        };
        img.src = url;
      });
    };
    
    // Função para determinar tipo baseado nas dimensões
    const getBackgroundTypeByDimensions = (width: number, height: number, assetName: string) => {
      // Verificar primeiro se está na lista de backgrounds especiais
      if (COVER_BACKGROUNDS.includes(assetName)) {
        console.log(`🎯 Background especial detectado: ${assetName} -> cover`);
        return 'cover';
      }
      
      if (REPEAT_BACKGROUNDS.includes(assetName)) {
        console.log(`🎯 Background especial detectado: ${assetName} -> repeat`);
        return 'repeat';
      }
      
      // Imagens pequenas (padrões/texturas) devem usar repeat
      // Imagens grandes (cenários completos) devem usar cover
      
      // Limite: se a imagem for menor que 400x400, é um padrão pequeno
      const isSmallPattern = width < 400 && height < 400;
      
      // Se for muito pequena (menos de 200x200), definitivamente é repeat
      const isVerySmall = width < 200 && height < 200;
      
      // Se for grande (mais de 600x600), definitivamente é cover
      const isLarge = width > 600 || height > 600;
      
      // Razão de aspecto: imagens muito largas ou muito altas são cenários
      const aspectRatio = width / height;
      const isWideScene = aspectRatio > 2 || aspectRatio < 0.5;
      
      console.log(`📏 Dimensões detectadas: ${width}x${height}`, {
        isSmallPattern,
        isVerySmall,
        isLarge,
        isWideScene,
        aspectRatio: aspectRatio.toFixed(2)
      });
      
      // Lógica de decisão
      if (isVerySmall) return 'repeat';
      if (isLarge || isWideScene) return 'cover';
      if (isSmallPattern) return 'repeat';
      
      // Padrão: se não conseguir determinar, usar repeat para padrões pequenos
      return 'repeat';
    };
    
    // Detectar dimensões e determinar tipo
    detectImageDimensions(asset.url!).then(({ width, height }) => {
      const backgroundType = getBackgroundTypeByDimensions(width, height, asset.name);
      
      console.log(`📐 Tipo detectado por dimensões: ${backgroundType} para ${asset.name}`, {
        dimensions: `${width}x${height}`,
        name: asset.name,
        filePath: asset.file_path
      });
      
      onWallpaperSelect(backgroundType, asset.url!);
      onOpenChange(false);
    });
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
