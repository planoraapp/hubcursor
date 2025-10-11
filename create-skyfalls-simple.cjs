const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createSkyFallsAccount() {
  try {
    console.log('🚀 Criando conta SkyFalls...\n');

    // Dados do SkyFalls da API do Habbo
    const habboData = {
      uniqueId: 'hhbr-bddf0544e1e3feaa8241dd637046e819',
      name: 'SkyFalls',
      figureString: 'hd-208-10.ch-3030-1408.lg-275-82.sh-295-1408.ha-1020.ea-1403-64.fa-1202-72',
      motto: 'HUB-73530',
      memberSince: '2006-07-18T14:37:56.000+0000'
    };

    // Gerar UUID para supabase_user_id
    const supabaseUserId = crypto.randomUUID();
    console.log('🆔 UUID gerado:', supabaseUserId);

    // Criar entrada na tabela habbo_accounts
    console.log('📝 Criando entrada em habbo_accounts...');
    const { data: accountData, error: accountError } = await supabaseAdmin
      .from('habbo_accounts')
      .insert({
        supabase_user_id: supabaseUserId,
        habbo_name: habboData.name,
        habbo_id: habboData.uniqueId,
        hotel: 'br',
        figure_string: habboData.figureString,
        motto: habboData.motto,
        is_online: false,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (accountError) {
      console.error('❌ Erro ao criar habbo_account:', accountError);
      throw accountError;
    }

    console.log('✅ Conta criada em habbo_accounts!');

    // Criar widget profile padrão
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
        config: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (widgetError) {
      console.warn('⚠️ Erro ao criar widget:', widgetError.message);
    } else {
      console.log('✅ Widget profile criado!');
    }

    // Criar background padrão
    console.log('📝 Criando background padrão...');
    const { error: bgError } = await supabaseAdmin
      .from('user_home_backgrounds')
      .insert({
        user_id: supabaseUserId,
        background_type: 'color',
        background_value: '#87CEEB',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (bgError) {
      console.warn('⚠️ Erro ao criar background:', bgError.message);
    } else {
      console.log('✅ Background criado!');
    }

    console.log('\n🎉 CONTA SKYFALLS CRIADA COM SUCESSO!\n');
    console.log('════════════════════════════════════════');
    console.log('📊 DADOS DA CONTA:');
    console.log('════════════════════════════════════════');
    console.log(`   👤 Nome Habbo: ${habboData.name}`);
    console.log(`   🏨 Hotel: com.br`);
    console.log(`   🆔 Habbo uniqueID: ${habboData.uniqueId}`);
    console.log(`   🔑 Supabase User ID: ${supabaseUserId}`);
    console.log(`   👗 Figure: ${habboData.figureString}`);
    console.log(`   💬 Motto: ${habboData.motto}`);
    console.log('════════════════════════════════════════');
    console.log('\n✅ Você já pode acessar: http://localhost:3000/home/ptbr-SkyFalls\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createSkyFallsAccount();

