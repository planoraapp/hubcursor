// src/services/HabboHubCompleteService.ts
// Implementação completa baseada no tutorial oficial do ViaJovem
// https://viajovem.blogspot.com/2023/01/as-roupas-visuais.html
// Adaptado para HabboHub

// Interfaces atualizadas seguindo a especificação técnica oficial
export interface HabboPalette {
  id: string;
  colors: Array<{
    id: string;
    index: string;
    club: string;
    selectable: string;
    hex: string;
  }>;
}

export interface HabboSet {
  id: string;
  gender: 'M' | 'F' | 'U';
  club: string;
  colorable: string;
  selectable: string;
  preselectable: string;
  sellable: string;
}

export interface HabboCategory {
  id: string;
  name: string;
  displayName: string;
  paletteId: string;
  items: HabboClothingItem[];
  colors: string[];
}

export interface HabboClothingItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  club: string;
  colorable: string;
  selectable: string;
  imageUrl: string;
  isSelectable: boolean;
  isColorable: boolean;
  isHidden?: boolean; // Item não selecionável (abordagem HabboNews)
}

// Interfaces legadas mantidas por compatibilidade
export interface HabboHubPalette extends HabboPalette {}
export interface HabboHubSet extends HabboSet {}
export interface HabboHubSetPart {
  id: string;
  type: string;
  colorable: string;
  index: string;
  colorindex: string;
}

export interface HabboHubClothingItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  categoryType: 'NORMAL' | 'HC' | 'NFT' | 'RARE' | 'LTD' | 'SELLABLE';
  club: string;
  sellable: string;
  colorable: string;
  selectable: string;
  furnidataClass?: string;
  furnidataFurniline?: string;
  colors: string[];
  isDuotone: boolean;
  primaryColorIndex?: string;
  secondaryColorIndex?: string;
  imageUrl: string;
  duotoneImageUrl?: string;
  isColorable: boolean;
  isSelectable: boolean;
  name: string;
}

export interface HabboHubCategory {
  id: string;
  name: string;
  displayName: string;
  type: string;
  paletteId: string;
  items: HabboHubClothingItem[];
  colors: string[];
  gender: 'ALL' | 'M' | 'F' | 'U';
}

// Mapeamento oficial de categorias seguindo a especificação técnica
const CATEGORY_MAPPING: Record<string, { name: string; group: string; paletteId: string }> = {
  // CABEÇA
  'hr': { name: 'Hair (Cabelo)', group: 'Cabeça', paletteId: '3' },
  'ha': { name: 'Hat (Chapéu)', group: 'Cabeça', paletteId: '3' },
  'he': { name: 'Head Acc. (Acess. Cabeça)', group: 'Cabeça', paletteId: '3' },
  'ea': { name: 'Eye Acc. (Óculos)', group: 'Cabeça', paletteId: '3' },
  'fa': { name: 'Face Acc. (Acess. Rosto/Barba)', group: 'Cabeça', paletteId: '3' },

  // CORPO
  'hd': { name: 'Head (Formato Rosto)', group: 'Corpo', paletteId: '1' },

  // TRONCO
  'ch': { name: 'Chest (Camisa)', group: 'Tronco', paletteId: '3' },
  'cc': { name: 'Chest Coat (Jaqueta/Casaco)', group: 'Tronco', paletteId: '3' },
  'cp': { name: 'Chest Print (Estampa)', group: 'Tronco', paletteId: '3' },
  'ca': { name: 'Chest Acc. (Colar/Cachecol)', group: 'Tronco', paletteId: '3' },

  // PERNAS
  'lg': { name: 'Legs (Calça)', group: 'Pernas', paletteId: '3' },
  'sh': { name: 'Shoes (Sapatos)', group: 'Pernas', paletteId: '3' },
  'wa': { name: 'Waist (Cinto)', group: 'Pernas', paletteId: '3' }
};

// Ordem lógica das categorias nos grupos
const CATEGORY_GROUPS = {
  'Cabeça': ['hr', 'ha', 'he', 'ea', 'fa'],
  'Corpo': ['hd'],
  'Tronco': ['ch', 'cc', 'cp', 'ca'],
  'Pernas': ['lg', 'sh', 'wa']
};

// Categorias que são obrigatórias (não podem ser removidas)
const REQUIRED_CATEGORIES = ['hd', 'hr', 'ch', 'lg', 'sh'];

// Categorias que usam headonly=1 na API de imagens
const HEADONLY_CATEGORIES = ['hr', 'ha', 'he', 'ea', 'fa', 'hd'];

// Interfaces legadas mantidas por compatibilidade
const TYPE_DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_MAPPING).map(([key, value]) => [key, value.name])
);

const PALETTE_MAPPING: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_MAPPING).map(([key, value]) => [key, value.paletteId])
);

// Coleções NFT conhecidas (baseado no ViaJovem)
const NFT_COLLECTIONS = [
  'nft2025', 'nft2024', 'nft2023', 'nft', 'nftmint', 'testing'
];

export class HabboHubCompleteService {
  private cache = new Map<string, any>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas
  private habboData: { palettes: HabboPalette[], categories: HabboCategory[] } | null = null;

  /**
   * Carrega dados oficiais do Habbo seguindo a especificação técnica
   * 1. Busca external_variables para obter a URL base
   * 2. Monta URL do figuredata.xml
   * 3. Parseia o XML oficial
   */
  async loadHabboData(): Promise<{ palettes: HabboPalette[], categories: HabboCategory[] }> {
    const cacheKey = 'habbo_official_data';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      console.log('🔍 [HabboHubCompleteService] Buscando versão atual do Gordon...');

      // 1. Buscar external_variables para obter a URL base
      const gordonVersion = await this.fetchGordonVersion();
      const figuredataUrl = `https://images.habbo.com/gordon/flash-assets-${gordonVersion}/figuredata.xml`;

      console.log(`📡 [HabboHubCompleteService] Carregando figuredata.xml: ${figuredataUrl}`);

      // 2. Carregar o figuredata.xml oficial
      const response = await fetch(figuredataUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      const habboData = this.parseFigureDataXML(xmlText);

      console.log('✅ [HabboHubCompleteService] Dados oficiais carregados com sucesso!');
      console.log(`📊 [HabboHubCompleteService] Paletas: ${habboData.palettes.length}, Categorias: ${habboData.categories.length}`);

      this.cache.set(cacheKey, {
        data: habboData,
        timestamp: Date.now()
      });

      this.habboData = habboData;
      return habboData;

    } catch (error) {
      console.warn('❌ [HabboHubCompleteService] Erro ao carregar dados oficiais:', error);

      // Fallback: dados mock
      console.log('🎭 [HabboHubCompleteService] Usando dados mock como fallback');
      const mockData = this.getMockHabboData();
      this.cache.set(cacheKey, {
        data: mockData,
        timestamp: Date.now()
      });
      this.habboData = mockData;
      return mockData;
    }
  }

  /**
   * Carrega furnidata.json do Habbo BR
   */
  async loadFurnidata(): Promise<void> {
    const cacheKey = 'habbohub_complete_furnidata';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      this.furnidataMap = cached.data;
      return;
    }

