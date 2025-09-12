// Serviço para buscar roupas oficiais do Habbo baseado no tutorial oficial
// Baseado em: https://viajovem.blogspot.com/2023/01/as-roupas-visuais.html

export interface HabboOfficialClothingItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  club: '0' | '1' | '2'; // 0=Normal, 1=Club, 2=HC
  colorable: '0' | '1';
  selectable: '0' | '1';
  preselectable: '0' | '1';
  sellable: '0' | '1';
  paletteId: string;
  colors: string[];
  scientificCode?: string; // Código científico do figuremap.xml
  thumbnailUrl: string;
  swfUrl?: string;
  iconUrl?: string;
}

export interface HabboColorPalette {
  id: string;
  colors: Array<{
    id: string;
    hex: string;
    index: number;
    isHC: boolean;
  }>;
}

export interface HabboOfficialClothingData {
  items: HabboOfficialClothingItem[];
  palettes: HabboColorPalette[];
  categories: {
    [category: string]: HabboOfficialClothingItem[];
  };
  metadata: {
    lastUpdated: string;
    source: string;
    totalItems: number;
    totalCategories: number;
  };
}

// Mapeamento das 13 categorias oficiais do Habbo
export const HABBO_CATEGORIES = {
  'hd': { name: 'Rosto e Corpo', paletteId: '1', icon: '👤' },
  'hr': { name: 'Cabelo/Penteados', paletteId: '2', icon: '💇' },
  'ch': { name: 'Camisas', paletteId: '3', icon: '👕' },
  'cc': { name: 'Casacos/Vestidos/Jaquetas', paletteId: '3', icon: '🧥' },
  'cp': { name: 'Estampas/Impressões', paletteId: '3', icon: '🎨' },
  'ca': { name: 'Bijuteria/Jóias (acessórios de topo)', paletteId: '3', icon: '🎖️' },
  'ea': { name: 'Óculos', paletteId: '3', icon: '👓' },
  'fa': { name: 'Máscaras (acessórios faciais)', paletteId: '3', icon: '🎭' },
  'ha': { name: 'Chapéus', paletteId: '3', icon: '🎩' },
  'he': { name: 'Acessórios', paletteId: '3', icon: '👑' },
  'lg': { name: 'Calça', paletteId: '3', icon: '👖' },
  'sh': { name: 'Sapato', paletteId: '3', icon: '👟' },
  'wa': { name: 'Cintos (acessórios para a parte inferior)', paletteId: '3', icon: '🔗' }
} as const;

// URLs oficiais do Habbo
export const HABBO_OFFICIAL_URLS = {
  // Sandbox (mais atualizado)
  SANDBOX: {
    EXTERNAL_VARIABLES: 'https://sandbox.habbo.com/gamedata/external_variables/1',
    FIGUREMAP: 'https://images.habbo.com/gordon/PRODUCTION-202211221644-994804644/figuremap.xml',
    FIGUREDATA: 'https://images.habbo.com/gordon/PRODUCTION-202211221644-994804644/figuredata.xml',
    FIGUREMAP_V2: 'https://images.habbo.com/gordon/flash-assets-PRODUCTION-202504241358-338970472/figuremapv2.xml'
  },
  // Brasil (usando domínio internacional)
  BRASIL: {
    EXTERNAL_VARIABLES: 'https://www.habbo.com/gamedata/external_variables/1',
    FIGUREDATA: 'https://www.habbo.com/gamedata/figuredata/1',
    FIGUREMAP: 'https://www.habbo.com/gamedata/figuremap/1',
    FURNIDATA: 'https://www.habbo.com/gamedata/furnidata_xml/1',
    FURNIDATA_JSON: 'https://www.habbo.com/gamedata/furnidata_json/1'
  },
  // Internacional
  INTERNATIONAL: {
    EXTERNAL_VARIABLES: 'https://www.habbo.com/gamedata/external_variables/1',
    FIGUREDATA: 'https://www.habbo.com/gamedata/figuredata/1',
    FIGUREMAP: 'https://www.habbo.com/gamedata/figuremap/1',
    FURNIDATA: 'https://www.habbo.com/gamedata/furnidata_xml/1',
    FURNIDATA_JSON: 'https://www.habbo.com/gamedata/furnidata_json/1'
  }
} as const;

class HabboOfficialClothingService {
  private cache: Map<string, HabboOfficialClothingData> = new Map();
  private lastUpdate: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 60 * 2; // 2 horas

