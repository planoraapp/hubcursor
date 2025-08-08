import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, RotateCcw, Palette, User, Shirt, Crown, Eye } from 'lucide-react';
import { useHabboHomeMigration } from '@/hooks/useHabboHomeMigration';
import { useTemplariosFigure } from '@/hooks/useTemplariosFigure';
import { useTemplariosData } from '@/hooks/useTemplariosData';
import { useTemplariosPreview } from '@/hooks/useTemplariosPreview';
import { fixInvalidColors } from '@/utils/habboColorValidator';
import { figureStringGenerator } from '@/lib/figureStringGenerator';
import { HabboRenderer } from '../HabboRenderer';
import { OfficialHabboClothingGrid } from './OfficialHabboClothingGrid';
import { ViaJovemClothingGrid } from './ViaJovemClothingGrid';

interface ViaJovemEditorRedesignedProps {
  className?: string;
}

const ViaJovemEditorRedesigned = ({ className = '' }: ViaJovemEditorRedesignedProps) => {
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedColor, setSelectedColor] = useState('1');
  const [currentFigureString, setCurrentFigureString] = useState('');
  const [activeTab, setActiveTab] = useState('official');

  const { figureString, updateSelection, resetSelection } = useTemplariosFigure();
  const { getFullAvatarUrl } = useTemplariosPreview();

  const handleItemSelect = (item: any, colorId: string = '1') => {
    setSelectedItem(item.id);
    setSelectedColor(colorId);
    updateSelection(item.category, item.id, colorId);
  };

  const handleRestoreFigure = (figureString: string) => {
    const correctedFigure = fixInvalidColors(figureString);
    setCurrentFigureString(correctedFigure);
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `habbo-avatar-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = getFullAvatarUrl(figureString, selectedGender, selectedHotel);
  };

  return (
    <div className={`via-jovem-editor-redesigned ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Left Panel - Avatar Preview */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="relative">
              <HabboRenderer 
                figureString={figureString}
                gender={selectedGender}
                hotel={selectedHotel}
                size="l"
                className="mx-auto mb-4"
              />
              
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedGender === 'M' ? 'Masculino' : 'Feminino'}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDownload}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Baixar
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={resetSelection}
                className="flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Limpar
              </Button>
            </div>
          </Card>

          {/* Gender & Hotel Selection */}
          <Card className="p-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Gênero</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedGender === 'M' ? 'default' : 'outline'}
                    onClick={() => setSelectedGender('M')}
                    className="flex-1"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Masculino
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedGender === 'F' ? 'default' : 'outline'}
                    onClick={() => setSelectedGender('F')}
                    className="flex-1"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Feminino
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Hotel</label>
                <select 
                  className="w-full p-2 border rounded-md text-sm"
                  value={selectedHotel}
                  onChange={(e) => setSelectedHotel(e.target.value)}
                >
                  <option value="com">Habbo.com</option>
                  <option value="com.br">Habbo.com.br</option>
                  <option value="es">Habbo.es</option>
                  <option value="fr">Habbo.fr</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Clothing Selection */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="official" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Oficial Habbo
              </TabsTrigger>
              <TabsTrigger value="viajovem" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                ViaJovem
              </TabsTrigger>
            </TabsList>

            <TabsContent value="official" className="h-full">
              <OfficialHabboClothingGrid />
            </TabsContent>

            <TabsContent value="viajovem" className="h-full">
              <ViaJovemClothingGrid />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ViaJovemEditorRedesigned;
