
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
    
    console.log(`🌐 [HabboEmotion] Fetching comprehensive data - limit: ${limit}, category: ${category}, gender: ${gender}`);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Primeiro tentar buscar do Supabase (cache local expandido)
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
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('part', category);
    }

    if (gender && gender !== 'U') {
      query = query.in('gender', [gender, 'U']);
    }

    const { data: supabaseItems, error: supabaseError } = await query;

    if (!supabaseError && supabaseItems && supabaseItems.length > 100) {
      console.log(`✅ [HabboEmotion] Found ${supabaseItems.length} items in comprehensive Supabase cache`);
      
      // Processar dados do Supabase com URLs corrigidas
      const processedItems = supabaseItems.map((item: any) => ({
        id: item.item_id,
        code: item.code,
        part: item.part,
        gender: item.gender,
        date: item.created_at,
        colors: item.colors || ['1'],
        imageUrl: generateCorrectImageUrl(item.code, item.part, item.item_id),
        club: item.club,
        source: 'supabase-comprehensive',
        name: `${item.part}_${item.code}`,
        category: item.part,
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
            source: 'supabase-comprehensive',
            fetchedAt: new Date().toISOString(),
            count: processedItems.length,
            cached: true,
            comprehensive: true
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 [HabboEmotion] Supabase cache insufficient, trying comprehensive fallback...');
    
    // Fallback para geração massiva se cache não tiver dados suficientes
    const comprehensiveItems = generateComprehensiveFallback(limit, category, gender);

    // Aplicar filtros se especificados
    let filteredItems = comprehensiveItems;
    
    if (category && category !== 'all') {
      filteredItems = filteredItems.filter(item => item.part === category);
    }

    if (gender && gender !== 'U') {
      filteredItems = filteredItems.filter(item => item.gender === gender || item.gender === 'U');
    }

    const result = {
      items: filteredItems.slice(0, limit),
      metadata: {
        source: 'comprehensive-fallback',
        fetchedAt: new Date().toISOString(),
        count: filteredItems.length,
        cached: false,
        comprehensive: true,
        filters: { category, gender, limit }
      }
    };

    console.log(`🎯 [HabboEmotion] Returning ${result.items.length} comprehensive items`);
    
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
        items: generateComprehensiveFallback(1000),
        metadata: {
          source: 'error-comprehensive-fallback',
          fetchedAt: new Date().toISOString(),
          error: error.message,
          comprehensive: true
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateCorrectImageUrl(code: string, category: string, itemId: number): string {
  // Usar o formato correto: files.habboemotion.com com sprite path real
  const categoryNames: Record<string, string> = {
    'hr': 'hair',
    'ch': 'shirt', 
    'lg': 'trousers',
    'sh': 'shoes',
    'ha': 'hat',
    'ea': 'glasses',
    'cc': 'jacket',
    'ca': 'chest_accessory',
    'wa': 'belt',
    'fa': 'face_accessory',
    'cp': 'chest_print',
    'hd': 'head'
  };
  
  const categoryName = categoryNames[category] || 'shirt';
  const spriteName = code.includes('_U_') ? code : `${categoryName}_U_${code}`;
  
  // URLs com múltiplos fallbacks para robustez
  return `https://files.habboemotion.com/habbo-assets/sprites/clothing/${spriteName}/h_std_${category}_${itemId}_2_0.png`;
}

function generateComprehensiveFallback(requestedLimit: number, category?: string, gender?: string): any[] {
  const categories = [
    { code: 'hr', name: 'Hair', count: Math.floor(requestedLimit * 0.30), items: generateCategoryItems('hr', 300) },
    { code: 'ch', name: 'Shirt', count: Math.floor(requestedLimit * 0.25), items: generateCategoryItems('ch', 250) },
    { code: 'lg', name: 'Trousers', count: Math.floor(requestedLimit * 0.15), items: generateCategoryItems('lg', 150) },
    { code: 'sh', name: 'Shoes', count: Math.floor(requestedLimit * 0.10), items: generateCategoryItems('sh', 100) },
    { code: 'ha', name: 'Hat', count: Math.floor(requestedLimit * 0.08), items: generateCategoryItems('ha', 80) },
    { code: 'ea', name: 'Eye Accessory', count: Math.floor(requestedLimit * 0.04), items: generateCategoryItems('ea', 40) },
    { code: 'cc', name: 'Coat', count: Math.floor(requestedLimit * 0.03), items: generateCategoryItems('cc', 30) },
    { code: 'ca', name: 'Chest Accessory', count: Math.floor(requestedLimit * 0.02), items: generateCategoryItems('ca', 20) },
    { code: 'wa', name: 'Waist', count: Math.floor(requestedLimit * 0.015), items: generateCategoryItems('wa', 15) },
    { code: 'fa', name: 'Face Accessory', count: Math.floor(requestedLimit * 0.01), items: generateCategoryItems('fa', 10) },
    { code: 'cp', name: 'Chest Print', count: Math.floor(requestedLimit * 0.005), items: generateCategoryItems('cp', 5) },
    { code: 'hd', name: 'Head', count: Math.floor(requestedLimit * 0.005), items: generateCategoryItems('hd', 5) }
  ];

  let allItems: any[] = [];
  
  for (const cat of categories) {
    if (category && category !== 'all' && cat.code !== category) continue;
    
    const itemsToAdd = Math.min(cat.count, cat.items.length);
    allItems = [...allItems, ...cat.items.slice(0, itemsToAdd)];
  }
  
  // Aplicar filtro de gênero se especificado
  if (gender && gender !== 'U') {
    allItems = allItems.filter(item => item.gender === gender || item.gender === 'U');
  }
  
  console.log(`🔄 [Comprehensive Fallback] Generated ${allItems.length} items across all categories`);
  return allItems;
}

function generateCategoryItems(categoryCode: string, maxCount: number): any[] {
  const items: any[] = [];
  
  const categoryConfig: Record<string, any> = {
    'hr': { prefix: 'hair', range: [1, 8000] },
    'ch': { prefix: 'shirt', range: [1, 7000] },
    'lg': { prefix: 'trousers', range: [1, 5000] },
    'sh': { prefix: 'shoes', range: [1, 3000] },
    'ha': { prefix: 'hat', range: [1, 4000] },
    'ea': { prefix: 'glasses', range: [1, 2000] },
    'cc': { prefix: 'jacket', range: [1, 2500] },
    'ca': { prefix: 'chest_acc', range: [1, 1500] },
    'wa': { prefix: 'belt', range: [1, 1200] },
    'fa': { prefix: 'face_acc', range: [1, 1000] },
    'cp': { prefix: 'print', range: [1, 800] },
    'hd': { prefix: 'head', range: [180, 200] }
  };

  const config = categoryConfig[categoryCode];
  if (!config) return items;

  for (let i = 1; i <= maxCount; i++) {
    const itemId = Math.floor(Math.random() * (config.range[1] - config.range[0])) + config.range[0];
    const isHC = i % 10 === 0; // 10% HC items
    const genders = ['U', 'M', 'F'];
    const gender = genders[i % 3];
    
    const code = `${config.prefix}_U_${config.prefix}${String(itemId).padStart(4, '0')}`;
    
    items.push({
      id: itemId,
      code,
      part: categoryCode,
      gender,
      date: new Date().toISOString(),
      colors: generateRealisticColors(categoryCode, code),
      imageUrl: generateCorrectImageUrl(code, categoryCode, itemId),
      club: isHC ? 'HC' : 'FREE',
      source: 'comprehensive-fallback',
      name: `${config.prefix} ${i}`,
      category: categoryCode
    });
  }
  
  return items;
}

function generateRealisticColors(part: string, code: string): string[] {
  const colorSets: Record<string, string[]> = {
    'hr': ['45', '61', '1', '92', '104', '21', '26', '31', '42', '49', '27', '28', '29'],
    'hd': ['1', '2', '6', '81', '82', '83', '84', '85'],
    'ch': ['1', '92', '61', '106', '143', '21', '26', '31', '42', '8', '13', '17', '25', '30'],
    'lg': ['61', '92', '1', '102', '21', '2', '13', '20', '23', '24'],
    'sh': ['61', '102', '92', '1', '21', '2', '20', '23'],
    'ha': ['1', '61', '92', '21', '26', '31', '2', '20', '27', '28'],
    'ea': ['1', '21', '61', '92', '2', '20'],
    'fa': ['1', '21', '61', '92', '26'],
    'cc': ['1', '61', '92', '21', '2', '13', '17', '8', '23', '24'],
    'ca': ['1', '61', '92', '21', '26', '31', '27', '28'],
    'wa': ['1', '61', '92', '21', '2', '20', '23'],
    'cp': ['1', '61', '92', '21', '26', '31', '42', '8', '13', '17', '27', '28', '29', '30']
  };
  
  let baseColors = colorSets[part] || ['1', '2', '3', '4', '5'];
  
  if (code) {
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
  return uniqueColors.slice(0, Math.max(4, Math.min(10, uniqueColors.length)));
}
