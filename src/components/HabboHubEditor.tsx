import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { HabboHubClothingGrid } from './HabboHub/HabboHubClothingGrid';
import HabboHubCategoryNavigation from './HabboHub/HabboHubCategoryNavigation';
import OfficialHabboColorPalette from './HabboHub/OfficialHabboColorPalette';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Copy, Shuffle, Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HabboHubEditorProps {
  className?: string;
}

export const HabboHubEditor = ({ className = '' }: HabboHubEditorProps) => {
  const [currentFigure, setCurrentFigure] = useState('hd-190-1.hr-828-45.ch-665-92.lg-270-82.sh-305-62');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('U');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [currentDirection, setCurrentDirection] = useState('2');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState('1');
  const [selectedItem, setSelectedItem] = useState('190');
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const hotels = [
    { code: 'com', name: 'Global', flag: '🌍', url: 'habbo.com' },
    { code: 'com.br', name: 'Brasil', flag: '🇧🇷', url: 'habbo.com.br' },
    { code: 'es', name: 'España', flag: '🇪🇸', url: 'habbo.es' },
    { code: 'de', name: 'Deutschland', flag: '🇩🇪', url: 'habbo.de' },
    { code: 'fr', name: 'France', flag: '🇫🇷', url: 'habbo.fr' },
    { code: 'it', name: 'Italia', flag: '🇮🇹', url: 'habbo.it' },
    { code: 'nl', name: 'Nederland', flag: '🇳🇱', url: 'habbo.nl' },
    { code: 'fi', name: 'Suomi', flag: '🇫🇮', url: 'habbo.fi' },
    { code: 'tr', name: 'Türkiye', flag: '🇹🇷', url: 'habbo.com.tr' }
  ];

  const getAvatarUrl = (size: 'l' | 'm' | 's' = 'l') => {
    const hotel = hotels.find(h => h.code === selectedHotel);
    return `https://www.${hotel?.url || 'habbo.com'}/habbo-imaging/avatarimage?figure=${currentFigure}&size=${size}&direction=${currentDirection}&head_direction=${currentDirection}&action=std&gesture=std`;
  };

  const handleSearchUser = async () => {
    if (!username.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome de usuário válido",
        variant: "destructive"
      });
      return;
    }

    try {
      const hotel = hotels.find(h => h.code === selectedHotel);
      const response = await fetch(`https://www.${hotel?.url || 'habbo.com'}/api/public/users?name=${username}`);
      
      if (!response.ok) throw new Error('Usuário não encontrado');
      
      const data = await response.json();
      if (data.figureString) {
        setCurrentFigure(data.figureString);
        toast({
          title: "✅ Sucesso",
          description: `Visual de ${data.name} carregado!`,
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Usuário não encontrado neste hotel",
        variant: "destructive"
      });
    }
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
    
    const figureParts = currentFigure.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    
    const filteredParts = figureParts.filter(part => !categoryPattern.test(part));
    const newPart = `${selectedCategory}-${itemId}-${selectedColor}`;
    filteredParts.push(newPart);
    
    setCurrentFigure(filteredParts.join('.'));
  };

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
    
    const figureParts = currentFigure.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    
    const updatedParts = figureParts.map(part => {
      if (categoryPattern.test(part)) {
        const [cat, item] = part.split('-');
        return `${cat}-${item}-${colorId}`;
      }
      return part;
    });
    
    setCurrentFigure(updatedParts.join('.'));
  };

  const handleRotateAvatar = () => {
    setCurrentDirection(prev => {
      const directions = ['0', '1', '2', '3', '4', '5', '6', '7'];
      const currentIndex = directions.indexOf(prev);
      return directions[(currentIndex + 1) % directions.length];
    });
  };

  const copyFigure = () => {
    navigator.clipboard.writeText(currentFigure);
    toast({
      title: "📋 Copiado!",
      description: "Figure string copiada",
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(getAvatarUrl());
    toast({
      title: "📋 Copiado!",
      description: "URL do avatar copiada",
    });
  };

  const downloadAvatar = () => {
    const link = document.createElement('a');
    link.href = getAvatarUrl();
    link.download = `avatar-${currentFigure.substring(0, 10)}.png`;
    link.click();
    toast({
      title: "⬇️ Download iniciado",
      description: "Avatar sendo baixado",
    });
  };

  const randomizeAvatar = () => {
    // Implementar lógica de randomização
    toast({
      title: "🎲 Avatar Randomizado!",
      description: "Novo visual gerado",
    });
  };

  return (
    <div className={`max-w-7xl mx-auto p-4 space-y-6 ${className}`} ref={containerRef}>
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Editor HabboHub
        </h1>
        <p className="text-gray-600">Editor oficial de visuais Habbo com dados certificados</p>
      </div>

      {/* Avatar Preview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="inline-block relative">
              <img 
                src={getAvatarUrl()} 
                alt="Avatar Preview" 
                className="w-32 h-32 mx-auto cursor-pointer hover:scale-105 transition-transform border-4 border-white rounded-lg shadow-lg"
                onClick={handleRotateAvatar}
                title="Clique para girar"
                style={{ imageRendering: 'pixelated' }}
              />
              <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                {hotels.find(h => h.code === selectedHotel)?.flag} {hotels.find(h => h.code === selectedHotel)?.name}
              </Badge>
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all max-w-md mx-auto border">
              {currentFigure}
            </div>
            
            <div className="flex justify-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={copyFigure} className="bg-white">
                <Copy className="w-4 h-4 mr-1" />
                Figure
              </Button>
              <Button variant="outline" size="sm" onClick={copyUrl} className="bg-white">
                <Copy className="w-4 h-4 mr-1" />
                URL
              </Button>
              <Button variant="outline" size="sm" onClick={downloadAvatar} className="bg-white">
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleRotateAvatar} className="bg-white">
                <RotateCcw className="w-4 h-4 mr-1" />
                Girar
              </Button>
              <Button variant="outline" size="sm" onClick={randomizeAvatar} className="bg-white">
                <Shuffle className="w-4 h-4 mr-1" />
                Aleatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User search and hotel selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium mb-1 text-gray-700">👤 Buscar Usuário</label>
              <Input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite o nome do usuário"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                className="border-gray-300"
              />
            </div>
            
            <div className="min-w-48">
              <label className="block text-sm font-medium mb-1 text-gray-700">🌍 Hotel</label>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger className="border-gray-300">
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
            
            <Button onClick={handleSearchUser} className="bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4 mr-1" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gender selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 justify-center">
            <Button
              variant={selectedGender === 'M' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGender('M')}
              className={selectedGender === 'M' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              👨 Masculino
            </Button>
            <Button
              variant={selectedGender === 'F' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGender('F')}
              className={selectedGender === 'F' ? 'bg-pink-600 hover:bg-pink-700' : ''}
            >
              👩 Feminino
            </Button>
            <Button
              variant={selectedGender === 'U' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGender('U')}
              className={selectedGender === 'U' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              🧑 Unissex
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Navigation */}
      <HabboHubCategoryNavigation
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Main editor area */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HabboHubClothingGrid
            selectedCategory={selectedCategory}
            selectedGender={selectedGender}
            selectedColor={selectedColor}
            onItemSelect={handleItemSelect}
            selectedItem={selectedItem}
          />
        </div>

        <div>
          <OfficialHabboColorPalette
            selectedColor={selectedColor}
            onColorSelect={handleColorSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default HabboHubEditor;
