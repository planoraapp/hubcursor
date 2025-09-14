// ========================================
// EDGE FUNCTION: CREATE HABBOHUB ADMIN ACCOUNT
// Função para criar conta admin do habbohub
// ========================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('🔧 [CREATE-HABBOHUB] Creating habbohub admin account...');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Buscar dados do habbohub via API Habbo
    console.log('🔍 Fetching habbohub data from Habbo API...');
    const response = await fetch('https://www.habbo.com.br/api/public/users?name=habbohub');
    
    if (!response.ok) {
      throw new Error('habbohub not found in Habbo API');
    }

    const habbohubData = await response.json();
    console.log('✅ habbohub data found:', habbohubData);

    // 2. Criar email e senha
    const authEmail = 'hhbr-habbohub@habbohub.com';
    const password = '151092';
    const userId = 'hhbr-habbohub-user-id-12345';

    // 3. Verificar se já existe
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(authEmail);

    let user;
    if (existingUser.user) {
      // Atualizar senha
      console.log('🔄 Updating habbohub password...');
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.user.id,
        { password }
      );
      
      if (updateError) throw updateError;
      user = updateData.user;
    } else {
      // Criar usuário
      console.log('👤 Creating habbohub user...');
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        id: userId,
        email: authEmail,
        password: password,
        email_confirm: true
      });

      if (createError) throw createError;
      user = createData.user;
    }

    // 4. Criar/atualizar habbo_accounts
    const { error: habboError } = await supabase
      .from('habbo_accounts')
      .upsert({
        supabase_user_id: user.id,
        habbo_name: 'habbohub',
        habbo_id: habbohubData.uniqueId,
        hotel: 'br',
        figure_string: habbohubData.figureString,
        motto: habbohubData.motto,
        is_online: false,
        is_admin: true
      }, {
        onConflict: 'habbo_name,hotel'
      });

    if (habboError) throw habboError;

    return new Response(JSON.stringify({
      success: true,
      message: 'Conta habbohub configurada com sucesso!',
      auth_email: authEmail,
      password: password
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ [CREATE-HABBOHUB] Error:', error);
    
    return new Response(JSON.stringify({ 
      error: `Erro: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
