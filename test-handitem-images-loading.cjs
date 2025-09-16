const fs = require('fs');
const path = require('path');

console.log('🔍 Testando carregamento de imagens de handitems...\n');

// Ler o arquivo de mapeamento
const mappingFile = path.join(__dirname, 'public', 'handitems', 'images', 'handitem-mapping.json');
const mappingData = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));

// Testar alguns handitems específicos
const testHanditems = [
  { id: 0, name: 'Nenhum' },
  { id: 30, name: 'Sorvete de chocolate' },
  { id: 1000, name: 'Rosa' },
  { id: 1007, name: 'Margarida Azul' },
  { id: 1129, name: 'Teste' }
];

console.log('🧪 Testando handitems específicos:\n');

testHanditems.forEach(handitem => {
  const mapping = mappingData.handitems.find(h => h.id === handitem.id);
  
  if (mapping) {
    console.log(`📦 ID ${handitem.id}: ${handitem.name}`);
    
    // Verificar se as imagens existem
    const drkPath = mapping.drkImage ? path.join(__dirname, 'public', 'handitems', 'images', 'drk', mapping.drkImage) : null;
    const crrPath = mapping.crrImage ? path.join(__dirname, 'public', 'handitems', 'images', 'crr', mapping.crrImage) : null;
    const previewPath = mapping.previewImage ? path.join(__dirname, 'public', 'handitems', 'images', 'preview', mapping.previewImage) : null;
    
    console.log(`   DRK: ${mapping.drkImage || 'N/A'} ${drkPath && fs.existsSync(drkPath) ? '✅' : '❌'}`);
    console.log(`   CRR: ${mapping.crrImage || 'N/A'} ${crrPath && fs.existsSync(crrPath) ? '✅' : '❌'}`);
    console.log(`   Preview: ${mapping.previewImage || 'N/A'} ${previewPath && fs.existsSync(previewPath) ? '✅' : '❌'}`);
    
    // URLs que serão usadas no frontend
    console.log(`   URLs:`);
    if (mapping.drkImage) console.log(`     DRK: /handitems/images/drk/${mapping.drkImage}`);
    if (mapping.crrImage) console.log(`     CRR: /handitems/images/crr/${mapping.crrImage}`);
    if (mapping.previewImage) console.log(`     Preview: /handitems/images/preview/${mapping.previewImage}`);
    
  } else {
    console.log(`❌ ID ${handitem.id}: ${handitem.name} - Mapeamento não encontrado`);
  }
  
  console.log('');
});

// Estatísticas gerais
console.log('📊 Estatísticas gerais:');
console.log(`   Total de handitems: ${mappingData.handitems.length}`);
console.log(`   Com imagens DRK: ${mappingData.handitems.filter(h => h.drkImage).length}`);
console.log(`   Com imagens CRR: ${mappingData.handitems.filter(h => h.crrImage).length}`);
console.log(`   Com imagens Preview: ${mappingData.handitems.filter(h => h.previewImage).length}`);

console.log('\n🎯 Teste concluído!');
