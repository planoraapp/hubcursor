
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkinColorBarProps {
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
}

const SKIN_COLORS = [
  { id: '1', hex: '#FFDBAC', name: 'Pele Clara' },
  { id: '2', hex: '#F5C2A5', name: 'Pele Rosada' },
  { id: '3', hex: '#E8A775', name: 'Pele Média' },
  { id: '4', hex: '#D4965A', name: 'Pele Morena' },
  { id: '5', hex: '#BB7748', name: 'Pele Escura' },
  { id: '7', hex: '#A0845C', name: 'Pele Bronzeada' }
];

export const SkinColorBar = ({
  selectedColor,
  onColorSelect,
  selectedGender,
  selectedHotel
}: SkinColorBarProps) => {
  
  const getPreviewUrl = (colorId: string) => {
    const hotel = selectedHotel.includes('.') 
      ? selectedHotel 
      : selectedHotel === 'com' ? 'habbo.com' : `habbo.${selectedHotel}`;
    
    return `https://www.${hotel}/habbo-imaging/avatarimage?figure=hd-180-${colorId}&gender=${selectedGender}&direction=2&head_direction=2&size=s&headonly=1`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          😊 Cor da Pele
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3">
          <div className="flex items-center justify-center gap-1">
            {SKIN_COLORS.map((color, index) => (
              <div key={color.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-12 h-12 p-0 rounded-full border-2 transition-all duration-300 ${
                    selectedColor === color.id 
                      ? 'border-orange-400 scale-110 shadow-lg ring-2 ring-orange-200' 
                      : 'border-orange-200 hover:border-orange-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => onColorSelect(color.id)}
                  title={color.name}
                >
                  <img
                    src={getPreviewUrl(color.id)}
                    alt={color.name}
                    className="w-8 h-8 rounded-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      // Fallback to emoji if image fails
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.emoji-fallback')) {
                        const span = document.createElement('span');
                        span.className = 'emoji-fallback text-lg';
                        span.textContent = '😊';
                        parent.appendChild(span);
                      }
                    }}
                  />
                </Button>
                
                {/* Gradient connector */}
                {index < SKIN_COLORS.length - 1 && (
                  <div 
                    className="absolute top-1/2 left-full w-1 h-3 transform -translate-y-1/2"
                    style={{
                      background: `linear-gradient(to right, ${color.hex}, ${SKIN_COLORS[index + 1].hex})`
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