  /**
   * Busca dados de roupas oficiais do Habbo
   */
  async getOfficialClothingData(hotel: 'sandbox' | 'br' | 'com' = 'sandbox'): Promise<HabboOfficialClothingData> {
    const cacheKey = `clothing_${hotel}`;
    const now = Date.now();
    
    // Verificar cache
    if (this.cache.has(cacheKey) && this.lastUpdate.has(cacheKey)) {
      const lastUpdate = this.lastUpdate.get(cacheKey)!;
      if (now - lastUpdate < this.CACHE_DURATION) {
        console.log('📦 [OfficialClothing] Using cached data');
        return this.cache.get(cacheKey)!;
      }
    }

    console.log(`🌐 [OfficialClothing] Fetching fresh data from ${hotel}`);
    
    try {
      // 1. Buscar external_variables para obter URL da build atual
      const buildUrl = await this.getCurrentBuildUrl(hotel);
      console.log(`🔗 [OfficialClothing] Current build URL: ${buildUrl}`);

      // 2. Buscar figuredata.xml
      const figureData = await this.fetchFigureData(buildUrl);
      console.log(`📊 [FigureData] Loaded ${Object.keys(figureData.categories).length} categories`);

      // 3. Buscar figuremap.xml para códigos científicos
      const figureMap = await this.fetchFigureMap(buildUrl);
      console.log(`🗺️ [FigureMap] Loaded ${figureMap.size} scientific codes`);

      // 4. Buscar furnidata para informações adicionais
      const furniData = await this.fetchFurniData(hotel);
      console.log(`🏠 [FurniData] Loaded ${furniData.size} furni items`);

      // 5. Processar e unificar dados
      const processedData = this.processClothingData(figureData, figureMap, furniData);

      // 6. Cachear resultado
      this.cache.set(cacheKey, processedData);
      this.lastUpdate.set(cacheKey, now);

      return processedData;

    } catch (error) {
      console.error('❌ [OfficialClothing] Error fetching data:', error);
      
      // Retornar cache se disponível, mesmo que expirado
      if (this.cache.has(cacheKey)) {
        console.log('⚠️ [OfficialClothing] Using expired cache due to error');
        return this.cache.get(cacheKey)!;
      }
      
      throw error;
    }
  }

