
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface OfficialFigureItem {
  id: string;
  gender: 'M' | 'F' | 'U';
  club: string;
  colorable: boolean;
  colors: string[];
}

interface OfficialFigureData {
  [type: string]: OfficialFigureItem[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotel = 'com' } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [Official API] Fetching figure data for hotel: ${hotel}`);
    
    // Try official Sulake endpoints in priority order
    const endpoints = [
      `https://www.habbo.${hotel}/gamedata/figuredata/1`,
      `https://www.habbo.${hotel}/api/public/figuredata/`,
      `https://images.habbo.com/gordon/PRODUCTION/figuredata.txt`,
      `https://www.habbo.com/gamedata/figuredata/1`
    ];

    let figureData: OfficialFigureData = {};
    let metadata = {
      source: '',
      fetchedAt: new Date().toISOString(),
      hotel
    };

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 [Official API] Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'HabboHub-Console/1.0',
            'Accept': 'application/json,text/xml,application/xml,text/plain,*/*',
          },
          signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
          console.log(`❌ [Official API] Endpoint failed: ${endpoint} (${response.status})`);
          continue;
        }

        const contentType = response.headers.get('content-type') || '';
        let rawData: string;

        if (contentType.includes('application/json')) {
          const jsonData = await response.json();
          rawData = JSON.stringify(jsonData);
        } else {
          rawData = await response.text();
        }

        console.log(`📄 [Official API] Received data from ${endpoint}: ${rawData.length} chars`);
        
        // Parse XML figuredata
        if (rawData.includes('<figuredata>') || rawData.includes('<figure')) {
          figureData = parseOfficialFigureDataXML(rawData);
          metadata.source = endpoint;
          break;
        }
        
        // Try to parse as JSON
        try {
          const parsed = JSON.parse(rawData);
          if (parsed.figuredata || parsed.figure) {
            figureData = normalizeOfficialData(parsed);
            metadata.source = endpoint;
            break;
          }
        } catch (e) {
          console.log(`⚠️ [Official API] Not valid JSON from ${endpoint}`);
        }

      } catch (error) {
        console.log(`❌ [Official API] Error with endpoint ${endpoint}:`, error.message);
        continue;
      }
    }

    if (Object.keys(figureData).length === 0) {
      console.log('🔄 [Official API] All endpoints failed, generating fallback data');
      figureData = generateOfficialFallbackData();
      metadata.source = 'fallback';
    }

    console.log(`✅ [Official API] Returning data:`, {
      categories: Object.keys(figureData).length,
      totalItems: Object.values(figureData).reduce((acc, items) => acc + items.length, 0),
      source: metadata.source
    });

    return new Response(
      JSON.stringify({
        figureParts: figureData,
        metadata
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [Official API] Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        figureParts: generateOfficialFallbackData(),
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

function parseOfficialFigureDataXML(xmlData: string): OfficialFigureData {
  const figureData: OfficialFigureData = {};
  
  try {
    // Extract figure sets using regex (simpler than XML parser)
    const setMatches = xmlData.match(/<set[^>]*type="([^"]*)"[^>]*>(.*?)<\/set>/gs) || [];
    
    for (const setMatch of setMatches) {
      const typeMatch = setMatch.match(/type="([^"]*)"/);
      if (!typeMatch) continue;
      
      const setType = typeMatch[1];
      const partMatches = setMatch.match(/<part[^>]*id="([^"]*)"[^>]*>/g) || [];
      
      figureData[setType] = [];
      
      for (const partMatch of partMatches) {
        const idMatch = partMatch.match(/id="([^"]*)"/);
        const genderMatch = partMatch.match(/gender="([^"]*)"/);
        const clubMatch = partMatch.match(/club="([^"]*)"/);
        const colorableMatch = partMatch.match(/colorable="([^"]*)"/);
        
        if (idMatch) {
          figureData[setType].push({
            id: idMatch[1],
            gender: (genderMatch?.[1] as 'M' | 'F' | 'U') || 'U',
            club: clubMatch?.[1] || '0',
            colorable: colorableMatch?.[1] === '1',
            colors: extractColors(setMatch, idMatch[1])
          });
        }
      }
    }
    
    console.log(`✅ [Parser] Parsed XML figuredata:`, Object.keys(figureData));
    
  } catch (error) {
    console.error('❌ [Parser] Error parsing XML:', error);
  }
  
  return figureData;
}

