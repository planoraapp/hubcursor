import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 2000, category, gender = 'U' } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [HabboEmotion] Fetching from Supabase first, limit: ${limit}, category: ${category}, gender: ${gender}`);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Primeiro tentar buscar do Supabase (cache local)
    let query = supabaseClient
      .from('habbo_emotion_clothing')
      .select(`
        *,
        habbo_emotion_item_colors!inner(
          color_id,
          is_default,
          habbo_emotion_colors!inner(
            color_id,
            hex_code,
            color_name,
            is_hc
          )
        )
      `)
      .eq('is_active', true)
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('part', category);
    }

    if (gender && gender !== 'U') {
      query = query.in('gender', [gender, 'U']);
    }

    const { data: supabaseItems, error: supabaseError } = await query;

    if (!supabaseError && supabaseItems && supabaseItems.length > 0) {
      console.log(`✅ [HabboEmotion] Found ${supabaseItems.length} items in Supabase cache`);
      
      // Processar dados do Supabase
      const processedItems = supabaseItems.map((item: any) => ({
        id: item.item_id,
        code: item.code,
        part: item.part,
        gender: item.gender,
        date: item.created_at,
        colors: item.colors || ['1'],
        imageUrl: item.image_url,
        club: item.club,
        source: 'supabase-cache',
        name: `${item.part}_${item.code}`,
        category: item.part,
        // Adicionar dados de cores enriquecidos
        colorDetails: item.habbo_emotion_item_colors?.map((ic: any) => ({
          id: ic.color_id,
          hex: ic.habbo_emotion_colors.hex_code,
          name: ic.habbo_emotion_colors.color_name,
          is_hc: ic.habbo_emotion_colors.is_hc,
          isDefault: ic.is_default
        })) || []
      }));

      return new Response(
        JSON.stringify({
          items: processedItems,
          metadata: {
            source: 'supabase-cache',
            fetchedAt: new Date().toISOString(),
            count: processedItems.length,
            cached: true
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 [HabboEmotion] Supabase cache empty, trying API endpoints...');
    
    // Fallback para API externa se Supabase estiver vazio
    const endpoints = [
      `https://api.habboemotion.com/public/clothings/new/${limit}`,
      `https://habboemotion.com/api/clothings/new/${limit}`,
      `https://api.habboemotion.com/clothings/new/${limit}`
    ];

    let clothingData: any[] = [];
    let successfulEndpoint = '';

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 [HabboEmotion] Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'HabboHub-Console/2.0',
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
            colors: generateRealisticColors(item.part, item.code),
            imageUrl: generateEmotionImageUrl(item.code, item.part),
            club: determineClub(item.code),
            source: 'habboemotion-api',
            name: `${item.part}_${item.code}`,
            category: mapCategoryToStandard(item.part || 'ch')
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
      clothingData = generateEnhancedFallback(limit);
    }

    // Aplicar filtros se especificados
    if (category && category !== 'all') {
      clothingData = clothingData.filter(item => item.part === category);
    }

    if (gender && gender !== 'U') {
      clothingData = clothingData.filter(item => item.gender === gender || item.gender === 'U');
    }

    const result = {
      items: clothingData.slice(0, limit),
      metadata: {
        source: successfulEndpoint || 'fallback',
        fetchedAt: new Date().toISOString(),
        count: clothingData.length,
        cached: false,
        filters: { category, gender, limit }
      }
    };

    console.log(`🎯 [HabboEmotion] Returning ${result.items.length} items`);
    
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
        items: generateEnhancedFallback(1000),
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
    'top': 'ch',
    'chest': 'ch',
    'trousers': 'lg',
    'pants': 'lg',
    'legs': 'lg',
    'shoes': 'sh',
    'footwear': 'sh',
    'hat': 'ha',
    'cap': 'ha',
    'eye_accessory': 'ea',
    'eye_accessories': 'ea',
    'glasses': 'ea',
    'face_accessory': 'fa',
    'face_accessories': 'fa',
    'chest_accessory': 'ca',
    'chest_accessories': 'ca',
    'waist': 'wa',
    'belt': 'wa',
    'coat': 'cc',
    'jacket': 'cc',
    'chest_print': 'cp',
    'print': 'cp'
  };
  
  return mapping[category.toLowerCase()] || category;
}

function generateEmotionImageUrl(code: string, part: string): string {
  return `https://habboemotion.com/usables/clothing/${part}_U_${code}_2_0.png`;
}

function determineClub(code: string): 'HC' | 'FREE' {
  if (!code) return 'FREE';
  
  const lowerCode = code.toLowerCase();
  return (lowerCode.includes('hc') || 
          lowerCode.includes('club') || 
          lowerCode.includes('gold') ||
          lowerCode.includes('premium') ||
          lowerCode.includes('vip')) ? 'HC' : 'FREE';
}

