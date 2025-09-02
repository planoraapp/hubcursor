
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarPreviewProps {
  figureString: string;
  onRandomize?: () => void;
  selectedGender?: 'M' | 'F' | 'U';
  selectedHotel?: string;
  onGenderChange?: (gender: 'M' | 'F' | 'U') => void;
  onHotelChange?: (hotel: string) => void;
  onReset?: () => void;
}

export const ImprovedAvatarPreview: React.FC<AvatarPreviewProps> = ({
  figureString,
  onRandomize,
  selectedGender = 'U',
  selectedHotel = 'com',
  onGenderChange,
  onHotelChange,
  onReset
}) => {
  const { toast } = useToast();

  const avatarImageUrl = useMemo(() => {
    return `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${figureString}&gender=${selectedGender}&direction=2&head_direction=2&size=l`;
  }, [figureString, selectedGender, selectedHotel]);

  const handleCopyFigure = () => {
    navigator.clipboard.writeText(figureString);
    toast({
      title: "📋 Figure copiada!",
      description: `Figure string copiada: ${figureString}`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Preview Avatar</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Gender Selection */}
        {onGenderChange && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Gênero:</label>
            <div className="flex gap-1">
              {(['M', 'F'] as const).map((gender) => (
                <Button
                  key={gender}
                  variant={selectedGender === gender ? "default" : "outline"}
                  size="sm"
                  onClick={() => onGenderChange(gender)}
                  className="flex-1 text-xs"
                >
                  {gender === 'M' ? '♂️' : '♀️'}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Hotel Selection */}
        {onHotelChange && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Hotel:</label>
            <select
              value={selectedHotel}
              onChange={(e) => onHotelChange(e.target.value)}
              className="w-full text-xs p-1 border rounded"
            >
              <option value="com">Habbo.com</option>
              <option value="com.br">Habbo.com.br</option>
              <option value="es">Habbo.es</option>
              <option value="fr">Habbo.fr</option>
            </select>
          </div>
        )}

        {/* Avatar Image */}
        <div className="flex justify-center">
          <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <img
              src={avatarImageUrl}
              alt="Avatar Preview"
              className="w-24 h-32 object-contain"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/LogoHabbo.png';
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm" 
            onClick={handleCopyFigure}
            className="flex-1 text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copiar Figure
          </Button>
          {onRandomize && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRandomize}
              className="flex-1 text-xs"
            >
              <Shuffle className="w-3 h-3 mr-1" />
              Randomizar
            </Button>
          )}
          {onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="flex-1 text-xs"
            >
              🔄 Reset
            </Button>
          )}
        </div>

        {/* Figure String Display */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Figure String:</label>
          <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
            {figureString}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
