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
    const { data, error } = await supabase.functions.invoke('habbo-market-real', {
      body: params
    });
    
    if (error) {
      throw new Error(`Erro na função: ${error.message}`);
    }
    
    return data;
  }

  static async fetchClubItems(hotel: string): Promise<ClubItem[]> {
    // Dados fixos para HC e CA com imagens corretas
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

    // Simular delay de rede
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
        return [...items].sort((a, b) => (b.soldItems || b.volume || 0) - (a.soldItems || a.volume || 0)).slice(0, 10);
      
      case 'biggestGainers':
        return [...items].filter(item => item.trend === 'up' && (item.soldItems || item.volume || 0) > 5).slice(0, 10);
      
      case 'opportunities':
        return [...items].filter(item => 
          item.className.toLowerCase().includes('ltd') || 
          item.rarity === 'legendary' ||
          item.name.toLowerCase().includes('ltd') ||
          item.currentPrice > 1000
        ).sort((a, b) => b.currentPrice - a.currentPrice).slice(0, 10);
      
      case 'todayHigh':
        return [...items].filter(item => item.trend === 'up').sort((a, b) => 
          parseFloat(b.changePercent) - parseFloat(a.changePercent)
        ).slice(0, 10);
      
      default:
        return [];
    }
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