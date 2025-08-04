
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCw, Maximize2, Minimize2, Copy, RefreshCw, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedAvatarPreviewProps {
  figureString: string;
  selectedGender: 'M' | 'F' | 'U';
  selectedHotel: string;
  avatarState: Record<string, string>;
  onGenderChange: (gender: 'M' | 'F' | 'U') => void;
  onHotelChange: (hotel: string) => void;
  onResetAvatar: () => void;
  onRemoveItem: (category: string) => void;
}

const EnhancedAvatarPreview = ({
  figureString,
  selectedGender,
  selectedHotel,
  avatarState,
  onGenderChange,
  onHotelChange,
  onResetAvatar,
  onRemoveItem
}: EnhancedAvatarPreviewProps) => {
  const [currentDirection, setCurrentDirection] = useState('2');
  const [avatarSize, setAvatarSize] = useState('l');
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentAction, setCurrentAction] = useState('std');
  const [currentGesture, setCurrentGesture] = useState('std');
  
  const { toast } = useToast();

  const hotels = [
    { code: 'com.br', name: 'Habbo.com.br', flag: '🇧🇷' },
    { code: 'com', name: 'Habbo.com', flag: '🌍' },
    { code: 'es', name: 'Habbo.es', flag: '🇪🇸' },
    { code: 'fr', name: 'Habbo.fr', flag: '🇫🇷' },
    { code: 'de', name: 'Habbo.de', flag: '🇩🇪' },
    { code: 'it', name: 'Habbo.it', flag: '🇮🇹' },
    { code: 'fi', name: 'Habbo.fi', flag: '🇫🇮' }
  ];

  const directions = [
    { value: '0', label: '⬆️ Norte', name: 'Norte' },
    { value: '1', label: '↗️ Nordeste', name: 'Nordeste' },
    { value: '2', label: '➡️ Leste', name: 'Leste' },
    { value: '3', label: '↘️ Sudeste', name: 'Sudeste' },
    { value: '4', label: '⬇️ Sul', name: 'Sul' },
    { value: '5', label: '↙️ Sudoeste', name: 'Sudoeste' },
    { value: '6', label: '⬅️ Oeste', name: 'Oeste' },
    { value: '7', label: '↖️ Noroeste', name: 'Noroeste' }
  ];

  const actions = [
    { value: 'std', label: 'Padrão' },
    { value: 'wlk', label: 'Andar' },
    { value: 'sit', label: 'Sentar' },
    { value: 'lay', label: 'Deitar' }
  ];

  const gestures = [
    { value: 'std', label: 'Normal' },
    { value: 'agr', label: 'Bravo' },
    { value: 'sad', label: 'Triste' },
    { value: 'sml', label: 'Sorrindo' },
    { value: 'srp', label: 'Surpreso' }
  ];

  const currentAvatarUrl = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${figureString}&gender=${selectedGender === 'U' ? 'M' : selectedGender}&direction=${currentDirection}&head_direction=${currentDirection}&img_format=png&action=${currentAction}&gesture=${currentGesture}&size=${isExpanded ? 'xl' : avatarSize}`;

  const handleRotateAvatar = () => {
    const directionNumbers = directions.map(d => d.value);
    const currentIndex = directionNumbers.indexOf(currentDirection);
    const nextIndex = (currentIndex + 1) % directionNumbers.length;
    setCurrentDirection(directionNumbers[nextIndex]);
  };

  const handleCopyFigureString = () => {
    navigator.clipboard.writeText(figureString);
    toast({
      title: "📋 Figure String copiada!",
      description: "String copiada para área de transferência.",
    });
  };

  const handleCopyAvatarUrl = () => {
    navigator.clipboard.writeText(currentAvatarUrl);
    toast({
      title: "🔗 URL do avatar copiada!",
      description: "URL da imagem copiada com sucesso.",
    });
  };

  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'scale-105' : ''}`}>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-5 h-5" />
          Preview ViaJovem Enhanced
          <Badge className="ml-auto bg-white/20 text-white text-xs">
            {selectedGender === 'M' ? '👨 Masculino' : selectedGender === 'F' ? '👩 Feminino' : '⚧ Unissex'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Avatar Display */}
        <div className="flex justify-center">
          <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-purple-300 relative transition-all duration-300 ${isExpanded ? 'p-8' : 'p-6'}`}>
            <img 
              src={currentAvatarUrl}
              alt="Avatar Preview Enhanced"
              className={`pixelated transition-all duration-300 ${isExpanded ? 'min-h-[200px] min-w-[128px]' : 'min-h-[120px] min-w-[64px]'}`}
              style={{ imageRendering: 'pixelated' }}
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error('❌ [EnhancedAvatarPreview] Erro:', target.src);
                target.src = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=hd-190-7.hr-3811-61.ch-3030-66.lg-275-82.sh-290-80&gender=M&direction=2&head_direction=2&img_format=png&action=std&gesture=std&size=${avatarSize}`;
              }}
            />
            
            {/* Controles flutuantes */}
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotateAvatar}
                title="Rotacionar Avatar"
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Minimizar" : "Expandir"}
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Controles principais */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={selectedGender} onValueChange={onGenderChange}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">👨 Masculino</SelectItem>
              <SelectItem value="F">👩 Feminino</SelectItem>
              <SelectItem value="U">⚧ Unissex</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedHotel} onValueChange={onHotelChange}>
            <SelectTrigger className="text-sm">
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

        {/* Controles avançados */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={currentDirection} onValueChange={setCurrentDirection}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {directions.map(direction => (
                <SelectItem key={direction.value} value={direction.value}>
                  {direction.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={avatarSize} onValueChange={setAvatarSize}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="s">📱 Pequeno</SelectItem>
              <SelectItem value="m">💻 Médio</SelectItem>
              <SelectItem value="l">🖥️ Grande</SelectItem>
              <SelectItem value="xl">📺 Extra Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={currentAction} onValueChange={setCurrentAction}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {actions.map(action => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={currentGesture} onValueChange={setCurrentGesture}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gestures.map(gesture => (
                <SelectItem key={gesture.value} value={gesture.value}>
                  {gesture.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botões de ação */}
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={onResetAvatar} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button onClick={handleCopyFigureString} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-1" />
            Figure
          </Button>
          <Button onClick={handleCopyAvatarUrl} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-1" />
            URL
          </Button>
        </div>

        {/* Itens equipados */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Itens ViaJovem Equipados:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(avatarState).length === 0 ? (
              <p className="text-xs text-gray-500 italic">Nenhum item equipado</p>
            ) : (
              Object.entries(avatarState).map(([category, value]) => (
                <div key={category} className="flex items-center justify-between text-xs bg-purple-50 p-2 rounded border">
                  <span className="font-mono font-medium">{category.toUpperCase()}: <span className="text-purple-600">{value}</span></span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onRemoveItem(category)}
                    className="h-6 w-6 p-0 hover:bg-red-100 text-red-500"
                    title="Remover item"
                  >
                    ❌
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Figure string display */}
        <div className="bg-gray-50 rounded p-3 border">
          <p className="text-xs text-gray-600 mb-1 font-medium">Figure String ViaJovem:</p>
          <code className="text-xs font-mono text-purple-600 break-all block bg-white p-2 rounded border">
            {figureString || 'Nenhuma figura personalizada'}
          </code>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAvatarPreview;
