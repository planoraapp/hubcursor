
import { supabase } from '@/integrations/supabase/client';

interface OfficialTrendItem {
  className: string;
  name: string;
  currentPrice: number;
  previousPrice: number;
  changePercent: number;
  totalOpenOffers: number;
  soldItems: number;
  trend: 'up' | 'down' | 'stable';
}

export class OfficialTrendsService {
  // ETAPA 4: "Altas de Hoje" com dados oficiais
  static async getTodayHighs(hotel: string = 'br'): Promise<OfficialTrendItem[]> {
    try {
      console.log(`📈 [TrendsService] Fetching today's highs for ${hotel}`);
      
      // Buscar dados oficiais atualizados
      const { data, error } = await supabase.functions.invoke('habbo-official-marketplace', {
        body: { hotel }
      });
      
      if (error) {
        console.error('❌ [TrendsService] Error fetching official data:', error);
        return [];
      }
      
      if (!data?.items || !Array.isArray(data.items)) {
        console.warn('⚠️ [TrendsService] No items returned from API');
        return [];
      }
      
      // Filtrar apenas itens disponíveis no marketplace (totalOpenOffers > 0)
      const availableItems = data.items.filter((item: any) => 
        item.openOffers && item.openOffers > 0 && item.currentPrice > 0
      );
      
      // Calcular tendências baseado em dados oficiais
      const trendsItems: OfficialTrendItem[] = availableItems.map((item: any) => {
        const currentPrice = item.currentPrice || 0;
        const previousPrice = item.previousPrice || currentPrice;
        
        let changePercent = 0;
        if (previousPrice > 0) {
          changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
        }
        
        return {
          className: item.className,
          name: item.name,
          currentPrice,
          previousPrice,
          changePercent,
          totalOpenOffers: item.openOffers || 0,
          soldItems: item.soldItems || 0,
          trend: changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'stable'
        };
      });
      
      // Ordenar por maior variação percentual positiva
      const todayHighs = trendsItems
        .filter(item => item.trend === 'up' && item.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 10);
      
      console.log(`📊 [TrendsService] Found ${todayHighs.length} items with positive trends`);
      
      return todayHighs;
      
    } catch (error) {
      console.error('❌ [TrendsService] Failed to get today highs:', error);
      return [];
    }
  }
  
  // Obter itens mais vendidos (baseado em soldItems)
  static async getTopSellers(hotel: string = 'br'): Promise<OfficialTrendItem[]> {
    try {
      const { data, error } = await supabase.functions.invoke('habbo-official-marketplace', {
        body: { hotel }
      });
      
      if (error || !data?.items) return [];
      
      const topSellers = data.items
        .filter((item: any) => item.soldItems && item.soldItems > 0)
        .map((item: any) => ({
          className: item.className,
          name: item.name,
          currentPrice: item.currentPrice || 0,
          previousPrice: item.previousPrice || 0,
          changePercent: parseFloat(item.changePercent) || 0,
          totalOpenOffers: item.openOffers || 0,
          soldItems: item.soldItems || 0,
          trend: item.trend || 'stable'
        }))
        .sort((a: any, b: any) => b.soldItems - a.soldItems)
        .slice(0, 10);
      
      return topSellers;
      
    } catch (error) {
      console.error('❌ [TrendsService] Failed to get top sellers:', error);
      return [];
    }
  }
  
  // Obter oportunidades (itens raros com bom preço)
  static async getOpportunities(hotel: string = 'br'): Promise<OfficialTrendItem[]> {
    try {
      const { data, error } = await supabase.functions.invoke('habbo-official-marketplace', {
        body: { hotel }
      });
      
      if (error || !data?.items) return [];
      
      const opportunities = data.items
        .filter((item: any) => 
          (item.rarity === 'legendary' || 
           item.rarity === 'rare' || 
           item.className.toLowerCase().includes('ltd') ||
           item.currentPrice > 300) &&
          item.openOffers >= 0
        )
        .map((item: any) => ({
          className: item.className,
          name: item.name,
          currentPrice: item.currentPrice || 0,
          previousPrice: item.previousPrice || 0,
          changePercent: parseFloat(item.changePercent) || 0,
          totalOpenOffers: item.openOffers || 0,
          soldItems: item.soldItems || 0,
          trend: item.trend || 'stable'
        }))
        .sort((a: any, b: any) => b.currentPrice - a.currentPrice)
        .slice(0, 10);
      
      return opportunities;
      
    } catch (error) {
      console.error('❌ [TrendsService] Failed to get opportunities:', error);
      return [];
    }
  }
}
