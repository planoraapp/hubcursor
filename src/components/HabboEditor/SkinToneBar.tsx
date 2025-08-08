
import { Button } from '@/components/ui/button';

interface SkinToneBarProps {
  selectedSkinTone: string;
  onSkinToneSelect: (toneId: string) => void;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
}

const SKIN_TONES = [
  { id: '1', hex: '#FFDBAC', name: 'Pele Clara' },
  { id: '2', hex: '#F5C2A5', name: 'Pele Rosada' },
  { id: '3', hex: '#E8A775', name: 'Pele Média' },
  { id: '4', hex: '#D4965A', name: 'Pele Morena' },
  { id: '5', hex: '#BB7748', name: 'Pele Escura' },
  { id: '7', hex: '#A0845C', name: 'Pele Bronzeada' }
];

export const SkinToneBar = ({
  selectedSkinTone,
  onSkinToneSelect,
  selectedGender,
  selectedHotel
}: SkinToneBarProps) => {

  const getPreviewUrl = (toneId: string) => {
    const hotel = selectedHotel.includes('.') 
      ? selectedHotel 
      : selectedHotel === 'com' ? 'habbo.com' : `habbo.${selectedHotel}`;
    
    return `https://www.${hotel}/habbo-imaging/avatarimage?figure=hd-180-${toneId}&gender=${selectedGender}&direction=2&head_direction=2&size=s&headonly=1`;
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 mb-4">
      <div className="text-xs font-medium text-gray-700 mb-2 text-center">Tom de Pele</div>
      <div className="flex items-center justify-center gap-2">
        {SKIN_TONES.map((tone, index) => (
          <div key={tone.id} className="relative">
            <Button
              variant="ghost"
              size="sm"
              className={`w-10 h-10 p-0 rounded-full border-2 transition-all duration-300 ${
                selectedSkinTone === tone.id 
                  ? 'border-orange-400 scale-110 shadow-lg ring-2 ring-orange-200' 
                  : 'border-orange-200 hover:border-orange-300 hover:scale-105'
              }`}
              style={{ backgroundColor: tone.hex }}
              onClick={() => onSkinToneSelect(tone.id)}
              title={tone.name}
            >
              <img
                src={getPreviewUrl(tone.id)}
                alt={tone.name}
                className="w-6 h-6 rounded-full object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.emoji-fallback')) {
                    const span = document.createElement('span');
                    span.className = 'emoji-fallback text-xs';
                    span.textContent = '😊';
                    parent.appendChild(span);
                  }
                }}
              />
            </Button>
            
            {/* Gradient connector */}
            {index < SKIN_TONES.length - 1 && (
              <div 
                className="absolute top-1/2 left-full w-1 h-2 transform -translate-y-1/2"
                style={{
                  background: `linear-gradient(to right, ${tone.hex}, ${SKIN_TONES[index + 1].hex})`
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
