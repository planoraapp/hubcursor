import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { ViaJovemAvatarSection } from './ViaJovemAvatarSection';
import { ViaJovemFigureManager, ViaJovemFigure } from '@/lib/viaJovemFigureManager';
import { useToast } from '@/hooks/use-toast';
import type { ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';
import EnhancedFlashAssetsEditor from '@/components/HabboEditor/EnhancedFlashAssetsEditor';

interface ViaJovemEditorRedesignedProps {
  className?: string;
}

const ViaJovemEditorRedesigned = ({ className = '' }: ViaJovemEditorRedesignedProps) => {
  const [currentFigure, setCurrentFigure] = useState<ViaJovemFigure>(() =>
    ViaJovemFigureManager.getDefaultFigure('M')
  );
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [currentDirection, setCurrentDirection] = useState('2');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedColor, setSelectedColor] = useState('1');

  const { toast } = useToast();

  // Hotéis disponíveis
  const hotels = [
    { code: 'com', name: 'Habbo.com', flag: '🌍', url: 'habbo.com' },
    { code: 'com.br', name: 'Habbo.com.br', flag: '🇧🇷', url: 'habbo.com.br' },
    { code: 'es', name: 'Habbo.es', flag: '🇪🇸', url: 'habbo.es' },
    { code: 'fr', name: 'Habbo.fr', flag: '🇫🇷', url: 'habbo.fr' },
    { code: 'de', name: 'Habbo.de', flag: '🇩🇪', url: 'habbo.de' },
    { code: 'it', name: 'Habbo.it', flag: '🇮🇹', url: 'habbo.it' },
    { code: 'fi', name: 'Habbo.fi', flag: '🇫🇮', url: 'habbo.fi' }
  ];

  // Load figure from URL on mount
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const figureParam = urlParams.get('figure');
    const genderParam = urlParams.get('gender') as 'M' | 'F' | 'U';
    const hotelParam = urlParams.get('hotel');

    if (figureParam) {
      try {
        const figure = ViaJovemFigureManager.parseFigureString(figureParam);
        setCurrentFigure(figure);
      } catch (error) {
        console.error('Error parsing figure from URL:', error);
      }
    }

    if (genderParam && ['M', 'F', 'U'].includes(genderParam)) {
      setSelectedGender(genderParam);
    }

    if (hotelParam) {
      setSelectedHotel(hotelParam);
    }
  }, []);

  const handleGenderChange = (gender: 'M' | 'F' | 'U') => {
    console.log('👤 [ViaJovemEditor] Mudança de gênero:', gender);
    setSelectedGender(gender);
  };

  const handleEnhancedItemSelect = (item: any, colorId: string) => {
    console.log('🎯 [ViaJovemEditor] Item do sistema melhorado selecionado:', item);
    
    setSelectedItem(item.figureId);
    setSelectedColor(colorId);
    
    // Aplicar ao avatar
    const updatedFigure = ViaJovemFigureManager.applyClothingItem(
      currentFigure, 
      item, 
      colorId
    );
    
    setCurrentFigure(updatedFigure);
    
    toast({
      title: "👕 Asset Flash aplicado!",
      description: `${item.name} foi aplicado ao seu avatar.`,
    });
  };

  return (
    <div className={`w-full h-full flex flex-col lg:flex-row gap-4 p-4 ${className}`}>
      {/* Avatar Preview (Esquerda) */}
      <div className="lg:w-80">
        <Card>
          <CardContent className="p-4">
            <ViaJovemAvatarSection
              currentFigure={currentFigure}
              selectedGender={selectedGender === 'U' ? 'M' : selectedGender}
              selectedHotel={selectedHotel}
              currentDirection={currentDirection}
              hotels={hotels}
              onFigureChange={setCurrentFigure}
              onDirectionChange={setCurrentDirection}
              onGenderChange={handleGenderChange}
              onHotelChange={setSelectedHotel}
            />
          </CardContent>
        </Card>
      </div>

      {/* Editor Enhanced (Direita) */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              ViaJovem Editor - Sistema Flash Assets Melhorado
              <Badge className="ml-auto bg-white/20 text-white text-xs">
                2871+ Assets • 13 Categorias
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-full">
            <EnhancedFlashAssetsEditor
              selectedGender={selectedGender === 'U' ? 'M' : selectedGender}
              selectedHotel={selectedHotel}
              onItemSelect={handleEnhancedItemSelect}
              selectedItem={selectedItem}
              selectedColor={selectedColor}
              className="h-full"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViaJovemEditorRedesigned;
