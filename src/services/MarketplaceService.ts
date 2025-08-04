import { supabase } from '@/integrations/supabase/client';
import type { MarketItem, ClubItem, MarketStats } from '@/contexts/MarketplaceContext';

interface FetchMarketDataParams {
  searchTerm: string;
  category: string;
  hotel: string;
  days: number;
}

export class MarketplaceService {
  static async fetchMarketData(params: FetchMarketDataParams): Promise<{ items: MarketItem[]; stats: MarketStats } | null> {
    console.log('🔄 [MarketplaceService] Fetching official marketplace data...');
    
    try {
      // Usar a nova edge function oficial
      const { data, error } = await supabase.functions.invoke('habbo-official-marketplace', {
        body: { 
          hotel: params.hotel
        }
      });
      
      if (error) {
        console.error('❌ [MarketplaceService] Official function error:', error);
        throw new Error(`Erro na função oficial: ${error.message}`);
      }
      
      if (data?.items && Array.isArray(data.items)) {
        console.log(`✅ [MarketplaceService] Loaded ${data.items.length} official items`);
        
        // Filtrar itens baseado nos parâmetros
        let filteredItems = data.items;
        
        if (params.searchTerm) {
          filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
            item.className.toLowerCase().includes(params.searchTerm.toLowerCase())
          );
        }
        
        if (params.category && params.category !== 'all') {
          filteredItems = filteredItems.filter(item =>
            item.category.toLowerCase().includes(params.category.toLowerCase())
          );
        }
        
        return {
          items: filteredItems,
          stats: data.stats || this.calculateDefaultStats(filteredItems)
        };
      }
      
      console.warn('⚠️ [MarketplaceService] No items returned from official API');
      return null;
      
    } catch (error: any) {
      console.error('❌ [MarketplaceService] Failed to fetch official data:', error);
      
      // Fallback para a função anterior se a oficial falhar
      console.log('🔄 [MarketplaceService] Falling back to habbo-market-real...');
      
      try {
        const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('habbo-market-real', {
          body: params
        });
        
        if (fallbackError) {
          throw new Error(`Erro no fallback: ${fallbackError.message}`);
        }
        
        return fallbackData;
      } catch (fallbackErr) {
        console.error('❌ [MarketplaceService] Fallback also failed:', fallbackErr);
        throw new Error(`Ambas as fontes de dados falharam: ${error.message}`);
      }
    }
  }

  static async fetchClubItems(hotel: string): Promise<ClubItem[]> {
    const clubItems: ClubItem[] = [
      {
        id: 'hc_31_days',
        name: '31 Dias HC',
        price: 25000,
        className: 'hc31',
        type: 'hc',
        imageUrl: '/assets/hc31.png',
        available: true
      },
      {
        id: 'ca_31_days', 
        name: '31 Dias CA',
        price: 30000,
        className: 'ca31',
        type: 'ca',
        imageUrl: '/assets/bc31.png',
        available: true
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 300));
    return clubItems;
  }

  static sortItems(items: MarketItem[], sortBy: 'price' | 'recent' | 'quantity' | 'ltd'): MarketItem[] {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.currentPrice - a.currentPrice;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'quantity':
          return (a.openOffers || a.quantity || 999) - (b.openOffers || b.quantity || 999);
        case 'ltd':
          const aIsLTD = a.className.toLowerCase().includes('ltd');
          const bIsLTD = b.className.toLowerCase().includes('ltd');
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
        // Baseado em soldItems da API oficial
        return [...items].sort((a, b) => (b.soldItems || b.volume || 0) - (a.soldItems || a.volume || 0)).slice(0, 10);
      
      case 'biggestGainers':
        // Itens com trend 'up' e volume significativo
        return [...items].filter(item => 
          item.trend === 'up' && (item.soldItems || item.volume || 0) > 0
        ).sort((a, b) => 
          parseFloat(b.changePercent) - parseFloat(a.changePercent)
        ).slice(0, 10);
      
      case 'opportunities':
        // LTDs e itens raros com ofertas abertas
        return [...items].filter(item => 
          (item.className.toLowerCase().includes('ltd') || 
           item.rarity === 'legendary' ||
           item.name.toLowerCase().includes('rare') ||
           item.currentPrice > 500) &&
          (item.openOffers || 0) > 0
        ).sort((a, b) => b.currentPrice - a.currentPrice).slice(0, 10);
      
      case 'todayHigh':
        // Maiores altas baseado em dados oficiais
        return [...items].filter(item => 
          item.trend === 'up' && parseFloat(item.changePercent) > 0
        ).sort((a, b) => 
          parseFloat(b.changePercent) - parseFloat(a.changePercent)
        ).slice(0, 10);
      
      default:
        return [];
    }
  }

  private static calculateDefaultStats(items: MarketItem[]): MarketStats {
    if (items.length === 0) {
      return {
        totalItems: 0,
        averagePrice: 0,
        totalVolume: 0,
        trendingUp: 0,
        trendingDown: 0,
        featuredItems: 0,
        highestPrice: 0,
        mostTraded: 'N/A'
      };
    }
    
    return {
      totalItems: items.length,
      averagePrice: Math.floor(items.reduce((sum, item) => sum + item.currentPrice, 0) / items.length),
      totalVolume: items.reduce((sum, item) => sum + (item.soldItems || item.volume || 0), 0),
      trendingUp: items.filter(item => item.trend === 'up').length,
      trendingDown: items.filter(item => item.trend === 'down').length,
      featuredItems: Math.min(items.length, 10),
      highestPrice: Math.max(...items.map(item => item.currentPrice)),
      mostTraded: items.sort((a, b) => (b.soldItems || b.volume || 0) - (a.soldItems || a.volume || 0))[0]?.name || 'N/A'
    };
  }

  static calculatePriceChange(current: number, previous: number): { changePercent: string; trend: 'up' | 'down' | 'stable' } {
    if (previous === 0) return { changePercent: '0', trend: 'stable' };
    
    const change = ((current - previous) / previous) * 100;
    
    return {
      changePercent: change.toFixed(1),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
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
