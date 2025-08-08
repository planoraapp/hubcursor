
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOfficialClothingIndex, type OfficialClothingItem } from '@/hooks/useOfficialClothingIndex';
import { ViaJovemFigureManager, type ViaJovemFigure } from '@/lib/viaJovemFigureManager';
import { getSinglePartPreviewUrl, getFullAvatarUrl, getOfficialColorPalette } from '@/utils/partPreview';
import { ColorPickerModal } from './ColorPickerModal';
import { useToast } from '@/hooks/use-toast';

interface OfficialHabboEditorProps {
  className?: string;
}

// Estrutura de navegação baseada nos exemplos
const NAVIGATION_STRUCTURE = {
  main: [
    { id: 'hd', category: 'hd', name: 'Rosto', icon: '👤' },
    { 
      id: 'hair', 
      category: 'hr', 
      name: 'Cabelo', 
      icon: '💇',
      submenu: [
        { id: 'ha', name: 'Chapéus', icon: '🎩' },
        { id: 'he', name: 'Acess. Cabelo', icon: '✨' },
        { id: 'ea', name: 'Óculos', icon: '👓' },
        { id: 'fa', name: 'Rosto', icon: '😊' }
      ]
    },
    { 
      id: 'tops', 
      category: 'ch', 
      name: 'Camisetas', 
      icon: '👕',
      submenu: [
        { id: 'cp', name: 'Estampas', icon: '🎨' },
        { id: 'cc', name: 'Casacos', icon: '🧥' },
        { id: 'ca', name: 'Acessórios', icon: '💍' }
      ]
    },
    { 
      id: 'bottoms', 
      category: 'lg', 
      name: 'Calças', 
      icon: '👖',
      submenu: [
        { id: 'sh', name: 'Sapatos', icon: '👟' },
        { id: 'wa', name: 'Cintos', icon: '🔗' }
      ]
    }
  ]
};

