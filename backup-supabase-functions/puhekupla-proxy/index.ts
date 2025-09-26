
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface PuhekuplaFurni {
  guid: string;
  slug: string;
  code: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  status: string;
}

interface PuhekuplaCategory {
  guid: string;
  name: string;
  slug: string;
  image: string;
  count: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { endpoint = 'furni', params = {} } = body;
    
    const page = params.page || '1';
    const category = params.category || '';
    const search = params.search || '';
    
    // Get API key from environment
    const envApiKey = Deno.env.get('PUHEKUPLA_API_KEY');
    
    // Use correct demo key format as specified in documentation
    const correctDemoKey = 'demo-habbohub';
    
    let apiUrl = '';
    
    switch (endpoint) {
      case 'furni':
        apiUrl = `https://content.puhekupla.com/api/v1/furni?page=${page}`;
        if (category) apiUrl += `&category=${category}`;
        if (search) apiUrl += `&search=${encodeURIComponent(search)}`;
        break;
      case 'categories':
        apiUrl = 'https://content.puhekupla.com/api/v1/categories';
        break;
      case 'badges':
        apiUrl = `https://content.puhekupla.com/api/v1/badges?page=${page}`;
        if (search) apiUrl += `&search=${encodeURIComponent(search)}`;
        break;
      case 'clothing':
        apiUrl = `https://content.puhekupla.com/api/v1/clothing?page=${page}`;
        if (category) apiUrl += `&category=${category}`;
        if (search) apiUrl += `&search=${encodeURIComponent(search)}`;
        break;
      default:
        throw new Error('Invalid endpoint');
    }

    console.log(`📡 [PuhekuplaProxy] Fetching: ${apiUrl}`);
    console.log(`🔑 [PuhekuplaProxy] Environment key available: ${!!envApiKey}`);

    // CORRIGIDO: Authentication strategies com header correto X-Puhekupla-APIKey
    const authStrategies = [
      // Environment API key first (if available) - CORRIGIDO: usar header correto
      ...(envApiKey ? [
        { name: 'X-Puhekupla-APIKey (env)', headers: { 'X-Puhekupla-APIKey': envApiKey } },
        { name: 'X-API-Key (env)', headers: { 'X-API-Key': envApiKey } },
        { name: 'Authorization Bearer (env)', headers: { 'Authorization': `Bearer ${envApiKey}` } },
      ] : []),
      
      // Correct demo key format from documentation - CORRIGIDO: usar header correto
      { name: 'X-Puhekupla-APIKey (demo-habbohub)', headers: { 'X-Puhekupla-APIKey': correctDemoKey } },
      { name: 'X-API-Key (demo-habbohub)', headers: { 'X-API-Key': correctDemoKey } },
      { name: 'Authorization Bearer (demo-habbohub)', headers: { 'Authorization': `Bearer ${correctDemoKey}` } },
      
      // Alternative demo formats - CORRIGIDO: usar header correto
      { name: 'X-Puhekupla-APIKey (demo-habbo-hub)', headers: { 'X-Puhekupla-APIKey': 'demo-habbo-hub' } },
      { name: 'X-API-Key (demo-habbo-hub)', headers: { 'X-API-Key': 'demo-habbo-hub' } },
      { name: 'Authorization Bearer (demo-habbo-hub)', headers: { 'Authorization': `Bearer demo-habbo-hub` } },
      
      // No auth as last resort
      { name: 'No Auth', headers: {} }
    ];