function generateRealisticColors(part: string, code: string): string[] {
  const colorSets: Record<string, string[]> = {
    'hr': ['45', '61', '1', '92', '104', '21', '26', '31', '42', '49'],
    'hd': ['1', '2', '6', '81', '82', '83', '84', '85'],
    'ch': ['1', '92', '61', '106', '143', '21', '26', '31', '42', '8', '13', '17'],
    'lg': ['61', '92', '1', '102', '21', '2', '13', '20'],
    'sh': ['61', '102', '92', '1', '21', '2', '20'],
    'ha': ['1', '61', '92', '21', '26', '31', '2', '20'],
    'ea': ['1', '21', '61', '92', '2', '20'],
    'fa': ['1', '21', '61', '92', '26'],
    'cc': ['1', '61', '92', '21', '2', '13', '17', '8'],
    'ca': ['1', '61', '92', '21', '26', '31'],
    'wa': ['1', '61', '92', '21', '2', '20'],
    'cp': ['1', '61', '92', '21', '26', '31', '42', '8', '13', '17']
  };
  
  let baseColors = colorSets[part] || ['1', '2', '3', '4', '5'];
  
  if (code && typeof code === 'string') {
    if (code.includes('rainbow') || code.includes('colorful')) {
      baseColors = [...baseColors, '27', '42', '49', '47', '31', '17'];
    }
    
    if (code.includes('dark') || code.includes('black')) {
      baseColors = ['21', '20', '2', ...baseColors];
    }
    
    if (code.includes('gold') || code.includes('golden')) {
      baseColors = ['23', '29', '4', ...baseColors];
    }
  }
  
  const uniqueColors = [...new Set(baseColors)];
  return uniqueColors.slice(0, Math.max(3, Math.min(8, uniqueColors.length)));
}

function generateEnhancedFallback(requestedLimit: number): any[] {
  const categories = [
    { code: 'hr', name: 'Hair', count: Math.floor(requestedLimit * 0.3) },     // 30% cabelos
    { code: 'ch', name: 'Shirt', count: Math.floor(requestedLimit * 0.2) },    // 20% camisetas
    { code: 'lg', name: 'Trousers', count: Math.floor(requestedLimit * 0.15) }, // 15% calças
    { code: 'sh', name: 'Shoes', count: Math.floor(requestedLimit * 0.1) },     // 10% sapatos
    { code: 'ha', name: 'Hat', count: Math.floor(requestedLimit * 0.08) },      // 8% chapéus
    { code: 'ea', name: 'Eye Accessory', count: Math.floor(requestedLimit * 0.05) }, // 5% óculos
    { code: 'cc', name: 'Coat', count: Math.floor(requestedLimit * 0.04) },     // 4% casacos
    { code: 'ca', name: 'Chest Accessory', count: Math.floor(requestedLimit * 0.03) }, // 3% acessórios peito
    { code: 'wa', name: 'Waist', count: Math.floor(requestedLimit * 0.02) },    // 2% cinto
    { code: 'fa', name: 'Face Accessory', count: Math.floor(requestedLimit * 0.02) }, // 2% acessórios face
    { code: 'cp', name: 'Chest Print', count: Math.floor(requestedLimit * 0.01) }, // 1% estampas
    { code: 'hd', name: 'Head', count: Math.floor(requestedLimit * 0.005) }     // 0.5% rostos
  ];

  const fallbackItems: any[] = [];
  
  categories.forEach(category => {
    for (let i = 1; i <= category.count; i++) {
      const isHC = i % 8 === 0; // ~12.5% HC items
      const genders = ['U', 'M', 'F'];
      const gender = genders[i % 3];
      
      fallbackItems.push({
        id: parseInt(`${category.code === 'hr' ? '1' : '2'}${i.toString().padStart(4, '0')}`),
        code: `${category.code}_${i.toString().padStart(3, '0')}`,
        part: category.code,
        gender,
        date: new Date().toISOString(),
        colors: generateRealisticColors(category.code, `${category.code}_${i}`),
        imageUrl: `https://habboemotion.com/usables/clothing/${category.code}_U_${category.code}_${i}_2_0.png`,
        club: isHC ? 'HC' : 'FREE',
        source: 'enhanced-fallback',
        name: `${category.name} ${i}`,
        category: category.code
      });
    }
  });
  
  console.log(`🔄 [Enhanced Fallback] Generated ${fallbackItems.length} HabboEmotion fallback items`);
  return fallbackItems;
}