const OfficialHabboEditor = ({ className = '' }: OfficialHabboEditorProps) => {
  const [currentFigure, setCurrentFigure] = useState<ViaJovemFigure>(() =>
    ViaJovemFigureManager.getDefaultFigure('M')
  );
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [direction, setDirection] = useState('2');
  const [headDirection, setHeadDirection] = useState('2');
  const [selectedMainCategory, setSelectedMainCategory] = useState('hd');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [showSubmenu, setShowSubmenu] = useState<string>('');
  
  // Color picker modal
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<OfficialClothingItem | null>(null);

  const { toast } = useToast();
  const { categories, isLoading, error } = useOfficialClothingIndex(selectedGender);

  const hotels = [
    { code: 'com', name: 'Habbo.com', flag: '🌍' },
    { code: 'com.br', name: 'Habbo.com.br', flag: '🇧🇷' },
    { code: 'es', name: 'Habbo.es', flag: '🇪🇸' },
    { code: 'fr', name: 'Habbo.fr', flag: '🇫🇷' },
    { code: 'de', name: 'Habbo.de', flag: '🇩🇪' },
    { code: 'it', name: 'Habbo.it', flag: '🇮🇹' }
  ];

  // Determinar categoria ativa para mostrar itens
  const activeCategory = selectedSubCategory || selectedMainCategory;
  const currentItems = categories[activeCategory]?.items || [];

  const handleItemClick = (item: OfficialClothingItem) => {
    console.log('🎯 [OfficialEditor] Item selecionado:', item);
    setPendingItem(item);
    setColorModalOpen(true);
  };

  const handleColorSelect = (colorId: string) => {
    if (pendingItem) {
      const updatedFigure = ViaJovemFigureManager.applyClothingItem(
        currentFigure,
        pendingItem,
        colorId
      );
      setCurrentFigure(updatedFigure);
      setPendingItem(null);
      
      toast({
        title: "✅ Item aplicado!",
        description: `${pendingItem.name} aplicado com cor ${colorId}`,
      });
    }
  };

  const handleMenuClick = (menuItem: any) => {
    if (menuItem.submenu) {
      setShowSubmenu(showSubmenu === menuItem.id ? '' : menuItem.id);
      setSelectedMainCategory(menuItem.category);
      setSelectedSubCategory('');
    } else {
      setSelectedMainCategory(menuItem.category || menuItem.id);
      setSelectedSubCategory('');
      setShowSubmenu('');
    }
  };

  const handleSubMenuClick = (subItem: any) => {
    setSelectedSubCategory(subItem.id);
  };

  const rotateDirection = (type: 'head' | 'body', direction: 'left' | 'right') => {
    const directions = ['0', '1', '2', '3', '4', '5', '6', '7'];
    
    if (type === 'head') {
      const currentIndex = directions.indexOf(headDirection);
      const newIndex = direction === 'left' 
        ? (currentIndex - 1 + directions.length) % directions.length
        : (currentIndex + 1) % directions.length;
      setHeadDirection(directions[newIndex]);
    } else {
      const currentIndex = directions.indexOf(direction);
      const newIndex = direction === 'left'
        ? (currentIndex - 1 + directions.length) % directions.length  
        : (currentIndex + 1) % directions.length;
      setDirection(directions[newIndex]);
    }
  };

  if (error) {
    return (
      <div className={`${className} p-8 text-center`}>
        <p className="text-red-600">❌ Erro ao carregar dados oficiais</p>
      </div>
    );
  }

  return (
    <div className={`${className} w-full h-full flex flex-col lg:flex-row gap-4 p-4`}>
      {/* Color Picker Modal */}
      <ColorPickerModal
        isOpen={colorModalOpen}
        onClose={() => {
          setColorModalOpen(false);
          setPendingItem(null);
        }}
        onColorSelect={handleColorSelect}
        category={pendingItem?.category || 'ch'}
        itemName={pendingItem?.name || ''}
      />

      {/* Avatar Preview - Esquerda */}
      <div className="lg:w-80">
        <Card>
          <CardContent className="p-4 text-center">
            {/* Controle Cabeça */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => rotateDirection('head', 'left')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">Cabeça</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => rotateDirection('head', 'right')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Avatar */}
            <div className="mb-4 bg-gradient-to-b from-blue-100 to-white rounded-lg p-4">
              <img
                src={getFullAvatarUrl(
                  ViaJovemFigureManager.getFigureString(currentFigure),
                  selectedGender,
                  selectedHotel,
                  'l',
                  direction,
                  headDirection
                )}
                alt="Avatar Preview"
                className="mx-auto"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Controle Corpo */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => rotateDirection('body', 'left')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">Corpo</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => rotateDirection('body', 'right')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Controles Hotel */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Hotel</label>
                <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map(hotel => (
                      <SelectItem key={hotel.code} value={hotel.code}>
                        {hotel.flag} {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gênero */}
              <div className="flex gap-2 justify-center">
                <Button
                  variant={selectedGender === 'M' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGender('M')}
                  className="flex-1"
                >
                  👨 Masculino
                </Button>
                <Button
                  variant={selectedGender === 'F' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGender('F')}
                  className="flex-1"
                >
                  👩 Feminino
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor - Centro e Direita */}
      <div className="flex-1 flex gap-4">
        {/* Navegação - Baseada nos exemplos */}
        <div className="w-20 space-y-1">
          {NAVIGATION_STRUCTURE.main.map(item => (
            <div key={item.id}>
              <Button
                variant={selectedMainCategory === item.category ? 'default' : 'outline'}
                size="sm"
                className="w-full h-16 flex flex-col items-center justify-center text-xs p-1"
                onClick={() => handleMenuClick(item)}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] leading-tight">{item.name}</span>
              </Button>
              
              {/* Submenu */}
              {showSubmenu === item.id && item.submenu && (
                <div className="mt-1 space-y-1">
                  {item.submenu.map(subItem => (
                    <Button
                      key={subItem.id}
                      variant={selectedSubCategory === subItem.id ? 'default' : 'outline'}
                      size="sm"
                      className="w-full h-12 flex flex-col items-center justify-center text-xs p-1"
                      onClick={() => handleSubMenuClick(subItem)}
                    >
                      <span className="text-sm">{subItem.icon}</span>
                      <span className="text-[9px] leading-tight">{subItem.name}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Grid de Itens */}
        <div className="flex-1">
          <Card className="h-full">
            <CardContent className="p-4 h-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Carregando itens oficiais...</div>
                </div>
              ) : currentItems.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Nenhum item encontrado nesta categoria</div>
                </div>
              ) : (
                <div className="h-full overflow-auto">
                  {/* Separar por tipo de clube */}
                  {['FREE', 'HC'].map(clubType => {
                    const clubItems = currentItems.filter(item => item.club === clubType);
                    if (clubItems.length === 0) return null;

                    return (
                      <div key={clubType} className="mb-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-3">
                          {clubType === 'HC' ? '👑 Habbo Club' : '🆓 Gratuitos'}
                        </h3>
                        <div className="grid grid-cols-6 gap-2">
                          {clubItems.map(item => (
                            <button
                              key={item.id}
                              onClick={() => handleItemClick(item)}
                              className="aspect-square rounded-full border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 relative bg-gray-100 overflow-hidden"
                              title={`${item.name} - Clique para escolher cor`}
                            >
                              <img
                                src={getSinglePartPreviewUrl(
                                  item.category,
                                  item.figureId,
                                  item.colors[0],
                                  selectedGender,
                                  selectedHotel
                                )}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                style={{ imageRendering: 'pixelated' }}
                              />
                              {item.club === 'HC' && (
                                <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OfficialHabboEditor;
