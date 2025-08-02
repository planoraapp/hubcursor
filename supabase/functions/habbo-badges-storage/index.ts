
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  imageUrl: string;
  category: string;
  rarity: string;
  source: 'official';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 500, search = '', category = 'all' } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [HabboBadges] Fetching badges from Storage - limit: ${limit}, search: "${search}", category: ${category}`);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // List all files from habbo-badges bucket
    const { data: files, error } = await supabase.storage
      .from('habbo-badges')
      .list('', {
        limit: 2000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      throw new Error(`Storage error: ${error.message}`);
    }

    console.log(`📁 [HabboBadges] Found ${files?.length || 0} badge files in storage`);

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({
          badges: [],
          metadata: { 
            source: 'storage-empty', 
            count: 0,
            fetchedAt: new Date().toISOString()
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert storage files to badge items
    let badges: BadgeItem[] = files
      .filter(file => file.name.endsWith('.gif') || file.name.endsWith('.png'))
      .map(file => {
        const code = extractBadgeCode(file.name);
        const category = determineBadgeCategory(code, file.name);
        const rarity = determineBadgeRarity(code, file.name);
        
        return {
          id: code,
          code,
          name: generateBadgeName(code),
          imageUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/habbo-badges/${file.name}`,
          category,
          rarity,
          source: 'official' as const
        };
      });

    // Apply search filter
    if (search) {
      badges = badges.filter(badge => 
        badge.name.toLowerCase().includes(search.toLowerCase()) ||
        badge.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (category !== 'all') {
      badges = badges.filter(badge => badge.category === category);
    }

    // Apply limit
    badges = badges.slice(0, limit);

    const result = {
      badges,
      metadata: {
        source: 'storage',
        totalFiles: files.length,
        filteredCount: badges.length,
        categories: getUniqueCategories(badges),
        fetchedAt: new Date().toISOString()
      }
    };

    console.log(`✅ [HabboBadges] Returning ${badges.length} badges from storage`);
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [HabboBadges] Error:', error);
    
    return new Response(
      JSON.stringify({
        badges: [],
        metadata: {
          source: 'error',
          error: error.message,
          fetchedAt: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function extractBadgeCode(filename: string): string {
  // Extract badge code from filename
  // Examples: "ADM001.gif" -> "ADM001", "1234__-ABC.png" -> "1234__-ABC"
  return filename.replace(/\.(gif|png)$/i, '');
}

function determineBadgeCategory(code: string, filename: string): string {
  const lowerCode = code.toLowerCase();
  const lowerFile = filename.toLowerCase();
  
  if (lowerCode.includes('adm') || lowerCode.includes('mod') || lowerCode.includes('staff')) return 'staff';
  if (lowerCode.includes('vip') || lowerCode.includes('hc') || lowerCode.includes('club')) return 'club';
  if (lowerCode.includes('event') || lowerCode.includes('competition') || lowerCode.includes('comp')) return 'events';
  if (lowerCode.includes('game') || lowerCode.includes('sport') || lowerCode.includes('winner')) return 'games';
  if (lowerCode.includes('rare') || lowerCode.includes('ltd') || lowerCode.includes('special')) return 'rare';
  if (lowerCode.includes('achievement') || lowerCode.includes('level') || lowerCode.includes('skill')) return 'achievements';
  if (lowerCode.includes('seasonal') || lowerCode.includes('xmas') || lowerCode.includes('easter')) return 'seasonal';
  
  return 'general';
}

function determineBadgeRarity(code: string, filename: string): string {
  const lowerCode = code.toLowerCase();
  
  if (lowerCode.includes('ltd') || lowerCode.includes('limited')) return 'limited';
  if (lowerCode.includes('rare') || lowerCode.includes('special')) return 'rare';
  if (lowerCode.includes('epic') || lowerCode.includes('legendary')) return 'epic';
  if (lowerCode.includes('hc') || lowerCode.includes('vip')) return 'premium';
  
  return 'common';
}

function generateBadgeName(code: string): string {
  // Generate human-readable names from badge codes
  const specialCodes: Record<string, string> = {
    'ADM': 'Administrador',
    'MOD': 'Moderador',
    'HC': 'Habbo Club',
    'VIP': 'VIP Badge',
    'STAFF': 'Funcionário',
    'EVENT': 'Evento Especial',
    'COMP': 'Competição',
    'WINNER': 'Vencedor',
    'RARE': 'Badge Raro',
    'LTD': 'Edição Limitada'
  };

  for (const [key, name] of Object.entries(specialCodes)) {
    if (code.toUpperCase().includes(key)) {
      return `${name} ${code}`;
    }
  }

  return `Badge ${code}`;
}

function getUniqueCategories(badges: BadgeItem[]): string[] {
  return [...new Set(badges.map(badge => badge.category))];
}
