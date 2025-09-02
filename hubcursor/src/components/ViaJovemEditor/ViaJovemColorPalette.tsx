
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Palette } from 'lucide-react';

interface ViaJovemColorPaletteProps {
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
}

// Cores oficiais ViaJovem/Habbo com códigos corretos
const VIAJOVEM_COLORS = [
  // Cores básicas (tons de pele)
  { id: '1', hex: '#FFDBAC', name: 'Pele Clara', group: 'skin' },
  { id: '2', hex: '#F5C2A5', name: 'Pele Média', group: 'skin' },
  { id: '3', hex: '#E8A775', name: 'Pele Morena', group: 'skin' },
  { id: '4', hex: '#D4965A', name: 'Pele Escura', group: 'skin' },
  { id: '5', hex: '#BB7748', name: 'Pele Muito Escura', group: 'skin' },
  
  // Cores básicas
  { id: '7', hex: '#8B4513', name: 'Marrom', group: 'basic' },
  { id: '8', hex: '#000000', name: 'Preto', group: 'basic' },
  { id: '9', hex: '#FFFFFF', name: 'Branco', group: 'basic' },
  { id: '10', hex: '#FF0000', name: 'Vermelho', group: 'basic' },
  { id: '11', hex: '#00FF00', name: 'Verde Limão', group: 'basic' },
  { id: '12', hex: '#0000FF', name: 'Azul', group: 'basic' },
  { id: '13', hex: '#FFFF00', name: 'Amarelo', group: 'basic' },
  { id: '14', hex: '#FF00FF', name: 'Magenta', group: 'basic' },
  { id: '15', hex: '#00FFFF', name: 'Ciano', group: 'basic' },
  
  // Cores ViaJovem especiais
  { id: '45', hex: '#D4965A', name: 'Bronze VJ', group: 'viajovem' },
  { id: '61', hex: '#FFB366', name: 'Laranja VJ', group: 'hc' },
  { id: '92', hex: '#FF6B6B', name: 'Coral VJ', group: 'hc' },
  { id: '100', hex: '#4ECDC4', name: 'Turquesa HC', group: 'hc' },
  { id: '101', hex: '#45B7D1', name: 'Azul Céu HC', group: 'hc' },
  { id: '102', hex: '#96CEB4', name: 'Verde Menta HC', group: 'hc' },
  { id: '104', hex: '#FFEAA7', name: 'Amarelo Suave HC', group: 'hc' },
  { id: '105', hex: '#DDA0DD', name: 'Lilás HC', group: 'hc' },
  { id: '106', hex: '#F8BBD0', name: 'Rosa Suave HC', group: 'hc' },
  { id: '143', hex: '#A8E6CF', name: 'Verde Pastel HC', group: 'hc' }
];

const COLOR_GROUPS = {
  skin: { name: 'Pele', colors: VIAJOVEM_COLORS.filter(c => c.group === 'skin') },
  basic: { name: 'Básicas', colors: VIAJOVEM_COLORS.filter(c => c.group === 'basic') },
  viajovem: { name: 'ViaJovem', colors: VIAJOVEM_COLORS.filter(c => c.group === 'viajovem') },
  hc: { name: 'Habbo Club', colors: VIAJOVEM_COLORS.filter(c => c.group === 'hc') }
};

const ViaJovemColorPalette = ({ selectedColor, onColorSelect }: ViaJovemColorPaletteProps) => {
  const ColorGroup = ({ groupKey, group }: { groupKey: string, group: typeof COLOR_GROUPS.skin }) => {
    if (group.colors.length === 0) return null;
    
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {groupKey === 'hc' && <Crown className="w-4 h-4 text-yellow-600" />}
          <h4 className="text-sm font-medium text-gray-700">{group.name}</h4>
          <Badge variant="outline" className="text-xs">{group.colors.length}</Badge>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {group.colors.map((color) => (
            <Button
              key={color.id}
              variant="outline"
              size="sm"
              className={`w-8 h-8 p-0 border-2 transition-all duration-200 ${
                selectedColor === color.id 
                  ? 'border-yellow-500 ring-2 ring-yellow-300 scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.hex }}
              onClick={() => onColorSelect(color.id)}
              title={`${color.name} (ID: ${color.id})`}
            />
          ))}
        </div>
      </div>
    );
  };

  const selectedColorInfo = VIAJOVEM_COLORS.find(c => c.id === selectedColor);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="w-5 h-5" />
          Cores ViaJovem
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {Object.entries(COLOR_GROUPS).map(([groupKey, group]) => (
          <ColorGroup key={groupKey} groupKey={groupKey} group={group} />
        ))}
        
        {/* Cor selecionada info */}
        <div className="text-center pt-2 border-t">
          <p className="text-xs text-gray-600">
            Cor: <span className="font-semibold">
              {selectedColorInfo?.name || `ID ${selectedColor}`}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViaJovemColorPalette;
