import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const hotel = url.searchParams.get('hotel') || 'com.br'
    
    console.log(`🌐 [HabboFigureData] Fetching data for hotel: ${hotel}`)
    
    // Fetch from official Habbo API
    const response = await fetch(`https://www.habbo.${hotel}/gamedata/figuredata/1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/xml,application/xml,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const xmlData = await response.text()
    
    console.log(`✅ [HabboFigureData] Successfully fetched ${xmlData.length} characters of XML data`)
    
    return new Response(xmlData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
    
  } catch (error) {
    console.error('❌ [HabboFigureData] Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch figure data',
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
