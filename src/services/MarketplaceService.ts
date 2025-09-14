import { supabase } from '@/integrations/supabase/client';
import type { MarketItem, ClubItem, MarketStats } from '@/contexts/MarketplaceContext';
import { FurnidataService } from './FurnidataService';

interface FetchMarketDataParams {
  searchTerm: string;
  category: string;
  hotel: string;
  days: number;
}

export class MarketplaceService {
  static async fetchMarketData(params: FetchMarketDataParams): Promise<{ items: MarketItem[]; stats: MarketStats } | null> {
        try {
      // Usar apenas a API oficial com dados reais
      const { data, error } = await supabase.functions.invoke('habbo-official-marketplace', {
        body: { 
          hotel: params.hotel
        }
      });
      
      if (error) {
                // Não lançar exceção - retornar dados vazios com transparência
        return {
          items: [],
          stats: this.calculateRealStats([], { 
            error: error.message,
            apiStatus: 'unavailable' 
          })
        };
      }
      
      // Dados válidos da API, mesmo que seja lista vazia
      if (data) {
        const realDataPercentage = data.metadata?.realDataPercentage || 0;
        const officialItemsCount = data.metadata?.officialItemsCount || 0;
        const apiSuccessRate = data.metadata?.apiSuccessRate || 0;
        
                        // Enriquecer dados oficiais disponíveis
        const items = data.items || [];
        const enrichedItems = items
          .filter((item: any) => item.isOfficialData === true)
          .map((item: any) => ({
            ...item,
            name: FurnidataService.getFurniName(item.className),
            description: FurnidataService.getFurniDescription(item.className),
            category: FurnidataService.getFurniCategory(item.className),
            rarity: FurnidataService.getFurniRarity(item.className)
          }));
        
        // Filtrar baseado nos parâmetros
        let filteredItems = enrichedItems;
        
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
          stats: this.calculateRealStats(filteredItems, {
            ...data.metadata,
            apiSuccessRate,
            officialItemsCount,
            apiStatus: apiSuccessRate > 0 ? 'partial' : 'no-data'
          })
        };
      }
      
      // Resposta sem dados - situação normal para API oficial instável
            return {
        items: [],
        stats: this.calculateRealStats([], { 
          apiStatus: 'no-data',
          message: 'API oficial temporariamente sem dados' 
        })
      };
      
    } catch (error: any) {
            // Retornar dados vazios com informação do erro, não lançar exceção
      return {
        items: [],
        stats: this.calculateRealStats([], { 
          apiStatus: 'error',
          message: `Erro de conexão: ${error.message}` 
        })
      };
    }
  }

  static async fetchClubItems(hotel: string): Promise<ClubItem[]> {
    // Manter dados de club simples (não são do marketplace)
    const clubItems: ClubItem[] = [
      {
        id: 'hc_31_days',
        name: '31 Dias HC',
        price: 25000,
        className: 'hc31',
        type: 'hc',
        imageUrl: '/assets/hc31.png',
        available: true // Fixed: keeping as boolean
      },
      {
        id: 'ca_31_days', 
        name: '31 Dias CA',
        price: 30000,
        className: 'ca31',
        type: 'ca',
        imageUrl: '/assets/bc31.png',
        available: true // Fixed: keeping as boolean
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
          const aIsLTD = a.className.toLowerCase().includes('ltd') || a.rarity === 'legendary';
          const bIsLTD = b.className.toLowerCase().includes('ltd') || b.rarity === 'legendary';
          if (aIsLTD && !bIsLTD) return -1;
          if (!aIsLTD && bIsLTD) return 1;
          return b.currentPrice - a.currentPrice;
        default:
          return 0;
      }
    });
  }

  // Obter itens filtrados com base apenas em dados oficiais
  static getFilteredItems(items: MarketItem[], type: 'topSellers' | 'biggestGainers' | 'opportunities' | 'todayHigh'): MarketItem[] {
    // Filtrar apenas itens com dados oficiais reais
    const officialItems = items.filter(item => (item as any).isOfficialData === true);
    
    switch (type) {
      case 'topSellers':
        // Baseado em soldItems reais da API oficial
        return [...officialItems]
          .filter(item => (item.soldItems || 0) > 0)
          .sort((a, b) => (b.soldItems || 0) - (a.soldItems || 0))
          .slice(0, 10);
      
      case 'biggestGainers':
        // Apenas itens com dados de tendência reais (quando implementarmos histórico)
        return [...officialItems]
          .filter(item => item.trend === 'up' && parseFloat(item.changePercent) > 0)
          .sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent))
          .slice(0, 10);
      
      case 'opportunities':
        // Itens raros com dados oficiais
        return [...officialItems]
          .filter(item => {
            const rarity = FurnidataService.getFurniRarity(item.className);
            return (
              rarity === 'legendary' || 
              rarity === 'rare' ||
              item.currentPrice > 200
            ) && (item.openOffers || 0) >= 0;
          })
          .sort((a, b) => {
            const rarityWeight = { legendary: 3, rare: 2, uncommon: 1, common: 0 };
            const aRarity = FurnidataService.getFurniRarity(a.className);
            const bRarity = FurnidataService.getFurniRarity(b.className);
            const aWeight = (rarityWeight[aRarity] || 0) * 1000 + a.currentPrice;
            const bWeight = (rarityWeight[bRarity] || 0) * 1000 + b.currentPrice;
            return bWeight - aWeight;
          })
          .slice(0, 10);
      
      case 'todayHigh':
        // Baseado em volume de vendas real (mais confiável que variação simulada)
        return [...officialItems]
          .filter(item => (item.soldItems || 0) > 0)
          .sort((a, b) => (b.soldItems || 0) - (a.soldItems || 0))
          .slice(0, 10);
      
      default:
        return [];
    }
  }

  private static calculateRealStats(items: MarketItem[], metadata: any): MarketStats {
    const officialItems = items.filter((item: any) => item.isOfficialData === true);
    
    if (officialItems.length === 0) {
      return {
        totalItems: 0,
        averagePrice: 0,
        totalVolume: 0,
        trendingUp: 0,
        trendingDown: 0,
        featuredItems: 0,
        highestPrice: 0,
        mostTraded: 'N/A',
        apiStatus: metadata?.apiStatus || 'unknown',
        apiMessage: metadata?.message || 'Sem dados oficiais disponíveis'
      };
    }
    
    const totalVolume = officialItems.reduce((sum, item) => sum + (item.soldItems || 0), 0);
    const trendingUp = officialItems.filter(item => item.trend === 'up').length;
    const trendingDown = officialItems.filter(item => item.trend === 'down').length;
    const mostTradedItem = officialItems.sort((a, b) => (b.soldItems || 0) - (a.soldItems || 0))[0];
    
    return {
      totalItems: officialItems.length,
      averagePrice: Math.floor(officialItems.reduce((sum, item) => sum + item.currentPrice, 0) / officialItems.length),
      totalVolume,
      trendingUp,
      trendingDown,
      featuredItems: officialItems.length,
      highestPrice: Math.max(...officialItems.map(item => item.currentPrice)),
      mostTraded: mostTradedItem?.name || 'N/A',
      apiStatus: 'success',
      apiMessage: `${officialItems.length} itens oficiais carregados`
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
