import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { db: { schema: 'public' } }
    )

    console.log('🔄 Iniciando sincronização de usuários com auth.users...');

    // Buscar todos os usuários em habbo_accounts
    const { data: habboAccounts, error: fetchError } = await supabase
      .from('habbo_accounts')
      .select('*');

    if (fetchError) {
      console.error('❌ Erro ao buscar usuários:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar usuários', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Encontrados ${habboAccounts?.length || 0} usuários em habbo_accounts`);

    const results = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: []
    };

    for (const account of habboAccounts || []) {
      try {
        results.processed++;
        console.log(`🔄 Processando: ${account.habbo_name} (ID: ${account.id})`);

        // Verificar se já existe um usuário auth.users com este ID
        const { data: existingAuthUser, error: authCheckError } = await supabase.auth.admin.getUserById(account.supabase_user_id);
        
        if (authCheckError && authCheckError.message.includes('User not found')) {
          // Usuário não existe em auth.users, criar um
          console.log(`➕ Criando usuário auth para: ${account.habbo_name}`);
          
          const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
            user_id: account.supabase_user_id,
            email: `${account.habbo_name.toLowerCase()}@habbohub.local`, // Email fictício
            email_confirm: true,
            user_metadata: {
              habbo_name: account.habbo_name,
              habbo_id: account.habbo_id,
              hotel: account.hotel,
              figure_string: account.figure_string,
              motto: account.motto,
              is_admin: account.is_admin
            }
          });

          if (createError) {
            console.error(`❌ Erro ao criar usuário auth para ${account.habbo_name}:`, createError);
            results.errors.push({
              user: account.habbo_name,
              error: createError.message
            });
          } else {
            console.log(`✅ Usuário auth criado para: ${account.habbo_name}`);
            results.created++;
          }
        } else if (authCheckError) {
          console.error(`❌ Erro ao verificar usuário auth para ${account.habbo_name}:`, authCheckError);
          results.errors.push({
            user: account.habbo_name,
            error: authCheckError.message
          });
        } else {
          console.log(`✅ Usuário auth já existe para: ${account.habbo_name}`);
          results.updated++;
        }

      } catch (error) {
        console.error(`❌ Erro geral ao processar ${account.habbo_name}:`, error);
        results.errors.push({
          user: account.habbo_name,
          error: error.message
        });
      }
    }

    console.log('🎉 Sincronização concluída!');
    console.log(`📊 Resultados:`, results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sincronização concluída',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
