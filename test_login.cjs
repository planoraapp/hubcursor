const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLogin() {
  try {
    console.log('🧪 Testando sistema de login...');

    // 1. Verificar se a tabela habbo_auth existe
    console.log('📋 Verificando tabela habbo_auth...');
    const { data: users, error: usersError } = await supabase
      .from('habbo_auth')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Erro ao acessar tabela habbo_auth:', usersError);
      return;
    }

    console.log('✅ Tabela habbo_auth acessível!');
    console.log('👥 Usuários encontrados:', users.length);
    
    if (users.length > 0) {
      console.log('📊 Primeiro usuário:', {
        username: users[0].habbo_username,
        motto: users[0].habbo_motto,
        is_admin: users[0].is_admin,
        hotel: users[0].hotel
      });
    }

    // 2. Testar busca por usuário específico
    console.log('🔍 Testando busca por usuário habbohub...');
    const { data: habbohubUser, error: habbohubError } = await supabase
      .from('habbo_auth')
      .select('*')
      .eq('habbo_username', 'habbohub')
      .single();

    if (habbohubError) {
      console.error('❌ Erro ao buscar usuário habbohub:', habbohubError);
    } else {
      console.log('✅ Usuário habbohub encontrado:', {
        username: habbohubUser.habbo_username,
        motto: habbohubUser.habbo_motto,
        is_admin: habbohubUser.is_admin,
        hotel: habbohubUser.hotel,
        password_hash: habbohubUser.password_hash
      });
    }

    // 3. Testar verificação de senha
    console.log('🔐 Testando verificação de senha...');
    const testPassword = '151092';
    const storedPassword = habbohubUser?.password_hash;
    
    if (storedPassword === testPassword) {
      console.log('✅ Senha correta! Login deve funcionar.');
    } else {
      console.log('❌ Senha incorreta!', {
        esperado: testPassword,
        armazenado: storedPassword
      });
    }

    console.log('🎉 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testLogin();
