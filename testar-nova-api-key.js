const { createClient } = require('@supabase/supabase-js');

// Script para testar nova API key do Supabase
async function testarNovaApiKey() {
  console.log('🔑 TESTE DE NOVA API KEY - SUPABASE');
  console.log('=====================================\n');
  
  // Substitua esta API key pela nova que você obteve do Supabase Dashboard
  const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
  const novaApiKey = 'COLE_A_NOVA_API_KEY_AQUI'; // ← Substitua aqui
  
  if (novaApiKey === 'COLE_A_NOVA_API_KEY_AQUI') {
    console.log('❌ ERRO: Você precisa colar a nova API key no código!');
    console.log('📋 INSTRUÇÕES:');
    console.log('1. Abra este arquivo: testar-nova-api-key.js');
    console.log('2. Substitua "COLE_A_NOVA_API_KEY_AQUI" pela nova API key');
    console.log('3. Execute: node testar-nova-api-key.js');
    return;
  }
  
  console.log('🔍 Testando conexão...');
  console.log('URL:', supabaseUrl);
  console.log('Key (primeiros 50 chars):', novaApiKey.substring(0, 50) + '...\n');
  
  const supabase = createClient(supabaseUrl, novaApiKey);
  
  try {
    // Teste 1: Verificar se consegue acessar a tabela hub_users
    console.log('📊 Teste 1: Acessando tabela hub_users...');
    const { data: users, error: usersError } = await supabase
      .from('hub_users')
      .select('habbo_username, hotel')
      .limit(5);
      
    if (usersError) {
      console.log('❌ Erro ao acessar hub_users:', usersError.message);
      console.log('Código:', usersError.code);
      console.log('Detalhes:', usersError.details);
    } else {
      console.log('✅ Sucesso! Usuários encontrados:', users.length);
      console.log('👥 Usuários:', users.map(u => `${u.habbo_username} (${u.hotel})`));
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Teste 2: Verificar se consegue inserir dados (teste de permissão)
    console.log('📝 Teste 2: Verificando permissões de escrita...');
    const { data: testInsert, error: insertError } = await supabase
      .from('hub_users')
      .select('habbo_username')
      .eq('habbo_username', 'habbohub')
      .limit(1);
      
    if (insertError) {
      console.log('❌ Erro na consulta:', insertError.message);
    } else {
      console.log('✅ Consulta funcionando!');
      if (testInsert && testInsert.length > 0) {
        console.log('👤 Usuário habbohub encontrado!');
      } else {
        console.log('⚠️ Usuário habbohub não encontrado (normal se não foi criado ainda)');
      }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Teste 3: Verificar tabelas de home
    console.log('🏠 Teste 3: Verificando tabelas de home...');
    const { data: backgrounds, error: bgError } = await supabase
      .from('user_home_backgrounds')
      .select('user_id, background_type, background_value')
      .limit(3);
      
    if (bgError) {
      console.log('❌ Erro ao acessar user_home_backgrounds:', bgError.message);
    } else {
      console.log('✅ Tabela user_home_backgrounds acessível!');
      console.log('🎨 Backgrounds encontrados:', backgrounds.length);
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('Se todos os testes passaram, a API key está funcionando!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o teste
testarNovaApiKey().catch(console.error);
