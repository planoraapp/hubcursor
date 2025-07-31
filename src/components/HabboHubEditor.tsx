import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarPreview from './HabboEditor/AvatarPreview';
import ClothingSelector from './HabboEditor/ClothingSelector';
import ColorPalette from './HabboEditor/ColorPalette';
import { getClothingByCategory, HABBO_CLOTHING_DATA } from '@/data/habboClothingData';

interface CurrentFigure {
  hd: { id: string; colors: string[] };
  hr: { id: string; colors: string[] };
  ch: { id: string; colors: string[] };
  lg: { id: string; colors: string[] };
  sh: { id: string; colors: string[] };
  ha?: { id: string; colors: string[] };
  ea?: { id: string; colors: string[] };
  fa?: { id: string; colors: string[] };
  cc?: { id: string; colors: string[] };
  ca?: { id: string; colors: string[] };
  wa?: { id: string; colors: string[] };
  cp?: { id: string; colors: string[] };
}

const DEFAULT_FIGURE: CurrentFigure = {
  hd: { id: '180', colors: ['1'] },
  hr: { id: '828', colors: ['45'] },
  ch: { id: '665', colors: ['92'] },
  lg: { id: '700', colors: ['1'] },
  sh: { id: '705', colors: ['1'] }
};

// Cores Habbo oficiais
const HABBO_COLORS = [
  { id: '1', hex: 'F5DA88', name: 'Pele Clara' },
  { id: '2', hex: 'FFDBC1', name: 'Pele Rosa' },
  { id: '3', hex: 'FFCB98', name: 'Pele Bronzeada' },
  { id: '4', hex: 'F4AC54', name: 'Pele Dourada' },
  { id: '5', hex: 'CA8154', name: 'Pele Morena' },
  { id: '45', hex: 'D4B878', name: 'Loiro' },
  { id: '61', hex: '000000', name: 'Preto' },
  { id: '92', hex: 'FFFFFF', name: 'Branco' },
  { id: '100', hex: 'E3AE7D', name: 'Bege' },
  { id: '101', hex: 'C99263', name: 'Marrom' },
  { id: '102', hex: 'A76644', name: 'Marrom Escuro' },
  { id: '104', hex: 'FFC680', name: 'Laranja' },
  { id: '105', hex: 'FF8C40', name: 'Laranja Escuro' },
  { id: '106', hex: 'FF5757', name: 'Vermelho' },
  { id: '143', hex: '6799CC', name: 'Azul' }
];

