
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Palette, User, Crown, Shirt, PaintBucket, Footprints, Glasses } from 'lucide-react';
import { useUnifiedHabboClothing } from '@/hooks/useUnifiedHabboClothing';

const CATEGORY_CONFIG = {
  hd: { name: 'Rosto', icon: User },
  hr: { name: 'Cabelo', icon: Crown },
  ch: { name: 'Camiseta', icon: Shirt },
  lg: { name: 'Calça', icon: PaintBucket },
  sh: { name: 'Sapatos', icon: Footprints },
  ha: { name: 'Chapéu', icon: Crown },
  ea: { name: 'Óculos', icon: Glasses },
  fa: { name: 'Rosto Acc', icon: User },
  cc: { name: 'Casaco', icon: Shirt },
  ca: { name: 'Peito Acc', icon: PaintBucket },
  wa: { name: 'Cintura', icon: PaintBucket },
  cp: { name: 'Estampa', icon: Palette }
};

const HabboHubEditor = () => {
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('U');

  const { data: clothingItems, isLoading, error } = useUnifiedHabboClothing({
    category: selectedCategory,
    gender: selectedGender,
    limit: 100
  });

  const generateAvatarUrl = () => {
    const parts = Object.entries(selectedItems)
      .filter(([, itemId]) => itemId && itemId !== 'none')
      .map(([category, itemId]) => `${category}-${itemId}-1`);
    
    if (parts.length === 0) {
      parts.push('hd-1-1', 'hr-1-1', 'ch-1-1', 'lg-1-1', 'sh-1-1');
    }
    
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${parts.join('.')}&gender=${selectedGender}&size=l&direction=2&head_direction=3`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-habbo-yellow" />
        <span className="ml-2 text-white">Carregando dados unificados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-8">
        <p>Erro ao carregar dados unificados</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const currentItems = clothingItems || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Preview do Avatar */}
      <Card className="habbo-panel">
        <CardHeader className="habbo-header">
          <CardTitle className="text-white">Preview Unificado</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="bg-habbo-blue/20 rounded-lg p-4 mb-4">
            <img
              src={generateAvatarUrl()}
              alt="Avatar Preview"
              className="w-32 h-32 mx-auto"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              {Object.keys(selectedItems).length} itens selecionados
            </Badge>
            <div className="flex gap-2 justify-center">
              <Button
                variant={selectedGender === 'M' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGender('M')}
                className={selectedGender === 'M' ? 'bg-habbo-yellow text-black' : 'habbo-card'}
              >
                👨 M
              </Button>
              <Button
                variant={selectedGender === 'F' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGender('F')}
                className={selectedGender === 'F' ? 'bg-habbo-yellow text-black' : 'habbo-card'}
              >
                👩 F
              </Button>
              <Button
                variant={selectedGender === 'U' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGender('U')}
                className={selectedGender === 'U' ? 'bg-habbo-yellow text-black' : 'habbo-card'}
              >
                👤 U
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Categoria */}
      <Card className="habbo-panel">
        <CardHeader className="habbo-header">
          <CardTitle className="text-white">Categorias</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const IconComponent = config.icon;
              
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  className={`flex flex-col items-center p-3 h-auto ${
                    selectedCategory === key ? 'bg-habbo-yellow text-black' : 'habbo-card'
                  }`}
                  onClick={() => setSelectedCategory(key)}
                >
                  <IconComponent className="w-4 h-4 mb-1" />
                  <span className="text-xs">{config.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Itens da Categoria */}
      <Card className="habbo-panel">
        <CardHeader className="habbo-header">
          <CardTitle className="text-white">
            {CATEGORY_CONFIG[selectedCategory as keyof typeof CATEGORY_CONFIG]?.name || selectedCategory}
          </CardTitle>
          <Badge variant="secondary" className="w-fit">
            {currentItems.length} itens
          </Badge>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
            {/* Opção "Remover" */}
            <Button
              variant={selectedItems[selectedCategory] === 'none' ? "default" : "outline"}
              size="sm"
              className={`aspect-square p-2 ${
                selectedItems[selectedCategory] === 'none' 
                  ? 'bg-red-500 text-white' 
                  : 'habbo-card'
              }`}
              onClick={() => setSelectedItems(prev => ({ ...prev, [selectedCategory]: 'none' }))}
            >
              <span className="text-xs">Nenhum</span>
            </Button>

            {currentItems.map((item) => (
              <Button
                key={item.id}
                variant={selectedItems[selectedCategory] === item.figureId ? "default" : "outline"}
                size="sm"
                className={`aspect-square p-1 relative ${
                  selectedItems[selectedCategory] === item.figureId 
                    ? 'bg-habbo-yellow text-black border-2 border-habbo-yellow' 
                    : 'habbo-card hover:bg-habbo-blue/20'
                }`}
                onClick={() => setSelectedItems(prev => ({ ...prev, [selectedCategory]: item.figureId }))}
                title={item.name}
              >
                <img
                  src={item.thumbnailUrl}
                  alt={item.name}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/placeholder-item.png';
                  }}
                />
                {item.club && (
                  <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1">
                    HC
                  </Badge>
                )}
                {item.source === 'flash-assets' && (
                  <Badge className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-1">
                    FA
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-400 text-center space-y-1">
            <div>{currentItems.length} itens disponíveis</div>
            <div className="flex justify-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                HC: {currentItems.filter(i => i.club).length}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded"></div>
                FA: {currentItems.filter(i => i.source === 'flash-assets').length}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded"></div>
                OF: {currentItems.filter(i => i.source === 'official').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabboHubEditor;
