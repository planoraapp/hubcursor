// src/services/FurnidataClothingService.ts
// Serviço para análise de roupas baseado no furnidata para detectar NFT, RARE e LTD

export interface FurnidataItem {
  classname: string;
  furniline: string;
  description: string;
  category: string;
  rarity?: string;
}

export interface ClothingRarityInfo {
  type: 'NORMAL' | 'HC' | 'NFT' | 'RARE' | 'LTD' | 'SELLABLE';
  furnidataClass?: string;
  nftCollection?: string;
  rarity?: string;
}

// Coleções NFT conhecidas
const NFT_COLLECTIONS = [
  'nft2025', 'nft2024', 'nft2023', 'nft', 'nftmint', 'testing'
];

export class FurnidataClothingService {
  private furnidataMap: Map<string, FurnidataItem> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas
  private lastFetch: number = 0;

  /**
   * Carrega dados do furnidata se necessário
   */
  private async loadFurnidataIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastFetch < this.cacheExpiry && this.furnidataMap.size > 0) {
      return; // Cache ainda válido
    }

    try {
      // Tentar carregar do Supabase primeiro
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('furnidata_clothing')
        .select('classname, furniline, description, category, rarity');

      if (!error && data) {
        data.forEach(item => {
          this.furnidataMap.set(item.classname, item);
        });
        console.log('✅ [FurnidataClothing] Loaded from Supabase:', this.furnidataMap.size, 'items');
        this.lastFetch = now;
        return;
      }

      // Fallback: carregar dados mock
      this.loadMockFurnidata();
      console.log('⚠️ [FurnidataClothing] Using mock data:', this.furnidataMap.size, 'items');
      this.lastFetch = now;

    } catch (error) {
      console.error('❌ [FurnidataClothing] Error loading furnidata:', error);
      this.loadMockFurnidata();
    }
  }

  /**
   * Carrega dados mock para funcionar sem API externa
   */
  private loadMockFurnidata(): void {
    const mockItems: FurnidataItem[] = [
      // Exemplos de NFT
      {
        classname: 'clothing_nft_digital_artist',
        furniline: 'nft2025',
        description: 'Digital Artist Outfit',
        category: 'clothing',
        rarity: 'nft'
      },
      {
        classname: 'clothing_nft_cyberpunk_warrior',
        furniline: 'nft2024',
        description: 'Cyberpunk Warrior Set',
        category: 'clothing',
        rarity: 'nft'
      },
      
      // Exemplos de RARE
      {
        classname: 'clothing_r16_helmhero',
        furniline: 'rare_collection',
        description: 'Hero Helmet',
        category: 'clothing',
        rarity: 'rare'
      },
      {
        classname: 'clothing_r25_dragonmaster',
        furniline: 'rare_collection',
        description: 'Dragon Master Outfit',
        category: 'clothing',
        rarity: 'rare'
      },
      
      // Exemplos de LTD
      {
        classname: 'clothing_ltd23_solarpunkbunny',
        furniline: 'limited_collection',
        description: 'Solar Punk Bunny',
        category: 'clothing',
        rarity: 'ltd'
      },
      {
        classname: 'clothing_ltd45_neonrider',
        furniline: 'limited_collection',
        description: 'Neon Rider Jacket',
        category: 'clothing',
        rarity: 'ltd'
      }
    ];

    mockItems.forEach(item => {
      this.furnidataMap.set(item.classname, item);
    });
  }

  /**
   * Analisa a raridade de uma roupa baseada no furnidata
   */
  async analyzeClothingRarity(categoryId: string, figureId: string): Promise<ClothingRarityInfo> {
    await this.loadFurnidataIfNeeded();

    // Buscar por classname no formato esperado
    const possibleClassnames = [
      `${categoryId}_${figureId}`,
      `clothing_${categoryId}_${figureId}`,
      `clothing_${categoryId}_${figureId}_special`,
      `clothing_${categoryId}_${figureId}_hc`,
      `clothing_${categoryId}_${figureId}_rare`
    ];

    for (const classname of possibleClassnames) {
      const furnidataItem = this.furnidataMap.get(classname);
      if (furnidataItem) {
        return this.categorizeFromFurnidata(furnidataItem);
      }
    }

    // Se não encontrou no furnidata, retornar como normal
    return {
      type: 'NORMAL'
    };
  }

  /**
   * Categoriza item baseado nos dados do furnidata
   */
  private categorizeFromFurnidata(item: FurnidataItem): ClothingRarityInfo {
    // Verificar NFT
    if (item.furniline && NFT_COLLECTIONS.includes(item.furniline)) {
      return {
        type: 'NFT',
        furnidataClass: item.classname,
        nftCollection: item.furniline,
        rarity: 'nft'
      };
    }

    // Verificar RARE (classname começa com "clothing_r")
    if (item.classname.startsWith('clothing_r')) {
      return {
        type: 'RARE',
        furnidataClass: item.classname,
        rarity: 'rare'
      };
    }

    // Verificar LTD (classname começa com "clothing_ltd")
    if (item.classname.startsWith('clothing_ltd')) {
      return {
        type: 'LTD',
        furnidataClass: item.classname,
        rarity: 'ltd'
      };
    }

    // Verificar se é item especial por descrição
    if (item.description.toLowerCase().includes('hc') || 
        item.description.toLowerCase().includes('club')) {
      return {
        type: 'HC',
        furnidataClass: item.classname,
        rarity: 'hc'
      };
    }

    return {
      type: 'NORMAL',
      furnidataClass: item.classname
    };
  }

  /**
   * Obtém informações do furnidata para um item específico
   */
  async getFurnidataInfo(categoryId: string, figureId: string): Promise<FurnidataItem | null> {
    await this.loadFurnidataIfNeeded();

    const possibleClassnames = [
      `${categoryId}_${figureId}`,
      `clothing_${categoryId}_${figureId}`,
      `clothing_${categoryId}_${figureId}_special`,
      `clothing_${categoryId}_${figureId}_hc`,
      `clothing_${categoryId}_${figureId}_rare`
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
   * Obtém estatísticas das categorias
   */
  async getCategoryStats(): Promise<Record<string, number>> {
    await this.loadFurnidataIfNeeded();

    const stats = {
      total: this.furnidataMap.size,
      nft: 0,
      rare: 0,
      ltd: 0,
      hc: 0,
      normal: 0
    };

    this.furnidataMap.forEach(item => {
      if (item.furniline && NFT_COLLECTIONS.includes(item.furniline)) {
        stats.nft++;
      } else if (item.classname.startsWith('clothing_r')) {
        stats.rare++;
      } else if (item.classname.startsWith('clothing_ltd')) {
        stats.ltd++;
      } else if (item.description.toLowerCase().includes('hc')) {
        stats.hc++;
      } else {
        stats.normal++;
      }
    });

    return stats;
  }

  /**
   * Busca itens por categoria de raridade
   */
  async getItemsByRarity(type: 'NFT' | 'RARE' | 'LTD' | 'HC'): Promise<FurnidataItem[]> {
    await this.loadFurnidataIfNeeded();

    const items: FurnidataItem[] = [];

    this.furnidataMap.forEach(item => {
      const rarityInfo = this.categorizeFromFurnidata(item);
      if (rarityInfo.type === type) {
        items.push(item);
      }
    });

    return items;
  }
}

// Instância singleton
export const furnidataClothingService = new FurnidataClothingService();
