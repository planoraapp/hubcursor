const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkHabbohubBackground() {
  try {
    console.log('🔍 Verificando background atual do habbohub...\n');

    // 1. Buscar conta do habbohub
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
    console.log('   Nome:', account.habbo_name);
    console.log('   Supabase User ID:', account.supabase_user_id);

    // 2. Buscar background atual do habbohub
    const { data: backgrounds, error: bgError } = await supabase
      .from('user_home_backgrounds')
      .select('*')
      .eq('user_id', account.supabase_user_id)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (bgError) {
      console.log('❌ Erro ao buscar background:', bgError.message);
      return;
    }

    console.log('\n📋 Background atual do habbohub:');
    if (backgrounds && backgrounds.length > 0) {
      const bg = backgrounds[0];
      console.log('   Tipo:', bg.background_type);
      console.log('   Valor:', bg.background_value);
      console.log('   Atualizado em:', bg.updated_at);
      
      // Verificar se é o background padrão ou personalizado
      if (bg.background_value === '/assets/bghabbohub.png') {
        console.log('   ⚠️  Usando background padrão do site');
      } else {
        console.log('   ✅ Usando background personalizado');
      }
    } else {
      console.log('   ❌ Nenhum background encontrado');
    }

    // 3. Verificar se há dados salvos no localStorage (simulado)
    console.log('\n🔍 Verificando se há dados salvos localmente...');
    
    // Buscar dados de layout também
    const { data: layouts, error: layoutError } = await supabase
      .from('user_home_layouts')
      .select('*')
      .eq('user_id', account.supabase_user_id)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (layoutError) {
      console.log('❌ Erro ao buscar layouts:', layoutError.message);
    } else {
      console.log('✅ Layouts encontrados:', layouts?.length || 0);
      if (layouts && layouts.length > 0) {
        console.log('   Último layout atualizado em:', layouts[0].updated_at);
      }
    }

    console.log('\n💡 Solução:');
    console.log('   O card deve exibir o background atual do canvas, não o padrão');
    console.log('   Se o usuário mudou o background, o card deve refletir essa mudança');

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

// Executar a verificação
checkHabbohubBackground();
