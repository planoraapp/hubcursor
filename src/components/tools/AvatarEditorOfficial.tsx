import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mapSWFToHabboCategory, getCategoryDescription } from '@/utils/clothingCategoryMapper';
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
const ClothingImageWithFallback = ({ itemId, category, gender, color, alt, verticalPosition = 50, unifiedClothingData }: {
  itemId: string;
  category: string;
  gender: string;
  color: string;
  alt: string;
  verticalPosition?: number;
  unifiedClothingData?: any;
}) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const generateFallbackUrls = (itemId: string, category: string, gender: string, color: string) => {
    // Extrair o figureId real do itemId
    // Formato esperado: category-figureId ou apenas figureId
    let actualFigureId = itemId;
    
    // Se itemId contém hífen, extrair a parte após o primeiro hífen
    if (itemId.includes('-')) {
      const parts = itemId.split('-');
      // Se o primeiro parte é a categoria, pegar o resto
      if (parts[0] === category) {
        actualFigureId = parts.slice(1).join('-');
      } else {
        // Caso contrário, pode ser um código completo como "ch-665"
        actualFigureId = parts.slice(1).join('-') || parts[0];
      }
    }
    
        // Primeiro, tentar usar thumbnailUrl dos dados unificados se disponível
    if (unifiedClothingData && unifiedClothingData[category]) {
      // Tentar múltiplas formas de buscar o item
      let item = unifiedClothingData[category].find(item => 
        item.figureId === actualFigureId || 
        item.id === itemId ||
        item.id === actualFigureId ||
        item.figureId === itemId
      );
      
      if (item && item.thumbnailUrl) {
                return [item.thumbnailUrl];
      } else {
      }
    }

    // Fallback: gerar URL usando habbo-imaging baseado na documentação oficial
    // Formato: https://www.habbo.com/habbo-imaging/avatarimage?figure=categoria-id-cor&gender=M&direction=2&head_direction=2&size=m&img_format=png
    let baseFigure = '';
    
    // Para cabelos, usar apenas o cabelo com fundo transparente
    if (category === 'hr') {
      baseFigure = `${category}-${actualFigureId}-${color}`;
    } else {
      // Para outras categorias, usar avatar completo baseado no gênero
      const baseAvatar = gender === 'M' 
        ? 'hr-100-7.hd-190-7.ch-210-66.lg-270-82.sh-290-80'
        : 'hr-500-7.hd-600-1.ch-710-66.lg-870-82.sh-290-80';
      
      baseFigure = `${baseAvatar}.${category}-${actualFigureId}-${color}`;
    }
    
        return [
      // URL principal - formato oficial do Habbo
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${baseFigure}&gender=${gender}&direction=2&head_direction=2&size=m&img_format=png`,
      // Fallback com headonly para itens de cabeça
      ['hr', 'ha', 'he', 'ea', 'fa'].includes(category) 
        ? `https://www.habbo.com/habbo-imaging/avatarimage?figure=${baseFigure}&gender=${gender}&direction=2&head_direction=2&headonly=1&size=m&img_format=png` 
        : null,
      // Fallback com size L
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${baseFigure}&gender=${gender}&direction=2&head_direction=2&size=l&img_format=png`,
      // Fallback simples
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${baseFigure}&gender=${gender}&size=m&img_format=png`
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
        objectPosition: `center ${verticalPosition}%`, 
        objectFit: 'cover',
        transform: 'scale(1.1)'
      }}
      onError={handleError}
    />
  );
};
import { useHabboPublicAPI } from '@/hooks/useHabboPublicAPI';

// Interfaces para o editor de avatar
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

// Categorias baseadas na documentação oficial do Habbo - CORRIGIDAS conforme estrutura oficial
const CATEGORIES = [
  // CORPO - Rostos (integrado com eyes)
  {
    id: 'hd',
    name: getCategoryDescription('hd'),
    icon: '/assets/body.png',
    subcategories: []
  },
  
  // CABEÇA - Cabelos
  {
    id: 'hr',
    name: getCategoryDescription('hr'),
    icon: '/assets/Cabelo1.png',
    subcategories: []
  },
  
  // CABEÇA - Chapéus
  {
    id: 'ha',
    name: getCategoryDescription('ha'),
    icon: '/assets/Bone1.png',
    subcategories: []
  },
  
  // CABEÇA - Acessórios de Cabelo
  {
    id: 'he',
    name: getCategoryDescription('he'),
    icon: '/assets/Acessorios1.png',
    subcategories: []
  },
  
  // CABEÇA - Óculos
  {
    id: 'ea',
    name: getCategoryDescription('ea'),
    icon: '/assets/Oculos1.png',
    subcategories: []
  },
  
  // CABEÇA - Rosto (acessórios faciais)
  {
    id: 'fa',
    name: getCategoryDescription('fa'),
    icon: '/assets/Rosto1.png',
    subcategories: []
  },
  
  // TORSO - Camisetas
  {
    id: 'ch',
    name: getCategoryDescription('ch'),
    icon: '/assets/Camiseta1.png',
    subcategories: []
  },
  
  // TORSO - Casacos
  {
    id: 'cc',
    name: getCategoryDescription('cc'),
    icon: '/assets/Casaco1.png',
    subcategories: []
  },
  
  // TORSO - Estampas/Impressões
  {
    id: 'cp',
    name: getCategoryDescription('cp'),
    icon: '/assets/Estampa1.png',
    subcategories: []
  },
  
  // TORSO - Acessórios
  {
    id: 'ca',
    name: getCategoryDescription('ca'),
    icon: '/assets/Colar1.png',
    subcategories: []
  },
  
  // PERNAS - Calça
  {
    id: 'lg',
    name: getCategoryDescription('lg'),
    icon: '/assets/Calca1.png',
    subcategories: []
  },
  
  // PERNAS - Sapato
  {
    id: 'sh',
    name: getCategoryDescription('sh'),
    icon: '/assets/Tenis.png',
    subcategories: []
  },
  
  // PERNAS - Cintos (acessórios para a parte inferior)
  {
    id: 'wa',
    name: getCategoryDescription('wa'),
    icon: '/assets/Cinto1.png',
    subcategories: []
  }
];

