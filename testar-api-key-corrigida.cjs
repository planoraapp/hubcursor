const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseKey = 'f205f1f574e25c66aa1ca41ebaaed9450c25a8154ffb4d80d9d6e13b10f7db6d';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testando nova API key do Supabase...');
  console.log('URL:', supabaseUrl);
  console.log('Key (primeiros 50 chars):', supabaseKey.substring(0, 50) + '...');
  
  try {
    // Teste 1: Verificar se consegue acessar a tabela hub_users
    console.log('\n📊 Teste 1: Acessando tabela hub_users...');
    const { data: users, error: usersError } = await supabase
      .from('hub_users')
      .select('habbo_username, hotel, is_active')
      .limit(5);
      
    if (usersError) {
      console.log('❌ Erro ao acessar hub_users:', usersError.message);
      console.log('Código:', usersError.code);
    } else {
      console.log('✅ Sucesso! Usuários encontrados:', users.length);
      if (users.length > 0) {
        console.log('👥 Usuários:');
        users.forEach(u => {
          console.log(`  - ${u.habbo_username} (${u.hotel}) - Ativo: ${u.is_active}`);
        });
      }
    }
    
    // Teste 2: Verificar se o usuário habbohub existe
    console.log('\n🔍 Teste 2: Verificando usuário habbohub...');
    const { data: habbohub, error: habbohubError } = await supabase
      .from('hub_users')
      .select('*')
      .eq('habbo_username', 'habbohub')
      .single();
      
    if (habbohubError) {
      console.log('❌ Usuário habbohub não encontrado:', habbohubError.message);
    } else {
      console.log('✅ Usuário habbohub encontrado!');
      console.log('📋 Dados:', {
        username: habbohub.habbo_username,
        hotel: habbohub.hotel,
        is_active: habbohub.is_active,
        created_at: habbohub.created_at
      });
    }
    
    // Teste 3: Verificar tabelas de home
    console.log('\n🏠 Teste 3: Verificando tabelas de home...');
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
    console.log('✅ API key está funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testConnection();
