const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixFigureString() {
  console.log('🔍 VERIFICANDO FIGURE_STRING DA CONTA HABBOHUB');
  console.log('==============================================\n');

  try {
    // 1. Verificar conta habbohub
    const { data: habboAccount, error: habboError } = await supabase
      .from('habbo_accounts')
      .select('*')
      .eq('habbo_name', 'habbohub')
      .eq('hotel', 'br')
      .single();

    if (habboError) {
      console.log('❌ ERRO: Conta habbohub não encontrada');
      console.log('   Erro:', habboError.message);
      return;
    }

    console.log('✅ Conta habbohub encontrada:');
    console.log('   Habbo Name:', habboAccount.habbo_name);
    console.log('   Habbo ID:', habboAccount.habbo_id);
    console.log('   Figure String:', habboAccount.figure_string);
    console.log('   Motto:', habboAccount.motto);

    // 2. Verificar se figure_string está vazia ou inválida
    if (!habboAccount.figure_string || habboAccount.figure_string.trim() === '') {
      console.log('\n⚠️  FIGURE_STRING VAZIA OU INVÁLIDA!');
      console.log('   Atualizando com uma figure_string padrão...');
      
      // Usar uma figure_string padrão do Habbo
      const defaultFigureString = 'hd-180-1.ch-255-66.lg-285-80.sh-290-62.ha-1012-110.hr-831-49';
      
      const { error: updateError } = await supabase
        .from('habbo_accounts')
        .update({ figure_string: defaultFigureString })
        .eq('id', habboAccount.id);

      if (updateError) {
        console.log('❌ ERRO ao atualizar figure_string:', updateError.message);
      } else {
        console.log('✅ Figure_string atualizada com sucesso!');
        console.log('   Nova figure_string:', defaultFigureString);
      }
    } else {
      console.log('\n✅ Figure_string já existe e é válida!');
    }

    // 3. Testar URL da imagem do avatar
    console.log('\n🧪 TESTANDO URL DO AVATAR...');
    const figureString = habboAccount.figure_string || 'hd-180-1.ch-255-66.lg-285-80.sh-290-62.ha-1012-110.hr-831-49';
    const avatarUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${figureString}&size=m&direction=2&head_direction=3&headonly=1`;
    
    console.log('   URL do avatar:', avatarUrl);
    
    // 4. Verificar se a URL é válida fazendo uma requisição
    try {
      const response = await fetch(avatarUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ URL do avatar é válida e acessível!');
      } else {
        console.log('⚠️  URL do avatar retornou status:', response.status);
      }
    } catch (error) {
      console.log('⚠️  Erro ao testar URL do avatar:', error.message);
    }

    // 5. Mostrar informações finais
    console.log('\n🎯 RESUMO FINAL:');
    console.log('================');
    console.log('✅ Conta habbohub verificada');
    console.log('✅ Figure_string configurada:', figureString);
    console.log('✅ Avatar deve aparecer na sidebar agora');
    
    console.log('\n📝 INFORMAÇÕES PARA DEBUG:');
    console.log('   Habbo Name:', habboAccount.habbo_name);
    console.log('   Figure String:', figureString);
    console.log('   Avatar URL:', avatarUrl);

  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar verificação
checkAndFixFigureString();
