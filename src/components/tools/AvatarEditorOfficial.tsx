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
import { habboOfficialService, type HabboCategory, type HabboClothingItem, type AvatarState } from '@/services/HabboOfficialService';
import { useHabboPublicAPI } from '@/hooks/useHabboPublicAPI';

// Componente para imagem com fallback
const ClothingImageWithFallback = ({ itemId, category, gender, color, alt, verticalPosition = 50 }: {
  itemId: string;
  category: string;
  gender: string;
  color: string;
  alt: string;
  verticalPosition?: number;
}) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const generateFallbackUrls = (itemId: string, category: string, gender: string, color: string) => {
    // Usar apenas a URL gerada pelo serviço oficial
    const mainUrl = habboOfficialService.generateItemThumbnailUrl(category, itemId, color);

    return [
      mainUrl,
      // Fallback com parâmetros diferentes
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${itemId}-${color}&size=m&headonly=0`,
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${itemId}-${color}&size=s`
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

// CATEGORIAS COMPLETAS - Baseadas nos dados reais do figuremap.xml e tipos encontrados
const CATEGORIES = [
  // ROSTO E CORPO
  { id: 'hd', name: 'Rosto', icon: User, image: '/assets/body.png' },
  { id: 'fc', name: 'Olhos', icon: Eye, image: '/assets/Rosto1.png' },
  { id: 'ey', name: 'Olhos', icon: Eye, image: '/assets/Rosto1.png' },

  // CABEÇA - TODAS as categorias disponíveis
  { id: 'hr', name: 'Cabelo', icon: Smile, image: '/assets/Cabelo1.png' },
  { id: 'ha', name: 'Chapéus', icon: Crown, image: '/assets/Bone1.png' },
  { id: 'he', name: 'Acess. Cabeça', icon: Star, image: '/assets/Acessorios1.png' },
  { id: 'ea', name: 'Óculos', icon: Glasses, image: '/assets/Oculos1.png' },
  { id: 'fa', name: 'Barba', icon: Meh, image: '/assets/Rosto1.png' },

  // TRONCO SUPERIOR
  { id: 'ch', name: 'Camisa', icon: Shirt, image: '/assets/Camiseta1.png' },
  { id: 'ls', name: 'Manga Esq.', icon: Shirt, image: '/assets/Camiseta1.png' },
  { id: 'rs', name: 'Manga Dir.', icon: Shirt, image: '/assets/Camiseta1.png' },
  { id: 'cc', name: 'Jaqueta', icon: ShirtIcon, image: '/assets/Casaco1.png' },
  { id: 'lc', name: 'Manga Esq. Jaq.', icon: ShirtIcon, image: '/assets/Casaco1.png' },
  { id: 'rc', name: 'Manga Dir. Jaq.', icon: ShirtIcon, image: '/assets/Casaco1.png' },
  { id: 'cp', name: 'Estampa', icon: Palette, image: '/assets/Estampa1.png' },
  { id: 'ca', name: 'Colar', icon: Heart, image: '/assets/Colar1.png' },

  // TRONCO INFERIOR / PERNAS
  { id: 'lg', name: 'Calça', icon: Maximize2, image: '/assets/Calca1.png' },
  { id: 'sh', name: 'Sapatos', icon: Minimize2, image: '/assets/Tenis.png' },
  { id: 'wa', name: 'Cinto', icon: Watch, image: '/assets/Cinto1.png' },

  // ACESSÓRIOS ESPECIAIS
  { id: 'ri', name: 'Item Direito', icon: Hand, image: '/assets/Acessorios1.png' },
  { id: 'li', name: 'Item Esquerdo', icon: Hand, image: '/assets/Acessorios1.png' },
  { id: 'fx', name: 'Efeitos', icon: Zap, image: '/assets/Acessorios1.png' },
  { id: 'sd', name: 'Sombra', icon: Circle, image: '/assets/Acessorios1.png' }
];

const AvatarEditorClean = () => {
  // Estado para dados oficiais do Habbo
  const [habboData, setHabboData] = useState<{ categories: HabboCategory[] } | null>(null);
  const [colorPalettes, setColorPalettes] = useState<Record<string, any>>({});
  const [isLoadingClothing, setIsLoadingClothing] = useState(true);
  const [clothingError, setClothingError] = useState<string | null>(null);

  // Estado do avatar - RESTAURADO com todas as propriedades
  const [currentFigure, setCurrentFigure] = useState<AvatarState & {
    gesture: string;
    actions: string[];
    item: string;
    direction: number;
    headDirection: number;
    gender: 'M' | 'F' | 'U';
    size: string;
  }>({
    hr: '100-1', // Cabelo masculino com tom de pele padrão
    hd: '180-1',  // Rosto masculino com tom de pele padrão
    ch: '210-66', // Camisa masculina com cor padrão
    lg: '270-82', // Calça masculina com cor padrão
    sh: '290-1408', // Sapatos com cor padrão
    ha: '',
    he: '',
    ea: '',
    fa: '',
    cc: '',
    cp: '',
    ca: '',
    wa: '',
    gesture: 'std',
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
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('7');


  // Estados para busca de usuários
  const [searchUsername, setSearchUsername] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('br');
  const [searchedUser, setSearchedUser] = useState<string>('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState<boolean>(false);

  // Estados para seções expandidas
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

  // Hook da API do Habbo
  const { userData, isLoading: isLoadingUser, error: userError, refreshData } = useHabboPublicAPI(searchedUser, selectedCountry);

  // Carregar dados oficiais na inicialização
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingClothing(true);
        console.log('🔄 Carregando dados oficiais do Habbo...');

        const data = await habboOfficialService.loadHabboData();

        if (data && data.categories && data.palettes) {
          setHabboData({ categories: data.categories });


          // Converter paletas para o formato esperado
          const palettes: Record<string, any> = {};
          data.palettes.forEach(palette => {
            palettes[palette.id] = palette.colors.reduce((acc: any, color) => {
              acc[color.id] = { hex: color.hex, club: color.club };
              return acc;
            }, {});
          });
          setColorPalettes(palettes);

          console.log('✅ Dados oficiais carregados com sucesso!');
          setClothingError(null);
        } else {
          throw new Error('Dados inválidos recebidos do serviço');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do Habbo:', error);
        setClothingError('Erro ao carregar dados do Habbo');
        // Usar dados mock como fallback
        setHabboData({ categories: [] });
      } finally {
        setIsLoadingClothing(false);
      }
    };

    loadData();
  }, []);

  // Fechar dropdown do país ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.country-dropdown')) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Obter categorias disponíveis (com itens) - TODAS as categorias que têm dados
  const availableCategories = habboData && habboData.categories
    ? habboData.categories
        .filter(cat => cat.items.length > 0)
        .map(cat => {
          // Mapear para o formato esperado pelo componente
          const categoryDef = CATEGORIES.find(c => c.id === cat.id);
          return {
            id: cat.id,
            name: categoryDef?.name || cat.displayName || cat.id.toUpperCase(),
            icon: categoryDef?.icon || Shirt, // ícone padrão
            image: categoryDef?.image
          };
        })
    : [];

  // Definir categoria inicial baseada nas disponíveis
  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.find(cat => cat.id === selectedCategory)) {
      setSelectedCategory(availableCategories[0].id);
    }
  }, [habboData, availableCategories, selectedCategory]);

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

  // Função para trocar seções expandidas
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Funções usando o novo serviço oficial
  const getItemsByCategory = (categoryId: string): HabboClothingItem[] => {
    if (!habboData || !habboData.categories) {
      console.log(`⚠️ [getItemsByCategory] Dados não carregados ainda para categoria ${categoryId}`);
      return [];
    }

    const category = habboData.categories.find(cat => cat.id === categoryId);
    if (!category) {
      console.log(`⚠️ [getItemsByCategory] Categoria ${categoryId} não encontrada`);
      return [];
    }

    console.log(`✅ [getItemsByCategory] Categoria ${categoryId}: ${category.items.length} itens encontrados`);

    // Aplicar filtros de gênero e pesquisa
    let filteredItems = category.items.filter(item => {
      // Filtro de gênero
      const genderMatch = item.gender === selectedGender || item.gender === 'U';
      if (!genderMatch) return false;


      // Filtro de pesquisa por nome
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        // Procurar no nome do item (se disponível) ou ID
        const itemName = item.id.toLowerCase();
        if (!itemName.includes(searchLower)) return false;
      }

      return true;
    });

    console.log(`🔍 [getItemsByCategory] Após filtros: ${filteredItems.length} itens`);
    return filteredItems;
  };

  // Obter itens filtrados
  const getFilteredItems = () => {
    if (!habboData || !habboData.categories) return [];

    try {
      // Usar dados oficiais carregados localmente
      let items: HabboClothingItem[] = [];

      if (habboData && habboData.categories && habboData.categories[selectedCategory]) {
        items = habboData.categories[selectedCategory].filter(item =>
          item.gender === 'U' || item.gender === selectedGender
        );
      } else {
        // Fallback para o serviço oficial
        items = habboOfficialService.getItemsByGender(selectedCategory, selectedGender) || [];
      }

      // Garantir que items seja um array
      if (!Array.isArray(items)) {
        console.warn('Items não é um array:', items);
        return [];
      }

      // Aplicar filtros adicionais
      let filtered = items.filter(item => {
        if (!item || !item.figureId) return false;

        if (searchTerm && !item.figureId.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        return true;
      });

      return filtered.map(item => [`${selectedCategory}-${item.figureId}`, item]);
    } catch (error) {
      console.error('Erro ao filtrar itens:', error);
      return [];
    }
  };

  // Função específica para agrupar sapatos por categoria (nonhc, hc, sell, nft)
  const getGroupedShoes = () => {
    if (selectedCategory !== 'sh') return null;

    const allShoes = getFilteredItems();
    const grouped = {
      nonhc: [] as any[], // Itens normais (não HC)
      hc: [] as any[],    // Itens do Habbo Club
      sell: [] as any[],  // Itens vendáveis
      nft: [] as any[]    // NFTs (por enquanto vazio)
    };

    // IDs específicos baseados nos dados oficiais do HabboNews
    const shoeIds = {
      masculine: {
        nonhc: ['290', '295', '300', '305', '905', '906', '908', '3068', '3115'],
        hc: ['3016', '3027', '3035', '3089', '3154', '3206', '3252', '3275'],
        sell: ['3338', '3348', '3354', '3375', '3383', '3419', '3435', '3467', '3524', '3587', '3595', '3611', '3619', '3621', '3687', '3693', '3719', '3720', '3783', '4016', '4030', '4064', '4065', '4112', '4159']
      },
      feminine: {
        nonhc: ['725', '730', '735', '740', '905', '906', '907', '908', '3068', '3115'],
        hc: ['3016', '3027', '3035', '3064', '3089', '3154', '3180', '3184', '3206', '3252', '3275', '3277'],
        sell: ['3338', '3348', '3354', '3375', '3383', '3419', '3435', '3467', '3524', '3587', '3595', '3611', '3619', '3621', '3687', '3693', '3719', '3720', '3783', '4016', '4030', '4064', '4065', '4112', '4159']
      }
    };

    const genderKey = selectedGender === 'F' ? 'feminine' : 'masculine';
    const shoeData = shoeIds[genderKey];

    // Agrupar itens
    allShoes.forEach(([itemId, itemData]) => {
      const figureId = itemData.figureId;

      if (shoeData.nonhc.includes(figureId)) {
        grouped.nonhc.push([itemId, itemData]);
      } else if (shoeData.hc.includes(figureId)) {
        grouped.hc.push([itemId, itemData]);
      } else if (shoeData.sell.includes(figureId)) {
        grouped.sell.push([itemId, itemData]);
      } else {
        // Se não estiver em nenhuma categoria específica, adicionar aos normais
        // Isso garante que todos os sapatos sejam exibidos
        grouped.nonhc.push([itemId, itemData]);
      }
      // nft permanece vazio por enquanto
    });

    return grouped;
  };

  // Gerar URL do avatar - Formato exato do editor
  const generateAvatarUrl = () => {
    // Usar o serviço oficial, mas garantir compatibilidade com todas as propriedades
    return habboOfficialService.generateAvatarUrl(currentFigure);
  };

  // Aplicar item ao avatar
  const applyItem = (itemId: string, colorId?: string) => {
    const color = colorId || '7'; // Usar cor padrão 7
    // Extrair o figureId real do itemId (formato: category-figureId)
    const actualFigureId = itemId.includes('-') ? itemId.split('-').slice(1).join('-') : itemId;

    setSelectedItemId(itemId);
    setPrimaryColor(color);

    setCurrentFigure(prev => ({
      ...prev,
      [selectedCategory]: `${actualFigureId}-${color}`,
      gender: selectedGender // Garantir que o gênero seja atualizado
    }));
  };

  // Remover item do avatar (voltar para padrão)
  const removeItem = (category: string) => {
    setCurrentFigure(prev => {
      const newFigure = { ...prev };

      // Definir valores padrão baseados no gênero
      if (category === 'hr') {
        newFigure.hr = selectedGender === 'M' ? '100-40' : '500-40';
      } else if (category === 'hd') {
        newFigure.hd = selectedGender === 'M' ? '180-1' : '600-1';
      } else if (category === 'ch') {
        newFigure.ch = selectedGender === 'M' ? '210-66' : '710-66';
      } else if (category === 'lg') {
        newFigure.lg = selectedGender === 'M' ? '270-82' : '870-82';
      } else if (category === 'sh') {
        newFigure.sh = '290-1408';
      } else {
        // Para outras categorias (acessórios), remover completamente
        delete (newFigure as any)[category];
      }

      return newFigure;
    });

    // Limpar seleção se o item removido era o selecionado
    if (selectedCategory === category) {
      setSelectedItemId(null);
    }
  };

  // Função para trocar gênero e sincronizar com o avatar
  const handleGenderChange = (newGender: 'M' | 'F') => {
    setSelectedGender(newGender);

    // Atualizar o gênero do avatar atual com corpo correto
    setCurrentFigure(prev => {
      const newFigure = { ...prev, gender: newGender };

      // Atualizar partes do corpo base para o gênero correto
      if (newGender === 'F') {
        // Corpo feminino: cabelo, rosto, camisa, calça femininos
        newFigure.hr = '500-40';  // Cabelo feminino
        newFigure.hd = '600-1';   // Rosto feminino
        newFigure.ch = '710-66'; // Camisa feminina
        newFigure.lg = '870-82'; // Calça feminina
      } else {
        // Corpo masculino: cabelo, rosto, camisa, calça masculinos
        newFigure.hr = '100-40';  // Cabelo masculino
        newFigure.hd = '180-1';   // Rosto masculino
        newFigure.ch = '210-66'; // Camisa masculina
        newFigure.lg = '270-82'; // Calça masculina
      }

      return newFigure;
    });

    // Se há um item selecionado, reaplicar com o novo gênero
    if (selectedItemId) {
      applyItem(selectedItemId, primaryColor);
    }
  };

  // Verificar se um item está sendo usado no avatar atual
  const isItemInUse = (itemId: string, category: string) => {
    const currentItemValue = currentFigure[category as keyof typeof currentFigure];
    if (!currentItemValue || typeof currentItemValue !== 'string') return false;

    // Extrair o ID do item da string (formato: "itemId-color-")
    const currentItemId = currentItemValue.split('-')[0];
    return currentItemId === itemId;
  };

  // Mostrar loading enquanto carrega dados
  if (isLoadingClothing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="volter-font text-4xl font-bold text-[#8B4513] mb-2">
            🎨 Editor de Avatar
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
            <p className="text-lg text-gray-600">Carregando dados oficiais do Habbo...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (clothingError) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="volter-font text-4xl font-bold text-[#8B4513] mb-2">
            🎨 Editor de Avatar
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{clothingError}</p>
            <p className="text-sm text-red-600 mt-2">Tentando usar dados de fallback...</p>
          </div>
        </div>
      </div>
    );
  }

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

                {/* Campo de busca com seletor de país */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

                  {/* Seletor de bandeira - apenas uma bandeira visível com dropdown */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 country-dropdown">
                    <div className="relative">
                      <button
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 transition-colors"
                        title={`Habbo ${selectedCountry.toUpperCase()}`}
                      >
                        <img
                          src={`/flags/${selectedCountry === 'us' ? 'flagcom' : selectedCountry === 'br' ? 'flagbrazil' : selectedCountry === 'de' ? 'flagdeus' : selectedCountry === 'es' ? 'flagspain' : selectedCountry === 'fr' ? 'flagfrance' : selectedCountry === 'it' ? 'flagitaly' : selectedCountry === 'nl' ? 'flagnetl' : selectedCountry === 'tr' ? 'flagtrky' : 'flagcom'}.png`}
                          alt={selectedCountry.toUpperCase()}
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <ChevronDown className="w-3 h-3 text-gray-500" />
                      </button>

                      {/* Dropdown com todas as bandeiras */}
                      {isCountryDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                          <div className="p-2">
                            <div className="text-xs text-gray-500 mb-2 font-medium">Selecione o servidor:</div>
                            <div className="grid grid-cols-3 gap-1">
                              {Object.entries(countryAPIs).map(([country, url]) => (
                                <button
                                  key={country}
                                  onClick={() => {
                                    setSelectedCountry(country);
                                    setIsCountryDropdownOpen(false);
                                  }}
                                  className={`flex items-center gap-1 px-2 py-1.5 rounded transition-colors text-xs ${
                                    selectedCountry === country
                                      ? 'bg-blue-50 border border-blue-200'
                                      : 'hover:bg-gray-50 border border-transparent'
                                  }`}
                                  title={`Habbo ${country.toUpperCase()}`}
                                >
                                  <img
                                    src={`/flags/${country === 'us' ? 'flagcom' : country === 'br' ? 'flagbrazil' : country === 'de' ? 'flagdeus' : country === 'es' ? 'flagspain' : country === 'fr' ? 'flagfrance' : country === 'it' ? 'flagitaly' : country === 'nl' ? 'flagnetl' : country === 'tr' ? 'flagtrky' : 'flagcom'}.png`}
                                    alt={country.toUpperCase()}
                                    className="flex-shrink-0"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                  <span className="text-gray-700 font-medium text-xs">
                                    {country.toUpperCase()}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Input
                    type="text"
                    placeholder="Buscar Habbo"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                    className="pl-10 pr-20"
                  />
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
                <Label>Expressões</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'std', name: 'Normal' },
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
                  {/* Categorias - Com imagens originais (filtradas por disponibilidade) */}
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                          className="w-12 h-12 p-0 flex items-center justify-center bg-transparent hover:bg-gray-100"
                          title={category.name}
                        >
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-8 h-8 object-contain"
                              style={{ imageRendering: 'pixelated', filter: 'none' }}
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
                          ) : (
                            <IconComponent className="w-5 h-5" />
                          )}
                          <div className="fallback-icon hidden">
                            <IconComponent className="w-5 h-5" />
                          </div>
                        </Button>
                      );
                    })}
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


                    {/* Campo de busca */}
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Buscar item..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-32 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {CATEGORIES.find(c => c.id === selectedCategory)?.name} -
                    {selectedCategory === 'sh' ? (() => {
                      const grouped = getGroupedShoes();
                      return grouped ? (grouped.nonhc.length + grouped.hc.length + grouped.sell.length + grouped.nft.length) : 0;
                    })() : getFilteredItems().length} itens ({selectedGender === 'M' ? 'Masculino' : 'Feminino'})
                  </div>

                  <Separator />

                  {/* Grid de itens - Preview centralizado e otimizado para cada categoria */}
                  <div className="max-h-[28rem] overflow-y-auto space-y-4">
                    {selectedCategory === 'sh' ? (
                      // Renderização especial para sapatos com seções organizadas
                      (() => {
                        const groupedShoes = getGroupedShoes();
                        if (!groupedShoes) return null;

                        const renderShoeSection = (sectionId: string, title: string, items: any[], isSelectedItem?: string) => {
                          if (items.length === 0) return null;

                          return (
                            <div key={sectionId} className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                {title}
                                <span className="text-xs text-gray-500">({items.length})</span>
                              </h4>
                              <div className="grid grid-cols-6 gap-2">
                                {items.map(([itemId, itemData], index) => {
                                  const isSelected = selectedItemId === itemId;
                                  const isInUse = isItemInUse(itemId, selectedCategory);
                                  const defaultColor = '1408'; // Cor padrão para sapatos
                                  const verticalPosition = 70; // Posição para sapatos

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
                                          itemId={itemData.figureId}
                                          category={selectedCategory}
                                          gender={selectedGender}
                                          color={defaultColor}
                                          alt={`${selectedCategory} ${itemData.figureId}`}
                                          verticalPosition={verticalPosition}
                                        />
                                      </div>

                                      {/* Botão de remoção */}
                                      {(isInUse || isSelected) && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeItem(selectedCategory);
                                          }}
                                          className="absolute inset-0 z-20 bg-gray-500 bg-opacity-80 hover:bg-opacity-90 rounded flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                                          title={isInUse ? "Remover peça do avatar" : "Remover peça selecionada"}
                                        >
                                          <span className="text-2xl text-white font-bold">×</span>
                                        </button>
                                      )}

                                      {/* Badges */}
                                      <div className="absolute top-1 right-1 z-10">
                                        {itemData.club === '2' && (
                                          <img
                                            src="/assets/icon_HC_wardrobe.png"
                                            alt="HC"
                                            className="w-4 h-4 object-contain"
                                            title="Item Habbo Club"
                                          />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        };

                        // Se não há sapatos agrupados, mostrar todos disponíveis
                        const totalGrouped = groupedShoes.nonhc.length + groupedShoes.hc.length + groupedShoes.sell.length;
                        if (totalGrouped === 0) {
                          // Fallback: mostrar todos os sapatos disponíveis sem agrupamento
                          return (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                👟 Todos os Sapatos Disponíveis
                                <span className="text-xs text-gray-500">({allShoes.length})</span>
                              </h4>
                              <div className="grid grid-cols-6 gap-2">
                                {allShoes.map(([itemId, itemData], index) => {
                                  const isSelected = selectedItemId === itemId;
                                  const isInUse = isItemInUse(itemId, selectedCategory);
                                  const defaultColor = '1408';
                                  const verticalPosition = 70;

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
                                          itemId={itemData.figureId}
                                          category={selectedCategory}
                                          gender={selectedGender}
                                          color={defaultColor}
                                          alt={`${selectedCategory} ${itemData.figureId}`}
                                          verticalPosition={verticalPosition}
                                        />
                                      </div>

                                      {/* Botão de remoção */}
                                      {(isInUse || isSelected) && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeItem(selectedCategory);
                                          }}
                                          className="absolute inset-0 z-20 bg-gray-500 bg-opacity-80 hover:bg-opacity-90 rounded flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                                          title={isInUse ? "Remover peça do avatar" : "Remover peça selecionada"}
                                        >
                                          <span className="text-2xl text-white font-bold">×</span>
                                        </button>
                                      )}

                                      {/* Badges */}
                                      <div className="absolute top-1 right-1 z-10">
                                        {itemData.club === '2' && (
                                          <img
                                            src="/assets/icon_HC_wardrobe.png"
                                            alt="HC"
                                            className="w-4 h-4 object-contain"
                                            title="Item Habbo Club"
                                          />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <>
                            {renderShoeSection('nonhc', '👟 Itens Normais', groupedShoes.nonhc)}
                            {renderShoeSection('hc', '⭐ Habbo Club', groupedShoes.hc)}
                            {renderShoeSection('sell', '🛒 Vendáveis', groupedShoes.sell)}
                            {groupedShoes.nft.length > 0 && renderShoeSection('nft', '💎 NFTs', groupedShoes.nft)}
                          </>
                        );
                      })()
                    ) : (
                      // Renderização padrão para outras categorias
                      <div className="grid grid-cols-6 gap-2">
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

                          // Cor padrão para preview do item no grid - baseada na categoria
                          const getDefaultColorForCategory = (category: string): string => {
                            switch (category) {
                              case 'hr': return '1408'; // Cabelos - cinza neutro da paleta 3
                              case 'hd': return '1';    // Rostos - cor de pele do habbohub
                              case 'ch': case 'lg': return '66'; // Roupas - azul da paleta 3
                              case 'sh': return '1408'; // Sapatos - cinza neutro
                              default: return '7';      // Cor padrão genérica
                            }
                          };

                          const defaultColor = getDefaultColorForCategory(selectedCategory);

                          // Posição vertical otimizada por categoria para melhor visualização
                          const getVerticalPositionForCategory = (category: string): number => {
                            switch (category) {
                              case 'hr': return 30;  // Cabelos - mais para cima
                              case 'ha': return 20;  // Chapéus - mais para cima
                              case 'he': return 25;  // Acessórios de cabeça - mais para cima
                              case 'ea': return 40;  // Óculos - centro-alto
                              case 'fa': return 45;  // Barba - centro-alto
                              case 'sh': return 70;  // Sapatos - mais para baixo
                              case 'lg': return 60;  // Calças - mais para baixo
                              default: return 50;    // Centro por padrão
                            }
                          };

                          const verticalPosition = getVerticalPositionForCategory(selectedCategory);

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
                                  itemId={itemData.figureId}
                                  category={selectedCategory}
                                  gender={selectedGender}
                                  color={defaultColor}
                                  alt={`${selectedCategory} ${itemData.figureId}`}
                                  verticalPosition={verticalPosition}
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

                              {/* Badges de raridade */}
                              <div className="absolute top-1 right-1 z-10">
                                {/* HC Badge */}
                                {itemData.club === '2' && (
                                  <img
                                    src="/assets/icon_HC_wardrobe.png"
                                    alt="HC"
                                    className="w-4 h-4 object-contain"
                                    title="Item Habbo Club"
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })
                        )}
                      </div>
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
                  {/* Cores baseadas no item selecionado */}
                  {(() => {
                    // Obtém o item selecionado atual
                    const currentItem = getFilteredItems().find(([itemId]) => itemId === selectedItemId);
                    const itemData = currentItem ? currentItem[1] : null;

                    // Se temos um item selecionado, mostra apenas as cores válidas para ele
                    if (itemData && itemData.colorable === '1') {
                      const validColors = habboOfficialService.getColorsForItem(itemData);
                      const palette = habboOfficialService.getPaletteForCategory(selectedCategory);

                      return (
                        <>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Cores para {itemData.figureId}
                            </h4>
                            <div className="grid grid-cols-4 gap-2">
                              {palette && validColors.length > 0 ? (
                                palette.colors
                                  .filter(color => validColors.includes(color.id))
                                  .map(colorData => (
                                    <div
                                      key={`color-${colorData.id}`}
                                      className={`relative w-8 h-8 rounded border-2 cursor-pointer transition-all hover:scale-110 ${
                                        primaryColor === colorData.id
                                          ? 'border-blue-500 ring-2 ring-blue-300'
                                          : 'border-gray-300 hover:border-gray-400'
                                      }`}
                                      style={{ backgroundColor: colorData.hex }}
                                      onClick={() => setPrimaryColor(colorData.id)}
                                      title={`Cor ${colorData.id}`}
                                    />
                                  ))
                              ) : (
                                <div className="col-span-4 text-center text-gray-500 text-sm">
                                  Nenhuma cor disponível para este item
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    } else {
                      // Fallback: mostra todas as cores da categoria usando as paletas carregadas
                      // Mapear categoria para ID da paleta
                      const getPaletteIdForCategory = (category: string): string => {
                        if (category === 'hd') return '1'; // Cabeça usa paleta 1
                        return '3'; // Cabelo e roupas usam paleta 3
                      };

                      const paletteId = getPaletteIdForCategory(selectedCategory);
                      const paletteColors = colorPalettes[paletteId];

                      return (
                        <>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Cores Disponíveis
                            </h4>
                            <div className="grid grid-cols-4 gap-2">
                              {paletteColors && Object.keys(paletteColors).length > 0 ? Object.entries(paletteColors).map(([colorId, colorData]: [string, any]) => (
                                <div
                                  key={`color-${colorId}`}
                                  className={`relative w-8 h-8 rounded border-2 cursor-pointer transition-all hover:scale-110 ${
                                    primaryColor === colorId
                                      ? 'border-blue-500 ring-2 ring-blue-300'
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                  style={{ backgroundColor: colorData.hex }}
                                  onClick={() => setPrimaryColor(colorId)}
                                  title={`Cor ${colorId}`}
                                />
                              )) : (
                                <div className="col-span-4 text-center text-gray-500 text-sm">
                                  Nenhuma cor disponível
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    }
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
                  <img src="/assets/settings.gif" alt="⚙️" className="w-6 h-6" style={{ imageRendering: 'pixelated' }} />
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

export default AvatarEditorClean;