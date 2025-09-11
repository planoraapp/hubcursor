// Script de teste para descoberta automática de handitems
const { handitemDiscovery } = require('./src/utils/handitemDiscovery.ts');

async function testHanditemDiscovery() {
  console.log('🚀 Iniciando teste de descoberta de handitems...');
  
  try {
    // Testar descoberta de handitems recentes (IDs 170-200)
    const discovered = await handitemDiscovery.discoverHanditems(170, 200);
    
    console.log(`\n✅ Descoberta concluída!`);
    console.log(`📊 Total de handitems encontrados: ${discovered.length}`);
    
    if (discovered.length > 0) {
      console.log('\n📋 Handitems descobertos:');
      discovered.forEach(item => {
        console.log(`  - ID ${item.id}: ${item.images.length} variações`);
        item.images.forEach(img => {
          console.log(`    * Variação ${img.variation}: ${img.url}`);
        });
      });
    } else {
      console.log('❌ Nenhum handitem encontrado no range testado');
    }
    
  } catch (error) {
    console.error('❌ Erro na descoberta:', error);
  }
}

// Executar teste
testHanditemDiscovery();