    const baseHeaders = {
      'User-Agent': 'HabboHub-Editor/1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    let response: Response | null = null;
    let successfulStrategy = '';
    let responseData: any = null;

    // Try each authentication strategy
    for (const strategy of authStrategies) {
      try {
        console.log(`🔄 [PuhekuplaProxy] Trying ${strategy.name}...`);
        
        const fetchHeaders = {
          ...baseHeaders,
          ...strategy.headers
        };

        // Also try as query parameter for demo keys
        let testUrl = apiUrl;
        if (strategy.name.includes('demo')) {
          const apiKeyParam = strategy.headers['X-API-Key'] || strategy.headers['Authorization']?.replace('Bearer ', '') || strategy.headers['apikey'];
          if (apiKeyParam) {
            testUrl += `${apiUrl.includes('?') ? '&' : '?'}api_key=${apiKeyParam}`;
            console.log(`🔗 [PuhekuplaProxy] Testing with query param: ${testUrl}`);
          }
        }

        response = await fetch(testUrl, {
          headers: fetchHeaders,
          method: 'GET'
        });

        console.log(`📊 [PuhekuplaProxy] ${strategy.name} response: ${response.status} ${response.statusText}`);
        console.log(`📋 [PuhekuplaProxy] Response headers:`, Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const responseText = await response.text();
          console.log(`📝 [PuhekuplaProxy] Raw response (first 200 chars):`, responseText.substring(0, 200));
          
          try {
            responseData = JSON.parse(responseText);
            console.log(`✅ [PuhekuplaProxy] SUCCESS with ${strategy.name}`);
            console.log(`📦 [PuhekuplaProxy] Response structure:`, Object.keys(responseData));
            successfulStrategy = strategy.name;
            break;
          } catch (jsonError) {
            console.log(`❌ [PuhekuplaProxy] JSON parse error with ${strategy.name}:`, jsonError.message);
            console.log(`📄 [PuhekuplaProxy] Response content:`, responseText);
          }
        } else {
          const errorText = await response.text();
          console.log(`❌ [PuhekuplaProxy] Failed with ${strategy.name}: ${response.status} - ${errorText.substring(0, 200)}`);
        }
      } catch (error) {
        console.log(`💥 [PuhekuplaProxy] Network error with ${strategy.name}:`, error.message);
      }
      
      response = null;
      responseData = null;
    }

    // If all authentication strategies failed, return mock data
    if (!response || !response.ok || !responseData) {
      console.log('🚨 [PuhekuplaProxy] All strategies failed, returning enhanced mock data');
      
      const mockData = generateEnhancedMockData(endpoint, page);
      
      return new Response(
        JSON.stringify({
          success: true,
          endpoint,
          data: mockData,
          fetchedAt: new Date().toISOString(),
          source: 'mock_data',
          note: 'API authentication failed - using mock data for development',
          authStrategiesAttempted: authStrategies.length
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle successful API response
    console.log(`🎉 [PuhekuplaProxy] API Success for ${endpoint}:`, {
      strategy: successfulStrategy,
      dataKeys: Object.keys(responseData),
      hasResult: 'result' in responseData,
      statusCode: responseData.status_code,
      statusMessage: responseData.status_message
    });

    return new Response(
      JSON.stringify({
        success: true,
        endpoint,
        data: responseData,
        fetchedAt: new Date().toISOString(),
        strategy: successfulStrategy,
        source: 'puhekupla_api'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [PuhekuplaProxy] Fatal Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        fetchedAt: new Date().toISOString(),
        troubleshooting: {
          suggestion: 'Check API documentation and ensure correct demo key format',
          demoKeyFormat: 'demo-habbohub (as per Puhekupla API docs)',
          note: 'Using fallback mock data instead'
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateEnhancedMockData(endpoint: string, page: string) {
  const pageNum = parseInt(page) || 1;
  
  switch (endpoint) {
    case 'categories':
      return {
        result: {
          categories: [
            { guid: 'cat-1', name: 'Mobília Básica', slug: 'mobilia-basica', image: '/placeholder.svg', count: 45 },
            { guid: 'cat-2', name: 'Decoração', slug: 'decoracao', image: '/placeholder.svg', count: 32 },
            { guid: 'cat-3', name: 'Plantas e Jardim', slug: 'plantas-jardim', image: '/placeholder.svg', count: 18 },
            { guid: 'cat-4', name: 'Eletrônicos', slug: 'eletronicos', image: '/placeholder.svg', count: 24 },
            { guid: 'cat-5', name: 'Raros e Especiais', slug: 'raros-especiais', image: '/placeholder.svg', count: 12 },
            { guid: 'cat-6', name: 'Iluminação', slug: 'iluminacao', image: '/placeholder.svg', count: 15 }
          ]
        }
      };
      
    case 'furni':
      return {
        result: {
          furni: Array.from({ length: 20 }, (_, i) => {
            const furniId = (pageNum - 1) * 20 + i + 1;
            return {
              guid: `furni-${furniId}`,
              slug: `movel-demo-${furniId}`,
              code: `furni_${furniId}`,
              name: `Móvel Demo ${furniId}`,
              description: `Descrição detalhada do móvel demo número ${furniId}. Ideal para decoração.`,
              image: `/placeholder.svg?text=Furni${furniId}`,
              icon: `/placeholder.svg?text=Icon${furniId}`,
              status: 'active',
              category: i % 3 === 0 ? 'mobilia-basica' : i % 3 === 1 ? 'decoracao' : 'eletronicos',
              rarity: i % 5 === 0 ? 'rare' : 'common'
            };
          })
        },
        pagination: {
          current_page: pageNum,
          pages: 8,
          total: 160
        }
      };
      
    case 'clothing':
      return {
        result: {
          clothing: Array.from({ length: 20 }, (_, i) => {
            const clothingId = (pageNum - 1) * 20 + i + 1;
            return {
              guid: `clothing-${clothingId}`,
              code: `clothing_${clothingId}`,
              name: `Roupa Demo ${clothingId}`,
              description: `Descrição da roupa demo ${clothingId}. Estilo moderno.`,
              image: `/placeholder.svg?text=Cloth${clothingId}`,
              category: ['shirt', 'pants', 'shoes', 'hat', 'accessory'][i % 5],
              gender: i % 2 === 0 ? 'M' : 'F',
              status: 'active',
              colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'][i % 5]
            };
          })
        },
        pagination: {
          current_page: pageNum,
          pages: 6,
          total: 120
        }
      };
      
    case 'badges':
      return {
        result: {
          badges: Array.from({ length: 20 }, (_, i) => {
            const badgeId = (pageNum - 1) * 20 + i + 1;
            return {
              guid: `badge-${badgeId}`,
              code: `BADGE${badgeId}`,
              name: `Emblema Demo ${badgeId}`,
              description: `Emblema especial número ${badgeId}. Conquista rara.`,
              image: `/placeholder.svg?text=Badge${badgeId}`,
              status: 'active',
              type: ['achievement', 'event', 'special', 'competition'][i % 4],
              rarity: i % 4 === 0 ? 'legendary' : i % 4 === 1 ? 'epic' : 'common'
            };
          })
        },
        pagination: {
          current_page: pageNum,
          pages: 4,
          total: 80
        }
      };
      
    default:
      return { result: {}, pagination: { current_page: 1, pages: 1, total: 0 } };
  }
}
