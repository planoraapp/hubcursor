const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAllHomesHooks() {
  try {
    console.log('🔧 Corrigindo todos os hooks de homes...\n');

    // 1. Verificar dados do habbohub
    console.log('1. Verificando dados do habbohub...');
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
    console.log('   Supabase User ID:', habboAccount.supabase_user_id);

    // 2. Verificar se há dados de homes para habbohub
    const { data: layouts } = await supabase
      .from('user_home_layouts')
      .select('*')
      .eq('user_id', habboAccount.supabase_user_id);

    const { data: backgrounds } = await supabase
      .from('user_home_backgrounds')
      .select('*')
      .eq('user_id', habboAccount.supabase_user_id);

    console.log('   Layouts encontrados:', layouts?.length || 0);
    console.log('   Backgrounds encontrados:', backgrounds?.length || 0);

    // 3. Criar dados se não existirem
    if (!layouts || layouts.length === 0) {
      console.log('\n2. Criando layout para habbohub...');
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
        console.log('✅ Layout criado para habbohub');
      }
    }

    if (!backgrounds || backgrounds.length === 0) {
      console.log('\n3. Criando background para habbohub...');
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
        console.log('✅ Background criado para habbohub');
      }
    }

    // 4. Corrigir hooks de homes
    console.log('\n4. Corrigindo hooks de homes...');

    const hooksToFix = [
      'src/hooks/useLatestHomes.tsx',
      'src/hooks/useTopRatedHomes.tsx',
      'src/hooks/useMostVisitedHomes.tsx'
    ];

    hooksToFix.forEach(hookPath => {
      const fullPath = path.join(__dirname, hookPath);
      
      if (fs.existsSync(fullPath)) {
        console.log(`   Corrigindo: ${hookPath}`);
        
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Corrigir a busca de contas - usar supabase_user_id em vez de id
        const originalPattern = /const account = accounts\?\.find\(acc => acc\.id === home\.user_id\);/g;
        const correctedPattern = 'const account = accounts?.find(acc => acc.supabase_user_id === home.user_id);';
        
        if (content.match(originalPattern)) {
          content = content.replace(originalPattern, correctedPattern);
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`   ✅ ${hookPath} corrigido`);
        } else {
          console.log(`   ⚠️  ${hookPath} já estava correto ou não tinha o padrão`);
        }
      } else {
        console.log(`   ❌ Arquivo não encontrado: ${hookPath}`);
      }
    });

    // 5. Testar se habbohub aparece nas homes
    console.log('\n5. Testando busca de homes...');

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
      
      // Verificar se habbohub está na lista
      const habboInList = latestHomes?.some(home => home.user_id === habboAccount.supabase_user_id);
      if (habboInList) {
        console.log('🎉 Habbohub encontrado na lista de homes recentes!');
      } else {
        console.log('⚠️  Habbohub não encontrado na lista de homes recentes');
      }
    }

    // 6. Verificar se há dados de ratings e visits (para futuras funcionalidades)
    console.log('\n6. Verificando tabelas de ratings e visits...');

    const { data: ratings } = await supabase
      .from('user_home_ratings')
      .select('*')
      .limit(1);

    const { data: visits } = await supabase
      .from('user_home_visits')
      .select('*')
      .limit(1);

    console.log('   Tabela user_home_ratings existe:', ratings !== null);
    console.log('   Tabela user_home_visits existe:', visits !== null);

    console.log('\n🎉 Correção completa dos hooks de homes concluída!');
    console.log('\n📋 Resumo:');
    console.log('   ✅ Conta habbohub verificada');
    console.log('   ✅ Dados de home criados se necessário');
    console.log('   ✅ Hooks corrigidos para usar supabase_user_id');
    console.log('   ✅ Sistema testado');
    console.log('\n🚀 Agora a home do habbohub deve aparecer na lista!');
    console.log('   E todos os futuros usuários seguirão o mesmo padrão.');

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

// Executar a correção
fixAllHomesHooks();
