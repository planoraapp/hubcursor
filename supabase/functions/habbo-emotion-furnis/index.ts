
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface FurniItem {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  rarity: string;
  type: string;
  swfName: string;
  figureId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { page = 1, limit = 50, category = 'all' } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [Enhanced Furnis] Fetching page ${page}, limit ${limit}, category: ${category}`);

    // Try multiple reliable sources for furniture
    const endpoints = [
      'https://www.habbowidgets.com/api/furni/all',
      'https://habbowidgets.com/api/furni/all',
      'https://api.habboemotion.com/public/furnis/new/300',
      'https://habboemotion.com/api/furnis/new/300'
    ];

    let furnisData: any[] = [];
    let successfulEndpoint = '';

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 [Enhanced Furnis] Trying: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'HabboHub-Enhanced/2.0',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
          console.log(`❌ Failed ${endpoint}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        
        // Handle different API response formats
        if (data && Array.isArray(data)) {
          furnisData = data;
          successfulEndpoint = endpoint;
          console.log(`✅ Success with ${furnisData.length} furnis from ${endpoint}`);
          break;
        } else if (data && data.data && Array.isArray(data.data.furnis)) {
          furnisData = data.data.furnis;
          successfulEndpoint = endpoint;
          console.log(`✅ Success with ${furnisData.length} furnis from ${endpoint}`);
          break;
        } else if (data && data.furnis && Array.isArray(data.furnis)) {
          furnisData = data.furnis;
          successfulEndpoint = endpoint;
          console.log(`✅ Success with ${furnisData.length} furnis from ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Error with ${endpoint}:`, error.message);
        continue;
      }
    }

    // Enhanced fallback with real furniture data
    if (furnisData.length === 0) {
      console.log('🔄 Generating enhanced furnis fallback data');
      furnisData = generateEnhancedFurnisFallback();
    }

    // Process and categorize furnis with optimized image URLs
    const processedFurnis = furnisData.map((item: any, index: number) => {
      const furniName = item.name || item.public_name || item.furni_name || `Móvel ${index + 1}`;
      const swfName = item.classname || item.swf_name || item.class_name || `furni_${index}`;
      
      return {
        id: `furni_${item.id || index}`,
        name: furniName,
        category: categorizeFurni(furniName),
        description: item.description || `${furniName} - Móvel exclusivo do Habbo Hotel`,
        imageUrl: generateOptimizedFurniUrl(swfName, item.image_url),
        rarity: item.rarity || determineFurniRarity(furniName),
        type: item.type || 'floor',
        swfName: swfName,
        figureId: item.id?.toString() || (index + 1).toString()
      };
    });

    // Filter by category if specified
    const filteredFurnis = category === 'all' 
      ? processedFurnis 
      : processedFurnis.filter((item: FurniItem) => item.category === category);

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFurnis = filteredFurnis.slice(startIndex, endIndex);

    console.log(`🎯 Returning ${paginatedFurnis.length} enhanced furnis for page ${page}`);

    return new Response(
      JSON.stringify({
        furnis: paginatedFurnis,
        metadata: {
          source: successfulEndpoint || 'enhanced-fallback',
          page,
          limit,
          total: filteredFurnis.length,
          hasMore: endIndex < filteredFurnis.length,
          categories: [...new Set(processedFurnis.map((f: FurniItem) => f.category))]
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [Enhanced Furnis] Error:', error);
    
    return new Response(
      JSON.stringify({
        furnis: generateEnhancedFurnisFallback().slice(0, 20),
        metadata: {
          source: 'error-fallback',
          error: error.message
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateOptimizedFurniUrl(swfName: string, originalUrl?: string): string {
  if (originalUrl && originalUrl.includes('http')) {
    return originalUrl;
  }
  
  // Multiple URL patterns for maximum success rate
  const patterns = [
    `https://www.habbowidgets.com/images/furni/${swfName}.gif`,
    `https://habbowidgets.com/images/furni/${swfName}.gif`,
    `https://images.habbo.com/dcr/hof_furni/${swfName}.png`,
    `https://www.habbo.com.br/habbo-imaging/furni/${swfName}.png`,
    `https://habboemotion.com/images/furnis/${swfName}.png`,
    `https://cdn.habboemotion.com/furnis/${swfName}.gif`
  ];
  
  return patterns[0]; // Primary URL
}

function categorizeFurni(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('chair') || lowerName.includes('cadeira') || lowerName.includes('seat') || lowerName.includes('stool')) return 'cadeiras';
  if (lowerName.includes('table') || lowerName.includes('mesa') || lowerName.includes('desk')) return 'mesas';
  if (lowerName.includes('bed') || lowerName.includes('cama') || lowerName.includes('mattress')) return 'camas';
  if (lowerName.includes('sofa') || lowerName.includes('couch') || lowerName.includes('armchair')) return 'sofas';
  if (lowerName.includes('plant') || lowerName.includes('planta') || lowerName.includes('flower') || lowerName.includes('tree')) return 'plantas';
  if (lowerName.includes('light') || lowerName.includes('lamp') || lowerName.includes('luz') || lowerName.includes('candle')) return 'iluminacao';
  if (lowerName.includes('wall') || lowerName.includes('parede') || lowerName.includes('poster')) return 'parede';
  if (lowerName.includes('floor') || lowerName.includes('piso') || lowerName.includes('carpet') || lowerName.includes('rug')) return 'piso';
  if (lowerName.includes('shelf') || lowerName.includes('estante') || lowerName.includes('cabinet')) return 'armazenamento';
  if (lowerName.includes('tv') || lowerName.includes('radio') || lowerName.includes('stereo') || lowerName.includes('música')) return 'eletronicos';
  
  return 'diversos';
}

function determineFurniRarity(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('throne') || lowerName.includes('trono') || lowerName.includes('golden') || lowerName.includes('diamond')) return 'legendary';
  if (lowerName.includes('rare') || lowerName.includes('ltd') || lowerName.includes('limited') || lowerName.includes('special')) return 'rare';
  if (lowerName.includes('hc') || lowerName.includes('club') || lowerName.includes('premium')) return 'uncommon';
  
  return 'common';
}

function generateEnhancedFurnisFallback(): FurniItem[] {
  const categories = [
    { name: 'cadeiras', items: ['chair_norja', 'chair_plasto', 'chair_basic', 'throne_a', 'chair_office'] },
    { name: 'mesas', items: ['table_norja', 'table_plasto', 'table_basic', 'desk_wood', 'table_dining'] },
    { name: 'camas', items: ['bed_basic', 'bed_double', 'bed_armas', 'bed_pink', 'bed_tent'] },
    { name: 'sofas', items: ['sofa_norja', 'sofa_plasto', 'sofa_basic', 'armchair_red', 'bench_wood'] },
    { name: 'plantas', items: ['plant_small', 'plant_big', 'tree_palm', 'flower_red', 'cactus'] },
    { name: 'iluminacao', items: ['lamp_basic', 'candle', 'torch', 'spotlight', 'chandelier'] },
    { name: 'diversos', items: ['tv_basic', 'radio', 'mirror', 'clock', 'trophy'] }
  ];

  const fallbackItems: FurniItem[] = [];
  
  categories.forEach(category => {
    category.items.forEach((item, index) => {
      fallbackItems.push({
        id: `enhanced_${category.name}_${index}`,
        name: `${item.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        category: category.name,
        description: `${item.replace('_', ' ')} - Móvel exclusivo do Habbo Hotel`,
        imageUrl: generateOptimizedFurniUrl(item),
        rarity: determineFurniRarity(item),
        type: 'floor',
        swfName: item,
        figureId: (index + 1).toString()
      });
    });
  });
  
  return fallbackItems;
}