const AvatarEditorOfficial = () => {
  // Hook para dados do editor (fallback)
  const { getItemsByCategory, getPaletteForCategory } = useTemplariosData();
  
  // Hook para dados oficiais unificados do Habbo
  const { data: unifiedClothingData, colorPalettes, isLoading: isLoadingClothing, error: clothingError } = useUnifiedHabboClothing();
  
  
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

  // Estado para controlar posição vertical das imagens por categoria
  const [imageVerticalPosition, setImageVerticalPosition] = useState<Record<string, number>>({
    hd: 50,    // Rosto/Corpo - centro por padrão
    hr: 30,    // Cabelo - mais para cima
    ch: 50,    // Camisas - centro
    lg: 60,    // Calças - mais para baixo
    sh: 70,    // Sapatos - mais para baixo
    ha: 20,    // Chapéus - mais para cima
    he: 25,    // Acessórios de cabeça - mais para cima
    ea: 40,    // Óculos - centro-alto
    fa: 45,    // Acessórios faciais - centro-alto
    cp: 50,    // Estampas - centro
    cc: 50,    // Casacos/Vestidos - centro
    ca: 50,    // Joias - centro
    wa: 60,    // Cintos - mais para baixo
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
    // Mapeamento de países para URLs da API - Usando domínio internacional (.com)
  const countryAPIs = {
    br: 'https://www.habbo.com', // Mudado para .com
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
    
        setSearchedUser(searchUsername.trim());
  };

  // Função para aplicar avatar do usuário buscado
  const applyUserAvatar = () => {
    if (userData?.figureString) {
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

  // Gerar URL do avatar - Formato exato do editor
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
        // Monta URL do preview usando o gênero correto - CORRIGIDO: removido duplo &&
    const url = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${avatarGender}&direction=${currentFigure.direction}&head_direction=${currentFigure.headDirection}&action=gesture=${currentFigure.gesture}&size=l`;

    return url;
  };

  // Aplicar item ao avatar
  const applyItem = (itemId: string, colorId?: string) => {
    const color = colorId || '7'; // Usar cor padrão 7
    // Extrair o figureId real do itemId (formato: category-figureId)
    const actualFigureId = itemId.includes('-') ? itemId.split('-').slice(1).join('-') : itemId;
    
        setSelectedItemId(itemId);
    setPrimaryColor(color);
    
    setCurrentFigure(prev => {
      const newFigure = {
        ...prev,
        [selectedCategory]: `${actualFigureId}-${color}-`,
        gender: selectedGender // Garantir que o gênero seja atualizado
      };
            return newFigure;
    });
  };

  // Remover item do avatar (voltar para padrão)
  const removeItem = (category: string) => {
        setCurrentFigure(prev => {
      const newFigure = { ...prev };
      
      // Definir valores padrão baseados no gênero
      if (category === 'hr') {
        newFigure.hr = selectedGender === 'M' ? '100-7-' : '500-7-';
      } else if (category === 'hd') {
        newFigure.hd = selectedGender === 'M' ? '190-7-' : '600-1-';
      } else if (category === 'ch') {
        newFigure.ch = selectedGender === 'M' ? '210-66-' : '710-66-';
      } else if (category === 'lg') {
        newFigure.lg = selectedGender === 'M' ? '270-82-' : '870-82-';
      } else if (category === 'sh') {
        newFigure.sh = '290-80-';
      } else {
        // Para outras categorias (acessórios), remover completamente
        (newFigure as any)[category] = '100-7-';
      }
      
            return newFigure;
    });
    
    // Limpar seleção se o item removido era o selecionado
    if (selectedCategory === category) {
      setSelectedItemId(null);
    }
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

  // Verificar se um item está sendo usado no avatar atual
  const isItemInUse = (itemId: string, category: string) => {
    const currentItemValue = currentFigure[category as keyof AvatarFigure];
    if (!currentItemValue || typeof currentItemValue !== 'string') return false;
    
    // Extrair o ID do item da string (formato: "itemId-color-")
    const currentItemId = currentItemValue.split('-')[0];
    return currentItemId === itemId;
  };

  // Função para exibir nomes reais do figuredata
  const generateItemDisplayName = (item: any) => {
    // Prioridade 1: Nome real do item (scientificCode)
    if (item.scientificCode && item.scientificCode !== `${selectedCategory} ${item.figureId}`) {
      return item.scientificCode;
    }
    
    // Prioridade 2: Nome real do asset se disponível
    if (item.name && item.name !== `${selectedCategory} ${item.figureId}`) {
      return item.name;
    }
    
    // Prioridade 3: Nome do swfUrl se disponível - extrair nome real do arquivo
    if (item.swfUrl) {
      const swfName = item.swfUrl.split('/').pop()?.replace('.swf', '');
      if (swfName && swfName !== 'undefined') {
        return swfName;
      }
    }
    
    // Prioridade 4: Gerar nome científico baseado no padrão do Habbo
    const itemId = item.figureId || item.id;
    const gender = item.gender || 'U';
    const isHC = item.club === '2' || item.club === 'HC';
    
    // Mapeamento de categorias para prefixos científicos
    const categoryPrefixes: Record<string, string> = {
      hr: 'hair',
      hd: 'head',
      ch: 'shirt',
      lg: 'pants',
      sh: 'shoes',
      ha: 'hat',
      he: 'head_accessory',
      ea: 'glasses',
      fa: 'face_accessory',
      cp: 'print',
      cc: 'coat',
      ca: 'necklace',
      wa: 'belt',
    };
    
    const prefix = categoryPrefixes[selectedCategory] || selectedCategory;
    
    // Gerar sufixo baseado no ID e características
    let suffix = '';
    const id = parseInt(itemId);
    
    // Padrões baseados em IDs conhecidos do Habbo
    if (id < 1000) {
      suffix = `basic_${id}`;
    } else if (id < 2000) {
      suffix = `classic_${id}`;
    } else if (id < 3000) {
      suffix = `modern_${id}`;
    } else if (id < 4000) {
      suffix = `stylish_${id}`;
    } else if (id < 5000) {
      suffix = `premium_${id}`;
    } else {
      suffix = `special_${id}`;
    }
    
    // Adicionar sufixos especiais
    if (isHC) suffix += '_hc';
    if (gender === 'F') suffix += '_f';
    else if (gender === 'M') suffix += '_m';
    
    return `${prefix}_${gender}_${suffix}`;
  };

  // Obter itens filtrados
  const getFilteredItems = () => {
    // Usar dados unificados se disponíveis, senão fallback para Templarios
    let items: any[] = [];
    
    
    if (unifiedClothingData && unifiedClothingData[selectedCategory]) {
      // Usar dados oficiais unificados - as propriedades de raridade já foram detectadas
      items = unifiedClothingData[selectedCategory].map(item => {
        // Se o item já tem propriedades de raridade detectadas, usar elas
        if (item.isNFT !== undefined || item.isLTD !== undefined || item.isRare !== undefined || 
            item.isHC !== undefined || item.isSellable !== undefined || item.isNormal !== undefined) {
          
          const result = {
            ...item,
            isDuotone: item.isDuotone || item.colorable,
            colorable: item.colorable || false
          };
          
          // Debug: mostrar badges já detectados
          if (item.isNFT || item.isLTD || item.isRare || item.isHC || item.isSellable) {
                      }
          
          return result;
        }
        
        // Fallback: Sistema de detecção automática baseado no figuredata.xml, furnidata.json E nomes dos assets
        const assetName = generateItemDisplayName(item).toLowerCase();
        const itemWithFurnidata = item as any; // Type assertion para acessar propriedades do furnidata
        
        // 1. DETECTAR NFTs - Prioridade máxima
        const nftCollections = ['nft2025', 'nft2024', 'nft2023', 'nft', 'nftmint', 'testing'];
        const isNFT = item.isNFT || 
                     item.rarity === 'nft' ||
                     assetName.includes('nft') ||
                     (itemWithFurnidata.furniline && nftCollections.some(collection => 
                       itemWithFurnidata.furniline.toLowerCase().includes(collection.toLowerCase())
                     ));
        
        // 2. DETECTAR LTDs - Segunda prioridade  
        const isLTD = item.isLTD || 
                     item.rarity === 'ltd' ||
                     assetName.includes('ltd') ||
                     assetName.includes('limited') ||
                     assetName.includes('loyalty') ||
                     (itemWithFurnidata.classname && itemWithFurnidata.classname.toLowerCase().startsWith('clothing_ltd'));
        
        // 3. DETECTAR RAROS - Terceira prioridade
        const isRare = item.isRare || 
                      item.rarity === 'rare' ||
                      assetName.includes('_r_') ||
                      assetName.includes('rare') ||
                      (itemWithFurnidata.classname && itemWithFurnidata.classname.toLowerCase().startsWith('clothing_r'));
        
        // 4. DETECTAR HC - Quarta prioridade
        const isHC = item.club === 'HC' || 
                    item.isHC ||
                    item.rarity === 'hc' ||
                    assetName.includes('_hc') ||
                    assetName.includes('club');
        
        // 5. DETECTAR VENDÁVEIS - Quinta prioridade
        const isSellable = item.sellable || 
                          item.rarity === 'sellable' ||
                          assetName.includes('sellable') ||
                          assetName.includes('vend');
        
        // 6. ITENS NORMAIS - Fallback
        const isNormal = !isNFT && !isLTD && !isRare && !isHC && !isSellable;
        
        const result = {
          ...item,
          isHC,
          isLTD,
          isNFT,
          isRare,
          isSellable,
          isNormal,
          isDuotone: item.isDuotone || item.colorable,
          colorable: item.colorable || false
        };
        
        // Debug: mostrar detecção de badges para itens especiais
        if (isNFT || isLTD || isRare || isHC || isSellable) {
                  }
        
        return result;
      });
          } else {
      // SEM FALLBACK - Usar apenas dados corretos do ViaJovemCompleteService
      console.log(`⚠️ [AvatarEditorOfficial] Nenhum item encontrado para categoria ${selectedCategory} nos dados unificados`);
      items = [];
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
    
        return filtered.map(item => [`${selectedCategory}-${item.figureId}`, item]);
  };

  // Gerar URL do item - Preview focado na região específica com gênero correto
  const getItemPreviewUrl = (itemId: string, colorHex?: string) => {
    const primaryColor = colorHex || '7';
    
    // Verificar se temos dados unificados com thumbnail URL
    if (unifiedClothingData && unifiedClothingData[selectedCategory]) {
      const item = unifiedClothingData[selectedCategory].find(item => item.figureId === itemId);
      if (item && item.thumbnailUrl) {
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
        // Corrigir a URL do habbo-imaging - remover duplo && e usar formato correto
    const cleanFigure = baseFigure.replace(/\.$/, ''); // Remove trailing dot
    
    // Gerar múltiplas URLs de fallback
    const urls = [
      // URL principal
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${selectedGender}&direction=2&head_direction=2&action=gesture=std&size=m`,
      // Fallback com parâmetros diferentes
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${selectedGender}&direction=2&head_direction=2&size=m`,
      // Fallback com hotel internacional
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${selectedGender}&direction=2&head_direction=2&size=m`,
      // Fallback com headonly para cabelos
      selectedCategory === 'hr' ? `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${selectedGender}&direction=2&head_direction=2&headonly=1&size=m` : null
    ].filter(Boolean);
    
    return urls[0]; // Retorna a primeira URL, mas o componente pode implementar fallback
  };

  // Sistema de cores baseado no figuredata oficial do Habbo Hotel
  const getHabboColorsForCategory = (category: string) => {
    // Cores exatas do figuredata oficial do Habbo Hotel
    const habboColors = {
      // Paleta 1: Cores para pele/rosto (hd) - 65 cores
      '1': [
        // Cores gratuitas (club="0" selectable="1") - 11 cores
        { id: '14', hex: '#F5DA88', name: 'Pele Clara 1', isHC: false },
        { id: '10', hex: '#FFDBC1', name: 'Pele Clara 2', isHC: false },
        { id: '1', hex: '#FFCB98', name: 'Pele Clara 3', isHC: false },
        { id: '8', hex: '#F4AC54', name: 'Pele Clara 4', isHC: false },
        { id: '12', hex: '#FF987F', name: 'Pele Clara 5', isHC: false },
        { id: '1369', hex: '#e0a9a9', name: 'Pele Clara 6', isHC: false },
        { id: '1370', hex: '#ca8154', name: 'Pele Clara 7', isHC: false },
        { id: '19', hex: '#B87560', name: 'Pele Clara 8', isHC: false },
        { id: '20', hex: '#9C543F', name: 'Pele Clara 9', isHC: false },
        { id: '1371', hex: '#904925', name: 'Pele Clara 10', isHC: false },
        { id: '30', hex: '#4C311E', name: 'Pele Clara 11', isHC: false },
        
        // Cores Habbo Club (club="2" selectable="1") - 54 cores
        { id: '1372', hex: '#543d35', name: 'Pele HC 1', isHC: true },
        { id: '1373', hex: '#653a1d', name: 'Pele HC 2', isHC: true },
        { id: '21', hex: '#6E392C', name: 'Pele HC 3', isHC: true },
        { id: '1374', hex: '#714947', name: 'Pele HC 4', isHC: true },
        { id: '1375', hex: '#856860', name: 'Pele HC 5', isHC: true },
        { id: '1376', hex: '#895048', name: 'Pele HC 6', isHC: true },
        { id: '1377', hex: '#a15253', name: 'Pele HC 7', isHC: true },
        { id: '1378', hex: '#aa7870', name: 'Pele HC 8', isHC: true },
        { id: '1379', hex: '#be8263', name: 'Pele HC 9', isHC: true },
        { id: '1380', hex: '#b6856d', name: 'Pele HC 10', isHC: true },
        { id: '1381', hex: '#ba8a82', name: 'Pele HC 11', isHC: true },
        { id: '1382', hex: '#c88f82', name: 'Pele HC 12', isHC: true },
        { id: '1383', hex: '#d9a792', name: 'Pele HC 13', isHC: true },
        { id: '1384', hex: '#c68383', name: 'Pele HC 14', isHC: true },
        { id: '1368', hex: '#BC576A', name: 'Pele HC 15', isHC: true },
        { id: '1367', hex: '#FF5757', name: 'Pele HC 16', isHC: true },
        { id: '1366', hex: '#FF7575', name: 'Pele HC 17', isHC: true },
        { id: '1358', hex: '#B65E38', name: 'Pele HC 18', isHC: true },
        { id: '1385', hex: '#a76644', name: 'Pele HC 19', isHC: true },
        { id: '1386', hex: '#7c5133', name: 'Pele HC 20', isHC: true },
        { id: '1387', hex: '#9a7257', name: 'Pele HC 21', isHC: true },
        { id: '5', hex: '#945C2F', name: 'Pele HC 22', isHC: true },
        { id: '1389', hex: '#d98c63', name: 'Pele HC 23', isHC: true },
        { id: '4', hex: '#AE7748', name: 'Pele HC 24', isHC: true },
        { id: '1388', hex: '#c57040', name: 'Pele HC 25', isHC: true },
        { id: '1359', hex: '#B88655', name: 'Pele HC 26', isHC: true },
        { id: '3', hex: '#C99263', name: 'Pele HC 27', isHC: true },
        { id: '18', hex: '#A89473', name: 'Pele HC 28', isHC: true },
        { id: '17', hex: '#C89F56', name: 'Pele HC 29', isHC: true },
        { id: '9', hex: '#DC9B4C', name: 'Pele HC 30', isHC: true },
        { id: '1357', hex: '#FF8C40', name: 'Pele HC 31', isHC: true },
        { id: '1390', hex: '#de9d75', name: 'Pele HC 32', isHC: true },
        { id: '1391', hex: '#eca782', name: 'Pele HC 33', isHC: true },
        { id: '11', hex: '#FFB696', name: 'Pele HC 34', isHC: true },
        { id: '2', hex: '#E3AE7D', name: 'Pele HC 35', isHC: true },
        { id: '7', hex: '#FFC680', name: 'Pele HC 36', isHC: true },
        { id: '15', hex: '#DFC375', name: 'Pele HC 37', isHC: true },
        { id: '13', hex: '#F0DCA3', name: 'Pele HC 38', isHC: true },
        { id: '22', hex: '#EAEFD0', name: 'Pele HC 39', isHC: true },
        { id: '23', hex: '#E2E4B0', name: 'Pele HC 40', isHC: true },
        { id: '24', hex: '#D5D08C', name: 'Pele HC 41', isHC: true },
        { id: '1361', hex: '#BDE05F', name: 'Pele HC 42', isHC: true },
        { id: '1362', hex: '#5DC446', name: 'Pele HC 43', isHC: true },
        { id: '1360', hex: '#A2CC89', name: 'Pele HC 44', isHC: true },
        { id: '26', hex: '#C2C4A7', name: 'Pele HC 45', isHC: true },
        { id: '28', hex: '#F1E5DA', name: 'Pele HC 46', isHC: true },
        { id: '1392', hex: '#f6d3d4', name: 'Pele HC 47', isHC: true },
        { id: '1393', hex: '#e5b6b0', name: 'Pele HC 48', isHC: true },
        { id: '25', hex: '#C4A7B3', name: 'Pele HC 49', isHC: true },
        { id: '1363', hex: '#AC94B3', name: 'Pele HC 50', isHC: true },
        { id: '1364', hex: '#D288CE', name: 'Pele HC 51', isHC: true },
        { id: '1365', hex: '#6799CC', name: 'Pele HC 52', isHC: true },
        { id: '29', hex: '#B3BDC3', name: 'Pele HC 53', isHC: true },
        { id: '27', hex: '#C5C0C2', name: 'Pele HC 54', isHC: true }
      ],
      
      // Paleta 2: Cores para cabelo (hr) - 61 cores
      '2': [
        // Cores gratuitas (club="0" selectable="1") - 16 cores
        { id: '40', hex: '#D8D3D9', name: 'Cabelo Claro 1', isHC: false },
        { id: '34', hex: '#FFEEB9', name: 'Cabelo Claro 2', isHC: false },
        { id: '35', hex: '#F6D059', name: 'Cabelo Claro 3', isHC: false },
        { id: '36', hex: '#F2B11D', name: 'Cabelo Claro 4', isHC: false },
        { id: '31', hex: '#FFD6A9', name: 'Cabelo Claro 5', isHC: false },
        { id: '32', hex: '#DFA66F', name: 'Cabelo Claro 6', isHC: false },
        { id: '37', hex: '#9A5D2E', name: 'Cabelo Claro 7', isHC: false },
        { id: '38', hex: '#AC5300', name: 'Cabelo Claro 8', isHC: false },
        { id: '43', hex: '#F29159', name: 'Cabelo Claro 9', isHC: false },
        { id: '46', hex: '#FF8746', name: 'Cabelo Claro 10', isHC: false },
        { id: '47', hex: '#FC610C', name: 'Cabelo Claro 11', isHC: false },
        { id: '48', hex: '#DE3900', name: 'Cabelo Claro 12', isHC: false },
        { id: '44', hex: '#9E3D3B', name: 'Cabelo Claro 13', isHC: false },
        { id: '39', hex: '#783400', name: 'Cabelo Claro 14', isHC: false },
        { id: '45', hex: '#5C4332', name: 'Cabelo Claro 15', isHC: false },
        { id: '42', hex: '#4A4656', name: 'Cabelo Claro 16', isHC: false },
        
        // Cores Habbo Club (club="2" selectable="1") - 45 cores
        { id: '61', hex: '#2D2D2D', name: 'Cabelo HC 1', isHC: true },
        { id: '1394', hex: '#3f2113', name: 'Cabelo HC 2', isHC: true },
        { id: '1395', hex: '#774422', name: 'Cabelo HC 3', isHC: true },
        { id: '33', hex: '#D1803A', name: 'Cabelo HC 4', isHC: true },
        { id: '1396', hex: '#cc8b33', name: 'Cabelo HC 5', isHC: true },
        { id: '1397', hex: '#e5ba6a', name: 'Cabelo HC 6', isHC: true },
        { id: '1398', hex: '#f6d990', name: 'Cabelo HC 7', isHC: true },
        { id: '49', hex: '#FFFFFF', name: 'Cabelo HC 8', isHC: true },
        { id: '1342', hex: '#fffdd6', name: 'Cabelo HC 9', isHC: true },
        { id: '1343', hex: '#fff392', name: 'Cabelo HC 10', isHC: true },
        { id: '1399', hex: '#ffff00', name: 'Cabelo HC 11', isHC: true },
        { id: '1344', hex: '#ffe508', name: 'Cabelo HC 12', isHC: true },
        { id: '1400', hex: '#ff7716', name: 'Cabelo HC 13', isHC: true },
        { id: '1401', hex: '#aa2c1b', name: 'Cabelo HC 14', isHC: true },
        { id: '59', hex: '#E71B0A', name: 'Cabelo HC 15', isHC: true },
        { id: '1345', hex: '#ff3e3e', name: 'Cabelo HC 16', isHC: true },
        { id: '1348', hex: '#ff638f', name: 'Cabelo HC 17', isHC: true },
        { id: '54', hex: '#FFBDBC', name: 'Cabelo HC 18', isHC: true },
        { id: '1346', hex: '#ffddf1', name: 'Cabelo HC 19', isHC: true },
        { id: '1347', hex: '#ffaedc', name: 'Cabelo HC 20', isHC: true },
        { id: '55', hex: '#DE34A4', name: 'Cabelo HC 21', isHC: true },
        { id: '1349', hex: '#9e326a', name: 'Cabelo HC 22', isHC: true },
        { id: '56', hex: '#9F5699', name: 'Cabelo HC 23', isHC: true },
        { id: '1350', hex: '#8a4fb5', name: 'Cabelo HC 24', isHC: true },
        { id: '1351', hex: '#722ba6', name: 'Cabelo HC 25', isHC: true },
        { id: '1352', hex: '#4c1d6f', name: 'Cabelo HC 26', isHC: true },
        { id: '1402', hex: '#322c7a', name: 'Cabelo HC 27', isHC: true },
        { id: '1403', hex: '#71584a', name: 'Cabelo HC 28', isHC: true },
        { id: '1404', hex: '#aa8864', name: 'Cabelo HC 29', isHC: true },
        { id: '1405', hex: '#bbb1aa', name: 'Cabelo HC 30', isHC: true },
        { id: '1353', hex: '#c1c6ef', name: 'Cabelo HC 31', isHC: true },
        { id: '57', hex: '#D5F9FB', name: 'Cabelo HC 32', isHC: true },
        { id: '60', hex: '#95FFFA', name: 'Cabelo HC 33', isHC: true },
        { id: '58', hex: '#6699CC', name: 'Cabelo HC 34', isHC: true },
        { id: '1354', hex: '#4481e5', name: 'Cabelo HC 35', isHC: true },
        { id: '1355', hex: '#2c50aa', name: 'Cabelo HC 36', isHC: true },
        { id: '1356', hex: '#2a4167', name: 'Cabelo HC 37', isHC: true },
        { id: '53', hex: '#3A7B93', name: 'Cabelo HC 38', isHC: true },
        { id: '52', hex: '#339966', name: 'Cabelo HC 39', isHC: true },
        { id: '1406', hex: '#70c100', name: 'Cabelo HC 40', isHC: true },
        { id: '51', hex: '#A3FF8F', name: 'Cabelo HC 41', isHC: true },
        { id: '1316', hex: '#D2FF00', name: 'Cabelo HC 42', isHC: true },
        { id: '50', hex: '#E5FF09', name: 'Cabelo HC 43', isHC: true },
        { id: '41', hex: '#918D98', name: 'Cabelo HC 44', isHC: true },
        { id: '1407', hex: '#333333', name: 'Cabelo HC 45', isHC: true }
      ],
      
      // Paleta 3: Cores para roupas e acessórios - 95 cores
      '3': [
        // Cores gratuitas (club="0" selectable="1") - 20 cores
        { id: '1408', hex: '#dddddd', name: 'Roupa Clara 1', isHC: false },
        { id: '90', hex: '#96743D', name: 'Roupa Clara 2', isHC: false },
        { id: '91', hex: '#6B573B', name: 'Roupa Clara 3', isHC: false },
        { id: '66', hex: '#E7B027', name: 'Roupa Clara 4', isHC: false },
        { id: '1320', hex: '#fff7b7', name: 'Roupa Clara 5', isHC: false },
        { id: '68', hex: '#F8C790', name: 'Roupa Clara 6', isHC: false },
        { id: '73', hex: '#9F2B31', name: 'Roupa Clara 7', isHC: false },
        { id: '72', hex: '#ED5C50', name: 'Roupa Clara 8', isHC: false },
        { id: '71', hex: '#FFBFC2', name: 'Roupa Clara 9', isHC: false },
        { id: '74', hex: '#E7D1EE', name: 'Roupa Clara 10', isHC: false },
        { id: '75', hex: '#AC94B3', name: 'Roupa Clara 11', isHC: false },
        { id: '76', hex: '#7E5B90', name: 'Roupa Clara 12', isHC: false },
        { id: '82', hex: '#4F7AA2', name: 'Roupa Clara 13', isHC: false },
        { id: '81', hex: '#75B7C7', name: 'Roupa Clara 14', isHC: false },
        { id: '80', hex: '#C5EDE6', name: 'Roupa Clara 15', isHC: false },
        { id: '83', hex: '#BBF3BD', name: 'Roupa Clara 16', isHC: false },
        { id: '84', hex: '#6BAE61', name: 'Roupa Clara 17', isHC: false },
        { id: '85', hex: '#456F40', name: 'Roupa Clara 18', isHC: false },
        { id: '88', hex: '#7A7D22', name: 'Roupa Clara 19', isHC: false },
        { id: '64', hex: '#595959', name: 'Roupa Clara 20', isHC: false },
        
        // Cores Habbo Club (club="2" selectable="1") - 75 cores
        { id: '110', hex: '#1E1E1E', name: 'Roupa HC 1', isHC: true },
        { id: '1325', hex: '#84573c', name: 'Roupa HC 2', isHC: true },
        { id: '67', hex: '#A86B19', name: 'Roupa HC 3', isHC: true },
        { id: '1409', hex: '#c69f71', name: 'Roupa HC 4', isHC: true },
        { id: '89', hex: '#F3E1AF', name: 'Roupa HC 5', isHC: true },
        { id: '92', hex: '#FFFFFF', name: 'Roupa HC 6', isHC: true },
        { id: '93', hex: '#FFF41D', name: 'Roupa HC 7', isHC: true },
        { id: '1321', hex: '#ffe508', name: 'Roupa HC 8', isHC: true },
        { id: '1410', hex: '#ffcc00', name: 'Roupa HC 9', isHC: true },
        { id: '1322', hex: '#ffa508', name: 'Roupa HC 10', isHC: true },
        { id: '94', hex: '#FF9211', name: 'Roupa HC 11', isHC: true },
        { id: '1323', hex: '#ff5b08', name: 'Roupa HC 12', isHC: true },
        { id: '70', hex: '#C74400', name: 'Roupa HC 13', isHC: true },
        { id: '1411', hex: '#da6a43', name: 'Roupa HC 14', isHC: true },
        { id: '1324', hex: '#b18276', name: 'Roupa HC 15', isHC: true },
        { id: '1329', hex: '#ae4747', name: 'Roupa HC 16', isHC: true },
        { id: '1330', hex: '#813033', name: 'Roupa HC 17', isHC: true },
        { id: '1331', hex: '#5b2420', name: 'Roupa HC 18', isHC: true },
        { id: '100', hex: '#9B001D', name: 'Roupa HC 19', isHC: true },
        { id: '1412', hex: '#d2183c', name: 'Roupa HC 20', isHC: true },
        { id: '1413', hex: '#e53624', name: 'Roupa HC 21', isHC: true },
        { id: '96', hex: '#FF1300', name: 'Roupa HC 22', isHC: true },
        { id: '1328', hex: '#ff638f', name: 'Roupa HC 23', isHC: true },
        { id: '1414', hex: '#fe86b1', name: 'Roupa HC 24', isHC: true },
        { id: '97', hex: '#FF6D8F', name: 'Roupa HC 25', isHC: true },
        { id: '1326', hex: '#ffc7e4', name: 'Roupa HC 26', isHC: true },
        { id: '98', hex: '#E993FF', name: 'Roupa HC 27', isHC: true },
        { id: '1327', hex: '#ff88f4', name: 'Roupa HC 28', isHC: true },
        { id: '95', hex: '#FF27A6', name: 'Roupa HC 29', isHC: true },
        { id: '99', hex: '#C600AD', name: 'Roupa HC 30', isHC: true },
        { id: '1415', hex: '#a1295e', name: 'Roupa HC 31', isHC: true },
        { id: '1416', hex: '#a723c9', name: 'Roupa HC 32', isHC: true },
        { id: '1417', hex: '#6a0481', name: 'Roupa HC 33', isHC: true },
        { id: '1418', hex: '#693959', name: 'Roupa HC 34', isHC: true },
        { id: '1419', hex: '#62368c', name: 'Roupa HC 35', isHC: true },
        { id: '79', hex: '#544A81', name: 'Roupa HC 36', isHC: true },
        { id: '1420', hex: '#957caf', name: 'Roupa HC 37', isHC: true },
        { id: '78', hex: '#6D80BB', name: 'Roupa HC 38', isHC: true },
        { id: '1340', hex: '#574bfb', name: 'Roupa HC 39', isHC: true },
        { id: '1421', hex: '#6b71ed', name: 'Roupa HC 40', isHC: true },
        { id: '1339', hex: '#8791f0', name: 'Roupa HC 41', isHC: true },
        { id: '1337', hex: '#c1c6ef', name: 'Roupa HC 42', isHC: true },
        { id: '105', hex: '#94FFEC', name: 'Roupa HC 43', isHC: true },
        { id: '104', hex: '#00B9A8', name: 'Roupa HC 44', isHC: true },
        { id: '1422', hex: '#009db9', name: 'Roupa HC 45', isHC: true },
        { id: '106', hex: '#1BD2FF', name: 'Roupa HC 46', isHC: true },
        { id: '1423', hex: '#2f8ce9', name: 'Roupa HC 47', isHC: true },
        { id: '107', hex: '#1F55FF', name: 'Roupa HC 48', isHC: true },
        { id: '1424', hex: '#1946c7', name: 'Roupa HC 49', isHC: true },
        { id: '108', hex: '#0219A5', name: 'Roupa HC 50', isHC: true },
        { id: '1341', hex: '#394a7e', name: 'Roupa HC 51', isHC: true },
        { id: '1425', hex: '#2d547b', name: 'Roupa HC 52', isHC: true },
        { id: '1426', hex: '#406184', name: 'Roupa HC 53', isHC: true },
        { id: '1338', hex: '#6fa5cc', name: 'Roupa HC 54', isHC: true },
        { id: '77', hex: '#ACC9E6', name: 'Roupa HC 55', isHC: true },
        { id: '1427', hex: '#c8c8c8', name: 'Roupa HC 56', isHC: true },
        { id: '63', hex: '#A4A4A4', name: 'Roupa HC 57', isHC: true },
        { id: '1428', hex: '#868686', name: 'Roupa HC 58', isHC: true },
        { id: '1334', hex: '#89906e', name: 'Roupa HC 59', isHC: true },
        { id: '1335', hex: '#738b6e', name: 'Roupa HC 60', isHC: true },
        { id: '1429', hex: '#626738', name: 'Roupa HC 61', isHC: true },
        { id: '109', hex: '#3A5341', name: 'Roupa HC 62', isHC: true },
        { id: '1336', hex: '#1d301a', name: 'Roupa HC 63', isHC: true },
        { id: '1430', hex: '#0a6437', name: 'Roupa HC 64', isHC: true },
        { id: '1431', hex: '#47891f', name: 'Roupa HC 65', isHC: true },
        { id: '1432', hex: '#10a32f', name: 'Roupa HC 66', isHC: true },
        { id: '1433', hex: '#69bb2d', name: 'Roupa HC 67', isHC: true },
        { id: '87', hex: '#BABB3D', name: 'Roupa HC 68', isHC: true },
        { id: '86', hex: '#EDFF9A', name: 'Roupa HC 69', isHC: true },
        { id: '1315', hex: '#D2FF00', name: 'Roupa HC 70', isHC: true },
        { id: '103', hex: '#AFF203', name: 'Roupa HC 71', isHC: true },
        { id: '102', hex: '#1CDC00', name: 'Roupa HC 72', isHC: true },
        { id: '101', hex: '#76FF2D', name: 'Roupa HC 73', isHC: true },
        { id: '1332', hex: '#9eff8d', name: 'Roupa HC 74', isHC: true },
        { id: '1333', hex: '#a2cc89', name: 'Roupa HC 75', isHC: true }
      ]
    };

    // Determinar paleta baseada na categoria
    let paletteId = '3'; // Padrão para roupas
    switch (category) {
      case 'hd': // Rostos (inclui olhos integrados)
      case 'fc': // Rostos (categoria antiga)
        paletteId = '1';
        break;
      case 'hr': // Cabelos - Paleta 2
        paletteId = '2';
        break;
      default: // Todas as outras categorias - Paleta 3
        paletteId = '3';
        break;
    }

    return habboColors[paletteId] || habboColors['3'];
  };

  // Função para obter cores baseadas na categoria
  const getColorsForCategory = (category: string) => {
    return getHabboColorsForCategory(category);
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
          🎨 Editor de Avatar
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
                        src={`/flags/${country === 'us' ? 'flagcom' : country === 'br' ? 'flagbrazil' : country === 'de' ? 'flagdeus' : country === 'es' ? 'flagspain' : country === 'fr' ? 'flagfrance' : country === 'it' ? 'flagitaly' : country === 'nl' ? 'flagnetl' : country === 'tr' ? 'flagtrky' : country === 'fi' ? 'flafinland' : 'flagcom'}.png`} 
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
                  onLoad={() => {}}
                  onError={(e) => {}}
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
                    {!isLoadingClothing && !clothingError && getFilteredItems().length === 0 && (
                      <span className="ml-2 text-orange-500">⚠️ Nenhum item encontrado para esta categoria</span>
                    )}
                  </div>

                  <Separator />

                  {/* Grid de itens - Preview centralizado e otimizado para cada categoria */}
                  <div className="grid grid-cols-6 gap-2 max-h-[28rem] overflow-y-auto">
                      {getFilteredItems().length === 0 ? (
                        <div className="col-span-6 flex flex-col items-center justify-center py-8 text-gray-500">
                          <div className="text-4xl mb-2">📦</div>
                          <div className="text-lg font-medium">Nenhum item encontrado</div>
                          <div className="text-sm">Esta categoria pode estar vazia ou os dados ainda estão carregando</div>
                        </div>
                      ) : (
                        getFilteredItems().map(([itemId, itemData], index) => {
                        // Sistema de centralização otimizado para cada categoria
                        const isSelected = selectedItemId === itemId;
                        const isInUse = isItemInUse(itemId, selectedCategory);
                        
                        return (
                          <div
                            key={`${selectedCategory}-${itemId}-${index}`}
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
                                verticalPosition={imageVerticalPosition[selectedCategory] || 50}
                                unifiedClothingData={unifiedClothingData}
                              />
                            </div>
                            
                            {/* Botão de remoção - aparece no hover quando o item está em uso OU selecionado */}
                            {(isInUse || isSelected) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Evitar que o clique também aplique o item
                                                                    removeItem(selectedCategory);
                                }}
                                className="absolute inset-0 z-20 bg-gray-500 bg-opacity-80 hover:bg-opacity-90 rounded flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                                title={isInUse ? "Remover peça do avatar" : "Remover peça selecionada"}
                              >
                                <span className="text-2xl text-white font-bold">×</span>
                              </button>
                            )}
                            
                            {/* Badges de raridade e propriedades - usando imagens específicas com prioridade oficial */}
                            <div className="absolute top-1 right-1 z-10">
                              {/* 1. NFT - Prioridade máxima */}
                              {itemData.isNFT && (
                                <img 
                                  src="/assets/icon_wardrobe_nft_on.png" 
                                  alt="NFT" 
                                  className="w-4 h-4 object-contain"
                                  title="Item NFT"
                                />
                              )}
                              
                              {/* 2. LTD - Segunda prioridade */}
                              {itemData.isLTD && !itemData.isNFT && (
                                <img 
                                  src="/assets/icon_LTD_habbo.png" 
                                  alt="LTD" 
                                  className="w-4 h-4 object-contain"
                                  title="Item Limited"
                                />
                              )}
                              
                              {/* 3. RARO - Terceira prioridade */}
                              {itemData.isRare && !itemData.isLTD && !itemData.isNFT && (
                                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">R</span>
                                </div>
                              )}
                              
                              {/* 4. HC - Quarta prioridade */}
                              {itemData.isHC && !itemData.isRare && !itemData.isLTD && !itemData.isNFT && (
                                <img 
                                  src="/assets/icon_HC_wardrobe.png" 
                                  alt="HC" 
                                  className="w-4 h-4 object-contain"
                                  title="Item Habbo Club"
                                />
                              )}
                              
                              {/* 5. VENDÁVEL - Quinta prioridade */}
                              {itemData.isSellable && !itemData.isHC && !itemData.isRare && !itemData.isLTD && !itemData.isNFT && (
                                <img 
                                  src="/assets/icon_sellable_wardrobe.png" 
                                  alt="Vendável" 
                                  className="w-4 h-4 object-contain"
                                  title="Item Vendável"
                                />
                              )}
                              
                              {/* 6. NORMAL - Sem badge (itens permanentes do guarda-roupa) */}
                              {/* Itens normais não recebem badge, são os permanentes do guarda-roupa */}
                            </div>
                            
                            {/* Badges funcionais - APENAS para itens especiais (não normais) */}
                            {!itemData.isNormal && (
                              <>
                                {/* Badge duotone - apenas para itens especiais */}
                            {itemData.isDuotone && (
                              <div className="absolute top-1 left-1 z-10">
                                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">2</span>
                                </div>
                              </div>
                            )}
                            
                                {/* Badges de propriedades - apenas para itens especiais */}
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
                              </>
                            )}
                          </div>
                        );
                      })
                      )}
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
                  {/* Cores baseadas no sistema oficial do Habbo */}
                  {(() => {
                    const colors = getHabboColorsForCategory(selectedCategory);
                    
                    return (
                      <>
                        {/* Cores Gratuitas */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Cores Gratuitas ({colors.filter(c => !c.isHC).length})
                          </h4>
                          <div className="grid grid-cols-4 gap-2">
                            {colors.filter(c => !c.isHC).map((color) => (
                              <div
                                key={`free-${color.id}`}
                        className={`relative w-8 h-8 rounded border-2 cursor-pointer transition-all hover:scale-110 ${
                                  primaryColor === color.id 
                            ? 'border-blue-500 ring-2 ring-blue-300' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                                style={{ backgroundColor: color.hex }}
                                onClick={() => setPrimaryColor(color.id)}
                                title={`${color.name} - ${color.hex}`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Cores Club */}
                        {colors.filter(c => c.isHC).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Cores Club ({colors.filter(c => c.isHC).length})
                            </h4>
                            <div className="grid grid-cols-4 gap-2">
                              {colors.filter(c => c.isHC).map((color) => (
                                <div
                                  key={`club-${color.id}`}
                                  className={`relative w-8 h-8 rounded border-2 cursor-pointer transition-all hover:scale-110 ${
                                    primaryColor === color.id 
                                      ? 'border-blue-500 ring-2 ring-blue-300' 
                                      : 'border-yellow-400 hover:border-yellow-500'
                                  }`}
                                  style={{ backgroundColor: color.hex }}
                                  onClick={() => setPrimaryColor(color.id)}
                                  title={`${color.name} - ${color.hex}`}
                      >
                        {/* Badge HC para cores do Habbo Club */}
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">HC</span>
                          </div>
                      </div>
                    ))}
                  </div>
                          </div>
                        )}
                  
                  {/* Informação sobre a paleta atual */}
                  <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                          {['hd', 'fc'].includes(selectedCategory) && 'Paleta 1: Cores para pele/rosto (65 cores: 11 gratuitas + 54 HC)'}
                          {selectedCategory === 'hr' && 'Paleta 2: Cores para cabelo (61 cores: 16 gratuitas + 45 HC)'}
                          {!['hd', 'fc', 'hr'].includes(selectedCategory) && 'Paleta 3: Cores para roupas e acessórios (95 cores: 20 gratuitas + 75 HC)'}
                  </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Configurador de Posição Vertical das Imagens */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">⚙️</span>
                  Configuração de Posição das Imagens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Ajuste a posição vertical das imagens para cada categoria. Isso controla qual parte da imagem será exibida no grid.
        </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Posição Vertical - {CATEGORIES.find(cat => cat.id === selectedCategory)?.name || selectedCategory}
                  </Label>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={imageVerticalPosition[selectedCategory] || 50}
                        onChange={(e) => {
                          const newPosition = parseInt(e.target.value);
                          setImageVerticalPosition(prev => ({
                            ...prev,
                            [selectedCategory]: newPosition
                          }));
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${imageVerticalPosition[selectedCategory] || 50}%, #e5e7eb ${imageVerticalPosition[selectedCategory] || 50}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                    
                    <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded min-w-[3rem] text-center">
                      {imageVerticalPosition[selectedCategory] || 50}%
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>↑ Mais para cima</span>
                    <span>↓ Mais para baixo</span>
                  </div>
                </div>

                {/* Preview da posição atual */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-2">Preview da Posição:</div>
                  <div className="w-full h-16 bg-white border border-gray-200 rounded overflow-hidden relative">
                    <div 
                      className="absolute w-full h-full bg-gradient-to-b from-blue-200 to-blue-400 opacity-30"
                      style={{
                        clipPath: `polygon(0% ${100 - (imageVerticalPosition[selectedCategory] || 50)}%, 100% ${100 - (imageVerticalPosition[selectedCategory] || 50)}%, 100% 100%, 0% 100%)`
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600">
                      Posição: {imageVerticalPosition[selectedCategory] || 50}%
                    </div>
                  </div>
                </div>

                {/* Botões de reset */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageVerticalPosition(prev => ({
                        ...prev,
                        [selectedCategory]: 50
                      }));
                    }}
                  >
                    Resetar Categoria
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageVerticalPosition({
                        hd: 50,
                        hr: 30,
                        ch: 50,
                        lg: 60,
                        sh: 70,
                        ha: 20,
                        he: 25,
                        ea: 40,
                        fa: 45,
                        cp: 50,
                        cc: 50,
                        ca: 50,
                        wa: 60,
                      });
                    }}
                  >
                    Resetar Todas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditorOfficial;

// Estilos CSS para o slider personalizado
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .slider::-webkit-slider-track {
    height: 8px;
    border-radius: 4px;
  }
  
  .slider::-moz-range-track {
    height: 8px;
    border-radius: 4px;
    background: transparent;
  }
`;

// Adicionar estilos ao documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = sliderStyles;
  document.head.appendChild(styleElement);
}