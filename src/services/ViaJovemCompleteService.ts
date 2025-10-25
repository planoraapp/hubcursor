// src/services/ViaJovemCompleteService.ts
// Implementação completa baseada no tutorial oficial da ViaJovem
// https://viajovem.blogspot.com/2023/01/as-roupas-visuais.html
// Carrega figuredata.xml e furnidata.json reais do Habbo Brasil

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
      console.log('🌐 [ViaJovemCompleteService] Tentando carregar dados oficiais via proxy...');
      // Usar proxy do Vite para resolver CORS
      const response = await fetch('/api/habbo/gamedata/figuredata/1');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlText = await response.text();
      const figureData = this.parseFigureDataXML(xmlText);
      
      console.log('✅ [ViaJovemCompleteService] Dados oficiais carregados com sucesso!');
      
      this.cache.set(cacheKey, {
        data: figureData,
        timestamp: Date.now()
      });
      
      this.figureData = figureData;
            return figureData;
      
    } catch (error) {
      console.warn('Erro ao carregar dados oficiais via proxy, tentando fallback local:', error);
      
      // Fallback: tentar dados locais
      try {
        console.log('📁 [ViaJovemCompleteService] Tentando carregar dados locais...');
        const localResponse = await fetch('/handitems/gamedata/figuredata.xml');
        if (localResponse.ok) {
          const xmlText = await localResponse.text();
          const figureData = this.parseFigureDataXML(xmlText);
          
          console.log('✅ [ViaJovemCompleteService] Dados locais carregados com sucesso!');
          
          this.cache.set(cacheKey, {
            data: figureData,
            timestamp: Date.now()
          });
          
          this.figureData = figureData;
          return figureData;
        }
      } catch (localError) {
        console.warn('❌ [ViaJovemCompleteService] Erro ao carregar dados locais:', localError);
      }
      
      // Último fallback: dados mock
      console.log('🎭 [ViaJovemCompleteService] Usando dados mock como último recurso');
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
   * Parsear XML do figuredata (baseado no tutorial ViaJovem)
   */
  private parseFigureDataXML(xmlText: string): { palettes: ViaJovemPalette[], sets: ViaJovemSet[] } {
        const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Verificar se há erros de parsing
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
            throw new Error('Failed to parse XML');
    }
    
    const palettes: ViaJovemPalette[] = [];
    const sets: ViaJovemSet[] = [];

    // Parsear palettes
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

    // Parsear sets (baseado no tutorial ViaJovem)
    const setElements = xmlDoc.querySelectorAll('set');
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
   * Categoriza item baseado no tutorial oficial ViaJovem
   * https://viajovem.blogspot.com/2023/01/as-roupas-visuais.html
   * 
   * • Roupas normais: não possuem sellable="1" no figuredata.xml
   * • Roupas HC: club="2" no figuredata.xml
   * • Roupas NFT: furniline contém coleções ["nft2025", "nft2024", "nft2023", "nft", "nftmint", "testing"]
   * • Roupas RARE: classname inicia com "clothing_r..."
   * • Roupas LTD: classname inicia com "clothing_ltd..."
   */
  private categorizeItem(set: ViaJovemSet, part: ViaJovemSetPart): 'NORMAL' | 'HC' | 'NFT' | 'RARE' | 'LTD' | 'SELLABLE' {
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
   * 
   * "As roupas em que a paleta 3 é utilizada e possuem dois tons de cor, 
   * utilizam no figuredata.xml a identificação colorindex="1" e colorindex="2""
   */
  private isDuotoneItem(parts: ViaJovemSetPart[]): boolean {
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

    console.log(`📊 [ViaJovemCompleteService] Total de sets carregados: ${this.figureData!.sets.length}`);

                const categories = new Map<string, ViaJovemCategory>();

    // Agrupar sets por tipo (apenas categorias válidas conforme ViaJovem)
    const validCategories = ['hd', 'hr', 'ch', 'cc', 'lg', 'sh', 'ha', 'ea', 'fa', 'he', 'ca', 'wa', 'cp'];
    const processedItems = new Set<string>(); // Para evitar duplicatas
    
    this.figureData!.sets.forEach(set => {
      set.parts.forEach(part => {
        const type = part.type;
        
        // Filtrar apenas categorias válidas
        if (!validCategories.includes(type)) {
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
        
        // CORREÇÕES BASEADAS EM PADRÕES REAIS DO HABBO
        
        // 1. CHAPÉUS/CAPACETES (ha) - incorretamente como Casacos (cc)
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
        const categoryType = this.categorizeItem(set, part);
        
        // Detectar duotone (verificar todas as partes do set)
        const isDuotone = this.isDuotoneItem(set.parts);
        
        // Obter informações do furnidata
        const furnidataInfo = this.getFurnidataInfo(finalType, part.id);
        
        const item: ViaJovemClothingItem = {
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
          imageUrl: this.generateAvatarImageUrl(finalType, part.id, set.gender, availableColors[0] || '1'),
          duotoneImageUrl: isDuotone ? 
            this.generateDuotoneImageUrl(finalType, part.id, availableColors[0] || '1', availableColors[1] || '2', set.gender) : 
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
    console.log(`📋 [ViaJovemCompleteService] Total de itens únicos processados: ${processedItems.size}`);
    console.log(`📋 [ViaJovemCompleteService] Categorias encontradas:`);
    Array.from(categories.entries()).forEach(([type, category]) => {
      console.log(`  ${type} (${TYPE_DISPLAY_NAMES[type] || type}): ${category.items.length} itens`);
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
