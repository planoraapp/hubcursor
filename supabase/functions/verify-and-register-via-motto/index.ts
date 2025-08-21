import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MottoVerificationRequest {
  habbo_name: string;
  verification_code?: string;
  password?: string;
  action: 'generate' | 'verify' | 'complete';
}

const HABBO_HOTEL_DOMAINS: Record<string, string> = {
  'br': 'habbo.com.br',
  'com': 'habbo.com',
  'es': 'habbo.es', 
  'fr': 'habbo.fr',
  'de': 'habbo.de',
  'it': 'habbo.it',
  'nl': 'habbo.nl',
  'fi': 'habbo.fi',
  'tr': 'habbo.com.tr'
};

const detectHotelFromHabboId = (habboId: string): string => {
  if (habboId.startsWith('hhbr-')) return 'br';
  if (habboId.startsWith('hhcom-') || habboId.startsWith('hhus-')) return 'com';
  if (habboId.startsWith('hhes-')) return 'es';
  if (habboId.startsWith('hhfr-')) return 'fr';
  if (habboId.startsWith('hhde-')) return 'de';
  if (habboId.startsWith('hhit-')) return 'it';
  if (habboId.startsWith('hhnl-')) return 'nl';
  if (habboId.startsWith('hhfi-')) return 'fi';
  if (habboId.startsWith('hhtr-')) return 'tr';
  return 'com';
};

const findHabboUser = async (habboName: string): Promise<{user: any, hotel: string} | null> => {
  console.log(`🔍 Searching for Habbo user: ${habboName}`);
  
  // Try each hotel domain
  for (const [hotelCode, domain] of Object.entries(HABBO_HOTEL_DOMAINS)) {
    try {
      const url = `https://www.${domain}/api/public/users?name=${encodeURIComponent(habboName)}`;
      console.log(`🌐 Trying ${hotelCode}: ${url}`);
      
      const response = await fetch(url);
      if (response.ok) {
        const userData = await response.json();
        console.log(`✅ Found user in ${hotelCode}:`, userData);
        return { user: userData, hotel: hotelCode };
      } else {
        console.log(`❌ Not found in ${hotelCode}: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error checking ${hotelCode}:`, error);
    }
  }
  
  return null;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { db: { schema: 'public' } }
    );

    const body: MottoVerificationRequest = await req.json();
    const { habbo_name, verification_code, password, action } = body;

    console.log(`🚀 Processing ${action} for ${habbo_name}`);

    if (action === 'generate') {
      // Verify that the Habbo user exists
      const habboResult = await findHabboUser(habbo_name);
      
      if (!habboResult) {
        return new Response(
          JSON.stringify({ error: 'Habbo user not found in any hotel' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate verification code
      const code = `HUB-${Math.floor(10000 + Math.random() * 90000)}`;
      
      return new Response(
        JSON.stringify({
          success: true,
          verification_code: code,
          habbo_data: habboResult.user,
          hotel: habboResult.hotel
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify') {
      if (!verification_code) {
        return new Response(
          JSON.stringify({ error: 'Verification code is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Find user and verify motto
      const habboResult = await findHabboUser(habbo_name);
      
      if (!habboResult) {
        return new Response(
          JSON.stringify({ error: 'Habbo user not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { user: habboData, hotel } = habboResult;

      // Check if motto matches verification code
      if (!habboData.motto || !habboData.motto.includes(verification_code)) {
        return new Response(
          JSON.stringify({ 
            error: 'Verification code not found in motto',
            current_motto: habboData.motto || 'Empty motto'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          habbo_data: habboData,
          hotel: hotel
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'complete') {
      if (!verification_code || !password) {
        return new Response(
          JSON.stringify({ error: 'Verification code and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify again and create account
      const habboResult = await findHabboUser(habbo_name);
      
      if (!habboResult) {
        return new Response(
          JSON.stringify({ error: 'Habbo user not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { user: habboData, hotel } = habboResult;

      // Verify motto one more time
      if (!habboData.motto || !habboData.motto.includes(verification_code)) {
        return new Response(
          JSON.stringify({ error: 'Verification code not found in motto' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const habboId = habboData.uniqueId;
      const email = `${habboId}@habbohub.com`;

      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);

      let authResult;
      if (existingUser.user) {
        // Reset password for existing user
        authResult = await supabase.auth.admin.updateUserById(
          existingUser.user.id,
          { password: password }
        );
        console.log(`🔄 Updated password for existing user: ${email}`);
      } else {
        // Create new user
        authResult = await supabase.auth.admin.createUser({
          email,
          password: password,
          email_confirm: true
        });
        console.log(`🆕 Created new user: ${email}`);
      }

      if (authResult.error) {
        throw authResult.error;
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
        });

      if (upsertError) {
        console.error('❌ Error upserting habbo account:', upsertError);
      }

      // Initialize user home and profile using existing function
      try {
        await supabase.rpc('initialize_user_home_complete', {
          user_uuid: authResult.data.user.id,
          user_habbo_name: habboData.name
        });
        console.log('✅ User home initialized');
      } catch (homeError) {
        console.error('⚠️ Error initializing user home:', homeError);
      }

      // Create session for immediate login
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email
      });

      return new Response(
        JSON.stringify({
          success: true,
          user_created: !existingUser.user,
          auth_data: authResult.data,
          login_email: email,
          login_password: password,
          habbo_data: habboData,
          hotel: hotel
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in verify-and-register-via-motto:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});