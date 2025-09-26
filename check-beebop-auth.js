import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

async function checkBeebopAuth() {
  console.log('🔍 Verificando autenticação do Beebop...');

  try {
    // 1. Verificar conta habbo_accounts
    console.log('📊 Verificando conta habbo_accounts...');
    const { data: habboAccount, error: accountError } = await supabase
      .from('habbo_accounts')
      .select('*')
      .eq('habbo_name', 'Beebop')
      .single();

    if (accountError) {
      console.error('❌ Erro ao buscar conta habbo:', accountError.message);
      return;
    }

    console.log('✅ Conta habbo_accounts encontrada:');
    console.log(`   ID: ${habboAccount.id}`);
    console.log(`   Nome: ${habboAccount.habbo_name}`);
    console.log(`   Habbo ID: ${habboAccount.habbo_id}`);
    console.log(`   Supabase User ID: ${habboAccount.supabase_user_id}`);

    // 2. Verificar usuário auth
    console.log('\n👤 Verificando usuário auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(habboAccount.supabase_user_id);

    if (authError) {
      console.error('❌ Erro ao buscar usuário auth:', authError.message);
      return;
    }

    console.log('✅ Usuário auth encontrado:');
    console.log(`   Email: ${authUser.user.email}`);
    console.log(`   ID: ${authUser.user.id}`);
    console.log(`   Habbo Name: ${authUser.user.user_metadata?.habbo_name}`);

    // 3. Testar login com senha
    console.log('\n🔐 Testando login com senha...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: `${habboAccount.habbo_id}@habbohub.com`,
      password: '290684'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      
      // Tentar resetar senha
      console.log('\n🔄 Tentando resetar senha...');
      const { error: resetError } = await supabase.auth.admin.updateUserById(habboAccount.supabase_user_id, {
        password: '290684'
      });

      if (resetError) {
        console.error('❌ Erro ao resetar senha:', resetError.message);
      } else {
        console.log('✅ Senha resetada com sucesso!');
        
        // Tentar login novamente
        const { data: retryLoginData, error: retryLoginError } = await supabase.auth.signInWithPassword({
          email: `${habboAccount.habbo_id}@habbohub.com`,
          password: '290684'
        });

        if (retryLoginError) {
          console.error('❌ Erro no login após reset:', retryLoginError.message);
        } else {
          console.log('✅ Login bem-sucedido após reset!');
          console.log(`   Token: ${retryLoginData.session?.access_token?.substring(0, 20)}...`);
        }
      }
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log(`   Token: ${loginData.session?.access_token?.substring(0, 20)}...`);
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

checkBeebopAuth();
