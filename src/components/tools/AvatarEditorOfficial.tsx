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
import { habboOfficialService, type HabboCategory, type HabboClothingItem, type AvatarState } from '@/services/habboOfficialService';
import { useHabboPublicAPI } from '@/hooks/useHabboPublicAPI';
import { toast } from 'sonner';

// Componente para imagem com fallback
const ClothingImageWithFallback = ({ itemId, category, gender, color, alt, verticalPosition = 50, direction = 2, headDirection = 2 }: {
  itemId: string;
  category: string;
  gender: string;
  color: string;
  alt: string;
  verticalPosition?: number;
  direction?: number;
  headDirection?: number;
}) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const generateFallbackUrls = (itemId: string, category: string, gender: string, color: string, dir: number, headDir: number) => {
    // Usar apenas a URL gerada pelo serviço oficial (passando o gênero)
    const baseUrl = habboOfficialService.generateItemThumbnailUrl(category, itemId, color, gender as 'M' | 'F' | 'U');
    
    // Adicionar ou substituir direction e head_direction na URL base
    let urlWithDirection = baseUrl;
    if (urlWithDirection.includes('direction=')) {
      // Substituir direction existente
      urlWithDirection = urlWithDirection.replace(/direction=\d+/g, `direction=${dir}`);
    } else {
      // Adicionar direction
      urlWithDirection += urlWithDirection.includes('?') ? `&direction=${dir}` : `?direction=${dir}`;
    }
    
    if (urlWithDirection.includes('head_direction=')) {
      // Substituir head_direction existente
      urlWithDirection = urlWithDirection.replace(/head_direction=\d+/g, `head_direction=${headDir}`);
    } else {
      // Adicionar head_direction
      urlWithDirection += `&head_direction=${headDir}`;
    }

    return [
      urlWithDirection,
      // Fallback com parâmetros diferentes
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${itemId}-${color}&gender=${gender}&size=m&headonly=0&direction=${dir}&head_direction=${headDir}`,
      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${itemId}-${color}&gender=${gender}&size=s&direction=${dir}&head_direction=${headDir}`
    ].filter(Boolean);
  };

  const urls = generateFallbackUrls(itemId, category, gender, color, direction, headDirection);
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

