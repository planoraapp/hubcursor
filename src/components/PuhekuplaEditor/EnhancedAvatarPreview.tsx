
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download, Shuffle, RotateCcw, User, Heart, History, Share2, Palette } from 'lucide-react';
import { PuhekuplaFigureManager, PuhekuplaFigure } from '@/lib/puhekuplaFigureManager';
import { useToast } from '@/hooks/use-toast';

interface EnhancedAvatarPreviewProps {
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

const EnhancedAvatarPreview: React.FC<EnhancedAvatarPreviewProps> = ({
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
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<PuhekuplaFigure[]>([]);

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

  const handleCopyUrl = async () => {
    const url = getAvatarUrl('l');
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "✅ URL copiada!",
        description: "A URL da imagem foi copiada para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "❌ Erro ao copiar",
        description: "Não foi possível copiar a URL.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadAvatar = () => {
    const url = getAvatarUrl('l');
    const link = document.createElement('a');
    link.href = url;
    link.download = `avatar-${figureString}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "📥 Download iniciado!",
      description: "O avatar está sendo baixado.",
    });
  };

  const handleRandomizeAvatar = () => {
    setIsLoading(true);
    setTimeout(() => {
      const randomFigure = PuhekuplaFigureManager.generateRandomFigure(selectedGender);
      onFigureChange(randomFigure);
      addToHistory(randomFigure);
      setIsLoading(false);
      
      toast({
        title: "🎲 Avatar randomizado!",
        description: "Um novo avatar foi gerado aleatoriamente.",
      });
    }, 500);
  };

  const handleResetAvatar = () => {
    const defaultFigure = PuhekuplaFigureManager.getDefaultFigure(selectedGender);
    onFigureChange(defaultFigure);
    addToHistory(defaultFigure);
    
    toast({
      title: "🔄 Avatar resetado!",
      description: "O avatar foi resetado para o padrão.",
    });
  };

  const addToHistory = (figure: PuhekuplaFigure) => {
    const newHistory = [figure, ...history.slice(0, 9)]; // Keep last 10
    setHistory(newHistory);
  };

  const toggleFavorite = () => {
    const isFavorited = favorites.includes(figureString);
    if (isFavorited) {
      setFavorites(favorites.filter(f => f !== figureString));
      toast({
        title: "💔 Removido dos favoritos",
        description: "Avatar removido da lista de favoritos.",
      });
    } else {
      setFavorites([...favorites, figureString]);
      toast({
        title: "❤️ Adicionado aos favoritos",
        description: "Avatar salvo na lista de favoritos.",
      });
    }
  };

  const handleShareAvatar = async () => {
    const shareUrl = `${window.location.origin}/editor-puhekupla?figure=${encodeURIComponent(figureString)}&gender=${selectedGender}&hotel=${selectedHotel}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Avatar Puhekupla',
          text: 'Confira meu avatar criado no Editor Puhekupla!',
          url: shareUrl,
        });
      } catch (err) {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "🔗 Link copiado!",
          description: "Link de compartilhamento copiado para a área de transferência.",
        });
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "🔗 Link copiado!",
        description: "Link de compartilhamento copiado para a área de transferência.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Avatar Display */}
      <Card className="bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-300 shadow-lg overflow-hidden">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-purple-800 flex items-center justify-center gap-2">
            <User className="w-6 h-6" />
            Preview do Avatar
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={`ml-2 ${favorites.includes(figureString) ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart className="w-4 h-4" fill={favorites.includes(figureString) ? 'currentColor' : 'none'} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="relative inline-block mb-6">
            <div className="bg-white/90 rounded-full p-8 shadow-inner border-4 border-purple-200 relative overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              )}
              <img 
                src={getAvatarUrl('l')} 
                alt="Avatar Preview" 
                className="w-32 h-32 mx-auto cursor-pointer hover:scale-110 transition-transform duration-300"
                onClick={handleRotateAvatar}
                title="Clique para girar o avatar"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  console.error('Error loading avatar image');
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0NEg4OFY4NEg0MFY0NFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                }}
              />
            </div>
            <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white">
              {hotels.find(h => h.code === selectedHotel)?.flag} {hotels.find(h => h.code === selectedHotel)?.name}
            </Badge>
          </div>
          
          {/* Figure String Display */}
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm break-all mb-4 border-2 border-gray-200 max-w-full overflow-hidden">
            <div className="text-xs text-gray-500 mb-1">Figure String:</div>
            <div className="truncate" title={figureString}>{figureString}</div>
          </div>
          
          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={handleCopyFigure} className="hover:bg-purple-50">
              <Copy className="w-4 h-4 mr-1" />
              Figure
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyUrl} className="hover:bg-blue-50">
              <Copy className="w-4 h-4 mr-1" />
              URL
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadAvatar} className="hover:bg-green-50">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotateAvatar} className="hover:bg-orange-50">
              <RotateCcw className="w-4 h-4 mr-1" />
              Girar
            </Button>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button 
              onClick={handleRandomizeAvatar} 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              {isLoading ? 'Gerando...' : 'Randomizar'}
            </Button>
            
            <Button variant="outline" onClick={handleResetAvatar}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            
            <Button variant="outline" onClick={handleShareAvatar}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender Selection */}
        <Card className="bg-white/80 border-2 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-800">Gênero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedGender === 'M' ? 'default' : 'outline'}
                onClick={() => {
                  onGenderChange('M');
                  const newFigure = PuhekuplaFigureManager.getDefaultFigure('M');
                  onFigureChange(newFigure);
                }}
                className={selectedGender === 'M' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}
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
                className={selectedGender === 'F' ? 'bg-pink-600 hover:bg-pink-700' : 'hover:bg-pink-50'}
              >
                👩 Feminino
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hotel Selection */}
        <Card className="bg-white/80 border-2 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-800">Hotel</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* History Quick Access */}
      {history.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {history.slice(0, 5).map((figure, index) => {
                const historyFigureString = PuhekuplaFigureManager.figureToString(figure);
                const hotel = hotels.find(h => h.code === selectedHotel);
                const baseUrl = hotel?.code === 'com' ? 'habbo.com' : `habbo.${hotel?.code}`;
                const historyUrl = `https://www.${baseUrl}/habbo-imaging/avatarimage?figure=${historyFigureString}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
                
                return (
                  <button
                    key={index}
                    onClick={() => onFigureChange(figure)}
                    className="relative group"
                    title={`Avatar ${index + 1}: ${historyFigureString}`}
                  >
                    <img
                      src={historyUrl}
                      alt={`História ${index + 1}`}
                      className="w-12 h-12 rounded-lg bg-white/80 p-1 border-2 border-amber-200 hover:border-amber-400 transition-all duration-200 hover:scale-110"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {index + 1}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAvatarPreview;
