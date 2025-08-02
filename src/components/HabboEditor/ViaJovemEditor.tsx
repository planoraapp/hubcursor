import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw, Copy, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

// Categorias de roupas como no ViaJovem
const CLOTHING_CATEGORIES = [
  { id: 'hr', name: 'Cabelo', icon: '💇' },
  { id: 'hd', name: 'Cabeça', icon: '👤' },
  { id: 'ch', name: 'Camisa', icon: '👕' },
  { id: 'lg', name: 'Calça', icon: '👖' },
  { id: 'sh', name: 'Sapatos', icon: '👟' },
  { id: 'ha', name: 'Chapéu', icon: '🎩' },
  { id: 'ea', name: 'Acessório', icon: '👓' },
  { id: 'cc', name: 'Casaco', icon: '🧥' }
];

// Cores reais do Habbo
const HABBO_COLORS = [
  { id: '1', hex: 'FFFFFF', name: 'Branco' },
  { id: '2', hex: '000000', name: 'Preto' },
  { id: '3', hex: 'FF0000', name: 'Vermelho' },
  { id: '4', hex: '00FF00', name: 'Verde' },
  { id: '5', hex: '0000FF', name: 'Azul' },
  { id: '6', hex: 'FFFF00', name: 'Amarelo' },
  { id: '7', hex: 'FF00FF', name: 'Rosa' },
  { id: '8', hex: '00FFFF', name: 'Ciano' },
  { id: '9', hex: 'FFA500', name: 'Laranja' },
  { id: '10', hex: '800080', name: 'Roxo' }
];

const ViaJovemEditor = () => {
  const [username, setUsername] = useState('');
  const [figure, setFigure] = useState('hr-115-45.hd-180-1.ch-210-66.lg-270-82.sh-300-62');
  const [selectedHotel, setSelectedHotel] = useState('com.br');
  const [direction, setDirection] = useState('2');
  const [action, setAction] = useState('std');
  const [selectedCategory, setSelectedCategory] = useState('hr');
  const [selectedColor, setSelectedColor] = useState('1');
  const [avatarUrl, setAvatarUrl] = useState('');

  const updateAvatarUrl = useCallback(() => {
    const url = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${figure}&direction=${direction}&head_direction=${direction}&action=${action}&size=l`;
    setAvatarUrl(url);
  }, [figure, selectedHotel, direction, action]);

  const handleSearchUser = async () => {
    if (!username.trim()) {
      toast.error('Digite um nome de usuário');
      return;
    }

    try {
      const response = await fetch(`https://www.habbo.${selectedHotel}/api/public/users?name=${username}`);
      const data = await response.json();
      
      if (data && data.figureString) {
        setFigure(data.figureString);
        toast.success(`Avatar de ${username} carregado!`);
        updateAvatarUrl();
      } else {
        toast.error('Usuário não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar usuário');
    }
  };

  const handleRotate = () => {
    const directions = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const currentIndex = directions.indexOf(direction);
    const nextIndex = (currentIndex + 1) % directions.length;
    setDirection(directions[nextIndex]);
    updateAvatarUrl();
  };

  const handleCopyFigure = () => {
    navigator.clipboard.writeText(figure);
    toast.success('Figure copiado!');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(avatarUrl);
    toast.success('URL copiado!');
  };

  // Gerar itens mock para a categoria selecionada
  const generateClothingItems = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: `${selectedCategory}_${i + 1}`,
      name: `${selectedCategory.toUpperCase()} ${i + 1}`,
      isHC: i % 4 === 0,
      isNFT: i % 8 === 0,
      isLTD: i % 12 === 0,
      colors: HABBO_COLORS.slice(0, Math.floor(Math.random() * 5) + 3)
    }));
  };

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar Esquerda - Categorias */}
      <div className="w-20 bg-blue-600 flex flex-col">
        {CLOTHING_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`p-3 text-white hover:bg-blue-700 transition-colors flex flex-col items-center text-xs ${
              selectedCategory === category.id ? 'bg-blue-700' : ''
            }`}
            title={category.name}
          >
            <span className="text-lg mb-1">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex">
        {/* Painel de Roupas */}
        <div className="w-80 border-r flex flex-col">
          {/* Header da categoria */}
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-sm">
              {CLOTHING_CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h3>
          </div>

          {/* Grid de roupas */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {generateClothingItems().map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                  title={item.name}
                >
                  {/* Placeholder da roupa */}
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    {item.name}
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-1 right-1 flex flex-col gap-1">
                    {item.isHC && (
                      <div className="w-4 h-4 bg-yellow-400 text-black text-xs flex items-center justify-center rounded font-bold">
                        HC
                      </div>
                    )}
                    {item.isNFT && (
                      <div className="w-4 h-4 bg-purple-500 text-white text-xs flex items-center justify-center rounded font-bold">
                        N
                      </div>
                    )}
                    {item.isLTD && (
                      <div className="w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded font-bold">
                        L
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paleta de Cores */}
          <div className="p-4 border-t">
            <h4 className="font-semibold text-sm mb-2">Cores</h4>
            <div className="grid grid-cols-5 gap-2">
              {HABBO_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    selectedColor === color.id ? 'border-blue-500 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: `#${color.hex}` }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Painel do Avatar */}
        <div className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Preview do Avatar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Controles de hotel */}
              <div className="flex gap-2">
                <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="com.br">🇧🇷 BR</SelectItem>
                    <SelectItem value="es">🇪🇸 ES</SelectItem>
                    <SelectItem value="com">🇺🇸 COM</SelectItem>
                    <SelectItem value="de">🇩🇪 DE</SelectItem>
                    <SelectItem value="fr">🇫🇷 FR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-32 h-32 object-contain"
                      onLoad={updateAvatarUrl}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                      Avatar
                    </div>
                  )}
                  <Button
                    onClick={handleRotate}
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 w-8 h-8 p-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Busca de usuário */}
                <div className="flex gap-2 w-full max-w-sm">
                  <Input
                    placeholder="Nome do usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                  />
                  <Button onClick={handleSearchUser} size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button onClick={handleCopyFigure} size="sm" variant="outline">
                    <Copy className="w-4 h-4 mr-1" />
                    Figure
                  </Button>
                  <Button onClick={handleCopyUrl} size="sm" variant="outline">
                    <Copy className="w-4 h-4 mr-1" />
                    URL
                  </Button>
                </div>

                {/* Figure String */}
                <div className="w-full">
                  <label className="text-sm font-medium">Figure String:</label>
                  <Input
                    value={figure}
                    onChange={(e) => setFigure(e.target.value)}
                    className="mt-1 font-mono text-xs"
                    readOnly
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViaJovemEditor;