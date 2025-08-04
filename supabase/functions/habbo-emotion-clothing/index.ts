
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface HabboEmotionItem {
  id: number;
  code: string;
  part: string;
  gender: 'M' | 'F' | 'U';
  date: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 1000 } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [HabboEmotion] Fetching clothing data with limit: ${limit}`);
    
    // Try multiple endpoints for HabboEmotion API
    const endpoints = [
      `https://api.habboemotion.com/public/clothings/new/${limit}`,
      `https://habboemotion.com/api/clothings/new/${limit}`,
      `https://api.habboemotion.com/clothings/new/${limit}`
    ];

    let clothingData: HabboEmotionItem[] = [];
    let successfulEndpoint = '';

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 [HabboEmotion] Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'HabboHub-Console/1.0',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
          console.log(`❌ [HabboEmotion] Failed ${endpoint}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`📊 [HabboEmotion] Response structure:`, {
          hasResult: !!data.result,
          hasData: !!data.data,
          hasClothings: !!data.data?.clothings,
          clothingsLength: data.data?.clothings?.length
        });

        if (data && data.data && data.data.clothings && Array.isArray(data.data.clothings)) {
          clothingData = data.data.clothings.map((item: any) => ({
            id: item.id || 0,
            code: item.code || '',
            part: mapCategoryToStandard(item.part || 'ch'),
            gender: item.gender || 'U',
            date: item.date || '',
            colors: generateDefaultColors(item.part),
            imageUrl: generateEmotionImageUrl(item.code, item.part),
            club: determineClub(item.code),
            source: 'habboemotion'
          }));
          
          successfulEndpoint = endpoint;
          console.log(`✅ [HabboEmotion] Success with ${clothingData.length} items from ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`❌ [HabboEmotion] Error with ${endpoint}:`, error.message);
        continue;
      }
    }

    if (clothingData.length === 0) {
      console.log('🔄 [HabboEmotion] All endpoints failed, generating enhanced fallback');
      clothingData = generateEnhancedFallbackData(limit);
    }

    const result = {
      items: clothingData,
      metadata: {
        source: successfulEndpoint || 'fallback',
        fetchedAt: new Date().toISOString(),
        count: clothingData.length
      }
    };

    console.log(`🎯 [HabboEmotion] Returning ${clothingData.length} items`);
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [HabboEmotion] Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        items: generateEnhancedFallbackData(1000),
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
    'hair': 'hr',
    'head': 'hd', 
    'shirt': 'ch',
    'trousers': 'lg',
    'shoes': 'sh',
    'hat': 'ha',
    'eye_accessory': 'ea',
    'face_accessory': 'fa',
    'chest_accessory': 'ca',
    'waist': 'wa',
    'coat': 'cc',
    'chest_print': 'cp'
  };
  
  return mapping[category] || category;
}

function generateEmotionImageUrl(code: string, part: string): string {
  // Garantir padrão _2_0.png (front_right) para todas as imagens
  return `https://habboemotion.com/usables/clothing/${part}_U_${code}_2_0.png`;
}

function determineClub(code: string): 'HC' | 'FREE' {
  if (!code) return 'FREE';
  
  const lowerCode = code.toLowerCase();
  return (lowerCode.includes('hc') || lowerCode.includes('club')) ? 'HC' : 'FREE';
}

function generateDefaultColors(part: string): string[] {
  // Generate realistic color arrays based on part type
  const colorSets: Record<string, string[]> = {
    'hr': ['45', '61', '1', '92', '104'], // Hair colors
    'hd': ['1', '2', '3', '4', '5'], // Skin tones
    'ch': ['1', '92', '61', '106', '143'], // Shirt colors
    'lg': ['61', '92', '1', '102'], // Pants colors
    'sh': ['61', '102', '92', '1'], // Shoe colors
  };
  
  return colorSets[part] || ['1', '2', '3', '4', '5'];
}

function generateEnhancedFallbackData(requestedLimit: number): any[] {
  const categories = [
    { code: 'hr', name: 'Hair', count: Math.floor(requestedLimit * 0.25) },
    { code: 'hd', name: 'Head', count: Math.floor(requestedLimit * 0.1) },
    { code: 'ch', name: 'Shirt', count: Math.floor(requestedLimit * 0.3) },
    { code: 'lg', name: 'Trousers', count: Math.floor(requestedLimit * 0.2) },
    { code: 'sh', name: 'Shoes', count: Math.floor(requestedLimit * 0.15) },
    { code: 'ha', name: 'Hat', count: Math.floor(requestedLimit * 0.12) },
    { code: 'ea', name: 'Eye Accessory', count: Math.floor(requestedLimit * 0.08) },
    { code: 'fa', name: 'Face Accessory', count: Math.floor(requestedLimit * 0.05) },
    { code: 'cc', name: 'Coat', count: Math.floor(requestedLimit * 0.1) },
    { code: 'ca', name: 'Chest Accessory', count: Math.floor(requestedLimit * 0.08) },
    { code: 'wa', name: 'Waist', count: Math.floor(requestedLimit * 0.05) },
    { code: 'cp', name: 'Chest Print', count: Math.floor(requestedLimit * 0.03) }
  ];

  const fallbackItems: any[] = [];
  
  categories.forEach(category => {
    for (let i = 1; i <= category.count; i++) {
      const isHC = i % 8 === 0;
      
      fallbackItems.push({
        id: parseInt(`${category.code === 'hr' ? '1' : '2'}${i.toString().padStart(4, '0')}`),
        code: `${category.code}_${i}`,
        part: category.code,
        gender: Math.random() > 0.5 ? 'U' : (Math.random() > 0.5 ? 'M' : 'F'),
        date: new Date().toISOString(),
        colors: generateDefaultColors(category.code),
        imageUrl: `https://habboemotion.com/usables/clothing/${category.code}_U_${category.code}_${i}_2_0.png`,
        club: isHC ? 'HC' : 'FREE',
        source: 'habboemotion'
      });
    }
  });
  
  console.log(`🔄 [Enhanced Fallback] Generated ${fallbackItems.length} HabboEmotion fallback items`);
  return fallbackItems;
}
