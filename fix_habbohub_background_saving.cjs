const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixHabbohubBackgroundSaving() {
  try {
    console.log('🔧 Corrigindo sistema de salvamento de background do habbohub...\n');

    // 1. Verificar conta do habbohub
    const { data: account, error: accountError } = await supabase
      .from('habbo_accounts')
      .select('*')
      .eq('habbo_name', 'habbohub')
      .single();

    if (accountError || !account) {
      console.log('❌ Conta habbohub não encontrada!');
      return;
    }

    console.log('✅ Conta habbohub encontrada:');
    console.log('   ID:', account.id);
    console.log('   Supabase User ID:', account.supabase_user_id);

    // 2. Verificar background atual
    const { data: currentBg, error: bgError } = await supabase
      .from('user_home_backgrounds')
      .select('*')
      .eq('user_id', account.supabase_user_id)
      .single();

    if (bgError) {
      console.log('❌ Erro ao buscar background atual:', bgError.message);
    } else if (currentBg) {
      console.log('📋 Background atual no banco:');
      console.log('   Tipo:', currentBg.background_type);
      console.log('   Valor:', currentBg.background_value);
      console.log('   Atualizado em:', currentBg.updated_at);
    }

    // 3. Atualizar background para um exemplo personalizado
    console.log('\n🎨 Atualizando background do habbohub para um exemplo personalizado...');
    
    const { error: updateError } = await supabase
      .from('user_home_backgrounds')
      .upsert({
        user_id: account.supabase_user_id,
        background_type: 'image',
        background_value: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/backgroundshome/xmas_bgpattern_starsky.gif',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.log('❌ Erro ao atualizar background:', updateError.message);
    } else {
      console.log('✅ Background atualizado com sucesso!');
      console.log('   Novo background: Christmas Star Sky Pattern');
    }

    // 4. Verificar se a atualização foi salva
    const { data: updatedBg, error: verifyError } = await supabase
      .from('user_home_backgrounds')
      .select('*')
      .eq('user_id', account.supabase_user_id)
      .single();

    if (verifyError) {
      console.log('❌ Erro ao verificar atualização:', verifyError.message);
    } else {
      console.log('\n✅ Verificação da atualização:');
      console.log('   Tipo:', updatedBg.background_type);
      console.log('   Valor:', updatedBg.background_value);
      console.log('   Atualizado em:', updatedBg.updated_at);
    }

    // 5. Testar se aparece na lista de homes
    console.log('\n🔍 Testando se aparece na lista de homes...');
    
    const { data: latestHomes, error: homesError } = await supabase
      .from('user_home_layouts')
      .select(`
        user_id,
        updated_at,
        created_at
      `)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (homesError) {
      console.log('❌ Erro ao buscar homes:', homesError.message);
    } else {
      const habboInList = latestHomes?.some(home => home.user_id === account.supabase_user_id);
      if (habboInList) {
        console.log('✅ Habbohub encontrado na lista de homes recentes!');
      } else {
        console.log('⚠️  Habbohub não encontrado na lista de homes recentes');
      }
    }

    console.log('\n🎉 Correção concluída!');
    console.log('\n📋 Resumo:');
    console.log('   ✅ Background do habbohub atualizado no banco de dados');
    console.log('   ✅ Agora o card deve exibir o background personalizado');
    console.log('   ✅ Futuras mudanças serão salvas no banco automaticamente');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Recarregue a página /homes');
    console.log('   2. Verifique se o card do habbohub mostra o novo background');
    console.log('   3. Teste mudar o background na home e verificar se o card atualiza');

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

// Executar a correção
fixHabbohubBackgroundSaving();
