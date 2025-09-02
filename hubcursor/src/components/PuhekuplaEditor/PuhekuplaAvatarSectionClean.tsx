
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Copy, 
  Download, 
  Shuffle, 
  RotateCcw, 
  Share2,
  User,
  Heart
} from 'lucide-react';
import { PuhekuplaFigureManager, PuhekuplaFigure } from '@/lib/puhekuplaFigureManager';
import { useToast } from '@/hooks/use-toast';

interface PuhekuplaAvatarSectionCleanProps {
  currentFigure: PuhekuplaFigure;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  currentDirection: string;
  hotels: Array<{ code: string; name: string; flag: string; }>;
  onFigureChange: (figure: PuhekuplaFigure) => void;
  onDirectionChange: (direction: string) => void;
  onGenderChange: (gender: 'M' | 'F') => void;
  onHotelChange: (hotel: string) => void;
}

const PuhekuplaAvatarSectionClean: React.FC<PuhekuplaAvatarSectionCleanProps> = ({
  currentFigure,
  selectedGender,
  selectedHotel,
  currentDirection,
  hotels,
  onFigureChange,
  onDirectionChange,
  onGenderChange,
  onHotelChange,
}) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  const figureString = PuhekuplaFigureManager.figureToString(currentFigure);

  const getAvatarUrl = (size: 'l' | 'm' | 's' = 'l') => {
    const hotel = hotels.find(h => h.code === selectedHotel);
    const baseUrl = hotel?.code === 'com' ? 'habbo.com' : `habbo.${hotel?.code}`;
    return `https://www.${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&size=${size}&direction=${currentDirection}&head_direction=${currentDirection}&action=std&gesture=std`;
  };

  const handleRotateAvatar = () => {
    const directions = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = (currentIndex + 1) % directions.length;
    onDirectionChange(directions[nextIndex]);
  };

  const handleCopyFigure = async () => {
    try {
      await navigator.clipboard.writeText(figureString);
      toast({
        title: "✅ Figure copiada!",
        description: "A figure string foi copiada para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "❌ Erro ao copiar",
        description: "Não foi possível copiar a figure string.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadAvatar = () => {
    const url = getAvatarUrl('l');
    const link = document.createElement('a');
    link.href = url;
    link.download = `avatar-${figureString.substring(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "📥 Download iniciado!",
      description: "O avatar está sendo baixado.",
    });
  };

  const handleRandomizeAvatar = () => {
    const randomFigure = PuhekuplaFigureManager.generateRandomFigure(selectedGender);
    onFigureChange(randomFigure);
    
    toast({
      title: "🎲 Avatar randomizado!",
      description: "Um novo avatar foi gerado aleatoriamente.",
    });
  };

  const handleResetAvatar = () => {
    const defaultFigure = PuhekuplaFigureManager.getDefaultFigure(selectedGender);
    onFigureChange(defaultFigure);
    
    toast({
      title: "🔄 Avatar resetado!",
      description: "O avatar foi resetado para o padrão.",
    });
  };

  const handleShareAvatar = async () => {
    const shareUrl = `${window.location.origin}/editor?figure=${encodeURIComponent(figureString)}&gender=${selectedGender}&hotel=${selectedHotel}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "🔗 Link copiado!",
        description: "Link de compartilhamento copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "❌ Erro ao compartilhar",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "💔 Removido dos favoritos" : "❤️ Adicionado aos favoritos",
      description: isFavorite ? "Avatar removido da lista de favoritos." : "Avatar salvo na lista de favoritos.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Avatar Display */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <User className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Avatar Preview</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className={`p-1 h-auto ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
              >
                <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
              </Button>
            </div>
            
            {/* Avatar Image */}
            <div className="relative inline-block mb-3">
              <img 
                src={getAvatarUrl('l')} 
                alt="Avatar Preview" 
                className="w-32 h-32 mx-auto cursor-pointer hover:scale-110 transition-transform duration-300 rounded-lg bg-white/50 p-2"
                onClick={handleRotateAvatar}
                title="Clique para girar o avatar"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0NEg4OFY4NEg0MFY0NFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                }}
              />
              <Badge className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs">
                {hotels.find(h => h.code === selectedHotel)?.flag} {hotels.find(h => h.code === selectedHotel)?.name}
              </Badge>
            </div>

            {/* Action Buttons Row */}
            <div className="flex justify-center gap-2 mb-3">
              <Button variant="outline" size="sm" onClick={handleCopyFigure} title="Copiar Figure">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadAvatar} title="Download">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRotateAvatar} title="Girar">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareAvatar} title="Compartilhar">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={handleRandomizeAvatar} 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                size="sm"
              >
                <Shuffle className="w-4 h-4 mr-1" />
                Random
              </Button>
              
              <Button variant="outline" onClick={handleResetAvatar} size="sm">
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Figure String */}
      <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all border">
        <div className="text-gray-600 mb-1">Figure:</div>
        <div className="text-gray-800">{figureString}</div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Gender Selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Gênero</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedGender === 'M' ? 'default' : 'outline'}
              onClick={() => {
                onGenderChange('M');
                const newFigure = PuhekuplaFigureManager.getDefaultFigure('M');
                onFigureChange(newFigure);
              }}
              className={`text-sm ${selectedGender === 'M' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}`}
              size="sm"
            >
              👨 Masculino
            </Button>
            <Button
              variant={selectedGender === 'F' ? 'default' : 'outline'}
              onClick={() => {
                onGenderChange('F');
                const newFigure = PuhekuplaFigureManager.getDefaultFigure('F');
                onFigureChange(newFigure);
              }}
              className={`text-sm ${selectedGender === 'F' ? 'bg-pink-600 hover:bg-pink-700' : 'hover:bg-pink-50'}`}
              size="sm"
            >
              👩 Feminino
            </Button>
          </div>
        </div>

        {/* Hotel Selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Hotel</label>
          <Select value={selectedHotel} onValueChange={onHotelChange}>
            <SelectTrigger className="border-purple-200 focus:border-purple-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hotels.map(hotel => (
                <SelectItem key={hotel.code} value={hotel.code}>
                  {hotel.flag} {hotel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PuhekuplaAvatarSectionClean;
