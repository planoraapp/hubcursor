// src/services/ViaJovemCompleteService.ts
// Implementação completa baseada no tutorial da ViaJovem
// Carrega figuredata.xml e furnidata.json reais do Habbo

export interface ViaJovemPalette {
  id: string;
  colors: Array<{
    id: string;
    index: string;
    club: string;
    selectable: string;
    hex: string;
  }>;
}

export interface ViaJovemSet {
  id: string;
  gender: 'M' | 'F' | 'U';
  club: string; // "2" = HC, "0" = Normal
  colorable: string; // "1" = Colorável, "0" = Não colorável
  selectable: string; // "1" = Selecionável, "0" = Não selecionável
  preselectable: string; // "1" = Pode presentear, "0" = Não pode
  sellable: string; // "1" = Vendável, "0" = Não vendável
  parts: ViaJovemSetPart[];
}

export interface ViaJovemSetPart {
  id: string;
  type: string;
  colorable: string;
  index: string;
  colorindex: string; // Para duotone: "1", "2" ou ambos
}

export interface ViaJovemClothingItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  
  // Categorização baseada no tutorial ViaJovem
  categoryType: 'NORMAL' | 'HC' | 'NFT' | 'RARE' | 'LTD' | 'SELLABLE';
  
  // Atributos do figuredata.xml
  club: string;
  sellable: string;
  colorable: string;
  selectable: string;
  
  // Atributos do furnidata.json
  furnidataClass?: string;
  furnidataFurniline?: string;
  
  // Sistema de cores baseado nas paletas
  colors: string[];
  isDuotone: boolean;
  primaryColorIndex?: string;
  secondaryColorIndex?: string;
  
  // URLs de imagem
  imageUrl: string;
  duotoneImageUrl?: string;
  
  // Metadados
  isColorable: boolean;
  isSelectable: boolean;
  name: string;
}

export interface ViaJovemCategory {
  id: string;
  name: string;
  displayName: string;
  type: string;
  paletteId: string; // 1=pele, 2=cabelo, 3=roupas
  items: ViaJovemClothingItem[];
  colors: string[];
  gender: 'M' | 'F' | 'U' | 'ALL';
}

// Mapeamento de tipos para nomes amigáveis baseado na documentação oficial do Habbo
const TYPE_DISPLAY_NAMES: Record<string, string> = {
  // CORPO - Rosto e Corpo
  'hd': 'Rosto e Corpo',
  
  // CABEÇA - Cabelo/Penteados
  'hr': 'Cabelo/Penteados',
  
  // CABEÇA - Chapéus
  'ha': 'Chapéus',
  
  // CABEÇA - Acessórios de Cabeça
  'he': 'Acessórios de Cabeça',
  
  // CABEÇA - Óculos
  'ea': 'Óculos',
  
  // CABEÇA - Máscaras (acessórios faciais)
  'fa': 'Máscaras',
  
  // TORSO - Camisas
  'ch': 'Camisas',
  
  // TORSO - Casacos/Vestidos/Jaquetas
  'cc': 'Casacos/Vestidos',
  
  // TORSO - Estampas/Impressões
  'cp': 'Estampas',
  
  // TORSO - Bijuteria/Jóias (acessórios de topo)
  'ca': 'Acessórios do Peito',
  
  // PERNAS - Calça
  'lg': 'Calças',
  
  // PERNAS - Sapato
  'sh': 'Sapatos',
  
  // PERNAS - Cintos (acessórios para a parte inferior)
  'wa': 'Cintos',
  
  // Categorias adicionais (não oficiais mas encontradas nos dados)
  'dr': 'Vestidos',
  'sk': 'Saias',
  'su': 'Trajes',
  'bd': 'Corpos',
  'rh': 'Mão Direita',
  'lh': 'Mão Esquerda'
};

// Mapeamento de paletas baseado na documentação oficial do Habbo
const PALETTE_MAPPING: Record<string, string> = {
  // Paleta 1 - Cores para pele (Rosto e Corpo)
  'hd': '1', // Rosto e Corpo - Paleta 1
  
  // Paleta 2 - Cores para cabelo
  'hr': '2', // Cabelo/Penteados - Paleta 2
  
  // Paleta 3 - Cores para roupas de 1 ou 2 cores
  'ch': '3', // Camisas - Paleta 3
  'cc': '3', // Casacos/Vestidos/Jaquetas - Paleta 3
  'cp': '3', // Estampas/Impressões - Paleta 3
  'ca': '3', // Bijuteria/Jóias (acessórios de topo) - Paleta 3
  'ea': '3', // Óculos - Paleta 3
  'fa': '3', // Máscaras (acessórios faciais) - Paleta 3
  'ha': '3', // Chapéus - Paleta 3
  'he': '3', // Acessórios de Cabeça - Paleta 3
  'lg': '3', // Calça - Paleta 3
  'sh': '3', // Sapato - Paleta 3
  'wa': '3'  // Cintos (acessórios para a parte inferior) - Paleta 3
};

// Coleções NFT conhecidas (baseado no tutorial)
const NFT_COLLECTIONS = [
  'nft2025', 'nft2024', 'nft2023', 'nft', 'nftmint', 'testing'
];

export class ViaJovemCompleteService {
  private cache = new Map<string, any>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas
  private figureData: { palettes: ViaJovemPalette[], sets: ViaJovemSet[] } | null = null;
  private furnidataMap: Map<string, any> = new Map();

  /**
   * Carrega figuredata.xml do Habbo BR
   */
  async loadFigureData(): Promise<{ palettes: ViaJovemPalette[], sets: ViaJovemSet[] }> {
    const cacheKey = 'viajovem_complete_figuredata';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      console.log('🌐 [ViaJovemComplete] Loading figuredata.xml...');
      
      const response = await fetch('/handitems/gamedata/figuredata.xml');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlText = await response.text();
      const figureData = this.parseFigureDataXML(xmlText);
      
      this.cache.set(cacheKey, {
        data: figureData,
        timestamp: Date.now()
      });
      
      this.figureData = figureData;
      console.log('✅ [ViaJovemComplete] Figuredata loaded:', {
        palettes: figureData.palettes.length,
        sets: figureData.sets.length
      });
      
      return figureData;
      
    } catch (error) {
      console.warn('⚠️ [ViaJovemComplete] Error loading figuredata.xml, using mock data:', error);
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
    const cacheKey = 'viajovem_complete_furnidata';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      this.furnidataMap = cached.data;
      return;
    }

    try {
      console.log('🌐 [ViaJovemComplete] Loading furnidata.json...');
      
      const response = await fetch('/handitems/gamedata/furnidata.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const furnidata = await response.json();
      this.processFurnidata(furnidata);
      
      this.cache.set(cacheKey, {
        data: this.furnidataMap,
        timestamp: Date.now()
      });
      
      console.log('✅ [ViaJovemComplete] Furnidata loaded:', this.furnidataMap.size, 'items');
      
    } catch (error) {
      console.warn('⚠️ [ViaJovemComplete] Error loading furnidata.json, using mock data:', error);
      this.loadMockFurnidata();
    }
  }

  /**
   * Parsear XML do figuredata (baseado no tutorial ViaJovem)
   */
  private parseFigureDataXML(xmlText: string): { palettes: ViaJovemPalette[], sets: ViaJovemSet[] } {
    console.log('🔍 [ViaJovemComplete] Parsing XML, length:', xmlText.length);
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Verificar se há erros de parsing
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('❌ [ViaJovemComplete] XML parsing error:', parseError.textContent);
      throw new Error('Failed to parse XML');
    }
    
    const palettes: ViaJovemPalette[] = [];
    const sets: ViaJovemSet[] = [];

    // Parsear palettes
    const paletteElements = xmlDoc.querySelectorAll('palette');
    console.log('🎨 [ViaJovemComplete] Found palettes:', paletteElements.length);
    
    paletteElements.forEach(palette => {
      const id = palette.getAttribute('id') || '';
      const colors: Array<{id: string, index: string, club: string, selectable: string, hex: string}> = [];

      palette.querySelectorAll('color').forEach(color => {
        colors.push({
          id: color.getAttribute('id') || '',
          index: color.getAttribute('index') || '',
          club: color.getAttribute('club') || '0',
          selectable: color.getAttribute('selectable') || '1',
          hex: color.textContent || ''
        });
      });

      palettes.push({ id, colors });
    });

    // Parsear sets (baseado no tutorial ViaJovem)
    const setElements = xmlDoc.querySelectorAll('set');
    console.log('👕 [ViaJovemComplete] Found sets:', setElements.length);
    setElements.forEach(set => {
      const id = set.getAttribute('id') || '';
      const gender = (set.getAttribute('gender') as 'M' | 'F' | 'U') || 'U';
      const club = set.getAttribute('club') || '0';
      const colorable = set.getAttribute('colorable') || '0';
      const selectable = set.getAttribute('selectable') || '1';
      const preselectable = set.getAttribute('preselectable') || '0';
      const sellable = set.getAttribute('sellable') || '0';
      const parts: ViaJovemSetPart[] = [];

      set.querySelectorAll('part').forEach(part => {
        parts.push({
          id: part.getAttribute('id') || '',
          type: part.getAttribute('type') || '',
          colorable: part.getAttribute('colorable') || '0',
          index: part.getAttribute('index') || '0',
          colorindex: part.getAttribute('colorindex') || '0'
        });
      });

      sets.push({ id, gender, club, colorable, selectable, preselectable, sellable, parts });
    });

    console.log('✅ [ViaJovemComplete] XML parsing completed:', {
      palettes: palettes.length,
      sets: sets.length,
      totalParts: sets.reduce((sum, set) => sum + set.parts.length, 0)
    });

    return { palettes, sets };
  }

  /**
   * Processa dados do furnidata.json
   */
  private processFurnidata(furnidata: any): void {
    if (furnidata.roomitemtypes && furnidata.roomitemtypes.furnitype) {
      furnidata.roomitemtypes.furnitype.forEach((item: any) => {
        if (item.classname && item.furniline) {
          this.furnidataMap.set(item.classname, {
            classname: item.classname,
            furniline: item.furniline,
            description: item.description || '',
            category: item.category || 'clothing'
          });
        }
      });
    }
  }

  /**
   * Categoriza item baseado no tutorial ViaJovem
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
   * Detecta se item é duotone (baseado no tutorial ViaJovem)
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
   * Obtém cores disponíveis para uma categoria baseado na paleta
   */
  private getAvailableColors(category: string): string[] {
    if (!this.figureData) return ['1', '2', '3', '4', '5'];
    
    const paletteId = PALETTE_MAPPING[category] || '3';
    const palette = this.figureData.palettes.find(p => p.id === paletteId);
    
    if (palette) {
      return palette.colors
        .filter(color => color.selectable === '1')
        .map(color => color.id);
    }
    
    return ['1', '2', '3', '4', '5'];
  }

  /**
   * Gera URL da imagem do avatar (baseado no tutorial ViaJovem)
   */
  private generateAvatarImageUrl(type: string, id: string, gender: string, color: string = '1'): string {
    // Formato correto do ViaJovem: apenas a peça específica com dois hífens
    // Exemplo: ch-803-66-- (não avatar completo)
    const figureString = `${type}-${id}-${color}--`;
    
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=2&head_direction=2&action=gesture=std&size=m`;
  }

  /**
   * Gera URL da imagem duotone (duas cores)
   */
  private generateDuotoneImageUrl(type: string, id: string, primaryColor: string, secondaryColor: string, gender: string): string {
    // Formato correto do ViaJovem para duotone: apenas a peça específica com duas cores
    // Exemplo: ch-3001-66-- (duotone)
    const figureString = `${type}-${id}-${primaryColor}-${secondaryColor}--`;
    
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=2&head_direction=2&action=gesture=std&size=m`;
  }

  /**
   * Obtém categorias com itens (implementação principal)
   */
  async getCategories(): Promise<ViaJovemCategory[]> {
    await this.loadFigureData();
    await this.loadFurnidata();

    console.log('🔄 [ViaJovemComplete] Processing categories from figureData...');
    console.log('📊 [ViaJovemComplete] FigureData available:', !!this.figureData);
    console.log('📊 [ViaJovemComplete] Sets to process:', this.figureData?.sets.length || 0);

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
            paletteId: PALETTE_MAPPING[type] || '3',
            items: [],
            colors: [],
            gender: 'ALL'
          });
        }

        const category = categories.get(type)!;
        
        // Obter cores disponíveis para este tipo baseado na paleta
        const availableColors = this.getAvailableColors(type);

        // Categorizar item baseado no tutorial ViaJovem
        const categoryType = this.categorizeItem(set, part);
        
        // Detectar duotone
        const isDuotone = this.isDuotoneItem(part.colorindex);
        
        // Obter informações do furnidata
        const furnidataInfo = this.getFurnidataInfo(type, part.id);
        
        const item: ViaJovemClothingItem = {
          id: `${type}_${part.id}_${set.gender}_${set.id}`,
          figureId: part.id,
          category: type,
          gender: set.gender,
          categoryType,
          club: set.club,
          sellable: set.sellable,
          colorable: part.colorable,
          selectable: set.selectable,
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
          isColorable: part.colorable === '1',
          isSelectable: set.selectable === '1',
          name: furnidataInfo?.name || `${TYPE_DISPLAY_NAMES[type]} ${part.id}`
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

    console.log('✅ [ViaJovemComplete] Categories processed:', {
      totalCategories: categories.size,
      totalItems: Array.from(categories.values()).reduce((sum, cat) => sum + cat.items.length, 0)
    });

    return Array.from(categories.values());
  }

  /**
   * Dados mock para funcionar sem API externa
   */
  private getMockFigureData(): { palettes: ViaJovemPalette[], sets: ViaJovemSet[] } {
    return {
      palettes: [
        {
          id: '1',
          colors: [
            { id: '1', index: '1', club: '0', selectable: '1', hex: '#FFCB98' },
            { id: '2', index: '2', club: '0', selectable: '1', hex: '#F4AC54' },
            { id: '3', index: '3', club: '0', selectable: '1', hex: '#FF987F' }
          ]
        },
        {
          id: '2',
          colors: [
            { id: '21', index: '21', club: '0', selectable: '1', hex: '#000000' },
            { id: '45', index: '45', club: '0', selectable: '1', hex: '#8B4513' },
            { id: '61', index: '61', club: '0', selectable: '1', hex: '#FFD700' }
          ]
        },
        {
          id: '3',
          colors: [
            { id: '1', index: '1', club: '0', selectable: '1', hex: '#FF0000' },
            { id: '2', index: '2', club: '0', selectable: '1', hex: '#00FF00' },
            { id: '3', index: '3', club: '0', selectable: '1', hex: '#0000FF' }
          ]
        }
      ],
      sets: [
        // Rostos masculinos
        { id: '1', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '190', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '2', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '180', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Cabelos masculinos
        { id: '3', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '100', type: 'hr', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '4', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '101', type: 'hr', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Camisas masculinas
        { id: '5', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '210', type: 'ch', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '6', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '211', type: 'ch', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Calças masculinas
        { id: '7', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '270', type: 'lg', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '8', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '271', type: 'lg', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Sapatos masculinos
        { id: '9', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '290', type: 'sh', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '10', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '291', type: 'sh', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Corpos masculinos
        { id: '11', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '1', type: 'bd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Mãos masculinas
        { id: '12', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '1', type: 'rh', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '13', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '1', type: 'lh', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Rostos femininos
        { id: '14', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '600', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '15', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '610', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Cabelos femininos
        { id: '16', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '500', type: 'hr', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '17', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '501', type: 'hr', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Camisas femininas
        { id: '18', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '710', type: 'ch', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '19', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '711', type: 'ch', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Calças femininas
        { id: '20', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '870', type: 'lg', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '21', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '871', type: 'lg', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Sapatos femininos
        { id: '22', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '290', type: 'sh', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '23', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '291', type: 'sh', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Corpos femininos
        { id: '24', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '1', type: 'bd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Mãos femininas
        { id: '25', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '1', type: 'rh', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '26', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '1', type: 'lh', colorable: '1', index: '0', colorindex: '0' }
        ]}
      ]
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
    
    const categoryStats: Record<string, number> = {};
    categories.forEach(category => {
      categoryStats[category.id] = category.items.length;
    });
    
    return {
      totalCategories: categories.length,
      totalItems,
      categoryStats
    };
  }
}

// Instância singleton
export const viaJovemCompleteService = new ViaJovemCompleteService();
export default viaJovemCompleteService;
