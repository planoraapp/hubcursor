
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

    console.log(`Processing registration/reset for ${habbo_name} from hotel ${hotel}`)

    // Generate 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`Generated verification code: ${verificationCode}`)

    // Get Habbo user data
    const hotelDomain = hotel === 'br' ? 'com.br' : hotel
    const habboApiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(habbo_name)}`
    console.log(`Fetching Habbo data from: ${habboApiUrl}`)
    const habboResponse = await fetch(habboApiUrl)
    
    if (!habboResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Habbo user not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const habboData = await habboResponse.json()
    const habboId = habboData.uniqueId
    const email = `${habboId}@habbohub.com`

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email)

    let authResult
    if (existingUser.user) {
      // Reset password for existing user
      authResult = await supabase.auth.admin.updateUserById(
        existingUser.user.id,
        { password: verificationCode }
      )
      console.log(`Password reset for existing user: ${email}`)
    } else {
      // Create new user
      authResult = await supabase.auth.admin.createUser({
        email,
        password: verificationCode,
        email_confirm: true
      })
      console.log(`Created new user: ${email}`)
    }

    if (authResult.error) {
      throw authResult.error
    }

    // Store/update habbo account info
    const { error: upsertError } = await supabase
      .from('habbo_accounts')
      .upsert({
        supabase_user_id: authResult.data.user.id,
        habbo_name: habboData.name,
        habbo_id: habboId,
        hotel: hotel,
        figure_string: habboData.figureString,
        motto: habboData.motto
      }, {
        onConflict: 'supabase_user_id'
      })

    if (upsertError) {
      console.error('Error upserting habbo account:', upsertError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        verification_code: verificationCode,
        action: existingUser.user ? 'reset' : 'register'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in register-or-reset-via-motto:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
