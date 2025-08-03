
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BadgeItem {
  id: string;
  badge_code: string;
  badge_name: string;
  source: 'SupabaseStorage' | 'HabboWidgets';
  image_url: string;
  created_at: string;
  last_validated_at: string;
  validation_count: number;
  is_active: boolean;
  category: 'official' | 'achievements' | 'fansites' | 'others';
}

// Categorização automática baseada em prefixos
const categorizeBadge = (code: string): string => {
  const upperCode = code.toUpperCase();
  
  // Oficiais (staff, administração)
  const officialPrefixes = ['ADM', 'MOD', 'STAFF', 'VIP', 'SUP', 'GUIDE', 'HELPER'];
  if (officialPrefixes.some(prefix => upperCode.includes(prefix))) {
    return 'official';
  }
  
  // Conquistas (achievements, games)
  const achievementPrefixes = ['ACH', 'GAME', 'WIN', 'VICTORY', 'CHAMPION', 'QUEST'];
  if (achievementPrefixes.some(prefix => upperCode.includes(prefix))) {
    return 'achievements';
  }
  
  // Fã-sites (eventos, parcerias)
  const fansitePrefixes = ['FANSITE', 'PARTNER', 'EVENT', 'SPECIAL', 'LIMITED', 'PROMO'];
  if (fansitePrefixes.some(prefix => upperCode.includes(prefix))) {
    return 'fansites';
  }
  
  return 'others';
};

