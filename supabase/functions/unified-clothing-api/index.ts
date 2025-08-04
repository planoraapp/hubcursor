import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HabboEmotionAPIClothing {
  id: number;
  code: string;
  part: string;
  gender: 'M' | 'F' | 'U';
  date: string;
}

interface CachedClothingItem {
  item_id: number;
  code: string;
  part: string;
  gender: string;
  colors: string[];
  image_url: string;
  club: string;
  source: string;
  is_active: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { limit = 1000, category, gender, forceRefresh = false } = await req.json().catch(() => ({}));

    console.log(`🎯 [UnifiedClothingAPI] Request - limit: ${limit}, category: ${category}, gender: ${gender}, forceRefresh: ${forceRefresh}`);

    // Check cache first (unless forced refresh)
    if (!forceRefresh) {
      const { data: cachedData, error: cacheError } = await supabase
        .from('habbo_clothing_cache')
        .select('*')
        .eq('is_active', true)
        .limit(limit);

      if (!cacheError && cachedData && cachedData.length > 0) {
        console.log(`✅ [UnifiedClothingAPI] Serving ${cachedData.length} items from cache`);
        return new Response(
          JSON.stringify({
            success: true,
            data: cachedData,
            source: 'cache',
            count: cachedData.length,
            cached_at: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch from HabboEmotion API
    console.log(`🌐 [UnifiedClothingAPI] Fetching from HabboEmotion API`);
    const apiUrl = `https://api.habboemotion.com/public/clothings/new/${limit}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HabboEmotion API failed: ${response.status}`);
    }

    const apiData = await response.json();
    console.log(`📡 [UnifiedClothingAPI] API Response structure:`, {
      hasResult: !!apiData.result,
      hasData: !!apiData.data,
      clothingsLength: apiData.data?.clothings?.length
    });

    if (!apiData?.data?.clothings || !Array.isArray(apiData.data.clothings)) {
      throw new Error('Invalid API response format');
    }

    const clothings = apiData.data.clothings as HabboEmotionAPIClothing[];
    console.log(`🎨 [UnifiedClothingAPI] Processing ${clothings.length} items from API`);

    // Process and cache items
    const processedItems: CachedClothingItem[] = clothings.map((item, index) => {
      const imageUrl = generateImageUrl(item.code, item.part, item.id);
      
      return {
        item_id: item.id || (1000 + index),
        code: item.code || `item_${item.id || index}`,
        part: item.part || 'ch',
        gender: item.gender || 'U',
        colors: generateRealisticColors(item.part || 'ch', item.code || ''),
        image_url: imageUrl,
        club: determineClub(item.code || ''),
        source: 'habboemotion-api',
        is_active: true
      };
    });

    // Clear old cache and insert new data
    console.log(`💾 [UnifiedClothingAPI] Caching ${processedItems.length} items`);
    
    // Delete old entries
    await supabase.from('habbo_clothing_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new data in batches
    const batchSize = 100;
    for (let i = 0; i < processedItems.length; i += batchSize) {
      const batch = processedItems.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('habbo_clothing_cache')
        .insert(batch);

      if (insertError) {
        console.error(`❌ [UnifiedClothingAPI] Batch insert error:`, insertError);
      }
    }

    console.log(`✅ [UnifiedClothingAPI] Successfully cached and serving ${processedItems.length} items`);

    return new Response(
      JSON.stringify({
        success: true,
        data: processedItems,
        source: 'api-fresh',
        count: processedItems.length,
        cached_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [UnifiedClothingAPI] Error:', error);
    
    // Fallback to any existing cache
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: fallbackData } = await supabase
        .from('habbo_clothing_cache')
        .select('*')
        .eq('is_active', true)
        .limit(500);

      if (fallbackData && fallbackData.length > 0) {
        console.log(`🔄 [UnifiedClothingAPI] Serving ${fallbackData.length} items from fallback cache`);
        return new Response(
          JSON.stringify({
            success: true,
            data: fallbackData,
            source: 'cache-fallback',
            count: fallbackData.length,
            error: error.message
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (fallbackError) {
      console.error('❌ [UnifiedClothingAPI] Fallback failed:', fallbackError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        data: [],
        source: 'error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateImageUrl(code: string, part: string, id: number): string {
  // Primary: Official Habbo Imaging for individual items
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${part}-${id}-1&direction=2&head_direction=2&size=s`;
}

function generateRealisticColors(part: string, code: string): string[] {
  const baseColors = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  
  // Add special colors for certain items
  if (code.toLowerCase().includes('hc') || code.toLowerCase().includes('club')) {
    baseColors.push('11', '12', '13', '14', '15');
  }
  
  return baseColors.slice(0, 8); // Limit to 8 colors
}

function determineClub(code: string): string {
  if (!code) return 'FREE';
  const lowerCode = code.toLowerCase();
  return (lowerCode.includes('hc') || lowerCode.includes('club')) ? 'HC' : 'FREE';
}