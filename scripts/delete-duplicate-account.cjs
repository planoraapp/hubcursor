const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Pegar UUID da linha de comando
const uuidToDelete = process.argv[2];

if (!uuidToDelete) {
  console.error('❌ Erro: Forneça o UUID da conta a ser deletada');
  console.log('\n📝 Uso: node delete-duplicate-account.cjs <UUID>\n');
  console.log('Exemplo: node delete-duplicate-account.cjs 12345678-1234-1234-1234-123456789abc\n');
  process.exit(1);
}

async function deleteAccount() {
  try {
    console.log(`🔍 Buscando conta com UUID: ${uuidToDelete}\n`);

    // 1. Buscar a conta para confirmar
    const { data: account, error: fetchError } = await supabaseAdmin
      .from('habbo_accounts')
      .select('*')
      .eq('supabase_user_id', uuidToDelete)
      .single();

    if (fetchError || !account) {
      console.error('❌ Conta não encontrada:', fetchError?.message || 'Nenhuma conta com esse UUID');
      process.exit(1);
    }

    console.log('📋 Conta encontrada:');
    console.log(`   👤 Nome: ${account.habbo_name}`);
    console.log(`   🏨 Hotel: ${account.hotel}`);
    console.log(`   🆔 Habbo ID: ${account.habbo_id || 'N/A'}`);
    console.log(`   🔑 UUID: ${account.supabase_user_id}`);
    console.log(`   📅 Criado: ${new Date(account.created_at).toLocaleString('pt-BR')}`);
    console.log();

    // 2. Deletar widgets da home
    console.log('🗑️  Deletando widgets...');
    const { error: widgetsError } = await supabaseAdmin
      .from('user_home_widgets')
      .delete()
      .eq('user_id', uuidToDelete);

    if (widgetsError) {
      console.warn('⚠️  Erro ao deletar widgets:', widgetsError.message);
    } else {
      console.log('✅ Widgets deletados');
    }

    // 3. Deletar stickers da home
    console.log('🗑️  Deletando stickers...');
    const { error: stickersError } = await supabaseAdmin
      .from('user_home_stickers')
      .delete()
      .eq('user_id', uuidToDelete);

    if (stickersError) {
      console.warn('⚠️  Erro ao deletar stickers:', stickersError.message);
    } else {
      console.log('✅ Stickers deletados');
    }

    // 4. Deletar background
    console.log('🗑️  Deletando background...');
    const { error: bgError } = await supabaseAdmin
      .from('user_home_backgrounds')
      .delete()
      .eq('user_id', uuidToDelete);

    if (bgError) {
      console.warn('⚠️  Erro ao deletar background:', bgError.message);
    } else {
      console.log('✅ Background deletado');
    }

    // 5. Deletar guestbook
    console.log('🗑️  Deletando guestbook...');
    const { error: guestbookError } = await supabaseAdmin
      .from('home_guestbook')
      .delete()
      .eq('home_owner_id', uuidToDelete);

    if (guestbookError) {
      console.warn('⚠️  Erro ao deletar guestbook:', guestbookError.message);
    } else {
      console.log('✅ Guestbook deletado');
    }

    // 6. Finalmente, deletar a conta
    console.log('🗑️  Deletando conta...');
    const { error: deleteError } = await supabaseAdmin
      .from('habbo_accounts')
      .delete()
      .eq('supabase_user_id', uuidToDelete);

    if (deleteError) {
      console.error('❌ Erro ao deletar conta:', deleteError);
      throw deleteError;
    }

    console.log('\n✅ CONTA DELETADA COM SUCESSO!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  }
}

deleteAccount();

