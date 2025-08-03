
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
    // Parse request body to get parameters
    const body = await req.json();
    const { endpoint = 'furni', params = {} } = body;
    
    const page = params.page || '1';
    const category = params.category || '';
    const search = params.search || '';
    
    // Get API key from environment
    const apiKey = Deno.env.get('PUHEKUPLA_API_KEY') || 'demo-habbohub';
    
    let apiUrl = '';
    
    switch (endpoint) {
      case 'furni':
        apiUrl = `https://content.puhekupla.com/api/v1/furni?page=${page}`;
        if (category) apiUrl += `&category=${category}`;
        if (search) apiUrl += `&search=${search}`;
        break;
      case 'categories':
        apiUrl = 'https://content.puhekupla.com/api/v1/categories';
        break;
      case 'badges':
        apiUrl = `https://content.puhekupla.com/api/v1/badges?page=${page}`;
        if (search) apiUrl += `&search=${search}`;
        break;
      case 'clothing':
        apiUrl = `https://content.puhekupla.com/api/v1/clothing?page=${page}`;
        if (category) apiUrl += `&category=${category}`;
        if (search) apiUrl += `&search=${search}`;
        break;
      default:
        throw new Error('Invalid endpoint');
    }

    console.log(`📡 [PuhekuplaProxy] Fetching: ${apiUrl}`);
    console.log(`🔑 [PuhekuplaProxy] Using API Key: ${apiKey.substring(0, 10)}...`);

    // Try different authentication methods
    const authHeaders: Record<string, string> = {
      'User-Agent': 'HabboHub-Editor/1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // Try different API key formats
    const authMethods = [
      { 'Authorization': `Bearer ${apiKey}` },
      { 'X-API-Key': apiKey },
      { 'apikey': apiKey },
      { 'API-Key': apiKey },
    ];

    let response: Response | null = null;
    let lastError: Error | null = null;

    for (const authMethod of authMethods) {
      try {
        console.log(`🔄 [PuhekuplaProxy] Trying auth method:`, Object.keys(authMethod)[0]);
        
        response = await fetch(apiUrl, {
          headers: {
            ...authHeaders,
            ...authMethod,
          }
        });

        if (response.ok) {
          console.log(`✅ [PuhekuplaProxy] Success with auth method:`, Object.keys(authMethod)[0]);
          break;
        } else {
          console.log(`❌ [PuhekuplaProxy] Failed with ${Object.keys(authMethod)[0]}: ${response.status}`);
          lastError = new Error(`Auth method ${Object.keys(authMethod)[0]} failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`💥 [PuhekuplaProxy] Error with ${Object.keys(authMethod)[0]}:`, error);
        lastError = error as Error;
      }
    }

    if (!response || !response.ok) {
      console.error('❌ [PuhekuplaProxy] All auth methods failed');
      throw lastError || new Error('All authentication methods failed');
    }

    const data = await response.json();
    
    console.log(`✅ [PuhekuplaProxy] Success for ${endpoint}:`, {
      total: data.result?.total || data.result?.length || 0,
      dataKeys: Object.keys(data)
    });

    return new Response(
      JSON.stringify({
        success: true,
        endpoint,
        data: data,
        fetchedAt: new Date().toISOString(),
        apiKeyUsed: apiKey.substring(0, 10) + '...'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [PuhekuplaProxy] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        fetchedAt: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
