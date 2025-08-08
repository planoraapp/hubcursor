import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ViaJovemAvatarSection } from './ViaJovemAvatarSection';
import { ViaJovemFigureManager, ViaJovemFigure } from '@/lib/viaJovemFigureManager';
import { useToast } from '@/hooks/use-toast';
import FlashAssetsV3Complete from '@/components/HabboEditor/FlashAssetsV3Complete';

interface ViaJovemEditorRedesignedProps {
  className?: string;
}

const ViaJovemEditorRedesigned = ({ className = '' }: ViaJovemEditorRedesignedProps) => {
  const [currentFigure, setCurrentFigure] = useState<ViaJovemFigure>(() =>
    ViaJovemFigureManager.getDefaultFigure('M')
  );
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedColor, setSelectedColor] = useState('1');
  const [username, setUsername] = useState('');

  const { toast } = useToast();

  // Hotéis disponíveis
  const hotels = [
    { code: 'com', name: 'Habbo.com', flag: '🌍', url: 'habbo.com' },
    { code: 'com.br', name: 'Habbo.com.br', flag: '🇧🇷', url: 'habbo.com.br' },
    { code: 'es', name: 'Habbo.es', flag: '🇪🇸', url: 'habbo.es' },
    { code: 'fr', name: 'Habbo.fr', flag: '🇫🇷', url: 'habbo.fr' },
    { code: 'de', name: 'Habbo.de', flag: '🇩🇪', url: 'habbo.de' },
    { code: 'it', name: 'Habbo.it', flag: '🇮🇹', url: 'habbo.it' },
    { code: 'fi', name: 'Habbo.fi', flag: '🇫🇮', url: 'habbo.fi' }
  ];

  // Load figure from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const figureParam = urlParams.get('figure');
    const genderParam = urlParams.get('gender') as 'M' | 'F' | 'U';
    const hotelParam = urlParams.get('hotel');

    if (figureParam) {
      try {
        const figure = ViaJovemFigureManager.parseFigureString(figureParam);
        setCurrentFigure(figure);
      } catch (error) {
        console.error('Error parsing figure from URL:', error);
      }
    }

    if (genderParam && ['M', 'F', 'U'].includes(genderParam)) {
      setSelectedGender(genderParam);
    }

    if (hotelParam) {
      setSelectedHotel(hotelParam);
    }
  }, []);

  const handleGenderChange = (gender: 'M' | 'F' | 'U') => {
    console.log('👤 [ViaJovemEditor] Mudança de gênero:', gender);
    setSelectedGender(gender);
  };

  const handleCompleteItemSelect = (item: any, colorId: string) => {
    console.log('🎯 [ViaJovemEditor] Item do sistema COMPLETO selecionado:', item);
    
    setSelectedItem(item.figureId);
    setSelectedColor(colorId);
    
    // Aplicar ao avatar
    const updatedFigure = ViaJovemFigureManager.applyClothingItem(
      currentFigure, 
      item, 
      colorId
    );
    
    setCurrentFigure(updatedFigure);
    
    // Toast com informações da categoria
    const categoryEmojis: Record<string, string> = {
      'hd': '😊', 'hr': '💇', 'ha': '🎩', 'ea': '👓', 'fa': '🎭',
      'ch': '👕', 'cc': '🧥', 'ca': '💍', 'cp': '🎨',
      'lg': '👖', 'sh': '👟', 'wa': '🎀'
    };
    
    const emoji = categoryEmojis[item.category] || '👕';
    const rarityText = item.rarity !== 'common' ? ` ${item.rarity.toUpperCase()}` : '';
    
    toast({
      title: `${emoji} Item aplicado!`,
      description: `${item.name}${rarityText} foi aplicado ao seu avatar.`,
    });
  };

  const handleRestoreFigure = (figureString: string) => {
    try {
      const figure = ViaJovemFigureManager.parseFigureString(figureString);
      setCurrentFigure(figure);
      
      toast({
        title: "🔄 Avatar restaurado!",
        description: "Avatar foi restaurado do histórico.",
      });
    } catch (error) {
      console.error('Error restoring figure:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível restaurar o avatar.",
        variant: "destructive"
      });
    }
  };

  const handleCopyUrl = () => {
    const figureString = ViaJovemFigureManager.getFigureString(currentFigure);
    const hotel = hotels.find(h => h.code === selectedHotel);
    const baseUrl = hotel?.url || 'habbo.com';
    const imageUrl = `https://www.${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
    navigator.clipboard.writeText(imageUrl);
    toast({
      title: "URL copiada!",
      description: "URL da imagem foi copiada para a área de transferência.",
    });
  };

  const handleDownload = () => {
    const figureString = ViaJovemFigureManager.getFigureString(currentFigure);
    const hotel = hotels.find(h => h.code === selectedHotel);
    const baseUrl = hotel?.url || 'habbo.com';
    const imageUrl = `https://www.${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `habbo-avatar-${figureString}.png`;
    link.click();
    
    toast({
      title: "Download iniciado!",
      description: "A imagem do avatar está sendo baixada.",
    });
  };

  const handleRandomize = () => {
    const randomFigure = ViaJovemFigureManager.getDefaultFigure(selectedGender === 'U' ? 'M' : selectedGender);
    setCurrentFigure(randomFigure);
    toast({
      title: "Avatar randomizado!",
      description: "Um novo avatar aleatório foi gerado.",
    });
  };

  const handleSearchUser = () => {
    if (username.trim()) {
      toast({
        title: "Buscando usuário...",
        description: `Procurando por ${username} no ${selectedHotel}`,
      });
      // TODO: Implement user search functionality
    }
  };

  return (
    <div className={`w-full h-full flex flex-col lg:flex-row gap-4 p-4 ${className}`}>
      {/* Avatar Preview (Esquerda) */}
      <div className="lg:w-80">
        <Card>
          <CardContent className="p-4">
            <ViaJovemAvatarSection
              currentFigure={ViaJovemFigureManager.getFigureString(currentFigure)}
              selectedGender={selectedGender === 'U' ? 'M' : selectedGender}
              selectedHotel={selectedHotel}
              username={username}
              onGenderChange={handleGenderChange}
              onHotelChange={setSelectedHotel}
              onUsernameChange={setUsername}
              onSearchUser={handleSearchUser}
              onCopyUrl={handleCopyUrl}
              onDownload={handleDownload}
              onRandomize={handleRandomize}
            />
          </CardContent>
        </Card>
      </div>

      {/* Editor COMPLETO (Direita) - Banner Removido */}
      <div className="flex-1">
        <Card className="h-full">
          <CardContent className="p-4 h-full">
            <FlashAssetsV3Complete
              selectedGender={selectedGender === 'U' ? 'M' : selectedGender}
              selectedHotel={selectedHotel}
              onItemSelect={handleCompleteItemSelect}
              selectedItem={selectedItem}
              selectedColor={selectedColor}
              currentFigureString={ViaJovemFigureManager.getFigureString(currentFigure)}
              onRestoreFigure={handleRestoreFigure}
              className="h-full"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViaJovemEditorRedesigned;
