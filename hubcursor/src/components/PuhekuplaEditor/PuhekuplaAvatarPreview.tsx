
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download, Shuffle, RotateCcw, User } from 'lucide-react';

interface PuhekuplaAvatarPreviewProps {
  currentFigure: string;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  currentDirection: string;
  hotels: Array<{ code: string; name: string; flag: string; }>;
  onRotateAvatar: () => void;
  onCopyFigure: () => void;
  onCopyUrl: () => void;
  onDownloadAvatar: () => void;
  onRandomizeAvatar: () => void;
  onGenderChange: (gender: 'M' | 'F') => void;
  onHotelChange: (hotel: string) => void;
}

const PuhekuplaAvatarPreview: React.FC<PuhekuplaAvatarPreviewProps> = ({
  currentFigure,
  selectedGender,
  selectedHotel,
  currentDirection,
  hotels,
  onRotateAvatar,
  onCopyFigure,
  onCopyUrl,
  onDownloadAvatar,
  onRandomizeAvatar,
  onGenderChange,
  onHotelChange,
}) => {
  const getAvatarUrl = (size: 'l' | 'm' | 's' = 'l') => {
    const hotel = hotels.find(h => h.code === selectedHotel);
    const baseUrl = hotel?.code === 'com' ? 'habbo.com' : `habbo.${hotel?.code}`;
    return `https://www.${baseUrl}/habbo-imaging/avatarimage?figure=${currentFigure}&size=${size}&direction=${currentDirection}&head_direction=${currentDirection}&action=std&gesture=std`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Avatar Preview */}
      <div className="lg:col-span-2">
        <Card className="bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-300 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-purple-800 flex items-center justify-center gap-2">
              <User className="w-6 h-6" />
              Preview do Avatar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-6">
              <div className="bg-white/90 rounded-full p-8 shadow-inner border-4 border-purple-200">
                <img 
                  src={getAvatarUrl('l')} 
                  alt="Avatar Preview" 
                  className="w-32 h-32 mx-auto cursor-pointer hover:scale-110 transition-transform duration-300"
                  onClick={onRotateAvatar}
                  title="Clique para girar o avatar"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white">
                {hotels.find(h => h.code === selectedHotel)?.flag} {hotels.find(h => h.code === selectedHotel)?.name}
              </Badge>
            </div>
            
            {/* Figure String Display */}
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm break-all mb-4 border-2 border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Figure String:</div>
              {currentFigure}
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" size="sm" onClick={onCopyFigure} className="hover:bg-purple-50">
                <Copy className="w-4 h-4 mr-1" />
                Figure
              </Button>
              <Button variant="outline" size="sm" onClick={onCopyUrl} className="hover:bg-blue-50">
                <Copy className="w-4 h-4 mr-1" />
                URL
              </Button>
              <Button variant="outline" size="sm" onClick={onDownloadAvatar} className="hover:bg-green-50">
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={onRotateAvatar} className="hover:bg-orange-50">
                <RotateCcw className="w-4 h-4 mr-1" />
                Girar
              </Button>
            </div>
            
            <Button onClick={onRandomizeAvatar} className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Shuffle className="w-4 h-4 mr-2" />
              Randomizar Avatar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Gender Selection */}
        <Card className="bg-white/80 border-2 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-800">Gênero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedGender === 'M' ? 'default' : 'outline'}
                onClick={() => onGenderChange('M')}
                className={selectedGender === 'M' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}
              >
                👨 Masculino
              </Button>
              <Button
                variant={selectedGender === 'F' ? 'default' : 'outline'}
                onClick={() => onGenderChange('F')}
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

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">✨</div>
            <div className="text-sm font-medium text-yellow-800 mb-1">
              Editor Puhekupla
            </div>
            <div className="text-xs text-yellow-700">
              Acesso a milhares de itens exclusivos
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PuhekuplaAvatarPreview;
