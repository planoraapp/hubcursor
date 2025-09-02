
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface OfficialMarketItem {
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

interface OfficialApiResponse {
  status: string;
  statsDate: string;
  soldItemCount: number;
  creditSum: number;
  averagePrice: number;
  totalOpenOffers: number;
  historyLimitInDays: number;
}

// Cache apenas para dados oficiais validados - TTL reduzido para 10 minutos
const officialCache = new Map<string, { data: OfficialMarketItem[], timestamp: number }>();
const OFFICIAL_CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
const validatedItems = new Set<string>(); // Cache de itens que funcionam na API

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotel = 'br' } = await req.json().catch(() => ({}));
    
    console.log(`🏨 [OfficialMarketplace] Fetching 100% real data for hotel: ${hotel}`);

    // Verificar cache de dados oficiais
    const cacheKey = `official-${hotel}`;
    const cached = officialCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < OFFICIAL_CACHE_DURATION) {
      console.log(`💾 [Cache] Using cached official data for ${hotel} - ${cached.data.length} items`);
      return new Response(
        JSON.stringify({
          items: cached.data,
          stats: calculateOfficialStats(cached.data),
          metadata: {
            hotel,
            fetchedAt: new Date().toISOString(),
            source: 'cache-official',
            totalItems: cached.data.length,
            realDataPercentage: 100,
            lastApiCheck: new Date(cached.timestamp).toISOString()
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Lista expandida e validada de móveis que REALMENTE funcionam na API oficial
    const verifiedWorkingItems = [
      // Móveis HC validados que retornam dados reais
      { className: 'hc_lmp', name: 'Lâmpada HC', category: 'lamp' },
      { className: 'hc_tbl', name: 'Mesa HC', category: 'table' },
      { className: 'hc_chair', name: 'Cadeira HC', category: 'chair' },
      { className: 'hc_sofa', name: 'Sofá HC', category: 'sofa' },
      { className: 'hc_bookshelf', name: 'Estante HC', category: 'furniture' },
      
      // Móveis raros validados 
      { className: 'throne', name: 'Trono Real', category: 'chair' },
      { className: 'rare_dragonlamp', name: 'Lâmpada Dragão Rara', category: 'lamp' },
      { className: 'rare_elephant_statue', name: 'Estátua Elefante Rara', category: 'statue' },
      { className: 'rare_fountain', name: 'Fonte Rara', category: 'decoration' },
      
      // Móveis básicos que sempre existem
      { className: 'chair_norja', name: 'Cadeira Norja', category: 'chair' },
      { className: 'table_norja_med', name: 'Mesa Norja', category: 'table' },
      { className: 'sofa_norja', name: 'Sofá Norja', category: 'sofa' },
      { className: 'bed_armas_two', name: 'Cama Armas', category: 'bed' },
      { className: 'plant_big_cactus', name: 'Cacto Grande', category: 'plant' },
      { className: 'carpet_standard', name: 'Tapete Padrão', category: 'floor' },
      
      // Móveis especiais validados
      { className: 'frank', name: 'Frank Frisante', category: 'rare' },
      { className: 'dragon_lamp', name: 'Lâmpada Dragão', category: 'lamp' },
      { className: 'teleport', name: 'Teleporte', category: 'special' }
    ];

    const officialItems: OfficialMarketItem[] = [];
    let successCount = 0;
    let totalAttempts = 0;
    const failedItems: string[] = [];

    console.log(`📊 [Validation] Testing ${verifiedWorkingItems.length} verified items...`);

    // Buscar apenas dados oficiais REAIS
    for (const item of verifiedWorkingItems) {
      try {
        totalAttempts++;
        await new Promise(resolve => setTimeout(resolve, 150)); // Rate limiting respeitoso
        
        const officialData = await fetchOfficialItemData(item.className, hotel);
        if (officialData && officialData.status === 'OK') {
          // Aceitar apenas dados com preço válido da API oficial
          if (typeof officialData.averagePrice === 'number' && officialData.averagePrice >= 0) {
            const marketItem = mapOfficialToMarketItem(item, officialData, hotel);
            if (marketItem) {
              officialItems.push(marketItem);
              successCount++;
              validatedItems.add(item.className);
              console.log(`✅ [Official] ${item.className}: price=${officialData.averagePrice}, sold=${officialData.soldItemCount}, offers=${officialData.totalOpenOffers}`);
            }
          } else {
            console.log(`⚠️ [Official] ${item.className}: Invalid price data from API`);
            failedItems.push(item.className);
          }
        } else {
          failedItems.push(item.className);
          console.log(`❌ [Official] ${item.className}: No valid data from API`);
        }
      } catch (error) {
        failedItems.push(item.className);
        console.log(`❌ [Official] ${item.className}: Error - ${error.message}`);
        continue;
      }
    }

    const successRate = Math.round((successCount / totalAttempts) * 100);
    console.log(`📊 [Official] Final results: ${successCount}/${totalAttempts} (${successRate}%) - 100% REAL DATA`);
    
    if (failedItems.length > 0) {
      console.log(`🔍 [Failed Items] ${failedItems.join(', ')}`);
    }

    // Cache apenas se temos dados oficiais válidos
    if (officialItems.length > 0) {
      officialCache.set(cacheKey, { data: officialItems, timestamp: Date.now() });
    }

    const stats = calculateOfficialStats(officialItems);

    console.log(`🎯 [OfficialMarketplace] Returning ${officialItems.length} items - 100% OFFICIAL DATA`);

    return new Response(
      JSON.stringify({
        items: officialItems,
        stats,
        metadata: {
          hotel,
          fetchedAt: new Date().toISOString(),
          source: 'official-api-only',
          totalItems: officialItems.length,
          realDataPercentage: 100,
          apiSuccessRate: successRate,
          testedItems: totalAttempts,
          workingItems: successCount,
          failedItems: failedItems.length,
          validatedClassNames: Array.from(validatedItems)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [OfficialMarketplace] Fatal error:', error);
    
    // Em caso de erro, retornar resposta vazia mas transparente
    return new Response(
      JSON.stringify({
        items: [],
        stats: calculateOfficialStats([]),
        error: `API Error: ${error.message}`,
        metadata: {
          hotel: 'br',
          fetchedAt: new Date().toISOString(),
          source: 'error-no-fallback',
          realDataPercentage: 0,
          message: 'Official API unavailable - no fallback data provided'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Buscar dados oficiais com validação rigorosa
async function fetchOfficialItemData(className: string, hotel: string): Promise<OfficialApiResponse | null> {
  const hotelDomains = {
    'br': 'habbo.com.br',
    'com': 'habbo.com',
    'es': 'habbo.es',
    'de': 'habbo.de',
    'fr': 'habbo.fr',
    'it': 'habbo.it',
    'nl': 'habbo.nl',
    'fi': 'habbo.fi',
    'tr': 'habbo.com.tr'
  };

  const domain = hotelDomains[hotel as keyof typeof hotelDomains] || 'habbo.com.br';
  const url = `https://www.${domain}/api/public/marketplace/stats/roomItem/${className}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HabboHub-Official/3.0',
      },
      signal: AbortSignal.timeout(8000) // Timeout mais generoso
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Validação rigorosa dos dados oficiais
    if (data && 
        data.status === 'OK' && 
        typeof data.averagePrice === 'number' && 
        typeof data.soldItemCount === 'number' &&
        typeof data.totalOpenOffers === 'number') {
      return data;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Mapear dados oficiais sem simulações
function mapOfficialToMarketItem(
  item: { className: string; name: string; category: string },
  officialData: OfficialApiResponse,
  hotel: string
): OfficialMarketItem | null {
  try {
    const currentPrice = officialData.averagePrice || 0;
    
    // Não simular previousPrice - usar apenas se tivermos dados históricos reais
    const previousPrice = undefined; // Será calculado quando implementarmos histórico real
    
    return {
      id: `official_${item.className}_${hotel}`,
      name: item.name,
      className: item.className,
      category: item.category,
      currentPrice,
      previousPrice,
      trend: 'stable', // Será calculado com dados históricos reais
      changePercent: '0.0', // Será calculado com dados históricos reais
      volume: officialData.soldItemCount,
      imageUrl: generateOfficialImageUrl(item.className),
      rarity: determineRarityFromOfficialData(currentPrice, item.name, item.className),
      description: `${item.name} - Dados Oficiais ${hotel.toUpperCase()}`,
      hotel,
      priceHistory: [], // Será preenchido com histórico real quando disponível
      lastUpdated: officialData.statsDate || new Date().toISOString(),
      soldItems: officialData.soldItemCount,
      openOffers: officialData.totalOpenOffers,
      isOfficialData: true // Marcador de transparência
    };
  } catch (error) {
    console.error(`Error mapping official item ${item.className}:`, error);
    return null;
  }
}

// URLs de imagem priorizando fontes oficiais
function generateOfficialImageUrl(className: string): string {
  const specificMappings: Record<string, string> = {
    'frank': 'https://images.habbo.com/c_images/catalogue/rare_frank.png',
    'throne': 'https://images.habbo.com/c_images/catalogue/throne.png',
    'dragon_lamp': 'https://images.habbo.com/c_images/catalogue/dragon_lamp.png',
  };

  if (specificMappings[className]) {
    return specificMappings[className];
  }

  // Priorizar fonte oficial primária
  return `https://images.habbo.com/c_images/catalogue/${className}.png`;
}

// Determinar raridade baseada em dados oficiais
function determineRarityFromOfficialData(price: number, name: string, className: string): string {
  const lowerName = name.toLowerCase();
  const lowerClassName = className.toLowerCase();
  
  if (lowerName.includes('throne') || lowerClassName.includes('rare') || price > 1000) {
    return 'legendary';
  }
  if (lowerName.includes('hc') || lowerClassName.includes('hc') || price > 100) {
    return 'rare';
  }
  if (price > 20) {
    return 'uncommon';
  }
  return 'common';
}

// Calcular estatísticas apenas de dados oficiais
function calculateOfficialStats(items: OfficialMarketItem[]) {
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
      realDataPercentage: 0,
      officialItemsCount: 0
    };
  }
  
  const officialItems = items.filter(item => item.isOfficialData);
  const totalVolume = officialItems.reduce((sum, item) => sum + item.soldItems, 0);
  const trendingUp = officialItems.filter(item => item.trend === 'up').length;
  const trendingDown = officialItems.filter(item => item.trend === 'down').length;
  const mostTradedItem = officialItems.sort((a, b) => b.soldItems - a.soldItems)[0];
  
  return {
    totalItems: items.length,
    averagePrice: Math.floor(officialItems.reduce((sum, item) => sum + item.currentPrice, 0) / officialItems.length),
    totalVolume,
    trendingUp,
    trendingDown,
    featuredItems: officialItems.length,
    highestPrice: Math.max(...officialItems.map(item => item.currentPrice)),
    mostTraded: mostTradedItem?.name || 'N/A',
    realDataPercentage: 100,
    officialItemsCount: officialItems.length
  };
}
