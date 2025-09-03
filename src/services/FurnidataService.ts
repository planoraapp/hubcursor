
import furnidataJson from '@/data/furnidata.json';

export interface FurniItem {
  id: string;
  classname: string;
  name: string;
  description: string;
  category: string;
  furniline: string;
  environment: string;
  cansiton: string;
  canstandon: string;
  canlayon: string;
}

export class FurnidataService {
  private static furniMap: Map<string, FurniItem> | null = null;

  // ETAPA 3: Integração com dados do Morningstar
  private static initializeFurniMap(): void {
    if (this.furniMap) return;
    
    this.furniMap = new Map();
    
    // Carregar dados do furnidata.json local
    if (furnidataJson?.roomitemtypes?.furnitype) {
      furnidataJson.roomitemtypes.furnitype.forEach((item: FurniItem) => {
        this.furniMap!.set(item.classname, item);
      });
    }
    
    console.log(`📦 [FurnidataService] Loaded ${this.furniMap.size} furniture items from local data`);
  }

  // Mapear className para dados completos
  static getFurniData(className: string): FurniItem | null {
    this.initializeFurniMap();
    return this.furniMap!.get(className) || null;
  }

  // Obter nome correto do móvel
  static getFurniName(className: string): string {
    const furniData = this.getFurniData(className);
    return furniData?.name || className;
  }

  // Obter descrição do móvel
  static getFurniDescription(className: string): string {
    const furniData = this.getFurniData(className);
    return furniData?.description || `Móvel ${className}`;
  }

  // Obter categoria correta
  static getFurniCategory(className: string): string {
    const furniData = this.getFurniData(className);
    return furniData?.category || 'unknown';
  }

  // Verificar se é item raro/HC
  static getFurniRarity(className: string): 'common' | 'uncommon' | 'rare' | 'legendary' {
    const furniData = this.getFurniData(className);
    
    if (!furniData) return 'common';
    
    if (furniData.furniline === 'rare' || className.toLowerCase().includes('ltd')) {
      return 'legendary';
    }
    
    if (furniData.furniline === 'hc' || className.toLowerCase().includes('hc')) {
      return 'rare';
    }
    
    return 'common';
  }

  // Obter todos os móveis de uma categoria
  static getFurniByCategory(category: string): FurniItem[] {
    this.initializeFurniMap();
    
    return Array.from(this.furniMap!.values()).filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Buscar móveis por nome
  static searchFurni(searchTerm: string): FurniItem[] {
    this.initializeFurniMap();
    
    const term = searchTerm.toLowerCase();
    return Array.from(this.furniMap!.values()).filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.classname.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  }
}
