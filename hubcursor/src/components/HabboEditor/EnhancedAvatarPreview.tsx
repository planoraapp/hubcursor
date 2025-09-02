
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, RotateCcw, Trash2, Eye, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarState extends Record<string, string> {
  hd?: string;
  hr?: string;
  ch?: string;
  lg?: string;
  sh?: string;
  ha?: string;
  ea?: string;
  cc?: string;
  ca?: string;
  wa?: string;
  cp?: string;
}

interface EnhancedAvatarPreviewProps {
  figureString: string;
  selectedGender: 'M' | 'F' | 'U';
  selectedHotel: string;
  avatarState: AvatarState;
  onGenderChange: (gender: 'M' | 'F' | 'U') => void;
  onHotelChange: (hotel: string) => void;
  onRemoveItem: (category: string) => void;
  onResetAvatar: () => void;
}

const EnhancedAvatarPreview = ({
  figureString,
  selectedGender,
  selectedHotel,
  avatarState,
  onGenderChange,
  onHotelChange,
  onRemoveItem,
  onResetAvatar
}: EnhancedAvatarPreviewProps) => {
  const [showDebug, setShowDebug] = useState(false);
  const [previewSize, setPreviewSize] = useState<'s' | 'l'>('l');
  const { toast } = useToast();

  const avatarImageUrl = useMemo(() => {
    const url = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${figureString}&gender=${selectedGender}&direction=2&head_direction=2&size=${previewSize}`;
    
    console.log('🖼️ [AvatarPreview] Generated avatar URL:', {
      figureString,
      gender: selectedGender,
      hotel: selectedHotel,
      size: previewSize,
      url
    });
    
    return url;
  }, [figureString, selectedGender, selectedHotel, previewSize]);

  const handleCopyFigure = () => {
    navigator.clipboard.writeText(figureString);
    toast({
      title: "📋 Figure copiada!",
      description: `Figure string copiada: ${figureString}`,
    });
  };

  const categoryNames = {
    hd: 'Rosto',
    hr: 'Cabelo',
    ch: 'Camiseta', 
    cc: 'Casaco',
    lg: 'Calça',
    sh: 'Sapato',
    ha: 'Chapéu',
    ea: 'Óculos',
    ca: 'Acess. Peito',
    wa: 'Cintura',
    cp: 'Estampa'
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview Avatar
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs"
            >
              <Settings className="w-3 h-3" />
              {showDebug ? 'Ocultar' : 'Debug'}
            </Button>
          </div>
        </div>
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
              onLoad={() => console.log('✅ [AvatarPreview] Avatar image loaded successfully')}
              onError={() => console.error('❌ [AvatarPreview] Avatar image failed to load:', avatarImageUrl)}
            />
            
            {/* Size Toggle */}
            <div className="absolute top-1 right-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewSize(previewSize === 's' ? 'l' : 's')}
                className="text-xs px-2 py-1"
              >
                {previewSize.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Gender Selection */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Gênero</label>
            <Select value={selectedGender} onValueChange={onGenderChange}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">👨 Masculino</SelectItem>
                <SelectItem value="F">👩 Feminino</SelectItem>
                <SelectItem value="U">👤 Unissex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hotel Selection */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Hotel</label>
            <Select value={selectedHotel} onValueChange={onHotelChange}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="com">🇺🇸 Habbo.com</SelectItem>
                <SelectItem value="fr">🇫🇷 Habbo.fr</SelectItem>
                <SelectItem value="com.br">🇧🇷 Habbo.com.br</SelectItem>
                <SelectItem value="es">🇪🇸 Habbo.es</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Avatar Parts */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">Peças Aplicadas</label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(avatarState).map(([category, value]) => {
              if (!value) return null;
              
              const [figureId, colorId] = value.split('-');
              const categoryName = categoryNames[category as keyof typeof categoryNames] || category.toUpperCase();
              
              return (
                <div key={category} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                  <div className="text-xs">
                    <span className="font-medium">{categoryName}</span>
                    <span className="text-gray-500 ml-1">({figureId}-{colorId})</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(category)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
            
            {Object.keys(avatarState).length === 0 && (
              <div className="text-xs text-gray-500 text-center py-2">
                Nenhuma peça aplicada
              </div>
            )}
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
          <Button
            variant="outline"
            size="sm"
            onClick={onResetAvatar}
            className="flex-1 text-xs text-orange-600 hover:text-orange-700"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>

        {/* Debug Information */}
        {showDebug && (
          <div className="border-t pt-3 mt-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Debug Info</h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-medium">Figure String:</span>
                <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-[10px] break-all">
                  {figureString}
                </div>
              </div>
              <div>
                <span className="font-medium">Avatar URL:</span>
                <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-[10px] break-all">
                  {avatarImageUrl}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div><strong>Gênero:</strong> {selectedGender}</div>
                <div><strong>Hotel:</strong> {selectedHotel}</div>
                <div><strong>Tamanho:</strong> {previewSize}</div>
                <div><strong>Peças:</strong> {Object.keys(avatarState).length}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAvatarPreview;
