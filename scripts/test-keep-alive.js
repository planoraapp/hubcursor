/**
 * 🧪 Script de Teste do Sistema Keep-Alive
 * 
 * Use este script para testar localmente se o sistema de keep-alive
 * está funcionando corretamente antes de fazer o deploy.
 * 
 * Como usar:
 *   node scripts/test-keep-alive.js
 */

const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc';

console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  🧪 Testando Sistema de Keep-Alive do Supabase         ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

const results = {
  timestamp: new Date().toISOString(),
  checks: [],
  success: true
};

async function testDatabase() {
  console.log('📊 [1/4] Testando conexão com o banco de dados...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/habbo_accounts?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    const status = response.ok ? '✅ HEALTHY' : '⚠️ UNHEALTHY';
    console.log(`   ${status} - Status: ${response.status}`);
    
    results.checks.push({
      service: 'Database',
      status: response.ok ? 'healthy' : 'unhealthy',
      statusCode: response.status
    });

    return response.ok;
  } catch (error) {
    console.log(`   ❌ ERRO - ${error.message}`);
    results.checks.push({
      service: 'Database',
      status: 'error',
      error: error.message
    });
    return false;
  }
}

async function testGlobalFeed() {
  console.log('🌍 [2/4] Testando Edge Function de Feed Global...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/habbo-global-feed`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        hotel: 'br',
        limit: 5
      })
    });

    const status = response.ok ? '✅ HEALTHY' : '⚠️ UNHEALTHY';
    console.log(`   ${status} - Status: ${response.status}`);
    
    results.checks.push({
      service: 'Global Feed Function',
      status: response.ok ? 'healthy' : 'unhealthy',
      statusCode: response.status
    });

    return response.ok;
  } catch (error) {
    console.log(`   ❌ ERRO - ${error.message}`);
    results.checks.push({
      service: 'Global Feed Function',
      status: 'error',
      error: error.message
    });
    return false;
  }
}

async function testProfileFunction() {
  console.log('👤 [3/4] Testando Edge Function de Perfil...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/habbo-complete-profile`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ 
        hotel: 'br',
        habbo_name: 'test'
      })
    });

    // Aceita 4xx como healthy (usuário não existe, mas função está ativa)
    const isHealthy = response.status < 500;
    const status = isHealthy ? '✅ HEALTHY' : '⚠️ UNHEALTHY';
    console.log(`   ${status} - Status: ${response.status}`);
    
    results.checks.push({
      service: 'Profile Function',
      status: isHealthy ? 'healthy' : 'unhealthy',
      statusCode: response.status
    });

    return isHealthy;
  } catch (error) {
    console.log(`   ❌ ERRO - ${error.message}`);
    results.checks.push({
      service: 'Profile Function',
      status: 'error',
      error: error.message
    });
    return false;
  }
}

async function testAuthSystem() {
  console.log('🔐 [4/4] Testando Sistema de Autenticação...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    });

    const status = response.ok ? '✅ HEALTHY' : '⚠️ UNHEALTHY';
    console.log(`   ${status} - Status: ${response.status}`);
    
    results.checks.push({
      service: 'Auth System',
      status: response.ok ? 'healthy' : 'unhealthy',
      statusCode: response.status
    });

    return response.ok;
  } catch (error) {
    console.log(`   ❌ ERRO - ${error.message}`);
    results.checks.push({
      service: 'Auth System',
      status: 'error',
      error: error.message
    });
    return false;
  }
}

async function runTests() {
  const test1 = await testDatabase();
  const test2 = await testGlobalFeed();
  const test3 = await testProfileFunction();
  const test4 = await testAuthSystem();

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  
  const allPassed = test1 && test2 && test3 && test4;
  results.success = allPassed;

  if (allPassed) {
    console.log('✅ SUCESSO! Todos os testes passaram.');
    console.log('');
    console.log('🎉 O sistema de keep-alive está funcionando perfeitamente!');
    console.log('📝 Você pode fazer o deploy com confiança.');
  } else {
    console.log('⚠️ ATENÇÃO! Alguns testes falharam.');
    console.log('');
    console.log('🔍 Verifique:');
    console.log('  - A chave SUPABASE_ANON_KEY está correta?');
    console.log('  - O projeto Supabase está ativo?');
    console.log('  - As Edge Functions estão deployadas?');
    console.log('  - Há algum problema de rede ou firewall?');
  }

  console.log('');
  console.log('📊 Resumo dos resultados:');
  console.log(JSON.stringify(results, null, 2));
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  process.exit(allPassed ? 0 : 1);
}

// Executar testes
runTests().catch(error => {
  console.error('❌ Erro fatal durante os testes:', error);
  process.exit(1);
});