  /**
   * Busca URL da build atual do external_variables
   */
  private async getCurrentBuildUrl(hotel: 'sandbox' | 'br' | 'com'): Promise<string> {
    const url = HABBO_OFFICIAL_URLS[hotel.toUpperCase() as keyof typeof HABBO_OFFICIAL_URLS].EXTERNAL_VARIABLES;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch external variables: ${response.status}`);
    }
    
    const text = await response.text();
    
    // Buscar flash.client.url
    const match = text.match(/flash\.client\.url=([^\r\n]+)/);
    if (!match) {
      throw new Error('Could not find flash.client.url in external variables');
    }
    
    const baseUrl = match[1].trim();
    console.log(`🔗 [BuildURL] Found: ${baseUrl}`);
    
    return baseUrl;
  }

  /**
   * Busca e processa figuredata.xml
   */
  private async fetchFigureData(buildUrl: string): Promise<{
    categories: { [category: string]: HabboOfficialClothingItem[] };
    palettes: HabboColorPalette[];
  }> {
    const figureDataUrl = `${buildUrl}/figuredata.xml`;
    console.log(`📥 [FigureData] Fetching: ${figureDataUrl}`);
    
    const response = await fetch(figureDataUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch figuredata: ${response.status}`);
    }
    
    const xmlText = await response.text();
    return this.parseFigureDataXML(xmlText);
  }

  /**
   * Busca e processa figuremap.xml
   */
  private async fetchFigureMap(buildUrl: string): Promise<Map<string, string>> {
    const figureMapUrl = `${buildUrl}/figuremap.xml`;
    console.log(`🗺️ [FigureMap] Fetching: ${figureMapUrl}`);
    
    const response = await fetch(figureMapUrl);
    if (!response.ok) {
      console.warn(`⚠️ [FigureMap] Failed to fetch: ${response.status}`);
      return new Map();
    }
    
    const xmlText = await response.text();
    return this.parseFigureMapXML(xmlText);
  }

  /**
   * Busca e processa furnidata
   */
  private async fetchFurniData(hotel: 'sandbox' | 'br' | 'com'): Promise<Map<string, any>> {
    const furniDataUrl = HABBO_OFFICIAL_URLS[hotel.toUpperCase() as keyof typeof HABBO_OFFICIAL_URLS].FURNIDATA_JSON;
    console.log(`🏠 [FurniData] Fetching: ${furniDataUrl}`);
    
    const response = await fetch(furniDataUrl);
    if (!response.ok) {
      console.warn(`⚠️ [FurniData] Failed to fetch: ${response.status}`);
      return new Map();
    }
    
    const data = await response.json();
    const furniMap = new Map();
    
    // Processar furnidata para mapear códigos científicos
    if (data.roomitemtypes && data.roomitemtypes.furnitype) {
      for (const item of data.roomitemtypes.furnitype) {
        if (item.classname && item.classname.startsWith('clothing_')) {
          furniMap.set(item.classname, item);
        }
      }
    }
    
    return furniMap;
  }

  /**
   * Parse do figuredata.xml
   */
  private parseFigureDataXML(xmlText: string): {
    categories: { [category: string]: HabboOfficialClothingItem[] };
    palettes: HabboColorPalette[];
  } {
    const categories: { [category: string]: HabboOfficialClothingItem[] } = {};
    const palettes: HabboColorPalette[] = [];

    // Parse paletas de cores
    const paletteRegex = /<palette[^>]+id="([^"]+)"[^>]*>(.*?)<\/palette>/gs;
    let paletteMatch;
    
    while ((paletteMatch = paletteRegex.exec(xmlText)) !== null) {
      const paletteId = paletteMatch[1];
      const paletteContent = paletteMatch[2];
      
      const colors: Array<{ id: string; hex: string; index: number; isHC: boolean }> = [];
      
      const colorRegex = /<color[^>]+id="([^"]+)"[^>]*(?:value="([^"]*)")?[^>]*\/?>/g;
      let colorMatch;
      let index = 0;
      
      while ((colorMatch = colorRegex.exec(paletteContent)) !== null) {
        const colorId = colorMatch[1];
        const colorValue = colorMatch[2] || '#FFFFFF';
        
        colors.push({
          id: colorId,
          hex: colorValue.startsWith('#') ? colorValue : `#${colorValue}`,
          index: index++,
          isHC: parseInt(colorId) > 11 // Cores HC são > 11
        });
      }
      
      palettes.push({
        id: paletteId,
        colors
      });
    }

    // Parse sets (categorias de roupas)
    const setRegex = /<set[^>]+type="([^"]+)"[^>]*>(.*?)<\/set>/gs;
    let setMatch;
    
    while ((setMatch = setRegex.exec(xmlText)) !== null) {
      const category = setMatch[1];
      const setContent = setMatch[2];
      
      // Verificar se é uma categoria válida
      if (!HABBO_CATEGORIES[category as keyof typeof HABBO_CATEGORIES]) {
        continue;
      }
      
      categories[category] = [];
      
      // Parse parts (itens de roupa)
      const partRegex = /<part[^>]+id="([^"]+)"[^>]*(?:gender="([^"]*)")?[^>]*(?:club="([^"]*)")?[^>]*(?:colorable="([^"]*)")?[^>]*(?:selectable="([^"]*)")?[^>]*(?:preselectable="([^"]*)")?[^>]*(?:sellable="([^"]*)")?[^>]*(?:palette="([^"]*)")?[^>]*\/?>/g;
      let partMatch;
      
      while ((partMatch = partRegex.exec(setContent)) !== null) {
        const figureId = partMatch[1];
        const gender = (partMatch[2] as 'M' | 'F' | 'U') || 'U';
        const club = (partMatch[3] as '0' | '1' | '2') || '0';
        const colorable = (partMatch[4] as '0' | '1') || '0';
        const selectable = (partMatch[5] as '0' | '1') || '1';
        const preselectable = (partMatch[6] as '0' | '1') || '0';
        const sellable = (partMatch[7] as '0' | '1') || '0';
        const paletteId = partMatch[8] || HABBO_CATEGORIES[category as keyof typeof HABBO_CATEGORIES].paletteId;
        
        // Obter cores disponíveis
        const palette = palettes.find(p => p.id === paletteId);
        const colors = palette ? palette.colors.map(c => c.id) : ['1', '2', '3', '4', '5'];
        
        const item: HabboOfficialClothingItem = {
          id: `${category}_${figureId}`,
          figureId,
          category,
          gender,
          club,
          colorable,
          selectable,
          preselectable,
          sellable,
          paletteId,
          colors,
          thumbnailUrl: this.generateThumbnailUrl(category, figureId, colors[0], gender)
        };
        
        categories[category].push(item);
      }
    }

    return { categories, palettes };
  }

  /**
   * Parse do figuremap.xml para códigos científicos
   */
  private parseFigureMapXML(xmlText: string): Map<string, string> {
    const figureMap = new Map<string, string>();
    
    const libRegex = /<lib[^>]+id="([^"]+)"[^>]*>(.*?)<\/lib>/gs;
    let libMatch;
    
    while ((libMatch = libRegex.exec(xmlText)) !== null) {
      const scientificCode = libMatch[1];
      const libContent = libMatch[2];
      
      // Buscar parts dentro do lib
      const partRegex = /<part[^>]+id="([^"]+)"[^>]+type="([^"]+)"[^>]*\/?>/g;
      let partMatch;
      
      while ((partMatch = partRegex.exec(libContent)) !== null) {
        const figureId = partMatch[1];
        const category = partMatch[2];
        
        // Mapear código científico para figureId
        figureMap.set(`${category}_${figureId}`, scientificCode);
      }
    }
    
    return figureMap;
  }

  /**
   * Processa e unifica todos os dados
   */
  private processClothingData(
    figureData: { categories: { [category: string]: HabboOfficialClothingItem[] }; palettes: HabboColorPalette[] },
    figureMap: Map<string, string>,
    furniData: Map<string, any>
  ): HabboOfficialClothingData {
    const allItems: HabboOfficialClothingItem[] = [];
    
    // Processar cada categoria
    for (const [category, items] of Object.entries(figureData.categories)) {
      for (const item of items) {
        // Adicionar código científico se disponível
        const scientificCode = figureMap.get(`${category}_${item.figureId}`);
        if (scientificCode) {
          item.scientificCode = scientificCode;
        }
        
        // Adicionar informações do furnidata se disponível
        if (scientificCode && furniData.has(scientificCode)) {
          const furniItem = furniData.get(scientificCode);
          if (furniItem) {
            // Adicionar URLs do SWF e ícone
            item.swfUrl = this.generateSwfUrl(scientificCode, furniItem.revision);
            item.iconUrl = this.generateIconUrl(scientificCode, furniItem.revision);
          }
        }
        
        allItems.push(item);
      }
    }
    
    return {
      items: allItems,
      palettes: figureData.palettes,
      categories: figureData.categories,
      metadata: {
        lastUpdated: new Date().toISOString(),
        source: 'habbo-official',
        totalItems: allItems.length,
        totalCategories: Object.keys(figureData.categories).length
      }
    };
  }

  /**
   * Gera URL de thumbnail usando habbo-imaging
   */
  private generateThumbnailUrl(category: string, figureId: string, colorId: string, gender: 'M' | 'F' | 'U'): string {
    // Avatar base para preview focado na categoria
    const baseAvatar = this.getBaseAvatarForCategory(category);
    const fullFigure = `${baseAvatar}.${category}-${figureId}-${colorId}`;
    
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${fullFigure}&gender=${gender}&direction=2&head_direction=2&size=s&img_format=png&gesture=std&action=std`;
  }

  /**
   * Gera avatar base focado na categoria específica
   */
  private getBaseAvatarForCategory(category: string): string {
    const baseAvatars = {
      'hd': 'hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'hr': 'hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
      'ch': 'hd-180-1.hr-828-45.lg-3116-92.sh-3297-92',
      'cc': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'lg': 'hd-180-1.hr-828-45.ch-3216-92.sh-3297-92',
      'sh': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92',
      'ha': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'ea': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'fa': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'he': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'ca': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'cp': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'wa': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92'
    };
    
    return baseAvatars[category as keyof typeof baseAvatars] || 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92';
  }

  /**
   * Gera URL do SWF
   */
  private generateSwfUrl(scientificCode: string, revision: string): string {
    return `https://images.habbo.com/dcr/hof_furni/${revision}/${scientificCode}.swf`;
  }

  /**
   * Gera URL do ícone
   */
  private generateIconUrl(scientificCode: string, revision: string): string {
    return `https://images.habbo.com/dcr/hof_furni/${revision}/${scientificCode}_icon.png`;
  }

  /**
   * Busca itens por categoria e gênero
   */
  async getItemsByCategory(category: string, gender: 'M' | 'F' | 'U' = 'U', hotel: 'sandbox' | 'br' | 'com' = 'sandbox'): Promise<HabboOfficialClothingItem[]> {
    const data = await this.getOfficialClothingData(hotel);
    return data.categories[category]?.filter(item => 
      item.gender === gender || item.gender === 'U'
    ) || [];
  }

  /**
   * Busca item específico por ID
   */
  async getItemById(itemId: string, hotel: 'sandbox' | 'br' | 'com' = 'sandbox'): Promise<HabboOfficialClothingItem | null> {
    const data = await this.getOfficialClothingData(hotel);
    return data.items.find(item => item.id === itemId) || null;
  }

  /**
   * Busca itens por código científico
   */
  async getItemsByScientificCode(scientificCode: string, hotel: 'sandbox' | 'br' | 'com' = 'sandbox'): Promise<HabboOfficialClothingItem[]> {
    const data = await this.getOfficialClothingData(hotel);
    return data.items.filter(item => item.scientificCode === scientificCode);
  }

  /**
   * Limpa cache
   */
  clearCache(): void {
    this.cache.clear();
    this.lastUpdate.clear();
    console.log('🧹 [OfficialClothing] Cache cleared');
  }
}

// Instância singleton
export const habboOfficialClothingService = new HabboOfficialClothingService();
