
import { supabase } from '@/integrations/supabase/client';

interface OfficialTrendItem {
  className: string;
  name: string;
  currentPrice: number;
  previousPrice?: number;
  changePercent: number;
  totalOpenOffers: number;
  soldItems: number;
  trend: 'up' | 'down' | 'stable';
  isOfficialData: boolean;
  lastUpdated: string;
}

export class OfficialTrendsService {
  // "Altas de Hoje" baseado 100% em dados oficiais
  static async getTodayHighs(hotel: string = 'br'): Promise<OfficialTrendItem[]> {
    try {
            // Buscar dados oficiais
      const { data, error } = await supabase.functions.invoke('habbo-official-marketplace', {
        body: { hotel }
      });
      
      if (error) {
                return [];
      }
      
      if (!data?.items || !Array.isArray(data.items)) {
                return [];
      }
      
            // Filtrar apenas dados oficiais reais
      const officialItems = data.items.filter((item: any) => 
        item.isOfficialData === true && 
        item.currentPrice > 0 &&
        typeof item.soldItems === 'number'
      );
      
            // Converter para formato de tendências (sem simular dados)
      const trendsItems: OfficialTrendItem[] = officialItems.map((item: any) => {
        const currentPrice = item.currentPrice;
        const soldItems = item.soldItems;
        
        // Por enquanto, sem cálculo de tendência até implementarmos histórico real
        return {
          className: item.className,
          name: item.name,
          currentPrice,
          previousPrice: item.previousPrice, // undefined se não temos dados históricos
          changePercent: 0, // Será calculado quando tivermos histórico real
          totalOpenOffers: item.openOffers || 0,
          soldItems,
          trend: 'stable' as const, // Será calculado com dados históricos reais
          isOfficialData: true,
          lastUpdated: item.lastUpdated
        };
      });
      
      // Ordenar por volume de vendas (mais realista que variação simulada)
      const topByVolume = trendsItems
        .filter(item => item.soldItems > 0) // Apenas itens que realmente venderam
        .sort((a, b) => b.soldItems - a.soldItems)
        .slice(0, 10);
      
            return topByVolume;
      
    } catch (error) {
            return [];
    }
  }
  
  // Obter itens mais vendidos (100% baseado em dados oficiais)
  static async getTopSellers(hotel: string = 'br'): Promise<OfficialTrendItem[]> {
    try {
      const { data, error } = await supabase.functions.invoke('habbo-official-marketplace', {
        body: { hotel }
      });
      
      if (error || !data?.items) return [];
      
      const officialItems = data.items.filter((item: any) => 
        item.isOfficialData === true && item.soldItems > 0
      );
      
      const topSellers = officialItems
        .map((item: any) => ({
          className: item.className,
          name: item.name,
          currentPrice: item.currentPrice,
          previousPrice: item.previousPrice,
          changePercent: 0, // Será calculado com histórico real
          totalOpenOffers: item.openOffers || 0,
          soldItems: item.soldItems,
          trend: 'stable' as const,
          isOfficialData: true,
          lastUpdated: item.lastUpdated
        }))
        .sort((a: any, b: any) => b.soldItems - a.soldItems)
        .slice(0, 10);
      
            return topSellers;
      
    } catch (error) {
            return [];
    }
  }
  
  // Obter oportunidades (apenas dados oficiais de itens raros)
  static async getOpportunities(hotel: string = 'br'): Promise<OfficialTrendItem[]> {
    try {
      const { data, error } = await supabase.functions.invoke('habbo-official-marketplace', {
        body: { hotel }
      });
      
      if (error || !data?.items) return [];
      
      const opportunities = data.items
        .filter((item: any) => 
          item.isOfficialData === true &&
          (item.rarity === 'legendary' || 
           item.rarity === 'rare' || 
           item.currentPrice > 200) &&
          item.openOffers >= 0
        )
        .map((item: any) => ({
          className: item.className,
          name: item.name,
          currentPrice: item.currentPrice,
          previousPrice: item.previousPrice,
          changePercent: 0, // Dados reais quando tivermos histórico
          totalOpenOffers: item.openOffers || 0,
          soldItems: item.soldItems || 0,
          trend: 'stable' as const,
          isOfficialData: true,
          lastUpdated: item.lastUpdated
        }))
        .sort((a: any, b: any) => b.currentPrice - a.currentPrice)
        .slice(0, 10);
      
            return opportunities;
      
    } catch (error) {
            return [];
    }
  }
  
  // Verificar status da qualidade dos dados
  static async getDataQualityStatus(hotel: string = 'br'): Promise<{
    totalItems: number;
    officialItemsCount: number;
    realDataPercentage: number;
    lastUpdate: string;
    apiSuccessRate?: number;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('habbo-official-marketplace', {
        body: { hotel }
      });
      
      if (error || !data) {
        return {
          totalItems: 0,
          officialItemsCount: 0,
          realDataPercentage: 0,
          lastUpdate: new Date().toISOString()
        };
      }
      
      const officialItems = data.items?.filter((item: any) => item.isOfficialData === true) || [];
      
      return {
        totalItems: data.items?.length || 0,
        officialItemsCount: officialItems.length,
        realDataPercentage: data.metadata?.realDataPercentage || 100,
        lastUpdate: data.metadata?.fetchedAt || new Date().toISOString(),
        apiSuccessRate: data.metadata?.apiSuccessRate
      };
      
    } catch (error) {
            return {
        totalItems: 0,
        officialItemsCount: 0,
        realDataPercentage: 0,
        lastUpdate: new Date().toISOString()
      };
    }
  }
}
