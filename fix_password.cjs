const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetHabbohubPassword() {
  try {
    console.log('🔧 Resetando senha do auth user habbohub...');

    // 1. Verificar conta habbohub
    const { data: habboAccount, error: habboError } = await supabase
      .from('habbo_accounts')
      .select('*')
      .eq('habbo_name', 'habbohub')
      .eq('hotel', 'br')
      .single();

    if (habboError) {
      console.log('❌ Conta habbohub não encontrada:', habboError.message);
      return;
    }

    console.log('✅ Conta habbohub encontrada:');
    console.log('   Habbo ID:', habboAccount.habbo_id);
    console.log('   Supabase User ID:', habboAccount.supabase_user_id);

    // 2. Resetar senha do auth user
    const { error: resetError } = await supabase.auth.admin.updateUserById(
      habboAccount.supabase_user_id,
      { password: 'habbohub123' }
    );

    if (resetError) {
      console.log('❌ Erro ao resetar senha:', resetError.message);
    } else {
      console.log('✅ Senha do auth user resetada com sucesso!');
    }

    // 3. Verificar se o auth user existe e está ativo
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.log('❌ Erro ao listar auth users:', authError.message);
      return;
    }

    const currentAuthUser = authUsers.users.find(u => u.id === habboAccount.supabase_user_id);
    if (currentAuthUser) {
      console.log('📧 Email do auth user:', currentAuthUser.email);
      console.log('📅 Criado em:', currentAuthUser.created_at);
      console.log('✅ Email confirmado:', currentAuthUser.email_confirmed_at ? 'Sim' : 'Não');
    }

    console.log('\n🎯 CONCLUSÃO:');
    console.log('✅ Senha resetada com sucesso!');
    console.log('✅ Agora você pode fazer login com:');
    console.log('   Usuário: habbohub');
    console.log('   Senha: habbohub123');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar reset da senha do auth user
resetHabbohubPassword();
