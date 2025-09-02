
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface HabboAPIResponse {
  ClassName: string;
  FurniName: string;
  FurniDescription: string;
  Line: string;
  Category: string;
  Revision: number;
  FurniType: string;
  marketData: {
    history: number[][];
    averagePrice: number;
    lastUpdated: string;
  };
  hotel_domain: string;
}

interface MarketItem {
  id: string;
  name: string;
  className: string;
  category: string;
  currentPrice: number;
  previousPrice?: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: string;
  volume: number;
  imageUrl: string;
  rarity: string;
  description: string;
  hotel: string;
  priceHistory: number[];
  lastUpdated: string;
  soldItems: number;
  openOffers: number;
  isOfficialData: boolean;
}

// Cache para dados da API - TTL de 5 minutos
const apiCache = new Map<string, { data: MarketItem[], timestamp: number }>();
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotel = 'com', searchTerm = '', category = '' } = await req.json().catch(() => ({}));
    
    console.log(`🚀 [HabboMarketHistory] Fetching data for hotel: ${hotel}`);

    // Verificar cache
    const cacheKey = `${hotel}-${searchTerm}-${category}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < API_CACHE_DURATION) {
      console.log(`💾 [Cache] Using cached data for ${cacheKey}`);
      return new Response(
        JSON.stringify({
          items: cached.data,
          stats: calculateStats(cached.data),
          metadata: {
            hotel,
            source: 'cache',
            fetchedAt: new Date().toISOString(),
            totalItems: cached.data.length
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Termos de busca otimizados para diferentes categorias
    const searchTerms = getOptimizedSearchTerms(searchTerm, category);
    const allItems: MarketItem[] = [];
    let successCount = 0;

    console.log(`🔍 [Search] Testing ${searchTerms.length} search terms...`);

    for (const term of searchTerms) {
      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
        
        const url = `https://habboapi.site/api/market/history?${term.type}=${encodeURIComponent(term.value)}&hotel=${hotel}&days=30`;
        console.log(`📡 [API] Fetching: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HabboHub/3.0'
          },
          signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
          console.log(`❌ [API] Error ${response.status} for term: ${term.value}`);
          continue;
        }

        const data: HabboAPIResponse[] = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          for (const item of data) {
            if (item.marketData && item.marketData.history.length > 0) {
              const marketItem = mapHabboAPIToMarketItem(item, hotel);
              if (marketItem) {
                allItems.push(marketItem);
                successCount++;
              }
            }
          }
          console.log(`✅ [API] Found ${data.length} items for term: ${term.value}`);
        }
      } catch (error) {
        console.log(`❌ [API] Error for term ${term.value}: ${error.message}`);
        continue;
      }
    }

    // Remover duplicatas baseado no className
    const uniqueItems = allItems.filter((item, index, self) => 
      index === self.findIndex(i => i.className === item.className)
    );

    console.log(`📊 [Results] Found ${uniqueItems.length} unique items from ${successCount} successful API calls`);

    // Cache os resultados
    if (uniqueItems.length > 0) {
      apiCache.set(cacheKey, { data: uniqueItems, timestamp: Date.now() });
    }

    const stats = calculateStats(uniqueItems);

    return new Response(
      JSON.stringify({
        items: uniqueItems,
        stats,
        metadata: {
          hotel,
          source: 'habbo-api-site',
          fetchedAt: new Date().toISOString(),
          totalItems: uniqueItems.length,
          successfulCalls: successCount,
          testedTerms: searchTerms.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [HabboMarketHistory] Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        items: [],
        stats: calculateStats([]),
        error: `API Error: ${error.message}`,
        metadata: {
          hotel: 'com',
          source: 'error',
          fetchedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getOptimizedSearchTerms(searchTerm: string, category: string): { type: string, value: string }[] {
  const terms: { type: string, value: string }[] = [];
  
  // Se há termo de busca específico, priorizar ele
  if (searchTerm && searchTerm.length > 2) {
    terms.push({ type: 'name', value: searchTerm });
    terms.push({ type: 'classname', value: searchTerm });
    return terms;
  }
  
  // Termos por categoria
  switch (category) {
    case 'hc':
    case 'habbo_club':
      terms.push({ type: 'classname', value: 'hc_*' });
      terms.push({ type: 'name', value: 'habbo club' });
      break;
      
    case 'rare':
    case 'ltd':
      terms.push({ type: 'classname', value: 'rare_*' });
      terms.push({ type: 'classname', value: 'ltd*' });
      terms.push({ type: 'name', value: 'rare' });
      terms.push({ type: 'description', value: 'rare' });
      break;
      
    case 'furniture':
      terms.push({ type: 'classname', value: 'chair*' });
      terms.push({ type: 'classname', value: 'table*' });
      terms.push({ type: 'classname', value: 'sofa*' });
      terms.push({ type: 'classname', value: 'bed*' });
      break;
      
    case 'decoration':
      terms.push({ type: 'classname', value: 'plant*' });
      terms.push({ type: 'classname', value: 'lamp*' });
      terms.push({ type: 'name', value: 'dragon' });
      break;
      
    default:
      // Busca geral - itens mais populares
      terms.push({ type: 'classname', value: 'throne' });
      terms.push({ type: 'classname', value: 'hc_*' });
      terms.push({ type: 'classname', value: 'rare_*' });
      terms.push({ type: 'name', value: 'dragon' });
      terms.push({ type: 'classname', value: 'chair*' });
      terms.push({ type: 'classname', value: 'sofa*' });
      break;
  }
  
  return terms.slice(0, 8); // Limitar a 8 termos para performance
}

function mapHabboAPIToMarketItem(apiItem: HabboAPIResponse, hotel: string): MarketItem | null {
  try {
    const history = apiItem.marketData.history;
    const currentPrice = apiItem.marketData.averagePrice;
    
    // Calcular tendência baseada no histórico real
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let changePercent = '0.0';
    let previousPrice = currentPrice;
    
    if (history.length >= 2) {
      const recent = history[history.length - 1];
      const previous = history[history.length - 2];
      
      if (recent && previous && recent[0] !== undefined && previous[0] !== undefined) {
        previousPrice = previous[0];
        const change = ((recent[0] - previous[0]) / previous[0]) * 100;
        
        if (change > 1) trend = 'up';
        else if (change < -1) trend = 'down';
        
        changePercent = Math.abs(change).toFixed(1);
      }
    }
    
    // Calcular volume de vendas total
    const totalVolume = history.reduce((sum, entry) => sum + (entry[1] || 0), 0);
    const soldItems = history[history.length - 1]?.[1] || 0;
    const openOffers = history[history.length - 1]?.[3] || 0;
    
    return {
      id: `habboapi_${apiItem.ClassName}_${hotel}`,
      name: apiItem.FurniName,
      className: apiItem.ClassName,
      category: apiItem.Category,
      currentPrice,
      previousPrice,
      trend,
      changePercent,
      volume: totalVolume,
      imageUrl: `https://habboapi.site/api/image/${apiItem.ClassName}`,
      rarity: determineRarity(apiItem),
      description: apiItem.FurniDescription,
      hotel,
      priceHistory: history.map(entry => entry[0]).filter(price => price > 0),
      lastUpdated: apiItem.marketData.lastUpdated,
      soldItems,
      openOffers,
      isOfficialData: true
    };
  } catch (error) {
    console.error(`Error mapping item ${apiItem.ClassName}:`, error);
    return null;
  }
}

function determineRarity(apiItem: HabboAPIResponse): string {
  const name = apiItem.FurniName.toLowerCase();
  const className = apiItem.ClassName.toLowerCase();
  const line = apiItem.Line?.toLowerCase() || '';
  const price = apiItem.marketData.averagePrice;
  
  if (className.includes('ltd') || name.includes('ltd') || line.includes('ltd')) {
    return 'legendary';
  }
  
  if (className.includes('rare') || name.includes('rare') || line.includes('rare') || price > 1000) {
    return 'legendary';
  }
  
  if (className.includes('hc') || name.includes('habbo club') || price > 100) {
    return 'rare';
  }
  
  if (price > 20) {
    return 'uncommon';
  }
  
  return 'common';
}

function calculateStats(items: MarketItem[]) {
  if (items.length === 0) {
    return {
      totalItems: 0,
      averagePrice: 0,
      totalVolume: 0,
      trendingUp: 0,
      trendingDown: 0,
      featuredItems: 0,
      highestPrice: 0,
      mostTraded: 'N/A',
      apiStatus: 'no-data' as const,
      apiMessage: 'Nenhum dado disponível'
    };
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
    apiStatus: 'success' as const,
    apiMessage: `${items.length} itens carregados da HabboAPI.site`
  };
}
