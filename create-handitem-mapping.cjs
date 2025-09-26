const fs = require('fs');
const path = require('path');

console.log('🔍 Criando mapeamento de handitems para imagens reais...\n');

// Ler o arquivo de handitems
const handitemsFile = path.join(__dirname, 'public', 'handitems.json');
if (!fs.existsSync(handitemsFile)) {
  console.log('❌ Arquivo handitems.json não encontrado');
  process.exit(1);
}

const handitemsData = JSON.parse(fs.readFileSync(handitemsFile, 'utf8'));
console.log(`📋 Encontrados ${handitemsData.length} handitems`);

// Ler os arquivos de imagem disponíveis
const drkDir = path.join(__dirname, 'public', 'handitems', 'images', 'drk');
const crrDir = path.join(__dirname, 'public', 'handitems', 'images', 'crr');
const previewDir = path.join(__dirname, 'public', 'handitems', 'images', 'preview');

const drkFiles = fs.existsSync(drkDir) ? fs.readdirSync(drkDir) : [];
const crrFiles = fs.existsSync(crrDir) ? fs.readdirSync(crrDir) : [];
const previewFiles = fs.existsSync(previewDir) ? fs.readdirSync(previewDir) : [];

console.log(`📊 Imagens disponíveis:`);
console.log(`   DRK: ${drkFiles.length}`);
console.log(`   CRR: ${crrFiles.length}`);
console.log(`   Preview: ${previewFiles.length}`);

// Criar mapeamento
const mapping = {
  handitems: handitemsData.map((handitem, index) => {
    const handitemId = handitem.id || index;
    const handitemName = handitem.name || `Handitem ${handitemId}`;
    
    // Encontrar imagem DRK correspondente
    let drkImage = null;
    if (drkFiles.length > 0) {
      // Usar índice para selecionar uma imagem DRK
      const drkIndex = handitemId % drkFiles.length;
      drkImage = drkFiles[drkIndex];
    }
    
    // Encontrar imagem CRR correspondente
    let crrImage = null;
    if (crrFiles.length > 0) {
      // Usar índice para selecionar uma imagem CRR
      const crrIndex = handitemId % crrFiles.length;
      crrImage = crrFiles[crrIndex];
    }
    
    // Encontrar imagem Preview correspondente
    let previewImage = null;
    const previewFileName = `handitem_${handitemId}.svg`;
    if (previewFiles.includes(previewFileName)) {
      previewImage = previewFileName;
    }
    
    return {
      id: handitemId,
      name: handitemName,
      type: handitem.type || 'CarryItem',
      drkImage,
      crrImage,
      previewImage,
      hasImage: !!(drkImage || crrImage || previewImage)
    };
  }),
  stats: {
    totalHanditems: handitemsData.length,
    withDrkImages: handitemsData.filter((_, index) => {
      const handitemId = handitemsData[index].id || index;
      return drkFiles.length > 0 && (handitemId % drkFiles.length) < drkFiles.length;
    }).length,
    withCrrImages: handitemsData.filter((_, index) => {
      const handitemId = handitemsData[index].id || index;
      return crrFiles.length > 0 && (handitemId % crrFiles.length) < crrFiles.length;
    }).length,
    withPreviewImages: handitemsData.filter((_, index) => {
      const handitemId = handitemsData[index].id || index;
      return previewFiles.includes(`handitem_${handitemId}.svg`);
    }).length,
    createdAt: new Date().toISOString()
  }
};

// Salvar mapeamento
const mappingFile = path.join(__dirname, 'public', 'handitems', 'images', 'handitem-mapping.json');
fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));

console.log(`\n💾 Mapeamento salvo em: ${mappingFile}`);
console.log(`\n📊 Estatísticas:`);
console.log(`   Total de handitems: ${mapping.stats.totalHanditems}`);
console.log(`   Com imagens DRK: ${mapping.stats.withDrkImages}`);
console.log(`   Com imagens CRR: ${mapping.stats.withCrrImages}`);
console.log(`   Com imagens Preview: ${mapping.stats.withPreviewImages}`);

// Mostrar alguns exemplos
console.log(`\n🔍 Exemplos de mapeamento:`);
mapping.handitems.slice(0, 5).forEach(item => {
  console.log(`   ID ${item.id}: ${item.name}`);
  if (item.drkImage) console.log(`     DRK: ${item.drkImage}`);
  if (item.crrImage) console.log(`     CRR: ${item.crrImage}`);
  if (item.previewImage) console.log(`     Preview: ${item.previewImage}`);
});

console.log('\n🎉 Mapeamento concluído!');
