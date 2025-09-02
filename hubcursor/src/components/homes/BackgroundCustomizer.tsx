
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Palette, Image } from 'lucide-react';

interface BackgroundCustomizerProps {
  onBackgroundChange?: (background: { type: 'color' | 'repeat' | 'cover'; value: string }) => void;
}

export const BackgroundCustomizer: React.FC<BackgroundCustomizerProps> = ({
  onBackgroundChange
}) => {
  const [selectedColor, setSelectedColor] = useState('#c7d2dc');
  const [imageUrl, setImageUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const defaultColors = [
    '#c7d2dc', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#c8d6e5'
  ];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onBackgroundChange?.({ type: 'color', value: color });
    setIsOpen(false);
  };

  const handleImageBackground = (type: 'repeat' | 'cover') => {
    if (imageUrl.trim()) {
      onBackgroundChange?.({ type, value: imageUrl.trim() });
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="volter-font">
          <Palette className="w-4 h-4 mr-1" />
          Background
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80">
        <Tabs defaultValue="color" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="color">
              <Palette className="w-4 h-4 mr-1" />
              Cor
            </TabsTrigger>
            <TabsTrigger value="image">
              <Image className="w-4 h-4 mr-1" />
              Imagem
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="color" className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-10 h-10 rounded border-2 ${
                    selectedColor === color ? 'border-black' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-20"
              />
              <Button 
                onClick={() => handleColorSelect(selectedColor)}
                className="flex-1 volter-font"
              >
                Aplicar Cor
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="space-y-3">
            <Input
              placeholder="URL da imagem..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => handleImageBackground('repeat')}
                disabled={!imageUrl.trim()}
                className="flex-1 volter-font"
              >
                Repetir
              </Button>
              <Button 
                onClick={() => handleImageBackground('cover')}
                disabled={!imageUrl.trim()}
                className="flex-1 volter-font"
              >
                Cobrir
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              Cole a URL de uma imagem para usar como fundo
            </p>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
