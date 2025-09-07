const { createClient } = require('@supabase/supabase-js');

// SUBSTITUA ESTA CHAVE PELA API KEY CORRETA DO SUPABASE
const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_KEY = 'COLE_A_API_KEY_AQUI'; // ← Substitua aqui

async function testarApiKey() {
  console.log('🔍 TESTE DE API KEY - SUPABASE');
  console.log('==============================\n');
  
  if (SUPABASE_KEY === 'COLE_A_API_KEY_AQUI') {
    console.log('❌ ERRO: Você precisa colar a API key correta!');
    console.log('📋 INSTRUÇÕES:');
    console.log('1. Abra este arquivo: testar-api-key-simples.cjs');
    console.log('2. Substitua "COLE_A_API_KEY_AQUI" pela API key do Supabase');
    console.log('3. A API key deve começar com "eyJ"');
    console.log('4. Execute: node testar-api-key-simples.cjs');
    return;
  }
  
  console.log('🔍 Testando conexão...');
  console.log('URL:', SUPABASE_URL);
  console.log('Key (primeiros 50 chars):', SUPABASE_KEY.substring(0, 50) + '...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  try {
    // Teste 1: Verificar usuário habbohub
    console.log('👤 Teste 1: Verificando usuário habbohub...');
    const { data: habbohub, error: habbohubError } = await supabase
      .from('hub_users')
      .select('habbo_username, hotel, is_active')
      .eq('habbo_username', 'habbohub')
      .single();
      
    if (habbohubError) {
      console.log('❌ Erro:', habbohubError.message);
    } else {
      console.log('✅ Usuário habbohub encontrado!');
      console.log('📋 Dados:', habbohub);
    }
    
    // Teste 2: Verificar tabelas de home
    console.log('\n🏠 Teste 2: Verificando tabelas de home...');
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
    console.log('✅ API key está funcionando!');
    console.log('📝 Agora me informe esta API key para eu atualizar o sistema.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testarApiKey();
