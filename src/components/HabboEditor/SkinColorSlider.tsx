
import { Button } from '@/components/ui/button';
import { OFFICIAL_HABBO_COLORS } from '@/lib/enhancedCategoryMapperV2';

interface SkinColorSliderProps {
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  selectedGender: 'M' | 'F';
}

export const SkinColorSlider = ({
  selectedColor,
  onColorSelect,
  selectedGender
}: SkinColorSliderProps) => {
  const skinColors = OFFICIAL_HABBO_COLORS.skin;

  return (
    <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-3">
      <div className="flex items-center justify-center gap-1">
        {skinColors.map((color, index) => (
          <div key={color.id} className="relative">
            <Button
              variant="ghost"
              size="sm"
              className={`w-10 h-10 p-0 rounded-full border-2 transition-all duration-300 ${
                selectedColor === color.id 
                  ? 'border-orange-400 scale-110 shadow-lg transform translate-y-[-2px]' 
                  : 'border-orange-200 hover:border-orange-300 hover:scale-105'
              }`}
              style={{ backgroundColor: color.hex }}
              onClick={() => onColorSelect(color.id)}
              title={color.name}
            >
              {/* Face emoji in center */}
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xs">😊</span>
              </div>
            </Button>
            
            {/* Gradient bar background */}
            {index < skinColors.length - 1 && (
              <div 
                className="absolute top-1/2 left-full w-1 h-2 transform -translate-y-1/2"
                style={{
                  background: `linear-gradient(to right, ${color.hex}, ${skinColors[index + 1].hex})`
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
