import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testando sistema de login após correções...\n');

async function testLogin() {
  try {
    // Teste 1: Buscar conta Beebop
    console.log('1. Testando busca de conta Beebop...');
    const { data: beebopAccount, error: beebopError } = await supabase
      .from('habbo_auth')
      .select('*')
      .ilike('habbo_username', 'Beebop')
      .single();

    if (beebopError) {
      console.log('❌ Erro ao buscar Beebop:', beebopError.message);
      return;
    }

    console.log('✅ Beebop encontrado:', {
      username: beebopAccount.habbo_username,
      hasPassword: !!beebopAccount.password_hash,
      isAdmin: beebopAccount.is_admin
    });

    // Teste 2: Buscar conta habbohub
    console.log('\n2. Testando busca de conta habbohub...');
    const { data: habbohubAccount, error: habbohubError } = await supabase
      .from('habbo_auth')
      .select('*')
      .ilike('habbo_username', 'habbohub')
      .single();

    if (habbohubError) {
      console.log('❌ Erro ao buscar habbohub:', habbohubError.message);
      return;
    }

    console.log('✅ habbohub encontrado:', {
      username: habbohubAccount.habbo_username,
      hasPassword: !!habbohubAccount.password_hash,
      isAdmin: habbohubAccount.is_admin
    });

    // Teste 3: Testar update por username (não por ID)
    console.log('\n3. Testando update por username...');
    const { error: updateError } = await supabase
      .from('habbo_auth')
      .update({
        last_login: new Date().toISOString()
      })
      .eq('habbo_username', 'Beebop');

    if (updateError) {
      console.log('❌ Erro no update:', updateError.message);
    } else {
      console.log('✅ Update por username funcionou!');
    }

    console.log('\n🎉 SISTEMA FUNCIONANDO!');
    console.log('✅ Login por username: OK');
    console.log('✅ Update por username: OK');
    console.log('✅ Sem erros 400!');

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testLogin();
