
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
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'furni';
    const page = url.searchParams.get('page') || '1';
    const category = url.searchParams.get('category') || '';
    const search = url.searchParams.get('search') || '';
    
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

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'HabboHub-Editor/1.0',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ [PuhekuplaProxy] Success for ${endpoint}, items:`, data.result?.furni?.length || data.result?.badges?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        endpoint,
        data: data,
        fetchedAt: new Date().toISOString()
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
