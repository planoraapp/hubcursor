
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Copy, Download, Shuffle, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Hotel {
  code: string;
  name: string;
  flag: string;
  url: string;
}

interface ViaJovemAvatarSectionProps {
  currentFigure: string;
  selectedHotel: string;
  username: string;
  onHotelChange: (hotel: string) => void;
  onUsernameChange: (username: string) => void;
  onSearchUser: () => void;
  onCopyUrl: () => void;
  onDownload: () => void;
  onRandomize: () => void;
}

const hotels: Hotel[] = [
  { code: 'com', name: 'Global', flag: '🌍', url: 'habbo.com' },
  { code: 'com.br', name: 'Brasil', flag: '🇧🇷', url: 'habbo.com.br' },
  { code: 'es', name: 'España', flag: '🇪🇸', url: 'habbo.es' },
  { code: 'de', name: 'Deutschland', flag: '🇩🇪', url: 'habbo.de' },
  { code: 'fr', name: 'France', flag: '🇫🇷', url: 'habbo.fr' },
  { code: 'it', name: 'Italia', flag: '🇮🇹', url: 'habbo.it' },
  { code: 'nl', name: 'Nederland', flag: '🇳🇱', url: 'habbo.nl' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮', url: 'habbo.fi' },
  { code: 'tr', name: 'Türkiye', flag: '🇹🇷', url: 'habbo.com.tr' }
];

export const ViaJovemAvatarSection = ({
  currentFigure,
  selectedHotel,
  username,
  onHotelChange,
  onUsernameChange,
  onSearchUser,
  onCopyUrl,
  onDownload,
  onRandomize
}: ViaJovemAvatarSectionProps) => {
  const { toast } = useToast();
  const [hotelPopoverOpen, setHotelPopoverOpen] = useState(false);

  const getAvatarUrl = () => {
    const hotel = hotels.find(h => h.code === selectedHotel);
    const baseUrl = hotel?.url || 'habbo.com';
    return `https://www.${baseUrl}/habbo-imaging/avatarimage?figure=${currentFigure}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
  };

  const selectedHotelData = hotels.find(h => h.code === selectedHotel);

  return (
    <div className="flex flex-col space-y-4">
      {/* Avatar e Botões */}
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-32 bg-gradient-to-b from-blue-100 to-purple-100 rounded-lg border-2 border-gray-200 flex items-end justify-center p-2">
            <img
              src={getAvatarUrl()}
              alt="Avatar Preview"
              className="max-w-full max-h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
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
            onClick={onCopyUrl}
            title="Copiar URL da Imagem"
            className="w-10 h-10 p-0"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            title="Download da Imagem"
            className="w-10 h-10 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRandomize}
            title="Avatar Aleatório"
            className="w-10 h-10 p-0"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Busca de Usuário */}
      <div className="flex gap-2" style={{ width: '140px' }}>
        <div className="flex-1">
          <Input
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Usuário Habbo"
            className="text-sm"
            onKeyPress={(e) => e.key === 'Enter' && onSearchUser()}
          />
        </div>
        
        {/* Seletor de Hotel com Popover */}
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
                    selectedHotel === hotel.code ? 'bg-blue-50' : ''
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
      <Button onClick={onSearchUser} size="sm" className="w-full">
        Buscar Usuário
      </Button>
    </div>
  );
};
