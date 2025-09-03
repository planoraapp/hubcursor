// ========================================
// EDGE FUNCTION: CREATE BEEBOP TEST ACCOUNT
// Função para criar conta de teste do Beebop com senha 290684
// ========================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('🔧 [CREATE-BEEBOP] Creating Beebop test account...');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados do Beebop via API Habbo
    console.log('🔍 Fetching Beebop data from Habbo API...');
    const response = await fetch('https://www.habbo.com.br/api/public/users?name=Beebop');
    
    if (!response.ok) {
      throw new Error('Beebop not found in Habbo API');
    }

    const beebopData = await response.json();
    console.log('✅ Beebop data found:', beebopData);

    // Criar email único
    const authEmail = `${beebopData.uniqueId}@habbohub.com`;
    const password = '290684';

    // Verificar se já existe
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(authEmail);

    let user;
    if (existingUser.user) {
      // Atualizar senha
      console.log('🔄 Updating Beebop password...');
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.user.id,
        { password }
      );
      
      if (updateError) throw updateError;
      user = updateData.user;
    } else {
      // Criar usuário
      console.log('👤 Creating Beebop user...');
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: authEmail,
        password: password,
        email_confirm: true
      });

      if (createError) throw createError;
      user = createData.user;
    }

    // Criar/atualizar habbo_accounts
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
        is_admin: true // Admin especial
      }, {
        onConflict: 'supabase_user_id'
      });

    if (habboError) throw habboError;

    return new Response(JSON.stringify({
      success: true,
      message: 'Conta Beebop configurada com sucesso!',
      auth_email: authEmail,
      password: password
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ [CREATE-BEEBOP] Error:', error);
    
    return new Response(JSON.stringify({ 
      error: `Erro: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});