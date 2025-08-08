
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Initialize Supabase client with service role key for password reset
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the habbo account
    const { data: habboAccount, error: habboError } = await supabase
      .from('habbo_accounts')
      .select('habbo_id, supabase_user_id')
      .ilike('habbo_name', habboName)
      .single();

    if (habboError || !habboAccount) {
      console.log('Habbo account not found:', habboError);
      return new Response(
        JSON.stringify({ error: 'Conta não encontrada. Use "Primeiro Acesso" para se cadastrar.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Update the user's password using admin privileges
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      habboAccount.supabase_user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar senha. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Password reset successful for ${habboName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Senha atualizada com sucesso! Agora você pode fazer login com a nova senha.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in reset-password-via-motto function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
