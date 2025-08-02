
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download, Upload, Shuffle, RotateCw, User, Search, RefreshCw } from 'lucide-react';
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
  const [avatarAction, setAvatarAction] = useState('std');
  const [avatarGesture, setAvatarGesture] = useState('std');
  const [avatarSize, setAvatarSize] = useState('l');
  const [isSearchingUser, setIsSearchingUser] = useState(false);

  const getAvatarUrl = () => {
    // Se temos um figureString personalizado, use-o; senão, busque por usuário
    if (figureString && figureString !== '') {
      return `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${figureString}&direction=${avatarDirection}&head_direction=3&size=${avatarSize}&img_format=png&gesture=${avatarGesture}&action=${avatarAction}`;
    } else if (username && username.trim() !== '') {
      return `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?user=${username}&direction=${avatarDirection}&head_direction=3&size=${avatarSize}&img_format=png&gesture=${avatarGesture}&action=${avatarAction}`;
    }
    // Fallback para avatar padrão
    return `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1&direction=${avatarDirection}&head_direction=3&size=${avatarSize}&img_format=png&gesture=${avatarGesture}&action=${avatarAction}`;
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

    setIsSearchingUser(true);
    
    try {
      // Teste se o usuário existe fazendo uma requisição para a URL do avatar
      const testUrl = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?user=${username}&direction=2&head_direction=3&size=m&img_format=png`;
      const response = await fetch(testUrl);
      
      if (response.ok) {
        toast({
          title: "Usuário encontrado!",
          description: `Avatar de ${username} carregado com sucesso.`
        });
      } else {
        toast({
          title: "Usuário não encontrado",
          description: `Verifique se ${username} existe no Habbo.${selectedHotel}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Não foi possível verificar o usuário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSearchingUser(false);
    }
  };

  const handleRotateAvatar = () => {
    const directions = ['0', '2', '4', '6'];
    const currentIndex = directions.indexOf(avatarDirection);
    const nextIndex = (currentIndex + 1) % directions.length;
    setAvatarDirection(directions[nextIndex]);
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
              style={{ imageRendering: 'pixelated', minHeight: '120px', minWidth: '64px' }}
              loading="lazy"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRotateAvatar}
              title="Rotacionar Avatar"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Username Input */}
        <div className="space-y-2">
          <Label htmlFor="username">Usuário do Habbo:</Label>
          <div className="flex gap-2">
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite o nome do usuário"
              className="habbo-input flex-1"
            />
            <Button 
              onClick={handleSearchUser} 
              size="sm" 
              className="btn-habbo"
              disabled={isSearchingUser}
            >
              {isSearchingUser ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Avatar Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ação:</Label>
            <Select value={avatarAction} onValueChange={setAvatarAction}>
              <SelectTrigger className="habbo-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="std">Padrão</SelectItem>
                <SelectItem value="wlk">Andar</SelectItem>
                <SelectItem value="sit">Sentar</SelectItem>
                <SelectItem value="lay">Deitar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Gesto:</Label>
            <Select value={avatarGesture} onValueChange={setAvatarGesture}>
              <SelectTrigger className="habbo-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="std">Padrão</SelectItem>
                <SelectItem value="agr">Bravo</SelectItem>
                <SelectItem value="sad">Triste</SelectItem>
                <SelectItem value="sml">Sorrindo</SelectItem>
                <SelectItem value="srp">Surpreso</SelectItem>
              </SelectContent>
            </Select>
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
            placeholder="Nenhuma figura personalizada ativa"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarPreview;
