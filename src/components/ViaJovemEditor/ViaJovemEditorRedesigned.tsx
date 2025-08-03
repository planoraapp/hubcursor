
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

// Grouped sections with their categories
const categoryGroups = [
  {
    id: 'head',
    name: 'Cabeça e Acessórios',
    icon: '👤',
    categories: [
      { id: 'hd', name: 'Rostos', icon: '👤' },
      { id: 'hr', name: 'Cabelos', icon: '💇' },
      { id: 'ea', name: 'Óculos', icon: '👓' },
      { id: 'ha', name: 'Chapéus', icon: '🎩' }
    ]
  },
  {
    id: 'body',
    name: 'Corpo e Costas',
    icon: '👕',
    categories: [
      { id: 'ch', name: 'Camisetas', icon: '👕' },
      { id: 'cc', name: 'Casacos', icon: '🧥' },
      { id: 'ca', name: 'Acessórios Peito', icon: '🎖️' },
      { id: 'cp', name: 'Estampas', icon: '🎨' }
    ]
  },
  {
    id: 'legs',
    name: 'Calças e Pés',
    icon: '👖',
    categories: [
      { id: 'lg', name: 'Calças', icon: '👖' },
      { id: 'sh', name: 'Sapatos', icon: '👟' },
      { id: 'wa', name: 'Cintura', icon: '👔' }
    ]
  }
];

export const ViaJovemEditorRedesigned = ({
  className = ''
}: ViaJovemEditorRedesignedProps) => {
  const [currentFigure, setCurrentFigure] = useState('hd-190-1.hr-828-45.ch-665-92.lg-270-82.sh-305-62');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [selectedSection, setSelectedSection] = useState('head');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState('1');
  const [selectedItem, setSelectedItem] = useState('665');
  const { toast } = useToast();

  // Hook para dados Flash Assets
  const { items, isLoading, error } = useFlashAssetsViaJovem();

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
    const figureParts = currentFigure.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    const filteredParts = figureParts.filter(part => !categoryPattern.test(part));
    const newPart = `${selectedCategory}-${itemId}-${selectedColor}`;
    filteredParts.push(newPart);
    setCurrentFigure(filteredParts.join('.'));
  };

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
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
      const categoryItems = items.filter(item => 
        item.category === category && (item.gender === selectedGender || item.gender === 'U')
      );
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

  // Update selected category when section changes
  useEffect(() => {
    const currentGroup = categoryGroups.find(group => group.id === selectedSection);
    if (currentGroup && currentGroup.categories.length > 0) {
      setSelectedCategory(currentGroup.categories[0].id);
    }
  }, [selectedSection]);

  return (
    <div className={`max-w-7xl mx-auto p-4 space-y-6 ${className}`}>
      {/* Layout Principal */}
      <div className="flex gap-6">
        {/* Seção do Avatar (Esquerda) - Aumentada */}
        <div className="w-56">
          <Card>
            <CardContent className="p-4">
              <ViaJovemAvatarSection 
                currentFigure={currentFigure} 
                selectedHotel={selectedHotel} 
                username={username} 
                selectedGender={selectedGender}
                onGenderChange={setSelectedGender}
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

        {/* Seção das Roupas (Direita) */}
        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
              <Tabs value={selectedSection} onValueChange={setSelectedSection}>
                <TabsList className="grid grid-cols-3 gap-1 mb-6">
                  {categoryGroups.map(group => (
                    <TabsTrigger 
                      key={group.id} 
                      value={group.id} 
                      className="text-sm px-4 py-3"
                    >
                      <div className="text-center">
                        <div className="text-lg">{group.icon}</div>
                        <div className="text-xs mt-1">{group.name}</div>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categoryGroups.map(group => (
                  <TabsContent key={group.id} value={group.id}>
                    <div className="mb-4">
                      <h3 className="font-bold text-lg">{group.name}</h3>
                    </div>
                    
                    {/* Sub-categorias */}
                    <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                      <TabsList className="grid gap-1 mb-4" style={{ gridTemplateColumns: `repeat(${group.categories.length}, 1fr)` }}>
                        {group.categories.map(category => (
                          <TabsTrigger 
                            key={category.id} 
                            value={category.id} 
                            className="text-xs px-2 py-2"
                          >
                            <div className="text-center">
                              <div>{category.icon}</div>
                              <div className="text-[10px] mt-1">{category.name}</div>
                            </div>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {group.categories.map(category => (
                        <TabsContent key={category.id} value={category.id}>
                          {isLoading ? (
                            <div className="text-center py-8">
                              <div className="text-gray-500">Carregando roupas...</div>
                            </div>
                          ) : error ? (
                            <div className="text-center py-8">
                              <div className="text-red-500">Erro ao carregar roupas</div>
                            </div>
                          ) : (
                            <ViaJovemClothingGridClean 
                              items={items}
                              selectedCategory={category.id}
                              selectedGender={selectedGender}
                              onItemSelect={handleItemSelect}
                              onColorSelect={handleColorSelect}
                              selectedItem={selectedItem}
                              selectedColor={selectedColor}
                            />
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViaJovemEditorRedesigned;
