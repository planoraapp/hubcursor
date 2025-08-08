
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search } from 'lucide-react';
import { useFlashAssetsClothing } from '@/hooks/useFlashAssetsClothing';
import { ImprovedAvatarPreview } from './ImprovedAvatarPreview';
import { SkinToneBar } from './SkinToneBar';
import { ColorPickerPopover } from './ColorPickerPopover';
import { GenderFilterButtons } from './GenderFilterButtons';

interface FlashAssetsV3CompleteProps {
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: any, colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  currentFigureString?: string;
  onRestoreFigure?: (figureString: string) => void;
  className?: string;
}

const FlashAssetsV3Complete = ({
  selectedGender: initialGender,
  selectedHotel,
  onItemSelect,
  selectedItem,
  selectedColor = '1',
  currentFigureString = 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1',
  className = ''
}: FlashAssetsV3CompleteProps) => {
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>(initialGender);
  const [skinTone, setSkinTone] = useState('1');

  const { data: flashData, isLoading, error } = useFlashAssetsClothing({ 
    limit: 500, 
    category: selectedCategory,
    search: searchTerm 
  });

  // Category configuration with editor images
  const categories = {
    'hd': { 
      name: 'Rostos', 
      icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/head.png'
    },
    'hr': { 
      name: 'Cabelos', 
      icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/hair.png'
    },
    'ch': { 
      name: 'Camisetas', 
      icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/shirt.png'
    },
    'lg': { 
      name: 'Calças', 
      icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/pants.png'
    },
    'sh': { 
      name: 'Sapatos', 
      icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/shoes.png'
    },
    'ha': { 
      name: 'Chapéus', 
      icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/hat.png'
    },
    'ea': { 
      name: 'Óculos', 
      icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/glasses.png'
    }
  };

  const categoryList = Object.keys(categories);

  // Filter items by search term and gender
  const filteredItems = useMemo(() => {
    if (!flashData) return [];
    
    return flashData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.figureId.includes(searchTerm);
      const matchesGender = selectedGender === 'U' || 
                           item.gender === 'U' || 
                           item.gender === selectedGender;
      return matchesSearch && matchesGender;
    });
  }, [flashData, searchTerm, selectedGender]);

  const getItemThumbnailUrl = (item: any) => {
    // Focus on individual piece without full avatar
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.category}-${item.figureId}-${selectedColor}&gender=${selectedGender}&direction=2&head_direction=2&size=s`;
  };

  const handleItemClick = (item: any, colorId: string = selectedColor) => {
    onItemSelect(item, colorId);
  };

  const handleSkinToneChange = (newTone: string) => {
    setSkinTone(newTone);
    // Apply skin tone to current figure
    const currentParts = currentFigureString.split('.');
    const updatedParts = currentParts.map(part => {
      if (part.startsWith('hd-')) {
        const [category, id] = part.split('-');
        return `${category}-${id}-${newTone}`;
      }
      return part;
    });
    
    if (onRestoreFigure) {
      onRestoreFigure(updatedParts.join('.'));
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-red-500">
          <img 
            src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/site_images/erro%20404.png"
            alt="Erro"
            className="w-16 h-16 mx-auto mb-2"
            style={{ imageRendering: 'pixelated' }}
          />
          <p>❌ Erro ao carregar assets</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Avatar Preview */}
      <div className="mb-4">
        <ImprovedAvatarPreview
          figureString={currentFigureString}
          selectedGender={selectedGender === 'U' ? 'M' : selectedGender}
          selectedHotel={selectedHotel}
          onRandomize={() => console.log('Randomize')}
          onCopy={() => navigator.clipboard.writeText(currentFigureString)}
          onDownload={() => console.log('Download')}
        />
      </div>

      {/* Skin Tone Bar */}
      <SkinToneBar
        selectedSkinTone={skinTone}
        onSkinToneSelect={handleSkinToneChange}
        selectedGender={selectedGender === 'U' ? 'M' : selectedGender}
        selectedHotel={selectedHotel}
      />

      {/* Gender Filter */}
      <GenderFilterButtons
        selectedGender={selectedGender}
        onGenderSelect={setSelectedGender}
      />

      {/* Main Content */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
            {/* Category Tabs with Icons Only */}
            <TabsList className="grid grid-cols-7 mb-4">
              {categoryList.map(categoryId => {
                const category = categories[categoryId as keyof typeof categories];
                return (
                  <TabsTrigger key={categoryId} value={categoryId} className="p-2">
                    <img 
                      src={category.icon}
                      alt={category.name}
                      className="w-6 h-6"
                      style={{ imageRendering: 'pixelated' }}
                      title={category.name}
                    />
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Items Grid */}
            {categoryList.map(categoryId => (
              <TabsContent key={categoryId} value={categoryId} className="flex-1">
                <div className="grid grid-cols-8 gap-2 max-h-80 overflow-y-auto">
                  {filteredItems.map((item) => (
                    <ColorPickerPopover
                      key={item.id}
                      item={item}
                      selectedColor={selectedColor}
                      onColorSelect={(colorId) => handleItemClick(item, colorId)}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-12 h-12 p-0 relative border-2 transition-all duration-200 ${
                          selectedItem === item.figureId 
                            ? 'border-blue-500 ring-2 ring-blue-300 scale-105 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        onClick={() => handleItemClick(item)}
                        title={item.name}
                      >
                        <img
                          src={getItemThumbnailUrl(item)}
                          alt={item.name}
                          className="w-full h-full object-contain rounded"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-text')) {
                              const span = document.createElement('span');
                              span.className = 'text-xs font-bold text-gray-600 fallback-text';
                              span.textContent = item.figureId;
                              parent.appendChild(span);
                            }
                          }}
                        />
                        
                        {/* Color indicator for multi-color items */}
                        {item.colors && item.colors.length > 1 && (
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 rounded">
                            {item.colors.length}
                          </div>
                        )}
                      </Button>
                    </ColorPickerPopover>
                  ))}
                </div>
                
                {filteredItems.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <p>Nenhum item encontrado</p>
                    {searchTerm && (
                      <p className="text-sm">para "{searchTerm}"</p>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashAssetsV3Complete;