// Validar se badge existe no HabboWidgets
const validateBadgeFromHabboWidgets = async (code: string): Promise<{ exists: boolean; name?: string }> => {
  try {
    const response = await fetch(`https://www.habbowidgets.com/images/badges/${code}.gif`, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      // Tentar obter nome do badge (fallback genérico)
      const name = code.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return { exists: true, name };
    }
    
    return { exists: false };
  } catch (error) {
    console.error(`❌ Error validating ${code} from HabboWidgets:`, error);
    return { exists: false };
  }
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, limit = 1000, search = '', category = 'all' } = await req.json()
    console.log(`🔧 [SimplifiedBadgeSystem] Action: ${action}`)

    if (action === 'populate-initial') {
      console.log(`🚀 [Population] Starting simplified population from Supabase Storage`)
      
      try {
        // Listar arquivos da bucket habbo-badges
        const { data: files, error: listError } = await supabase.storage
          .from('habbo-badges')
          .list('badges_all_02-08-25', {
            limit: 2000,
            sortBy: { column: 'name', order: 'asc' }
          });

        if (listError) {
          console.error('❌ [Population] Error listing files:', listError);
          throw listError;
        }

        console.log(`📦 [Population] Found ${files?.length || 0} files in storage`);

        if (!files || files.length === 0) {
          return Response.json({
            success: false,
            error: 'No badge files found in storage',
            populated: 0
          });
        }

        const badgesToInsert: any[] = [];
        let processedCount = 0;
        let validatedCount = 0;

        // Processar arquivos em lotes
        for (const file of files) {
          if (!file.name.endsWith('.gif')) continue;
          
          processedCount++;
          const badgeCode = file.name.replace('.gif', '');
          const category = categorizeBadge(badgeCode);
          
          // URL do storage do Supabase (fonte principal)
          const storageUrl = `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges/badges_all_02-08-25/${file.name}`;
          
          // Validar com HabboWidgets para obter nome
          const validation = await validateBadgeFromHabboWidgets(badgeCode);
          if (validation.exists) {
            validatedCount++;
          }

          const badgeItem = {
            id: crypto.randomUUID(),
            badge_code: badgeCode,
            badge_name: validation.name || `Badge ${badgeCode}`,
            source: 'SupabaseStorage',
            image_url: storageUrl,
            category,
            is_active: true,
            validation_count: validation.exists ? 2 : 1,
            created_at: new Date().toISOString(),
            last_validated_at: new Date().toISOString()
          };

          badgesToInsert.push(badgeItem);

          // Inserir em lotes de 50
          if (badgesToInsert.length >= 50) {
            const { error: insertError } = await supabase
              .from('habbo_badges')
              .insert(badgesToInsert);

            if (insertError) {
              console.error('❌ [Population] Batch insert error:', insertError);
            } else {
              console.log(`✅ [Population] Inserted batch of ${badgesToInsert.length} badges`);
            }

            badgesToInsert.length = 0; // Clear array
          }
        }

        // Inserir lote final
        if (badgesToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('habbo_badges')
            .insert(badgesToInsert);

          if (insertError) {
            console.error('❌ [Population] Final batch insert error:', insertError);
          } else {
            console.log(`✅ [Population] Inserted final batch of ${badgesToInsert.length} badges`);
          }
        }

        console.log(`🎯 [Population] Completed: ${processedCount} processed, ${validatedCount} validated`);

        return Response.json({
          success: true,
          populated: processedCount,
          validated: validatedCount,
          message: `População concluída: ${processedCount} emblemas do storage + ${validatedCount} validados`
        });

      } catch (error) {
        console.error('❌ [Population] Error:', error);
        return Response.json({
          success: false,
          error: error.message,
          populated: 0
        });
      }
    }

    if (action === 'get-badges') {
      console.log(`📊 [GetBadges] Fetching: limit=${limit}, search="${search}", category=${category}`);
      
      let query = supabase
        .from('habbo_badges')
        .select('*')
        .eq('is_active', true)
        .order('badge_code', { ascending: true });

      if (search) {
        query = query.or(`badge_code.ilike.%${search}%,badge_name.ilike.%${search}%`);
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data: badges, error } = await query;

      if (error) {
        console.error('❌ [GetBadges] Database error:', error);
        throw error;
      }

      console.log(`✅ [GetBadges] Found ${badges?.length || 0} badges`);

      // Agrupar por categoria para metadata
      const categoryCounts = badges?.reduce((acc, badge) => {
        acc[badge.category] = (acc[badge.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return Response.json({
        success: true,
        badges: badges || [],
        metadata: {
          total: badges?.length || 0,
          source: 'simplified-badge-system',
          categories: categoryCounts,
          timestamp: new Date().toISOString(),
          primarySource: 'SupabaseStorage',
          fallbackSource: 'HabboWidgets'
        }
      });
    }

    // Ação para validar badge individual
    if (action === 'validate-badge') {
      const { badgeCode } = await req.json();
      
      if (!badgeCode) {
        return Response.json({
          success: false,
          error: 'Badge code is required'
        });
      }

      // Buscar na base de dados primeiro
      const { data: existingBadge, error } = await supabase
        .from('habbo_badges')
        .select('*')
        .eq('badge_code', badgeCode)
        .eq('is_active', true)
        .single();

      if (!error && existingBadge) {
        return Response.json({
          success: true,
          badge: existingBadge
        });
      }

      // Se não encontrar, tentar validar com HabboWidgets
      const validation = await validateBadgeFromHabboWidgets(badgeCode);
      
      if (validation.exists) {
        const newBadge = {
          id: crypto.randomUUID(),
          badge_code: badgeCode,
          badge_name: validation.name || `Badge ${badgeCode}`,
          source: 'HabboWidgets',
          image_url: `https://www.habbowidgets.com/images/badges/${badgeCode}.gif`,
          category: categorizeBadge(badgeCode),
          is_active: true,
          validation_count: 1,
          created_at: new Date().toISOString(),
          last_validated_at: new Date().toISOString()
        };

        // Inserir na base de dados
        const { error: insertError } = await supabase
          .from('habbo_badges')
          .insert([newBadge]);

        if (insertError) {
          console.error('❌ [ValidateBadge] Insert error:', insertError);
        }

        return Response.json({
          success: true,
          badge: newBadge
        });
      }

      return Response.json({
        success: false,
        error: 'Badge not found'
      });
    }

    return Response.json({
      success: false,
      error: 'Invalid action'
    });

  } catch (error) {
    console.error('❌ [SimplifiedBadgeSystem] Error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
})
