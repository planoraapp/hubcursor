// src/services/RealFigureDataService.ts
// Serviço para carregar dados reais do figuredata.json local (estratégia ViaJovem)

export interface RealFigureDataItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  colors: string[];
  club: 'FREE' | 'HC';
  name: string;
  source: 'real-figuredata';
  imageUrl: string;
  isColorable: boolean;
  isSelectable: boolean;
}

export interface RealFigureDataCategory {
  id: string;
  name: string;
  displayName: string;
  items: RealFigureDataItem[];
  colors: string[];
  gender: 'M' | 'F' | 'U' | 'ALL';
}

// Mapeamento de categorias para nomes amigáveis
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
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

// Cores padrão para cada categoria
const DEFAULT_COLORS: Record<string, string[]> = {
  'hd': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  'hr': ['1', '21', '45', '61', '92', '104', '26', '31'],
  'ch': ['1', '61', '92', '100', '106', '143'],
  'cc': ['1', '61', '92', '100'],
  'lg': ['1', '61', '92', '82', '100'],
  'sh': ['1', '61', '92', '80'],
  'ha': ['1', '61', '92', '21'],
  'ea': ['1', '2', '3', '4'],
  'ca': ['1', '61', '92'],
  'cp': ['1', '2', '3', '4', '5'],
  'wa': ['1', '61', '92']
};

export class RealFigureDataService {
  private cache = new Map<string, any>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Carrega dados reais do figuredata.json local
   */
  async loadRealFigureData(): Promise<{ [key: string]: RealFigureDataCategory }> {
    const cacheKey = 'real_figuredata';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
            const response = await fetch('/figuredata.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const processedData = this.processFigureData(data);
      
      this.cache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      });
      
      console.log('✅ [RealFigureData] Loaded successfully:', {
        categories: Object.keys(processedData).length,
        totalItems: Object.values(processedData).reduce((sum, cat) => sum + cat.items.length, 0)
      });
      
      return processedData;
      
    } catch (error) {
            const mockData = this.getMockFigureData();
      this.cache.set(cacheKey, {
        data: mockData,
        timestamp: Date.now()
      });
      return mockData;
    }
  }

  /**
   * Processa dados do figuredata.json
   */
  private processFigureData(data: any): { [key: string]: RealFigureDataCategory } {
    const categories: { [key: string]: RealFigureDataCategory } = {};
    
    Object.entries(data).forEach(([categoryId, items]: [string, any]) => {
      // Pular metadados e categorias inválidas
      if (categoryId.startsWith('_') || !CATEGORY_DISPLAY_NAMES[categoryId]) {
        return;
      }
      
      const categoryInfo = CATEGORY_DISPLAY_NAMES[categoryId];
      const defaultColors = DEFAULT_COLORS[categoryId] || ['1', '2', '3', '4', '5'];
      
      const processedItems: RealFigureDataItem[] = (items as any[]).map((item: any) => {
        const colors = item.colors || defaultColors;
        const primaryColor = colors[0] || '1';
        
        return {
          id: `${categoryId}_${item.id}`,
          figureId: item.id.toString(),
          category: categoryId,
          gender: item.gender || 'U',
          colors: colors,
          club: item.club === '1' ? 'HC' : 'FREE',
          name: `${categoryInfo} ${item.id}`,
          source: 'real-figuredata',
          imageUrl: this.generateImageUrl(categoryId, item.id.toString(), primaryColor, item.gender || 'U'),
          isColorable: item.colorable !== false,
          isSelectable: item.selectable !== false
        };
      });
      
      categories[categoryId] = {
        id: categoryId,
        name: categoryId,
        displayName: categoryInfo,
        items: processedItems,
        colors: [...new Set(processedItems.flatMap(item => item.colors))],
        gender: 'ALL'
      };
    });
    
    return categories;
  }

  /**
   * Gera URL da imagem do avatar
   */
  private generateImageUrl(category: string, figureId: string, color: string, gender: string): string {
    // Usar avatares base apropriados por gênero
    let baseFigure = '';
    
    if (category === 'hr') {
      // Para cabelos, usar avatar base focado na cabeça
      if (gender === 'F') {
        baseFigure = 'hd-600-1-.ch-710-66-.lg-870-82-.sh-290-80-';
      } else {
        baseFigure = 'hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-';
      }
    } else {
      // Para outras categorias, usar avatar completo
      baseFigure = gender === 'F' 
        ? 'hr-500-7-.hd-600-1-.ch-710-66-.lg-870-82-.sh-290-80-'
        : 'hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-';
    }
    
    const figureString = `${baseFigure}.${category}-${figureId}-${color}`;
    const cleanFigure = figureString.replace(/\.$/, '');
    
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cleanFigure}&gender=${gender}&direction=2&head_direction=2&action=gesture=std&size=m`;
  }

  /**
   * Dados mock para fallback
   */
  private getMockFigureData(): { [key: string]: RealFigureDataCategory } {
    const mockCategories: { [key: string]: RealFigureDataCategory } = {};
    
    Object.entries(CATEGORY_DISPLAY_NAMES).forEach(([categoryId, displayName]) => {
      const items: RealFigureDataItem[] = [];
      const colors = DEFAULT_COLORS[categoryId] || ['1', '2', '3', '4', '5'];
      
      // Gerar 50 itens mock por categoria
      for (let i = 1; i <= 50; i++) {
        const figureId = (100 + i).toString();
        const gender = i % 3 === 0 ? 'F' : i % 3 === 1 ? 'M' : 'U';
        const primaryColor = colors[0] || '1';
        
        items.push({
          id: `${categoryId}_${figureId}`,
          figureId,
          category: categoryId,
          gender,
          colors,
          club: i % 5 === 0 ? 'HC' : 'FREE',
          name: `${displayName} ${figureId}`,
          source: 'real-figuredata',
          imageUrl: this.generateImageUrl(categoryId, figureId, primaryColor, gender),
          isColorable: true,
          isSelectable: true
        });
      }
      
      mockCategories[categoryId] = {
        id: categoryId,
        name: categoryId,
        displayName,
        items,
        colors,
        gender: 'ALL'
      };
    });
    
    return mockCategories;
  }

  /**
   * Obtém categoria específica
   */
  async getCategory(categoryId: string, gender?: 'M' | 'F'): Promise<RealFigureDataCategory | null> {
    const data = await this.loadRealFigureData();
    const category = data[categoryId];
    
    if (!category) return null;
    
    if (gender) {
      return {
        ...category,
        items: category.items.filter(item => item.gender === gender || item.gender === 'U')
      };
    }
    
    return category;
  }

  /**
   * Obtém todas as categorias
   */
  async getAllCategories(): Promise<{ [key: string]: RealFigureDataCategory }> {
    return await this.loadRealFigureData();
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obter estatísticas
   */
  async getStats(): Promise<{ totalCategories: number; totalItems: number; categoryStats: Record<string, number> }> {
    const data = await this.loadRealFigureData();
    const totalItems = Object.values(data).reduce((sum, cat) => sum + cat.items.length, 0);
    
    const categoryStats: Record<string, number> = {};
    Object.values(data).forEach(category => {
      categoryStats[category.id] = category.items.length;
    });
    
    return {
      totalCategories: Object.keys(data).length,
      totalItems,
      categoryStats
    };
  }
}

// Instância singleton
export const realFigureDataService = new RealFigureDataService();
export default realFigureDataService;