const HabboHubEditor = () => {
  const { toast } = useToast();
  
  const [currentFigure, setCurrentFigure] = useState<CurrentFigure>(DEFAULT_FIGURE);
  const [selectedHotel, setSelectedHotel] = useState('com.br');
  const [username, setUsername] = useState('ViaJovem');
  const [activeCategory, setActiveCategory] = useState('hr'); // Começar com cabelo
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const generateFigureString = useCallback(() => {
    const parts = Object.entries(currentFigure)
      .filter(([_, part]) => part && part.id !== '0')
      .map(([type, part]) => `${type}-${part.id}-${part.colors.join('.')}`)
      .join('.');
    return parts;
  }, [currentFigure]);

  const handlePartSelect = (partId: string) => {
    setSelectedPart(partId);
    
    // Buscar o item nos dados reais
    const item = HABBO_CLOTHING_DATA.find(item => item.id === partId);
    if (item) {
      setCurrentFigure(prev => ({
        ...prev,
        [activeCategory]: {
          id: partId,
          colors: [item.colors[0]] // Usar primeira cor disponível
        }
      }));

      toast({
        title: "Peça Selecionada!",
        description: `${item.name} foi adicionada ao seu visual.`
      });
    }
  };

  const handleColorSelect = (colorId: string) => {
    setCurrentFigure(prev => {
      const currentPart = prev[activeCategory as keyof CurrentFigure];
      if (currentPart) {
        return {
          ...prev,
          [activeCategory]: {
            ...currentPart,
            colors: [colorId]
          }
        };
      }
      return prev;
    });
  };

  const handleRandomize = () => {
    setLoading(true);
    
    setTimeout(() => {
      const newFigure: CurrentFigure = { ...DEFAULT_FIGURE };
      
      // Para cada categoria, pegar um item aleatório dos dados reais
      ['hr', 'ch', 'lg', 'ha', 'ea', 'cc', 'ca', 'wa'].forEach(category => {
        const categoryItems = getClothingByCategory(category);
        if (categoryItems.length > 0) {
          const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
          const randomColor = randomItem.colors[Math.floor(Math.random() * randomItem.colors.length)];
          
          if (randomItem) {
            newFigure[category as keyof CurrentFigure] = {
              id: randomItem.id,
              colors: [randomColor]
            };
          }
        }
      });
      
      setCurrentFigure(newFigure);
      setLoading(false);
      
      toast({
        title: "Avatar Randomizado!",
        description: "Um novo visual foi gerado com roupas reais do Habbo."
      });
    }, 1000);
  };

  const handleCopyUrl = async () => {
    const figureString = generateFigureString();
    const url = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${figureString}&direction=2&head_direction=3&size=l&img_format=png&gesture=std&action=std`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL Copiada!",
        description: "A URL da imagem foi copiada para a área de transferência."
      });
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a URL.",
        variant: "destructive"
      });
    }
  };

  const handleExportFigure = () => {
    const figureString = generateFigureString();
    const selectedItems = Object.entries(currentFigure)
      .filter(([_, part]) => part && part.id !== '0')
      .map(([category, part]) => {
        const item = HABBO_CLOTHING_DATA.find(i => i.id === part.id);
        return {
          category,
          id: part.id,
          name: item?.name || 'Item Desconhecido',
          swfCode: item?.swfCode || '',
          colors: part.colors
        };
      });

    const data = {
      figure: figureString,
      username,
      hotel: selectedHotel,
      items: selectedItems,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habbo-figure-${username}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Figure Exportada!",
      description: "O arquivo foi baixado com todos os detalhes das peças."
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-amber-600 mb-2">Editor de Visuais Habbo</h2>
          <p className="text-gray-600">Gerando visual aleatório...</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div><Skeleton className="h-96 w-full" /></div>
          <div><Skeleton className="h-96 w-full" /></div>
          <div><Skeleton className="h-48 w-full" /></div>
        </div>
      </div>
    );
  }

  // Obter item atualmente selecionado e suas cores disponíveis
  const currentItem = HABBO_CLOTHING_DATA.find(item => item.id === selectedPart);
  const availableColors = currentItem?.colors || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-amber-600 mb-2 volter-font">Editor de Visuais Habbo</h2>
        <p className="text-gray-600">Crie e personalize seu avatar com roupas reais do Habbo!</p>
        <div className="flex justify-center gap-4 mt-2">
          <Badge className="bg-blue-600 text-white">NFT: {HABBO_CLOTHING_DATA.filter(i => i.rarity === 'nft').length}</Badge>
          <Badge className="bg-yellow-500 text-white">HC: {HABBO_CLOTHING_DATA.filter(i => i.rarity === 'hc').length}</Badge>
          <Badge className="bg-green-600 text-white">Raros: {HABBO_CLOTHING_DATA.filter(i => i.rarity === 'sellable').length}</Badge>
          <Badge className="bg-purple-600 text-white">LTD: {HABBO_CLOTHING_DATA.filter(i => i.rarity === 'ltd').length}</Badge>
        </div>
      </div>

      {/* Alert */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <img src="/assets/2190__-5kz.png" alt="Alerta" className="w-6 h-6" />
            <p className="text-sm text-yellow-800">
              <strong>Novo:</strong> Agora usando roupas reais do Habbo! Todas as peças são oficiais e baseadas nos códigos SWF atuais.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Preview */}
        <div className="lg:col-span-1">
          <AvatarPreview
            figureString={generateFigureString()}
            selectedHotel={selectedHotel}
            setSelectedHotel={setSelectedHotel}
            username={username}
            setUsername={setUsername}
            onRandomize={handleRandomize}
            onCopyUrl={handleCopyUrl}
            onExportFigure={handleExportFigure}
          />
        </div>

        {/* Clothing Selector */}
        <div className="lg:col-span-1">
          <ClothingSelector
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            selectedPart={selectedPart}
            onPartSelect={handlePartSelect}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedHotel={selectedHotel}
          />
        </div>

        {/* Color Palette */}
        <div className="lg:col-span-1">
          <ColorPalette
            colors={HABBO_COLORS}
            availableColors={availableColors}
            selectedColor={currentFigure[activeCategory as keyof CurrentFigure]?.colors[0]}
            onColorSelect={handleColorSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default HabboHubEditor;
