import React, { useState, useEffect } from 'react';
import { HomeWidget } from './HomeWidget';
import { HomeSticker } from './HomeSticker';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit3, Save, X, Palette, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useHomeAssets } from '@/hooks/useHomeAssets';

interface Widget {
  id: string;
  widget_type: string;
  x: number;
  y: number;
  z_index: number;
  width: number;
  height: number;
  is_visible: boolean;
  config?: any;
}

interface Sticker {
  id: string;
  sticker_id: string;
  x: number;
  y: number;
  z_index: number;
  scale: number;
  rotation: number;
  sticker_src: string;
  category: string;
}

interface Background {
  background_type: 'color' | 'cover' | 'repeat';
  background_value: string;
}

interface HabboData {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  motto: string;
  figure_string: string;
  is_online: boolean;
  memberSince?: string;
}

interface HomeCanvasProps {
  widgets: Widget[];
  stickers: Sticker[];
  background: Background;
  habboData: HabboData;
  guestbook: any[];
  isEditMode: boolean;
  isOwner: boolean;
  onWidgetPositionChange: (widgetId: string, x: number, y: number) => void;
  onStickerPositionChange: (stickerId: string, x: number, y: number) => void;
  onStickerRemove: (stickerId: string) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onBackgroundChange?: (type: 'color' | 'cover' | 'repeat', value: string) => void;
  onStickerAdd?: (stickerType: string) => void;
  onWidgetAdd?: (widgetType: string) => void;
  onSave?: () => void;
  onExitEditMode?: () => void;
  onEnterEditMode?: () => void;
  showBackgroundPicker?: boolean;
  setShowBackgroundPicker?: (show: boolean) => void;
  showWidgetPicker?: boolean;
  setShowWidgetPicker?: (show: boolean) => void;
  showStickerPicker?: boolean;
  setShowStickerPicker?: (show: boolean) => void;
}

