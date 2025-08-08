
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  return 'com'; // fallback
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { habboName, verificationCode, newPassword } = await req.json();

    if (!habboName || !verificationCode || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to fetch user data from Habbo API (multiple hotels)
    const hotels = ['br', 'com', 'es', 'fr', 'de'];
    let habboUser = null;

    for (const hotel of hotels) {
      try {
        const habboApiUrl = `https://www.habbo.${hotel}/api/public/users?name=${encodeURIComponent(habboName)}`;
        const response = await fetch(habboApiUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.name) {
            habboUser = data;
            console.log(`Found ${habboName} on ${hotel} hotel`);
            break;
          }
        }
      } catch (error) {
        console.log(`Failed to fetch from ${hotel}:`, error);
        continue;
      }
    }

    if (!habboUser || !habboUser.motto) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado ou perfil privado no Habbo Hotel' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the code is in the motto
    const normalizedMotto = habboUser.motto.trim().toLowerCase();
    const normalizedCode = verificationCode.trim().toLowerCase();

    if (!normalizedMotto.includes(normalizedCode)) {
      return new Response(
        JSON.stringify({ 
          error: `Código de verificação não encontrado na motto. Motto atual: "${habboUser.motto}"` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect hotel automatically
    const detectedHotel = detectHotelFromHabboId(habboUser.uniqueId);
    const authEmail = `${habboUser.uniqueId}@habbohub.com`;

    // Check if account already exists
    const { data: existingAccount, error: accountCheckError } = await supabase
      .from('habbo_accounts')
      .select('supabase_user_id, habbo_name')
      .eq('habbo_id', habboUser.uniqueId)
      .single();

    if (accountCheckError && accountCheckError.code !== 'PGRST116') {
      console.error('Error checking existing account:', accountCheckError);
      throw accountCheckError;
    }

    let userId: string;
    let isNewUser = false;

    if (existingAccount) {
      // User exists - reset password
      console.log(`Resetting password for existing user: ${habboName}`);
      
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingAccount.supabase_user_id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Password update error:', updateError);
        throw new Error('Erro ao atualizar senha');
      }

      userId = existingAccount.supabase_user_id;
    } else {
      // New user - create account
      console.log(`Creating new account for: ${habboName}`);
      isNewUser = true;
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: authEmail,
        password: newPassword,
        user_metadata: { 
          habbo_name: habboName,
          hotel: detectedHotel
        },
        email_confirm: true
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      userId = authData.user.id;

      // Determine if is admin
      const isAdmin = ['beebop', 'habbohub'].includes(habboName.toLowerCase());

      // Create habbo_accounts record
      const { error: accountError } = await supabase
        .from('habbo_accounts')
        .insert({
          habbo_id: habboUser.uniqueId,
          habbo_name: habboName,
          supabase_user_id: userId,
          hotel: detectedHotel,
          is_admin: isAdmin
        });

      if (accountError) {
        console.error('Account creation error:', accountError);
        // Try to clean up the auth user
        await supabase.auth.admin.deleteUser(userId);
        throw accountError;
      }

      // Initialize user home
      const { error: homeError } = await supabase.rpc('ensure_user_home_exists', { 
        user_uuid: userId 
      });
      
      if (homeError) {
        console.warn('Home initialization failed (non-critical):', homeError);
      }
    }

    const message = isNewUser 
      ? `Conta criada com sucesso para ${habboName}! Agora você pode fazer login com sua senha.`
      : `Senha atualizada com sucesso para ${habboName}! Use a nova senha para fazer login.`;

    console.log(`Success: ${message}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message,
        isNewUser
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in register-or-reset-via-motto function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
