import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import ExpandedClothingSelector from './ViaJovemEditor/ExpandedClothingSelector';
import OfficialColorPalette from './ViaJovemEditor/OfficialColorPalette';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Copy, Shuffle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ViaJovemEditorProps {
  className?: string;
}

export const ViaJovemEditor = ({ className = '' }: ViaJovemEditorProps) => {
  const [currentFigure, setCurrentFigure] = useState('hd-190-7.hr-100-61.ch-210-66.lg-270-82.sh-305-62');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [currentDirection, setCurrentDirection] = useState('2');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState('7');
  const [selectedItem, setSelectedItem] = useState('190');
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Expanded categories with all Habbo clothing types
  const categories = [
    { id: 'hd', name: 'Rostos', icon: '👤', color: 'bg-pink-100' },
    { id: 'hr', name: 'Cabelos', icon: '💇', color: 'bg-purple-100' },
    { id: 'ch', name: 'Camisetas', icon: '👕', color: 'bg-blue-100' },
    { id: 'lg', name: 'Calças/Saias', icon: '👖', color: 'bg-green-100' },
    { id: 'sh', name: 'Sapatos', icon: '👟', color: 'bg-yellow-100' },
    { id: 'ha', name: 'Chapéus', icon: '🎩', color: 'bg-red-100' },
    { id: 'ea', name: 'Óculos', icon: '👓', color: 'bg-indigo-100' },
    { id: 'fa', name: 'Acessórios Faciais', icon: '😷', color: 'bg-teal-100' },
    { id: 'cc', name: 'Casacos', icon: '🧥', color: 'bg-orange-100' },
    { id: 'ca', name: 'Acessórios Peito', icon: '🎖️', color: 'bg-cyan-100' },
    { id: 'wa', name: 'Cintura', icon: '👔', color: 'bg-lime-100' },
    { id: 'cp', name: 'Estampas', icon: '🎨', color: 'bg-rose-100' }
  ];

  // Hotel options with flags
  const hotels = [
    { code: 'com', name: 'Hotel Global', flag: '🌍' },
    { code: 'com.br', name: 'Hotel Brasil', flag: '🇧🇷' },
    { code: 'es', name: 'Hotel España', flag: '🇪🇸' },
    { code: 'de', name: 'Hotel Deutschland', flag: '🇩🇪' },
    { code: 'fr', name: 'Hotel France', flag: '🇫🇷' },
    { code: 'it', name: 'Hotel Italia', flag: '🇮🇹' },
    { code: 'nl', name: 'Hotel Nederland', flag: '🇳🇱' },
    { code: 'fi', name: 'Hotel Suomi', flag: '🇫🇮' },
    { code: 'tr', name: 'Hotel Türkiye', flag: '🇹🇷' }
  ];

  const getAvatarUrl = () => {
    return `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${currentFigure}&size=l&direction=${currentDirection}&head_direction=${currentDirection}&action=std&gesture=std`;
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
      const response = await fetch(`https://www.habbo.${selectedHotel}/api/public/users?name=${username}`);
      
      if (!response.ok) throw new Error('Usuário não encontrado');
      
      const data = await response.json();
      if (data.figureString) {
        setCurrentFigure(data.figureString);
        toast({
          title: "Sucesso",
          description: `Visual de ${data.name} carregado!`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado neste hotel",
        variant: "destructive"
      });
    }
  };

  const handleRotateAvatar = () => {
    setCurrentDirection(prev => {
      const directions = ['0', '1', '2', '3', '4', '5', '6', '7'];
      const currentIndex = directions.indexOf(prev);
      return directions[(currentIndex + 1) % directions.length];
    });
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
    
    // Update figure string
    const figureParts = currentFigure.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    
    // Remove existing category part
    const filteredParts = figureParts.filter(part => !categoryPattern.test(part));
    
    // Add new category part
    const newPart = `${selectedCategory}-${itemId}-${selectedColor}`;
    filteredParts.push(newPart);
    
    setCurrentFigure(filteredParts.join('.'));
  };

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
    
    // Update figure with new color
    const figureParts = currentFigure.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    
    // Update existing category part with new color
    const updatedParts = figureParts.map(part => {
      if (categoryPattern.test(part)) {
        const [cat, item] = part.split('-');
        return `${cat}-${item}-${colorId}`;
      }
      return part;
    });
    
    setCurrentFigure(updatedParts.join('.'));
  };

  const copyFigure = () => {
    navigator.clipboard.writeText(currentFigure);
    toast({
      title: "Copiado!",
      description: "String do visual copiada para a área de transferência",
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(getAvatarUrl());
    toast({
      title: "Copiado!",
      description: "URL do avatar copiada para a área de transferência",
    });
  };

  const randomizeAvatar = () => {
    const basicCategories = ['hd', 'hr', 'ch', 'lg', 'sh'];
    const newFigureParts = [];

    basicCategories.forEach(category => {
      const randomItem = Math.floor(Math.random() * 50) + 1;
      const randomColor = Math.floor(Math.random() * 15) + 1;
      newFigureParts.push(`${category}-${randomItem}-${randomColor}`);
    });

    setCurrentFigure(newFigureParts.join('.'));
    toast({
      title: "Avatar Randomizado!",
      description: "Novo visual gerado aleatoriamente",
    });
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`} ref={containerRef}>
      {/* Avatar Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="inline-block relative">
              <img 
                src={getAvatarUrl()} 
                alt="Avatar Preview" 
                className="w-32 h-32 mx-auto cursor-pointer hover:scale-105 transition-transform"
                onClick={handleRotateAvatar}
                title="Clique para girar o avatar"
                style={{ imageRendering: 'pixelated' }}
              />
              <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                {hotels.find(h => h.code === selectedHotel)?.flag} {hotels.find(h => h.code === selectedHotel)?.name}
              </Badge>
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all max-w-md mx-auto">
              {currentFigure}
            </div>
            
            <div className="flex justify-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={copyFigure}>
                <Copy className="w-4 h-4 mr-1" />
                Copiar Figure
              </Button>
              <Button variant="outline" size="sm" onClick={copyUrl}>
                <Copy className="w-4 h-4 mr-1" />
                Copiar URL
              </Button>
              <Button variant="outline" size="sm" onClick={handleRotateAvatar}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Girar
              </Button>
              <Button variant="outline" size="sm" onClick={randomizeAvatar}>
                <Shuffle className="w-4 h-4 mr-1" />
                Aleatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Search & Hotel Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium mb-1">Buscar Usuário</label>
              <Input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite o nome do usuário"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
              />
            </div>
            
            <div className="min-w-48">
              <label className="block text-sm font-medium mb-1">Hotel</label>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger>
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
            
            <Button onClick={handleSearchUser}>
              <Search className="w-4 h-4 mr-1" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gender Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 justify-center">
            <Button
              variant={selectedGender === 'M' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGender('M')}
            >
              👨 Masculino
            </Button>
            <Button
              variant={selectedGender === 'F' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGender('F')}
            >
              👩 Feminino
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                className={`h-16 flex flex-col gap-1 ${selectedCategory === category.id ? '' : category.color}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="text-xs">{category.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Editor Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Clothing Selector */}
        <div className="lg:col-span-2">
          <ExpandedClothingSelector
            selectedCategory={selectedCategory}
            selectedGender={selectedGender}
            selectedColor={selectedColor}
            onItemSelect={handleItemSelect}
            selectedItem={selectedItem}
          />
        </div>

        {/* Color Palette */}
        <div>
          <OfficialColorPalette
            selectedColor={selectedColor}
            onColorSelect={handleColorSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default ViaJovemEditor;
