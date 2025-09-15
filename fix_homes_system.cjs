const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixHomesSystem() {
  try {
    console.log('🔧 Iniciando correção do sistema de homes...\n');

    // 1. Verificar se a conta habbohub existe
    console.log('1. Verificando conta habbohub...');
    const { data: habboAccount, error: accountError } = await supabase
      .from('habbo_accounts')
      .select('*')
      .eq('habbo_name', 'habbohub')
      .single();

    if (accountError || !habboAccount) {
      console.log('❌ Conta habbohub não encontrada!');
      return;
    }

    console.log('✅ Conta habbohub encontrada:', habboAccount.habbo_name);
    console.log('   ID:', habboAccount.id);
    console.log('   Supabase User ID:', habboAccount.supabase_user_id);

    // 2. Verificar/criar tabelas necessárias para homes
    console.log('\n2. Verificando tabelas de homes...');

    // Verificar se user_home_layouts existe e tem dados
    const { data: layouts, error: layoutsError } = await supabase
      .from('user_home_layouts')
      .select('*')
      .eq('user_id', habboAccount.supabase_user_id);

    if (layoutsError) {
      console.log('⚠️  Tabela user_home_layouts não existe ou erro:', layoutsError.message);
    } else {
      console.log('✅ Tabela user_home_layouts existe');
      console.log('   Registros encontrados:', layouts?.length || 0);
    }

    // Verificar se user_home_backgrounds existe e tem dados
    const { data: backgrounds, error: backgroundsError } = await supabase
      .from('user_home_backgrounds')
      .select('*')
      .eq('user_id', habboAccount.supabase_user_id);

    if (backgroundsError) {
      console.log('⚠️  Tabela user_home_backgrounds não existe ou erro:', backgroundsError.message);
    } else {
      console.log('✅ Tabela user_home_backgrounds existe');
      console.log('   Registros encontrados:', backgrounds?.length || 0);
    }

    // 3. Criar dados de exemplo para habbohub se não existirem
    console.log('\n3. Criando dados de exemplo para habbohub...');

    // Criar layout básico se não existir
    if (!layouts || layouts.length === 0) {
      console.log('   Criando layout básico...');
      const { error: layoutError } = await supabase
        .from('user_home_layouts')
        .insert({
          user_id: habboAccount.supabase_user_id,
          widget_id: 'profile',
          x: 20,
          y: 20,
          z_index: 1,
          width: 350,
          height: 180,
          is_visible: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (layoutError) {
        console.log('❌ Erro ao criar layout:', layoutError.message);
      } else {
        console.log('✅ Layout básico criado');
      }
    }

    // Criar background básico se não existir
    if (!backgrounds || backgrounds.length === 0) {
      console.log('   Criando background básico...');
      const { error: backgroundError } = await supabase
        .from('user_home_backgrounds')
        .insert({
          user_id: habboAccount.supabase_user_id,
          background_type: 'image',
          background_value: '/assets/bghabbohub.png',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (backgroundError) {
        console.log('❌ Erro ao criar background:', backgroundError.message);
      } else {
        console.log('✅ Background básico criado');
      }
    }

    // 4. Verificar se as homes aparecem na busca
    console.log('\n4. Testando busca de homes...');

    // Testar busca de homes mais recentes
    const { data: latestHomes, error: latestError } = await supabase
      .from('user_home_layouts')
      .select(`
        user_id,
        updated_at,
        created_at
      `)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (latestError) {
      console.log('❌ Erro ao buscar homes recentes:', latestError.message);
    } else {
      console.log('✅ Homes recentes encontradas:', latestHomes?.length || 0);
      if (latestHomes && latestHomes.length > 0) {
        console.log('   Primeira home:', latestHomes[0]);
      }
    }

    // 5. Verificar se habbohub aparece nas homes
    console.log('\n5. Verificando se habbohub aparece nas homes...');

    const { data: habboHomes, error: habboHomesError } = await supabase
      .from('user_home_layouts')
      .select(`
        user_id,
        updated_at,
        created_at
      `)
      .eq('user_id', habboAccount.supabase_user_id);

    if (habboHomesError) {
      console.log('❌ Erro ao buscar homes do habbohub:', habboHomesError.message);
    } else {
      console.log('✅ Homes do habbohub encontradas:', habboHomes?.length || 0);
      if (habboHomes && habboHomes.length > 0) {
        console.log('   Home do habbohub:', habboHomes[0]);
      }
    }

    console.log('\n🎉 Correção do sistema de homes concluída!');
    console.log('\n📋 Resumo:');
    console.log('   - Conta habbohub verificada');
    console.log('   - Tabelas de homes verificadas');
    console.log('   - Dados de exemplo criados se necessário');
    console.log('   - Sistema de busca testado');

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

// Executar a correção
fixHomesSystem();
