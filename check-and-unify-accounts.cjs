const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAndUnifyAccounts() {
  try {
    console.log('🔍 Verificando contas no banco de dados...\n');

    // 1. Buscar todas as contas
    const { data: allAccounts, error: fetchError } = await supabaseAdmin
      .from('habbo_accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Erro ao buscar contas:', fetchError);
      throw fetchError;
    }

    console.log(`📊 Total de contas encontradas: ${allAccounts.length}\n`);

    // 2. Agrupar por habbo_name (case-insensitive) para detectar duplicatas
    const accountsByName = new Map();
    
    allAccounts.forEach(account => {
      const nameLower = account.habbo_name.toLowerCase();
      if (!accountsByName.has(nameLower)) {
        accountsByName.set(nameLower, []);
      }
      accountsByName.get(nameLower).push(account);
    });

    // 3. Mostrar todas as contas e identificar duplicatas
    console.log('════════════════════════════════════════════════════════════════');
    console.log('📋 LISTA DE CONTAS NO BANCO:');
    console.log('════════════════════════════════════════════════════════════════\n');

    const duplicates = [];
    
    accountsByName.forEach((accounts, nameLower) => {
      const isDuplicate = accounts.length > 1;
      
      accounts.forEach((account, index) => {
        const marker = isDuplicate ? '⚠️ ' : '✅ ';
        console.log(`${marker}Conta ${index + 1}/${accounts.length}:`);
        console.log(`   👤 Nome: ${account.habbo_name}`);
        console.log(`   🏨 Hotel: ${account.hotel}`);
        console.log(`   🆔 Habbo ID: ${account.habbo_id || 'N/A'}`);
        console.log(`   🔑 Supabase User ID: ${account.supabase_user_id}`);
        console.log(`   📅 Criado em: ${new Date(account.created_at).toLocaleString('pt-BR')}`);
        console.log(`   👑 Admin: ${account.is_admin ? 'Sim' : 'Não'}`);
        console.log();
      });

      if (isDuplicate) {
        duplicates.push({ nameLower, accounts });
      }
    });

    // 4. Mostrar resumo de duplicatas
    if (duplicates.length > 0) {
      console.log('════════════════════════════════════════════════════════════════');
      console.log('⚠️  CONTAS DUPLICADAS ENCONTRADAS:');
      console.log('════════════════════════════════════════════════════════════════\n');

      duplicates.forEach(({ nameLower, accounts }) => {
        console.log(`🔄 Nome: "${nameLower}" - ${accounts.length} contas encontradas`);
        accounts.forEach((acc, idx) => {
          console.log(`   ${idx + 1}. ${acc.habbo_name} (${acc.hotel}) - ID: ${acc.supabase_user_id.slice(0, 8)}...`);
        });
        console.log();
      });

      console.log('════════════════════════════════════════════════════════════════');
      console.log('🔧 AÇÕES SUGERIDAS:');
      console.log('════════════════════════════════════════════════════════════════\n');
      console.log('Para cada conta duplicada, você deve:');
      console.log('1. Verificar qual conta é a correta (com capitalização do Habbo oficial)');
      console.log('2. Manter a conta mais antiga ou a que tem mais dados');
      console.log('3. Deletar as contas extras\n');
      
      console.log('💡 Para verificar capitalização oficial:');
      console.log('   curl https://www.habbo.com.br/api/public/users?name=NOMEDOUSUARIO\n');
    } else {
      console.log('✅ Nenhuma conta duplicada encontrada!\n');
    }

    // 5. Verificar contas fictícias conhecidas
    console.log('════════════════════════════════════════════════════════════════');
    console.log('🤖 VERIFICANDO CONTAS FICTÍCIAS/DE TESTE:');
    console.log('════════════════════════════════════════════════════════════════\n');

    const testAccounts = ['habbohub', 'beebop', 'skyfalls'];
    
    for (const testName of testAccounts) {
      const matches = allAccounts.filter(acc => 
        acc.habbo_name.toLowerCase() === testName.toLowerCase()
      );

      if (matches.length > 0) {
        console.log(`📍 "${testName}":`);
        matches.forEach(acc => {
          // Verificar se tem habbo_id (conta real vinculada ao Habbo)
          const isReal = acc.habbo_id && acc.habbo_id.startsWith('hhbr-');
          console.log(`   ${isReal ? '✅' : '⚠️ '} ${acc.habbo_name} (${acc.hotel})`);
          console.log(`      Habbo ID: ${acc.habbo_id || 'NENHUM - Conta fictícia'}`);
          console.log(`      UUID: ${acc.supabase_user_id}`);
        });
        console.log();
      }
    }

    // 6. Resumo final
    console.log('════════════════════════════════════════════════════════════════');
    console.log('📊 RESUMO:');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log(`   📦 Total de contas: ${allAccounts.length}`);
    console.log(`   ⚠️  Contas duplicadas: ${duplicates.length}`);
    console.log(`   ✅ Contas únicas: ${accountsByName.size - duplicates.length}`);
    console.log();

    // Aguardar um pouco para garantir que todas as conexões sejam fechadas
    await new Promise(resolve => setTimeout(resolve, 100));

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error);
    // Aguardar um pouco antes de sair em caso de erro
    await new Promise(resolve => setTimeout(resolve, 100));
    process.exit(1);
  }
}

checkAndUnifyAccounts();

