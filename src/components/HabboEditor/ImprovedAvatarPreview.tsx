
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shuffle, Copy, Download, RotateCw } from 'lucide-react';

interface ImprovedAvatarPreviewProps {
  figureString: string;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onFigureChange?: (newFigure: string) => void;
  onRandomize?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
}

// 8-directional system (0-7)
const AVATAR_DIRECTIONS = [
  { direction: '0', name: 'Norte', angle: 0 },
  { direction: '1', name: 'Nordeste', angle: 45 },
  { direction: '2', name: 'Leste', angle: 90 },
  { direction: '3', name: 'Sudeste', angle: 135 },
  { direction: '4', name: 'Sul', angle: 180 },
  { direction: '5', name: 'Sudoeste', angle: 225 },
  { direction: '6', name: 'Oeste', angle: 270 },
  { direction: '7', name: 'Noroeste', angle: 315 }
];

// Avatar actions with icons
const AVATAR_ACTIONS = [
  { 
    action: 'std', 
    gesture: 'std', 
    name: 'Normal',
    icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/stand.png'
  },
  { 
    action: 'wlk', 
    gesture: 'std', 
    name: 'Andar',
    icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/walk.png'
  },
  { 
    action: 'sit', 
    gesture: 'std', 
    name: 'Sentar',
    icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/sit.png'
  },
  { 
    action: 'lay', 
    gesture: 'std', 
    name: 'Deitar',
    icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/lay.png'
  },
  { 
    action: 'std', 
    gesture: 'spk', 
    name: 'Falar',
    icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/speak.png'
  },
  { 
    action: 'wav', 
    gesture: 'std', 
    name: 'Acenar',
    icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/wave.png'
  }
];

export const ImprovedAvatarPreview = ({
  figureString,
  selectedGender,
  selectedHotel,
  onFigureChange,
  onRandomize,
  onCopy,
  onDownload
}: ImprovedAvatarPreviewProps) => {
  const [currentDirectionIndex, setCurrentDirectionIndex] = useState(2); // Start facing east
  const [currentAction, setCurrentAction] = useState(AVATAR_ACTIONS[0]);

  const getCurrentDirection = () => AVATAR_DIRECTIONS[currentDirectionIndex];

  const handleAvatarClick = () => {
    const nextIndex = (currentDirectionIndex + 1) % AVATAR_DIRECTIONS.length;
    setCurrentDirectionIndex(nextIndex);
  };

  const handleActionChange = (action: typeof AVATAR_ACTIONS[0]) => {
    setCurrentAction(action);
  };

  const getAvatarUrl = () => {
    const hotel = selectedHotel.includes('.') 
      ? selectedHotel 
      : selectedHotel === 'com' ? 'habbo.com' : `habbo.${selectedHotel}`;
    
    const { direction } = getCurrentDirection();
    
    return `https://www.${hotel}/habbo-imaging/avatarimage?figure=${figureString}&size=l&direction=${direction}&head_direction=${direction}&action=${currentAction.action}&gesture=${currentAction.gesture}`;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Avatar Display - Clickable for 8-direction rotation */}
        <div className="flex justify-center mb-4">
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
                const target = e.currentTarget;
                const hotel = selectedHotel === 'com' ? 'habbo.com' : `habbo.${selectedHotel}`;
                const { direction } = getCurrentDirection();
                target.src = `https://www.${hotel}/habbo-imaging/avatarimage?figure=hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1&size=l&direction=${direction}&head_direction=${direction}&action=std&gesture=std`;
              }}
            />
            
            {/* Direction indicator */}
            <div className="absolute top-1 right-1 bg-black/50 text-white px-1 py-0.5 rounded text-xs">
              {getCurrentDirection().direction}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          {/* Action buttons on the left */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRandomize}
              className="w-8 h-8 p-0"
              title="Randomizar"
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="w-8 h-8 p-0"
              title="Copiar"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="w-8 h-8 p-0"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAvatarClick}
              className="w-8 h-8 p-0"
              title="Girar"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Avatar actions on the right */}
          <div className="flex gap-1">
            {AVATAR_ACTIONS.map((action) => (
              <Button
                key={`${action.action}-${action.gesture}`}
                variant={currentAction === action ? "default" : "ghost"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => handleActionChange(action)}
                title={action.name}
              >
                <img
                  src={action.icon}
                  alt={action.name}
                  className="w-5 h-5"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    // Fallback to text if image fails
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.text-fallback')) {
                      const span = document.createElement('span');
                      span.className = 'text-fallback text-xs';
                      span.textContent = action.name[0];
                      parent.appendChild(span);
                    }
                  }}
                />
              </Button>
            ))}
          </div>
        </div>

        {/* Current status */}
        <div className="text-center text-xs text-gray-600">
          {currentAction.name} • {getCurrentDirection().name}
        </div>
      </CardContent>
    </Card>
  );
};
