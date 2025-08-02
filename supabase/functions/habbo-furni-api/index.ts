
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface HabboFurniItem {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  rarity: string;
  type: string;
  swfName: string;
  colors: string[];
  club: 'HC' | 'FREE';
  source: 'habbofurni';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 200, category = 'all', page = 1 } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [HabboFurni] Fetching furniture data - limit: ${limit}, category: ${category}, page: ${page}`);
    
    const apiKey = Deno.env.get('HABBO_FURNI_API_KEY');
    if (!apiKey) {
      throw new Error('HABBO_FURNI_API_KEY not configured');
    }

    // HabboFurni.com API endpoints
    const endpoints = [
      `https://api.habbofurni.com/furniture?limit=${limit}&page=${page}`,
      `https://api.habbofurni.com/items?limit=${limit}&page=${page}`,
      `https://habbofurni.com/api/furniture?limit=${limit}&page=${page}`
    ];

    let furniData: HabboFurniItem[] = [];
    let metadata = {};

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 [HabboFurni] Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-API-Key': apiKey,
            'User-Agent': 'HabboHub-Console/2.0',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
          console.log(`❌ [HabboFurni] Failed ${endpoint}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`📊 [HabboFurni] Response structure:`, {
          hasFurniture: !!data.furniture,
          hasItems: !!data.items,
          hasData: !!data.data,
          dataLength: data.furniture?.length || data.items?.length || data.data?.length || 0
        });

        // Process different response formats
        let rawItems = data.furniture || data.items || data.data || [];
        
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          furniData = rawItems.map((item: any, index: number) => ({
            id: item.id || `hf_${index}`,
            name: item.name || item.public_name || `Furniture ${index}`,
            category: mapCategoryToStandard(item.category || item.type || 'furniture'),
            description: item.description || item.furni_line || 'Habbo furniture item',
            imageUrl: generateFurniImageUrl(item),
            rarity: determineFurniRarity(item),
            type: item.type || 'furniture',
            swfName: item.class_name || item.swf_name || `furni_${item.id}`,
            colors: extractColors(item),
            club: item.hc_required || item.club ? 'HC' : 'FREE',
            source: 'habbofurni'
          }));

          metadata = {
            source: endpoint,
            page,
            limit,
            total: data.total || furniData.length,
            hasMore: data.hasMore || (data.total ? page * limit < data.total : false)
          };

          console.log(`✅ [HabboFurni] Success with ${furniData.length} items from ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`❌ [HabboFurni] Error with ${endpoint}:`, error.message);
        continue;
      }
    }

    // Fallback data if API fails
    if (furniData.length === 0) {
      console.log('🔄 [HabboFurni] All endpoints failed, generating fallback data');
      furniData = generateHabboFurniFallback();
      metadata = { source: 'fallback', page, limit };
    }

    const result = {
      furnis: furniData,
      metadata: {
        ...metadata,
        fetchedAt: new Date().toISOString(),
        count: furniData.length
      }
    };

    console.log(`🎯 [HabboFurni] Returning ${furniData.length} furniture items`);
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [HabboFurni] Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        furnis: generateHabboFurniFallback(),
        metadata: {
          source: 'error-fallback',
          fetchedAt: new Date().toISOString(),
          error: error.message
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function mapCategoryToStandard(category: string): string {
  const mapping: Record<string, string> = {
    'seating': 'cadeiras',
    'tables': 'mesas',
    'beds': 'camas',
    'storage': 'armazenamento',
    'lighting': 'iluminacao',
    'wall_items': 'parede',
    'floor_items': 'piso',
    'plants': 'plantas',
    'electronics': 'eletronicos',
    'decorations': 'diversos'
  };
  
  return mapping[category.toLowerCase()] || 'diversos';
}

function generateFurniImageUrl(item: any): string {
  // Generate multiple possible image URLs
  const id = item.id || item.sprite_id || '1';
  
  if (item.icon_url) return item.icon_url;
  if (item.image_url) return item.image_url;
  if (item.preview_image) return item.preview_image;
  
  // Try common Habbo imaging patterns
  return `https://images.habbo.com/dcr/hof_furni/${id}/${id}.png`;
}

function determineFurniRarity(item: any): string {
  if (item.rare || item.rarity === 'rare') return 'rare';
  if (item.ltd || item.limited) return 'ltd';
  if (item.hc_required || item.club) return 'hc';
  if (item.credits_cost > 1000) return 'expensive';
  return 'common';
}

function extractColors(item: any): string[] {
  if (item.colors && Array.isArray(item.colors)) {
    return item.colors.map(String);
  }
  if (item.color_variations) {
    return item.color_variations.map((c: any) => c.id || c.color || String(c));
  }
  return ['1', '2', '3', '4'];
}

function generateHabboFurniFallback(): HabboFurniItem[] {
  const categories = [
    { name: 'cadeiras', count: 150 },
    { name: 'mesas', count: 100 },
    { name: 'camas', count: 80 },
    { name: 'sofas', count: 60 },
    { name: 'plantas', count: 40 },
    { name: 'iluminacao', count: 70 },
    { name: 'parede', count: 200 },
    { name: 'piso', count: 50 },
    { name: 'armazenamento', count: 90 },
    { name: 'eletronicos', count: 110 },
    { name: 'diversos', count: 300 }
  ];

  const fallbackItems: HabboFurniItem[] = [];
  
  categories.forEach(category => {
    for (let i = 1; i <= category.count; i++) {
      const isRare = i % 20 === 0;
      const isHC = i % 8 === 0;
      
      fallbackItems.push({
        id: `hf_${category.name}_${i}`,
        name: `${category.name.charAt(0).toUpperCase() + category.name.slice(1)} ${i}${isRare ? ' (Raro)' : ''}${isHC ? ' (HC)' : ''}`,
        category: category.name,
        description: `Item de ${category.name} do catálogo Habbo`,
        imageUrl: `https://images.habbo.com/dcr/hof_furni/${i}/${i}.png`,
        rarity: isRare ? 'rare' : isHC ? 'hc' : 'common',
        type: 'furniture',
        swfName: `${category.name}_${i}`,
        colors: ['1', '2', '3', '4'],
        club: isHC ? 'HC' : 'FREE',
        source: 'habbofurni'
      });
    }
  });
  
  console.log(`🔄 [Fallback] Generated ${fallbackItems.length} HabboFurni fallback items`);
  return fallbackItems;
}
