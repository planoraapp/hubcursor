
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, RotateCcw, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarPreviewProps {
  figureString: string;
  selectedGender: 'M' | 'F' | 'U';
  selectedHotel: string;
  onGenderChange: (gender: 'M' | 'F' | 'U') => void;
  onHotelChange: (hotel: string) => void;
  onReset: () => void;
}

export const ImprovedAvatarPreview: React.FC<AvatarPreviewProps> = ({
  figureString,
  selectedGender,
  selectedHotel,
  onGenderChange,
  onHotelChange,
  onReset
}) => {
  const [previewSize, setPreviewSize] = useState<'s' | 'l'>('l');
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toast } = useToast();

  const avatarImageUrl = useMemo(() => {
    const hotelDomain = selectedHotel === 'com.br' ? 'com.br' : selectedHotel;
    const baseUrl = `https://www.habbo.${hotelDomain}`;
    const actualGender = selectedGender === 'U' ? 'M' : selectedGender;
    
    return `${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&gender=${actualGender}&direction=2&head_direction=2&size=${previewSize}&action=std&gesture=std`;
  }, [figureString, selectedGender, selectedHotel, previewSize]);

  const handleCopyFigure = () => {
    navigator.clipboard.writeText(figureString);
    toast({
      title: "📋 Figure copiada!",
      description: `Figure string: ${figureString}`,
    });
  };

  const handleDownloadAvatar = () => {
    const link = document.createElement('a');
    link.href = avatarImageUrl;
    link.download = `habbo-avatar-${figureString.slice(0, 20)}.png`;
    link.click();
    
    toast({
      title: "⬇️ Download iniciado!",
      description: "Imagem do avatar salva",
    });
  };

  const figureParts = useMemo(() => {
    return figureString.split('.').map(part => {
      const [category, id, color] = part.split('-');
      return { category, id, color };
    }).filter(part => part.category && part.id);
  }, [figureString]);

  return (
    <Card className="w-full h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview do Avatar
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {figureParts.length} peças
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Avatar Display */}
        <div className="flex justify-center">
          <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
            <div className="relative">
              <img
                src={avatarImageUrl}
                alt="Avatar Preview"
                className={`w-24 h-32 object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-50'
                }`}
                style={{ imageRendering: 'pixelated' }}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  console.error('❌ Avatar image failed to load:', avatarImageUrl);
                  setImageLoaded(false);
                }}
              />
              
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            {/* Size Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewSize(previewSize === 's' ? 'l' : 's')}
              className="absolute top-2 right-2 text-xs px-2 py-1"
            >
              {previewSize.toUpperCase()}
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Gênero</label>
            <Select value={selectedGender} onValueChange={onGenderChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">👨 Masculino</SelectItem>
                <SelectItem value="F">👩 Feminino</SelectItem>
                <SelectItem value="U">👤 Unissex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Hotel</label>
            <Select value={selectedHotel} onValueChange={onHotelChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="com">🇺🇸 .com</SelectItem>
                <SelectItem value="com.br">🇧🇷 .com.br</SelectItem>
                <SelectItem value="es">🇪🇸 .es</SelectItem>
                <SelectItem value="fr">🇫🇷 .fr</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Figure Parts Display */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Peças Aplicadas</label>
          <div className="space-y-1 max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
            {figureParts.length > 0 ? (
              figureParts.map((part, index) => (
                <div key={index} className="flex items-center justify-between text-xs bg-white rounded px-2 py-1">
                  <span className="font-medium">{part.category.toUpperCase()}</span>
                  <span className="text-gray-600">{part.id}-{part.color}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500 text-center py-2">
                Nenhuma peça aplicada
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm" 
            onClick={handleCopyFigure}
            className="text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAvatar}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Baixar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-xs text-orange-600 hover:text-orange-700"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>

        {/* Figure String Display */}
        <div className="border-t pt-3">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Figure String</label>
          <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all text-gray-800">
            {figureString}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
