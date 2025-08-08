
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 [FigureData] Fetching official Habbo figuredata...');
    
    // Try multiple Habbo hotels for figuredata
    const figuredataUrls = [
      'https://www.habbo.com.br/gamedata/figuredata/1',
      'https://www.habbo.com/gamedata/figuredata/1',
      'https://www.habbo.es/gamedata/figuredata/1'
    ];
    
    let xmlData = null;
    let usedUrl = null;
    
    for (const url of figuredataUrls) {
      try {
        console.log(`🌐 [FigureData] Trying URL: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/xml, application/xml, */*',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (response.ok) {
          xmlData = await response.text();
          usedUrl = url;
          console.log(`✅ [FigureData] Successfully fetched from: ${url}`);
          break;
        } else {
          console.warn(`⚠️ [FigureData] Failed to fetch from ${url}: ${response.status}`);
        }
      } catch (error) {
        console.warn(`⚠️ [FigureData] Error with ${url}:`, error.message);
      }
    }
    
    if (!xmlData) {
      throw new Error('Could not fetch figuredata from any source');
    }
    
    console.log(`📄 [FigureData] Processing XML data (${xmlData.length} characters)`);
    
    // Parse XML and convert to structured JSON
    const figureData = await parseXMLToJSON(xmlData);
    
    console.log(`✅ [FigureData] Processed ${Object.keys(figureData).length} categories`);
    
    return new Response(
      JSON.stringify({ 
        figureParts: figureData,
        metadata: {
          source: usedUrl,
          fetchedAt: new Date().toISOString(),
          totalCategories: Object.keys(figureData).length
        }
      }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        }
      }
    );

  } catch (error) {
    console.error('💥 [FigureData] Fatal Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch figuredata',
        success: false 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function parseXMLToJSON(xmlString: string) {
  try {
    // Enhanced XML parsing for better structure
    const figureData: Record<string, any[]> = {};
    
    // Valid clothing categories only
    const VALID_CATEGORIES = new Set([
      'hd', 'hr', 'ha', 'ea', 'fa', // Head section
      'ch', 'cc', 'cp', 'ca',       // Body section  
      'lg', 'sh', 'wa'              // Legs section
    ]);
    
    // Find all <set> elements
    const setMatches = xmlString.match(/<set[^>]*>([\s\S]*?)<\/set>/g);
    
    if (setMatches) {
      for (const setMatch of setMatches) {
        // Extract set id (category)
        const setIdMatch = setMatch.match(/id="([^"]+)"/);
        if (!setIdMatch) continue;
        
        const setId = setIdMatch[1];
        
        // Only process valid clothing categories
        if (!VALID_CATEGORIES.has(setId)) {
          console.log(`🚫 [FigureData] Skipping non-clothing category: ${setId}`);
          continue;
        }
        
        figureData[setId] = [];
        
        // Find all <part> elements within this set
        const partMatches = setMatch.match(/<part[^>]*\/>/g);
        
        if (partMatches) {
          for (const partMatch of partMatches) {
            // Extract part attributes
            const partIdMatch = partMatch.match(/id="([^"]+)"/);
            const genderMatch = partMatch.match(/gender="([^"]+)"/);
            const clubMatch = partMatch.match(/club="([^"]+)"/);
            const colorableMatch = partMatch.match(/colorable="([^"]+)"/);
            
            if (partIdMatch) {
              const partId = partIdMatch[1];
              
              // Validate numeric ID
              if (!/^\d+$/.test(partId)) {
                console.warn(`⚠️ [FigureData] Invalid part ID: ${partId} in category ${setId}`);
                continue;
              }
              
              const partData = {
                id: partId,
                gender: genderMatch ? genderMatch[1] : 'U',
                club: clubMatch ? clubMatch[1] : '0',
                colorable: colorableMatch ? colorableMatch[1] === '1' : false,
                colors: ['1'] // Default color, enhanced later if needed
              };
              
              figureData[setId].push(partData);
              
              console.log(`✅ [FigureData] Added ${setId}-${partId} (gender: ${partData.gender}, club: ${partData.club})`);
            }
          }
        }
        
        console.log(`📊 [FigureData] Category ${setId}: ${figureData[setId].length} items`);
      }
    }
    
    // Log final structure
    const totalItems = Object.values(figureData).reduce((sum, items) => sum + items.length, 0);
    console.log(`📈 [FigureData] Final structure: ${Object.keys(figureData).length} categories, ${totalItems} total items`);
    console.log(`📋 [FigureData] Categories: ${Object.keys(figureData).join(', ')}`);
    
    return figureData;
    
  } catch (error) {
    console.error('❌ [FigureData] XML parsing error:', error);
    throw new Error('Failed to parse figuredata XML');
  }
}
