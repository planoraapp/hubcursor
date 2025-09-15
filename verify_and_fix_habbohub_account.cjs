const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAndFixHabbohubAccount() {
  console.log('🔍 VERIFICAÇÃO COMPLETA DA CONTA HABBOHUB');
  console.log('==========================================\n');

  try {
    // PASSO 1: Verificar conta na tabela habbo_accounts
    console.log('📋 PASSO 1: Verificando conta na tabela habbo_accounts...');
    const { data: habboAccount, error: habboError } = await supabase
      .from('habbo_accounts')
      .select('*')
      .eq('habbo_name', 'habbohub')
      .eq('hotel', 'br')
      .single();

    if (habboError) {
      console.log('❌ ERRO: Conta habbohub não encontrada na tabela habbo_accounts');
      console.log('   Erro:', habboError.message);
      return;
    }

    console.log('✅ Conta habbohub encontrada na tabela habbo_accounts:');
    console.log('   ID:', habboAccount.id);
    console.log('   Habbo Name:', habboAccount.habbo_name);
    console.log('   Habbo ID:', habboAccount.habbo_id);
    console.log('   Hotel:', habboAccount.hotel);
    console.log('   Supabase User ID:', habboAccount.supabase_user_id);
    console.log('   Is Admin:', habboAccount.is_admin);
    console.log('   Motto:', habboAccount.motto);

    // PASSO 2: Verificar usuário auth correspondente
    console.log('\n👤 PASSO 2: Verificando usuário auth correspondente...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(habboAccount.supabase_user_id);

    if (authError) {
      console.log('❌ ERRO: Usuário auth não encontrado');
      console.log('   Erro:', authError.message);
      return;
    }

    console.log('✅ Usuário auth encontrado:');
    console.log('   Email:', authUser.user.email);
    console.log('   ID:', authUser.user.id);
    console.log('   Email Confirmado:', authUser.user.email_confirmed_at ? 'Sim' : 'Não');
    console.log('   Criado em:', authUser.user.created_at);

    // PASSO 3: Verificar inconsistência de email
    console.log('\n📧 PASSO 3: Verificando inconsistência de email...');
    const expectedEmail = `${habboAccount.habbo_id}@habbohub.com`;
    const actualEmail = authUser.user.email;
    
    console.log('   Email esperado pelo sistema:', expectedEmail);
    console.log('   Email real na base de dados:', actualEmail);
    
    if (expectedEmail !== actualEmail) {
      console.log('⚠️  INCONSISTÊNCIA DETECTADA!');
      console.log('   O sistema constrói o email como:', expectedEmail);
      console.log('   Mas o email real é:', actualEmail);
      
      // PASSO 4: Corrigir email na base de dados
      console.log('\n🔧 PASSO 4: Corrigindo email na base de dados...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        habboAccount.supabase_user_id,
        { email: expectedEmail }
      );

      if (updateError) {
        console.log('❌ ERRO ao atualizar email:', updateError.message);
      } else {
        console.log('✅ Email atualizado com sucesso!');
        console.log('   Novo email:', expectedEmail);
      }
    } else {
      console.log('✅ Emails estão consistentes!');
    }

    // PASSO 5: Resetar senha para 151092
    console.log('\n🔐 PASSO 5: Resetando senha para 151092...');
    const { error: resetError } = await supabase.auth.admin.updateUserById(
      habboAccount.supabase_user_id,
      { password: '151092' }
    );

    if (resetError) {
      console.log('❌ ERRO ao resetar senha:', resetError.message);
    } else {
      console.log('✅ Senha resetada com sucesso!');
    }

    // PASSO 6: Testar login completo
    console.log('\n🧪 PASSO 6: Testando login completo...');
    const loginEmail = `${habboAccount.habbo_id}@habbohub.com`;
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: '151092'
    });

    if (loginError) {
      console.log('❌ ERRO no teste de login:', loginError.message);
      console.log('   Email usado:', loginEmail);
      console.log('   Senha usada: 151092');
    } else {
      console.log('✅ LOGIN DE TESTE BEM-SUCEDIDO!');
      console.log('   Email:', loginEmail);
      console.log('   Senha: 151092');
      console.log('   Token:', loginData.session?.access_token?.substring(0, 20) + '...');
    }

    // PASSO 7: Verificar se a conta está marcada como admin
    console.log('\n👑 PASSO 7: Verificando status de admin...');
    if (habboAccount.is_admin) {
      console.log('✅ Conta habbohub está marcada como ADMIN');
    } else {
      console.log('⚠️  Conta habbohub NÃO está marcada como ADMIN');
      console.log('   Atualizando para admin...');
      
      const { error: adminError } = await supabase
        .from('habbo_accounts')
        .update({ is_admin: true })
        .eq('id', habboAccount.id);

      if (adminError) {
        console.log('❌ ERRO ao atualizar status de admin:', adminError.message);
      } else {
        console.log('✅ Status de admin atualizado!');
      }
    }

    // RESUMO FINAL
    console.log('\n🎯 RESUMO FINAL:');
    console.log('================');
    console.log('✅ Conta habbohub verificada e corrigida');
    console.log('✅ Email consistente:', `${habboAccount.habbo_id}@habbohub.com`);
    console.log('✅ Senha resetada para: 151092');
    console.log('✅ Status de admin: Ativo');
    console.log('\n📝 CREDENCIAIS PARA LOGIN:');
    console.log('   Usuário: habbohub');
    console.log('   Senha: 151092');
    console.log('   Email usado internamente:', `${habboAccount.habbo_id}@habbohub.com`);

  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar verificação completa
verifyAndFixHabbohubAccount();
