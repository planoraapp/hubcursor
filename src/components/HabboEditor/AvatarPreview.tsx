
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download, Upload, Shuffle, RotateCw, User, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarPreviewProps {
  figureString: string;
  selectedHotel: string;
  setSelectedHotel: (hotel: string) => void;
  username: string;
  setUsername: (username: string) => void;
  onRandomize: () => void;
  onCopyUrl: () => void;
  onExportFigure: () => void;
}

const AvatarPreview = ({ 
  figureString, 
  selectedHotel, 
  setSelectedHotel, 
  username, 
  setUsername, 
  onRandomize, 
  onCopyUrl, 
  onExportFigure 
}: AvatarPreviewProps) => {
  const { toast } = useToast();
  const [avatarDirection, setAvatarDirection] = useState('2');

  const getAvatarUrl = () => {
    return `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${figureString}&direction=${avatarDirection}&head_direction=3&size=l&img_format=png&gesture=std&action=std`;
  };

  const handleSearchUser = async () => {
    if (!username.trim()) {
      toast({
        title: "Digite um nome de usuário",
        description: "Por favor, insira um nome de usuário válido.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Buscando usuário...",
      description: `Procurando por ${username} no Habbo.${selectedHotel}`
    });
  };

  return (
    <Card className="habbo-panel">
      <CardHeader className="habbo-header">
        <CardTitle className="flex items-center gap-2 text-white">
          <User className="w-5 h-5" />
          Preview do Avatar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Hotel Selector */}
        <div className="space-y-2">
          <Label htmlFor="hotel">Hotel:</Label>
          <Select value={selectedHotel} onValueChange={setSelectedHotel}>
            <SelectTrigger className="habbo-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="com.br">🇧🇷 Habbo.com.br</SelectItem>
              <SelectItem value="com">🇺🇸 Habbo.com</SelectItem>
              <SelectItem value="es">🇪🇸 Habbo.es</SelectItem>
              <SelectItem value="fr">🇫🇷 Habbo.fr</SelectItem>
              <SelectItem value="de">🇩🇪 Habbo.de</SelectItem>
              <SelectItem value="it">🇮🇹 Habbo.it</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Avatar Display */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-lg border-2 border-dashed border-amber-400 relative">
            <img 
              src={getAvatarUrl()}
              alt="Preview do Avatar"
              className="max-w-full h-auto pixelated"
              style={{ imageRendering: 'pixelated', minHeight: '120px' }}
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setAvatarDirection(prev => (parseInt(prev) + 2) % 8 === 0 ? '0' : ((parseInt(prev) + 2) % 8).toString())}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Username Input */}
        <div className="space-y-2">
          <Label htmlFor="username">Usuário:</Label>
          <div className="flex gap-2">
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite o nome do usuário"
              className="habbo-input flex-1"
            />
            <Button onClick={handleSearchUser} size="sm" className="btn-habbo">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={onRandomize} variant="outline" size="sm" className="habbo-card">
            <Shuffle className="w-4 h-4 mr-1" />
            Random
          </Button>
          <Button onClick={onCopyUrl} variant="outline" size="sm" className="habbo-card">
            <Copy className="w-4 h-4 mr-1" />
            URL
          </Button>
          <Button onClick={onExportFigure} variant="outline" size="sm" className="habbo-card">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="habbo-card">
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
        </div>

        {/* Figure String Display */}
        <div className="space-y-2">
          <Label>Figure String:</Label>
          <Input
            value={figureString}
            readOnly
            className="text-xs font-mono bg-gray-50 habbo-input"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarPreview;
