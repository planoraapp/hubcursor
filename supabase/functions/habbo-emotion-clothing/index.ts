
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
    const { limit = 200 } = await req.json().catch(() => ({}));
    
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
      console.log('🔄 [HabboEmotion] All endpoints failed, generating structured fallback');
      clothingData = generateEmotionFallbackData();
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
        items: generateEmotionFallbackData(),
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
  // Generate multiple possible image URLs for HabboEmotion
  const baseUrls = [
    `https://habboemotion.com/images/clothing/${part}/${code}.png`,
    `https://habboemotion.com/assets/clothing/${code}.png`,
    `https://cdn.habboemotion.com/clothing/${code}.gif`
  ];
  
  return baseUrls[0]; // Return primary URL
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

function generateEmotionFallbackData(): any[] {
  const categories = [
    { code: 'hr', name: 'Hair', count: 50 },
    { code: 'hd', name: 'Head', count: 20 },
    { code: 'ch', name: 'Shirt', count: 80 },
    { code: 'lg', name: 'Trousers', count: 60 },
    { code: 'sh', name: 'Shoes', count: 40 },
    { code: 'ha', name: 'Hat', count: 30 },
    { code: 'ea', name: 'Eye Accessory', count: 20 },
    { code: 'fa', name: 'Face Accessory', count: 15 },
    { code: 'cc', name: 'Coat', count: 35 },
    { code: 'ca', name: 'Chest Accessory', count: 25 },
    { code: 'wa', name: 'Waist', count: 15 },
    { code: 'cp', name: 'Chest Print', count: 10 }
  ];

  const fallbackItems: any[] = [];
  
  categories.forEach(category => {
    for (let i = 1; i <= category.count; i++) {
      const isHC = i % 6 === 0;
      
      fallbackItems.push({
        id: parseInt(`${category.code === 'hr' ? '1' : '2'}${i.toString().padStart(3, '0')}`),
        code: `${category.code}_${i}`,
        part: category.code,
        gender: 'U',
        date: new Date().toISOString(),
        colors: generateDefaultColors(category.code),
        imageUrl: `https://habboemotion.com/images/clothing/${category.code}/${category.code}_${i}.png`,
        club: isHC ? 'HC' : 'FREE',
        source: 'habboemotion'
      });
    }
  });
  
  console.log(`🔄 [Fallback] Generated ${fallbackItems.length} HabboEmotion fallback items`);
  return fallbackItems;
}
