
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarPreview from './HabboEditor/AvatarPreview';
import ClothingSelector from './HabboEditor/ClothingSelector';
import ColorPalette from './HabboEditor/ColorPalette';

interface FigurePart {
  id: string;
  name: string;
  colors: string[];
  category: 'normal' | 'hc' | 'sellable';
  gender: 'M' | 'F' | 'U';
}

interface FigureData {
  figureParts: { [key: string]: FigurePart[] };
  colors: { id: string; hex: string; name: string; }[];
}

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
}

const DEFAULT_FIGURE: CurrentFigure = {
  hd: { id: '180', colors: ['1'] },
  hr: { id: '828', colors: ['45'] },
  ch: { id: '665', colors: ['92'] },
  lg: { id: '700', colors: ['1'] },
  sh: { id: '705', colors: ['1'] }
};

const HabboHubEditor = () => {
  const { toast } = useToast();
  
  const [figureData, setFigureData] = useState<FigureData | null>(null);
  const [currentFigure, setCurrentFigure] = useState<CurrentFigure>(DEFAULT_FIGURE);
  const [selectedHotel, setSelectedHotel] = useState('com.br');
  const [username, setUsername] = useState('ViaJovem');
  const [activeCategory, setActiveCategory] = useState('hd');
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  const generateFigureString = useCallback(() => {
    const parts = Object.entries(currentFigure)
      .filter(([_, part]) => part && part.id !== '0')
      .map(([type, part]) => `${type}-${part.id}-${part.colors.join('.')}`)
      .join('.');
    return parts;
  }, [currentFigure]);

  const fetchFigureData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase.functions.invoke('get-habbo-figures');
      
      if (error) {
        throw new Error(error.message || 'Erro ao buscar dados das peças');
      }
      
      if (data) {
        setFigureData(data);
        setRetryCount(0);
      } else {
        throw new Error('Dados não encontrados');
      }
    } catch (err) {
      console.error('Error fetching figure data:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFigureData();
  }, [fetchFigureData]);

  const handlePartSelect = (partId: string) => {
    setSelectedPart(partId);
    const part = figureData?.figureParts[activeCategory]?.find(p => p.id === partId);
    if (part) {
      setCurrentFigure(prev => ({
        ...prev,
        [activeCategory]: {
          id: partId,
          colors: [part.colors[0]]
        }
      }));
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
    if (!figureData) return;

    const newFigure: CurrentFigure = { ...DEFAULT_FIGURE };
    
    Object.keys(newFigure).forEach(category => {
      const parts = figureData.figureParts[category];
      if (parts && parts.length > 0) {
        const randomPart = parts[Math.floor(Math.random() * parts.length)];
        const randomColor = randomPart.colors[Math.floor(Math.random() * randomPart.colors.length)];
        
        newFigure[category as keyof CurrentFigure] = {
          id: randomPart.id,
          colors: [randomColor]
        };
      }
    });
    
    setCurrentFigure(newFigure);
    toast({
      title: "Avatar Randomizado!",
      description: "Um novo visual foi gerado aleatoriamente."
    });
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
    const data = JSON.stringify({ figure: figureString, username }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habbo-figure-${username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Figure Exportada!",
      description: "O arquivo foi baixado com sucesso."
    });
  };

  if (loading && retryCount === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-amber-600 mb-2">Editor de Visuais Habbo</h2>
          <p className="text-gray-600">Carregando peças de roupa...</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <RefreshCw className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Erro ao Carregar Peças</h3>
              <p className="text-sm">{error}</p>
            </div>
            <div className="space-x-2">
              <Button 
                onClick={fetchFigureData}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
              {retryCount > 2 && (
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Recarregar Página
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPart = figureData?.figureParts[activeCategory]?.find(p => p.id === selectedPart);
  const availableColors = currentPart?.colors || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-amber-600 mb-2 volter-font">Editor de Visuais Habbo</h2>
        <p className="text-gray-600">Crie e personalize seu avatar Habbo!</p>
      </div>

      {/* Alert */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <img src="/assets/2190__-5kz.png" alt="Alerta" className="w-6 h-6" />
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> O perfil do jogador precisa estar público para busca por usuário.
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
            figureParts={figureData?.figureParts || {}}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            selectedPart={selectedPart}
            onPartSelect={handlePartSelect}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>

        {/* Color Palette */}
        <div className="lg:col-span-1">
          <ColorPalette
            colors={figureData?.colors || []}
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
