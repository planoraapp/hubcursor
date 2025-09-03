// ========================================
// SETUP BEEBOP ADMIN ACCOUNT
// Função para configurar Beebop como administrador
// ========================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🔧 [SETUP-BEEBOP] Starting Beebop admin setup...');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Fetch Beebop from Habbo API
    console.log('🔍 Fetching Beebop from Habbo API...');
    const habboResponse = await fetch('https://www.habbo.com.br/api/public/users?name=Beebop');
    
    if (!habboResponse.ok) {
      throw new Error('Beebop not found on Habbo.com.br');
    }

    const beebopData = await habboResponse.json();
    console.log('✅ Beebop found:', beebopData);

    // 2. Create Supabase user with specific credentials
    const authEmail = `${beebopData.uniqueId}@habbohub.com`;
    const password = '290684';

    console.log('👤 Creating/updating Supabase user for Beebop...');

    // Check if user exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(authEmail);
    
    let user;
    if (existingUser.user) {
      // Update password
      const { data: updateResult, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.user.id,
        { password }
      );
      if (updateError) throw updateError;
      user = updateResult.user;
    } else {
      // Create new user
      const { data: createResult, error: createError } = await supabase.auth.admin.createUser({
        email: authEmail,
        password: password,
        email_confirm: true
      });
      if (createError) throw createError;
      user = createResult.user;
    }

    // 3. Create/update habbo_accounts with admin privileges
    console.log('💾 Creating habbo_accounts record with admin privileges...');
    
    const { error: habboError } = await supabase
      .from('habbo_accounts')
      .upsert({
        supabase_user_id: user.id,
        habbo_name: 'Beebop',
        habbo_id: beebopData.uniqueId,
        hotel: 'br',
        figure_string: beebopData.figureString,
        motto: beebopData.motto,
        is_online: beebopData.online,
        is_admin: true // ADMIN PRIVILEGES FOR BEEBOP
      }, {
        onConflict: 'supabase_user_id'
      });

    if (habboError) {
      console.error('❌ Error creating habbo_accounts:', habboError);
      throw habboError;
    }

    console.log('✅ Beebop admin account setup completed!');

    return new Response(JSON.stringify({
      success: true,
      message: 'Beebop configurado como administrador!',
      credentials: {
        email: authEmail,
        password: password,
        habbo_name: 'Beebop'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ [SETUP-BEEBOP] Error:', error);
    
    return new Response(JSON.stringify({ 
      error: `Erro: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});