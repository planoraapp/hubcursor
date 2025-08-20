import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache para evitar requests excessivos
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, hotel = 'br', limit = 20 } = await req.json();
    
    if (!query || query.trim().length < 1) {
      return new Response(
        JSON.stringify({ users: [], message: 'Query too short' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchTerm = query.trim();
    const cacheKey = `${searchTerm}-${hotel}-${limit}`;
    
    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`🎯 [UserSearch] Using cached result for "${searchTerm}"`);
      return new Response(
        JSON.stringify({ users: cached.data, source: 'cache' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 [UserSearch] Searching for: "${searchTerm}" on hotel: ${hotel}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Search in local database first (both tracked users and discovered users)
    const localResults = await searchLocalDatabase(supabase, searchTerm, hotel, limit);
    
    // If we have good local results, return them
    if (localResults.length >= Math.min(5, limit)) {
      searchCache.set(cacheKey, { data: localResults, timestamp: Date.now() });
      return new Response(
        JSON.stringify({ users: localResults, source: 'database' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to search via Habbo official API
    const apiResult = await searchHabboAPI(searchTerm, hotel);
    let allResults = [...localResults];
    
    if (apiResult) {
      // Cache user in database for future searches
      await cacheUserInDatabase(supabase, apiResult, hotel);
      
      // Add to results if not already included
      const existsInLocal = allResults.some(user => 
        user.habbo_name.toLowerCase() === apiResult.habbo_name.toLowerCase()
      );
      
      if (!existsInLocal) {
        allResults.unshift(apiResult); // Add at beginning
      }
    }

    // Remove duplicates and limit results
    const uniqueResults = allResults
      .filter((user, index, self) => 
        index === self.findIndex(u => u.habbo_id === user.habbo_id)
      )
      .slice(0, limit);

    searchCache.set(cacheKey, { data: uniqueResults, timestamp: Date.now() });

    console.log(`✅ [UserSearch] Found ${uniqueResults.length} users for "${searchTerm}"`);
    
    return new Response(
      JSON.stringify({ users: uniqueResults, source: 'mixed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[UserSearch] Error:', error);
    return new Response(
      JSON.stringify({ 
        users: [], 
        error: 'Search failed', 
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Calculate similarity score for fuzzy matching
function calculateSimilarity(searchTerm: string, username: string): number {
  const search = searchTerm.toLowerCase();
  const name = username.toLowerCase();
  
  // Exact match gets highest score
  if (name === search) return 100;
  
  // Starts with search term gets high score
  if (name.startsWith(search)) return 90;
  
  // Contains search term gets good score
  if (name.includes(search)) return 80;
  
  // Use Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(search, name);
  const maxLen = Math.max(search.length, name.length);
  
  // Convert distance to similarity percentage
  const similarity = ((maxLen - distance) / maxLen) * 70;
  
  return Math.max(0, similarity);
}

async function searchLocalDatabase(supabase: any, searchTerm: string, hotel: string, limit: number) {
  const results = [];
  
  try {
    // Enhanced search in habbo_accounts 
    const { data: accounts } = await supabase
      .from('habbo_accounts')
      .select('habbo_name, habbo_id, hotel, motto, figure_string, is_online')
      .or(`habbo_name.ilike.%${searchTerm}%,habbo_id.ilike.%${searchTerm}%,motto.ilike.%${searchTerm}%`)
      .eq('hotel', hotel)
      .limit(limit * 2); // Get more results for better filtering

    if (accounts) {
      results.push(...accounts.map((acc: any) => ({
        habbo_name: acc.habbo_name,
        habbo_id: acc.habbo_id,
        hotel: acc.hotel,
        motto: acc.motto || '',
        figure_string: acc.figure_string || '',
        is_online: acc.is_online || false,
        source: 'accounts',
        similarity: calculateSimilarity(searchTerm, acc.habbo_name)
      })));
    }

    // Enhanced search in discovered_users 
    const { data: discovered } = await supabase
      .from('discovered_users')
      .select('habbo_name, habbo_id, hotel, motto, figure_string, is_online')
      .or(`habbo_name.ilike.%${searchTerm}%,habbo_id.ilike.%${searchTerm}%,motto.ilike.%${searchTerm}%`)
      .eq('hotel', hotel)
      .limit(limit * 2);

    if (discovered) {
      results.push(...discovered.map((disc: any) => ({
        habbo_name: disc.habbo_name,
        habbo_id: disc.habbo_id,
        hotel: disc.hotel,
        motto: disc.motto || '',
        figure_string: disc.figure_string || '',
        is_online: disc.is_online || false,
        source: 'discovered',
        similarity: calculateSimilarity(searchTerm, disc.habbo_name)
      })));
    }

    // Remove duplicates and apply intelligent sorting
    const uniqueResults = results
      .filter((user, index, self) => 
        index === self.findIndex(u => u.habbo_id === user.habbo_id)
      )
      .filter(user => user.similarity > 30) // Only include reasonably similar results
      .sort((a, b) => {
        // Primary sort: similarity score (higher is better)
        if (b.similarity !== a.similarity) {
          return b.similarity - a.similarity;
        }
        
        // Secondary sort: source priority (accounts > discovered)
        if (a.source === 'accounts' && b.source !== 'accounts') return -1;
        if (a.source !== 'accounts' && b.source === 'accounts') return 1;
        
        // Tertiary sort: online status (online users first)  
        if (a.is_online && !b.is_online) return -1;
        if (!a.is_online && b.is_online) return 1;
        
        return 0;
      })
      .slice(0, limit); // Final limit after sorting

    console.log(`🔍 [UserSearch] Local search found ${uniqueResults.length} results with similarities:`, 
      uniqueResults.map(u => `${u.habbo_name}(${u.similarity})`));

    return uniqueResults;

  } catch (error) {
    console.error('[UserSearch] Local search error:', error);
    return [];
  }
}

async function searchHabboAPI(query: string, hotel: string) {
  try {
    const domain = hotel === 'br' ? 'com.br' : hotel;
    const response = await fetch(`https://www.habbo.${domain}/api/public/users?name=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      console.warn(`[UserSearch] Habbo API returned ${response.status} for ${query}`);
      return null;
    }

    const userData = await response.json();
    if (!userData || !userData.name) {
      return null;
    }

    return {
      habbo_name: userData.name,
      habbo_id: userData.uniqueId,
      hotel: hotel,
      motto: userData.motto || '',
      figure_string: userData.figureString || '',
      is_online: userData.online || false,
      source: 'api'
    };

  } catch (error) {
    console.warn(`[UserSearch] Habbo API error for ${query}:`, error.message);
    return null;
  }
}

async function cacheUserInDatabase(supabase: any, user: any, hotel: string) {
  try {
    const { error } = await supabase
      .from('discovered_users')
      .upsert({
        habbo_name: user.habbo_name,
        habbo_id: user.habbo_id,
        hotel: hotel,
        motto: user.motto,
        figure_string: user.figure_string,
        is_online: user.is_online,
        discovery_source: 'user_search',
        last_seen_at: new Date().toISOString()
      }, {
        onConflict: 'habbo_name,hotel'
      });

    if (error) {
      console.warn('[UserSearch] Cache error:', error.message);
    }
  } catch (error) {
    console.warn('[UserSearch] Failed to cache user:', error.message);
  }
}