function extractColors(setXml: string, partId: string): string[] {
  const colors: string[] = [];
  
  try {
    // Look for color definitions for this part
    const colorRegex = new RegExp(`<color[^>]*>.*?</color>`, 'g');
    const colorMatches = setXml.match(colorRegex) || [];
    
    for (const colorMatch of colorMatches) {
      const idMatch = colorMatch.match(/id="([^"]*)"/);
      if (idMatch) {
        colors.push(idMatch[1]);
      }
    }
    
    // Default colors if none found
    if (colors.length === 0) {
      colors.push('1', '2', '3', '4');
    }
    
  } catch (error) {
    console.error('❌ [Parser] Error extracting colors:', error);
    return ['1', '2', '3', '4'];
  }
  
  return colors;
}

function normalizeOfficialData(data: any): OfficialFigureData {
  // Handle different JSON structures from official APIs
  const normalized: OfficialFigureData = {};
  
  try {
    if (data.figuredata) {
      // Structure 1: { figuredata: { sets: [...] } }
      const sets = data.figuredata.sets || [];
      for (const set of sets) {
        normalized[set.type] = (set.parts || []).map((part: any) => ({
          id: part.id?.toString() || '',
          gender: part.gender || 'U',
          club: part.club?.toString() || '0',
          colorable: Boolean(part.colorable),
          colors: part.colors || ['1', '2', '3', '4']
        }));
      }
    } else if (data.sets) {
      // Structure 2: { sets: [...] }
      for (const set of data.sets) {
        normalized[set.type] = (set.parts || []).map((part: any) => ({
          id: part.id?.toString() || '',
          gender: part.gender || 'U',
          club: part.club?.toString() || '0',
          colorable: Boolean(part.colorable),
          colors: part.colors || ['1', '2', '3', '4']
        }));
      }
    }
  } catch (error) {
    console.error('❌ [Normalizer] Error normalizing data:', error);
  }
  
  return normalized;
}

function generateOfficialFallbackData(): OfficialFigureData {
  const fallbackData: OfficialFigureData = {};
  
  // Generate structured fallback data for common figure types
  const categories = {
    'hd': { name: 'Head', count: 20 },
    'hr': { name: 'Hair', count: 50 },
    'ch': { name: 'Chest', count: 100 },
    'lg': { name: 'Legs', count: 80 },
    'sh': { name: 'Shoes', count: 60 },
    'ha': { name: 'Hat', count: 40 },
    'ea': { name: 'Eye Accessory', count: 30 },
    'fa': { name: 'Face Accessory', count: 25 },
    'cc': { name: 'Coat', count: 70 },
    'ca': { name: 'Chest Accessory', count: 35 },
    'wa': { name: 'Waist', count: 20 },
    'cp': { name: 'Chest Print', count: 15 }
  };
  
  for (const [type, info] of Object.entries(categories)) {
    fallbackData[type] = [];
    
    for (let i = 1; i <= info.count; i++) {
      fallbackData[type].push({
        id: i.toString(),
        gender: 'U',
        club: i % 5 === 0 ? '1' : '0', // Every 5th item is HC
        colorable: true,
        colors: ['1', '2', '3', '4', '5', '6', '7', '8']
      });
    }
  }
  
  console.log(`🔄 [Fallback] Generated official fallback data:`, {
    categories: Object.keys(fallbackData).length,
    totalItems: Object.values(fallbackData).reduce((acc, items) => acc + items.length, 0)
  });
  
  return fallbackData;
}
