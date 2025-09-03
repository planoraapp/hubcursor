import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  RotateCcw, 
  Search,
  Database,
  Filter,
  Shirt,
  Palette
} from 'lucide-react';
import { palettesJSON, setsJSON, clothingStats, HabboFigureSet, HabboPalette } from '@/data/habboTemplariosData';

interface AvatarFigure {
  hr: string;
  hd: string;
  ch: string;
  lg: string;
  sh: string;
  ha: string;
  he: string;
  ea: string;
  fa: string;
  cp: string;
  cc: string;
  ca: string;
  wa: string;
  gesture: string;
  actions: string[];
  item: string;
  direction: number;
  headDirection: number;
  gender: 'M' | 'F' | 'U';
  size: string;
}

const AvatarEditorWithTemplarios: React.FC = () => {
  const [currentFigure, setCurrentFigure] = useState<AvatarFigure>({
    hr: '100-7-',
    hd: '190-7-',
    ch: '210-66-',
    lg: '270-82-',
    sh: '280-82-',
    ha: '300-82-',
    he: '320-82-',
    ea: '340-82-',
    fa: '360-82-',
    cp: '380-82-',
    cc: '400-82-',
    ca: '420-82-',
    wa: '440-82-',
    gesture: 'std',
    actions: [],
    item: '',
    direction: 2,
    headDirection: 2,
    gender: 'M',
    size: 'm'
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('ch');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('M');
  const [showClubOnly, setShowClubOnly] = useState<boolean>(false);
  const [showColorableOnly, setShowColorableOnly] = useState<boolean>(false);

  // Categorias disponíveis
  const categories = {
    'hr': 'Cabelo',
    'hd': 'Cabeça',
    'ch': 'Camisa',
    'lg': 'Calça',
    'sh': 'Sapato',
    'ha': 'Acessório Cabeça',
    'he': 'Acessório Olhos',
    'ea': 'Acessório Orelha',
    'fa': 'Acessório Face',
    'cp': 'Acessório Peito',
    'cc': 'Acessório Colar',
    'ca': 'Acessório Cinto',
    'wa': 'Acessório Pulso'
  };

  // Filtrar itens baseado nos critérios
  const getFilteredItems = () => {
    const categoryData = setsJSON.find(set => set.type === selectedCategory);
    if (!categoryData) return [];

    let items = Object.entries(categoryData.sets);

    // Filtrar por gênero
    items = items.filter(([_, data]) => 
      data.gender === selectedGender || data.gender === 'U'
    );

    // Filtrar por termo de busca
    if (searchTerm) {
      items = items.filter(([id, _]) => 
        id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar apenas itens do clube
    if (showClubOnly) {
      items = items.filter(([_, data]) => data.club === 1);
    }

    // Filtrar apenas itens coloráveis
    if (showColorableOnly) {
      items = items.filter(([_, data]) => data.colorable === 1);
    }

    return items;
  };

  // Aplicar item ao avatar
  const applyItem = (itemId: string, paletteId?: number) => {
    const newFigure = { ...currentFigure };
    const categoryData = setsJSON.find(set => set.type === selectedCategory);
    
    if (categoryData) {
      const itemData = categoryData.sets[itemId];
      if (itemData) {
        // Construir string do item
        let itemString = `${itemId}-${paletteId || categoryData.paletteid}-`;
        
        // Se for colorável, adicionar cor
        if (itemData.colorable === 1 && paletteId) {
          const palette = palettesJSON[paletteId.toString()];
          if (palette) {
            const color = Object.values(palette)[0];
            itemString += color.hex;
          }
        }
        
        (newFigure as any)[selectedCategory] = itemString;
        setCurrentFigure(newFigure);
      }
    }
  };

  // Gerar URL do item - Focado na região da peça
  const getItemPreviewUrl = (itemId: string, colorHex?: string) => {
    const categoryData = setsJSON.find(set => set.type === selectedCategory);
    if (!categoryData) return '';
    
    const primaryColor = colorHex || '1';
    
    // Para itens de rosto (hd, hr, ha, he, ea, fa), mostrar apenas o rosto
    if (['hd', 'hr', 'ha', 'he', 'ea', 'fa'].includes(selectedCategory)) {
      // Apenas cabeça + peça de rosto
      const baseHead = selectedGender === 'M' ? 'hd-185-1' : 'hd-191-1';
      return `https://www.habbo.com.br/habbo-imaging/avatar/${baseHead}.${selectedCategory}-${itemId}-${primaryColor}.png`;
    }
    
    // Para outras categorias, mostrar avatar completo com a peça
    const tempFigure = { ...currentFigure };
    tempFigure[selectedCategory] = `${itemId}-${primaryColor}`;
    
    const figureString = Object.entries(tempFigure)
      .filter(([key, _]) => !['gesture', 'actions', 'item', 'direction', 'headDirection', 'gender', 'size'].includes(key))
      .map(([_, value]) => value)
      .join('.');
    
    return `https://www.habbo.com.br/habbo-imaging/avatar/${figureString}.png`;
  };

  // Obter hex da cor por ID
  const getColorHex = (colorId: string) => {
    const categoryData = setsJSON.find(set => set.type === selectedCategory);
    if (!categoryData) return 'FFCB98';
    
    const palette = palettesJSON[categoryData.paletteid.toString()];
    if (!palette) return 'FFCB98';
    
    const color = palette[colorId];
    return color ? color.hex : 'FFCB98';
  };



  // Gerar URL do avatar
  const generateAvatarUrl = () => {
    const figureString = Object.entries(currentFigure)
      .filter(([key, _]) => !['gesture', 'actions', 'item', 'direction', 'headDirection', 'gender', 'size'].includes(key))
      .map(([_, value]) => value)
      .join('.');
    
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&direction=2&head_direction=2&gesture=std&size=M`;
  };

  // Copiar figura para clipboard
  const copyFigure = () => {
    const figureString = Object.entries(currentFigure)
      .filter(([key, _]) => !['gesture', 'actions', 'item', 'direction', 'headDirection', 'gender', 'size'].includes(key))
      .map(([_, value]) => value)
      .join('.');
    
    navigator.clipboard.writeText(figureString);
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Editor de Avatar - HabboTemplarios
          </CardTitle>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary">
              {clothingStats.totalItems} itens
            </Badge>
            <Badge variant="secondary">
              {clothingStats.totalCategories} categorias
            </Badge>
            <Badge variant="secondary">
              Extraído em {new Date(clothingStats.generatedAt).toLocaleDateString()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview do Avatar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="w-5 h-5" />
                Preview do Avatar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                <img 
                  src={generateAvatarUrl()} 
                  alt="Avatar Preview" 
                  className="w-40 h-48 object-contain"
                />
              </div>
              
              <div className="space-y-2">
                <Button onClick={copyFigure} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Copiar Figura
                </Button>
                <Button variant="outline" onClick={() => setCurrentFigure({
                  hr: '100-7-',
                  hd: '190-7-',
                  ch: '210-66-',
                  lg: '270-82-',
                  sh: '280-82-',
                  ha: '300-82-',
                  he: '320-82-',
                  ea: '340-82-',
                  fa: '360-82-',
                  cp: '380-82-',
                  cc: '400-82-',
                  ca: '420-82-',
                  wa: '440-82-',
                  gesture: 'std',
                  actions: [],
                  item: '',
                  direction: 2,
                  headDirection: 2,
                  gender: 'M',
                  size: 'm'
                })} className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resetar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor de Itens */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Grid de Itens */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Editor de Itens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([key, name]) => (
                        <SelectItem key={key} value={key}>
                          {name} ({clothingStats.categories[key] || 0} itens)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <Select value={selectedGender} onValueChange={(value) => setSelectedGender(value as 'M' | 'F' | 'U')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="U">Unissex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar item..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Filtros adicionais */}
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showClubOnly}
                    onChange={(e) => setShowClubOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Apenas Club</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showColorableOnly}
                    onChange={(e) => setShowColorableOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Apenas Coloráveis</span>
                </label>
              </div>

              <Separator />

              {/* Grid de itens - CSS INLINE para garantir funcionamento */}
              <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto">
                {getFilteredItems().map(([itemId, itemData]) => (
                  <div 
                    key={itemId} 
                    className="relative overflow-hidden"
                    style={{
                      width: '80px',
                      height: '80px',
                      border: '4px solid red',
                      backgroundColor: 'yellow'
                    }}
                  >
                    <img
                      src={getItemPreviewUrl(itemId)}
                      alt={`Item ${itemId}`}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        transform: 'translate(-20px, -20px)'
                      }}
                      onClick={() => applyItem(itemId)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    
                    {/* Badges de raridade - Posicionamento absoluto */}
                    {itemData.club === 1 && (
                      <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">HC</span>
                      </div>
                    )}
                    
                    {itemData.colorable === 1 && (
                      <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">🎨</span>
                      </div>
                    )}
                    
                    {itemData.sellable === 1 && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">$</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

                  <div className="text-sm text-muted-foreground">
                    Mostrando {getFilteredItems().length} de {clothingStats.categories[selectedCategory] || 0} itens
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Painel de Cores */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Cores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {['66', '61', '7', '82', '95', '108', '121', '134', '147', '160', '173', '186'].map((colorId) => (
                      <Button
                        key={colorId}
                        onClick={() => {
                          // Aplicar cor ao item atual
                          const currentItemValue = currentFigure[selectedCategory as keyof AvatarFigure];
                          const currentItem = typeof currentItemValue === 'string' ? currentItemValue.split('-')[0] : '100';
                          if (currentItem) {
                            applyItem(currentItem, parseInt(colorId));
                          }
                        }}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 p-0"
                        style={{ backgroundColor: `#${getColorHex(colorId)}` }}
                        title={`Cor ${colorId}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditorWithTemplarios;