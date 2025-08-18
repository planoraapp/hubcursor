
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HabboAPIResponse {
  name: string;
  figureString: string;
  motto: string;
  memberSince: string;
  profileVisible: boolean;
  selectedBadges: Array<{
    badgeIndex: number;
    code: string;
    name: string;
    description: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { habboName, verificationCode, newPassword, hotel = 'br' } = await req.json();

    console.log(`🔍 [RegisterOrReset] Processing request for: ${habboName} on hotel: ${hotel} with code: ${verificationCode}`);

    if (!habboName || !verificationCode || !newPassword) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Nome Habbo, código de verificação e nova senha são obrigatórios'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return new Response(JSON.stringify({
        success: false,
        error: 'A senha deve ter pelo menos 6 caracteres'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate verification code format
    if (!verificationCode.match(/^HUB-[A-Z0-9]{5}$/)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Código de verificação inválido. Use o formato HUB-XXXXX'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Step 1: Fetch user from Habbo API
    const hotelDomain = hotel === 'br' ? 'com.br' : 'com';
    const habboApiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(habboName)}`;
    
    console.log(`🌐 [RegisterOrReset] Fetching from: ${habboApiUrl}`);
    
    const habboResponse = await fetch(habboApiUrl);
    
    if (!habboResponse.ok) {
      console.error(`❌ [RegisterOrReset] Habbo API error: ${habboResponse.status}`);
      return new Response(JSON.stringify({
        success: false,
        error: 'Usuário não encontrado no Habbo Hotel'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const habboData: HabboAPIResponse = await habboResponse.json();
    console.log(`✅ [RegisterOrReset] Found user: ${habboData.name}, motto: "${habboData.motto}"`);

    // Step 2: Check motto for verification code
    const motto = habboData.motto || '';
    
    if (!motto.includes(verificationCode)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Código ${verificationCode} não encontrado na sua missão. Missão atual: "${motto}". Altere sua missão no Habbo para incluir: ${verificationCode}`,
        requiresMottoChange: true,
        currentMotto: motto,
        expectedCode: verificationCode
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔑 [RegisterOrReset] Verification code found in motto`);

    // Step 3: Extract Habbo ID from figureString or use name-based ID
    const extractHabboId = (figureString: string, name: string, hotel: string): string => {
      // For most hotels, we can create a deterministic ID
      const prefix = hotel === 'br' ? 'hhbr-' : 'hhcom-';
      
      // Create a simple hash from the name for consistent ID generation
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        const char = name.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      // Use absolute value and convert to hex for a clean ID
      const hashHex = Math.abs(hash).toString(16);
      return `${prefix}${hashHex}`;
    };

    const habboId = extractHabboId(habboData.figureString, habboData.name, hotel);
    const authEmail = `${habboId}@habbohub.com`;

    console.log(`🆔 [RegisterOrReset] Generated ID: ${habboId}, Email: ${authEmail}`);

    // Step 4: Check if account exists
    const { data: existingAccount } = await supabase
      .from('habbo_accounts')
      .select('*')
      .eq('habbo_id', habboId)
      .single();

    let authResult;
    let isNewAccount = false;

    if (existingAccount) {
      // Account exists - reset password
      console.log(`🔄 [RegisterOrReset] Resetting password for existing account`);
      
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingAccount.supabase_user_id,
        { password: newPassword }
      );

      if (updateError) {
        console.error(`❌ [RegisterOrReset] Password reset error:`, updateError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Erro ao redefinir senha'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      authResult = updateData;
    } else {
      // New account - create user
      console.log(`➕ [RegisterOrReset] Creating new account`);
      isNewAccount = true;
      
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: authEmail,
        password: newPassword,
        email_confirm: true
      });

      if (createError) {
        console.error(`❌ [RegisterOrReset] Account creation error:`, createError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Erro ao criar conta'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      authResult = createData;

      // Create habbo_accounts record
      const { error: accountError } = await supabase
        .from('habbo_accounts')
        .insert({
          supabase_user_id: createData.user.id,
          habbo_name: habboData.name,
          habbo_id: habboId,
          hotel: hotel,
          figure_string: habboData.figureString,
          motto: habboData.motto
        });

      if (accountError) {
        console.error(`❌ [RegisterOrReset] Habbo account creation error:`, accountError);
        // Try to clean up the auth user
        await supabase.auth.admin.deleteUser(createData.user.id);
        
        return new Response(JSON.stringify({
          success: false,
          error: 'Erro ao vincular conta Habbo'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Initialize user's home
      try {
        const { error: homeError } = await supabase.rpc('ensure_user_home_exists', {
          user_uuid: createData.user.id
        });

        if (homeError) {
          console.error(`❌ [RegisterOrReset] Home initialization error:`, homeError);
        } else {
          console.log(`🏠 [RegisterOrReset] User home initialized`);
        }
      } catch (homeInitError) {
        console.error(`❌ [RegisterOrReset] Home initialization error:`, homeInitError);
      }

      console.log(`✅ [RegisterOrReset] Habbo account linked successfully`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: isNewAccount ? 'Conta criada com sucesso!' : 'Senha redefinida com sucesso!',
      isNewAccount,
      habboName: habboData.name,
      authEmail
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [RegisterOrReset] Unexpected error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
