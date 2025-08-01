
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarPreview from './HabboEditor/AvatarPreview';
import HabboWidgetsClothingSelector from './HabboEditor/HabboWidgetsClothingSelector';
import ColorPalette from './HabboEditor/ColorPalette';
import { useHabboWidgetsClothing, HabboWidgetsItem } from '@/hooks/useHabboWidgetsClothing';

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

const HABBO_COLORS = [
  { id: '1', hex: '#F5DA88', name: 'Pele Clara' },
  { id: '2', hex: '#FFDBC1', name: 'Pele Rosa' },
  { id: '3', hex: '#FFCB98', name: 'Pele Bronzeada' },
  { id: '4', hex: '#F4AC54', name: 'Pele Dourada' },
  { id: '5', hex: '#CA8154', name: 'Pele Morena' },
  { id: '45', hex: '#D4B878', name: 'Loiro' },
  { id: '61', hex: '#000000', name: 'Preto' },
  { id: '92', hex: '#FFFFFF', name: 'Branco' },
  { id: '100', hex: '#E3AE7D', name: 'Bege' },
  { id: '101', hex: '#C99263', name: 'Marrom' },
  { id: '102', hex: '#A76644', name: 'Marrom Escuro' },
  { id: '104', hex: '#FFC680', name: 'Laranja' },
  { id: '105', hex: '#FF8C40', name: 'Laranja Escuro' },
  { id: '106', hex: '#FF5757', name: 'Vermelho' },
  { id: '143', hex: '#6799CC', name: 'Azul' }
];

// Convert HabboWidgets item to figure part ID
const convertHabboWidgetsToFigureId = (item: HabboWidgetsItem): string => {
  // Extract numeric ID from swfName or use a mapping system
  const numericMatch = item.swfName.match(/\d+/);
  return numericMatch ? numericMatch[0] : item.id;
};

