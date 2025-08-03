import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useFlashAssetsViaJovem } from '@/hooks/useFlashAssetsViaJovem';
import { ViaJovemAvatarSection } from './ViaJovemAvatarSection';
import { ViaJovemClothingGridClean } from './ViaJovemClothingGridClean';
interface ViaJovemEditorRedesignedProps {
  className?: string;
}
export const ViaJovemEditorRedesigned = ({
  className = ''
}: ViaJovemEditorRedesignedProps) => {
  const [currentFigure, setCurrentFigure] = useState('hd-190-1.hr-828-45.ch-665-92.lg-270-82.sh-305-62');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [selectedCategory, setSelectedCategory] = useState('ch');
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState('1');
  const [selectedItem, setSelectedItem] = useState('665');
  const {
    toast
  } = useToast();

  // Hook para dados Flash Assets
  const {
    items,
    isLoading,
    error
  } = useFlashAssetsViaJovem();

  // Categorias ViaJovem
  const categories = [{
    id: 'hd',
    name: 'Rostos',
    icon: '👤'
  }, {
    id: 'hr',
    name: 'Cabelos',
    icon: '💇'
  }, {
    id: 'ch',
    name: 'Camisetas',
    icon: '👕'
  }, {
    id: 'lg',
    name: 'Calças',
    icon: '👖'
  }, {
    id: 'sh',
    name: 'Sapatos',
    icon: '👟'
  }, {
    id: 'ha',
    name: 'Chapéus',
    icon: '🎩'
  }, {
    id: 'ea',
    name: 'Óculos',
    icon: '👓'
  }, {
    id: 'fa',
    name: 'Acessórios Faciais',
    icon: '😷'
  }, {
    id: 'cc',
    name: 'Casacos',
    icon: '🧥'
  }, {
    id: 'ca',
    name: 'Acessórios Peito',
    icon: '🎖️'
  }, {
    id: 'wa',
    name: 'Cintura',
    icon: '👔'
  }, {
    id: 'cp',
    name: 'Estampas',
    icon: '🎨'
  }];
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
      const hotelUrl = selectedHotel === 'com' ? 'habbo.com' : `habbo.${selectedHotel}`;
      const response = await fetch(`https://www.${hotelUrl}/api/public/users?name=${username}`);
      if (!response.ok) throw new Error('Usuário não encontrado');
      const data = await response.json();
      if (data.figureString) {
        setCurrentFigure(data.figureString);
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
  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);

    // Atualizar figure string
    const figureParts = currentFigure.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);

    // Remove categoria existente
    const filteredParts = figureParts.filter(part => !categoryPattern.test(part));

    // Adiciona nova parte
    const newPart = `${selectedCategory}-${itemId}-${selectedColor}`;
    filteredParts.push(newPart);
    setCurrentFigure(filteredParts.join('.'));
  };
  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);

    // Atualizar cor na figure atual
    const figureParts = currentFigure.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    const updatedParts = figureParts.map(part => {
      if (categoryPattern.test(part)) {
        const [cat, item] = part.split('-');
        return `${cat}-${item}-${colorId}`;
      }
      return part;
    });
    setCurrentFigure(updatedParts.join('.'));
  };
  const handleCopyUrl = () => {
    const hotelUrl = selectedHotel === 'com' ? 'habbo.com' : `habbo.${selectedHotel}`;
    const url = `https://www.${hotelUrl}/habbo-imaging/avatarimage?figure=${currentFigure}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
    navigator.clipboard.writeText(url);
    toast({
      title: "📋 Copiado!",
      description: "URL do avatar copiada"
    });
  };
  const handleDownload = () => {
    const hotelUrl = selectedHotel === 'com' ? 'habbo.com' : `habbo.${selectedHotel}`;
    const url = `https://www.${hotelUrl}/habbo-imaging/avatarimage?figure=${currentFigure}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `avatar-${currentFigure.substring(0, 10)}.png`;
    link.click();
    toast({
      title: "⬇️ Download iniciado",
      description: "Avatar sendo baixado"
    });
  };
  const handleRandomize = () => {
    const basicCategories = ['hd', 'hr', 'ch', 'lg', 'sh'];
    const newFigureParts = [];
    basicCategories.forEach(category => {
      const categoryItems = items.filter(item => item.category === category && (item.gender === selectedGender || item.gender === 'U'));
      if (categoryItems.length > 0) {
        const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
        const randomColor = Math.floor(Math.random() * 20) + 1;
        newFigureParts.push(`${category}-${randomItem.figureId}-${randomColor}`);
      }
    });
    setCurrentFigure(newFigureParts.join('.'));
    toast({
      title: "🎲 Avatar Randomizado!",
      description: "Novo visual gerado"
    });
  };
  return <div className={`max-w-7xl mx-auto p-4 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        
      </div>

      {/* Seleção de Gênero */}
      <div className="flex justify-center gap-2">
        <button className={`px-4 py-2 rounded ${selectedGender === 'M' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setSelectedGender('M')}>
          👨 Masculino
        </button>
        <button className={`px-4 py-2 rounded ${selectedGender === 'F' ? 'bg-pink-500 text-white' : 'bg-gray-200'}`} onClick={() => setSelectedGender('F')}>
          👩 Feminino
        </button>
      </div>

      {/* Layout Principal */}
      <div className="flex gap-6">
        {/* Seção do Avatar (Esquerda) */}
        <div className="w-40">
          <Card>
            <CardContent className="p-4">
              <ViaJovemAvatarSection currentFigure={currentFigure} selectedHotel={selectedHotel} username={username} onHotelChange={setSelectedHotel} onUsernameChange={setUsername} onSearchUser={handleSearchUser} onCopyUrl={handleCopyUrl} onDownload={handleDownload} onRandomize={handleRandomize} />
            </CardContent>
          </Card>
        </div>

        {/* Seção das Roupas (Direita) */}
        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid grid-cols-6 lg:grid-cols-12 gap-1 mb-6">
                  {categories.map(category => <TabsTrigger key={category.id} value={category.id} className="text-xs px-2 py-2" title={category.name}>
                      <div className="text-center">
                        <div>{category.icon}</div>
                        <div className="text-[10px]">{category.name.split(' ')[0]}</div>
                      </div>
                    </TabsTrigger>)}
                </TabsList>

                {categories.map(category => <TabsContent key={category.id} value={category.id}>
                    <div className="mb-4">
                      <h3 className="font-bold text-lg">{category.name}</h3>
                    </div>
                    
                    {isLoading ? <div className="text-center py-8">
                        <div className="text-gray-500">Carregando roupas...</div>
                      </div> : error ? <div className="text-center py-8">
                        <div className="text-red-500">Erro ao carregar roupas</div>
                      </div> : <ViaJovemClothingGridClean items={items} selectedCategory={category.id} selectedGender={selectedGender} onItemSelect={handleItemSelect} onColorSelect={handleColorSelect} selectedItem={selectedItem} selectedColor={selectedColor} />}
                  </TabsContent>)}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default ViaJovemEditorRedesigned;