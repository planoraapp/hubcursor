const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3OTc0NTcsImV4cCI6MjA1MjM3MzQ1N30.EByYvXfHZTEkn0VN_tpYRnL4lhpKJwqO5TvTMT2cRUE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBeebop() {
  console.log('🚀 Criando conta Beebop...\n');

  const beebopId = 'd76a5564-7693-4203-b964-5bdabb3afae3';

  try {
    // 1. Verificar se Beebop já existe
    const { data: existing } = await supabase
      .from('habbo_accounts')
      .select('id, habbo_name')
      .eq('id', beebopId)
      .single();

    if (existing) {
      console.log('✅ Beebop já existe:', existing);
      return;
    }

    // 2. Criar conta Beebop
    console.log('📝 Criando nova conta Beebop...');
    
    const { data, error } = await supabase
      .from('habbo_accounts')
      .insert({
        id: beebopId,
        habbo_name: 'Beebop',
        habbo_id: 'hhbr-00e6988dddeb5a1838658c854d62fe49',
        hotel: 'br',
        figure_string: 'hr-155-45.hd-208-10.ch-5267-91.lg-275-82.sh-3068-92-92.fa-1206-90.ca-4335-71.cc-6204-82',
        motto: 'HUB-ACTI1',
        is_admin: true,
        is_online: false
      })
      .select();

    if (error) {
      console.error('❌ Erro ao criar Beebop:', error);
      
      // Tentar atualizar se já existe
      console.log('🔄 Tentando atualizar...');
      const { data: updated, error: updateError } = await supabase
        .from('habbo_accounts')
        .update({
          habbo_name: 'Beebop',
          figure_string: 'hr-155-45.hd-208-10.ch-5267-91.lg-275-82.sh-3068-92-92.fa-1206-90.ca-4335-71.cc-6204-82',
          motto: 'HUB-ACTI1',
        })
        .eq('id', beebopId)
        .select();
        
      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError);
      } else {
        console.log('✅ Beebop atualizado:', updated);
      }
      return;
    }

    console.log('✅ Beebop criado com sucesso:', data);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createBeebop();

