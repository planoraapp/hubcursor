// test-handitem-images.cjs - Script para testar se as imagens dos handitems estão funcionando
const fs = require('fs');
const path = require('path');

async function testHanditemImages() {
  console.log('🧪 TESTANDO IMAGENS DOS HANDITEMS...');
  
  try {
    // 1. Verificar se o arquivo handitems.json existe
    const handitemsFile = path.join(process.cwd(), 'public', 'handitems', 'handitems.json');
    if (!fs.existsSync(handitemsFile)) {
      console.log('❌ Arquivo handitems.json não encontrado!');
      return;
    }
    
    const handitems = JSON.parse(fs.readFileSync(handitemsFile, 'utf-8'));
    console.log(`✅ Encontrados ${handitems.length} handitems`);
    
    // 2. Verificar estrutura de diretórios de imagens
    const imagesDir = path.join(process.cwd(), 'public', 'handitems', 'images');
    const drkDir = path.join(imagesDir, 'drk');
    const crrDir = path.join(imagesDir, 'crr');
    const previewDir = path.join(imagesDir, 'preview');
    
    console.log('📁 Verificando diretórios de imagens...');
    console.log(`  - drk: ${fs.existsSync(drkDir) ? '✅' : '❌'} (${fs.existsSync(drkDir) ? fs.readdirSync(drkDir).length : 0} arquivos)`);
    console.log(`  - crr: ${fs.existsSync(crrDir) ? '✅' : '❌'} (${fs.existsSync(crrDir) ? fs.readdirSync(crrDir).length : 0} arquivos)`);
    console.log(`  - preview: ${fs.existsSync(previewDir) ? '✅' : '❌'} (${fs.existsSync(previewDir) ? fs.readdirSync(previewDir).length : 0} arquivos)`);
    
    // 3. Testar alguns handitems específicos
    const testHanditems = handitems.slice(0, 10);
    console.log('\n🔍 Testando handitems específicos:');
    
    for (const handitem of testHanditems) {
      const isUseItem = isUseItemByName(handitem.name);
      const type = isUseItem ? 'drk' : 'crr';
      const imagePath = path.join(imagesDir, type, `${type}${handitem.id}.png`);
      const previewPath = path.join(imagesDir, 'preview', `handitem_${handitem.id}.svg`);
      
      console.log(`  ${handitem.id}: ${handitem.name}`);
      console.log(`    - Tipo: ${isUseItem ? 'UseItem (drk)' : 'CarryItem (crr)'}`);
      console.log(`    - Imagem ${type}: ${fs.existsSync(imagePath) ? '✅' : '❌'}`);
      console.log(`    - Preview SVG: ${fs.existsSync(previewPath) ? '✅' : '❌'}`);
    }
    
    // 4. Verificar mapeamento
    const mappingFile = path.join(imagesDir, 'handitem-mapping.json');
    if (fs.existsSync(mappingFile)) {
      const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));
      console.log('\n📊 Estatísticas do mapeamento:');
      console.log(`  - Total de handitems: ${mapping.handitems.length}`);
      console.log(`  - Imagens drk: ${mapping.images.drk.length}`);
      console.log(`  - Imagens crr: ${mapping.images.crr.length}`);
      console.log(`  - Imagens preview: ${mapping.images.preview.length}`);
    }
    
    // 5. Testar URLs que serão geradas
    console.log('\n🔗 URLs de exemplo que serão geradas:');
    for (const handitem of testHanditems.slice(0, 3)) {
      const isUseItem = isUseItemByName(handitem.name);
      const type = isUseItem ? 'drk' : 'crr';
      const imageUrl = `/assets/handitems/images/${type}/${type}${handitem.id}.png`;
      const previewUrl = `/assets/handitems/images/preview/handitem_${handitem.id}.svg`;
      
      console.log(`  ${handitem.name} (ID: ${handitem.id}):`);
      console.log(`    - Imagem: ${imageUrl}`);
      console.log(`    - Preview: ${previewUrl}`);
    }
    
    console.log('\n✅ TESTE CONCLUÍDO!');
    console.log('🌐 Acesse http://localhost:8080/ferramentas/handitems para ver os handitems em ação!');
    
  } catch (error) {
    console.error('❌ ERRO no teste:', error.message);
  }
}

function isUseItemByName(name) {
  const useItemKeywords = [
    'bebida', 'suco', 'café', 'água', 'leite', 'chá', 'refrigerante',
    'sorvete', 'comida', 'sanduíche', 'hambúrger', 'pizza', 'bolo',
    'bebida', 'drink', 'cocktail', 'cerveja', 'vinho', 'champanhe'
  ];
  
  return useItemKeywords.some(keyword => 
    name.toLowerCase().includes(keyword)
  );
}

// Executar teste
testHanditemImages();
