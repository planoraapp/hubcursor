
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
    
    // Get API key from environment with fallback to demo keys
    const envApiKey = Deno.env.get('PUHEKUPLA_API_KEY');
    
    // List of demo keys to try in order
    const demoKeys = [
      'demo-sitename',
      'demo-habbo', 
      'demo-habbohub',
      'demo-test',
      'demo-puhekupla',
      'demo'
    ];
    
    const apiKey = envApiKey || demoKeys[0]; // Use first demo key as default
    
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
    console.log(`🔑 [PuhekuplaProxy] Primary API Key: ${apiKey.substring(0, 10)}...`);
    console.log(`🆔 [PuhekuplaProxy] Environment API Key: ${envApiKey ? envApiKey.substring(0, 10) + '...' : 'NOT_SET'}`);
    console.log(`📋 [PuhekuplaProxy] Available demo keys: ${demoKeys.join(', ')}`);

    // Try different authentication methods and API keys
    const authHeaders: Record<string, string> = {
      'User-Agent': 'HabboHub-Editor/1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    const authMethods = [
      { name: 'Bearer', headers: (key: string) => ({ 'Authorization': `Bearer ${key}` }) },
      { name: 'X-API-Key', headers: (key: string) => ({ 'X-API-Key': key }) },
      { name: 'apikey', headers: (key: string) => ({ 'apikey': key }) },
      { name: 'API-Key', headers: (key: string) => ({ 'API-Key': key }) },
    ];

    let response: Response | null = null;
    let lastError: Error | null = null;
    let successfulKey = '';
    let successfulMethod = '';

    // If we have an environment key, try it first with all auth methods
    if (envApiKey) {
      console.log(`🔐 [PuhekuplaProxy] Testing environment API key with all auth methods...`);
      
      for (const authMethod of authMethods) {
        try {
          console.log(`🔄 [PuhekuplaProxy] Trying ${authMethod.name} with environment key: ${envApiKey.substring(0, 10)}...`);
          
          response = await fetch(apiUrl, {
            headers: {
              ...authHeaders,
              ...authMethod.headers(envApiKey),
            }
          });

          console.log(`📊 [PuhekuplaProxy] ${authMethod.name} (env key) response: ${response.status} ${response.statusText}`);

          if (response.ok) {
            console.log(`✅ [PuhekuplaProxy] SUCCESS with environment key using ${authMethod.name}`);
            successfulKey = envApiKey;
            successfulMethod = authMethod.name;
            break;
          } else {
            const errorText = await response.text();
            console.log(`❌ [PuhekuplaProxy] Failed with env key + ${authMethod.name}: ${response.status} - ${errorText.substring(0, 100)}`);
            lastError = new Error(`${authMethod.name} (env key) failed: ${response.status} - ${errorText}`);
            response = null;
          }
        } catch (error) {
          console.log(`💥 [PuhekuplaProxy] Error with env key + ${authMethod.name}:`, error);
          lastError = error as Error;
        }
      }
    }

    // If environment key didn't work, try demo keys
    if (!response || !response.ok) {
      console.log(`🔄 [PuhekuplaProxy] Environment key failed, testing demo keys...`);
      
      for (const demoKey of demoKeys) {
        console.log(`🎯 [PuhekuplaProxy] Testing demo key: ${demoKey}`);
        
        for (const authMethod of authMethods) {
          try {
            console.log(`🔄 [PuhekuplaProxy] Trying ${authMethod.name} with demo key: ${demoKey}`);
            
            response = await fetch(apiUrl, {
              headers: {
                ...authHeaders,
                ...authMethod.headers(demoKey),
              }
            });

            console.log(`📊 [PuhekuplaProxy] ${authMethod.name} (${demoKey}) response: ${response.status} ${response.statusText}`);

            if (response.ok) {
              console.log(`✅ [PuhekuplaProxy] SUCCESS with demo key: ${demoKey} using ${authMethod.name}`);
              successfulKey = demoKey;
              successfulMethod = authMethod.name;
              break;
            } else {
              const errorText = await response.text();
              console.log(`❌ [PuhekuplaProxy] Failed with ${demoKey} + ${authMethod.name}: ${response.status} - ${errorText.substring(0, 100)}`);
              lastError = new Error(`${authMethod.name} (${demoKey}) failed: ${response.status} - ${errorText}`);
              response = null;
            }
          } catch (error) {
            console.log(`💥 [PuhekuplaProxy] Error with ${demoKey} + ${authMethod.name}:`, error);
            lastError = error as Error;
          }
        }
        
        // If we found a working combination, break out of demo key loop
        if (response && response.ok) {
          break;
        }
      }
    }

    if (!response || !response.ok) {
      console.error('❌ [PuhekuplaProxy] All authentication methods and API keys failed');
      console.error('🔍 [PuhekuplaProxy] Last error:', lastError?.message);
      console.error('📋 [PuhekuplaProxy] Tested keys:', envApiKey ? ['environment key', ...demoKeys].join(', ') : demoKeys.join(', '));
      throw lastError || new Error('All authentication methods failed');
    }

    const data = await response.json();
    
    console.log(`✅ [PuhekuplaProxy] SUCCESS for ${endpoint} using ${successfulKey} with ${successfulMethod}:`, {
      total: data.result?.total || data.result?.length || 0,
      dataKeys: Object.keys(data),
      hasResult: !!data.result,
      resultType: typeof data.result,
      apiKey: successfulKey,
      authMethod: successfulMethod
    });

    return new Response(
      JSON.stringify({
        success: true,
        endpoint,
        data: data,
        fetchedAt: new Date().toISOString(),
        apiKeyUsed: successfulKey.substring(0, 10) + '...',
        authMethod: successfulMethod
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
          suggestion: 'Try setting a valid PUHEKUPLA_API_KEY secret',
          testedKeys: 'Tested multiple demo keys and authentication methods'
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
