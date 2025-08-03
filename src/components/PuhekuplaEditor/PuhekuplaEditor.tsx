
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, 
  Download, 
  Shuffle, 
  Search, 
  RotateCcw,
  Shirt,
  Home,
  Award,
  Palette,
  User
} from 'lucide-react';
import PuhekuplaAvatarPreview from './PuhekuplaAvatarPreview';
import PuhekuplaFurniGrid from './PuhekuplaFurniGrid';
import PuhekuplaClothingGrid from './PuhekuplaClothingGrid';
import PuhekuplaBadgesGrid from './PuhekuplaBadgesGrid';

const PuhekuplaEditor = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('clothing');
  const [currentFigure, setCurrentFigure] = useState('hd-190-1.hr-828-45.ch-665-92.lg-270-82.sh-305-62');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [currentDirection, setCurrentDirection] = useState('2');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Hotels configuration
  const hotels = [
    { code: 'com', name: 'Global', flag: '🌍' },
    { code: 'com.br', name: 'Brasil', flag: '🇧🇷' },
    { code: 'es', name: 'España', flag: '🇪🇸' },
    { code: 'de', name: 'Deutschland', flag: '🇩🇪' },
    { code: 'fr', name: 'France', flag: '🇫🇷' },
    { code: 'it', name: 'Italia', flag: '🇮🇹' },
    { code: 'nl', name: 'Nederland', flag: '🇳🇱' },
    { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
    { code: 'tr', name: 'Türkiye', flag: '🇹🇷' }
  ];

  const getAvatarUrl = (size: 'l' | 'm' | 's' = 'l') => {
    const hotel = hotels.find(h => h.code === selectedHotel);
    return `https://www.${hotel?.code === 'com' ? 'habbo.com' : `habbo.${hotel?.code}`}/habbo-imaging/avatarimage?figure=${currentFigure}&size=${size}&direction=${currentDirection}&head_direction=${currentDirection}&action=std&gesture=std`;
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
      title: "📋 Figure Copiada!",
      description: "Código figure copiado para área de transferência",
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(getAvatarUrl());
    toast({
      title: "📋 URL Copiada!",
      description: "URL do avatar copiada para área de transferência",
    });
  };

  const downloadAvatar = () => {
    const link = document.createElement('a');
    link.href = getAvatarUrl();
    link.download = `avatar-puhekupla-${Date.now()}.png`;
    link.click();
    toast({
      title: "⬇️ Download Iniciado",
      description: "Avatar sendo baixado em alta resolução",
    });
  };

  const randomizeAvatar = () => {
    const basicCategories = ['hd', 'hr', 'ch', 'lg', 'sh'];
    const newFigureParts = [];

    basicCategories.forEach(category => {
      const randomItem = Math.floor(Math.random() * 50) + 100;
      const randomColor = Math.floor(Math.random() * 15) + 1;
      newFigureParts.push(`${category}-${randomItem}-${randomColor}`);
    });

    setCurrentFigure(newFigureParts.join('.'));
    toast({
      title: "🎲 Avatar Randomizado!",
      description: "Novo visual gerado aleatoriamente",
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
          🌟 Editor Puhekupla
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Nova Geração - Catálogo Expandido de Roupas, Móveis e Emblemas
        </p>
        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          Powered by Puhekupla API
        </Badge>
      </div>

      {/* Avatar Preview Section */}
      <PuhekuplaAvatarPreview
        currentFigure={currentFigure}
        selectedGender={selectedGender}
        selectedHotel={selectedHotel}
        currentDirection={currentDirection}
        hotels={hotels}
        onRotateAvatar={handleRotateAvatar}
        onCopyFigure={copyFigure}
        onCopyUrl={copyUrl}
        onDownloadAvatar={downloadAvatar}
        onRandomizeAvatar={randomizeAvatar}
        onGenderChange={setSelectedGender}
        onHotelChange={setSelectedHotel}
      />

      {/* Search and Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
        <CardContent className="p-4">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <Search className="inline w-4 h-4 mr-1" />
                Buscar Items
              </label>
              <Input
                placeholder="Digite o nome do item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
            
            <div className="min-w-48">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                🏷️ Categoria
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="xmas">Christmas</SelectItem>
                  <SelectItem value="rare">Rare/LTD</SelectItem>
                  <SelectItem value="hc">Habbo Club</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Tabs */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-purple-800">
            🎨 Catálogo Puhekupla
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-purple-100">
              <TabsTrigger 
                value="clothing" 
                className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Shirt className="w-4 h-4" />
                Roupas
              </TabsTrigger>
              <TabsTrigger 
                value="furni" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Home className="w-4 h-4" />
                Móveis
              </TabsTrigger>
              <TabsTrigger 
                value="badges" 
                className="flex items-center gap-2 data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
              >
                <Award className="w-4 h-4" />
                Emblemas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clothing" className="mt-6">
              <PuhekuplaClothingGrid 
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                onItemSelect={(item) => {
                  console.log('Clothing item selected:', item);
                  toast({
                    title: "👕 Roupa Selecionada",
                    description: `${item.name} adicionado ao avatar`,
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="furni" className="mt-6">
              <PuhekuplaFurniGrid 
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                onItemSelect={(item) => {
                  console.log('Furni item selected:', item);
                  toast({
                    title: "🏠 Móvel Selecionado",
                    description: `${item.name} adicionado à coleção`,
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="badges" className="mt-6">
              <PuhekuplaBadgesGrid 
                searchTerm={searchTerm}
                onItemSelect={(item) => {
                  console.log('Badge item selected:', item);
                  toast({
                    title: "🏆 Emblema Selecionado",
                    description: `${item.name} adicionado à coleção`,
                  });
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PuhekuplaEditor;
