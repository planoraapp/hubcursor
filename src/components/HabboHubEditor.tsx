
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Shuffle, Download, Upload, RefreshCw, User, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

const PART_CATEGORIES = {
  hd: 'Rosto & Corpo',
  hr: 'Cabelos',
  ch: 'Parte de cima',
  lg: 'Parte de baixo', 
  sh: 'Sapatos',
  ha: 'Chapéus',
  ea: 'Óculos',
  fa: 'Máscaras/Rosto',
  cc: 'Casacos/Vestidos',
  ca: 'Capas',
  wa: 'Cintos'
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

  const getAvatarUrl = useCallback(() => {
    const figureString = generateFigureString();
    return `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${figureString}&direction=2&head_direction=3&size=m&img_format=png&gesture=std&action=std`;
  }, [generateFigureString, selectedHotel]);

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
          colors: [part.colors[0]] // Use primeira cor disponível
        }
      }));
    }
  };

  const handleColorSelect = (colorId: string, colorIndex: number = 0) => {
    setCurrentFigure(prev => {
      const currentPart = prev[activeCategory as keyof CurrentFigure];
      if (currentPart) {
        const newColors = [...currentPart.colors];
        newColors[colorIndex] = colorId;
        return {
          ...prev,
          [activeCategory]: {
            ...currentPart,
            colors: newColors
          }
        };
      }
      return prev;
    });
  };

  const handleRandomize = () => {
    if (!figureData) return;

    const newFigure: CurrentFigure = { ...DEFAULT_FIGURE };
    
    Object.keys(PART_CATEGORIES).forEach(category => {
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
    const url = getAvatarUrl();
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

  const filteredParts = figureData?.figureParts[activeCategory]?.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading && retryCount === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-amber-600 mb-2">Editor de Visuais Habbo</h2>
          <p className="text-gray-600">Carregando peças de roupa...</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(16)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
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

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-amber-600 mb-2">Editor de Visuais Habbo</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avatar Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Preview do Avatar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hotel Selector */}
            <div className="space-y-2">
              <Label htmlFor="hotel">Hotel:</Label>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger>
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

            {/* Avatar Image */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-lg border-2 border-dashed border-gray-300">
                <img 
                  src={getAvatarUrl()}
                  alt="Preview do Avatar"
                  className="max-w-full h-auto pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>

            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username">Usuário:</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite o nome do usuário"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleRandomize} variant="outline" size="sm">
                <Shuffle className="w-4 h-4 mr-2" />
                Randomizar
              </Button>
              <Button onClick={handleCopyUrl} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copiar URL
              </Button>
              <Button onClick={handleExportFigure} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </div>

            {/* Figure String Display */}
            <div className="space-y-2">
              <Label>Figure String:</Label>
              <Input
                value={generateFigureString()}
                readOnly
                className="text-xs font-mono bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Parts Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Peças de Roupa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid grid-cols-5 lg:grid-cols-6 mb-4">
                {Object.entries(PART_CATEGORIES).map(([key, label]) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {label.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="space-y-4">
                {/* Search */}
                <Input
                  placeholder="Buscar peças..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Parts Grid */}
                <div className="max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-2">
                    {filteredParts.map((part) => (
                      <Button
                        key={part.id}
                        variant={selectedPart === part.id ? "default" : "outline"}
                        size="sm"
                        className="h-auto p-2 flex flex-col items-center gap-1"
                        onClick={() => handlePartSelect(part.id)}
                      >
                        <div className="text-xs font-medium truncate w-full text-center">
                          {part.name}
                        </div>
                        <div className="flex gap-1">
                          <Badge variant={part.category === 'hc' ? 'default' : 'secondary'} className="text-xs">
                            {part.category.toUpperCase()}
                          </Badge>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Colors Section */}
      {selectedPart && figureData && (
        <Card>
          <CardHeader>
            <CardTitle>Cores Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {figureData.colors
                .filter(color => 
                  figureData.figureParts[activeCategory]
                    ?.find(p => p.id === selectedPart)
                    ?.colors.includes(color.id)
                )
                .map((color) => (
                  <Button
                    key={color.id}
                    variant="outline"
                    size="sm"
                    className="h-12 p-1 flex flex-col items-center"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleColorSelect(color.id)}
                    title={color.name}
                  >
                    <div className="text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                      {color.name}
                    </div>
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HabboHubEditor;
