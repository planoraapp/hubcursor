
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface MarketHistoryItem {
  ClassName: string;
  FurniName: string;
  FurniDescription: string;
  Line: string;
  Category: string;
  Revision: number;
  FurniType: string;
  marketData: {
    history: [number, number, number, number, string][]; // [avgPrice, soldItems, creditSum, openOffers, timestamp]
    averagePrice: number;
    lastUpdated: string;
  };
  hotel_domain: string;
}

interface ProcessedMarketItem {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  previousPrice: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: string;
  volume: number;
  imageUrl: string;
  rarity: string;
  description: string;
  className: string;
  hotel: string;
  priceHistory: number[];
  lastUpdated: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerm = '', category = '', hotel = 'br', days = 30 } = await req.json();
    
    console.log(`🔍 [HabboMarketReal] Searching: "${searchTerm}", Category: "${category}", Hotel: ${hotel}, Days: ${days}`);

    // Build search queries based on available parameters
    const searchQueries: string[] = [];
    
    if (searchTerm) {
      searchQueries.push(`name=${encodeURIComponent(searchTerm)}`);
      searchQueries.push(`classname=*${encodeURIComponent(searchTerm)}*`);
      searchQueries.push(`description=${encodeURIComponent(searchTerm)}`);
    }

    // Popular items to fetch if no search term
    const popularItems = [
      'throne', 'dragon', 'rare', 'hc_', 'club_sofa', 'plant', 'chair', 'table', 'bed', 'lamp'
    ];

    if (!searchTerm) {
      popularItems.forEach(item => {
        searchQueries.push(`classname=${item}*`);
        searchQueries.push(`name=${item}`);
      });
    }

    const allItems: ProcessedMarketItem[] = [];
    const processedClassNames = new Set<string>();

    // Fetch data from multiple queries to get diverse results
    for (const query of searchQueries.slice(0, 5)) { // Limit to 5 queries to avoid rate limiting
      try {
        const url = `https://habboapi.site/api/market/history?${query}&hotel=${hotel}&days=${days}`;
        console.log(`📡 [HabboMarketReal] Fetching: ${url}`);

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'HabboHub-Market/1.0',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
          const data: MarketHistoryItem[] = await response.json();
          
          if (Array.isArray(data) && data.length > 0) {
            console.log(`✅ [HabboMarketReal] Got ${data.length} items from query: ${query}`);
            
            data.forEach(item => {
              // Avoid duplicates
              if (processedClassNames.has(item.ClassName)) return;
              processedClassNames.add(item.ClassName);

              // Filter by category if specified
              if (category && category !== 'all' && item.Category !== category) return;

              const processedItem = processMarketItem(item);
              if (processedItem) {
                allItems.push(processedItem);
              }
            });
          }
        }
      } catch (error) {
        console.log(`❌ [HabboMarketReal] Error with query "${query}":`, error.message);
        continue;
      }

      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Sort by volume and price for better results
    const sortedItems = allItems
      .sort((a, b) => b.volume - a.volume || b.currentPrice - a.currentPrice)
      .slice(0, 50); // Limit results

    console.log(`🎯 [HabboMarketReal] Processed ${sortedItems.length} unique items`);

    // Calculate market statistics
    const stats = calculateMarketStats(sortedItems);

    return new Response(
      JSON.stringify({
        items: sortedItems,
        stats,
        metadata: {
          hotel,
          searchTerm,
          category,
          days,
          totalResults: sortedItems.length,
          fetchedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [HabboMarketReal] Error:', error);
    
    return new Response(
      JSON.stringify({
        items: [],
        stats: getDefaultStats(),
        metadata: {
          error: error.message,
          fallback: true
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function processMarketItem(item: MarketHistoryItem): ProcessedMarketItem | null {
  try {
    const { marketData } = item;
    const currentPrice = marketData.averagePrice || 0;
    
    if (currentPrice <= 0 || !marketData.history || marketData.history.length === 0) {
      return null;
    }

    // Calculate trend from recent history
    const recentHistory = marketData.history.slice(-7); // Last 7 entries
    const oldestPrice = recentHistory[0]?.[0] || currentPrice;
    const change = ((currentPrice - oldestPrice) / oldestPrice) * 100;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (change > 5) trend = 'up';
    else if (change < -5) trend = 'down';

    // Calculate volume from recent sales
    const volume = recentHistory.reduce((sum, entry) => sum + (entry[1] || 0), 0);
    
    // Extract price history for charts
    const priceHistory = marketData.history.map(entry => entry[0]).slice(-30); // Last 30 data points

    return {
      id: item.ClassName,
      name: item.FurniName || item.ClassName,
      category: mapCategory(item.Category),
      currentPrice,
      previousPrice: oldestPrice,
      trend,
      changePercent: change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`,
      volume,
      imageUrl: `https://habboapi.site/api/image/${item.ClassName}`,
      rarity: determineRarity(item.Line, currentPrice),
      description: item.FurniDescription || 'Item do Habbo Hotel',
      className: item.ClassName,
      hotel: item.hotel_domain,
      priceHistory,
      lastUpdated: marketData.lastUpdated
    };
  } catch (error) {
    console.error(`Error processing item ${item.ClassName}:`, error);
    return null;
  }
}

function mapCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'chair': 'cadeiras',
    'table': 'mesas',
    'bed': 'camas',
    'plant': 'plantas',
    'lamp': 'iluminacao',
    'wallpaper': 'parede',
    'floor': 'piso',
    'rare': 'raros',
    'pet': 'pets',
    'clothing': 'roupas'
  };
  
  return categoryMap[category.toLowerCase()] || 'moveis';
}

function determineRarity(line: string, price: number): string {
  if (line?.toLowerCase().includes('rare') || price > 1000) return 'rare';
  if (line?.toLowerCase().includes('ltd') || price > 500) return 'uncommon';
  if (price > 100) return 'common';
  return 'common';
}

function calculateMarketStats(items: ProcessedMarketItem[]) {
  if (items.length === 0) return getDefaultStats();

  return {
    totalItems: items.length,
    averagePrice: Math.floor(items.reduce((sum, item) => sum + item.currentPrice, 0) / items.length),
    totalVolume: items.reduce((sum, item) => sum + item.volume, 0),
    trendingUp: items.filter(item => item.trend === 'up').length,
    trendingDown: items.filter(item => item.trend === 'down').length,
    featuredItems: items.filter(item => item.volume > 10).length,
    highestPrice: Math.max(...items.map(item => item.currentPrice)),
    mostTraded: items.reduce((prev, curr) => prev.volume > curr.volume ? prev : curr).name
  };
}

function getDefaultStats() {
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
