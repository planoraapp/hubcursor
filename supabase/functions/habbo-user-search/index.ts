import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchUser {
  uniqueId: string;
  name: string;
  motto: string;
  online: boolean;
  figureString: string;
  memberSince: string;
  profileVisible: boolean;
  lastWebAccess: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, hotel = 'br', limit = 20 } = await req.json();
    
    console.log(`🔍 [USER SEARCH] Searching for "${query}" on hotel: ${hotel}`);

    if (!query || query.trim().length < 1) {
      return new Response(
        JSON.stringify({ users: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchTerm = query.trim();
    const hotelDomain = hotel === 'br' ? 'com.br' : hotel === 'com' ? 'com' : 'com.br';
    
    // Try exact match first
    const exactMatchUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(searchTerm)}`;
    console.log(`🎯 [EXACT SEARCH] ${exactMatchUrl}`);
    
    const users: SearchUser[] = [];
    
    try {
      const exactResponse = await fetch(exactMatchUrl);
      if (exactResponse.ok) {
        const exactUser = await exactResponse.json();
        if (exactUser && exactUser.name) {
          users.push(exactUser);
          console.log(`✅ [EXACT MATCH] Found: ${exactUser.name}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ [EXACT SEARCH] Failed: ${error.message}`);
    }

    // If we need more results, try fuzzy search with common patterns
    if (users.length < limit) {
      const searchPatterns = [
        searchTerm,
        `!${searchTerm}!`,
        `${searchTerm}!`,
        `!${searchTerm}`,
        `${searchTerm}_`,
        `_${searchTerm}`,
        `${searchTerm}123`,
        `${searchTerm}1`,
        `x${searchTerm}x`
      ];

      for (const pattern of searchPatterns) {
        if (users.length >= limit) break;
        
        try {
          const patternUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(pattern)}`;
          const patternResponse = await fetch(patternUrl);
          
          if (patternResponse.ok) {
            const patternUser = await patternResponse.json();
            if (patternUser && patternUser.name && !users.find(u => u.uniqueId === patternUser.uniqueId)) {
              users.push(patternUser);
              console.log(`🔗 [PATTERN MATCH] Found: ${patternUser.name} with pattern: ${pattern}`);
            }
          }
        } catch (error) {
          console.log(`⚠️ [PATTERN SEARCH] Failed for ${pattern}: ${error.message}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Sort by relevance (exact matches first, then by name similarity)
    users.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchTerm.toLowerCase();
      const bExact = b.name.toLowerCase() === searchTerm.toLowerCase();
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      const aIncludes = a.name.toLowerCase().includes(searchTerm.toLowerCase());
      const bIncludes = b.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (aIncludes && !bIncludes) return -1;
      if (!aIncludes && bIncludes) return 1;
      
      return a.name.localeCompare(b.name);
    });

    const limitedUsers = users.slice(0, limit);
    
    console.log(`✅ [USER SEARCH] Returning ${limitedUsers.length} users for "${query}"`);
    
    return new Response(
      JSON.stringify({ users: limitedUsers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [USER SEARCH] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro na busca de usuários', 
        users: [] 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});