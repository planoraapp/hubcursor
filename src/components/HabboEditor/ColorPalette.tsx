
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface Color {
  id: string;
  hex: string;
  name: string;
}

interface ColorPaletteProps {
  colors: Color[];
  availableColors: string[];
  selectedColor?: string;
  onColorSelect: (colorId: string) => void;
}

const ColorPalette = ({ colors, availableColors, selectedColor, onColorSelect }: ColorPaletteProps) => {
  const filteredColors = availableColors.length > 0 
    ? colors.filter(color => availableColors.includes(color.id))
    : colors;

  return (
    <Card className="habbo-panel">
      <CardHeader className="habbo-header">
        <CardTitle className="flex items-center gap-2 text-white">
          <Palette className="w-5 h-5" />
          Cores
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-8 gap-2">
          {filteredColors.map((color) => (
            <Button
              key={color.id}
              variant="outline"
              size="sm"
              className={`w-8 h-8 p-0 border-2 transition-all duration-200 ${
                selectedColor === color.id 
                  ? 'border-amber-500 ring-2 ring-amber-300 scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: `#${color.hex}` }}
              onClick={() => onColorSelect(color.id)}
              title={color.name}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorPalette;
