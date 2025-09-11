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
import { useUnifiedHabboClothing } from '@/hooks/useUnifiedHabboClothing';

// Componente para imagem com fallback
const ClothingImageWithFallback = ({ itemId, category, gender, color, alt }: {
  itemId: string;
  category: string;
  gender: string;
  color: string;
  alt: string;
}) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const generateFallbackUrls = (itemId: string, category: string, gender: string, color: string) => {
    // Avatar base para cabelos
    let baseFigure = '';
    if (category === 'hr') {
      if (gender === 'F') {
        baseFigure = 'hd-600-1-.ch-710-66-.lg-870-82-.sh-290-80-';
      } else {
        baseFigure = 'hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-';
      }
      baseFigure = `${baseFigure}.${category}-${itemId}-${color}`;
    } else {
      baseFigure = gender === 'M' 
        ? `hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-.${category}-${itemId}-${color}`
        : `hr-500-7-.hd-600-1-.ch-710-66-.lg-870-82-.sh-290-80-.${category}-${itemId}-${color}`;
    }

    const cleanFigure = baseFigure.replace(/\.$/, '');
    
    return [
      // URL principal
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${gender}&direction=2&head_direction=2&action=gesture=std&size=m`,
      // Fallback sem action
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${gender}&direction=2&head_direction=2&size=m`,
      // Fallback com hotel brasileiro
      `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${gender}&direction=2&head_direction=2&size=m`,
      // Fallback com headonly para cabelos
      category === 'hr' ? `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${gender}&direction=2&head_direction=2&headonly=1&size=m` : null,
      // Fallback com formato diferente
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${gender}&size=m`
    ].filter(Boolean);
  };

  const urls = generateFallbackUrls(itemId, category, gender, color);
  const currentUrl = urls[currentUrlIndex];

  const handleError = () => {
    if (currentUrlIndex < urls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1);
    } else {
      setImageError(true);
    }
  };

  if (imageError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-xs">
        Erro ao carregar
      </div>
    );
  }

  return (
    <img
      src={currentUrl}
      alt={alt}
      className="w-full h-full"
      style={{ 
        objectPosition: 'center 50%', 
        objectFit: 'cover',
        transform: 'scale(1.1)'
      }}
      onError={handleError}
    />
  );
};
import { useHabboPublicAPI } from '@/hooks/useHabboPublicAPI';

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
  // Hook para dados do HabboTemplarios (fallback)
  const { getItemsByCategory, getPaletteForCategory } = useTemplariosData();
  
  // Hook para dados oficiais unificados do Habbo
  const { data: unifiedClothingData, colorPalettes, isLoading: isLoadingClothing, error: clothingError } = useUnifiedHabboClothing();
  
  // Debug: Log dos dados unificados
  console.log('Unified Clothing Data:', {
    hasData: !!unifiedClothingData,
    categories: unifiedClothingData ? Object.keys(unifiedClothingData) : [],
    isLoading: isLoadingClothing,
    error: clothingError
  });
  
  // Estado do avatar - CORRIGIDO para gênero masculino inicial
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
  
  // Função para trocar gênero e sincronizar com o avatar
  const handleGenderChange = (newGender: 'M' | 'F') => {
    setSelectedGender(newGender);
    
    // Atualizar o gênero do avatar atual com corpo correto
    setCurrentFigure(prev => {
      const newFigure = { ...prev, gender: newGender };
      
      // Atualizar partes do corpo base para o gênero correto
      if (newGender === 'F') {
        // Corpo feminino: cabelo, rosto, camisa, calça femininos
        newFigure.hr = '500-7-';  // Cabelo feminino
        newFigure.hd = '600-1-';  // Rosto feminino - CORRIGIDO
        newFigure.ch = '710-66-'; // Camisa feminina
        newFigure.lg = '870-82-'; // Calça feminina
      } else {
        // Corpo masculino: cabelo, rosto, camisa, calça masculinos
        newFigure.hr = '100-7-';  // Cabelo masculino
        newFigure.hd = '190-7-';  // Rosto masculino
        newFigure.ch = '210-66-'; // Camisa masculina
        newFigure.lg = '270-82-'; // Calça masculina
      }
      
      return newFigure;
    });
    
    // Se há um item selecionado, reaplicar com o novo gênero
    if (selectedItemId) {
      applyItem(selectedItemId, primaryColor);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [showClubOnly, setShowClubOnly] = useState(false);
  const [showColorableOnly, setShowColorableOnly] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('7');
  const [secondaryColor, setSecondaryColor] = useState<string>('7');
  
  // Estados para busca de usuários
  const [searchUsername, setSearchUsername] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('br');
  const [searchedUser, setSearchedUser] = useState<string>('');

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

  // Hook da API do Habbo
  const { userData, isLoading: isLoadingUser, error: userError, refreshData } = useHabboPublicAPI(searchedUser, selectedCountry);
  
  // Debug logs
  console.log('Estado do componente:', {
    searchedUser,
    selectedCountry,
    userData,
    isLoadingUser,
    userError
  });

  // Mapeamento de países para URLs da API
  const countryAPIs = {
    br: 'https://www.habbo.com.br',
    us: 'https://www.habbo.com',
    de: 'https://www.habbo.de',
    es: 'https://www.habbo.es',
    fi: 'https://www.habbo.fi',
    fr: 'https://www.habbo.fr',
    it: 'https://www.habbo.it',
    nl: 'https://www.habbo.nl',
    tr: 'https://www.habbo.com.tr'
  };

  // Função para buscar usuário
  const handleSearchUser = async () => {
    if (!searchUsername.trim()) return;
    
    console.log('Buscando usuário:', searchUsername.trim());
    console.log('País selecionado:', selectedCountry);
    setSearchedUser(searchUsername.trim());
  };

  // Função para aplicar avatar do usuário buscado
  const applyUserAvatar = () => {
    if (userData?.figureString) {
      console.log('Figure string original:', userData.figureString);
      
      // Parsear a figure string do usuário e aplicar ao editor
      const figureParts = userData.figureString.split('.');
      const newFigure = { ...currentFigure };
      
      // Detectar gênero baseado na figure string - MELHORADO
      let detectedGender = 'M'; // Default
      if (figureParts.some(part => 
        part.includes('hr-500') || 
        part.includes('ch-710') || 
        part.includes('lg-870') ||
        part.includes('hr-500-') ||
        part.includes('ch-710-') ||
        part.includes('lg-870-')
      )) {
        detectedGender = 'F';
      }
      
      // Atualizar gênero selecionado
      setSelectedGender(detectedGender as 'M' | 'F');
      
      figureParts.forEach(part => {
        if (part.trim()) {
          // Remover duplicações (ex: hr-hr-100 -> hr-100)
          const cleanPart = part.replace(/^([a-z]+)-\1-/, '$1-');
          
          if (cleanPart.startsWith('hr-')) newFigure.hr = cleanPart;
          else if (cleanPart.startsWith('hd-')) newFigure.hd = cleanPart;
          else if (cleanPart.startsWith('ch-')) newFigure.ch = cleanPart;
          else if (cleanPart.startsWith('lg-')) newFigure.lg = cleanPart;
          else if (cleanPart.startsWith('sh-')) newFigure.sh = cleanPart;
          else if (cleanPart.startsWith('ha-')) newFigure.ha = cleanPart;
          else if (cleanPart.startsWith('he-')) newFigure.he = cleanPart;
          else if (cleanPart.startsWith('ea-')) newFigure.ea = cleanPart;
          else if (cleanPart.startsWith('fa-')) newFigure.fa = cleanPart;
          else if (cleanPart.startsWith('cp-')) newFigure.cp = cleanPart;
          else if (cleanPart.startsWith('cc-')) newFigure.cc = cleanPart;
          else if (cleanPart.startsWith('ca-')) newFigure.ca = cleanPart;
          else if (cleanPart.startsWith('wa-')) newFigure.wa = cleanPart;
        }
      });
      
      // Aplicar gênero detectado
      newFigure.gender = detectedGender as 'M' | 'F';
      
      console.log('Nova figure aplicada:', newFigure);
      setCurrentFigure(newFigure);
    }
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
    // Corpo base por gênero - usar o gênero atual do avatar
    const avatarGender = currentFigure.gender || selectedGender;
    
    // CORRIGIDO: Avatar base feminino com corpo feminino completo
    let baseFigure = avatarGender === 'M'
      ? 'hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-'
      : 'hr-500-7-.hd-600-1-.ch-710-66-.lg-870-82-.sh-290-80-'; // CORRIGIDO: hd-600-1- para feminino

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

      // Limpar duplicações na value (ex: hr-hr-100 -> hr-100)
      const cleanValue = value.replace(/^([a-z]+)-\1-/, '$1-');
      const segment = `${key}-${cleanValue}`;
      const idx = figureParts.findIndex(p => p.startsWith(`${key}-`));

      if (idx !== -1) figureParts[idx] = segment;
      else figureParts.push(segment);
    }

    const figureString = figureParts.join('.');

    // Debug: Log para verificar a geração do avatar
    console.log('Avatar URL Debug:', {
      figureString,
      avatarGender,
      selectedGender,
      currentFigure: currentFigure
    });

    // Monta URL do preview usando o gênero correto - CORRIGIDO: removido duplo &&
    const url = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${avatarGender}&direction=${currentFigure.direction}&head_direction=${currentFigure.headDirection}&action=gesture=${currentFigure.gesture}&size=l`;

    return url;
  };

  // Aplicar item ao avatar
  const applyItem = (itemId: string, colorId?: string) => {
    const color = colorId || '7'; // Usar cor padrão 7
    console.log('Applying item:', { itemId, color, selectedCategory, selectedGender });
    
    setSelectedItemId(itemId);
    setPrimaryColor(color);
    
    setCurrentFigure(prev => {
      const newFigure = {
        ...prev,
        [selectedCategory]: `${itemId}-${color}-`,
        gender: selectedGender // Garantir que o gênero seja atualizado
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
    // Usar dados unificados se disponíveis, senão fallback para Templarios
    let items: any[] = [];
    
    if (unifiedClothingData && unifiedClothingData[selectedCategory]) {
      // Usar dados oficiais unificados
      items = unifiedClothingData[selectedCategory];
      console.log('Using unified clothing data:', selectedCategory, 'Total items:', items.length);
    } else {
      // Fallback para dados Templarios
      const templariosItems = getItemsByCategory(selectedCategory, selectedGender);
      items = Object.entries(templariosItems).map(([itemId, itemData]) => ({
        id: itemId,
        figureId: itemId,
        category: selectedCategory,
        gender: itemData.gender || 'U',
        club: itemData.club === 1 ? 'HC' : 'FREE',
        name: `${selectedCategory} ${itemId}`,
        thumbnailUrl: '',
        colorable: itemData.colorable === 1,
        selectable: true,
        sellable: false,
        colors: ['1', '2', '3', '4', '5']
      }));
      console.log('Using Templarios fallback data:', selectedCategory, 'Total items:', items.length);
    }
    
    // Filtrar por gênero
    const genderFiltered = items.filter(item => 
      item.gender === selectedGender || item.gender === 'U'
    );
    
    // Debug: contar itens por gênero
    const itemsByGender = genderFiltered.reduce((acc, item) => {
      acc[item.gender] = (acc[item.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('Items by gender:', itemsByGender);
    
    // Aplicar filtros adicionais
    const filtered = genderFiltered.filter(item => {
      if (searchTerm && !item.figureId.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (showClubOnly && item.club !== 'HC') {
        return false;
      }
      if (showColorableOnly && !item.colorable) {
        return false;
      }
      return true;
    });
    
    console.log('Filtered items:', filtered.length);
    return filtered.map(item => [item.figureId, item]);
  };

  // Gerar URL do item - Preview focado na região específica com gênero correto
  const getItemPreviewUrl = (itemId: string, colorHex?: string) => {
    const primaryColor = colorHex || '7';
    
    // Verificar se temos dados unificados com thumbnail URL
    if (unifiedClothingData && unifiedClothingData[selectedCategory]) {
      const item = unifiedClothingData[selectedCategory].find(item => item.figureId === itemId);
      if (item && item.thumbnailUrl) {
        console.log('Using unified thumbnail URL:', item.thumbnailUrl);
        return item.thumbnailUrl;
      }
    }
    
    // Fallback: gerar URL usando habbo-imaging
    // Avatar base mais simples e focado para previews
    let baseFigure = '';
    
    if (selectedCategory === 'hr') {
      // Para cabelos, usar avatar base focado na cabeça
      if (selectedGender === 'F') {
        baseFigure = 'hd-600-1-.ch-710-66-.lg-870-82-.sh-290-80-'; // Cabeça feminina com corpo básico
      } else {
        baseFigure = 'hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-'; // Cabeça masculina com corpo básico
      }
    } else {
      // Para outras categorias, usar avatar completo
      baseFigure = selectedGender === 'M' 
        ? 'hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-'
        : 'hr-500-7-.hd-600-1-.ch-710-66-.lg-870-82-.sh-290-80-';
    }
    
    // Para cabelos, adicionar o cabelo específico
    if (selectedCategory === 'hr') {
      baseFigure = `${baseFigure}.${selectedCategory}-${itemId}-${primaryColor}`;
    } else {
      // Para outras categorias, substituir ou adicionar
      const figureParts = baseFigure.split('.');
      const categoryIndex = figureParts.findIndex(part => part.startsWith(selectedCategory + '-'));
      
      if (categoryIndex !== -1) {
        // Substituir categoria existente
        figureParts[categoryIndex] = `${selectedCategory}-${itemId}-${primaryColor}`;
      } else {
        // Adicionar nova categoria se não existir
        figureParts.push(`${selectedCategory}-${itemId}-${primaryColor}`);
      }
      
      baseFigure = figureParts.join('.');
    }
    
    // Debug: Log para verificar se a substituição está funcionando
    console.log('Item Preview URL Debug:', {
      itemId,
      selectedCategory,
      selectedGender,
      primaryColor,
      finalFigureString: baseFigure
    });
    
    // Corrigir a URL do habbo-imaging - remover duplo && e usar formato correto
    const cleanFigure = baseFigure.replace(/\.$/, ''); // Remove trailing dot
    
    // Gerar múltiplas URLs de fallback
    const urls = [
      // URL principal
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${selectedGender}&direction=2&head_direction=2&action=gesture=std&size=m`,
      // Fallback com parâmetros diferentes
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${selectedGender}&direction=2&head_direction=2&size=m`,
      // Fallback com hotel brasileiro
      `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${selectedGender}&direction=2&head_direction=2&size=m`,
      // Fallback com headonly para cabelos
      selectedCategory === 'hr' ? `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${selectedGender}&direction=2&head_direction=2&headonly=1&size=m` : null
    ].filter(Boolean);
    
    return urls[0]; // Retorna a primeira URL, mas o componente pode implementar fallback
  };

  // Sistema de cores dinâmico baseado no figuredata.xml oficial
  // Função para obter cores reais baseadas na categoria e paletas do figuredata
  const getRealColorsForCategory = (category: string) => {
    // Determinar paleta correta baseada na categoria
    let paletteId = '3'; // Padrão para roupas
    switch (category) {
      case 'hd': // Rosto e Corpo - Paleta 1
      case 'fc': // Rostos (categoria antiga)
      case 'ey': // Olhos (categoria antiga)
        paletteId = '1';
        break;
      case 'hr': // Cabelos - Paleta 2
        paletteId = '2';
        break;
      default: // Todas as outras categorias - Paleta 3
        paletteId = '3';
        break;
    }

    // Obter cores da paleta real do figuredata
    const palette = colorPalettes[paletteId] || [];
    
    // Se não temos paleta real, usar fallback
    if (palette.length === 0) {
      console.warn(`⚠️ [Colors] No palette found for category ${category}, using fallback`);
      return getFallbackColorsForCategory(category);
    }

    // Converter para formato do seletor
    return palette.map(color => ({
      id: color.id,
      name: `Cor ${color.id}`,
      hex: color.hex,
      isHC: false // TODO: Implementar detecção de HC baseada no figuredata
    }));
  };

  // Fallback para cores quando não temos dados reais
  const getFallbackColorsForCategory = (category: string) => {
    const fallbackColors = [
      { id: '1', name: 'Cor 1', hex: '#FFFFFF', isHC: false },
      { id: '2', name: 'Cor 2', hex: '#000000', isHC: false },
      { id: '3', name: 'Cor 3', hex: '#808080', isHC: false },
      { id: '4', name: 'Cor 4', hex: '#FF0000', isHC: false },
      { id: '5', name: 'Cor 5', hex: '#0000FF', isHC: false },
      { id: '6', name: 'Cor 6', hex: '#008000', isHC: false },
      { id: '7', name: 'Cor 7', hex: '#FFFF00', isHC: false },
      { id: '8', name: 'Cor 8', hex: '#FFC0CB', isHC: false },
      { id: '9', name: 'Cor 9', hex: '#800080', isHC: false },
      { id: '10', name: 'Cor 10', hex: '#FFA500', isHC: false }
    ];
    return fallbackColors;
  };

  // Função para obter cores baseadas na categoria (usando dados reais do figuredata)
  const getColorsForCategory = (category: string) => {
    return getRealColorsForCategory(category);
  };

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
              {/* Busca de Usuários */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Buscar Usuário</Label>
                
                {/* Campo de busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Digite o nome do usuário..."
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                    className="pl-10 pr-4"
                  />
                </div>
                
                {/* Bandeiras de países */}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(countryAPIs).map(([country, url]) => (
                    <button
                      key={country}
                      onClick={() => setSelectedCountry(country)}
                      className={`p-1 rounded transition-colors ${
                        selectedCountry === country 
                          ? 'bg-blue-100 border-2 border-blue-400' 
                          : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                      }`}
                      title={`Habbo ${country.toUpperCase()}`}
                    >
                      <img 
                        src={`/flags/${country}.png`} 
                        alt={country.toUpperCase()} 
                        className="w-6 h-4 object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
                
                {/* Botão de busca */}
                <Button 
                  onClick={handleSearchUser}
                  disabled={!searchUsername.trim() || isLoadingUser}
                  className="w-full"
                  size="sm"
                >
                  {isLoadingUser ? 'Buscando...' : 'Buscar Usuário'}
                </Button>
                
                {/* Resultado da busca */}
                {userData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">{userData.name}</p>
                        <p className="text-sm text-green-600">{userData.motto}</p>
                      </div>
                      <Button 
                        onClick={applyUserAvatar}
                        size="sm"
                        variant="outline"
                        className="text-green-700 border-green-300 hover:bg-green-100"
                      >
                        Aplicar Avatar
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Erro na busca */}
                {userError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{userError}</p>
                  </div>
                )}
              </div>
              
              <Separator />
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Grid de Itens */}
            <div className="lg:col-span-9">
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
                          onClick={() => handleGenderChange('M')}
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
                          onClick={() => handleGenderChange('F')}
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
                    {isLoadingClothing && (
                      <span className="ml-2 text-blue-500">🔄 Carregando dados oficiais...</span>
                    )}
                    {clothingError && (
                      <span className="ml-2 text-red-500">⚠️ Erro ao carregar dados oficiais</span>
                    )}
                  </div>

                  <Separator />

                  {/* Grid de itens - Preview centralizado e otimizado para cada categoria */}
                  <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto">
                      {getFilteredItems().map(([itemId, itemData]) => {
                        // Sistema de centralização otimizado para cada categoria
                        const isSelected = selectedItemId === itemId;
                        
                        return (
                          <div
                            key={itemId}
                            className={`relative group cursor-pointer transition-all duration-200 ${
                              isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'
                            }`}
                            onClick={() => applyItem(itemId, primaryColor)}
                          >
                            <div className="w-full h-20 cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 rounded bg-gray-50 overflow-hidden">
                              <ClothingImageWithFallback
                                itemId={itemId}
                                category={selectedCategory}
                                gender={selectedGender}
                                color={primaryColor}
                                alt={`${selectedCategory} ${itemId}`}
                              />
                            </div>
                            
                            {/* Badges de raridade e propriedades */}
                            <div className="absolute top-1 right-1 z-10">
                              {itemData.isNFT && (
                                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">NFT</span>
                                </div>
                              )}
                              {itemData.isLTD && !itemData.isNFT && (
                                <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">LTD</span>
                                </div>
                              )}
                              {itemData.isRare && !itemData.isLTD && !itemData.isNFT && (
                                <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">R</span>
                                </div>
                              )}
                              {itemData.isHC && !itemData.isRare && !itemData.isLTD && !itemData.isNFT && (
                                <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">HC</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Badge duotone */}
                            {itemData.isDuotone && (
                              <div className="absolute top-1 left-1 z-10">
                                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">2</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Badges de propriedades */}
                            <div className="absolute bottom-1 left-1 z-10">
                              {itemData.colorable && (
                                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center" title="Colorável">
                                  <span className="text-xs text-white font-bold">C</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="absolute bottom-1 right-1 z-10">
                              {itemData.sellable && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center" title="Vendável">
                                  <span className="text-xs text-white font-bold">$</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Seletor de Cores */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">🎨</span>
                    Paleta de Cores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Cores baseadas na categoria selecionada - Apenas quadros de cores */}
                  <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
                    {getColorsForCategory(selectedCategory).map((colorData) => (
                      <div
                        key={colorData.id}
                        className={`relative w-8 h-8 rounded border-2 cursor-pointer transition-all hover:scale-110 ${
                          primaryColor === colorData.id 
                            ? 'border-blue-500 ring-2 ring-blue-300' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: colorData.hex }}
                        onClick={() => setPrimaryColor(colorData.id)}
                        title={`${colorData.name} (ID: ${colorData.id})`}
                      >
                        {/* Badge HC para cores do Habbo Club */}
                        {colorData.isHC && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">HC</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Informação sobre a paleta atual */}
                  <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                    {['hd', 'fc', 'ey'].includes(selectedCategory) && 'Paleta 1: Cores para pele/rosto'}
                    {selectedCategory === 'hr' && 'Paleta 2: Cores para cabelo'}
                    {!['hd', 'hr', 'fc', 'ey'].includes(selectedCategory) && 'Paleta 3: Cores para roupas'}
                  </div>
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