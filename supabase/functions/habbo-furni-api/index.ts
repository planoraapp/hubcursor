
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
    console.log(`🔑 [HabboFurni] API Key configured: ${apiKey ? 'YES' : 'NO'}`);
    
    if (!apiKey) {
      console.error('❌ [HabboFurni] HABBOHUB_FURNIAPI not configured in secrets');
      return generateFallbackResponse(searchTerm, className, limit);
    }

    // Endpoints otimizados com timeout reduzido
    const endpoints = [
      `https://habbofurni.com/api/v1/furniture?limit=${limit}`,
      `https://api.habbofurni.com/v1/furniture?limit=${limit}`,
      `https://habbofurni.com/api/furniture?limit=${limit}`
    ];

    let furniData: HabboFurniItem[] = [];
    let metadata = {};
    let successEndpoint = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 [HabboFurni] Trying endpoint: ${endpoint}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduzido para 3s
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-API-Key': apiKey,
            'User-Agent': 'HabboHub-Console/2.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log(`📊 [HabboFurni] Response status: ${response.status} for ${endpoint}`);

        if (!response.ok) {
          console.log(`❌ [HabboFurni] Failed ${endpoint}: ${response.status} - ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        console.log(`📊 [HabboFurni] Response structure:`, {
          keys: Object.keys(data),
          hasData: !!data.data,
          hasFurniture: !!data.furniture,
          hasItems: !!data.items,
          dataLength: Array.isArray(data.data) ? data.data.length : 0,
          furnitureLength: Array.isArray(data.furniture) ? data.furniture.length : 0
        });

        // Processar diferentes formatos de resposta
        let rawItems = data.furniture || data.data || data.items || data || [];
        
        if (!Array.isArray(rawItems) && typeof rawItems === 'object') {
          rawItems = Object.values(rawItems);
        }
        
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          console.log(`✅ [HabboFurni] Found ${rawItems.length} items from ${endpoint}`);
          
          furniData = rawItems.map((item: any, index: number) => ({
            id: item.id || item.furni_id || item.className || `hf_${index}`,
            name: item.name || item.public_name || item.furni_name || item.className || `Furniture ${index}`,
            category: item.category || item.furni_type || item.type || 'furniture',
            description: item.description || item.furni_line || item.name || 'Habbo furniture item',
            imageUrl: generateOptimizedImageUrl(item),
            rarity: determineFurniRarity(item),
            type: item.type || item.furni_type || 'roomitem',
            className: item.class_name || item.swf_name || item.className || item.name || `furni_${item.id}`,
            colors: extractColors(item),
            club: item.hc_required || item.club || item.name?.toLowerCase().includes('hc') ? 'HC' : 'FREE',
            source: 'habbofurni'
          }));

          // Aplicar filtros
          if (searchTerm) {
            furniData = furniData.filter(item => 
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          if (className) {
            furniData = furniData.filter(item => 
              item.className.toLowerCase().includes(className.toLowerCase())
            );
          }

          successEndpoint = endpoint;
          metadata = {
            source: endpoint,
            total: furniData.length,
            searchTerm,
            className,
            apiStatus: 'success'
          };

          console.log(`✅ [HabboFurni] Success with ${furniData.length} filtered items from ${endpoint}`);
          break;
        } else {
          console.log(`⚠️ [HabboFurni] No items found in response from ${endpoint}`);
        }
      } catch (error) {
        console.log(`❌ [HabboFurni] Error with ${endpoint}:`, error.message);
        if (error.name === 'AbortError') {
          console.log(`⏱️ [HabboFurni] Timeout (3s) reached for ${endpoint}`);
        }
        continue;
      }
    }

    // Se não conseguimos dados da API, usar fallback inteligente
    if (furniData.length === 0) {
      console.log('🔄 [HabboFurni] All API endpoints failed, using intelligent fallback');
      return generateFallbackResponse(searchTerm, className, limit);
    }

    const result = {
      furnis: furniData,
      metadata: {
        ...metadata,
        fetchedAt: new Date().toISOString(),
        count: furniData.length
      }
    };

    console.log(`🎯 [HabboFurni] Returning ${furniData.length} furniture items from ${successEndpoint}`);
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [HabboFurni] Fatal error:', error);
    return generateFallbackResponse('', '', 50);
  }
});

function generateOptimizedImageUrl(item: any): string {
  const className = item.class_name || item.swf_name || item.className || item.name || item.id;
  
  // Priorizar URLs válidas do item
  if (item.icon_url && item.icon_url.startsWith('http')) return item.icon_url;
  if (item.image_url && item.image_url.startsWith('http')) return item.image_url;
  if (item.preview_image && item.preview_image.startsWith('http')) return item.preview_image;
  
  // HabboFurni URLs otimizadas
  return `https://habbofurni.com/furniture_images/${className}.png`;
}

function determineFurniRarity(item: any): string {
  const name = (item.name || '').toLowerCase();
  const className = (item.class_name || item.swf_name || item.className || '').toLowerCase();
  
  if (name.includes('ltd') || className.includes('ltd')) return 'ltd';
  if (name.includes('rare') || className.includes('rare')) return 'rare';
  if (item.hc_required || item.club || name.includes('hc') || className.includes('hc')) return 'hc';
  if ((item.credits_cost || 0) > 1000) return 'expensive';
  return 'common';
}

function extractColors(item: any): string[] {
  if (item.colors && Array.isArray(item.colors)) {
    return item.colors.map(String);
  }
  if (item.color_variations && Array.isArray(item.color_variations)) {
    return item.color_variations.map((c: any) => c.id || c.color || String(c));
  }
  return ['1', '2', '3', '4'];
}

function generateFallbackResponse(searchTerm: string, className: string, limit: number) {
  console.log('🔄 [HabboFurni] Generating intelligent fallback data');
  
  const fallbackItems: HabboFurniItem[] = [
    {
      id: 'hf_chair_basic',
      name: 'Chair Basic',
      category: 'seating',
      description: 'Basic chair furniture',
      imageUrl: 'https://habbofurni.com/furniture_images/chair.png',
      rarity: 'common',
      type: 'roomitem',
      className: 'chair_basic',
      colors: ['1', '2', '3'],
      club: 'FREE',
      source: 'habbofurni'
    },
    {
      id: 'hf_table_basic',
      name: 'Table Basic',
      category: 'table',
      description: 'Basic table furniture',
      imageUrl: 'https://habbofurni.com/furniture_images/table.png',
      rarity: 'common',
      type: 'roomitem',
      className: 'table_basic',
      colors: ['1', '2'],
      club: 'FREE',
      source: 'habbofurni'
    }
  ];
  
  // Filtrar se necessário
  let filtered = fallbackItems;
  if (searchTerm) {
    filtered = fallbackItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (className) {
    filtered = fallbackItems.filter(item => 
      item.className.toLowerCase().includes(className.toLowerCase())
    );
  }
  
  const result = {
    furnis: filtered,
    metadata: {
      source: 'fallback',
      searchTerm,
      className,
      fetchedAt: new Date().toISOString(),
      count: filtered.length,
      apiStatus: 'fallback'
    }
  };

  return new Response(
    JSON.stringify(result),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
