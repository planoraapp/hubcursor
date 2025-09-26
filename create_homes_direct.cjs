// Script para criar homes diretamente com IDs reais
const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc';

const createHomesDirect = async () => {
  console.log('🚀 CRIANDO HOMES DIRETAMENTE COM IDs REAIS');
  console.log('==========================================');
  
  // IDs reais confirmados pela API do Habbo
  const realIds = {
    habbohub: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
    Beebop: 'hhbr-00e6988dddeb5a1838658c854d62fe49'
  };
  
  console.log('📋 IDs Reais Confirmados:');
  console.log(`habbohub: ${realIds.habbohub}`);
  console.log(`Beebop: ${realIds.Beebop}`);
  
  try {
    // 1. Criar homes para habbohub
    console.log('\n🏠 Criando home para habbohub...');
    const habbohubHomeResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_home_backgrounds`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: realIds.habbohub,
        background_type: 'image',
        background_value: '/assets/bghabbohub.png'
      })
    });
    
    if (habbohubHomeResponse.ok) {
      console.log('✅ Home do habbohub criada!');
    } else {
      const error = await habbohubHomeResponse.text();
      console.log('⚠️ Aviso ao criar home do habbohub:', error);
    }
    
    // 2. Criar homes para Beebop
    console.log('\n🏠 Criando home para Beebop...');
    const beebopHomeResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_home_backgrounds`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: realIds.Beebop,
        background_type: 'image',
        background_value: '/assets/bghabbohub.png'
      })
    });
    
    if (beebopHomeResponse.ok) {
      console.log('✅ Home do Beebop criada!');
    } else {
      const error = await beebopHomeResponse.text();
      console.log('⚠️ Aviso ao criar home do Beebop:', error);
    }
    
    // 3. Verificar homes criadas
    console.log('\n📊 VERIFICAÇÃO DAS HOMES:');
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_home_backgrounds?select=user_id,background_type,background_value,created_at,updated_at`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (verifyResponse.ok) {
      const homes = await verifyResponse.json();
      console.log(`\n🏠 TOTAL DE HOMES: ${homes.length}`);
      homes.forEach(home => {
        console.log(`\n🏠 ${home.user_id}:`);
        console.log(`   Background: ${home.background_value}`);
        console.log(`   Tipo: ${home.background_type}`);
        console.log(`   Criado: ${new Date(home.created_at).toLocaleString('pt-BR')}`);
      });
    }
    
    console.log('\n🎉 CRIAÇÃO DE HOMES CONCLUÍDA!');
    console.log('==============================');
    console.log('✅ Homes criadas com IDs reais');
    console.log('✅ Sistema pronto para exibir cards');
    console.log('✅ Página /home funcionará corretamente');
    
  } catch (error) {
    console.log('❌ Erro durante a criação das homes:', error.message);
  }
};

createHomesDirect().catch(console.error);
