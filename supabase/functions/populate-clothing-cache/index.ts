
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
    console.log('🔄 [PopulateClothingCache] Starting cache population...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch from HabboEmotion API
    const categories = ['hr', 'hd', 'ch', 'lg', 'sh', 'ca', 'wa', 'fa', 'ea', 'ha', 'cc', 'cp'];
    let totalInserted = 0;

    for (const category of categories) {
      console.log(`📦 [PopulateClothingCache] Processing category: ${category}`);
      
      try {
        const response = await fetch(`https://api.habboemotion.com/v1/clothing/${category}`);
        if (!response.ok) continue;
        
        const data = await response.json();
        const items = data.items || [];

        for (const item of items) {
          const clothingData = {
            part: category,
            item_id: parseInt(item.id),
            code: item.name || `${category}_${item.id}`,
            gender: item.gender || 'U',
            club: item.club || 'FREE',
            colors: item.colors || ['1', '2', '3', '4', '5'],
            image_url: `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${item.id}-1&gender=M&size=l&headonly=${['hr', 'hd', 'ha', 'ea', 'fa'].includes(category) ? '1' : '0'}`,
            source: 'habboemotion-api',
            is_active: true
          };

          const { error } = await supabase
            .from('habbo_clothing_cache')
            .upsert(clothingData, { 
              onConflict: 'part,item_id',
              ignoreDuplicates: false 
            });

          if (!error) totalInserted++;
        }
      } catch (categoryError) {
        console.error(`❌ [PopulateClothingCache] Error processing ${category}:`, categoryError);
      }
    }

    console.log(`✅ [PopulateClothingCache] Completed! Inserted/updated ${totalInserted} items`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        totalInserted,
        message: `Successfully populated ${totalInserted} clothing items`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [PopulateClothingCache] Fatal error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
