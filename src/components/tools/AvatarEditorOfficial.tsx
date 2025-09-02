import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  RotateCcw, 
  RotateCw, 
  Search,
  Palette,
  Shirt,
  User,
  Filter,
  Smile,
  Crown,
  ShirtIcon,
  Glasses,
  Watch,
  Circle,
  Zap,
  Star,
  // NOVOS ÍCONES:
  Maximize2,
  Minimize2,
  Eye,
  Activity,
  Coffee,
  Hand,
  ChevronDown,
  ChevronUp,
  Monitor,
  Smartphone,
  Tablet,
  Headphones,
  Frown,
  Meh,
  Angry,
  Sunrise,
  Moon,
  MessageCircle,
  Carrot,
  Wine,
  Droplets,
  IceCream,
  Heart,
  Radio,
  Cherry,
  Apple
} from 'lucide-react';
import { useTemplariosData } from '@/hooks/useTemplariosData';

// Interfaces para o editor HabboTemplarios
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

// Categorias completas baseadas no HabboTemplarios
const CATEGORIES = [
  {
    id: 'hd',
    name: 'Rostos',
    icon: '/assets/Rosto1.png',
    subcategories: []
  },
  {
    id: 'hr',
    name: 'Cabelos',
    icon: '/assets/Cabelo1.png',
    subcategories: []
  },
  {
    id: 'ch',
    name: 'Camisas',
    icon: '/assets/Camiseta1.png',
    subcategories: []
  },
  {
    id: 'lg',
    name: 'Calças',
    icon: '/assets/Calca1.png',
    subcategories: []
  },
  {
    id: 'sh',
    name: 'Sapatos',
    icon: '/assets/Estampa1.png', // Usando Estampa1 como placeholder para sapatos
    subcategories: []
  },
  {
    id: 'ha',
    name: 'Chapéus',
    icon: '/assets/Bone1.png',
    subcategories: []
  },
  {
    id: 'he',
    name: 'Acessórios de Cabeça',
    icon: '/assets/Acessorios1.png',
    subcategories: []
  },
  {
    id: 'ea',
    name: 'Brincos',
    icon: '/assets/Acessorios1.png', // Reutilizando Acessorios1 para brincos
    subcategories: []
  },
  {
    id: 'fa',
    name: 'Acessórios de Rosto',
    icon: '/assets/Oculos1.png',
    subcategories: []
  },
  {
    id: 'cp',
    name: 'Capas',
    icon: '/assets/Casaco1.png',
    subcategories: []
  },
  {
    id: 'cc',
    name: 'Colares',
    icon: '/assets/Colar1.png',
    subcategories: []
  },
  {
    id: 'ca',
    name: 'Cintos',
    icon: '/assets/Cinto1.png',
    subcategories: []
  },
  {
    id: 'wa',
    name: 'Pulseiras',
    icon: '/assets/Acessorios1.png', // Reutilizando Acessorios1 para pulseiras
    subcategories: []
  }
];

