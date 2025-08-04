
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Copy, Download, Shuffle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PuhekuplaFigureManager, type PuhekuplaFigure } from '@/lib/puhekuplaFigureManager';

interface Hotel {
  code: string;
  name: string;
  flag: string;
  url: string;
}

interface PuhekuplaAvatarPreviewCleanProps {
  currentFigure: PuhekuplaFigure;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  currentDirection: string;
  hotels: Hotel[];
  onFigureChange: (figure: PuhekuplaFigure) => void;
  onDirectionChange: (direction: string) => void;
  onGenderChange: (gender: 'M' | 'F') => void;
  onHotelChange: (hotel: string) => void;
}

export const PuhekuplaAvatarPreviewClean = ({
  currentFigure,
  selectedGender,
  selectedHotel,
  currentDirection,
  hotels,
  onFigureChange,
  onDirectionChange,
  onGenderChange,
  onHotelChange
}: PuhekuplaAvatarPreviewCleanProps) => {
  const [username, setUsername] = useState('');
  const [hotelPopoverOpen, setHotelPopoverOpen] = useState(false);
  const { toast } = useToast();

  const getAvatarUrl = () => {
    const hotel = hotels.find(h => h.code === selectedHotel);
    const baseUrl = hotel?.url || 'habbo.com';
    const figureString = PuhekuplaFigureManager.figureToString(currentFigure);
    return `https://www.${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&size=l&direction=${currentDirection}&head_direction=3&action=std&gesture=std`;
  };

  const handleSearchUser = async () => {
    if (!username.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome de usuário válido",
        variant: "destructive"
      });
      return;
    }

    try {
      const hotel = hotels.find(h => h.code === selectedHotel);
      const hotelUrl = hotel?.url || 'habbo.com';
      const response = await fetch(`https://www.${hotelUrl}/api/public/users?name=${username}`);
      
      if (!response.ok) throw new Error('Usuário não encontrado');
      
      const data = await response.json();
      if (data.figureString) {
        const figure = PuhekuplaFigureManager.parseFigureString(data.figureString);
        onFigureChange(figure);
        toast({
          title: "✅ Sucesso",
          description: `Visual de ${data.name} carregado!`
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Usuário não encontrado neste hotel",
        variant: "destructive"
      });
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(getAvatarUrl());
    toast({
      title: "📋 Copiado!",
      description: "URL do avatar copiada"
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getAvatarUrl();
    link.download = `avatar-puhekupla-${Date.now()}.png`;
    link.click();
    toast({
      title: "⬇️ Download iniciado",
      description: "Avatar sendo baixado"
    });
  };

  const handleRandomize = () => {
    const randomFigure = PuhekuplaFigureManager.generateRandomFigure(selectedGender);
    onFigureChange(randomFigure);
    toast({
      title: "🎲 Avatar Randomizado!",
      description: "Novo visual gerado"
    });
  };

  const handleDirectionChange = () => {
    const directions = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = (currentIndex + 1) % directions.length;
    onDirectionChange(directions[nextIndex]);
  };

  const selectedHotelData = hotels.find(h => h.code === selectedHotel);

  return (
    <div className="flex flex-col space-y-4">
      {/* Avatar e Botões de Ação */}
      <div className="flex gap-4">
        {/* Avatar Preview - Aumentado */}
        <div className="relative">
          <div className="w-32 h-40 bg-gradient-to-b from-purple-100 to-blue-100 rounded-lg border-2 border-purple-200 flex items-end justify-center p-2">
            <img
              src={getAvatarUrl()}
              alt="Puhekupla Avatar Preview"
              className="max-w-full max-h-full object-contain cursor-pointer"
              style={{ imageRendering: 'pixelated' }}
              onClick={handleDirectionChange}
              title="Clique para girar o avatar"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1&size=l&direction=2&head_direction=3&action=std&gesture=std`;
              }}
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            title="Copiar URL da Imagem"
            className="w-10 h-10 p-0"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            title="Download da Imagem"
            className="w-10 h-10 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomize}
            title="Avatar Aleatório"
            className="w-10 h-10 p-0"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDirectionChange}
            title="Girar Avatar"
            className="w-10 h-10 p-0"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Seleção de Gênero */}
      <div className="flex justify-center gap-2">
        <button 
          className={`p-2 rounded text-2xl transition-colors ${
            selectedGender === 'M' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => onGenderChange('M')}
          title="Masculino"
        >
          ♂️
        </button>
        <button 
          className={`p-2 rounded text-2xl transition-colors ${
            selectedGender === 'F' ? 'bg-pink-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => onGenderChange('F')}
          title="Feminino"
        >
          ♀️
        </button>
      </div>

      {/* Busca de Usuário */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuário Habbo"
              className="text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
            />
          </div>
          
          {/* Seletor de Hotel */}
          <Popover open={hotelPopoverOpen} onOpenChange={setHotelPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                {selectedHotelData?.flag || '🌍'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="space-y-1">
                {hotels.map((hotel) => (
                  <button
                    key={hotel.code}
                    className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 flex items-center gap-2 ${
                      selectedHotel === hotel.code ? 'bg-purple-50' : ''
                    }`}
                    onClick={() => {
                      onHotelChange(hotel.code);
                      setHotelPopoverOpen(false);
                    }}
                  >
                    <span>{hotel.flag}</span>
                    <span>{hotel.name}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Botão de Busca */}
        <Button onClick={handleSearchUser} size="sm" className="w-full">
          Buscar Usuário
        </Button>
      </div>
    </div>
  );
};