const HabboHubEditor = () => {
  console.log('🚀 [HabboHubEditor] Iniciando Editor com HabboWidgets...');
  
  const { toast } = useToast();
  
  const [currentFigure, setCurrentFigure] = useState<CurrentFigure>(DEFAULT_FIGURE);
  const [selectedHotel, setSelectedHotel] = useState('com.br');
  const [username, setUsername] = useState('ViaJovem');
  const [activeCategory, setActiveCategory] = useState('hr');
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Use HabboWidgets clothing data
  const { data: clothingData, isLoading: apiLoading, error, refetch } = useHabboWidgetsClothing(selectedHotel);

  // Generate figure string dynamically
  const figureString = useMemo(() => {
    const parts = Object.entries(currentFigure)
      .filter(([_, part]) => part && part.id !== '0')
      .map(([type, part]) => `${type}-${part.id}-${part.colors.join('.')}`)
      .join('.');
    
    console.log('🎨 [HabboHubEditor] Generated figure string:', parts);
    return parts;
  }, [currentFigure]);

  useEffect(() => {
    console.log('🔍 [HabboHubEditor] HabboWidgets Status:', {
      loading: apiLoading,
      hasData: !!clothingData,
      totalItems: clothingData?.length || 0,
      error: error?.message
    });
    
    if (clothingData) {
      console.log('📦 [HabboHubEditor] HabboWidgets data loaded:', clothingData.length, 'items');
    }
  }, [apiLoading, clothingData, error]);

  const handlePartSelect = (item: HabboWidgetsItem) => {
    console.log('👕 [HabboHubEditor] HabboWidgets item selected:', item);
    setSelectedPart(item.id);
    
    // Convert HabboWidgets item to figure format
    const figureId = convertHabboWidgetsToFigureId(item);
    
    setCurrentFigure(prev => {
      const newFigure = {
        ...prev,
        [activeCategory]: {
          id: figureId,
          colors: [item.colors[0] || '1']
        }
      };
      console.log('🔄 [HabboHubEditor] Updated figure with HabboWidgets item:', newFigure);
      return newFigure;
    });

    toast({
      title: "Roupa HabboWidgets Selecionada!",
      description: `${item.name} foi aplicada ao seu visual.`
    });
  };

  const handleColorSelect = (colorId: string) => {
    console.log('🎨 [HabboHubEditor] Color selected:', colorId, 'for category:', activeCategory);
    setCurrentFigure(prev => {
      const currentPart = prev[activeCategory as keyof CurrentFigure];
      if (currentPart) {
        const newFigure = {
          ...prev,
          [activeCategory]: {
            ...currentPart,
            colors: [colorId]
          }
        };
        console.log('🔄 [HabboHubEditor] Updated figure with new color:', newFigure);
        return newFigure;
      }
      return prev;
    });
  };

  const handleRandomize = () => {
    if (!clothingData) {
      toast({
        title: "Erro",
        description: "Dados do HabboWidgets não carregados ainda.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('🎲 [HabboHubEditor] Randomizando avatar com HabboWidgets...');
    setLoading(true);
    
    setTimeout(() => {
      const newFigure: CurrentFigure = { ...DEFAULT_FIGURE };
      
      ['hr', 'ch', 'lg', 'sh', 'ha', 'ea', 'cc'].forEach(category => {
        const categoryItems = clothingData.filter(item => item.category === category);
        if (categoryItems && categoryItems.length > 0) {
          const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
          const figureId = convertHabboWidgetsToFigureId(randomItem);
          const randomColor = randomItem.colors[Math.floor(Math.random() * randomItem.colors.length)];
          
          newFigure[category as keyof CurrentFigure] = {
            id: figureId,
            colors: [randomColor]
          };
        }
      });
      
      setCurrentFigure(newFigure);
      setLoading(false);
      
      toast({
        title: "Avatar Randomizado!",
        description: "Um novo visual foi gerado com roupas do HabboWidgets."
      });
    }, 1000);
  };

  const handleCopyUrl = async () => {
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
    const data = {
      figure: figureString,
      username,
      hotel: selectedHotel,
      exportDate: new Date().toISOString(),
      source: 'HabboWidgets Integration'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habbo-figure-habbowidgets-${username}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Figure Exportada!",
      description: "O arquivo foi baixado com dados do HabboWidgets."
    });
  };

  if (error) {
    console.log('❌ [HabboHubEditor] Rendering error state');
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-red-600 mb-2">Erro no Editor</h2>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar os dados do HabboWidgets.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (loading || apiLoading) {
    console.log('⏳ [HabboHubEditor] Rendering loading state');
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-amber-600 mb-2">Editor de Visuais Habbo</h2>
          <p className="text-gray-600">
            {apiLoading ? 'Carregando dados do HabboWidgets...' : 'Gerando visual aleatório...'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div><Skeleton className="h-96 w-full" /></div>
          <div><Skeleton className="h-96 w-full" /></div>
          <div><Skeleton className="h-48 w-full" /></div>
        </div>
      </div>
    );
  }

  console.log('✅ [HabboHubEditor] Rendering main editor interface with HabboWidgets data');

  const currentItem = clothingData?.find(item => item.id === selectedPart);
  const availableColors = currentItem?.colors || [];
  const totalItems = clothingData?.length || 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-amber-600 mb-2 volter-font">Editor de Visuais Habbo</h2>
        <p className="text-gray-600">Crie e personalize seu avatar com roupas do HabboWidgets!</p>
        <div className="flex justify-center gap-4 mt-2">
          <Badge className="bg-blue-600 text-white">
            Total: {totalItems} itens HabboWidgets
          </Badge>
          <Badge className="bg-green-600 text-white">
            Hotel: {selectedHotel}
          </Badge>
          <Badge className="bg-purple-600 text-white">
            Preview: SINCRONIZADO
          </Badge>
        </div>
      </div>

      {/* Success Alert */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <img src="/assets/2190__-5kz.png" alt="Sucesso" className="w-6 h-6" />
            <p className="text-sm text-green-800">
              <strong>✅ Status:</strong> Editor funcionando com dados do HabboWidgets ({totalItems} itens disponíveis)!
              Preview atualiza em tempo real.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AvatarPreview
            figureString={figureString}
            selectedHotel={selectedHotel}
            setSelectedHotel={setSelectedHotel}
            username={username}
            setUsername={setUsername}
            onRandomize={handleRandomize}
            onCopyUrl={handleCopyUrl}
            onExportFigure={handleExportFigure}
          />
        </div>

        <div className="lg:col-span-1">
          <HabboWidgetsClothingSelector
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            selectedPart={selectedPart}
            onPartSelect={handlePartSelect}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedHotel={selectedHotel}
          />
        </div>

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
