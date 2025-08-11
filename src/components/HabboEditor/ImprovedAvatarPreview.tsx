
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
}

export const ImprovedAvatarPreview: React.FC<AvatarPreviewProps> = ({
  figureString,
  onRandomize,
  selectedGender = 'U',
  selectedHotel = 'com'
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
