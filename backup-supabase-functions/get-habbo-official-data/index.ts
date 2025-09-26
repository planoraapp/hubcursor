
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        db: { schema: 'public' }
      }
    )

    const { habbo_name, hotel = 'br' } = await req.json()
    
    if (!habbo_name) {
      return new Response(
        JSON.stringify({ error: 'habbo_name is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Fetching official data for ${habbo_name} from hotel ${hotel}`)

    const habboApiUrl = `https://www.habbo.${hotel}/api/public/users?name=${encodeURIComponent(habbo_name)}`
    
    const response = await fetch(habboApiUrl, {
      headers: {
        'User-Agent': 'HabboHub/1.0',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`Habbo API error: ${response.status} ${response.statusText}`)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from Habbo API' }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await response.json()
    console.log(`Successfully fetched data for ${habbo_name}`)

    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in get-habbo-official-data:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
