// src/services/ViaJovemClothingService.ts
// Implementação baseada na estratégia do ViaJovem para categorização de roupas do Habbo
// Baseado em: https://viajovem.blogspot.com/2023/01/as-roupas-visuais.html

export interface ViaJovemFigureData {
  palettes: ViaJovemPalette[];
  sets: ViaJovemSet[];
  libraries: ViaJovemLibrary[];
}

export interface ViaJovemPalette {
  id: string;
  name: string;
  colors: ViaJovemColor[];
}

export interface ViaJovemColor {
  id: string;
  index: string;
  club: boolean;
  selectable: boolean;
}

export interface ViaJovemSet {
  id: string;
  gender: 'M' | 'F' | 'U';
  club: string; // "1", "2" ou "0" - ViaJovem usa "2" para HC
  colorable: boolean;
  selectable: boolean;
  sellable: string; // "1" ou "0" - ViaJovem usa "1" para vendáveis
  parts: ViaJovemSetPart[];
}

export interface ViaJovemSetPart {
  id: string;
  type: string;
  colorable: boolean;
  index: string;
  colorindex: string; // Para duotone: "1", "2" ou ambos
}

export interface ViaJovemLibrary {
  id: string;
  revision: string;
  url: string;
}

export interface ViaJovemClothingItem {
  figureId: string;
  name: string;
  type: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  
  // Categorização baseada na estratégia ViaJovem
  categoryType: 'NORMAL' | 'HC' | 'NFT' | 'RARE' | 'LTD' | 'SELLABLE';
  
  // Atributos do figuredata.xml
  club: string; // "2" = HC, "1" ou "0" = Normal
  sellable: string; // "1" = Vendável, "0" = Não vendável
  
  // Atributos do furnidata.json
  furnidataClass?: string;
  furnidataFurniline?: string;
  
  // Sistema de cores
  colors: string[];
  isDuotone: boolean;
  primaryColorIndex?: string; // colorindex="1"
  secondaryColorIndex?: string; // colorindex="2"
  
  // URLs de imagem
  imageUrl: string;
  duotoneImageUrl?: string;
  
  // Metadados
  isColorable: boolean;
  isSelectable: boolean;
}

export interface ViaJovemCategory {
  id: string;
  name: string;
  displayName: string;
  type: string;
  items: ViaJovemClothingItem[];
  colors: string[];
  gender: 'M' | 'F' | 'U' | 'ALL';
}

// Mapeamento de tipos para nomes amigáveis (baseado no ViaJovem)
const TYPE_DISPLAY_NAMES: Record<string, string> = {
  'hd': 'Rostos',
  'hr': 'Cabelos', 
  'ha': 'Chapéus',
  'he': 'Acessórios da Cabeça',
  'ea': 'Óculos',
  'fa': 'Máscaras',
  'ch': 'Camisas',
  'cc': 'Jaquetas',
  'cp': 'Capes',
  'lg': 'Calças',
  'sh': 'Sapatos',
  'wa': 'Acessórios da Cintura',
  'ca': 'Acessórios do Peito',
  'dr': 'Vestidos',
  'sk': 'Saias',
  'su': 'Trajes',
  'bd': 'Corpos',
  'rh': 'Mão Direita',
  'lh': 'Mão Esquerda'
};

// Coleções NFT conhecidas (baseado no ViaJovem)
const NFT_COLLECTIONS = [
  'nft2025', 'nft2024', 'nft2023', 'nft', 'nftmint', 'testing'
];

// URLs oficiais do Habbo BR
const HABBO_BR_URLS = {
  figuredata: 'https://www.habbo.com.br/gamedata/figuredata/0',
  furnidata: 'https://www.habbo.com.br/gamedata/furnidata/0',
  avatar_imaging: 'https://www.habbo.com.br/habbo-imaging/avatarimage'
};

export class ViaJovemClothingService {
  private cache = new Map<string, any>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas
  private figureData: ViaJovemFigureData | null = null;
  private furnidataMap: Map<string, any> = new Map();