// Helper para verificar se itemData é HabboClothingItem
const isHabboClothingItem = (item: any): item is HabboClothingItem => {
  return item && typeof item === 'object' && 'figureId' in item;
};

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
    sh: '290-80', // Sapatos com cor padrão para duotone
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
  const [primaryColor, setPrimaryColor] = useState<string>('1314'); // Branco (#FFFFFF) como padrão
  const [secondaryColor, setSecondaryColor] = useState<string>('7');


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
    he: -50,   // Acessórios de cabeça/Emojis - muito mais para cima (valores negativos permitem exibir acima)
    ea: 40,    // Óculos - centro-alto
    fa: 45,    // Acessórios faciais - centro-alto
    cp: 50,    // Estampas - centro
    cc: 50,    // Casacos/Vestidos - centro
    ca: 50,    // Joias - centro
    wa: 60,    // Cintos - mais para baixo
  });

  // Estado para controlar direção individual de itens (por categoria e itemId)
  // direction e headDirection são números de 0 a 7 (8 direções do Habbo)
  const [itemDirections, setItemDirections] = useState<Record<string, Record<string, { direction: number; headDirection: number }>>>({});

  // Estado para controlar posição vertical individual de itens (por categoria e itemId)
  const [itemVerticalPositions, setItemVerticalPositions] = useState<Record<string, Record<string, number>>>({});

  // Helper para normalizar itemId (garantir que está no formato correto)
  const normalizeItemId = (itemId: string): string => {
    // Se já está no formato "category-figureId", retornar como está
    // Caso contrário, assumir que é apenas o figureId e adicionar a categoria
    if (itemId.includes('-') && itemId.split('-').length >= 2) {
      return itemId;
    }
    return itemId; // Retornar como está se não conseguir normalizar
  };

  // Função para obter direção de um item específico
  const getItemDirection = (category: string, itemId: string): { direction: number; headDirection: number } => {
    const normalizedId = normalizeItemId(itemId);
    return itemDirections[category]?.[normalizedId] || { direction: 2, headDirection: 2 };
  };

  // Função para definir direção de um item específico
  const setItemDirection = (category: string, itemId: string, direction: number, headDirection: number) => {
    const normalizedId = normalizeItemId(itemId);
    setItemDirections(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [normalizedId]: { direction, headDirection }
      }
    }));
  };


  // Função para obter posição vertical de um item específico
  const getItemVerticalPosition = (category: string, itemId: string): number | null => {
    const normalizedId = normalizeItemId(itemId);
    return itemVerticalPositions[category]?.[normalizedId] ?? null;
  };

  // Função para definir posição vertical de um item específico
  const setItemVerticalPosition = (category: string, itemId: string, position: number) => {
    const normalizedId = normalizeItemId(itemId);
    setItemVerticalPositions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [normalizedId]: position
      }
    }));
  };


  // Carregar configurações salvas ao montar o componente
  useEffect(() => {
    const savedConfig = localStorage.getItem('avatarEditorGridConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.positions) {
          setImageVerticalPosition(prev => ({ ...prev, ...config.positions }));
        }
        if (config.itemPositions) {
          setItemVerticalPositions(config.itemPositions);
        }
        if (config.directions) {
          setItemDirections(config.directions);
        } else if (config.rotations) {
          // Compatibilidade com versão antiga que usava rotações
          setItemDirections({});
        }
      } catch (error) {
        console.error('Erro ao carregar configurações salvas:', error);
      }
    }
  }, []);

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
      sell: [] as any[],  // Itens vendáveis (por enquanto vazio)
      nft: [] as any[]    // NFTs (por enquanto vazio)
    };

    // Agrupar dinamicamente baseado nas propriedades dos itens do JSON
    allShoes.forEach(([itemId, itemData]) => {
      // Verificar se itemData é um objeto HabboClothingItem
      if (!isHabboClothingItem(itemData)) return; // Pular se não for HabboClothingItem
      
      const club = itemData.club || '0';

      // Agrupar por club: '2' = HC, outros = nonhc
      if (club === '2') {
        grouped.hc.push([itemId, itemData]);
      } else {
        grouped.nonhc.push([itemId, itemData]);
      }
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
        newFigure.sh = '290-80';
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
        // Corpo feminino: cabelo padrão (hr-9534-1408), rosto, camisa, calça femininos
        newFigure.hr = '9534-1408';  // Cabelo feminino padrão
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
                      
                      // Contar itens para esta categoria
                      const getItemCount = (catId: string): number => {
                        try {
                          if (catId === 'sh') {
                            const grouped = getGroupedShoes();
                            return grouped ? (grouped.nonhc.length + grouped.hc.length + grouped.sell.length + grouped.nft.length) : 0;
                          }
                          
                          let items: any[] = [];
                          if (habboData && habboData.categories && habboData.categories[catId]) {
                            items = habboData.categories[catId].filter(item =>
                              item.gender === 'U' || item.gender === selectedGender
                            );
                          } else {
                            items = habboOfficialService.getItemsByGender(catId, selectedGender) || [];
                          }
                          
                          // Aplicar filtro de busca se houver
                          if (searchTerm) {
                            const term = searchTerm.toLowerCase();
                            items = items.filter(item => {
                              const figureId = item.figureId?.toString().toLowerCase() || '';
                              const id = item.id?.toString().toLowerCase() || '';
                              return figureId.includes(term) || id.includes(term);
                            });
                          }
                          
                          return items.length;
                        } catch (error) {
                          return 0;
                        }
                      };
                      
                      const itemCount = getItemCount(category.id);
                      
                      return (
                        <div key={category.id} className="relative">
                          <Button
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
                        </div>
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
                                  // Verificar se itemData é um objeto HabboClothingItem
                                  if (!isHabboClothingItem(itemData)) return null;
                                  
                                  // itemId é sempre string
                                  const itemIdStr = String(itemId);
                                  const isSelected = selectedItemId === itemIdStr;
                                  const isInUse = isItemInUse(itemIdStr, selectedCategory);
                                  // Usar primaryColor se o item for colorável, senão usar cor padrão
                                  const itemColor = (itemData.colorable === '1') ? primaryColor : (selectedCategory === 'sh' ? '80' : '1314');
                                  // Usar posição individual do item, ou da categoria, ou padrão
                                  const itemVerticalPos = getItemVerticalPosition(selectedCategory, itemIdStr);
                                  const categoryVerticalPos = imageVerticalPosition[selectedCategory] ?? 70;
                                  const verticalPosition = itemVerticalPos ?? categoryVerticalPos;
                                  const itemDirection = getItemDirection(selectedCategory, itemIdStr);

                                  return (
                                    <div
                                      key={`${selectedCategory}-${itemId}-${index}`}
                                      className={`relative group cursor-pointer transition-all duration-200 ${
                                        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'
                                      }`}
                                    >
                                      <div 
                                        className="w-full h-20 cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 rounded bg-white overflow-hidden"
                                        onClick={() => applyItem(itemIdStr, primaryColor)}
                                      >
                                        <ClothingImageWithFallback
                                          itemId={itemData.figureId}
                                          category={selectedCategory}
                                          gender={selectedGender}
                                          color={itemColor}
                                          alt={`${selectedCategory} ${itemData.figureId}`}
                                          verticalPosition={verticalPosition}
                                          direction={itemDirection.direction}
                                          headDirection={itemDirection.headDirection}
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
                          const allShoes = getFilteredItems();
                          return (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                👟 Todos os Sapatos Disponíveis
                                <span className="text-xs text-gray-500">({allShoes.length})</span>
                              </h4>
                              <div className="grid grid-cols-6 gap-2">
                                {allShoes.map(([itemId, itemData], index) => {
                                  // Verificar se itemData é um objeto HabboClothingItem
                                  if (!isHabboClothingItem(itemData)) return null;
                                  
                                  // itemId é sempre string
                                  const itemIdStr = String(itemId);
                                  const isSelected = selectedItemId === itemIdStr;
                                  const isInUse = isItemInUse(itemIdStr, selectedCategory);
                                  // Usar primaryColor se o item for colorável, senão usar cor padrão
                                  const itemColor = (itemData.colorable === '1') ? primaryColor : (selectedCategory === 'sh' ? '80' : '1314');
                                  // Usar posição individual do item, ou da categoria, ou padrão
                                  const itemVerticalPos = getItemVerticalPosition(selectedCategory, itemIdStr);
                                  const categoryVerticalPos = imageVerticalPosition[selectedCategory] ?? 70;
                                  const verticalPosition = itemVerticalPos ?? categoryVerticalPos;
                                  const itemDirection = getItemDirection(selectedCategory, itemIdStr);

                                  return (
                                    <div
                                      key={`${selectedCategory}-${itemId}-${index}`}
                                      className={`relative group cursor-pointer transition-all duration-200 ${
                                        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'
                                      }`}
                                    >
                                      <div 
                                        className="w-full h-20 cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 rounded bg-white overflow-hidden"
                                        onClick={() => applyItem(itemIdStr, primaryColor)}
                                      >
                                        <ClothingImageWithFallback
                                          itemId={itemData.figureId}
                                          category={selectedCategory}
                                          gender={selectedGender}
                                          color={itemColor}
                                          alt={`${selectedCategory} ${itemData.figureId}`}
                                          verticalPosition={verticalPosition}
                                          direction={itemDirection.direction}
                                          headDirection={itemDirection.headDirection}
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
                          // Verificar se itemData é um objeto HabboClothingItem
                          if (!isHabboClothingItem(itemData)) return null;
                          
                          // itemId é sempre string
                          const itemIdStr = String(itemId);
                          
                          // Sistema de centralização otimizado para cada categoria
                          const isSelected = selectedItemId === itemIdStr;
                          const isInUse = isItemInUse(itemIdStr, selectedCategory);

                          // Cor para preview do item no grid
                          // Se o item for colorável, usa a cor selecionada (primaryColor)
                          // Caso contrário, usa cor padrão baseada na categoria
                          const getDefaultColorForCategory = (category: string): string => {
                            switch (category) {
                              case 'hr': return '92';   // Cabelos - branco (#FFFFFF) da paleta 2
                              case 'hd': return '1';    // Rostos - cor de pele do habbohub (paleta 1)
                              case 'sh': return '80';   // Sapatos - cor padrão para duotone
                              case 'cp': return '1314';  // Estampas - branco (#FFFFFF) da paleta 3
                              default: return '1314';   // Branco (#FFFFFF) da paleta 3 para todas as roupas
                            }
                          };

                          // Usar primaryColor se o item for colorável, senão usar cor padrão
                          const itemColor = (itemData.colorable === '1') ? primaryColor : getDefaultColorForCategory(selectedCategory);

                          // Posição vertical otimizada por categoria para melhor visualização
                          const getVerticalPositionForCategory = (category: string): number => {
                            switch (category) {
                              case 'hr': return 30;  // Cabelos - mais para cima
                              case 'ha': return 20;  // Chapéus - mais para cima
                              case 'he': return -50; // Acessórios de cabeça/Emojis - muito mais para cima (valores negativos)
                              case 'ea': return 40;  // Óculos - centro-alto
                              case 'fa': return 45;  // Barba - centro-alto
                              case 'sh': return 70;  // Sapatos - mais para baixo
                              case 'lg': return 60;  // Calças - mais para baixo
                              default: return 50;    // Centro por padrão
                            }
                          };

                          // Usar posição individual do item, ou da categoria, ou padrão
                          const itemVerticalPos = getItemVerticalPosition(selectedCategory, itemIdStr);
                          const categoryVerticalPos = imageVerticalPosition[selectedCategory] ?? getVerticalPositionForCategory(selectedCategory);
                          const verticalPosition = itemVerticalPos ?? categoryVerticalPos;
                          const itemDirection = getItemDirection(selectedCategory, itemIdStr);

                          return (
                            <div
                              key={`${selectedCategory}-${itemIdStr}-${index}`}
                              className={`relative group cursor-pointer transition-all duration-200 ${
                                isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'
                              }`}
                            >
                              <div 
                                className="w-full h-20 cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 rounded bg-white overflow-hidden"
                                onClick={() => applyItem(itemIdStr, primaryColor)}
                              >
                                <ClothingImageWithFallback
                                  itemId={itemData.figureId}
                                  category={selectedCategory}
                                  gender={selectedGender}
                                  color={itemColor}
                                  alt={`${selectedCategory} ${itemData.figureId}`}
                                  verticalPosition={verticalPosition}
                                  direction={itemDirection.direction}
                                  headDirection={itemDirection.headDirection}
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
                    const itemDataRaw = currentItem ? currentItem[1] : null;
                    
                    // Verificar se itemData é um objeto HabboClothingItem
                    const itemData = itemDataRaw && isHabboClothingItem(itemDataRaw) ? itemDataRaw : null;

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
                                      style={{ backgroundColor: `#${colorData.hex}` }}
                                      onClick={() => setPrimaryColor(colorData.id)}
                                      title={`Cor ${colorData.id} - #${colorData.hex}`}
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
                      // Coletar todas as cores válidas dos itens coloráveis da categoria atual
                      const colorableItems = getFilteredItems()
                        .filter(([itemId, itemData]) => 
                          isHabboClothingItem(itemData) && itemData.colorable === '1'
                        ) as [string, HabboClothingItem][];
                      
                      // Se não houver itens coloráveis, não mostrar cores
                      if (colorableItems.length === 0) {
                        return (
                          <div className="text-center text-gray-500 text-sm py-4">
                            Esta categoria não possui itens coloráveis.
                            <br />
                            As cores não alteram visualmente os itens desta categoria.
                          </div>
                        );
                      }
                      
                      // Coletar todas as cores válidas dos itens coloráveis
                      const validColorIds = new Set<string>();
                      colorableItems.forEach(([, itemData]) => {
                        const colors = habboOfficialService.getColorsForItem(itemData);
                        colors.forEach(colorId => validColorIds.add(colorId));
                      });
                      
                      // Buscar o paletteId correto dos dados da categoria usando o serviço
                      // Isso garante que cada categoria use sua paleta correta:
                      // - hd (rosto) → paleta 1 (pele)
                      // - hr (cabelo) → paleta 2 (cabelo)
                      // - ch, lg, sh, ha, he, ea, fa, ca, wa, cc, cp → paleta 3 (roupas)
                      const palette = habboOfficialService.getPaletteForCategory(selectedCategory);
                      const paletteId = palette?.id || '3'; // Fallback para paleta 3 se não encontrar
                      const paletteColors = colorPalettes[paletteId];

                      // Filtrar apenas cores válidas para os itens da categoria
                      const allColorsRaw = paletteColors 
                        ? Object.entries(paletteColors).filter(([colorId]) => validColorIds.has(colorId))
                        : [];

                      // Função para converter hex para HSL e obter hue
                      const hexToHue = (hex: string): number => {
                        // Remove o # se existir
                        const cleanHex = hex.replace('#', '');
                        const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
                        const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
                        const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
                        
                        const max = Math.max(r, g, b);
                        const min = Math.min(r, g, b);
                        let h = 0;
                        
                        if (max !== min) {
                          if (max === r) {
                            h = ((g - b) / (max - min)) % 6;
                          } else if (max === g) {
                            h = (b - r) / (max - min) + 2;
                          } else {
                            h = (r - g) / (max - min) + 4;
                          }
                        }
                        
                        h = h * 60;
                        if (h < 0) h += 360;
                        return h;
                      };
                      
                      // Separar por tipo (não-HC e HC) apenas cores válidas
                      const nonHCColors = allColorsRaw
                        .filter(([, colorData]: [string, any]) => colorData.club === '0')
                        .sort(([, colorDataA]: [string, any], [, colorDataB]: [string, any]) => {
                          const hueA = hexToHue(colorDataA.hex);
                          const hueB = hexToHue(colorDataB.hex);
                          return hueA - hueB;
                        });
                      
                      const hcColors = allColorsRaw
                        .filter(([, colorData]: [string, any]) => colorData.club === '2')
                        .sort(([, colorDataA]: [string, any], [, colorDataB]: [string, any]) => {
                          const hueA = hexToHue(colorDataA.hex);
                          const hueB = hexToHue(colorDataB.hex);
                          return hueA - hueB;
                        });

                      // Componente para renderizar grid de cores separado por tipo
                      const renderColorGrid = (title: string, colors: [string, any][], selectedColor: string, onColorSelect: (colorId: string) => void, colorType: 'primary' | 'secondary', isHC: boolean) => {
                        if (colors.length === 0) return null;
                        
                        return (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">
                              {title} ({colors.length})
                            </h4>
                            <div className="grid grid-cols-8 gap-1.5">
                              {colors.map(([colorId, colorData]: [string, any]) => {
                                const isSelected = selectedColor === colorId;
                                
                                return (
                                  <div
                                    key={`${colorType}-color-${colorId}`}
                                    className={`relative w-6 h-6 rounded border cursor-pointer transition-all hover:scale-110 ${
                                      isSelected
                                        ? isHC 
                                          ? 'border-yellow-500 ring-2 ring-yellow-300' 
                                          : 'border-blue-500 ring-2 ring-blue-300'
                                        : isHC
                                          ? 'border-yellow-400 hover:border-yellow-500'
                                          : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    style={{ backgroundColor: `#${colorData.hex}` }}
                                    onClick={() => onColorSelect(colorId)}
                                    title={isHC ? `Roupa HC ${colorId} - #${colorData.hex}` : `Roupa Gratuita ${colorId} - #${colorData.hex}`}
                                  >
                                    {/* Badge HC - menor para quadrados menores */}
                                    {isHC && (
                                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                        <span className="text-[8px] text-white font-bold">HC</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      };

                      return (
                        <>
                          {/* Grid de Cores - Separado em não-HC e HC */}
                          <div className="space-y-4">
                            {renderColorGrid('Cores Gratuitas', nonHCColors, primaryColor, setPrimaryColor, 'primary', false)}
                            {renderColorGrid('Cores Club', hcColors, primaryColor, setPrimaryColor, 'primary', true)}
                          </div>

                          {/* Info sobre a paleta */}
                          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                            Paleta {paletteId}: {nonHCColors.length + hcColors.length} cores ({nonHCColors.length} gratuitas + {hcColors.length} HC)
                          </div>
                        </>
                      );
                    }
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditorClean;