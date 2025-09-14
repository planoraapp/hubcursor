// Serviço oficial do Habbo BR para Editor de Avatares
// Baseado nas APIs oficiais do Habbo

import { furnidataClothingService } from './FurnidataClothingService';

export interface HabboFigureData {
  palettes: HabboPalette[];
  sets: HabboSet[];
  libraries: HabboLibrary[];
}

export interface HabboPalette {
  id: string;
  name: string;
  colors: HabboColor[];
}

export interface HabboColor {
  id: string;
  index: string;
  club: boolean;
  selectable: boolean;
}

export interface HabboSet {
  id: string;
  gender: 'M' | 'F' | 'U';
  club: boolean;
  colorable: boolean;
  selectable: boolean;
  sellable: boolean;
  parts: HabboSetPart[];
}

export interface HabboSetPart {
  id: string;
  type: string;
  colorable: boolean;
  index: string;
  colorindex: string;
}

export interface HabboLibrary {
  id: string;
  revision: string;
  url: string;
}

export interface HabboClothingItem {
  id: string;
  name: string;
  type: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  club: boolean;
  colorable: boolean;
  selectable: boolean;
  sellable: boolean;
  colors: string[];
  secondaryColors?: string[]; // Para roupas duotone
  colorindex: string[];
  isDuotone: boolean;
  categoryType: 'NORMAL' | 'HC' | 'NFT' | 'RARE' | 'LTD' | 'SELLABLE';
  imageUrl: string;
  duotoneImageUrl?: string; // URL para roupas duotone
}

export interface HabboCategory {
  id: string;
  name: string;
  displayName: string;
  type: string;
  items: HabboClothingItem[];
  colors: string[];
}

// URLs oficiais do Habbo BR
const HABBO_BR_URLS = {
  figuredata: 'https://www.habbo.com.br/gamedata/figuredata/0',
  external_variables: 'https://www.habbo.com.br/gamedata/external_variables/0',
  external_texts: 'https://www.habbo.com.br/gamedata/external_texts/0',
  avatar_imaging: 'https://www.habbo.com.br/habbo-imaging/avatarimage'
};

// Mapeamento de tipos para nomes amigáveis
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

class HabboOfficialService {
  private cache = new Map<string, any>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas
  private figureData: HabboFigureData | null = null;

  // Dados mock para funcionar sem API externa
  private getMockFigureData(): HabboFigureData {
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
        },
        {
          id: 'lg',
          name: 'Calças',
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
          id: 'sh',
          name: 'Sapatos',
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
        // Rostos
        { id: '1', gender: 'M', club: false, colorable: true, selectable: true, sellable: true, parts: [
          { id: '190', type: 'hd', colorable: true, index: '0', colorindex: '0' },
          { id: '180', type: 'hd', colorable: true, index: '0', colorindex: '0' },
          { id: '185', type: 'hd', colorable: true, index: '0', colorindex: '0' },
          { id: '200', type: 'hd', colorable: true, index: '0', colorindex: '0' },
          { id: '210', type: 'hd', colorable: true, index: '0', colorindex: '0' }
        ]},
        // Cabelos
        { id: '2', gender: 'M', club: false, colorable: true, selectable: true, sellable: true, parts: [
          { id: '100', type: 'hr', colorable: true, index: '0', colorindex: '0' },
          { id: '101', type: 'hr', colorable: true, index: '0', colorindex: '0' },
          { id: '102', type: 'hr', colorable: true, index: '0', colorindex: '0' },
          { id: '103', type: 'hr', colorable: true, index: '0', colorindex: '0' },
          { id: '104', type: 'hr', colorable: true, index: '0', colorindex: '0' }
        ]},
        // Camisas
        { id: '3', gender: 'M', club: false, colorable: true, selectable: true, sellable: true, parts: [
          { id: '210', type: 'ch', colorable: true, index: '0', colorindex: '0' },
          { id: '211', type: 'ch', colorable: true, index: '0', colorindex: '0' },
          { id: '212', type: 'ch', colorable: true, index: '0', colorindex: '0' },
          { id: '213', type: 'ch', colorable: true, index: '0', colorindex: '0' },
          { id: '214', type: 'ch', colorable: true, index: '0', colorindex: '0' }
        ]},
        // Calças
        { id: '4', gender: 'M', club: false, colorable: true, selectable: true, sellable: true, parts: [
          { id: '270', type: 'lg', colorable: true, index: '0', colorindex: '0' },
          { id: '271', type: 'lg', colorable: true, index: '0', colorindex: '0' },
          { id: '272', type: 'lg', colorable: true, index: '0', colorindex: '0' },
          { id: '273', type: 'lg', colorable: true, index: '0', colorindex: '0' },
          { id: '274', type: 'lg', colorable: true, index: '0', colorindex: '0' }
        ]},
        // Sapatos
        { id: '5', gender: 'M', club: false, colorable: true, selectable: true, sellable: true, parts: [
          { id: '290', type: 'sh', colorable: true, index: '0', colorindex: '0' },
          { id: '291', type: 'sh', colorable: true, index: '0', colorindex: '0' },
          { id: '292', type: 'sh', colorable: true, index: '0', colorindex: '0' },
          { id: '293', type: 'sh', colorable: true, index: '0', colorindex: '0' },
          { id: '294', type: 'sh', colorable: true, index: '0', colorindex: '0' }
        ]}
      ],
      libraries: []
    };
  }

  // Carregar figuredata.xml do Habbo BR (com fallback para mock)
  async loadFigureData(): Promise<HabboFigureData> {
    const cacheKey = 'figuredata_br';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // Tentar carregar dados reais
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
            // Fallback para dados mock se a API falhar
      const mockData = this.getMockFigureData();
      this.cache.set(cacheKey, {
        data: mockData,
        timestamp: Date.now()
      });
      this.figureData = mockData;
      return mockData;
    }
  }

  // Parsear XML do figuredata
  private parseFigureDataXML(xmlText: string): HabboFigureData {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const palettes: HabboPalette[] = [];
    const sets: HabboSet[] = [];
    const libraries: HabboLibrary[] = [];

    // Parsear palettes
    const paletteElements = xmlDoc.querySelectorAll('palette');
    paletteElements.forEach(palette => {
      const id = palette.getAttribute('id') || '';
      const name = palette.getAttribute('name') || '';
      const colors: HabboColor[] = [];

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

    // Parsear sets
    const setElements = xmlDoc.querySelectorAll('set');
    setElements.forEach(set => {
      const id = set.getAttribute('id') || '';
      const gender = (set.getAttribute('gender') as 'M' | 'F' | 'U') || 'U';
      const club = set.getAttribute('club') === '1';
      const colorable = set.getAttribute('colorable') === '1';
      const selectable = set.getAttribute('selectable') === '1';
      const sellable = set.getAttribute('sellable') === '1';
      const parts: HabboSetPart[] = [];

      set.querySelectorAll('part').forEach(part => {
        parts.push({
          id: part.getAttribute('id') || '',
          type: part.getAttribute('type') || '',
          colorable: part.getAttribute('colorable') === '1',
          index: part.getAttribute('index') || '',
          colorindex: part.getAttribute('colorindex') || ''
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

  // Obter categorias com itens
  async getCategories(): Promise<HabboCategory[]> {
    if (!this.figureData) {
      await this.loadFigureData();
    }

    const categories = new Map<string, HabboCategory>();

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
            colors: []
          });
        }

        const category = categories.get(type)!;
        
        // Obter cores disponíveis para este tipo
        const palette = this.figureData!.palettes.find(p => p.id === type);
        const availableColors = palette ? palette.colors.map(c => c.id) : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

        // Verificar se é duotone (colorindex 1 e 2)
        const colorindex = part.colorindex || [];
        const isDuotone = colorindex.includes('1') && colorindex.includes('2');
        
        // Determinar categoria correta baseada na orientação
        let categoryType: 'NORMAL' | 'HC' | 'NFT' | 'RARE' | 'LTD' | 'SELLABLE' = 'NORMAL';
        
        // Verificar furnidata para NFT, RARE, LTD
        const furnidataInfo = await furnidataClothingService.analyzeClothingRarity(type, part.id);
        if (furnidataInfo.type !== 'NORMAL') {
          categoryType = furnidataInfo.type;
        } else if (set.club === '2') {
          categoryType = 'HC';
        } else if (set.sellable === '1') {
          categoryType = 'SELLABLE';
        }
        
        // Gerar cores secundárias para duotone
        const secondaryColors = isDuotone ? this.getSecondaryColors(availableColors) : undefined;
        
        const item: HabboClothingItem = {
          id: `${type}-${part.id}`,
          name: `${TYPE_DISPLAY_NAMES[type]} ${part.id}`,
          type: type,
          category: type,
          gender: set.gender,
          club: set.club === '2', // CORRIGIDO: HC é club="2", não club="1"
          colorable: part.colorable,
          selectable: set.selectable,
          sellable: set.sellable === '1', // CORRIGIDO: Verificar sellable="1"
          colors: availableColors,
          secondaryColors,
          colorindex,
          isDuotone,
          categoryType,
          imageUrl: this.generateAvatarImageUrl(type, part.id, set.gender, availableColors[0] || '1'),
          duotoneImageUrl: isDuotone && secondaryColors ? 
            this.generateDuotoneImageUrl(type, part.id, availableColors[0] || '1', secondaryColors[0] || '2', set.gender) : 
            undefined
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

  // Gerar URL da imagem do avatar
  generateAvatarImageUrl(type: string, id: string, gender: string, color: string = '1'): string {
    const figure = `${type}-${id}-${color}`;
    return `${HABBO_BR_URLS.avatar_imaging}?figure=${figure}&gender=${gender}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
  }

  // Gerar URL da imagem duotone (duas cores)
  generateDuotoneImageUrl(type: string, id: string, primaryColor: string, secondaryColor: string, gender: string = 'U'): string {
    const figure = `${type}-${id}-${primaryColor}-${secondaryColor}`;
    return `${HABBO_BR_URLS.avatar_imaging}?figure=${figure}&gender=${gender}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
  }

  // Obter cores secundárias para roupas duotone
  private getSecondaryColors(colors: string[]): string[] {
    // Para roupas duotone, dividir as cores em primárias e secundárias
    const midPoint = Math.ceil(colors.length / 2);
    return colors.slice(midPoint);
  }

  // Gerar URL completa do avatar
  generateFullAvatarUrl(figure: string, gender: string, direction: number = 2, gesture: string = 'nrm'): string {
    const params = new URLSearchParams({
      figure: figure,
      gender: gender,
      direction: direction.toString(),
      head_direction: direction.toString(),
      gesture: gesture,
      size: 'l'
    });

    return `${HABBO_BR_URLS.avatar_imaging}?${params.toString()}`;
  }

  // Buscar usuário por nome
  async searchUser(username: string): Promise<any> {
    try {
      // Usar API de busca de usuários do Habbo BR
      const response = await fetch(`https://www.habbo.com.br/api/public/users?name=${encodeURIComponent(username)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
            throw new Error('Usuário não encontrado');
    }
  }

  // Obter perfil do usuário
  async getUserProfile(username: string): Promise<any> {
    try {
      const response = await fetch(`https://www.habbo.com.br/api/public/users/${encodeURIComponent(username)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
            throw new Error('Perfil não encontrado');
    }
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear();
    this.figureData = null;
  }

  // Obter estatísticas
  async getStats(): Promise<{ totalCategories: number; totalItems: number }> {
    const categories = await this.getCategories();
    const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
    
    return {
      totalCategories: categories.length,
      totalItems
    };
  }
}

export const habboOfficialService = new HabboOfficialService();
export default habboOfficialService;
