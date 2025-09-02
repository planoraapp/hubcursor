
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Shuffle, RotateCcw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UnifiedAvatarPreviewProps {
  figureString: string;
  selectedGender: 'M' | 'F' | 'U';
  selectedHotel: string;
  onGenderChange?: (gender: 'M' | 'F' | 'U') => void;
  onHotelChange?: (hotel: string) => void;
  onRandomize?: () => void;
  onReset?: () => void;
  className?: string;
}

export const UnifiedAvatarPreview: React.FC<UnifiedAvatarPreviewProps> = ({
  figureString,
  selectedGender,
  selectedHotel,
  onGenderChange,
  onHotelChange,
  onRandomize,
  onReset,
  className = ''
}) => {
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const avatarImageUrl = useMemo(() => {
    const baseUrl = selectedHotel.includes('.') 
      ? `https://www.habbo.${selectedHotel}`
      : `https://www.habbo.com`;
    
    return `${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&gender=${selectedGender}&direction=2&head_direction=3&size=l&action=std&gesture=std`;
  }, [figureString, selectedGender, selectedHotel]);

  const handleCopyFigure = async () => {
    try {
      await navigator.clipboard.writeText(figureString);
      toast({
        title: "📋 Copiado!",
        description: "Figure string copiada para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível copiar",
        variant: "destructive"
      });
    }
  };

  const handleCopyImage = async () => {
    try {
      await navigator.clipboard.writeText(avatarImageUrl);
      toast({
        title: "🖼️ URL copiada!",
        description: "URL da imagem copiada para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível copiar a URL",
        variant: "destructive"
      });
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-center">
          🎨 Preview Avatar
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Gender Selection */}
        {onGenderChange && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Gênero:</label>
            <div className="flex gap-2">
              {(['M', 'F', 'U'] as const).map((gender) => (
                <Button
                  key={gender}
                  variant={selectedGender === gender ? "default" : "outline"}
                  size="sm"
                  onClick={() => onGenderChange(gender)}
                  className="flex-1 text-sm"
                >
                  {gender === 'M' ? '♂️ Masculino' : gender === 'F' ? '♀️ Feminino' : '⚧ Unissex'}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Hotel Selection */}
        {onHotelChange && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hotel:</label>
            <select
              value={selectedHotel}
              onChange={(e) => onHotelChange(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm"
            >
              <option value="com">🌍 Habbo.com (Global)</option>
              <option value="com.br">🇧🇷 Habbo.com.br (Brasil)</option>
              <option value="es">🇪🇸 Habbo.es (España)</option>
              <option value="fr">🇫🇷 Habbo.fr (France)</option>
              <option value="de">🇩🇪 Habbo.de (Deutschland)</option>
              <option value="it">🇮🇹 Habbo.it (Italia)</option>
            </select>
          </div>
        )}

        {/* Avatar Display */}
        <div className="flex justify-center">
          <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 border-2 border-dashed border-gray-300 min-h-[200px] flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {imageError ? (
              <div className="text-center">
                <div className="text-6xl mb-2">❌</div>
                <p className="text-sm text-gray-500">Erro ao carregar avatar</p>
              </div>
            ) : (
              <img
                src={avatarImageUrl}
                alt="Avatar Preview"
                className={`max-w-[120px] max-h-[160px] object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                style={{ imageRendering: 'pixelated' }}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyFigure}
            className="text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copiar Figure
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyImage}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Copiar URL
          </Button>
          
          {onRandomize && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRandomize}
              className="text-xs"
            >
              <Shuffle className="w-3 h-3 mr-1" />
              Aleatório
            </Button>
          )}
          
          {onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Resetar
            </Button>
          )}
        </div>

        {/* Figure String Display */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Figure String:</label>
          <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono break-all border">
            {figureString || 'Nenhuma figure definida'}
          </div>
        </div>

        {/* Avatar Stats */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>🎨 Parts: {figureString.split('.').length}</p>
          <p>🌐 Hotel: {selectedHotel}</p>
          <p>⚧ Gênero: {selectedGender}</p>
        </div>
      </CardContent>
    </Card>
  );
};