const AvatarEditorOfficial = () => {
  // Hook para dados do HabboTemplarios
  const { getItemsByCategory, getPaletteForCategory } = useTemplariosData();
  
  // Estado do avatar
  const [currentFigure, setCurrentFigure] = useState<AvatarFigure>({
    hr: '100-7-',
    hd: '190-7-',
    ch: '210-66-',
    lg: '270-82-',
    sh: '290-80-',
    ha: '100-7-',
    he: '100-7-',
    ea: '100-7-',
    fa: '100-7-',
    cp: '100-7-',
    cc: '100-7-',
    ca: '100-7-',
    wa: '100-7-',
    gesture: 'nrm',
    actions: [],
    item: '0',
    direction: 2,
    headDirection: 2,
    gender: 'M',
    size: 'l'
  });

  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [searchTerm, setSearchTerm] = useState('');
  const [showClubOnly, setShowClubOnly] = useState(false);
  const [showColorableOnly, setShowColorableOnly] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('7');
  const [secondaryColor, setSecondaryColor] = useState<string>('7');

  // Estado para seções expandidas
  const [expandedSections, setExpandedSections] = useState({
    size: false,
    expressions: false,
    actions: false,
    drinks: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Funções de rotação
  const rotateLeft = () => {
    setCurrentFigure(prev => ({
      ...prev,
      direction: prev.direction === 0 ? 7 : prev.direction - 1,
      headDirection: prev.headDirection === 0 ? 7 : prev.headDirection - 1
    }));
  };

  const rotateRight = () => {
    setCurrentFigure(prev => ({
      ...prev,
      direction: prev.direction === 7 ? 0 : prev.direction + 1,
      headDirection: prev.headDirection === 7 ? 0 : prev.headDirection + 1
    }));
  };

  // Gerar URL do avatar - Formato exato do HabboTemplarios
  const generateAvatarUrl = (colorHex?: string) => {
    // Corpo base por gênero
    const baseFigure = selectedGender === 'M'
      ? 'hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-'
      : 'hr-500-7-.hd-190-7-.ch-710-66-.lg-870-82-.sh-290-80-';

    // Começa com as partes base e remove vazios
    const figureParts = baseFigure.split('.').filter(Boolean);

    // Todas as categorias conhecidas do Habbo
    const ALL_KEYS: Array<keyof AvatarFigure> = ['hr','hd','ch','lg','sh','ha','he','ea','fa','cp','cc','ca','wa'];

    for (const key of ALL_KEYS) {
      const value = currentFigure[key];
      if (!value || typeof value !== 'string') continue;

      // Para overlays, evite inserir o "100-*" (placeholder)
      const isOverlay = !['hr','hd','ch','lg','sh'].includes(key);
      if (isOverlay && value.startsWith('100-')) continue;

      const segment = `${key}-${value}`;
      const idx = figureParts.findIndex(p => p.startsWith(`${key}-`));

      if (idx !== -1) figureParts[idx] = segment;
      else figureParts.push(segment);
    }

    const figureString = figureParts.join('.');

    // Monta URL do preview (reutilize sua lógica de gesture/actions/item se já existir)
    const url = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${selectedGender}&direction=${currentFigure.direction}&head_direction=${currentFigure.headDirection}&action=gesture=${currentFigure.gesture}&&size=l`;

    return url;
  };

  // Aplicar item ao avatar
  const applyItem = (itemId: string, colorId?: string) => {
    const color = colorId || '7'; // Usar cor padrão 7
    console.log('Applying item:', { itemId, color, selectedCategory });
    
    setSelectedItemId(itemId);
    setPrimaryColor(color);
    
    setCurrentFigure(prev => {
      const newFigure = {
        ...prev,
        [selectedCategory]: `${itemId}-${color}-`
      };
      console.log('New figure state:', newFigure);
      return newFigure;
    });
  };

  // Aplicar cor primária
  const applyPrimaryColor = (colorId: string) => {
    if (selectedItemId) {
      setPrimaryColor(colorId);
      setCurrentFigure(prev => ({
        ...prev,
        [selectedCategory]: `${selectedItemId}-${colorId}-${secondaryColor}-`
      }));
    }
  };

  // Aplicar cor secundária (para itens duotone)
  const applySecondaryColor = (colorId: string) => {
    if (selectedItemId) {
      setSecondaryColor(colorId);
      // Remover o prefixo 's' do ID da cor secundária para usar o ID real
      const realColorId = colorId.startsWith('s') ? colorId.substring(1) : colorId;
    setCurrentFigure(prev => ({
      ...prev,
        [selectedCategory]: `${selectedItemId}-${primaryColor}-${realColorId}-`
      }));
    }
  };

  // Verificar se o item selecionado suporta duotone
  const isDuotoneItem = () => {
    if (!selectedItemId) return false;
    const items = getItemsByCategory(selectedCategory, selectedGender);
    const itemData = items[selectedItemId];
    return itemData?.duotone === 1;
  };

  // Obter itens filtrados
  const getFilteredItems = () => {
    const items = getItemsByCategory(selectedCategory, selectedGender);
    console.log('Items for category:', selectedCategory, 'Gender:', selectedGender, 'Total items:', Object.keys(items).length);
    
    // Debug: contar itens por gênero
    const itemsByGender = Object.values(items).reduce((acc, item) => {
      acc[item.gender] = (acc[item.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('Items by gender:', itemsByGender);
    
    const filtered = Object.entries(items).filter(([itemId, itemData]) => {
      if (searchTerm && !itemId.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (showClubOnly && itemData.club !== 1) {
        return false;
      }
      if (showColorableOnly && itemData.colorable !== 1) {
        return false;
      }
      return true;
    });
    
    console.log('Filtered items:', filtered.length);
    return filtered;
  };

  // Gerar URL do item - Preview focado na região específica
  const getItemPreviewUrl = (itemId: string, colorHex?: string) => {
    const primaryColor = colorHex || '7';
    
    // Para cabelos (hr), usar figura completa com corpo feminino para garantir preview correto
    if (selectedCategory === 'hr') {
      // Usar figura completa com corpo feminino para cabelos
      // Baseado no exemplo do HabboTemplarios: hr-3870-33-61.hd-600-1-.ch-635-70-.lg-716-66-62-.sh-735-68-
      let baseFigure = selectedGender === 'M' 
        ? 'hr-100-undefined-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-'
        : 'hr-500-undefined-.hd-190-7-.ch-710-66-.lg-870-82-.sh-290-80-'; // Corpo feminino com tom de pele masculino
      
      // Substituir apenas o cabelo
      const figureParts = baseFigure.split('.');
      const categoryIndex = figureParts.findIndex(part => part.startsWith('hr-'));
      
      if (categoryIndex !== -1) {
        figureParts[categoryIndex] = `hr-${itemId}-${primaryColor}-`;
      }
      baseFigure = figureParts.join('.');
      
      // Debug: Log para verificar se a substituição está funcionando
      console.log('Hair Preview URL Debug:', {
        itemId,
        selectedGender,
        primaryColor,
        finalFigureString: baseFigure
      });
      
      return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${baseFigure}&gender=${selectedGender}&direction=2&head_direction=2&action=gesture=std&&size=m`;
    }
    
    // Para outras categorias, usar figura completa
    let baseFigure = selectedGender === 'M' 
      ? 'hr-100-undefined-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-'
      : 'hr-500-undefined-.hd-190-7-.ch-710-66-.lg-870-82-.sh-290-80-'; // Usando hd-190-7- (tom masculino)
    
    // Para todas as outras categorias, usar a lógica padrão de substituição
    const figureParts = baseFigure.split('.');
    const categoryIndex = figureParts.findIndex(part => part.startsWith(selectedCategory + '-'));
    
    if (categoryIndex !== -1) {
      figureParts[categoryIndex] = `${selectedCategory}-${itemId}-${primaryColor}-`;
    } else {
      figureParts.push(`${selectedCategory}-${itemId}-${primaryColor}-`);
    }
    baseFigure = figureParts.join('.');
    
    // Debug: Log para verificar se a substituição está funcionando
    console.log('Item Preview URL Debug:', {
      itemId,
      selectedCategory,
      selectedGender,
      primaryColor,
      finalFigureString: baseFigure
    });
    
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${baseFigure}&gender=${selectedGender}&direction=2&head_direction=2&action=gesture=std&&size=m`;
  };

  // Sistema de cores do Habbo baseado no HTML do HabboTemplarios
  // Separando cores primárias e secundárias para evitar duplicatas
  const PRIMARY_COLORS = [
    // Cores Normais (id="nonhc")
    { color: '#F5DA88', isHC: false, id: '1' },
    { color: '#FFDBC1', isHC: false, id: '2' },
    { color: '#FFCB98', isHC: false, id: '3' },
    { color: '#F4AC54', isHC: false, id: '4' },
    { color: '#FF987F', isHC: false, id: '5' },
    { color: '#e0a9a9', isHC: false, id: '6' },
    { color: '#ca8154', isHC: false, id: '7' },
    { color: '#B87560', isHC: false, id: '8' },
    { color: '#9C543F', isHC: false, id: '9' },
    { color: '#904925', isHC: false, id: '10' },
    { color: '#4C311E', isHC: false, id: '11' },
    
    // Cores do Clube (id="hc" com classe colorClub)
    { color: '#543d35', isHC: true, id: '12' },
    { color: '#653a1d', isHC: true, id: '13' },
    { color: '#6E392C', isHC: true, id: '14' },
    { color: '#714947', isHC: true, id: '15' },
    { color: '#856860', isHC: true, id: '16' },
    { color: '#895048', isHC: true, id: '17' },
    { color: '#a15253', isHC: true, id: '18' },
    { color: '#aa7870', isHC: true, id: '19' },
    { color: '#be8263', isHC: true, id: '20' },
    { color: '#b6856d', isHC: true, id: '21' },
    { color: '#ba8a82', isHC: true, id: '22' },
    { color: '#c88f82', isHC: true, id: '23' },
    { color: '#d9a792', isHC: true, id: '24' },
    { color: '#c68383', isHC: true, id: '25' },
    { color: '#BC576A', isHC: true, id: '26' },
    { color: '#FF5757', isHC: true, id: '27' },
    { color: '#FF7575', isHC: true, id: '28' },
    { color: '#B65E38', isHC: true, id: '29' },
    { color: '#a76644', isHC: true, id: '30' },
    { color: '#7c5133', isHC: true, id: '31' },
    { color: '#9a7257', isHC: true, id: '32' },
    { color: '#945C2F', isHC: true, id: '33' },
    { color: '#d98c63', isHC: true, id: '34' },
    { color: '#AE7748', isHC: true, id: '35' },
    { color: '#c57040', isHC: true, id: '36' },
    { color: '#B88655', isHC: true, id: '37' },
    { color: '#C99263', isHC: true, id: '38' },
    { color: '#A89473', isHC: true, id: '39' },
    { color: '#C89F56', isHC: true, id: '40' },
    { color: '#DC9B4C', isHC: true, id: '41' },
    { color: '#FF8C40', isHC: true, id: '42' },
    { color: '#de9d75', isHC: true, id: '43' },
    { color: '#eca782', isHC: true, id: '44' },
    { color: '#FFB696', isHC: true, id: '45' },
    { color: '#E3AE7D', isHC: true, id: '46' },
    { color: '#FFC680', isHC: true, id: '47' },
    { color: '#DFC375', isHC: true, id: '48' },
    { color: '#F0DCA3', isHC: true, id: '49' },
    { color: '#EAEFD0', isHC: true, id: '50' },
    { color: '#E2E4B0', isHC: true, id: '51' },
    { color: '#D5D08C', isHC: true, id: '52' },
    { color: '#BDE05F', isHC: true, id: '53' },
    { color: '#5DC446', isHC: true, id: '54' },
    { color: '#A2CC89', isHC: true, id: '55' },
    { color: '#C2C4A7', isHC: true, id: '56' },
    { color: '#F1E5DA', isHC: true, id: '57' },
    { color: '#f6d3d4', isHC: true, id: '58' },
    { color: '#e5b6b0', isHC: true, id: '59' },
    { color: '#C4A7B3', isHC: true, id: '60' },
    { color: '#AC94B3', isHC: true, id: '61' },
    { color: '#D288CE', isHC: true, id: '62' },
    { color: '#6799CC', isHC: true, id: '63' },
    { color: '#B3BDC3', isHC: true, id: '64' },
    { color: '#C5C0C2', isHC: true, id: '65' }
  ];

  // Cores secundárias (mesmas cores, mas com IDs diferentes para duotone)
  const SECONDARY_COLORS = PRIMARY_COLORS.map((colorData, index) => ({
    ...colorData,
    id: `s${colorData.id}` // Prefixo 's' para cores secundárias
  }));

  // Obter hex da cor por ID
  const getColorHex = (colorId: string) => {
    const palette = getPaletteForCategory(selectedCategory);
    return palette?.[colorId]?.hex || 'FFCB98';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="volter-font text-4xl font-bold text-[#8B4513] mb-2">
          🎨 Editor de Avatar HabboTemplarios
        </h1>
        <p className="text-lg text-gray-600">
          Crie e personalize seu avatar do Habbo com milhares de roupas disponíveis!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview do Avatar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Preview do Avatar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview do Avatar - Tamanho Grande */}
              <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                <img
                  key={`avatar-${JSON.stringify(currentFigure)}`}
                  src={generateAvatarUrl()}
                  alt="Avatar Preview"
                  className={`object-contain transition-all duration-300 ${
                    currentFigure.size === 'headonly' ? 'w-24 h-24' :
                    currentFigure.size === 's' ? 'w-32 h-32' :
                    currentFigure.size === 'm' ? 'w-40 h-40' :
                    'w-48 h-48'
                  }`}
                  onLoad={() => console.log('Avatar image loaded')}
                  onError={(e) => console.error('Avatar image error:', e)}
                />
              </div>
              
              <div className="space-y-2">
                {/* Controles de Rotação */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={rotateLeft}
                    className="p-1 hover:opacity-80 transition-opacity"
                    title="Rotacionar para esquerda"
                  >
                    <img 
                      src="/assets/rotation_arrow.png" 
                      alt="Rotacionar esquerda" 
                      className="w-6 h-6"
                    />
                  </button>
                  
                  <button
                    onClick={rotateRight}
                    className="p-1 hover:opacity-80 transition-opacity"
                    title="Rotacionar para direita"
                  >
                    <img 
                      src="/assets/rotation_arrow.png" 
                      alt="Rotacionar direita" 
                      className="w-6 h-6 scale-x-[-1]"
                    />
                  </button>
                </div>

                {/* Controles de Tamanho */}
                <div className="space-y-2">
                  <button
                    onClick={() => toggleSection('size')}
                    className="w-full flex items-center justify-between p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Tamanho do Avatar</span>
                    </div>
                    {expandedSections.size ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                  
                  {expandedSections.size && (
                    <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => setCurrentFigure(prev => ({ ...prev, size: 'headonly' }))}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                          currentFigure.size === 'headonly' ? 'bg-blue-200 border-2 border-blue-400' : 'bg-white hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span className="text-2xl">👤</span>
                        <span className="text-xs mt-1 font-medium">Cabeza</span>
                      </button>
                      
                      <button
                        onClick={() => setCurrentFigure(prev => ({ ...prev, size: 's' }))}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                          currentFigure.size === 's' ? 'bg-blue-200 border-2 border-blue-400' : 'bg-white hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span className="text-lg">🧑</span>
                        <span className="text-xs mt-1 font-medium">Mini</span>
                      </button>
                      
                      <button
                        onClick={() => setCurrentFigure(prev => ({ ...prev, size: 'm' }))}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                          currentFigure.size === 'm' ? 'bg-blue-200 border-2 border-blue-400' : 'bg-white hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span className="text-xl">🧑‍💼</span>
                        <span className="text-xs mt-1 font-medium">Normal</span>
                      </button>
                      
                      <button
                        onClick={() => setCurrentFigure(prev => ({ ...prev, size: 'l' }))}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                          currentFigure.size === 'l' ? 'bg-blue-200 border-2 border-blue-400' : 'bg-white hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span className="text-2xl">🧑‍💻</span>
                        <span className="text-xs mt-1 font-medium">Grande</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>



              

              <Button 
                className="w-full"
                onClick={() => {
                  const url = generateAvatarUrl();
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'figure.png';
                  link.target = '_blank';
                  link.click();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Avatar
              </Button>

              <div className="space-y-2">
                <Label htmlFor="username">Buscar Usuário</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    placeholder="Nome do usuário"
                    className="flex-1"
                  />
                  <Button size="sm" variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expressões</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'nrm', name: 'Normal' },
                    { id: 'sml', name: 'Feliz' },
                    { id: 'sad', name: 'Triste' },
                    { id: 'agr', name: 'Enojado' },
                    { id: 'srp', name: 'Surpreso' },
                    { id: 'eyb', name: 'Dormindo' },
                    { id: 'spk', name: 'Falando' }
                  ].map((expression) => (
                    <Button 
                      key={expression.id}
                      size="sm" 
                      variant={currentFigure.gesture === expression.id ? "default" : "outline"}
                      onClick={() => setCurrentFigure(prev => ({ ...prev, gesture: expression.id }))}
                    >
                      {expression.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ações</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '', name: 'Nada' },
                    { id: 'wlk', name: 'Caminhando' },
                    { id: 'lay', name: 'Deitado' },
                    { id: 'sit', name: 'Sentado' },
                    { id: 'wav', name: 'Acenando' },
                    { id: 'crr', name: 'Segurando' },
                    { id: 'drk', name: 'Bebendo' }
                  ].map((action) => (
                    <Button 
                      key={action.id}
                      size="sm" 
                      variant={currentFigure.actions.includes(action.id) ? "default" : "outline"}
                      onClick={() => setCurrentFigure(prev => ({ 
                        ...prev, 
                        actions: action.id === '' ? [] : [action.id]
                      }))}
                    >
                      {action.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bebidas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '0', name: 'Nada' },
                    { id: '2', name: 'Cenoura' },
                    { id: '6', name: 'Café' },
                    { id: '667', name: 'Coquetel' },
                    { id: '5', name: 'Habbo Cola' },
                    { id: '3', name: 'Sorvete' },
                    { id: '42', name: 'Chá Japonês' },
                    { id: '9', name: 'Poção do Amor' },
                    { id: '44', name: 'Radioativo' },
                    { id: '43', name: 'Tomate' },
                    { id: '1', name: 'Água' },
                    { id: '33', name: 'Calippo' }
                  ].map((drink) => (
                    <Button 
                      key={drink.id}
                      size="sm" 
                      variant={currentFigure.item === drink.id ? "default" : "outline"}
                      onClick={() => setCurrentFigure(prev => ({ ...prev, item: drink.id }))}
                    >
                      {drink.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor de Itens */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Grid de Itens */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Editor de Itens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Categorias - Apenas ícones */}
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="w-12 h-12 p-0 flex items-center justify-center bg-transparent hover:bg-gray-100"
                        title={category.name}
                      >
                        <img
                          src={category.icon}
                          alt={category.name}
                          className="w-8 h-8 object-contain"
                          style={{ 
                            imageRendering: 'pixelated',
                            filter: 'none'
                          }}
                          onError={(e) => {
                            // Fallback para ícone do Lucide se a imagem não carregar
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallbackIcon = target.parentElement?.querySelector('.fallback-icon');
                            if (fallbackIcon) {
                              (fallbackIcon as HTMLElement).style.display = 'block';
                            }
                          }}
                        />
                        <div className="fallback-icon hidden">
                          <User className="w-5 h-5" />
                        </div>
                      </Button>
                    ))}
                  </div>

                  {/* Filtros */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Gênero:</span>
                      <div className="flex bg-gray-200 rounded-lg p-1">
                        <Button
                          size="sm"
                          variant={selectedGender === 'M' ? "default" : "ghost"}
                          onClick={() => setSelectedGender('M')}
                          className="volter-font text-xs"
                        >
                          <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mr-1">
                            <span className="text-xs text-white font-bold">♂</span>
                          </span>
                          Masculino
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedGender === 'F' ? "default" : "ghost"}
                          onClick={() => setSelectedGender('F')}
                          className="volter-font text-xs"
                        >
                          <span className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center mr-1">
                            <span className="text-xs text-white font-bold">♀</span>
                          </span>
                          Feminino
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {CATEGORIES.find(c => c.id === selectedCategory)?.name} - {getFilteredItems().length} itens ({selectedGender === 'M' ? 'Masculino' : 'Feminino'})
                  </div>

                  <Separator />

                  {/* Grid de itens - Preview centralizado e otimizado para cada categoria */}
                  <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto">
                    {getFilteredItems().map(([itemId, itemData]) => {
                      // Sistema de centralização otimizado para cada categoria
                      const getOptimizedPosition = () => {
                        switch (selectedCategory) {
                          case 'hd': // Rostos - Foco centralizado no rosto
                            return 'center 55%';
                          case 'hr': // Cabelos - Foco no rosto e cabelo
                            return 'center 50%';
                          case 'ha': // Chapéus - Foco no topo da cabeça
                            return 'center 45%';
                          case 'he': // Acessórios de Cabeça - Foco no rosto
                            return 'center 55%';
                          case 'ea': // Brincos - Foco no rosto
                            return 'center 60%';
                          case 'fa': // Acessórios de Rosto - Foco no rosto
                            return 'center 60%';
                          case 'cc': // Colares - Foco no pescoço/torso superior
                            return 'center 40%';
                          case 'ch': // Camisas - Foco centralizado no torso
                            return 'center 30%';
                          case 'cp': // Capas - Foco no torso e ombros
                            return 'center 25%';
                          case 'ca': // Cintos - Foco na cintura
                            return 'center 50%';
                          case 'lg': // Calças - Foco centralizado nas pernas
                            return 'center 70%';
                          case 'sh': // Sapatos - Foco nos pés
                            return 'center 85%';
                          case 'wa': // Pulseiras - Foco nos braços
                            return 'center 40%';
                          default:
                            return 'center center';
                        }
                      };

                      // Determinar o tamanho e ajuste da imagem baseado na categoria
                      const getImageStyle = () => {
                        const baseStyle = {
                          objectPosition: getOptimizedPosition(),
                          objectFit: 'cover' as const
                        };

                        // Ajustes específicos por categoria para melhor visualização
                        switch (selectedCategory) {
                          case 'hd': // Rostos - Zoom no rosto
                            return { ...baseStyle, transform: 'scale(1.2)' };
                          case 'hr': // Cabelos - Zoom moderado
                            return { ...baseStyle, transform: 'scale(1.1)' };
                          case 'ha': // Chapéus - Zoom no topo
                            return { ...baseStyle, transform: 'scale(1.1)' };
                          case 'sh': // Sapatos - Zoom nos pés
                            return { ...baseStyle, transform: 'scale(1.3)' };
                          case 'lg': // Calças - Zoom nas pernas
                            return { ...baseStyle, transform: 'scale(1.1)' };
                          default:
                            return baseStyle;
                        }
                      };

                      return (
                        <div key={itemId} className="relative group">
                          <div className="w-full h-20 cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 rounded bg-gray-50 overflow-hidden">
                            <img
                              src={getItemPreviewUrl(itemId)}
                              alt={`${selectedCategory} ${itemId}`}
                              className="w-full h-full"
                              style={getImageStyle()}
                          onClick={() => applyItem(itemId)}
                              title={`${itemId} - ${itemData.club === 1 ? 'Habbo Club' : 'Normal'}${itemData.colorable === 1 ? ' - Colorável' : ''}`}
                            />
                          </div>
                        
                        {/* Badge de raridade único - Prioridade: HC > Duotone > Colorável > Vendável */}
                        <div className="absolute bottom-1 right-1 z-10">
                          {itemData.club === 1 ? (
                            <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">HC</span>
                            </div>
                          ) : itemData.duotone === 1 ? (
                            <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">2</span>
                            </div>
                          ) : itemData.colorable === 1 ? (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">🎨</span>
                            </div>
                          ) : itemData.sellable && itemData.sellable === 1 ? (
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">$</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      );
                    })}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Mostrando {getFilteredItems().length} itens
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Painel de Cores */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Cores do Habbo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status do item selecionado */}
                  {selectedItemId && (
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">
                        Item: {selectedItemId}
                      </div>
                      {isDuotoneItem() && (
                        <div className="text-xs text-blue-600 mt-1">
                          ✨ Suporta duas cores (Duotone)
                        </div>
                      )}
                    </div>
                  )}

                  {/* Grid de Cores Primárias - Single Tone */}
                  <div className="p-1">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Cor Primária</h4>
                    <div className="bg-gray-100 rounded-md p-1">
                      <div className="flex flex-wrap gap-1">
                        {/* Cores Normais */}
                        <div className="flex flex-wrap gap-1">
                          {PRIMARY_COLORS.filter(c => !c.isHC).map((colorData, index) => {
                            const isSelected = primaryColor === colorData.id;
                            return (
                              <button
                                key={`primary-normal-${index}`}
                                onClick={() => {
                                  if (isDuotoneItem()) {
                                    applyPrimaryColor(colorData.id);
                                  } else {
                                    const currentItemValue = currentFigure[selectedCategory as keyof AvatarFigure];
                                    const currentItem = typeof currentItemValue === 'string' ? currentItemValue.split('-')[0] : '100';
                                    if (currentItem) {
                                      applyItem(currentItem, colorData.id);
                                    }
                                  }
                                }}
                                className={`w-4 h-4 border border-gray-300 hover:scale-110 transition-transform ${
                                  isSelected ? 'ring-2 ring-blue-500' : ''
                                }`}
                                style={{ backgroundColor: colorData.color }}
                                title={`Normal - ${colorData.color}`}
                              />
                            );
                          })}
                        </div>
                        
                        {/* Cores do Clube */}
                        <div className="flex flex-wrap gap-1">
                          {PRIMARY_COLORS.filter(c => c.isHC).map((colorData, index) => {
                            const isSelected = primaryColor === colorData.id;
                            return (
                              <div key={`primary-hc-${index}`} className="relative">
                                <button
                        onClick={() => {
                                    if (isDuotoneItem()) {
                                      applyPrimaryColor(colorData.id);
                                    } else {
                          const currentItemValue = currentFigure[selectedCategory as keyof AvatarFigure];
                          const currentItem = typeof currentItemValue === 'string' ? currentItemValue.split('-')[0] : '100';
                          if (currentItem) {
                                        applyItem(currentItem, colorData.id);
                                      }
                                    }
                                  }}
                                  className={`w-4 h-4 border border-gray-300 hover:scale-110 transition-transform ${
                                    isSelected ? 'ring-2 ring-blue-500' : ''
                                  }`}
                                  style={{ backgroundColor: colorData.color }}
                                  title={`HC - ${colorData.color}`}
                                />
                                {/* Badge HC pequeno */}
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold" style={{ fontSize: '6px' }}>HC</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid de Cores Secundárias - Duo Tone (apenas para itens duotone) */}
                  {isDuotoneItem() && (
                    <div className="p-1">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Cor Secundária</h4>
                      <div className="bg-gray-100 rounded-md p-1">
                        <div className="flex flex-wrap gap-1">
                          {/* Cores Normais */}
                          <div className="flex flex-wrap gap-1">
                            {SECONDARY_COLORS.filter(c => !c.isHC).map((colorData, index) => {
                              const isSelected = secondaryColor === colorData.id;
                              return (
                                <button
                                  key={`secondary-normal-${index}`}
                                  onClick={() => {
                                    if (isDuotoneItem()) {
                                      applySecondaryColor(colorData.id);
                                    } else {
                                      const currentItemValue = currentFigure[selectedCategory as keyof AvatarFigure];
                                      const currentItem = typeof currentItemValue === 'string' ? currentItemValue.split('-')[0] : '100';
                                      if (currentItem) {
                                        applyItem(currentItem, colorData.id);
                                      }
                                    }
                                  }}
                                  className={`w-4 h-4 border border-gray-300 hover:scale-110 transition-transform ${
                                    isSelected ? 'ring-2 ring-blue-500' : ''
                                  }`}
                                  style={{ backgroundColor: colorData.color }}
                                  title={`Normal - ${colorData.color}`}
                                />
                              );
                            })}
                          </div>
                          
                          {/* Cores do Clube */}
                          <div className="flex flex-wrap gap-1">
                            {SECONDARY_COLORS.filter(c => c.isHC).map((colorData, index) => {
                              const isSelected = secondaryColor === colorData.id;
                              return (
                                <div key={`secondary-hc-${index}`} className="relative">
                                  <button
                        onClick={() => {
                                      if (isDuotoneItem()) {
                                        applySecondaryColor(colorData.id);
                                      } else {
                          const currentItemValue = currentFigure[selectedCategory as keyof AvatarFigure];
                          const currentItem = typeof currentItemValue === 'string' ? currentItemValue.split('-')[0] : '100';
                          if (currentItem) {
                                          applyItem(currentItem, colorData.id);
                                        }
                                      }
                                    }}
                                    className={`w-4 h-4 border border-gray-300 hover:scale-110 transition-transform ${
                                      isSelected ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                    style={{ backgroundColor: colorData.color }}
                                    title={`HC - ${colorData.color}`}
                                  />
                                  {/* Badge HC pequeno */}
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold" style={{ fontSize: '6px' }}>HC</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                  </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditorOfficial;
