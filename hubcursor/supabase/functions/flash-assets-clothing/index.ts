
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface FlashAssetItem {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  type: string;
  imageUrl: string;
  swfName: string;
  figureId: string;
  club: 'HC' | 'FREE';
  colors: string[];
  source: 'database';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 300, category = 'all', search = '', gender = 'U' } = await req.json().catch(() => ({}));
    
    console.log(`🎯 [FlashAssetsClothing] Fetching from database - limit: ${limit}, category: ${category}, search: "${search}", gender: ${gender}`);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Query habbo_clothing_cache table for Flash Assets
    let query = supabase
      .from('habbo_clothing_cache')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply category filter
    if (category !== 'all') {
      query = query.eq('part', category);
    }

    // Apply gender filter
    if (gender && gender !== 'U') {
      query = query.or(`gender.eq.${gender},gender.eq.U`);
    }

    // Apply search filter if provided
    if (search) {
      query = query.or(`code.ilike.%${search}%,item_id.eq.${parseInt(search) || 0}`);
    }

    const { data: clothingData, error } = await query;

    if (error) {
      console.error('❌ [FlashAssetsClothing] Database error:', error);
      throw error;
    }

    if (!clothingData || clothingData.length === 0) {
      console.log('⚠️ [FlashAssetsClothing] No clothing data found');
      return new Response(
        JSON.stringify({ assets: [], metadata: { totalCount: 0, source: 'database' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 [FlashAssetsClothing] Found ${clothingData.length} clothing items`);

    // Transform database records to FlashAssetItem format
    const assets: FlashAssetItem[] = clothingData.map((item) => ({
      id: `db_${item.part}_${item.item_id}`,
      name: `${getCategoryName(item.part)} ${item.code || item.item_id}`,
      category: item.part,
      gender: item.gender as 'M' | 'F' | 'U',
      type: 'clothing',
      imageUrl: item.image_url || generateThumbnailUrl(item.part, item.item_id.toString(), item.colors?.[0] || '1'),
      swfName: `${item.part}_${item.item_id}.swf`,
      figureId: item.item_id.toString(),
      club: item.club === 'HC' ? 'HC' : 'FREE',
      colors: Array.isArray(item.colors) ? item.colors : ['1', '2', '3', '4', '5'],
      source: 'database'
    }));

    const result = {
      assets,
      metadata: {
        totalCount: assets.length,
        source: 'database',
        fetchedAt: new Date().toISOString(),
        filters: { category, search, gender, limit }
      }
    };

    console.log(`✅ [FlashAssetsClothing] Returning ${assets.length} database assets`);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [FlashAssetsClothing] Fatal error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        assets: [],
        metadata: { source: 'error-fallback' }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function getCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    'hd': 'Rosto',
    'hr': 'Cabelo',
    'ch': 'Camiseta',
    'lg': 'Calça',
    'sh': 'Sapato',
    'ha': 'Chapéu',
    'ea': 'Óculos',
    'cc': 'Casaco',
    'ca': 'Acessório',
    'cp': 'Estampa',
    'wa': 'Cintura',
    'fa': 'Rosto Acessório'
  };
  
  return categoryNames[category] || 'Item';
}

function generateThumbnailUrl(category: string, figureId: string, colorId: string): string {
  // Use Habbo's official imaging service for thumbnails
  const headOnly = ['hd', 'hr', 'ha', 'ea', 'fa'].includes(category) ? '&headonly=1' : '';
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${figureId}-${colorId}&gender=U&direction=2&head_direction=2&size=l${headOnly}`;
}
