import React, { useState, useEffect } from 'react';
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
  RotateCw, 
  Smile, 
  Frown, 
  Heart, 
  Coffee,
  User,
  Search,
  RefreshCw
} from 'lucide-react';

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

const AvatarEditorTool: React.FC = () => {
  const [currentFigure, setCurrentFigure] = useState<AvatarFigure>({
    hr: '100-7-',
    hd: '190-7-',
    ch: '210-66-',
    lg: '270-82-',
    sh: '290-80-',
    ha: '',
    he: '',
    ea: '',
    fa: '',
    cp: '',
    cc: '',
    ca: '',
    wa: '',
    gesture: 'nrm',
    actions: [],
    item: '=0',
    direction: 2,
    headDirection: 2,
    gender: 'M',
    size: 'size=l'
  });

  const [currentCategory, setCurrentCategory] = useState('head');
  const [currentColor, setCurrentColor] = useState('7');
  const [habboName, setHabboName] = useState('');
  const [selectedHotel, setSelectedHotel] = useState('com.br');

  const hotels = [
    { value: 'com.br', label: '🇧🇷 BR', domain: 'habbo.com.br' },
    { value: 'es', label: '🇪🇸 ES', domain: 'habbo.es' },
    { value: 'fi', label: '🇫🇮 FI', domain: 'habbo.fi' },
    { value: 'it', label: '🇮🇹 IT', domain: 'habbo.it' },
    { value: 'nl', label: '🇳🇱 NL', domain: 'habbo.nl' },
    { value: 'de', label: '🇩🇪 DE', domain: 'habbo.de' },
    { value: 'fr', label: '🇫🇷 FR', domain: 'habbo.fr' },
    { value: 'com', label: '🌍 COM', domain: 'habbo.com' },
    { value: 'com.tr', label: '🇹🇷 TR', domain: 'habbo.com.tr' }
  ];

  const expressions = [
    { id: 'nrm', name: 'Normal', icon: '😐' },
    { id: 'sml', name: 'Feliz', icon: '😊' },
    { id: 'sad', name: 'Triste', icon: '😢' },
    { id: 'agr', name: 'Enojado', icon: '😠' },
    { id: 'srp', name: 'Surpreso', icon: '😲' },
    { id: 'eyb', name: 'Dormindo', icon: '😴' },
    { id: 'spk', name: 'Falando', icon: '🗣️' }
  ];

  const actions = [
    { id: '', name: 'Nada', icon: '👤' },
    { id: 'wlk', name: 'Andando', icon: '🚶' },
    { id: 'lay', name: 'Deitado', icon: '🛏️' },
    { id: 'sit', name: 'Sentado', icon: '🪑' },
    { id: 'wav', name: 'Acenando', icon: '👋' },
    { id: 'crr', name: 'Carregando', icon: '📦' },
    { id: 'drk', name: 'Bebendo', icon: '🥤' }
  ];

  const handItems = [
    { id: '=0', name: 'Nada', icon: '✋' },
    { id: '=1', name: 'Água', icon: '💧' },
    { id: '=2', name: 'Cenoura', icon: '🥕' },
    { id: '=3', name: 'Sorvete', icon: '🍦' },
    { id: '=5', name: 'Habbo Cola', icon: '🥤' },
    { id: '=6', name: 'Café', icon: '☕' },
    { id: '=9', name: 'Poção do Amor', icon: '💕' },
    { id: '=33', name: 'Calippo', icon: '🍧' },
    { id: '=42', name: 'Chá Japonês', icon: '🍵' },
    { id: '=43', name: 'Tomate', icon: '🍅' },
    { id: '=44', name: 'Radioativo', icon: '☢️' },
    { id: '=667', name: 'Coquetel', icon: '🍹' }
  ];

  const colors = [
    { id: '1', name: 'Pele Clara', hex: '#FFDBB4' },
    { id: '2', name: 'Pele Média', hex: '#F1C27D' },
    { id: '3', name: 'Pele Escura', hex: '#E0AC69' },
    { id: '4', name: 'Pele Muito Escura', hex: '#C68642' },
    { id: '5', name: 'Pele Negra', hex: '#8D5524' },
    { id: '6', name: 'Pele Asiática', hex: '#FFDAB9' },
    { id: '7', name: 'Pele Padrão', hex: '#FFE4C4' },
    { id: '8', name: 'Pele Mediterrânea', hex: '#D2B48C' },
    { id: '9', name: 'Pele Indian', hex: '#CD853F' },
    { id: '10', name: 'Pele Latino', hex: '#DEB887' }
  ];

  const generateAvatarUrl = () => {
    const baseUrl = `https://www.habbo.com/habbo-imaging/avatarimage`;
    const figure = `${currentFigure.hr}${currentFigure.hd}${currentFigure.ch}${currentFigure.lg}${currentFigure.sh}${currentFigure.ha}${currentFigure.he}${currentFigure.ea}${currentFigure.fa}${currentFigure.cp}${currentFigure.cc}${currentFigure.ca}${currentFigure.wa}`;
    
    const params = new URLSearchParams({
      figure: figure,
      gender: currentFigure.gender,
      direction: currentFigure.direction.toString(),
      head_direction: currentFigure.headDirection.toString(),
      action: currentFigure.actions.join(','),
      gesture: currentFigure.gesture,
      item: currentFigure.item,
      size: currentFigure.size
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generateAvatarUrl();
    link.download = `avatar-${habboName || 'habbo'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateFigure = (key: keyof AvatarFigure, value: any) => {
    setCurrentFigure(prev => ({ ...prev, [key]: value }));
  };

  const rotateDirection = (type: 'body' | 'head', direction: 'left' | 'right') => {
    if (type === 'body') {
      const newDirection = direction === 'left' 
        ? (currentFigure.direction - 1 + 8) % 8 
        : (currentFigure.direction + 1) % 8;
      updateFigure('direction', newDirection);
    } else {
      const newDirection = direction === 'left' 
        ? (currentFigure.headDirection - 1 + 8) % 8 
        : (currentFigure.headDirection + 1) % 8;
      updateFigure('headDirection', newDirection);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white volter-font mb-2"
            style={{
              textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
            }}>
          🎨 Editor de Visuais Habbo
        </h2>
        <p className="text-white/90 volter-font">
          Crie e personalize seu avatar com milhares de opções de roupas e acessórios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da Esquerda - Preview do Avatar */}
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
          <CardHeader className="text-center">
            <CardTitle className="volter-font text-xl">👤 Preview do Avatar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Controles de Direção */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="volter-font">Direção da Cabeça</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotateDirection('head', 'left')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                    {currentFigure.headDirection}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotateDirection('head', 'right')}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="volter-font">Direção do Corpo</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotateDirection('body', 'left')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                    {currentFigure.direction}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotateDirection('body', 'right')}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Avatar Preview */}
            <div className="flex justify-center">
              <img
                src={generateAvatarUrl()}
                alt="Avatar Habbo"
                className="w-48 h-48 object-contain border-2 border-gray-300 rounded-lg"
              />
            </div>

            {/* Controles de Tamanho */}
            <div className="space-y-2">
              <Label className="volter-font">Tamanho</Label>
              <Select value={currentFigure.size} onValueChange={(value) => updateFigure('size', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="headonly=1">Cabeça</SelectItem>
                  <SelectItem value="size=s">Mini</SelectItem>
                  <SelectItem value="size=m">Normal</SelectItem>
                  <SelectItem value="size=l">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botão Download */}
            <Button onClick={handleDownload} className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Baixar Avatar
            </Button>
          </CardContent>
        </Card>

        {/* Coluna Central - Categorias e Roupas */}
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
          <CardHeader>
            <CardTitle className="volter-font text-xl">👕 Roupas e Acessórios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seletor de Gênero */}
            <div className="space-y-2">
              <Label className="volter-font">Gênero</Label>
              <div className="flex gap-2">
                {(['M', 'F', 'U'] as const).map((gender) => (
                  <Button
                    key={gender}
                    variant={currentFigure.gender === gender ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFigure('gender', gender)}
                    className="flex-1"
                  >
                    {gender === 'M' ? '♂' : gender === 'F' ? '♀' : '⚤'} 
                    {gender === 'M' ? 'Masculino' : gender === 'F' ? 'Feminino' : 'Unissex'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Categorias */}
            <Tabs value={currentCategory} onValueChange={setCurrentCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="head">👤 Rostos</TabsTrigger>
                <TabsTrigger value="hair">💇 Cabelos</TabsTrigger>
                <TabsTrigger value="clothes">👕 Roupas</TabsTrigger>
                <TabsTrigger value="accessories">🎩 Acessórios</TabsTrigger>
              </TabsList>
              
              <TabsContent value="head" className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {[190, 180, 185, 200, 210].map((id) => (
                    <Button
                      key={id}
                      variant="outline"
                      size="sm"
                      onClick={() => updateFigure('hd', `${id}-${currentColor}-`)}
                      className="h-16 flex flex-col items-center justify-center text-xs"
                    >
                      <span className="text-lg">👤</span>
                      <span>ID {id}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hair" className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {[100, 101, 102, 103, 104, 105].map((id) => (
                    <Button
                      key={id}
                      variant="outline"
                      size="sm"
                      onClick={() => updateFigure('hr', `${id}-${currentColor}-`)}
                      className="h-16 flex flex-col items-center justify-center text-xs"
                    >
                      <span className="text-lg">💇</span>
                      <span>ID {id}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="clothes" className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {[210, 211, 212, 213, 214, 215].map((id) => (
                    <Button
                      key={id}
                      variant="outline"
                      size="sm"
                      onClick={() => updateFigure('ch', `${id}-${currentColor}-`)}
                      className="h-16 flex flex-col items-center justify-center text-xs"
                    >
                      <span className="text-lg">👕</span>
                      <span>ID {id}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="accessories" className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((id) => (
                    <Button
                      key={id}
                      variant="outline"
                      size="sm"
                      onClick={() => updateFigure('ha', `${id}-${currentColor}-`)}
                      className="h-16 flex flex-col items-center justify-center text-xs"
                    >
                      <span className="text-lg">🎩</span>
                      <span>ID {id}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Coluna da Direita - Cores e Opções */}
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
          <CardHeader>
            <CardTitle className="volter-font text-xl">🎨 Cores e Opções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Paleta de Cores */}
            <div className="space-y-2">
              <Label className="volter-font">Paleta de Cores</Label>
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <Button
                    key={color.id}
                    variant={currentColor === color.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentColor(color.id)}
                    className="h-12 w-12 p-0"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Expressões */}
            <div className="space-y-2">
              <Label className="volter-font">Expressões</Label>
              <div className="grid grid-cols-4 gap-2">
                {expressions.map((expr) => (
                  <Button
                    key={expr.id}
                    variant={currentFigure.gesture === expr.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFigure('gesture', expr.id)}
                    className="h-16 flex flex-col items-center justify-center text-xs"
                  >
                    <span className="text-lg">{expr.icon}</span>
                    <span>{expr.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Ações */}
            <div className="space-y-2">
              <Label className="volter-font">Ações</Label>
              <div className="grid grid-cols-4 gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={currentFigure.actions.includes(action.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newActions = currentFigure.actions.includes(action.id)
                        ? currentFigure.actions.filter(a => a !== action.id)
                        : [...currentFigure.actions, action.id];
                      updateFigure('actions', newActions);
                    }}
                    className="h-16 flex flex-col items-center justify-center text-xs"
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span>{action.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Itens na Mão */}
            <div className="space-y-2">
              <Label className="volter-font">Item na Mão</Label>
              <div className="grid grid-cols-4 gap-2">
                {handItems.slice(0, 8).map((item) => (
                  <Button
                    key={item.id}
                    variant={currentFigure.item === item.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFigure('item', item.id)}
                    className="h-16 flex flex-col items-center justify-center text-xs"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Busca de Usuário */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
        <CardHeader>
          <CardTitle className="volter-font text-xl">🔍 Buscar Usuário Habbo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="volter-font">Nome do Habbo</Label>
              <Input
                placeholder="Digite o nome do usuário"
                value={habboName}
                onChange={(e) => setHabboName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="volter-font">Hotel</Label>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.value} value={hotel.value}>
                      {hotel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="volter-font">Ações</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarEditorTool;
