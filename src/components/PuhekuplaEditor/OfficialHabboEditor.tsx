
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import EnhancedAvatarPreview from '../HabboEditor/EnhancedAvatarPreview';
import FlashAssetsV3Complete from '../HabboEditor/FlashAssetsV3Complete';
import { useToast } from '@/hooks/use-toast';

interface AvatarState extends Record<string, string> {
  hd?: string;
  hr?: string;
  ch?: string;
  lg?: string;
  sh?: string;
  ha?: string;
  ea?: string;
  cc?: string;
  ca?: string;
  wa?: string;
  cp?: string;
  sk?: string;
}

const OfficialHabboEditor = () => {
  // Avatar inicial randomizado com roupas clássicas do Habbo
  const [avatarState, setAvatarState] = useState<AvatarState>({
    hd: '180-2', // Cor de pele clara (ID 2)
    hr: '828-45', // Cabelo clássico masculino castanho
    ch: '665-92', // Camiseta clássica azul
    lg: '700-1', // Calça clássica preta
    sh: '705-1' // Sapato clássico preto
  });
  
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [selectedColor, setSelectedColor] = useState('1');
  const [selectedItem, setSelectedItem] = useState('');

  const { toast } = useToast();

  // Randomizar avatar inicial com roupas clássicas
  useEffect(() => {
    const classicItems = {
      M: {
        hr: ['828', '1001', '205', '830'], // Cabelos masculinos clássicos
        ch: ['665', '1001', '255', '600'], // Camisetas clássicas
        lg: ['700', '280', '285', '290'], // Calças clássicas
        sh: ['705', '300', '310', '320'] // Sapatos clássicos
      },
      F: {
        hr: ['595', '600', '605', '830'], // Cabelos femininos clássicos
        ch: ['667', '1002', '256', '601'], // Camisetas femininas clássicas
        lg: ['701', '281', '286', '291'], // Calças femininas clássicas
        sh: ['705', '301', '311', '321'] // Sapatos femininos clássicos
      }
    };

    const genderItems = classicItems[selectedGender === 'U' ? 'M' : selectedGender];
    const randomAvatar = {
      hd: '180-2', // Sempre cor de pele clara
      hr: `${genderItems.hr[Math.floor(Math.random() * genderItems.hr.length)]}-${Math.floor(Math.random() * 10) + 40}`,
      ch: `${genderItems.ch[Math.floor(Math.random() * genderItems.ch.length)]}-${Math.floor(Math.random() * 20) + 60}`,
      lg: `${genderItems.lg[Math.floor(Math.random() * genderItems.lg.length)]}-${Math.floor(Math.random() * 10) + 1}`,
      sh: `${genderItems.sh[Math.floor(Math.random() * genderItems.sh.length)]}-${Math.floor(Math.random() * 10) + 1}`
    };

    setAvatarState(randomAvatar);
  }, [selectedGender]);

  const generateFigureString = (): string => {
    const parts: string[] = [];
    const categoryOrder = ['hd', 'hr', 'ch', 'cc', 'lg', 'sh', 'ha', 'ea', 'fa', 'ca', 'wa', 'cp'];
    
    categoryOrder.forEach(category => {
      if (avatarState[category as keyof AvatarState]) {
        parts.push(`${category}-${avatarState[category as keyof AvatarState]}`);
      }
    });
    
    return parts.join('.');
  };

  // Sistema V3 COMPLETO: Handler para Flash Assets V3
  const handleItemSelect = (item: any, colorId: string = '1') => {
    console.log('🎯 [OfficialHabboEditor V3] Flash Asset V3 selecionado:', { 
      item: item.name, 
      category: item.category, 
      figureId: item.figureId,
      colorId,
      swfName: item.swfName,
      source: item.source
    });
    
    // CORREÇÃO V3: Aplicação melhorada com suporte a 'sk' (skin color)
    const itemString = `${item.figureId}-${colorId}`;
    
    setAvatarState(prevState => {
      const newState = { ...prevState };
      
      // ESPECIAL V3: Categoria 'sk' (skin) altera apenas a cor do 'hd'
      if (item.category === 'sk') {
        if (newState.hd) {
          const hdParts = newState.hd.split('-');
          newState.hd = `${hdParts[0]}-${colorId}`;
        } else {
          newState.hd = `180-${colorId}`;
        }
        console.log('🤏 [OfficialHabboEditor V3] Cor de pele aplicada:', newState.hd);
        
        toast({
          title: "🤏 Cor de pele aplicada!",
          description: `Tom ${colorId} aplicado com sucesso.`,
        });
        
        return newState;
      }
      
      // Aplicar item normal na categoria correta
      newState[item.category as keyof AvatarState] = itemString;
      
      console.log('✅ [OfficialHabboEditor V3] Estado do avatar atualizado:', {
        categoria: item.category,
        novoValor: itemString,
        figuraCompleta: Object.entries(newState)
          .filter(([_, value]) => value)
          .map(([cat, value]) => `${cat}-${value}`)
          .join('.')
      });
      
      return newState;
    });

    setSelectedColor(colorId);
    setSelectedItem(item.figureId);
    
    // Toast melhorado V3 com info de raridade
    const rarityEmoji = {
      'nft': '⭐',
      'ltd': '👑', 
      'hc': '⚡',
      'rare': '💎',
      'common': '📦'
    };
    
    const clubBadge = item.club === 'hc' ? '🟨 HC' : item.rarity !== 'common' ? `${rarityEmoji[item.rarity]} ${item.rarity.toUpperCase()}` : '⭐ FREE';
    
    toast({
      title: "✨ Item aplicado!",
      description: `${item.name} (${clubBadge}) aplicado na categoria ${item.category.toUpperCase()}.`,
    });
  };

  const handleRemoveItem = (category: string) => {
    setAvatarState(prevState => {
      const newState = { ...prevState };
      delete newState[category as keyof AvatarState];
      return newState;
    });
    
    toast({
      title: "🗑️ Item removido",
      description: `Item da categoria ${category.toUpperCase()} removido.`,
    });
  };

  const handleResetAvatar = () => {
    setAvatarState({
      hd: '180-2',
      hr: '828-45', 
      ch: '665-92',
      lg: '700-1',
      sh: '705-1'
    });
    
    toast({
      title: "🔄 Avatar resetado",
      description: "Avatar voltou ao estado padrão.",
    });
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4">
      {/* Enhanced Avatar Preview V3 */}
      <div className="lg:w-80">
        <EnhancedAvatarPreview
          figureString={generateFigureString()}
          selectedGender={selectedGender}
          selectedHotel={selectedHotel}
          avatarState={avatarState}
          onGenderChange={setSelectedGender}
          onHotelChange={setSelectedHotel}
          onRemoveItem={handleRemoveItem}
          onResetAvatar={handleResetAvatar}
        />
      </div>

      {/* SISTEMA V3 COMPLETO - Interface Limpa sem Headers */}
      <div className="flex-1">
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <FlashAssetsV3Complete
              selectedGender={selectedGender === 'U' ? 'M' : selectedGender}
              selectedHotel={selectedHotel}
              onItemSelect={handleItemSelect}
              selectedItem={selectedItem}
              selectedColor={selectedColor}
              className="h-full"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfficialHabboEditor;