  /**
   * Carrega figuredata.xml do Habbo BR
   */
  async loadFigureData(): Promise<ViaJovemFigureData> {
    const cacheKey = 'viajovem_figuredata';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const response = await fetch(HABBO_BR_URLS.figuredata, {
        mode: 'cors',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
        }
      });
      
      if (response.ok) {
        const xmlText = await response.text();
        const figureData = this.parseFigureDataXML(xmlText);
        
        this.cache.set(cacheKey, {
          data: figureData,
          timestamp: Date.now()
        });
        
        this.figureData = figureData;
        return figureData;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.warn('Erro ao carregar figuredata, usando dados mock:', error);
      const mockData = this.getMockFigureData();
      this.cache.set(cacheKey, {
        data: mockData,
        timestamp: Date.now()
      });
      this.figureData = mockData;
      return mockData;
    }
  }

  /**
   * Carrega furnidata.json do Habbo BR
   */
  async loadFurnidata(): Promise<void> {
    const cacheKey = 'viajovem_furnidata';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      this.furnidataMap = cached.data;
      return;
    }

    try {
      const response = await fetch(HABBO_BR_URLS.furnidata, {
        mode: 'cors',
        headers: {
          'Accept': 'application/json, */*',
        }
      });
      
      if (response.ok) {
        const furnidata = await response.json();
        this.processFurnidata(furnidata);
        
        this.cache.set(cacheKey, {
          data: this.furnidataMap,
          timestamp: Date.now()
        });
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.warn('Erro ao carregar furnidata, usando dados mock:', error);
      this.loadMockFurnidata();
    }
  }

  /**
   * Processa dados do furnidata.json
   */
  private processFurnidata(furnidata: any): void {
    if (furnidata.furnitype && Array.isArray(furnidata.furnitype)) {
      furnidata.furnitype.forEach((item: any) => {
        if (item.$.classname && item.$.furniline) {
          this.furnidataMap.set(item.$.classname, {
            classname: item.$.classname,
            furniline: item.$.furniline,
            description: item.description?.[0] || '',
            category: item.$.category || 'clothing'
          });
        }
      });
    }
  }

  /**
   * Parsear XML do figuredata (baseado na estratégia ViaJovem)
   */
  private parseFigureDataXML(xmlText: string): ViaJovemFigureData {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const palettes: ViaJovemPalette[] = [];
    const sets: ViaJovemSet[] = [];
    const libraries: ViaJovemLibrary[] = [];

    // Parsear palettes
    const paletteElements = xmlDoc.querySelectorAll('palette');
    paletteElements.forEach(palette => {
      const id = palette.getAttribute('id') || '';
      const name = palette.getAttribute('name') || '';
      const colors: ViaJovemColor[] = [];

      palette.querySelectorAll('color').forEach(color => {
        colors.push({
          id: color.getAttribute('id') || '',
          index: color.getAttribute('index') || '',
          club: color.getAttribute('club') === '1',
          selectable: color.getAttribute('selectable') === '1'
        });
      });

      palettes.push({ id, name, colors });
    });

    // Parsear sets (baseado na estratégia ViaJovem)
    const setElements = xmlDoc.querySelectorAll('set');
    setElements.forEach(set => {
      const id = set.getAttribute('id') || '';
      const gender = (set.getAttribute('gender') as 'M' | 'F' | 'U') || 'U';
      const club = set.getAttribute('club') || '0'; // ViaJovem: "2" = HC
      const colorable = set.getAttribute('colorable') === '1';
      const selectable = set.getAttribute('selectable') === '1';
      const sellable = set.getAttribute('sellable') || '0'; // ViaJovem: "1" = vendável
      const parts: ViaJovemSetPart[] = [];

      set.querySelectorAll('part').forEach(part => {
        parts.push({
          id: part.getAttribute('id') || '',
          type: part.getAttribute('type') || '',
          colorable: part.getAttribute('colorable') === '1',
          index: part.getAttribute('index') || '',
          colorindex: part.getAttribute('colorindex') || '' // Para duotone
        });
      });

      sets.push({ id, gender, club, colorable, selectable, sellable, parts });
    });

    // Parsear libraries
    const libraryElements = xmlDoc.querySelectorAll('library');
    libraryElements.forEach(library => {
      libraries.push({
        id: library.getAttribute('id') || '',
        revision: library.getAttribute('revision') || '',
        url: library.getAttribute('url') || ''
      });
    });

    return { palettes, sets, libraries };
  }

  /**
   * Categoriza item baseado na estratégia ViaJovem
   */
  private categorizeItem(set: ViaJovemSet, part: ViaJovemSetPart): 'NORMAL' | 'HC' | 'NFT' | 'RARE' | 'LTD' | 'SELLABLE' {
    // 1. Verificar HC: club="2" no figuredata
    if (set.club === '2') {
      return 'HC';
    }

    // 2. Verificar vendável: sellable="1" no figuredata
    if (set.sellable === '1') {
      return 'SELLABLE';
    }

    // 3. Verificar NFT, RARE, LTD no furnidata
    const furnidataInfo = this.getFurnidataInfo(part.type, part.id);
    if (furnidataInfo) {
      // NFT: furniline contém coleções NFT
      if (furnidataInfo.furniline && NFT_COLLECTIONS.includes(furnidataInfo.furniline)) {
        return 'NFT';
      }

      // RARE: classname começa com "clothing_r"
      if (furnidataInfo.classname.startsWith('clothing_r')) {
        return 'RARE';
      }

      // LTD: classname começa com "clothing_ltd"
      if (furnidataInfo.classname.startsWith('clothing_ltd')) {
        return 'LTD';
      }
    }

    // 4. Padrão: NORMAL (sem sellable="1", sem club="2")
    return 'NORMAL';
  }

  /**
   * Detecta se item é duotone (baseado na estratégia ViaJovem)
   */
  private isDuotoneItem(colorindex: string): boolean {
    // ViaJovem: duotone quando há colorindex="1" e colorindex="2"
    return colorindex.includes('1') && colorindex.includes('2');
  }

  /**
   * Obtém informações do furnidata para um item
   */
  private getFurnidataInfo(type: string, id: string): any {
    const possibleClassnames = [
      `${type}_${id}`,
      `clothing_${type}_${id}`,
      `clothing_${type}_${id}_special`,
      `clothing_${type}_${id}_hc`,
      `clothing_${type}_${id}_rare`
    ];

    for (const classname of possibleClassnames) {
      const item = this.furnidataMap.get(classname);
      if (item) {
        return item;
      }
    }

    return null;
  }

  /**
   * Gera URL da imagem do avatar (baseado na estratégia ViaJovem)
   */
  private generateAvatarImageUrl(type: string, id: string, gender: string, color: string = '1'): string {
    // ViaJovem: hr-3811-61, hd-190-7, ch-3030-66, lg-275-82, sh-290-80
    const figure = `${type}-${id}-${color}`;
    return `${HABBO_BR_URLS.avatar_imaging}?figure=${figure}&gender=${gender}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
  }

  /**
   * Gera URL da imagem duotone (duas cores)
   */
  private generateDuotoneImageUrl(type: string, id: string, primaryColor: string, secondaryColor: string, gender: string): string {
    // ViaJovem: Para duotone, usar duas cores
    const figure = `${type}-${id}-${primaryColor}-${secondaryColor}`;
    return `${HABBO_BR_URLS.avatar_imaging}?figure=${figure}&gender=${gender}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
  }

  /**
   * Obtém categorias com itens (implementação principal)
   */
  async getCategories(): Promise<ViaJovemCategory[]> {
    await this.loadFigureData();
    await this.loadFurnidata();

    const categories = new Map<string, ViaJovemCategory>();

    // Agrupar sets por tipo
    this.figureData!.sets.forEach(set => {
      set.parts.forEach(part => {
        const type = part.type;
        
        if (!categories.has(type)) {
          categories.set(type, {
            id: type,
            name: type,
            displayName: TYPE_DISPLAY_NAMES[type] || type,
            type: type,
            items: [],
            colors: [],
            gender: 'ALL'
          });
        }

        const category = categories.get(type)!;
        
        // Obter cores disponíveis para este tipo
        const palette = this.figureData!.palettes.find(p => p.id === type);
        const availableColors = palette ? palette.colors.map(c => c.id) : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

        // Categorizar item baseado na estratégia ViaJovem
        const categoryType = this.categorizeItem(set, part);
        
        // Detectar duotone
        const isDuotone = this.isDuotoneItem(part.colorindex);
        
        // Obter informações do furnidata
        const furnidataInfo = this.getFurnidataInfo(type, part.id);
        
        const item: ViaJovemClothingItem = {
          figureId: part.id,
          name: `${TYPE_DISPLAY_NAMES[type]} ${part.id}`,
          type: type,
          category: type,
          gender: set.gender,
          categoryType,
          club: set.club,
          sellable: set.sellable,
          furnidataClass: furnidataInfo?.classname,
          furnidataFurniline: furnidataInfo?.furniline,
          colors: availableColors,
          isDuotone,
          primaryColorIndex: isDuotone ? '1' : undefined,
          secondaryColorIndex: isDuotone ? '2' : undefined,
          imageUrl: this.generateAvatarImageUrl(type, part.id, set.gender, availableColors[0] || '1'),
          duotoneImageUrl: isDuotone ? 
            this.generateDuotoneImageUrl(type, part.id, availableColors[0] || '1', availableColors[1] || '2', set.gender) : 
            undefined,
          isColorable: part.colorable,
          isSelectable: set.selectable
        };

        category.items.push(item);
        
        // Adicionar cores únicas
        availableColors.forEach(color => {
          if (!category.colors.includes(color)) {
            category.colors.push(color);
          }
        });
      });
    });

    return Array.from(categories.values());
  }

  /**
   * Dados mock para funcionar sem API externa
   */
  private getMockFigureData(): ViaJovemFigureData {
    return {
      palettes: [
        {
          id: 'hd',
          name: 'Rostos',
          colors: [
            { id: '1', index: '1', club: false, selectable: true },
            { id: '2', index: '2', club: false, selectable: true },
            { id: '3', index: '3', club: false, selectable: true },
            { id: '4', index: '4', club: false, selectable: true },
            { id: '5', index: '5', club: false, selectable: true },
            { id: '6', index: '6', club: false, selectable: true },
            { id: '7', index: '7', club: false, selectable: true },
            { id: '8', index: '8', club: false, selectable: true },
            { id: '9', index: '9', club: false, selectable: true },
            { id: '10', index: '10', club: false, selectable: true }
          ]
        },
        {
          id: 'hr',
          name: 'Cabelos',
          colors: [
            { id: '1', index: '1', club: false, selectable: true },
            { id: '2', index: '2', club: false, selectable: true },
            { id: '3', index: '3', club: false, selectable: true },
            { id: '4', index: '4', club: false, selectable: true },
            { id: '5', index: '5', club: false, selectable: true },
            { id: '6', index: '6', club: false, selectable: true },
            { id: '7', index: '7', club: false, selectable: true },
            { id: '8', index: '8', club: false, selectable: true },
            { id: '9', index: '9', club: false, selectable: true },
            { id: '10', index: '10', club: false, selectable: true }
          ]
        },
        {
          id: 'ch',
          name: 'Camisas',
          colors: [
            { id: '1', index: '1', club: false, selectable: true },
            { id: '2', index: '2', club: false, selectable: true },
            { id: '3', index: '3', club: false, selectable: true },
            { id: '4', index: '4', club: false, selectable: true },
            { id: '5', index: '5', club: false, selectable: true },
            { id: '6', index: '6', club: false, selectable: true },
            { id: '7', index: '7', club: false, selectable: true },
            { id: '8', index: '8', club: false, selectable: true },
            { id: '9', index: '9', club: false, selectable: true },
            { id: '10', index: '10', club: false, selectable: true }
          ]
        }
      ],
      sets: [
        // Rostos normais
        { id: '1', gender: 'M', club: '0', colorable: true, selectable: true, sellable: '0', parts: [
          { id: '190', type: 'hd', colorable: true, index: '0', colorindex: '0' },
          { id: '180', type: 'hd', colorable: true, index: '0', colorindex: '0' },
          { id: '185', type: 'hd', colorable: true, index: '0', colorindex: '0' }
        ]},
        // Cabelos normais
        { id: '2', gender: 'M', club: '0', colorable: true, selectable: true, sellable: '0', parts: [
          { id: '100', type: 'hr', colorable: true, index: '0', colorindex: '0' },
          { id: '101', type: 'hr', colorable: true, index: '0', colorindex: '0' },
          { id: '102', type: 'hr', colorable: true, index: '0', colorindex: '0' }
        ]},
        // Camisas normais
        { id: '3', gender: 'M', club: '0', colorable: true, selectable: true, sellable: '0', parts: [
          { id: '210', type: 'ch', colorable: true, index: '0', colorindex: '0' },
          { id: '211', type: 'ch', colorable: true, index: '0', colorindex: '0' },
          { id: '212', type: 'ch', colorable: true, index: '0', colorindex: '0' }
        ]},
        // Exemplo HC (club="2")
        { id: '4', gender: 'M', club: '2', colorable: true, selectable: true, sellable: '0', parts: [
          { id: '3000', type: 'ch', colorable: true, index: '0', colorindex: '0' }
        ]},
        // Exemplo vendável (sellable="1")
        { id: '5', gender: 'M', club: '0', colorable: true, selectable: true, sellable: '1', parts: [
          { id: '4000', type: 'ch', colorable: true, index: '0', colorindex: '0' }
        ]},
        // Exemplo duotone (colorindex="1" e "2")
        { id: '6', gender: 'M', club: '0', colorable: true, selectable: true, sellable: '0', parts: [
          { id: '5000', type: 'ch', colorable: true, index: '0', colorindex: '1,2' }
        ]}
      ],
      libraries: []
    };
  }

  /**
   * Dados mock do furnidata
   */
  private loadMockFurnidata(): void {
    const mockItems = [
      // Exemplos de NFT
      {
        classname: 'clothing_ch_nft_digital_artist',
        furniline: 'nft2025',
        description: 'Digital Artist Outfit',
        category: 'clothing'
      },
      // Exemplos de RARE
      {
        classname: 'clothing_r16_helmhero',
        furniline: 'rare_collection',
        description: 'Hero Helmet',
        category: 'clothing'
      },
      // Exemplos de LTD
      {
        classname: 'clothing_ltd23_solarpunkbunny',
        furniline: 'limited_collection',
        description: 'Solar Punk Bunny',
        category: 'clothing'
      }
    ];

    mockItems.forEach(item => {
      this.furnidataMap.set(item.classname, item);
    });
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.clear();
    this.figureData = null;
    this.furnidataMap.clear();
  }

  /**
   * Obter estatísticas
   */
  async getStats(): Promise<{ totalCategories: number; totalItems: number; categoryStats: Record<string, number> }> {
    const categories = await this.getCategories();
    const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
    
    const categoryStats = {
      NORMAL: 0,
      HC: 0,
      NFT: 0,
      RARE: 0,
      LTD: 0,
      SELLABLE: 0
    };

    categories.forEach(category => {
      category.items.forEach(item => {
        categoryStats[item.categoryType]++;
      });
    });
    
    return {
      totalCategories: categories.length,
      totalItems,
      categoryStats
    };
  }
}

// Instância singleton
export const viaJovemClothingService = new ViaJovemClothingService();
export default viaJovemClothingService;
