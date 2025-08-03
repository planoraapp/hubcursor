
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package, Shirt, Award, Sparkles, Download, Copy } from 'lucide-react';
import PuhekuplaAvatarPreview from './PuhekuplaAvatarPreview';
import PuhekuplaFurniGrid from './PuhekuplaFurniGrid';
import PuhekuplaClothingGrid from './PuhekuplaClothingGrid';
import PuhekuplaBadgesGrid from './PuhekuplaBadgesGrid';
import { usePuhekuplaCategories } from '@/hooks/usePuhekuplaData';
import type { PuhekuplaFurni, PuhekuplaClothing, PuhekuplaBadge } from '@/hooks/usePuhekuplaData';

const PuhekuplaEditor = () => {
  const [activeTab, setActiveTab] = useState('avatar');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentFigure, setCurrentFigure] = useState('hr-893-45.hd-180-2.ch-210-66.lg-270-82.sh-305-62');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [currentDirection, setCurrentDirection] = useState('2');

  const { data: categoriesData } = usePuhekuplaCategories();
  const categories = categoriesData?.result?.categories || [];

  const hotels = [
    { code: 'com', name: 'Habbo.com', flag: '🌍' },
    { code: 'br', name: 'Habbo.com.br', flag: '🇧🇷' },
    { code: 'es', name: 'Habbo.es', flag: '🇪🇸' },
    { code: 'fr', name: 'Habbo.fr', flag: '🇫🇷' },
    { code: 'de', name: 'Habbo.de', flag: '🇩🇪' },
  ];

  const handleItemSelect = (item: PuhekuplaFurni | PuhekuplaClothing | PuhekuplaBadge) => {
    console.log('Item selecionado:', item);
    // TODO: Implementar lógica de aplicação do item no avatar
  };

  const handleRotateAvatar = () => {
    const directions = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = (currentIndex + 1) % directions.length;
    setCurrentDirection(directions[nextIndex]);
  };

  const handleCopyFigure = async () => {
    try {
      await navigator.clipboard.writeText(currentFigure);
      console.log('Figure copiada para a área de transferência');
    } catch (err) {
      console.error('Erro ao copiar figure:', err);
    }
  };

  const handleCopyUrl = async () => {
    const hotel = hotels.find(h => h.code === selectedHotel);
    const baseUrl = hotel?.code === 'com' ? 'habbo.com' : `habbo.${hotel?.code}`;
    const url = `https://www.${baseUrl}/habbo-imaging/avatarimage?figure=${currentFigure}&size=l&direction=${currentDirection}&head_direction=${currentDirection}&action=std&gesture=std`;
    
    try {
      await navigator.clipboard.writeText(url);
      console.log('URL copiada para a área de transferência');
    } catch (err) {
      console.error('Erro ao copiar URL:', err);
    }
  };

  const handleDownloadAvatar = () => {
    const hotel = hotels.find(h => h.code === selectedHotel);
    const baseUrl = hotel?.code === 'com' ? 'habbo.com' : `habbo.${hotel?.code}`;
    const url = `https://www.${baseUrl}/habbo-imaging/avatarimage?figure=${currentFigure}&size=l&direction=${currentDirection}&head_direction=${currentDirection}&action=std&gesture=std`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `avatar-${currentFigure}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRandomizeAvatar = () => {
    // Generate a random figure string (basic implementation)
    const randomFigure = `hr-${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 50)}.hd-${Math.floor(Math.random() * 200)}-${Math.floor(Math.random() * 10)}.ch-${Math.floor(Math.random() * 300)}-${Math.floor(Math.random() * 100)}.lg-${Math.floor(Math.random() * 300)}-${Math.floor(Math.random() * 100)}.sh-${Math.floor(Math.random() * 400)}-${Math.floor(Math.random() * 100)}`;
    setCurrentFigure(randomFigure);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 p-4">
      {/* Avatar Preview */}
      <div className="lg:w-1/3">
        <PuhekuplaAvatarPreview
          currentFigure={currentFigure}
          selectedGender={selectedGender}
          selectedHotel={selectedHotel}
          currentDirection={currentDirection}
          hotels={hotels}
          onRotateAvatar={handleRotateAvatar}
          onCopyFigure={handleCopyFigure}
          onCopyUrl={handleCopyUrl}
          onDownloadAvatar={handleDownloadAvatar}
          onRandomizeAvatar={handleRandomizeAvatar}
          onGenderChange={setSelectedGender}
          onHotelChange={setSelectedHotel}
        />
      </div>

      {/* Editor Tabs */}
      <div className="lg:w-2/3">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-6 h-6" />
              Editor Puhekupla
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="furni" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Móveis
                </TabsTrigger>
                <TabsTrigger value="clothing" className="flex items-center gap-2">
                  <Shirt className="w-4 h-4" />
                  Roupas
                </TabsTrigger>
                <TabsTrigger value="badges" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Emblemas
                </TabsTrigger>
              </TabsList>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar itens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {(activeTab === 'furni' || activeTab === 'clothing') && (
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Categorias</SelectItem>
                      {categories
                        .filter(category => category.guid && category.guid.trim() !== '')
                        .map((category) => (
                          <SelectItem key={category.guid} value={category.slug || category.guid}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Content Tabs */}
              <div className="h-96 overflow-hidden">
                <TabsContent value="furni" className="h-full">
                  <PuhekuplaFurniGrid
                    searchTerm={searchTerm}
                    selectedCategory={selectedCategory}
                    onItemSelect={handleItemSelect}
                  />
                </TabsContent>

                <TabsContent value="clothing" className="h-full">
                  <PuhekuplaClothingGrid
                    searchTerm={searchTerm}
                    selectedCategory={selectedCategory}
                    onItemSelect={handleItemSelect}
                  />
                </TabsContent>

                <TabsContent value="badges" className="h-full">
                  <PuhekuplaBadgesGrid
                    searchTerm={searchTerm}
                    onItemSelect={handleItemSelect}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PuhekuplaEditor;