export const HomeCanvas: React.FC<HomeCanvasProps> = ({
  widgets,
  stickers,
  background,
  habboData,
  guestbook,
  isEditMode,
  isOwner,
  onWidgetPositionChange,
  onStickerPositionChange,
  onStickerRemove,
  onWidgetRemove,
  onBackgroundChange,
  onStickerAdd,
  onWidgetAdd,
  onSave,
  onExitEditMode,
  onEnterEditMode,
  showBackgroundPicker = false,
  setShowBackgroundPicker,
  showWidgetPicker = false,
  setShowWidgetPicker,
  showStickerPicker = false,
  setShowStickerPicker,
}) => {
  const isMobile = useIsMobile();
  const [draggedItem, setDraggedItem] = useState<{ type: 'widget' | 'sticker', id: string } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Estados para dropdown integrado
  const [activeSection, setActiveSection] = useState<'background' | 'widgets' | 'stickers' | null>(null);
  const [backgroundImages, setBackgroundImages] = useState<any[]>([]);
  const [loadingBackgrounds, setLoadingBackgrounds] = useState(false);
  const [selectedStickerCategory, setSelectedStickerCategory] = useState<'Stickers' | 'Mockups' | 'Montáveis' | 'Ícones' | 'Animados'>('Stickers');
  const { assets: stickerAssets, loading: loadingStickers, getAssetUrl } = useHomeAssets();

  // Carregar backgrounds quando a seção for ativada
  useEffect(() => {
    if (activeSection === 'background' && backgroundImages.length === 0) {
      loadBackgroundImages();
    }
  }, [activeSection]);

  const loadBackgroundImages = async () => {
    try {
      setLoadingBackgrounds(true);
      console.log('🔍 Carregando backgrounds do Supabase...');
      
      const { data, error } = await supabase
        .from('home_assets')
        .select('*')
        .eq('bucket_name', 'home-assets')
        .eq('category', 'Papel de Parede')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Erro ao carregar backgrounds:', error);
        return;
      }

      const assetsWithUrls = (data || []).map((asset) => {
        const baseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public';
        const url = `${baseUrl}/home-assets/${asset.file_path}`;
        return { ...asset, url };
      });

      // Filtrar backgrounds problemáticos
      const filteredAssets = assetsWithUrls.filter((asset) => {
        const fileName = asset.file_path.split('/').pop()?.split('.')[0] || '';
        return fileName !== 'ABRIL-DIADOJORNALISTA';
      });

      setBackgroundImages(filteredAssets);
      console.log(`✅ ${filteredAssets.length} backgrounds carregados (${assetsWithUrls.length - filteredAssets.length} filtrados)`);
    } catch (error) {
      console.error('❌ Erro ao carregar backgrounds:', error);
    } finally {
      setLoadingBackgrounds(false);
    }
  };

  const handleSectionToggle = (section: 'background' | 'widgets' | 'stickers') => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Função para detectar tipo de background baseado nas dimensões
  const getBackgroundType = (imageUrl: string): Promise<'cover' | 'repeat'> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const canvasAspectRatio = 1000 / 1400; // Canvas dimensions (~0.71)
        
        // Extrair nome do arquivo da URL
        const fileName = imageUrl.split('/').pop()?.split('.')[0] || '';
        
        console.log(`🔍 Analisando imagem: ${imageUrl}`);
        console.log(`📁 Nome do arquivo: ${fileName}`);
        console.log(`📐 Dimensões: ${img.width}x${img.height}`);
        console.log(`📊 Aspect Ratio: ${aspectRatio.toFixed(2)}`);
        console.log(`🎯 Canvas Ratio: ${canvasAspectRatio.toFixed(2)}`);
        
        // Lista de backgrounds que devem ser COVER (cenários únicos)
        const COVER_BACKGROUNDS = [
          // Cenários específicos mencionados
          'bgdisco', 'bghotel', 'groupbg_scifi_space2',
          'wallpaper_BeachBunny', 'toolbar_bg2', 'openbeta_bg', 
          'kingcorp_928x1360', 'habbos_group',
          // Cenários com prefixo bg_wall_
          'bg_wall_abril_diado', 'bg_wall_kingcorp', 'bg_wall_openbeta',
          'bg_wall_awards', 'bg_wall_bg35', 'bg_wall_scifi_space', 'bg_wall_habbos_group',
          // Outros cenários únicos que devem ser COVER
          'bg_wall_space', 'bg_wall_corp', 'bg_wall_habbo', 'bg_wall_group',
          'bg_wall_scifi', 'bg_wall_space2', 'bg_wall_hotel', 'bg_wall_disco',
          // Cenários com nomes específicos
          'beachbunny', 'toolbar', 'openbeta', 'kingcorp', 'habbos'
        ];
        
        // Lista de backgrounds que devem ser REPEAT (padrões/texturas)
        const REPEAT_BACKGROUNDS = [
          'bg_pattern_simple_17', 'bg_pattern_simple_28', 'bg_pattern_abstract1',
          'bg_pattern_bobbaskulls1', 'bg_pattern_carpants', 'bg_pattern_cars',
          'bg_pattern_clouds', 'bg_pattern_cloud', 'bg_pattern_color_01'
        ];
        
        // Verificar se está na lista específica de COVER
        if (COVER_BACKGROUNDS.includes(fileName)) {
          console.log(`✅ Aplicando COVER - Lista específica de cenários únicos`);
          resolve('cover');
        }
        // Verificar se está na lista específica de REPEAT
        else if (REPEAT_BACKGROUNDS.includes(fileName)) {
          console.log(`✅ Aplicando REPEAT - Lista específica de padrões`);
          resolve('repeat');
        }
        // Lógica baseada em dimensões para casos não especificados
        else {
          const isSmallPattern = img.width < 200 || img.height < 200;
          const isExtremeRatio = aspectRatio > 2.0 || aspectRatio < 0.5;
          const isSquareish = aspectRatio >= 0.8 && aspectRatio <= 1.25;
          
          // Se é um padrão pequeno OU tem proporção extrema, use repeat
          if (isSmallPattern || isExtremeRatio) {
            console.log(`✅ Aplicando REPEAT - Padrão pequeno: ${isSmallPattern}, Proporção extrema: ${isExtremeRatio}`);
            resolve('repeat');
          } 
          // Se é quadrado e grande, provavelmente é uma imagem completa
          else if (isSquareish && img.width > 400 && img.height > 400) {
            console.log(`✅ Aplicando COVER - Imagem grande e quadrada`);
            resolve('cover');
          }
          // Para outros casos, use repeat por padrão (mais seguro para padrões)
          else {
            console.log(`✅ Aplicando REPEAT - Padrão padrão`);
            resolve('repeat');
          }
        }
      };
      img.onerror = () => {
        console.log(`❌ Erro ao carregar imagem, usando COVER como fallback`);
        resolve('cover');
      };
      img.src = imageUrl;
    });
  };

  // Função para aplicar background com detecção automática
  const handleBackgroundSelect = async (imageUrl: string) => {
    const backgroundType = await getBackgroundType(imageUrl);
    console.log(`🎨 Background selecionado: ${imageUrl} - Tipo: ${backgroundType}`);
    onBackgroundChange?.(backgroundType, imageUrl);
  };

  // Categorias de stickers
  const stickerCategories = [
    { id: 'Stickers', label: 'Stickers', icon: '✨', count: stickerAssets.Stickers?.length || 0 },
    { id: 'Mockups', label: 'Mockups', icon: '🎭', count: stickerAssets.Mockups?.length || 0 },
    { id: 'Montáveis', label: 'Montáveis', icon: '🧩', count: stickerAssets.Montáveis?.length || 0 },
    { id: 'Ícones', label: 'Ícones', icon: '🎯', count: stickerAssets.Ícones?.length || 0 },
    { id: 'Animados', label: 'Animados', icon: '🎬', count: stickerAssets.Animados?.length || 0 }
  ] as const;

  // Função para arrastar e soltar com limites
  const handleDragStart = (e: React.MouseEvent, type: 'widget' | 'sticker', id: string) => {
    if (!isEditMode || !isOwner) {
      console.log('❌ Drag não permitido:', { isEditMode, isOwner });
      return;
    }
    
    console.log('🎯 Iniciando drag:', { type, id });
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggedItem({ type, id });
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!draggedItem || !isEditMode || !isOwner) return;
    
    const canvas = document.getElementById('home-canvas');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;
    
    // Aplicar limites - permitir movimento por todo o canvas
    let maxX = 1000 - 50; // Margem padrão
    let maxY = 1400 - 50; // Margem padrão
    
    if (draggedItem.type === 'widget') {
      const widget = widgets.find(w => w.id === draggedItem.id);
      if (widget) {
        maxX = 1000 - widget.width;
        maxY = 1400 - widget.height;
      }
    } else if (draggedItem.type === 'sticker') {
      maxX = 1000 - 100; // Tamanho aproximado do sticker
      maxY = 1400 - 100;
    }
    
    const constrainedX = Math.max(0, Math.min(x, maxX));
    const constrainedY = Math.max(0, Math.min(y, maxY));
    
    console.log('🖱️ Movendo:', { 
      type: draggedItem.type, 
      id: draggedItem.id, 
      x: constrainedX, 
      y: constrainedY 
    });
    
    if (draggedItem.type === 'widget') {
      onWidgetPositionChange(draggedItem.id, constrainedX, constrainedY);
    } else {
      onStickerPositionChange(draggedItem.id, constrainedX, constrainedY);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Adicionar event listeners para drag
  React.useEffect(() => {
    if (draggedItem) {
      const handleMouseMove = (e: MouseEvent) => {
        handleDragMove(e);
      };
      
      const handleMouseUp = () => {
        handleDragEnd();
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedItem, dragOffset, isEditMode, isOwner]);

  // Widgets permitidos (apenas 3)
  const allowedWidgets = ['avatar', 'guestbook', 'rating'];
  
  // Filtrar widgets para mostrar apenas os permitidos
  const filteredWidgets = widgets.filter(widget => allowedWidgets.includes(widget.widget_type));
  
  // Debug logs para widgets
  console.log('🎨 HomeCanvas renderizando:', {
    totalWidgets: widgets.length,
    filteredWidgets: filteredWidgets.length,
    widgets: widgets.map(w => ({ id: w.id, type: w.widget_type, x: w.x, y: w.y, visible: w.is_visible })),
    filteredWidgets: filteredWidgets.map(w => ({ id: w.id, type: w.widget_type, x: w.x, y: w.y, visible: w.is_visible }))
  });

  return (
    <div className="relative w-full h-full">
      {/* Canvas da Home */}
      <div
        id="home-canvas"
        className="relative mx-auto overflow-hidden rounded-2xl shadow-2xl border-4 border-gray-300"
        style={{
          width: '1000px',
          height: '1400px',
          backgroundColor: background?.background_type === 'color' ? background.background_value : '#e8f4fd',
          backgroundImage: background?.background_type === 'cover' || background?.background_type === 'repeat' ? `url(${background.background_value})` : undefined,
          backgroundSize: background?.background_type === 'cover' ? 'cover' : background?.background_type === 'repeat' ? 'auto' : undefined,
          backgroundPosition: 'center',
          backgroundRepeat: background?.background_type === 'repeat' ? 'repeat' : 'no-repeat',
        }}
      >
        {/* Botão de Edição - Canto superior direito do canvas */}
        {!isEditMode && isOwner && (
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => {
                onEnterEditMode?.();
              }}
              className="hover:opacity-80 transition-opacity"
              title="Editar Home"
            >
              <img 
                src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/home-assets/editinghome.png" 
                alt="Editar Home" 
                style={{ 
                  imageRendering: 'pixelated',
                  width: 'auto',
                  height: 'auto',
                  maxHeight: '60px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </button>
          </div>
        )}

        {/* Barra de Edição - No local da mensagem de instrução */}
        {isEditMode && isOwner && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-[70%]">
            <Card className="bg-yellow-50/95 backdrop-blur-sm shadow-lg border-2 border-yellow-400">
              <CardContent className="p-3">
                <div className="flex items-start justify-between w-full">
                  <div className="overflow-hidden" style={{ height: '52px' }}>
                    <img 
                      src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/home-assets/edithometop.png" 
                      alt="Modo Edição" 
                      className="flex-shrink-0"
                      style={{ 
                        imageRendering: 'pixelated',
                        zIndex: 60, // Garante que a imagem fique acima de outros elementos
                        transform: 'translateY(0)', // Alinha com a borda superior
                        objectFit: 'cover',
                        objectPosition: 'top' // Mantém a parte superior da imagem
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleSectionToggle('background')}
                      variant={activeSection === 'background' ? 'default' : 'outline'}
                      size="sm"
                      className="volter-font px-2 py-1 text-xs"
                    >
                      🎨 Background
                    </Button>
                    
                    <Button
                      onClick={() => handleSectionToggle('widgets')}
                      variant={activeSection === 'widgets' ? 'default' : 'outline'}
                      size="sm"
                      className="volter-font px-2 py-1 text-xs"
                    >
                      📊 Widgets
                    </Button>
                    
                    <Button
                      onClick={() => handleSectionToggle('stickers')}
                      variant={activeSection === 'stickers' ? 'default' : 'outline'}
                      size="sm"
                      className="volter-font px-2 py-1 text-xs"
                    >
                      ⭐ Stickers
                    </Button>
                    
                    <Button
                      onClick={onSave}
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-gray-100"
                      title="Salvar"
                    >
                      💾
                    </Button>
                    
                    <Button
                      onClick={onExitEditMode}
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-gray-100"
                      title="Sair"
                    >
                      ❌
                    </Button>
                  </div>
                </div>
                
                {/* Dropdown de Seletores */}
                {activeSection && (
                  <div className="mt-4 border-t border-yellow-300 pt-4">
                    <div className="bg-gray-50 rounded-lg border p-4 max-h-96 overflow-y-auto">
                      {/* Seletor de Background */}
                      {activeSection === 'background' && (
                        <div className="mb-6">
                          <h4 className="font-bold mb-3 volter-font text-gray-800">🎨 Escolher Background</h4>
                          
                          {/* Cores básicas */}
                          <div className="mb-4">
                            <h5 className="text-sm font-semibold mb-2 volter-font text-gray-700">Cores</h5>
                            <div className="grid grid-cols-6 gap-2">
                              <Button
                                onClick={() => onBackgroundChange?.('color', '#e8f4fd')}
                                variant="outline"
                                size="sm"
                                className="volter-font h-12"
                                style={{ backgroundColor: '#e8f4fd' }}
                              >
                                Azul Claro
                              </Button>
                              <Button
                                onClick={() => onBackgroundChange?.('color', '#f0f8ff')}
                                variant="outline"
                                size="sm"
                                className="volter-font h-12"
                                style={{ backgroundColor: '#f0f8ff' }}
                              >
                                Branco
                              </Button>
                              <Button
                                onClick={() => onBackgroundChange?.('color', '#f0f0f0')}
                                variant="outline"
                                size="sm"
                                className="volter-font h-12"
                                style={{ backgroundColor: '#f0f0f0' }}
                              >
                                Cinza
                              </Button>
                              <Button
                                onClick={() => onBackgroundChange?.('color', '#ffe4e1')}
                                variant="outline"
                                size="sm"
                                className="volter-font h-12"
                                style={{ backgroundColor: '#ffe4e1' }}
                              >
                                Rosa
                              </Button>
                              <Button
                                onClick={() => onBackgroundChange?.('color', '#f0fff0')}
                                variant="outline"
                                size="sm"
                                className="volter-font h-12"
                                style={{ backgroundColor: '#f0fff0' }}
                              >
                                Verde Claro
                              </Button>
                              <Button
                                onClick={() => onBackgroundChange?.('color', '#fff8dc')}
                                variant="outline"
                                size="sm"
                                className="volter-font h-12"
                                style={{ backgroundColor: '#fff8dc' }}
                              >
                                Amarelo Claro
                              </Button>
                            </div>
                          </div>

                          {/* Imagens do Supabase */}
                          <div>
                            <h5 className="text-sm font-semibold mb-2 volter-font text-gray-700">Imagens</h5>
                            {loadingBackgrounds ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2 volter-font">Carregando backgrounds...</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-6 gap-2">
                                {backgroundImages.map((asset) => (
                                  <button
                                    key={asset.id}
                                    onClick={() => handleBackgroundSelect(asset.url)}
                                    className="aspect-square rounded-lg border-2 border-gray-300 hover:border-blue-500 overflow-hidden"
                                  >
                                    <img
                                      src={asset.url}
                                      alt={asset.name}
                                      className="w-full h-full object-cover"
                                      style={{ imageRendering: 'pixelated' }}
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Seletor de Widgets */}
                      {activeSection === 'widgets' && (
                        <div className="mb-6">
                          <h4 className="font-bold mb-3 volter-font text-gray-800">📊 Adicionar Widgets</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <Button
                              onClick={() => {
                                onWidgetAdd?.('guestbook');
                                setActiveSection(null);
                              }}
                              variant="outline"
                              size="sm"
                              className="volter-font h-16 flex flex-col items-center justify-center gap-1"
                            >
                              <span className="text-lg">📖</span>
                              <span className="text-xs">Guestbook</span>
                            </Button>
                            <Button
                              onClick={() => {
                                onWidgetAdd?.('rating');
                                setActiveSection(null);
                              }}
                              variant="outline"
                              size="sm"
                              className="volter-font h-16 flex flex-col items-center justify-center gap-1"
                            >
                              <span className="text-lg">⭐</span>
                              <span className="text-xs">Avaliações</span>
                            </Button>
                            <Button
                              onClick={() => {
                                onWidgetAdd?.('avatar');
                                setActiveSection(null);
                              }}
                              variant="outline"
                              size="sm"
                              className="volter-font h-16 flex flex-col items-center justify-center gap-1"
                            >
                              <span className="text-lg">👤</span>
                              <span className="text-xs">Card de Perfil</span>
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Seletor de Stickers */}
                      {activeSection === 'stickers' && (
                        <div className="mb-6">
                          <h4 className="font-bold mb-3 volter-font text-gray-800">⭐ Adicionar Stickers</h4>
                          
                          {/* Abas de Categorias */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {stickerCategories.map((category) => (
                              <Button
                                key={category.id}
                                onClick={() => setSelectedStickerCategory(category.id)}
                                variant={selectedStickerCategory === category.id ? 'default' : 'outline'}
                                size="sm"
                                className="volter-font text-xs"
                              >
                                <span className="mr-1">{category.icon}</span>
                                {category.label}
                              </Button>
                            ))}
                          </div>

                          {/* Grid de Stickers */}
                          {loadingStickers ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              <span className="ml-2 volter-font">Carregando stickers...</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-6 gap-2">
                              {stickerAssets[selectedStickerCategory]?.map((asset) => {
                                const assetUrl = getAssetUrl(asset);
                                return (
                                  <button
                                    key={asset.id}
                                    onClick={() => {
                                      const stickerData = {
                                        sticker_id: asset.id,
                                        sticker_src: assetUrl,
                                        category: asset.category?.toLowerCase() || 'decorative',
                                        rotation: 0,
                                        scale: 1
                                      };
                                      onStickerAdd?.(stickerData);
                                      setActiveSection(null);
                                    }}
                                    className="aspect-square overflow-hidden flex items-center justify-center bg-transparent hover:opacity-80 transition-opacity"
                                  >
                                    <img
                                      src={assetUrl}
                                      alt={asset.name}
                                      className="w-10 h-10 object-contain"
                                      style={{ imageRendering: 'pixelated' }}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Widgets */}
        {filteredWidgets.map((widget) => (
          <div
            key={widget.id}
            className="absolute"
            style={{
              left: `${widget.x}px`,
              top: `${widget.y}px`,
              width: `${widget.width}px`,
              height: `${widget.height}px`,
              zIndex: widget.z_index,
              opacity: widget.is_visible ? 1 : 0.5,
              transform: 'scale(1)',
              transition: '0.2s ease-out',
            }}
          >
            <div className="relative w-full h-full">
              <HomeWidget
                widget={widget}
                habboData={habboData}
                guestbook={guestbook}
                isEditMode={isEditMode}
                isOwner={isOwner}
                onRemove={() => onWidgetRemove?.(widget.id)}
                onPositionChange={onWidgetPositionChange}
              />
              
            </div>
          </div>
        ))}

        {/* Stickers */}
        {stickers.map((sticker) => (
          <HomeSticker
            key={sticker.id}
            sticker={sticker}
            isEditMode={isEditMode}
            isOwner={isOwner}
            onRemove={() => onStickerRemove(sticker.id)}
            onPositionChange={onStickerPositionChange}
          />
        ))}
      </div>

    </div>
  );
};
