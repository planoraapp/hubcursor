const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkHabbohubInNewSystem() {
  try {
    console.log('🔍 Verificando conta habbohub no sistema NOVO (habbo_accounts)...');

    // Verificar na tabela habbo_accounts (sistema novo)
    const { data: habboAccount, error: habboError } = await supabase
      .from('habbo_accounts')
      .select('*')
      .eq('habbo_name', 'habbohub')
      .eq('hotel', 'br')
      .single();

    if (habboError) {
      console.log('❌ Conta habbohub NÃO encontrada em habbo_accounts (sistema novo)');
      console.log('   Erro:', habboError.message);
      
      console.log('\n🔧 Criando conta no sistema novo...');
      
      // Criar auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'hhbr-habbohub@habbohub.com',
        password: 'habbohub123',
        email_confirm: true
      });

      if (authError) {
        console.log('⚠️ Auth user já existe, buscando...');
        const { data: users } = await supabase.auth.admin.listUsers();
        const habbohubUser = users.users.find(u => u.email === 'hhbr-habbohub@habbohub.com');
        
        if (!habbohubUser) {
          throw new Error('Não foi possível encontrar auth user');
        }
        
        // Criar conta no sistema novo
        const { data: newAccount, error: accountError } = await supabase
          .from('habbo_accounts')
          .insert({
            supabase_user_id: habbohubUser.id,
            habbo_name: 'habbohub',
            habbo_id: 'hhbr-habbohub',
            hotel: 'br',
            figure_string: 'hr-115-42.hd-195-19.ch-215-62.lg-285-91.sh-290-62.wa-2001-62',
            motto: 'HabboHub - Seu hub para tudo sobre Habbo!',
            is_admin: true,
            is_online: false
          })
          .select()
          .single();

        if (accountError) throw accountError;
        console.log('✅ Conta habbohub criada no sistema novo!');
        console.log('   ID:', newAccount.id);
        console.log('   Admin:', newAccount.is_admin);
      } else {
        // Criar conta no sistema novo
        const { data: newAccount, error: accountError } = await supabase
          .from('habbo_accounts')
          .insert({
            supabase_user_id: authUser.user.id,
            habbo_name: 'habbohub',
            habbo_id: 'hhbr-habbohub',
            hotel: 'br',
            figure_string: 'hr-115-42.hd-195-19.ch-215-62.lg-285-91.sh-290-62.wa-2001-62',
            motto: 'HabboHub - Seu hub para tudo sobre Habbo!',
            is_admin: true,
            is_online: false
          })
          .select()
          .single();

        if (accountError) throw accountError;
        console.log('✅ Conta habbohub criada no sistema novo!');
        console.log('   ID:', newAccount.id);
        console.log('   Admin:', newAccount.is_admin);
      }
    } else {
      console.log('✅ Conta habbohub encontrada em habbo_accounts (sistema novo):');
      console.log('   ID:', habboAccount.id);
      console.log('   Supabase User ID:', habboAccount.supabase_user_id);
      console.log('   Habbo Name:', habboAccount.habbo_name);
      console.log('   Habbo ID:', habboAccount.habbo_id);
      console.log('   Hotel:', habboAccount.hotel);
      console.log('   Admin:', habboAccount.is_admin);
      console.log('   Motto:', habboAccount.motto);
    }

    console.log('\n🎯 CONCLUSÃO:');
    console.log('✅ Conta habbohub está configurada corretamente!');
    console.log('✅ Pronta para login no site!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar verificação
checkHabbohubInNewSystem();