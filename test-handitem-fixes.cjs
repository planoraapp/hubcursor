// test-handitem-fixes.cjs - Script para testar as correções dos handitems
const fs = require('fs');
const path = require('path');

async function testHanditemFixes() {
  console.log('🧪 TESTANDO CORREÇÕES DOS HANDITEMS...');
  
  try {
    // 1. Verificar se handitems.json está acessível
    console.log('📁 Verificando arquivo handitems.json...');
    const handitemsFile = path.join(process.cwd(), 'public', 'handitems.json');
    if (fs.existsSync(handitemsFile)) {
      console.log('✅ handitems.json encontrado em public/');
      const handitems = JSON.parse(fs.readFileSync(handitemsFile, 'utf-8'));
      console.log(`   - ${handitems.length} handitems carregados`);
    } else {
      console.log('❌ handitems.json não encontrado em public/');
    }
    
    // 2. Verificar imagens locais
    console.log('\n🖼️ Verificando imagens locais...');
    const imagesDir = path.join(process.cwd(), 'public', 'handitems', 'images');
    const drkDir = path.join(imagesDir, 'drk');
    const crrDir = path.join(imagesDir, 'crr');
    const previewDir = path.join(imagesDir, 'preview');
    
    console.log(`  - drk: ${fs.existsSync(drkDir) ? '✅' : '❌'} (${fs.existsSync(drkDir) ? fs.readdirSync(drkDir).length : 0} arquivos)`);
    console.log(`  - crr: ${fs.existsSync(crrDir) ? '✅' : '❌'} (${fs.existsSync(crrDir) ? fs.readdirSync(crrDir).length : 0} arquivos)`);
    console.log(`  - preview: ${fs.existsSync(previewDir) ? '✅' : '❌'} (${fs.existsSync(previewDir) ? fs.readdirSync(previewDir).length : 0} arquivos)`);
    
    // 3. Testar URLs que serão geradas
    console.log('\n🔗 URLs que serão geradas:');
    const testIds = [0, 1, 2, 3, 4, 30];
    for (const id of testIds) {
      const drkUrl = `/assets/handitems/images/drk/drk${id}.png`;
      const crrUrl = `/assets/handitems/images/crr/crr${id}.png`;
      const previewUrl = `/assets/handitems/images/preview/handitem_${id}.svg`;
      
      console.log(`  ID ${id}:`);
      console.log(`    - drk: ${drkUrl}`);
      console.log(`    - crr: ${crrUrl}`);
      console.log(`    - preview: ${previewUrl}`);
    }
    
    // 4. Verificar se não há mais referências a fontes externas
    console.log('\n🔍 Verificando se fontes externas foram removidas...');
    const discoveryFile = path.join(process.cwd(), 'src', 'services', 'HanditemImageDiscovery.ts');
    const discoveryContent = fs.readFileSync(discoveryFile, 'utf-8');
    
    const externalSources = ['imgur.com', 'habbotemplarios.com', 'habbo.com'];
    let foundExternal = false;
    
    for (const source of externalSources) {
      if (discoveryContent.includes(source)) {
        console.log(`  ⚠️ Ainda encontrada referência a: ${source}`);
        foundExternal = true;
      }
    }
    
    if (!foundExternal) {
      console.log('  ✅ Nenhuma referência a fontes externas encontrada');
    }
    
    console.log('\n✅ TESTE DAS CORREÇÕES CONCLUÍDO!');
    console.log('🌐 Acesse http://localhost:8081/ferramentas/handitems para testar!');
    
  } catch (error) {
    console.error('❌ ERRO no teste:', error.message);
  }
}

// Executar teste
testHanditemFixes();
