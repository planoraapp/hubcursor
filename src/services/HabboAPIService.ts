
import { supabase } from '@/integrations/supabase/client';
import type { MarketItem, MarketStats } from '@/contexts/MarketplaceContext';

interface FetchMarketDataParams {
  searchTerm: string;
  category: string;
  hotel: string;
  days: number;
}

export class HabboAPIService {
  static async fetchMarketData(params: FetchMarketDataParams): Promise<{ items: MarketItem[]; stats: MarketStats } | null> {
    console.log('🚀 [HabboAPIService] Fetching data from HabboAPI.site...');
    
    try {
      const { data, error } = await supabase.functions.invoke('habbo-market-history', {
        body: { 
          hotel: params.hotel,
          searchTerm: params.searchTerm,
          category: params.category === 'all' ? '' : params.category
        }
      });
      
      if (error) {
        console.error('❌ [HabboAPIService] Error:', error);
        return {
          items: [],
          stats: this.getErrorStats(error.message)
        };
      }
      
      if (data && data.items) {
        console.log(`✅ [HabboAPIService] Successfully loaded ${data.items.length} items`);
        
        // Filtrar e ordenar itens
        let filteredItems = data.items;
        
        if (params.searchTerm) {
          filteredItems = filteredItems.filter((item: MarketItem) =>
            item.name.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
            item.className.toLowerCase().includes(params.searchTerm.toLowerCase())
          );
        }
        
        return {
          items: filteredItems,
          stats: data.stats || this.calculateStats(filteredItems)
        };
      }
      
      return {
        items: [],
        stats: this.getNoDataStats()
      };
      
    } catch (error: any) {
      console.error('❌ [HabboAPIService] Fatal error:', error);
      return {
        items: [],
        stats: this.getErrorStats(error.message)
      };
    }
  }

  static sortItems(items: MarketItem[], sortBy: 'price' | 'recent' | 'quantity' | 'ltd'): MarketItem[] {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.currentPrice - a.currentPrice;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'quantity':
          return (a.openOffers || 0) - (b.openOffers || 0);
        case 'ltd':
          const aIsLTD = a.rarity === 'legendary' || a.className.toLowerCase().includes('ltd');
          const bIsLTD = b.rarity === 'legendary' || b.className.toLowerCase().includes('ltd');
          if (aIsLTD && !bIsLTD) return -1;
          if (!aIsLTD && bIsLTD) return 1;
          return b.currentPrice - a.currentPrice;
        default:
          return 0;
      }
    });
  }

  static getFilteredItems(items: MarketItem[], type: 'topSellers' | 'biggestGainers' | 'opportunities' | 'todayHigh'): MarketItem[] {
    switch (type) {
      case 'topSellers':
        return [...items]
          .filter(item => item.volume > 0)
          .sort((a, b) => b.volume - a.volume)
          .slice(0, 10);
      
      case 'biggestGainers':
        return [...items]
          .filter(item => item.trend === 'up' && parseFloat(item.changePercent) > 0)
          .sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent))
          .slice(0, 10);
      
      case 'opportunities':
        return [...items]
          .filter(item => 
            (item.rarity === 'legendary' || item.rarity === 'rare') && 
            item.currentPrice > 50
          )
          .sort((a, b) => {
            const rarityWeight = { legendary: 1000, rare: 100, uncommon: 10, common: 1 };
            const aWeight = (rarityWeight[item.rarity as keyof typeof rarityWeight] || 1) + item.currentPrice;
            const bWeight = (rarityWeight[item.rarity as keyof typeof rarityWeight] || 1) + item.currentPrice;
            return bWeight - aWeight;
          })
          .slice(0, 10);
      
      case 'todayHigh':
        return [...items]
          .filter(item => item.soldItems > 0)
          .sort((a, b) => b.currentPrice - a.currentPrice)
          .slice(0, 10);
      
      default:
        return [];
    }
  }

  private static calculateStats(items: MarketItem[]): MarketStats {
    if (items.length === 0) {
      return this.getNoDataStats();
    }
    
    const totalVolume = items.reduce((sum, item) => sum + item.volume, 0);
    const trendingUp = items.filter(item => item.trend === 'up').length;
    const trendingDown = items.filter(item => item.trend === 'down').length;
    const mostTradedItem = items.sort((a, b) => b.volume - a.volume)[0];
    
    return {
      totalItems: items.length,
      averagePrice: Math.floor(items.reduce((sum, item) => sum + item.currentPrice, 0) / items.length),
      totalVolume,
      trendingUp,
      trendingDown,
      featuredItems: items.filter(item => item.rarity === 'legendary').length,
      highestPrice: Math.max(...items.map(item => item.currentPrice)),
      mostTraded: mostTradedItem?.name || 'N/A',
      apiStatus: 'success',
      apiMessage: `${items.length} itens carregados da HabboAPI.site`
    };
  }

  private static getNoDataStats(): MarketStats {
    return {
      totalItems: 0,
      averagePrice: 0,
      totalVolume: 0,
      trendingUp: 0,
      trendingDown: 0,
      featuredItems: 0,
      highestPrice: 0,
      mostTraded: 'N/A',
      apiStatus: 'no-data',
      apiMessage: 'Nenhum dado disponível no momento'
    };
  }

  private static getErrorStats(errorMessage: string): MarketStats {
    return {
      totalItems: 0,
      averagePrice: 0,
      totalVolume: 0,
      trendingUp: 0,
      trendingDown: 0,
      featuredItems: 0,
      highestPrice: 0,
      mostTraded: 'N/A',
      apiStatus: 'error',
      apiMessage: `Erro: ${errorMessage}`
    };
  }

  static formatPrice(price: number): string {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k`;
    }
    return price.toString();
  }

  static getCategoryTranslation(category: string): string {
    const translations: Record<string, string> = {
      'furniture': 'Mobiliário',
      'wallitem': 'Decoração',
      'floor': 'Piso',
      'pet': 'Animais',
      'badge': 'Emblemas',
      'clothing': 'Roupas',
      'ltd': 'LTD/Raros',
      'hc': 'Habbo Club',
      'all': 'Todos'
    };
    
    return translations[category] || category;
  }
}
