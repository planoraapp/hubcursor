
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration for external badge sources
const BADGE_SOURCES = {
  HABBO_WIDGETS: 'https://www.habbowidgets.com/images/badges',
  HABBO_ASSETS: 'https://habboassets.com/c_images/album1584',
  SUPABASE_BUCKET: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges`
};

serve(async (req) => {
  console.log(`🎯 [BadgeValidator] ${req.method} request received`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { badgeCode, validateImage = true } = await req.json();
    
    if (!badgeCode) {
      return new Response(JSON.stringify({ 
        error: 'Badge code is required' 
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 [BadgeValidator] Validating badge: ${badgeCode}`);

    // Check if badge exists in database first
    const { data: existingBadge } = await supabase
      .from('habbo_badges')
      .select('*')
      .eq('badge_code', badgeCode)
      .eq('is_active', true)
      .single();

    if (existingBadge && (Date.now() - new Date(existingBadge.last_validated_at).getTime()) < 24 * 60 * 60 * 1000) {
      console.log(`💾 [BadgeValidator] Cache hit for badge ${badgeCode}`);
      
      // Update validation count
      await supabase
        .from('habbo_badges')
        .update({ 
          validation_count: existingBadge.validation_count + 1,
          last_validated_at: new Date().toISOString()
        })
        .eq('id', existingBadge.id);

      return new Response(JSON.stringify({
        success: true,
        badge: existingBadge,
        cached: true
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }

    // Validate badge existence across sources
    const validationResults = await Promise.allSettled([
      validateBadgeFromHabboWidgets(badgeCode),
      validateBadgeFromSupabaseBucket(badgeCode),
      validateBadgeImageUrl(badgeCode)
    ]);

    console.log(`📊 [BadgeValidator] Validation results:`, validationResults.map(r => r.status));

    // Find first successful validation
    const validBadge = validationResults.find(result => 
      result.status === 'fulfilled' && result.value
    );

    if (!validBadge || validBadge.status !== 'fulfilled') {
      console.log(`❌ [BadgeValidator] Badge ${badgeCode} not found in any source`);
      
      // Mark as inactive if exists
      if (existingBadge) {
        await supabase
          .from('habbo_badges')
          .update({ is_active: false })
          .eq('id', existingBadge.id);
      }

      return new Response(JSON.stringify({ 
        error: 'Badge not found',
        badgeCode,
        sources: Object.keys(BADGE_SOURCES)
      }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const validatedBadge = validBadge.value;
    console.log(`✅ [BadgeValidator] Badge ${badgeCode} validated from source: ${validatedBadge.source}`);

    // Insert or update badge in database
    const badgeData = {
      badge_code: badgeCode,
      badge_name: validatedBadge.name || `Badge ${badgeCode}`,
      source: validatedBadge.source,
      image_url: validatedBadge.imageUrl,
      last_validated_at: new Date().toISOString(),
      validation_count: existingBadge ? existingBadge.validation_count + 1 : 1,
      is_active: true
    };

    const { data: savedBadge, error: saveError } = await supabase
      .from('habbo_badges')
      .upsert(badgeData, { 
        onConflict: 'badge_code',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ [BadgeValidator] Error saving badge:', saveError);
      throw saveError;
    }

    // Cache control for 24 hours
    const cacheControl = 'public, max-age=86400';
    
    return new Response(JSON.stringify({
      success: true,
      badge: savedBadge,
      cached: false
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': cacheControl
      }
    });

  } catch (error) {
    console.error('❌ [BadgeValidator] Critical error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal validation error', 
      details: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Validate badge from HabboWidgets
async function validateBadgeFromHabboWidgets(badgeCode: string) {
  try {
    const imageUrl = `${BADGE_SOURCES.HABBO_WIDGETS}/${badgeCode}.gif`;
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      console.log(`✅ [HabboWidgets] Badge ${badgeCode} found`);
      return { 
        source: 'HabboWidgets', 
        badgeCode,
        imageUrl,
        name: `Badge ${badgeCode}`
      };
    }
    return null;
  } catch (error) {
    console.log(`⚠️ [HabboWidgets] Failed to validate ${badgeCode}:`, error.message);
    return null;
  }
}

// Validate badge from Supabase Bucket  
async function validateBadgeFromSupabaseBucket(badgeCode: string) {
  try {
    const imageUrl = `${BADGE_SOURCES.SUPABASE_BUCKET}/${badgeCode}.gif`;
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      console.log(`✅ [SupabaseBucket] Badge ${badgeCode} found`);
      return { 
        source: 'SupabaseBucket', 
        badgeCode,
        imageUrl,
        name: `Badge ${badgeCode}`
      };
    }
    return null;
  } catch (error) {
    console.log(`⚠️ [SupabaseBucket] Failed to validate ${badgeCode}:`, error.message);
    return null;
  }
}

// Validate badge image URL
async function validateBadgeImageUrl(badgeCode: string) {
  const imageUrls = [
    `${BADGE_SOURCES.HABBO_ASSETS}/${badgeCode}.gif`,
    `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`,
    `https://www.habbo.com/habbo-imaging/badge/${badgeCode}.gif`
  ];

  for (const url of imageUrls) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        console.log(`✅ [ImageUrl] Badge ${badgeCode} found at ${url}`);
        return { 
          source: 'HabboAssets', 
          badgeCode,
          imageUrl: url,
          name: `Badge ${badgeCode}`
        };
      }
    } catch (error) {
      continue;
    }
  }

  console.log(`❌ [ImageUrl] Badge ${badgeCode} not found in any image URL`);
  return null;
}
