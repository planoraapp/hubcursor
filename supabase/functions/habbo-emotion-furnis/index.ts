
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { page = 1, limit = 50, category = 'all' } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [HabboEmotion Furnis] Fetching page ${page}, limit ${limit}, category: ${category}`);

    const endpoints = [
      'https://api.habboemotion.com/public/furnis/new/200',
      'https://habboemotion.com/api/furnis/new/200'
    ];

    let furnisData: any[] = [];
    let successfulEndpoint = '';

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 [HabboEmotion Furnis] Trying: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'HabboHub-Console/1.0',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
          console.log(`❌ Failed ${endpoint}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        
        if (data && data.data && data.data.furnis && Array.isArray(data.data.furnis)) {
          furnisData = data.data.furnis;
          successfulEndpoint = endpoint;
          console.log(`✅ Success with ${furnisData.length} items from ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Error with ${endpoint}:`, error.message);
        continue;
      }
    }

    // If no data, generate fallback
    if (furnisData.length === 0) {
      console.log('🔄 Generating furnis fallback data');
      furnisData = generateFurnisFallbackData();
    }

    // Process and categorize furnis
    const processedFurnis = furnisData.map((item: any, index: number) => ({
      id: `furni_${item.id || index}`,
      name: item.name || item.public_name || `Móvel ${index + 1}`,
      category: categorizeFurni(item.name || item.public_name || ''),
      description: item.description || `Descrição do ${item.name || 'móvel'}`,
      imageUrl: item.image_url || `https://habboemotion.com/images/furnis/${item.classname || 'default'}.png`,
      rarity: item.rarity || 'common',
      type: item.type || 'floor',
      swfName: item.classname || item.swf_name || ''
    }));

    // Filter by category if specified
    const filteredFurnis = category === 'all' 
      ? processedFurnis 
      : processedFurnis.filter((item: FurniItem) => item.category === category);

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFurnis = filteredFurnis.slice(startIndex, endIndex);

    console.log(`🎯 Returning ${paginatedFurnis.length} furnis for page ${page}`);

    return new Response(
      JSON.stringify({
        furnis: paginatedFurnis,
        metadata: {
          source: successfulEndpoint || 'fallback',
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
    console.error('❌ [HabboEmotion Furnis] Error:', error);
    
    return new Response(
      JSON.stringify({
        furnis: generateFurnisFallbackData().slice(0, 20),
        metadata: {
          source: 'error-fallback',
          error: error.message
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function categorizeFurni(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('chair') || lowerName.includes('cadeira') || lowerName.includes('seat')) return 'cadeiras';
  if (lowerName.includes('table') || lowerName.includes('mesa')) return 'mesas';
  if (lowerName.includes('bed') || lowerName.includes('cama')) return 'camas';
  if (lowerName.includes('sofa') || lowerName.includes('couch')) return 'sofas';
  if (lowerName.includes('plant') || lowerName.includes('planta') || lowerName.includes('flower')) return 'plantas';
  if (lowerName.includes('light') || lowerName.includes('lamp') || lowerName.includes('luz')) return 'iluminacao';
  if (lowerName.includes('wall') || lowerName.includes('parede')) return 'parede';
  if (lowerName.includes('floor') || lowerName.includes('piso')) return 'piso';
  
  return 'diversos';
}

function generateFurnisFallbackData(): FurniItem[] {
  const categories = ['cadeiras', 'mesas', 'camas', 'sofas', 'plantas', 'iluminacao', 'diversos'];
  const fallbackItems: FurniItem[] = [];
  
  categories.forEach(category => {
    for (let i = 1; i <= 15; i++) {
      fallbackItems.push({
        id: `fallback_${category}_${i}`,
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} ${i}`,
        category,
        description: `Descrição do móvel ${category} ${i}`,
        imageUrl: `https://habboemotion.com/images/furnis/default_${category}_${i}.png`,
        rarity: i % 4 === 0 ? 'rare' : 'common',
        type: 'floor',
        swfName: `${category}_${i}`
      });
    }
  });
  
  return fallbackItems;
}
