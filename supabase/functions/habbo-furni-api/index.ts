
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
  className: string;
  colors: string[];
  club: 'HC' | 'FREE';
  source: 'habbofurni';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerm = '', className = '', limit = 200, category = 'all' } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [HabboFurni] Fetching furniture data - searchTerm: "${searchTerm}", className: "${className}", limit: ${limit}`);
    
    const apiKey = Deno.env.get('HABBOHUB_FURNIAPI');
    if (!apiKey) {
      console.error('❌ [HabboFurni] HABBOHUB_FURNIAPI not configured');
      throw new Error('HABBOHUB_FURNIAPI not configured');
    }

    // HabboFurni.com API endpoints
    const endpoints = [
      `https://api.habbofurni.com/v1/furniture?limit=${limit}`,
      `https://habbofurni.com/api/v1/furniture?limit=${limit}`,
      `https://habbofurni.com/api/furniture?limit=${limit}`
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
          signal: AbortSignal.timeout(10000)
        });

        console.log(`📊 [HabboFurni] Response status: ${response.status}`);

        if (!response.ok) {
          console.log(`❌ [HabboFurni] Failed ${endpoint}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`📊 [HabboFurni] Response keys:`, Object.keys(data));

        // Process different response formats
        let rawItems = data.furniture || data.items || data.data || data || [];
        
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          console.log(`✅ [HabboFurni] Found ${rawItems.length} items`);
          
          furniData = rawItems.map((item: any, index: number) => ({
            id: item.id || item.furni_id || `hf_${index}`,
            name: item.name || item.public_name || item.furni_name || `Furniture ${index}`,
            category: item.category || item.furni_type || 'furniture',
            description: item.description || item.furni_line || 'Habbo furniture item',
            imageUrl: generateFurniImageUrl(item),
            rarity: determineFurniRarity(item),
            type: item.type || 'furniture',
            className: item.class_name || item.swf_name || item.className || `furni_${item.id}`,
            colors: extractColors(item),
            club: item.hc_required || item.club ? 'HC' : 'FREE',
            source: 'habbofurni'
          }));

          // Filter by searchTerm if provided
          if (searchTerm) {
            furniData = furniData.filter(item => 
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.className.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          // Filter by className if provided
          if (className) {
            furniData = furniData.filter(item => 
              item.className.toLowerCase().includes(className.toLowerCase())
            );
          }

          metadata = {
            source: endpoint,
            total: furniData.length,
            searchTerm,
            className
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
      furniData = generateHabboFurniFallback(searchTerm, className);
      metadata = { source: 'fallback', searchTerm, className };
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
        furnis: [],
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

function generateFurniImageUrl(item: any): string {
  const className = item.class_name || item.swf_name || item.className || item.id;
  
  // Priority order for image URLs
  if (item.icon_url) return item.icon_url;
  if (item.image_url) return item.image_url;
  if (item.preview_image) return item.preview_image;
  
  // HabboFurni URLs
  return `https://habbofurni.com/furniture_images/${className}.png`;
}

function determineFurniRarity(item: any): string {
  const name = item.name?.toLowerCase() || '';
  const className = item.class_name?.toLowerCase() || item.swf_name?.toLowerCase() || '';
  
  if (name.includes('ltd') || className.includes('ltd')) return 'ltd';
  if (item.rare || item.rarity === 'rare') return 'rare';
  if (item.hc_required || item.club || name.includes('hc') || className.includes('hc')) return 'hc';
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

function generateHabboFurniFallback(searchTerm?: string, className?: string): HabboFurniItem[] {
  // Simple fallback items
  const fallbackItems: HabboFurniItem[] = [
    {
      id: 'hf_chair_1',
      name: 'Chair Basic',
      category: 'seating',
      description: 'Basic chair furniture',
      imageUrl: 'https://habbofurni.com/furniture_images/chair.png',
      rarity: 'common',
      type: 'furniture',
      className: 'chair_basic',
      colors: ['1', '2', '3'],
      club: 'FREE',
      source: 'habbofurni'
    }
  ];
  
  return fallbackItems;
}
