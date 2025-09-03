
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AvatarPreviewWithControlsProps {
  figureString: string;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onFigureChange?: (newFigure: string) => void;
}

// Avatar directions (8-directional, clockwise)
const AVATAR_DIRECTIONS = [
  { direction: '0', name: 'Norte' },
  { direction: '1', name: 'Nordeste' },
  { direction: '2', name: 'Leste' },
  { direction: '3', name: 'Sudeste' },
  { direction: '4', name: 'Sul' },
  { direction: '5', name: 'Sudoeste' },
  { direction: '6', name: 'Oeste' },
  { direction: '7', name: 'Noroeste' }
];

// Avatar gestures/actions
const AVATAR_GESTURES = [
  { action: 'std', gesture: 'std', name: 'Normal', icon: '🧍' },
  { action: 'wlk', gesture: 'std', name: 'Andar', icon: '🚶' },
  { action: 'sit', gesture: 'std', name: 'Sentar', icon: '🪑' },
  { action: 'lay', gesture: 'std', name: 'Deitar', icon: '🛏️' },
  { action: 'std', gesture: 'spk', name: 'Falar', icon: '💬' },
  { action: 'std', gesture: 'eyb', name: 'Piscada', icon: '😉' },
  { action: 'wav', gesture: 'std', name: 'Acenar', icon: '👋' },
  { action: 'std', gesture: 'sml', name: 'Sorrir', icon: '😊' }
];

export const AvatarPreviewWithControls = ({
  figureString,
  selectedGender,
  selectedHotel,
  onFigureChange
}: AvatarPreviewWithControlsProps) => {
  const [currentDirectionIndex, setCurrentDirectionIndex] = useState(2); // Start facing east
  const [currentGesture, setCurrentGesture] = useState(AVATAR_GESTURES[0]);

  const getCurrentDirection = () => AVATAR_DIRECTIONS[currentDirectionIndex];

  const handleAvatarClick = () => {
    const nextIndex = (currentDirectionIndex + 1) % AVATAR_DIRECTIONS.length;
    setCurrentDirectionIndex(nextIndex);
  };

  const getAvatarUrl = () => {
    const hotel = selectedHotel.includes('.') 
      ? selectedHotel 
      : selectedHotel === 'com' ? 'habbo.com' : `habbo.${selectedHotel}`;
    
    const { direction } = getCurrentDirection();
    
    return `https://www.${hotel}/habbo-imaging/avatarimage?figure=${figureString}&size=l&direction=${direction}&head_direction=${direction}&action=${currentGesture.action}&gesture=${currentGesture.gesture}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 justify-between">
          <span>👤 Preview Avatar</span>
          <Badge variant="outline" className="text-xs">
            {getCurrentDirection().name}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Avatar Display - Clickable for rotation */}
        <div className="flex justify-center">
          <div 
            className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-dashed border-gray-300 cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={handleAvatarClick}
            title={`Clique para girar (${getCurrentDirection().name})`}
          >
            <img
              src={getAvatarUrl()}
              alt="Avatar Preview"
              className="w-32 h-40 object-contain"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                // Fallback URL
                const target = e.currentTarget;
                const hotel = selectedHotel === 'com' ? 'habbo.com' : `habbo.${selectedHotel}`;
                const { direction } = getCurrentDirection();
                target.src = `https://www.${hotel}/habbo-imaging/avatarimage?figure=hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1&size=l&direction=${direction}&head_direction=${direction}&action=std&gesture=std`;
              }}
            />
            
            {/* Rotation indicator */}
            <div className="absolute top-1 right-1 bg-black/50 text-white px-1 py-0.5 rounded text-xs">
              {getCurrentDirection().direction}
            </div>
          </div>
        </div>

        {/* Gesture Controls */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">Gestos & Ações</label>
          <div className="grid grid-cols-4 gap-1">
            {AVATAR_GESTURES.map((gesture) => (
              <Button
                key={`${gesture.action}-${gesture.gesture}`}
                variant={currentGesture === gesture ? "default" : "outline"}
                size="sm"
                className="text-xs p-1 h-8"
                onClick={() => setCurrentGesture(gesture)}
                title={gesture.name}
              >
                <span className="mr-1">{gesture.icon}</span>
                {gesture.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Avatar Info */}
        <div className="text-center pt-2 border-t">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">{currentGesture.name}</span> • <span className="font-semibold">{getCurrentDirection().name}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Clique no avatar para girar
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
