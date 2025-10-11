const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createSkyFallsAccount() {
  try {
    console.log('🚀 Criando conta SkyFalls...');

    // Dados do SkyFalls da API do Habbo
    const habboData = {
      uniqueId: 'hhbr-bddf0544e1e3feaa8241dd637046e819',
      name: 'SkyFalls',
      figureString: 'hd-208-10.ch-3030-1408.lg-275-82.sh-295-1408.ha-1020.ea-1403-64.fa-1202-72',
      motto: 'HUB-73530',
      memberSince: '2006-07-18T14:37:56.000+0000'
    };

    // 1. Verificar se usuário já existe no Auth
    console.log('🔍 Verificando se usuário já existe...');
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let supabaseUserId = existingUsers?.users?.find(u => u.email === `${habboData.uniqueId}@habbohub.com`)?.id;

    if (supabaseUserId) {
      console.log('✅ Usuário Auth já existe:', supabaseUserId);
    } else {
      // Criar usuário no Supabase Auth
      console.log('📝 Criando usuário no Supabase Auth...');
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: `${habboData.uniqueId}@habbohub.com`,
        password: 'HabboHub2024!',  // Senha padrão
        email_confirm: true,
        user_metadata: {
          habbo_name: habboData.name,
          habbo_id: habboData.uniqueId,
          hotel: 'com.br'
        }
      });

      if (authError) {
        console.error('❌ Erro ao criar auth:', authError.message);
        throw authError;
      }

      supabaseUserId = authData?.user?.id;
      if (!supabaseUserId) {
        throw new Error('Não foi possível obter supabase_user_id');
      }

      console.log('✅ Usuário Auth criado:', supabaseUserId);
    }

    // 2. Criar entrada na tabela habbo_accounts
    console.log('📝 Criando entrada em habbo_accounts...');
    const { data: accountData, error: accountError } = await supabaseAdmin
      .from('habbo_accounts')
      .upsert({
        supabase_user_id: supabaseUserId,
        habbo_name: habboData.name,
        habbo_id: habboData.uniqueId,
        hotel: 'com.br',
        figure_string: habboData.figureString,
        motto: habboData.motto,
        is_online: false,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'supabase_user_id'
      })
      .select()
      .single();

    if (accountError) {
      console.error('❌ Erro ao criar habbo_account:', accountError);
      throw accountError;
    }

    console.log('✅ Conta criada em habbo_accounts!');

    // 3. Criar widgets padrão para a home
    console.log('📝 Criando widget profile padrão...');
    const { error: widgetError } = await supabaseAdmin
      .from('user_home_widgets')
      .insert({
        user_id: supabaseUserId,
        widget_type: 'profile',
        x: 20,
        y: 20,
        z_index: 1,
        width: 350,
        height: 180,
        is_visible: true,
        config: {}
      });

    if (widgetError) {
      console.warn('⚠️ Widget já existe ou erro:', widgetError.message);
    } else {
      console.log('✅ Widget profile criado!');
    }

    // 4. Criar background padrão
    console.log('📝 Criando background padrão...');
    const { error: bgError } = await supabaseAdmin
      .from('user_home_backgrounds')
      .upsert({
        user_id: supabaseUserId,
        background_type: 'color',
        background_value: '#87CEEB',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (bgError) {
      console.warn('⚠️ Background já existe ou erro:', bgError.message);
    } else {
      console.log('✅ Background criado!');
    }

    console.log('\n🎉 CONTA SKYFALLS CRIADA COM SUCESSO!\n');
    console.log('📊 Dados da conta:');
    console.log(`   Nome: ${habboData.name}`);
    console.log(`   Hotel: com.br`);
    console.log(`   UniqueID: ${habboData.uniqueId}`);
    console.log(`   Supabase User ID: ${supabaseUserId}`);
    console.log(`   Email: ${habboData.uniqueId}@habbohub.com`);
    console.log(`   Senha: HabboHub2024!`);
    console.log('\n✅ Você já pode acessar /home/ptbr-SkyFalls!\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    process.exit(1);
  }
}

createSkyFallsAccount();