    try {
            // Usar proxy do Vite para resolver CORS
      const response = await fetch('/api/habbo/gamedata/furnidata/1');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const furnidata = await response.json();
      this.processFurnidata(furnidata);

      this.cache.set(cacheKey, {
        data: this.furnidataMap,
        timestamp: Date.now()
      });

          } catch (error) {
            this.loadMockFurnidata();
    }
  }

  /**
   * Parsear XML do figuredata seguindo a especificação técnica oficial
   * Converte o XML para a estrutura de dados do editor
   */
  private parseFigureDataXML(xmlText: string): { palettes: HabboPalette[], categories: HabboCategory[] } {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Verificar erros de parsing
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Failed to parse XML');
    }

    const palettes: HabboPalette[] = [];
    const categories: HabboCategory[] = [];

    // 1. Parsear palettes (cores)
    const paletteElements = xmlDoc.querySelectorAll('palette');
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

    // 2. Parsear settypes (categorias) e sets (itens)
    const settypeElements = xmlDoc.querySelectorAll('settype');
    settypeElements.forEach(settype => {
      const type = settype.getAttribute('type') || '';
      const paletteId = settype.getAttribute('paletteid') || '3';

      // Verificar se é uma categoria conhecida
      if (!CATEGORY_MAPPING[type]) {
        console.log(`⚠️ [parseFigureDataXML] Categoria desconhecida pulada: ${type}`);
        return;
      }

      const categoryInfo = CATEGORY_MAPPING[type];
      const items: HabboClothingItem[] = [];

      // Parsear sets dentro desta categoria
      settype.querySelectorAll('set').forEach(set => {
        const id = set.getAttribute('id') || '';
        const gender = (set.getAttribute('gender') as 'M' | 'F' | 'U') || 'U';
        const club = set.getAttribute('club') || '0';
        const colorable = set.getAttribute('colorable') || '0';
        const selectable = set.getAttribute('selectable') || '1';

        // Abordagem HabboNews: incluir TODOS os itens, mesmo os não selecionáveis
        // (útil para descobrir roupas ocultas, de staff, futuras atualizações, etc.)
        const isHidden = selectable === '0';

        const item: HabboClothingItem = {
          id: `${type}-${id}`,
          figureId: id,
          category: type,
          gender,
          club,
          colorable,
          selectable,
          imageUrl: this.generateThumbnailUrl(type, id, '7'), // Cor padrão para preview
          isSelectable: selectable === '1',
          isColorable: colorable === '1',
          isHidden
        };

        items.push(item);
      });

      // Criar categoria apenas se tiver itens
      if (items.length > 0) {
        const category: HabboCategory = {
          id: type,
          name: type,
          displayName: categoryInfo.name,
          paletteId,
          items,
          colors: [] // Será preenchido depois
        };

        categories.push(category);
      }
    });

    // 3. Preencher cores disponíveis para cada categoria
    categories.forEach(category => {
      const palette = palettes.find(p => p.id === category.paletteId);
      if (palette) {
        category.colors = palette.colors
          .map(color => color.id); // Incluir todas as cores (HabboNews approach)
      }
    });

    return { palettes, categories };
  }

  /**
   * Processa o furnidata.json
   */
  private processFurnidata(furnidata: any): void {
    if (furnidata && furnidata.roomitemtypes && Array.isArray(furnidata.roomitemtypes.furnitype)) {
      furnidata.roomitemtypes.furnitype.forEach((item: any) => {
        if (item.classname && item.classname.startsWith('clothing_')) {
          this.furnidataMap.set(item.classname, {
            classname: item.classname,
            name: item.name || 'Nome não encontrado',
            description: item.description || '',
            furniline: item.furniline || '',
            revision: item.revision || '0'
          });
        }
      });
    }

    console.log(`📋 [HabboHubCompleteService] Furnidata processado: ${this.furnidataMap.size} itens de roupa`);
  }

  /**
   * Carrega dados mock do furnidata (fallback)
   */
  private async loadMockFurnidata(): Promise<void> {
    try {
      const response = await fetch('/handitems/furnidata.json');
      if (response.ok) {
        const furnidata = await response.json();
        this.processFurnidata(furnidata);
      }
    } catch (error) {
      console.warn('❌ [HabboHubCompleteService] Erro ao carregar furnidata mock:', error);
    }
  }

  /**
   * Categoriza item baseado no tutorial oficial ViaJovem
   * https://viajovem.blogspot.com/2023/01/as-roupas-visuais.html
   * Adaptado para HabboHub
   *
   * • Roupas normais: não possuem sellable="1" no figuredata.xml
   * • Roupas HC: club="2" no figuredata.xml
   * • Roupas NFT: furniline contém coleções ["nft2025", "nft2024", "nft2023", "nft", "nftmint", "testing"]
   * • Roupas RARE: classname inicia com "clothing_r..."
   * • Roupas LTD: classname inicia com "clothing_ltd..."
   */
  private categorizeItem(set: HabboHubSet, part: HabboHubSetPart): 'NORMAL' | 'HC' | 'NFT' | 'RARE' | 'LTD' | 'SELLABLE' {
    // 1. Verificar HC: club="2" no figuredata.xml
    if (set.club === '2') {
      return 'HC';
    }

    // 2. Verificar vendável: sellable="1" no figuredata.xml
    if (set.sellable === '1') {
      return 'SELLABLE';
    }

    // 3. Verificar NFT, RARE, LTD no furnidata.json
    const furnidataInfo = this.getFurnidataInfo(part.type, part.id);
    if (furnidataInfo) {
      // NFT: furniline contém coleções NFT (conforme tutorial ViaJovem)
      if (furnidataInfo.furniline && NFT_COLLECTIONS.includes(furnidataInfo.furniline)) {
        return 'NFT';
      }

      // RARE: classname começa com "clothing_r" (conforme tutorial ViaJovem)
      if (furnidataInfo.classname.startsWith('clothing_r')) {
        return 'RARE';
      }

      // LTD: classname começa com "clothing_ltd" (conforme tutorial ViaJovem)
      if (furnidataInfo.classname.startsWith('clothing_ltd')) {
        return 'LTD';
      }
    }

    // 4. Padrão: roupas normais (não possuem sellable="1")
    return 'NORMAL';
  }

  /**
   * Detecta se item é duotone (baseado no tutorial oficial ViaJovem)
   * https://viajovem.blogspot.com/2023/01/as-roupas-visuais.html
   * Adaptado para HabboHub
   *
   * "As roupas em que a paleta 3 é utilizada e possuem dois tons de cor,
   * utilizam no figuredata.xml a identificação colorindex="1" e colorindex="2""
   */
  private isDuotoneItem(parts: HabboHubSetPart[]): boolean {
    // Verificar se há partes com colorindex="1" e colorindex="2"
    const hasColorIndex1 = parts.some(part => part.colorindex === '1');
    const hasColorIndex2 = parts.some(part => part.colorindex === '2');

    return hasColorIndex1 && hasColorIndex2;
  }

  /**
   * Obtém informações do furnidata para um item
   */
  public getFurnidataInfo(type: string, id: string): any {
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
   * Busca nomes SWF de múltiplos itens de uma categoria
   */
  public async getItemsNames(category: string, ids: string[]): Promise<Array<{id: string, classname: string, name: string, furniline: string}>> {
    // Garantir que o furnidata está carregado
    await this.loadFurnidata();

    const results = [];

    for (const id of ids) {
      const furnidataInfo = this.getFurnidataInfo(category, id);

      if (furnidataInfo) {
        results.push({
          id: `${category}-${id}`,
          classname: furnidataInfo.classname,
          name: furnidataInfo.name || 'Nome não encontrado',
          furniline: furnidataInfo.furniline || 'N/A'
        });
      } else {
        results.push({
          id: `${category}-${id}`,
          classname: 'N/A',
          name: 'Nome não encontrado',
          furniline: 'N/A'
        });
      }
    }

    return results;
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
        .map(color => color.id); // Incluir todas as cores (HabboNews approach)
    }

    return ['1', '2', '3', '4', '5'];
  }

  /**
   * Gera URL da imagem do avatar (formato habbo-imaging correto)
   */
  private generateAvatarImageUrl(type: string, id: string, gender: string, color: string = '7'): string {
    // Formato correto do habbo-imaging baseado na referência
    // Para rostos, usar cor padrão 7 (pele)
    // Para camisetas e itens duotone, usar duas cores: 66-61
    let figureString;
    if (type === 'ch') {
      // IMPORTANTE: Camisetas DEVEM usar o formato correto -66-61, não apenas -7
      figureString = `${type}-${id}-66-61`;
      console.log(`🖼️ [generateAvatarImageUrl] Gerando URL para camiseta: ${figureString}`);
    } else if (type === 'hd') {
      figureString = `${type}-${id}-7`; // Rostos usam cor simples
    } else {
      figureString = `${type}-${id}-${color}`; // Outros itens usam cor simples
    }

    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=2&head_direction=2&size=l&img_format=png`;
  }

  /**
   * Gera URL da imagem duotone (duas cores)
   */
  private generateDuotoneImageUrl(type: string, id: string, primaryColor: string, secondaryColor: string, gender: string): string {
    // Formato correto do habbo-imaging para duotone baseado na referência
    // Usar cores padrão 66-61 para camisetas duotone
    const figureString = type === 'ch' ? `${type}-${id}-66-61` : `${type}-${id}-${primaryColor}-${secondaryColor}`;

    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=2&head_direction=2&size=l&img_format=png`;
  }

  /**
   * Busca a versão atual do Gordon através do external_variables
   * Seguindo a especificação técnica oficial
   */
  private async fetchGordonVersion(): Promise<string> {
    try {
      console.log('🔍 [HabboHubCompleteService] Buscando versão atual do Gordon...');

      // 1. Tentar Habbo Brasil (mais estável para produção)
      const habboResponse = await fetch('https://www.habbo.com.br/gamedata/external_variables/1');
      if (habboResponse.ok) {
        const text = await habboResponse.text();
        const match = text.match(/flash\.client\.url=(.+)/);
        if (match && match[1]) {
          const url = match[1];
          const versionMatch = url.match(/PRODUCTION-(\d{4}\d{2}\d{2}-\d{9})/);
          if (versionMatch) {
            console.log(`✅ [HabboHubCompleteService] Versão do Gordon (habbo.com.br): ${versionMatch[1]}`);
            return versionMatch[1];
          }
        }
      }

      // 2. Fallback para sandbox (para novidades)
      const sandboxResponse = await fetch('https://sandbox.habbo.com/gamedata/external_variables/1');
      if (sandboxResponse.ok) {
        const text = await sandboxResponse.text();
        const match = text.match(/flash\.client\.url=(.+)/);
        if (match && match[1]) {
          const url = match[1];
          const versionMatch = url.match(/PRODUCTION-(\d{4}\d{2}\d{2}-\d{9})/);
          if (versionMatch) {
            console.log(`✅ [HabboHubCompleteService] Versão do Gordon (sandbox): ${versionMatch[1]}`);
            return versionMatch[1];
          }
        }
      }

      // 3. Fallback para versão hardcoded conhecida
      console.warn('⚠️ [HabboHubCompleteService] Não foi possível obter versão atual, usando fallback');
      return '202601121522-867048149'; // Versão atual conhecida

    } catch (error) {
      console.error('❌ [HabboHubCompleteService] Erro ao buscar versão do Gordon:', error);
      return '202601121522-867048149'; // Versão atual conhecida
    }
  }

  /**
   * Gera URL de miniatura para grid seguindo a especificação técnica
   */
  private generateThumbnailUrl(type: string, id: string, color: string): string {
    const headOnly = HEADONLY_CATEGORIES.includes(type) ? '1' : '0';
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${type}-${id}-${color}&size=m&headonly=${headOnly}`;
  }

  /**
   * Gera URL do avatar completo para preview
   */
  private generateAvatarUrl(figureString: string): string {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=l&direction=2&head_direction=2&action=std&gesture=std`;
  }

  /**
   * Busca dados reais do figuremap.xml
   */
  private async fetchFigureMapData(): Promise<any[]> {
    try {
      console.log('🔍 [HabboHubCompleteService] Buscando dados do figuremap.xml...');

      const version = await this.fetchGordonVersion();
      const figuremapUrl = `https://images.habbo.com/gordon/flash-assets-PRODUCTION-${version}/figuremap.xml`;

      console.log(`📡 [HabboHubCompleteService] URL do figuremap: ${figuremapUrl}`);

      const response = await fetch(figuremapUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      const libraries = xmlDoc.querySelectorAll('lib');
      const figureData: any[] = [];

      libraries.forEach(lib => {
        const libId = lib.getAttribute('id');
        const revision = lib.getAttribute('revision');

        if (libId && revision) {
          const parts: any[] = [];
          const partElements = lib.querySelectorAll('part');

          partElements.forEach(part => {
            const partId = part.getAttribute('id');
            const partType = part.getAttribute('type');

            if (partId && partType) {
              parts.push({
                id: partId,
                type: partType
              });
            }
          });

          figureData.push({
            id: libId,
            revision: revision,
            parts: parts
          });
        }
      });

      console.log(`✅ [HabboHubCompleteService] Figuremap carregado: ${figureData.length} bibliotecas`);

      return figureData;

    } catch (error) {
      console.error('❌ [HabboHubCompleteService] Erro ao buscar figuremap:', error);
      // Retornar array vazio para usar dados mock na função getCategories
      return [];
    }
  }

  /**
   * Converte dados reais do figuremap.xml para o formato HabboHubSet[]
   */
  private convertFigureMapToHabboHubFormat(figureData: any[]): HabboHubSet[] {
    const sets: HabboHubSet[] = [];

    figureData.forEach(lib => {
      const libId = lib.id;
      const parts = lib.parts || [];

        // Para cada parte da biblioteca, criar um set HabboHub
      parts.forEach((part: any) => {
        const partId = part.id;
        const partType = part.type;

        // Determinar gênero baseado no nome da biblioteca (U = Unisex, M = Male, F = Female)
        let gender: 'M' | 'F' | 'U' = 'U';
        if (libId.includes('_M_')) gender = 'M';
        else if (libId.includes('_F_')) gender = 'F';

        // Determinar se é HC baseado no nome
        const isHC = libId.includes('_hc') || libId.includes('club');

        // Determinar se é vendável
        const isSellable = libId.includes('sellable') || libId.includes('nft') ||
                          libId.includes('limited') || libId.includes('rare');

        // Criar o set HabboHub
        const set: HabboHubSet = {
          id: `${partType}-${partId}`,
          gender: gender,
          club: isHC ? '2' : '0',
          colorable: partType === 'hd' ? '0' : '1', // Rostos geralmente não são coloráveis
          selectable: '1',
          preselectable: '0',
          sellable: isSellable ? '1' : '0',
          parts: [{
            id: partId,
            type: partType,
            colorable: partType === 'hd' ? '0' : '1',
            index: '0',
            colorindex: '0'
          }]
        };

        sets.push(set);
      });
    });

    const hdSets = sets.filter(set => set.parts.some(part => part.type === 'hd'));
    console.log(`🔄 [HabboHubCompleteService] Convertidos ${sets.length} sets totais, ${hdSets.length} sets com hd`);

    console.log(`🔄 [HabboHubCompleteService] Convertidos ${sets.length} sets do figuremap`);
    return sets;
  }

  /**
   * Obtém categorias com itens seguindo a especificação técnica oficial
   */
  async getCategories(): Promise<HabboCategory[]> {
    console.log('🎯 [HabboHubCompleteService] Carregando dados oficiais do Habbo...');

    const habboData = await this.loadHabboData();

    // Organizar categorias por grupos lógicos
    const groupedCategories: HabboCategory[] = [];

    Object.entries(CATEGORY_GROUPS).forEach(([groupName, categoryIds]) => {
      categoryIds.forEach(categoryId => {
        const category = habboData.categories.find(cat => cat.id === categoryId);
        if (category) {
          groupedCategories.push(category);
        }
      });
    });

    console.log(`📊 [HabboHubCompleteService] Categorias organizadas: ${groupedCategories.length}`);
    console.log(`🎨 [HabboHubCompleteService] Paletas disponíveis: ${habboData.palettes.length}`);

    return groupedCategories;
  }

  /**
   * Filtra itens por gênero seguindo a especificação técnica
   */
  getItemsByGender(categoryId: string, gender: 'M' | 'F' | 'U' | 'ALL'): HabboClothingItem[] {
    if (!this.habboData) return [];

    const category = this.habboData.categories.find(cat => cat.id === categoryId);
    if (!category) return [];

    return category.items.filter(item => {
      if (gender === 'ALL') return true;
      return item.gender === gender || item.gender === 'U';
    });
  }

  /**
   * Obtém paleta de cores para uma categoria
   */
  getPaletteForCategory(categoryId: string): HabboPalette | null {
    if (!this.habboData) return null;

    const category = this.habboData.categories.find(cat => cat.id === categoryId);
    if (!category) return null;

    return this.habboData.palettes.find(palette => palette.id === category.paletteId) || null;
  }

  /**
   * Processa os dados carregados e cria as categorias HabboHub
   * Baseado no tutorial ViaJovem, adaptado para HabboHub
   */
  private processCategories(): HabboHubCategory[] {
    if (!this.figureData) {
      throw new Error('Dados figure não carregados');
    }

    const categories = new Map<string, HabboHubCategory>();

    // Agrupar sets por tipo (apenas categorias válidas conforme ViaJovem)
    // Adaptado para HabboHub
    const validCategories = ['hd', 'hr', 'ch', 'cc', 'lg', 'sh', 'ha', 'ea', 'fa', 'he', 'ca', 'wa', 'cp'];
    const processedItems = new Set<string>(); // Para evitar duplicatas

    this.figureData.sets.forEach(set => {
      set.parts.forEach(part => {
        const type = part.type;

        // Filtrar apenas categorias válidas
        if (!validCategories.includes(type)) {
          console.log(`⚠️ [process] Tipo inválido pulado: ${type}-${part.id}`);
          return; // Pular categorias inválidas
        }


        // Criar chave única para evitar duplicatas (tipo + id + gênero)
        const uniqueKey = `${type}_${part.id}_${set.gender}`;

        // Correção de categorização para itens específicos com dados incorretos
        let correctedType = type;

        // Sistema de correção baseado em padrões reais do Habbo
        const id = parseInt(part.id);

        // Função para aplicar correção com log
        const applyCorrection = (fromType: string, toType: string, itemName: string) => {
          if (type === fromType) {
            correctedType = toType;
            console.log(`🔧 [CORREÇÃO] ${itemName} ${part.id} corrigido de '${fromType}' para '${toType}'`);
            return true;
          }
          return false;
        };

        // CORREÇÕES BASEADAS NOS PADRÕES VISUAIS FORNECIDOS PELO USUÁRIO

        // DEFINIÇÃO DOS IDs VÁLIDOS PARA CADA CATEGORIA BASEADO NO HTML FORNECIDO

        // ROSTOS (hd) - IDs válidos
        const validHdIds = [
          // nonhc
          180, 185, 190, 195, 200, 205, 206, 207, 208, 209,
          // hc
          3091, 3092, 3093, 3094, 3095, 3101, 3102, 3103,
          // sell
          3536, 3537, 3600, 3603, 3604, 3631, 3704, 3721, 3813, 3814, 3845,
          3956, 3997, 4015, 4023, 4163, 4174, 4202, 4203, 4204, 4205, 4206,
          4266, 4267, 4268, 4279, 4280, 4287, 4383
        ];

        // CABELO (hr) - IDs válidos
        const validHrIds = [
          // nonhc
          100, 105, 110, 115, 125, 135, 145, 155, 165, 170, 676, 679, 681, 802, 830, 889, 891, 892, 893, 3090,
          // hc
          677, 678, 828, 829, 831, 3011, 3020, 3021, 3025, 3041, 3043, 3048, 3056, 3162, 3163, 3172, 3194, 3247, 3256, 3260, 3278, 3281,
          // sell (muitos IDs, incluindo 3322 até 4996)
        ];

        // CHAPÉUS (ha) - IDs válidos
        const validHaIds = [
          // nonhc
          1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1013, 1014, 1015, 1017, 1018, 1020, 1021, 1022, 1023, 3117, 3173, 3254, 3298, 3300,
          // hc
          1011, 1012, 1016, 1019, 1024, 1025, 1026, 1027, 3026, 3054, 3086, 3118, 3129, 3130, 3139, 3140, 3144, 3145, 3150, 3156, 3171, 3179, 3209, 3231, 3236, 3238, 3240, 3241, 3242, 3243, 3253, 3259, 3261, 3265, 3268, 3272, 3291, 3305,
          // sell (muitos IDs de 3331 até 5012)
        ];

        // ACESSÓRIOS DE CABEÇA (he) - IDs válidos
        const validHeIds = [
          // nonhc
          1601, 1602, 1605, 1606, 1608, 1609, 1610, 3274, 3297, 3543,
          // hc
          1603, 1604, 1607, 3069, 3070, 3071, 3079, 3081, 3082, 3146, 3149, 3155, 3164, 3181, 3189, 3218, 3227, 3228, 3229, 3239, 3258, 3295,
          // sell (muitos IDs)
        ];

        // ÓCULOS (ea) - IDs válidos
        const validEaIds = [
          // nonhc
          1401, 1403, 1404, 1406,
          // hc
          1402, 1405, 3083, 3107, 3108, 3141, 3148, 3168, 3169, 3170, 3196, 3224, 3226, 3262, 3270,
          // sell
          3318, 3388, 3484, 3493, 3574, 3575, 3576, 3577, 3578, 3639, 3640, 3641, 3698, 3726, 3727, 3749, 3750, 3751, 3803, 3822, 3886, 3887, 3925, 3959, 3960, 3961, 3962, 3978, 4021, 4161, 4212, 4302, 4346, 4968, 4985, 4986, 4987, 4988, 5007, 5008, 5009
        ];

        // ACESSÓRIOS FACIAIS/BARBAS/MÁSCARAS (fa) - IDs válidos
        const validFaIds = [
          // nonhc
          1201, 1202, 1204, 1205, 1206, 1208, 1210, 1211, 1212, 3147, 3276, 3590,
          // hc
          1203, 1207, 1209, 3193, 3230, 3296, 3350,
          // sell
          3344, 3345, 3346, 3378, 3462, 3470, 3471, 3472, 3473, 3474, 3475, 3476, 3553, 3592, 3597, 3663, 3700, 3771, 3812, 3815, 3816, 3832, 3865, 3888, 3963, 3964, 3965, 3966, 3993, 4013, 4014, 4042, 4043, 4044, 4045, 4046, 4047, 4048, 4049, 4058, 4168, 4185, 4211, 4283
        ];

        // CAMISETAS (ch) - IDs válidos
        const validChIds = [
          // nonhc
          210, 215, 220, 225, 230, 235, 240, 245, 250, 255, 262, 265, 266, 267, 804, 805, 806, 807, 808, 809, 875, 876, 877, 878, 3030, 3109, 3110, 3111,
          // hc
          803, 3001, 3015, 3022, 3032, 3038, 3050, 3059, 3077, 3167, 3185, 3203, 3208, 3215, 3222, 3234, 3237, 3279,
          // sell (muitos IDs - incluindo todos os sellable do HTML)
        ];

        // ESTAMPAS (cp) - IDs válidos
        const validCpIds = [
          // nonhc
          3119, 3120, 3121, 3122, 3123, 3124, 3125, 3126, 3127, 3128, 3284, 3286, 3288,
          // hc
          3204, 3205, 3307, 3308, 3309, 3310, 3311, 3312, 3313, 3314, 3315, 3316, 3317,
          // sell
          3402, 3403
        ];

        // JAQUETAS (cc) - IDs válidos
        const validCcIds = [
          // nonhc
          260, 3280, 3294,
          // hc
          886, 887, 3002, 3007, 3009, 3039, 3075, 3087, 3152, 3153, 3158, 3186, 3232, 3246, 3269, 3289, 3299,
          // sell (muitos IDs - incluindo todos os sellable do HTML)
        ];

        // ACESSÓRIOS DE PEITO (ca) - IDs válidos
        const validCaIds = [
          // nonhc
          1801, 1802, 1803, 1804, 1805, 1806, 1807, 1808, 1809, 1810, 1812, 1813, 1815, 1817, 1818, 1819, 3176,
          // hc
          1811, 1814, 1816, 3084, 3085, 3131, 3151, 3175, 3177, 3187, 3217, 3219, 3223, 3225, 3292, 3511,
          // sell (muitos IDs - incluindo todos os sellable do HTML)
        ];

        // CALÇAS (lg) - IDs válidos (HTML mostrou "ca" mas contexto indica calças)
        const validLgIds = [
          // nonhc
          1801, 1802, 1803, 1804, 1805, 1806, 1807, 1808, 1809, 1810, 1812, 1813, 1815, 1817, 1818, 1819, 3176,
          // hc
          1811, 1814, 1816, 3084, 3085, 3131, 3151, 3175, 3177, 3187, 3217, 3219, 3223, 3225, 3292, 3511,
          // sell (muitos IDs - incluindo todos os sellable do HTML)
        ];

        // SAPATOS (sh) - IDs válidos
        const validShIds = [
          // nonhc
          290, 295, 300, 305, 905, 906, 908, 3068, 3115,
          // hc
          3016, 3027, 3035, 3089, 3154, 3206, 3252, 3275,
          // sell
          3338, 3348, 3354, 3375, 3383, 3419, 3435, 3467, 3524, 3587, 3595, 3611, 3619, 3621, 3687, 3693, 3719, 3720, 3783, 4016, 4030, 4064, 4065, 4112, 4159
        ];

        // CINTOS (wa) - IDs válidos
        const validWaIds = [
          // nonhc
          2001, 2002, 2004, 2006, 2007, 2008, 2009, 2011, 2012, 3074, 3211,
          // hc
          2003, 2005, 3072, 3073, 3080, 3212, 3263, 3264,
          // sell
          3359, 3366, 3427, 3504, 3661, 3773, 3798, 3872, 3895, 4040, 4060, 4317
        ];

        // CORREÇÕES ESPECÍFICAS BASEADAS NOS IDs VÁLIDOS

        // 1. ITENS QUE APARECEM COMO CABELO MAS SÃO ESTAMPAS (hr -> cp)
        if (id === 3316) {
          applyCorrection('hr', 'cp', 'Estampa disfarçada de cabelo');
        }

        // 2. ITENS QUE APARECEM COMO ESTAMPAS MAS SÃO CALÇAS (cp -> lg)
        if (id === 6290) {
          applyCorrection('cp', 'lg', 'Calça disfarçada de estampa');
        }

        // 3. ITENS QUE APARECEM COMO CALÇAS MAS SÃO CABELO (lg -> hr)
        if (id === 3777) {
          applyCorrection('lg', 'hr', 'Cabelo disfarçado de calça');
        }

        // 4. CORREÇÕES PARA GARANTIR QUE ITENS ESTEJAM NAS CATEGORIAS CORRETAS
        // Se um ID está na lista de rostos válidos mas aparece em outra categoria
        if (validHdIds.includes(id) && type !== 'hd') {
          applyCorrection(type, 'hd', 'Rosto movido para categoria correta');
        }

        // Se um ID está na lista de cabelos válidos mas aparece em outra categoria
        if (validHrIds.includes(id) && type !== 'hr') {
          applyCorrection(type, 'hr', 'Cabelo movido para categoria correta');
        }

        // Se um ID está na lista de chapéus válidos mas aparece em outra categoria
        if (validHaIds.includes(id) && type !== 'ha') {
          applyCorrection(type, 'ha', 'Chapéu movido para categoria correta');
        }

        // Se um ID está na lista de acessórios de cabeça válidos mas aparece em outra categoria
        if (validHeIds.includes(id) && type !== 'he') {
          applyCorrection(type, 'he', 'Acessório de cabeça movido para categoria correta');
        }

        // Se um ID está na lista de óculos válidos mas aparece em outra categoria
        if (validEaIds.includes(id) && type !== 'ea') {
          applyCorrection(type, 'ea', 'Óculos movido para categoria correta');
        }

        // Se um ID está na lista de acessórios faciais válidos mas aparece em outra categoria
        if (validFaIds.includes(id) && type !== 'fa') {
          applyCorrection(type, 'fa', 'Acessório facial movido para categoria correta');
        }

        // Se um ID está na lista de camisetas válidas mas aparece em outra categoria
        if (validChIds.includes(id) && type !== 'ch') {
          applyCorrection(type, 'ch', 'Camiseta movida para categoria correta');
        }

        // Se um ID está na lista de estampas válidas mas aparece em outra categoria
        if (validCpIds.includes(id) && type !== 'cp') {
          applyCorrection(type, 'cp', 'Estampa movida para categoria correta');
        }

        // Se um ID está na lista de jaquetas válidas mas aparece em outra categoria
        if (validCcIds.includes(id) && type !== 'cc') {
          applyCorrection(type, 'cc', 'Jaqueta movida para categoria correta');
        }

        // Se um ID está na lista de acessórios de peito válidos mas aparece em outra categoria
        if (validCaIds.includes(id) && type !== 'ca') {
          applyCorrection(type, 'ca', 'Acessório de peito movido para categoria correta');
        }

        // Se um ID está na lista de calças válidas mas aparece em outra categoria
        if (validLgIds.includes(id) && type !== 'lg') {
          applyCorrection(type, 'lg', 'Calça movida para categoria correta');
        }

        // Se um ID está na lista de sapatos válidos mas aparece em outra categoria
        if (validShIds.includes(id) && type !== 'sh') {
          applyCorrection(type, 'sh', 'Sapato movido para categoria correta');
        }

        // Se um ID está na lista de cintos válidos mas aparece em outra categoria
        if (validWaIds.includes(id) && type !== 'wa') {
          applyCorrection(type, 'wa', 'Cinto movido para categoria correta');
        }

        // REGRAS HEURÍSTICAS PARA ITENS NÃO LISTADOS MAS QUE SEGUEM PADRÕES

        // 5. CORREÇÕES BASEADAS EM PADRÕES DE IDs

        // IDs de rostos geralmente estão entre 180-250 e acima de 3000
        if ((id >= 180 && id <= 250) || id >= 3000) {
          if (type !== 'hd' && !validHdIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHrIds.includes(id) && !validHaIds.includes(id) && !validHeIds.includes(id) && !validEaIds.includes(id) && !validFaIds.includes(id)) {
              applyCorrection(type, 'hd', 'Possível rosto baseado no padrão de ID');
            }
          }
        }

        // IDs de cabelos geralmente estão entre 100-200 e 676-893
        if ((id >= 100 && id <= 200) || (id >= 676 && id <= 893)) {
          if (type !== 'hr' && !validHrIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHdIds.includes(id) && !validHaIds.includes(id) && !validHeIds.includes(id) && !validEaIds.includes(id) && !validFaIds.includes(id)) {
              applyCorrection(type, 'hr', 'Possível cabelo baseado no padrão de ID');
            }
          }
        }

        // IDs de chapéus geralmente estão entre 1001-1023
        if (id >= 1001 && id <= 1023) {
          if (type !== 'ha' && !validHaIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHdIds.includes(id) && !validHrIds.includes(id) && !validHeIds.includes(id) && !validEaIds.includes(id) && !validFaIds.includes(id)) {
              applyCorrection(type, 'ha', 'Possível chapéu baseado no padrão de ID');
            }
          }
        }

        // IDs de acessórios de cabeça geralmente estão entre 1601-1610
        if (id >= 1601 && id <= 1610) {
          if (type !== 'he' && !validHeIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHdIds.includes(id) && !validHrIds.includes(id) && !validHaIds.includes(id) && !validEaIds.includes(id) && !validFaIds.includes(id)) {
              applyCorrection(type, 'he', 'Possível acessório de cabeça baseado no padrão de ID');
            }
          }
        }

        // IDs de óculos geralmente estão entre 1401-1406
        if (id >= 1401 && id <= 1406) {
          if (type !== 'ea' && !validEaIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHdIds.includes(id) && !validHrIds.includes(id) && !validHaIds.includes(id) && !validHeIds.includes(id) && !validFaIds.includes(id)) {
              applyCorrection(type, 'ea', 'Possível óculos baseado no padrão de ID');
            }
          }
        }

        // IDs de acessórios faciais geralmente estão entre 1201-1212
        if (id >= 1201 && id <= 1212) {
          if (type !== 'fa' && !validFaIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHdIds.includes(id) && !validHrIds.includes(id) && !validHaIds.includes(id) && !validHeIds.includes(id) && !validEaIds.includes(id)) {
              applyCorrection(type, 'fa', 'Possível acessório facial baseado no padrão de ID');
            }
          }
        }

        // IDs de camisetas geralmente estão entre 210-267 e 800-878, 3000-3111
        if ((id >= 210 && id <= 267) || (id >= 800 && id <= 878) || (id >= 3000 && id <= 3111)) {
          if (type !== 'ch' && !validChIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHdIds.includes(id) && !validHrIds.includes(id) && !validHaIds.includes(id) && !validHeIds.includes(id) && !validEaIds.includes(id) && !validFaIds.includes(id) && !validCpIds.includes(id) && !validCcIds.includes(id) && !validCaIds.includes(id)) {
              applyCorrection(type, 'ch', 'Possível camiseta baseado no padrão de ID');
            }
          }
        }

        // IDs de estampas geralmente estão entre 3119-3128 e 3284-3317
        if ((id >= 3119 && id <= 3128) || (id >= 3284 && id <= 3317) || (id >= 3402 && id <= 3403)) {
          if (type !== 'cp' && !validCpIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHdIds.includes(id) && !validHrIds.includes(id) && !validHaIds.includes(id) && !validHeIds.includes(id) && !validEaIds.includes(id) && !validFaIds.includes(id) && !validChIds.includes(id) && !validCcIds.includes(id) && !validCaIds.includes(id)) {
              applyCorrection(type, 'cp', 'Possível estampa baseado no padrão de ID');
            }
          }
        }

        // IDs de jaquetas geralmente estão entre 260-260 e 886-887, 3002-3299
        if ((id >= 260 && id <= 260) || (id >= 886 && id <= 887) || (id >= 3002 && id <= 3299)) {
          if (type !== 'cc' && !validCcIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHdIds.includes(id) && !validHrIds.includes(id) && !validHaIds.includes(id) && !validHeIds.includes(id) && !validEaIds.includes(id) && !validFaIds.includes(id) && !validChIds.includes(id) && !validCpIds.includes(id) && !validCaIds.includes(id)) {
              applyCorrection(type, 'cc', 'Possível jaqueta baseado no padrão de ID');
            }
          }
        }

        // IDs de acessórios de peito geralmente estão entre 1801-1819 e 3084-3511
        if ((id >= 1801 && id <= 1819) || (id >= 3084 && id <= 3511)) {
          if (type !== 'ca' && !validCaIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHdIds.includes(id) && !validHrIds.includes(id) && !validHaIds.includes(id) && !validHeIds.includes(id) && !validEaIds.includes(id) && !validFaIds.includes(id) && !validChIds.includes(id) && !validCpIds.includes(id) && !validCcIds.includes(id)) {
              applyCorrection(type, 'ca', 'Possível acessório de peito baseado no padrão de ID');
            }
          }
        }

        // IDs de calças geralmente estão entre 1801-1819 e 3084-3511 (mesmo padrão dos acessórios de peito, mas contexto indica calças)
        if ((id >= 1801 && id <= 1819) || (id >= 3084 && id <= 3511)) {
          if (type !== 'lg' && !validLgIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHdIds.includes(id) && !validHrIds.includes(id) && !validHaIds.includes(id) && !validHeIds.includes(id) && !validEaIds.includes(id) && !validFaIds.includes(id) && !validChIds.includes(id) && !validCpIds.includes(id) && !validCcIds.includes(id) && !validCaIds.includes(id)) {
              applyCorrection(type, 'lg', 'Possível calça baseado no padrão de ID');
            }
          }
        }

        // IDs de sapatos geralmente estão entre 290-305, 905-908 e 3000-3275
        if ((id >= 290 && id <= 305) || (id >= 905 && id <= 908) || (id >= 3000 && id <= 3275)) {
          if (type !== 'sh' && !validShIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHdIds.includes(id) && !validHrIds.includes(id) && !validHaIds.includes(id) && !validHeIds.includes(id) && !validEaIds.includes(id) && !validFaIds.includes(id) && !validChIds.includes(id) && !validCpIds.includes(id) && !validCcIds.includes(id) && !validCaIds.includes(id) && !validLgIds.includes(id)) {
              applyCorrection(type, 'sh', 'Possível sapato baseado no padrão de ID');
            }
          }
        }

        // IDs de cintos geralmente estão entre 2001-2012 e 3072-3264
        if ((id >= 2001 && id <= 2012) || (id >= 3072 && id <= 3264)) {
          if (type !== 'wa' && !validWaIds.includes(id)) {
            // Verificar se não conflita com outras categorias
            if (!validHdIds.includes(id) && !validHrIds.includes(id) && !validHaIds.includes(id) && !validHeIds.includes(id) && !validEaIds.includes(id) && !validFaIds.includes(id) && !validChIds.includes(id) && !validCpIds.includes(id) && !validCcIds.includes(id) && !validCaIds.includes(id) && !validLgIds.includes(id) && !validShIds.includes(id)) {
              applyCorrection(type, 'wa', 'Possível cinto baseado no padrão de ID');
            }
          }
        }

        // CORREÇÕES BASEADAS EM PADRÕES GERAIS DO HABBO

        // 4. CHAPÉUS/CAPACETES (ha) - incorretamente como Casacos (cc)
        if (id >= 3451 && id <= 3500) {
          applyCorrection('cc', 'ha', 'Capacete');
        }
        // Chapéus básicos (1-100)
        else if (id >= 1 && id <= 100) {
          applyCorrection('cc', 'ha', 'Chapéu');
        }
        // Chapéus especiais (2000-2100)
        else if (id >= 2000 && id <= 2100) {
          applyCorrection('cc', 'ha', 'Chapéu Especial');
        }

        // 2. MÁSCARAS FACIAIS (fa) - incorretamente como Casacos (cc)
        else if (id >= 4000 && id <= 4100) {
          applyCorrection('cc', 'fa', 'Máscara');
        }
        // Máscaras básicas (101-200)
        else if (id >= 101 && id <= 200) {
          applyCorrection('cc', 'fa', 'Máscara');
        }

        // 3. ÓCULOS (ea) - incorretamente como Casacos (cc)
        else if (id >= 5000 && id <= 5100) {
          applyCorrection('cc', 'ea', 'Óculos');
        }
        // Óculos básicos (201-300)
        else if (id >= 201 && id <= 300) {
          applyCorrection('cc', 'ea', 'Óculos');
        }

        // 4. ACESSÓRIOS DE CABEÇA (he) - incorretamente como Casacos (cc)
        else if (id >= 6000 && id <= 6100) {
          applyCorrection('cc', 'he', 'Acessório de Cabeça');
        }
        // Acessórios básicos (301-400)
        else if (id >= 301 && id <= 400) {
          applyCorrection('cc', 'he', 'Acessório de Cabeça');
        }

        // 5. CALÇAS (lg) - incorretamente como Camisetas (ch)
        else if (id >= 7000 && id <= 7200) {
          applyCorrection('ch', 'lg', 'Calça');
        }
        // Calças básicas (401-500)
        else if (id >= 401 && id <= 500) {
          applyCorrection('ch', 'lg', 'Calça');
        }

        // 6. SAPATOS (sh) - incorretamente como Camisetas (ch)
        else if (id >= 8000 && id <= 8200) {
          applyCorrection('ch', 'sh', 'Sapato');
        }
        // Sapatos básicos (501-600)
        else if (id >= 501 && id <= 600) {
          applyCorrection('ch', 'sh', 'Sapato');
        }

        // 7. CINTOS (wa) - incorretamente como Camisetas (ch)
        else if (id >= 9000 && id <= 9100) {
          applyCorrection('ch', 'wa', 'Cinto');
        }
        // Cintos básicos (601-700)
        else if (id >= 601 && id <= 700) {
          applyCorrection('ch', 'wa', 'Cinto');
        }

        // 8. ACESSÓRIOS DO PEITO (ca) - incorretamente como Camisetas (ch)
        else if (id >= 10000 && id <= 10100) {
          applyCorrection('ch', 'ca', 'Acessório do Peito');
        }
        // Acessórios básicos (701-800)
        else if (id >= 701 && id <= 800) {
          applyCorrection('ch', 'ca', 'Acessório do Peito');
        }

        // 9. ESTAMPAS (cp) - incorretamente como Camisetas (ch)
        else if (id >= 11000 && id <= 11100) {
          applyCorrection('ch', 'cp', 'Estampa');
        }
        // Estampas básicas (801-900)
        else if (id >= 801 && id <= 900) {
          applyCorrection('ch', 'cp', 'Estampa');
        }

        // 10. CASACOS/VESTIDOS (cc) - incorretamente como Camisetas (ch)
        else if (id >= 12000 && id <= 12200) {
          applyCorrection('ch', 'cc', 'Casaco');
        }
        // Casacos básicos (901-1000)
        else if (id >= 901 && id <= 1000) {
          applyCorrection('ch', 'cc', 'Casaco');
        }

        // 11. CABELOS (hr) - incorretamente como Rostos (hd)
        else if (id >= 13000 && id <= 13200) {
          applyCorrection('hd', 'hr', 'Cabelo');
        }
        // Cabelos básicos (1001-1100)
        else if (id >= 1001 && id <= 1100) {
          applyCorrection('hd', 'hr', 'Cabelo');
        }

        // 12. CORREÇÕES ESPECÍFICAS BASEADAS EM ANÁLISE REAL
        // Apenas corrigir itens específicos que sabemos que são incorretos

        // Corrigir itens que estão sendo incorretamente categorizados como cintos (wa) mas são chapéus (ha)
        // IDs específicos que são chapéus mas aparecem como cintos
        else if (type === 'wa' && (id >= 3451 && id <= 3500)) { // Capacetes que podem estar como cintos
          applyCorrection('wa', 'ha', 'Capacete');
        }

        // REMOVER itens inválidos da categoria "he" que não funcionam no Habbo-imaging
        // Estes IDs parecem ser inválidos ou não existem mais
        else if (type === 'he' && (
          id === 2113 || id === 2114 || id === 2115 || id === 2116 || id === 2131 ||
          id === 2132 || id === 2142 || id === 2135 || id === 2136 || id === 2137 ||
          id === 2238 || id === 2242 || id === 2255 || id === 2269 || id === 2270 ||
          id === 2296 || id === 2306 || id === 2307 || id === 2308 || id === 2309 ||
          id === 2364 || id === 2379 || id === 2380 || id === 2381 || id === 2395 ||
          id === 2434 || id === 2435 || id === 2470 || id === 2503 || id === 2504 ||
          id === 2506 || id === 2545 || id === 2546 || id === 2547 || id === 2558 ||
          id === 2559 || id === 2560 || id === 2606 || id === 2607 || id === 2641 ||
          id === 2642 || id === 2643 || id === 2650 || id === 2651 || id === 2652 ||
          id === 2667 || id === 2668 || id === 2669 || id === 2690 || id === 2691 ||
          id === 2692 || id === 2801 || id === 2802 || id === 2807 || id === 2937 ||
          id === 2942 || id === 2943 || id === 2944 || id === 2945 || id === 2946 ||
          id === 2947 || id === 2954 || id === 2955 || id === 2956 || id === 2957 ||
          id === 2958 || id === 2959 || id === 2979 || id === 2980 || id === 3075 ||
          id === 3076 || id === 3077 || id === 3078 || id === 3102 || id === 3103 ||
          id === 3104 || id === 3105 || id === 3106 || id === 3107 || id === 3108 ||
          id === 3109 || id === 3126 || id === 3127 || id === 3128 || id === 3162 ||
          id === 3163 || id === 3164 || id === 3207 || id === 3208 || id === 3209 ||
          id === 3235 || id === 3265 || id === 3278 || id === 3279 || id === 3282 ||
          id === 3283 || id === 3284 || id === 3295 || id === 3296 || id === 3297 ||
          id === 3298 || id === 3325 || id === 3326 || id === 3336 || id === 3337 ||
          id === 3402 || id === 3403 || id === 3432 || id === 3433 || id === 3434 ||
          id === 3465 || id === 3513 || id === 3514 || id === 3532 || id === 3536 ||
          id === 3537 || id === 3551 || id === 3557 || id === 3558 || id === 3559 ||
          id === 3566 || id === 3567 || id === 3568 || id === 3569 || id === 3570 ||
          id === 3571 || id === 3572 || id === 3590 || id === 3602 || id === 3641 ||
          id === 3687 || id === 3688 || id === 3714 || id === 3766 || id === 3767 ||
          id === 3768 || id === 3809 || id === 3810 || id === 3811 || id === 3816 ||
          id === 3978 || id === 3979 || id === 3980 || id === 4028 || id === 4029 ||
          id === 4256 || id === 4257 || id === 4260 || id === 4319 || id === 4321 ||
          id === 4323 || id === 4324 || id === 4325 || id === 4326 || id === 4327 ||
          id === 4329 || id === 4338 || id === 4339 || id === 4371 || id === 4372 ||
          id === 4373 || id === 4382 || id === 4407 || id === 4408 || id === 4409 ||
          id === 4426 || id === 4427 || id === 4462 || id === 4486 || id === 4527 ||
          id === 4528 || id === 4529 || id === 4530 || id === 4563 || id === 4564 ||
          id === 4565 || id === 4595 || id === 4599 || id === 4611 || id === 4612 ||
          id === 4610 || id === 4695 || id === 4729 || id === 4730 || id === 4757 ||
          id === 4758 || id === 4775 || id === 4777 || id === 4843 || id === 4844 ||
          id === 4865 || id === 4867 || id === 4868 || id === 4869 || id === 4885 ||
          id === 4991 || id === 5049 || id === 5070 || id === 5071 || id === 5105 ||
          id === 5106 || id === 5127 || id === 5188 || id === 5189 || id === 5190 ||
          id === 5191 || id === 5192 || id === 5228 || id === 5243 || id === 5309 ||
          id === 5310 || id === 5331 || id === 5372 || id === 5373 || id === 5397 ||
          id === 5412 || id === 5413 || id === 5442 || id === 5443 || id === 5444 ||
          id === 5445 || id === 5462 || id === 5500 || id === 5614 || id === 5615 ||
          id === 5616 || id === 5661 || id === 5662 || id === 5663 || id === 5664 ||
          id === 5665 || id === 5741 || id === 5786 || id === 5787 || id === 5788 ||
          id === 5789 || id === 5790 || id === 5791 || id === 5792 || id === 5793 ||
          id === 5794 || id === 6009 || id === 6010 || id === 6011 || id === 5846 ||
          id === 5847 || id === 5848 || id === 6066 || id === 6067 || id === 6079 ||
          id === 6089 || id === 6090 || id === 6091 || id === 6092 || id === 6093 ||
          id === 6094 || id === 6095 || id === 6096 || id === 6097 || id === 6127 ||
          id === 6128 || id === 6129 || id === 6150 || id === 6151 || id === 6153 ||
          id === 6161 || id === 6162 || id === 6169 || id === 6170 || id === 6171 ||
          id === 6177 || id === 6178 || id === 6179 || id === 6180 || id === 6181 ||
          id === 6182 || id === 6183 || id === 6184 || id === 6185 || id === 6186 ||
          id === 6187 || id === 6188 || id === 6189 || id === 6190 || id === 6191 ||
          id === 6192 || id === 6198 || id === 6199 || id === 6200 || id === 6201 ||
          id === 6239 || id === 6240 || id === 6344 || id === 6345 || id === 6353 ||
          id === 6453 || id === 6454 || id === 6455 || id === 6505 || id === 6506 ||
          id === 6552 || id === 6570 || id === 6571 || id === 6572 || id === 6583 ||
          id === 6584 || id === 6585 || id === 6651 || id === 6652 || id === 6653 ||
          id === 6654 || id === 6674 || id === 6675 || id === 6676 || id === 6697 ||
          id === 6698 || id === 6709 || id === 6710 || id === 6740 || id === 6741 ||
          id === 6755 || id === 6756 || id === 6757 || id === 6758 || id === 6759 ||
          id === 6761 || id === 6762 || id === 6763 || id === 6765 || id === 6822 ||
          id === 6823 || id === 6842 || id === 6854 || id === 2937 || id === 2942 ||
          id === 2943 || id === 2944 || id === 2945 || id === 2946 || id === 2947 ||
          id === 2954 || id === 2955 || id === 2956 || id === 2957 || id === 2958 ||
          id === 2959 || id === 2979 || id === 2980 || id === 3075 || id === 3076 ||
          id === 3077 || id === 3078 || id === 3102 || id === 3103 || id === 3104 ||
          id === 3105 || id === 3106 || id === 3107 || id === 3108 || id === 3109 ||
          id === 3126 || id === 3127 || id === 3128 || id === 3162 || id === 3163 ||
          id === 3164 || id === 3207 || id === 3208 || id === 3209 || id === 3235 ||
          id === 3265 || id === 3278 || id === 3279 || id === 3282 || id === 3283 ||
          id === 3284 || id === 3295 || id === 3296 || id === 3297 || id === 3298 ||
          id === 3325 || id === 3326 || id === 3336 || id === 3337 || id === 3402 ||
          id === 3403 || id === 3432 || id === 3433 || id === 3434 || id === 3465 ||
          id === 3513 || id === 3514 || id === 3532 || id === 3536 || id === 3537 ||
          id === 3551 || id === 3557 || id === 3558 || id === 3559 || id === 3566 ||
          id === 3567 || id === 3568 || id === 3569 || id === 3570 || id === 3571 ||
          id === 3572 || id === 3590 || id === 3602 || id === 3641 || id === 3687 ||
          id === 3688 || id === 3714 || id === 3766 || id === 3767 || id === 3768 ||
          id === 3809 || id === 3810 || id === 3811 || id === 3816 || id === 3978 ||
          id === 3979 || id === 3980 || id === 4028 || id === 4029 || id === 4256 ||
          id === 4257 || id === 4260 || id === 4319 || id === 4321 || id === 4323 ||
          id === 4324 || id === 4325 || id === 4326 || id === 4327 || id === 4329 ||
          id === 4338 || id === 4339 || id === 4371 || id === 4372 || id === 4373 ||
          id === 4382 || id === 4407 || id === 4408 || id === 4409 || id === 4426 ||
          id === 4427 || id === 4462 || id === 4486 || id === 4527 || id === 4528 ||
          id === 4529 || id === 4530 || id === 4563 || id === 4564 || id === 4565 ||
          id === 4595 || id === 4599 || id === 4611 || id === 4612 || id === 4610 ||
          id === 4695 || id === 4729 || id === 4730 || id === 4757 || id === 4758 ||
          id === 4775 || id === 4777 || id === 4843 || id === 4844 || id === 4865 ||
          id === 4867 || id === 4868 || id === 4869 || id === 4885 || id === 4991 ||
          id === 5049 || id === 5070 || id === 5071 || id === 5105 || id === 5106 ||
          id === 5127 || id === 5188 || id === 5189 || id === 5190 || id === 5191 ||
          id === 5192 || id === 5228 || id === 5243 || id === 5309 || id === 5310 ||
          id === 5331 || id === 5372 || id === 5373 || id === 5397 || id === 5412 ||
          id === 5413 || id === 5442 || id === 5443 || id === 5444 || id === 5445 ||
          id === 5462 || id === 5500 || id === 5614 || id === 5615 || id === 5616 ||
          id === 5661 || id === 5662 || id === 5663 || id === 5664 || id === 5665 ||
          id === 5741 || id === 5786 || id === 5787 || id === 5788 || id === 5789 ||
          id === 5790 || id === 5791 || id === 5792 || id === 5793 || id === 5794 ||
          id === 6009 || id === 6010 || id === 6011 || id === 5846 || id === 5847 ||
          id === 5848 || id === 6066 || id === 6067 || id === 6079 || id === 6089 ||
          id === 6090 || id === 6091 || id === 6092 || id === 6093 || id === 6094 ||
          id === 6095 || id === 6096 || id === 6097 || id === 6127 || id === 6128 ||
          id === 6129 || id === 6150 || id === 6151 || id === 6153 || id === 6161 ||
          id === 6162 || id === 6169 || id === 6170 || id === 6171 || id === 6177 ||
          id === 6178 || id === 6179 || id === 6180 || id === 6181 || id === 6182 ||
          id === 6183 || id === 6184 || id === 6185 || id === 6186 || id === 6187 ||
          id === 6188 || id === 6189 || id === 6190 || id === 6191 || id === 6192 ||
          id === 6198 || id === 6199 || id === 6200 || id === 6201 || id === 6239 ||
          id === 6240 || id === 6344 || id === 6345 || id === 6353 || id === 6453 ||
          id === 6454 || id === 6455 || id === 6505 || id === 6506 || id === 6552 ||
          id === 6570 || id === 6571 || id === 6572 || id === 6583 || id === 6584 ||
          id === 6585 || id === 6651 || id === 6652 || id === 6653 || id === 6654 ||
          id === 6674 || id === 6675 || id === 6676 || id === 6697 || id === 6698 ||
          id === 6709 || id === 6710 || id === 6740 || id === 6741 || id === 6755 ||
          id === 6756 || id === 6757 || id === 6758 || id === 6759 || id === 6761 ||
          id === 6762 || id === 6763 || id === 6765 || id === 6822 || id === 6823 ||
          id === 6842 || id === 6854 || id === 5 || id === 2 || id === 1 || id === 7 ||
          id === 4 || id === 3 || id === 2470 || id === 2503 || id === 2504 || id === 2506
        )) {
          // Pular este item - é inválido ou não funciona no Habbo-imaging
          return;
        }

        // REMOVIDO: Correções agressivas que estavam removendo itens legítimos

        // Usar tipo corrigido para processamento
        const finalType = correctedType;

        // Criar chave única com tipo corrigido
        const correctedUniqueKey = `${finalType}_${part.id}_${set.gender}`;

        // Verificar se já processamos este item
        if (processedItems.has(correctedUniqueKey)) {
          return; // Pular duplicatas
        }

        processedItems.add(correctedUniqueKey);

        if (!categories.has(finalType)) {
          categories.set(finalType, {
            id: finalType,
            name: finalType,
            displayName: TYPE_DISPLAY_NAMES[finalType] || finalType,
            type: finalType,
            paletteId: PALETTE_MAPPING[finalType] || '3',
            items: [],
            colors: [],
            gender: 'ALL'
          });
        }

        const category = categories.get(finalType)!;

        // Obter cores disponíveis para este tipo baseado na paleta
        const availableColors = this.getAvailableColors(finalType);

        // Categorizar item baseado no tutorial ViaJovem
        // Adaptado para HabboHub
        const categoryType = this.categorizeItem(set, part);

        // Detectar duotone (verificar todas as partes do set)
        // Camisetas são sempre duotone na prática (como na referência)
        const isDuotone = finalType === 'ch' ? true : this.isDuotoneItem(set.parts);

        // Obter informações do furnidata
        const furnidataInfo = this.getFurnidataInfo(finalType, part.id);

        const item: HabboHubClothingItem = {
          id: correctedUniqueKey, // Usar chave única corrigida
          figureId: part.id,
          category: finalType,
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
          imageUrl: this.generateAvatarImageUrl(finalType, part.id, set.gender, availableColors[0] || '7'),
          duotoneImageUrl: isDuotone ?
            this.generateDuotoneImageUrl(finalType, part.id, availableColors[0] || '7', availableColors[1] || '8', set.gender) :
            undefined,
          isColorable: part.colorable === '1',
          isSelectable: set.selectable === '1',
          name: furnidataInfo?.name || `${TYPE_DISPLAY_NAMES[finalType]} ${part.id}`
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

    // Log de estatísticas por categoria
    console.log(`📋 [HabboHubCompleteService] Total de itens únicos processados: ${processedItems.size}`);
    console.log(`📋 [HabboHubCompleteService] Categorias encontradas:`);
    Array.from(categories.entries()).forEach(([type, category]) => {
      console.log(`  ${type} (${TYPE_DISPLAY_NAMES[type] || type}): ${category.items.length} itens`);
    });

    return Array.from(categories.values());
  }

  /**
   * Dados mock para funcionar sem API externa
   */
  private getMockFigureData(): { palettes: HabboHubPalette[], sets: HabboHubSet[] } {
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
        // Rostos masculinos (Non-HC - Gratuitos)
        { id: '1', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '180', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '2', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '185', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '3', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '190', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '4', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '195', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '5', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '200', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '6', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '205', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '7', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '206', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '8', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '207', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '9', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '208', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '10', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '209', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Rostos masculinos HC (Habbo Club)
        { id: '11', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '3091', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '12', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '3092', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '13', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '3093', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '14', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '3094', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '15', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '3095', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '16', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '3101', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '17', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '3102', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '18', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '3103', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Rostos masculinos Sellable (Vendáveis)
        { id: '19', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '1', parts: [
          { id: '3536', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '20', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '1', parts: [
          { id: '3537', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        // Rostos femininos
        { id: '21', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '600', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]},
        { id: '22', gender: 'F', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0', parts: [
          { id: '610', type: 'hd', colorable: '1', index: '0', colorindex: '0' }
        ]}
        // Adicione mais conforme necessário...
      ]
    };
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

  /**
   * Substitui completamente os dados HD pelos dados corretos do Habbo
   */
  private applyHabboCorrections(): void {
    if (!this.figureData || !this.figureData.sets) return;

    console.log('🔧 [HabboHubCompleteService] Aplicando correções aos dados do Habbo...');

    // CORREÇÃO ESPECÍFICA PARA CAMISETAS: Forçar IDs corretos das camisetas
    this.applyShirtCorrections();

    // CORREÇÃO 1: Corrigir rostos HD - substituir pelos dados corretos
    const correctHdSets: any[] = [
      // Rostos masculinos não-HC
      { id: '180', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '185', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '190', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '195', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '200', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '205', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '206', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '207', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '208', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '209', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },

      // Rostos masculinos HC
      { id: '3091', gender: 'M', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3092', gender: 'M', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3093', gender: 'M', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3094', gender: 'M', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3095', gender: 'M', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3101', gender: 'M', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3102', gender: 'M', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3103', gender: 'M', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },

      // Rostos masculinos sellable
      { id: '3536', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3537', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3600', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3603', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3604', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3631', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3704', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3721', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3813', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3814', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3845', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3956', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3997', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4015', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4023', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4163', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4174', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4202', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4203', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4204', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4205', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4206', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4266', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4267', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4268', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4279', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4280', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4287', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4383', gender: 'M', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },

      // Rostos femininos não-HC
      { id: '600', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '605', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '610', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '615', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '620', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '625', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '626', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '627', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '628', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '629', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },

      // Rostos femininos HC
      { id: '3096', gender: 'F', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3097', gender: 'F', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3098', gender: 'F', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3099', gender: 'F', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3100', gender: 'F', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3104', gender: 'F', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3105', gender: 'F', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3106', gender: 'F', club: '2', colorable: '0', selectable: '1', preselectable: '0', sellable: '0' },

      // Rostos femininos sellable
      { id: '3536', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3537', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3600', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3603', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3604', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3631', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3704', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3721', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3813', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3814', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3845', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3956', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3997', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4015', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4023', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4163', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4174', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4202', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4203', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4204', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4205', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4206', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4266', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4267', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4268', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4279', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4280', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4287', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '4383', gender: 'F', club: '0', colorable: '0', selectable: '1', preselectable: '0', sellable: '1' }
    ];

    // Converter para o formato HabboHubSet
    const habboHubHdSets: HabboHubSet[] = correctHdSets.map(setData => ({
      id: `hd-${setData.id}`,
      gender: setData.gender as 'M' | 'F' | 'U',
      club: setData.club,
      colorable: setData.colorable,
      selectable: setData.selectable,
      preselectable: setData.preselectable,
      sellable: setData.sellable,
      parts: [{
        id: setData.id,
        type: 'hd',
        colorable: '0',
        index: '0',
        colorindex: '0'
      }]
    }));

    // Remover todos os sets HD existentes
    this.figureData.sets = this.figureData.sets.filter(set =>
      !set.parts.some(part => part.type === 'hd')
    );

    // Adicionar os sets HD corretos
    this.figureData.sets.push(...habboHubHdSets);

    // CORREÇÃO 2: Corrigir IDs incorretos nos dados mock restantes
    // Os dados mock têm IDs de set como '1', '2', '3' mas deveriam usar os IDs corretos das partes
    this.figureData.sets.forEach(set => {
      // Para cada set, usar o ID da primeira parte como ID do set
      if (set.parts && set.parts.length > 0) {
        const firstPart = set.parts[0];
        // Corrigir ID do set para usar o formato correto (tipo-ID)
        set.id = `${firstPart.type}-${firstPart.id}`;
      }
    });

    console.log(`✅ [HabboHubCompleteService] Correções aplicadas: ${habboHubHdSets.length} rostos HD adicionados`);
  }

  /**
   * Corrige especificamente os IDs das camisetas com os valores corretos do Habbo
   */
  private applyShirtCorrections(): void {
    if (!this.figureData || !this.figureData.sets) return;

    console.log('👕 [HabboHubCompleteService] Aplicando correções específicas para camisetas...');

    // IDs CORRETOS das camisetas baseados na análise do HTML oficial
    const correctShirtSets: any[] = [
      // Camisetas não-HC
      { id: '210', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '215', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '220', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '225', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '230', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '235', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '240', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '245', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '250', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '255', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '262', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '265', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '266', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '267', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '804', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '805', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '806', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '807', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '808', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '809', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '875', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '876', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '877', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '878', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3030', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3109', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3110', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3111', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },

      // Camisetas HC
      { id: '803', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3001', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3015', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3022', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3032', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3038', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3050', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3059', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3077', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3167', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3185', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3203', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3208', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3215', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3222', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3234', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3237', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },
      { id: '3279', gender: 'M', club: '2', colorable: '1', selectable: '1', preselectable: '0', sellable: '0' },

      // IDs de exemplo das camisetas vendáveis (apenas alguns para demonstração)
      { id: '3321', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3323', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3332', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3334', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '1' },
      { id: '3336', gender: 'M', club: '0', colorable: '1', selectable: '1', preselectable: '0', sellable: '1' }
    ];

    // Converter para o formato HabboHubSet
    const habboHubShirtSets: HabboHubSet[] = correctShirtSets.map(setData => ({
      id: `ch-${setData.id}`,
      gender: setData.gender as 'M' | 'F' | 'U',
      club: setData.club,
      colorable: setData.colorable,
      selectable: setData.selectable,
      preselectable: setData.preselectable,
      sellable: setData.sellable,
      parts: [{
        id: setData.id,
        type: 'ch',
        colorable: '1',
        index: '0',
        colorindex: '1' // Camisetas são duotone
      }]
    }));

    // Remover todos os sets CH existentes
    const originalCount = this.figureData.sets.length;
    this.figureData.sets = this.figureData.sets.filter(set =>
      !set.parts.some(part => part.type === 'ch')
    );

    // Adicionar os sets CH corretos
    this.figureData.sets.push(...habboHubShirtSets);

    console.log(`👕 [HabboHubCompleteService] Correções aplicadas: ${habboHubShirtSets.length} camisetas corrigidas (removidos ${originalCount - this.figureData.sets.length + habboHubShirtSets.length} sets incorretos)`);
  }
}

// Instância singleton
export const habboHubCompleteService = new HabboHubCompleteService();
export default habboHubCompleteService;