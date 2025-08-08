
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Shuffle, User, MessageCircle, HandMetal, Camera } from 'lucide-react';

interface ImprovedAvatarPreviewProps {
  figureString: string;
  onRandomize: () => void;
}

const ImprovedAvatarPreview: React.FC<ImprovedAvatarPreviewProps> = ({
  figureString,
  onRandomize
}) => {
  const [direction, setDirection] = useState(2); // 0-7 directions (8 total)
  const [action, setAction] = useState('std'); // std, wav, spk, etc.

  const directions = [0, 1, 2, 3, 4, 5, 6, 7];
  const actions = [
    { id: 'std', icon: <User className="w-4 h-4" />, name: 'Parado' },
    { id: 'wav', icon: <HandMetal className="w-4 h-4" />, name: 'Acenar' },
    { id: 'spk', icon: <MessageCircle className="w-4 h-4" />, name: 'Falar' },
    { id: 'sit', icon: <User className="w-4 h-4" />, name: 'Sentar' }
  ];

  const rotateAvatar = () => {
    setDirection((prev) => (prev + 1) % 8);
  };

  const changeAction = (newAction: string) => {
    setAction(newAction);
  };

  const getAvatarUrl = () => {
    const baseUrl = 'https://www.habbo.com/habbo-imaging/avatarimage';
    return `${baseUrl}?figure=${figureString}&direction=${direction}&head_direction=${direction}&action=${action}&size=l`;
  };

  return (
    <div className="bg-white border-2 border-black p-4 space-y-4">
      {/* Avatar Display */}
      <div 
        className="bg-gray-100 border border-gray-300 h-64 flex items-center justify-center cursor-pointer"
        onClick={rotateAvatar}
      >
        <img
          src={getAvatarUrl()}
          alt="Avatar Preview"
          className="max-h-full max-w-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Control Buttons Row */}
      <div className="flex gap-2 justify-center flex-wrap">
        {/* Randomize Button */}
        <Button
          onClick={onRandomize}
          size="sm"
          variant="outline"
          className="border-black hover:bg-gray-100"
        >
          <Shuffle className="w-4 h-4" />
        </Button>

        {/* Rotate Button */}
        <Button
          onClick={rotateAvatar}
          size="sm"
          variant="outline"
          className="border-black hover:bg-gray-100"
        >
          <RotateCw className="w-4 h-4" />
        </Button>

        {/* Action Buttons */}
        {actions.map((actionItem) => (
          <Button
            key={actionItem.id}
            onClick={() => changeAction(actionItem.id)}
            size="sm"
            variant={action === actionItem.id ? "default" : "outline"}
            className={`border-black ${action === actionItem.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            title={actionItem.name}
          >
            {actionItem.icon}
          </Button>
        ))}
      </div>

      {/* Direction Indicator */}
      <div className="text-center text-sm text-gray-600">
        Direção: {direction + 1}/8 | Ação: {actions.find(a => a.id === action)?.name}
      </div>
    </div>
  );
};

export default ImprovedAvatarPreview;
