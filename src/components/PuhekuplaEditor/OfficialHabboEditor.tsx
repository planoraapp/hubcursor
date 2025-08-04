
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
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
  // Estado V3 melhorado
  const [avatarState, setAvatarState] = useState<AvatarState>({
    hd: '180-1',
    hr: '1001-45',
    ch: '1001-61',
    lg: '280-82',
    sh: '300-80'
  });
  
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [selectedColor, setSelectedColor] = useState('1');
  const [selectedItem, setSelectedItem] = useState('');

  const { toast } = useToast();

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
      title: "✨ Flash Asset V3 aplicado!",
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
      hd: '180-1',
      hr: '1001-45', 
      ch: '1001-61',
      lg: '280-82',
      sh: '300-80'
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

      {/* SISTEMA V3 COMPLETO - Flash Assets V3 Complete */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-t-lg py-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Flash Assets System V3 - OFICIAL HABBO EDITOR
              <Badge className="ml-auto bg-white/20 text-white text-xs">
                2871+ Assets • Cor de Pele • 3 Paletas • 98%+ Precisão
              </Badge>
            </CardTitle>
          </CardHeader>
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
