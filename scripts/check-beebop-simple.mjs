import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente diretamente (sem dotenv)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBeebopDuplicates() {
  console.log('🔍 Verificando registros duplicados do Beebop...\n');

  try {
    // Buscar todos os registros do Beebop
    const { data: beebopRecords, error } = await supabase
      .from('habbo_accounts')
      .select('*')
      .or('habbo_name.ilike.%Beebop%,habbo_name.ilike.%beebop%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar registros:', error);
      return;
    }

    if (!beebopRecords || beebopRecords.length === 0) {
      console.log('📭 Nenhum registro do Beebop encontrado');
      return;
    }

    console.log(`📊 Encontrados ${beebopRecords.length} registros do Beebop:\n`);

    beebopRecords.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}`);
      console.log(`   Nome: ${record.habbo_name}`);
      console.log(`   Hotel: ${record.hotel}`);
      console.log(`   Habbo ID: ${record.habbo_id}`);
      console.log(`   Supabase User ID: ${record.supabase_user_id}`);
      console.log(`   Criado em: ${record.created_at}`);
      console.log(`   Atualizado em: ${record.updated_at}`);
      console.log(`   Admin: ${record.is_admin}`);
      console.log(`   Online: ${record.is_online}`);
      console.log('   ---');
    });

    // Verificar se há duplicatas
    const uniqueNames = [...new Set(beebopRecords.map(r => r.habbo_name))];
    const uniqueHotels = [...new Set(beebopRecords.map(r => r.hotel))];

    console.log('\n📈 Análise de duplicatas:');
    console.log(`   Nomes únicos: ${uniqueNames.length} (${uniqueNames.join(', ')})`);
    console.log(`   Hotéis únicos: ${uniqueHotels.length} (${uniqueHotels.join(', ')})`);

    if (uniqueNames.length === 1 && uniqueHotels.length === 1) {
      console.log('✅ Não há duplicatas - todos os registros são do mesmo usuário');
    } else {
      console.log('⚠️  POSSÍVEL PROBLEMA: Há registros com nomes ou hotéis diferentes');
      
      // Verificar se há registros com mesmo nome mas hotéis diferentes
      const nameGroups = beebopRecords.reduce((acc, record) => {
        if (!acc[record.habbo_name]) {
          acc[record.habbo_name] = [];
        }
        acc[record.habbo_name].push(record);
        return acc;
      }, {});

      Object.entries(nameGroups).forEach(([name, records]) => {
        if (records.length > 1) {
          const hotels = [...new Set(records.map(r => r.hotel))];
          console.log(`\n🚨 DUPLICATA ENCONTRADA para "${name}":`);
          console.log(`   Hotéis: ${hotels.join(', ')}`);
          console.log(`   Registros: ${records.length}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkBeebopDuplicates();
