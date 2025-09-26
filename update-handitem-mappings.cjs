const fs = require('fs');
const path = require('path');

console.log('🔍 Atualizando mapeamentos de handitems...\n');

// Ler o arquivo de mapeamento
const mappingFile = path.join(__dirname, 'public', 'handitems', 'images', 'handitem-mapping.json');
if (!fs.existsSync(mappingFile)) {
  console.log('❌ Arquivo de mapeamento não encontrado');
  process.exit(1);
}

const mappingData = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
console.log(`📋 Encontrados ${mappingData.handitems.length} handitems no mapeamento`);

// Gerar mapeamento TypeScript para o HanditemImageDiscovery
const generateMappings = () => {
  const drkMappings = {};
  const crrMappings = {};
  
  mappingData.handitems.forEach(item => {
    if (item.drkImage) {
      drkMappings[item.id] = item.drkImage;
    }
    if (item.crrImage) {
      crrMappings[item.id] = item.crrImage;
    }
  });
  
  return { drkMappings, crrMappings };
};

const { drkMappings, crrMappings } = generateMappings();

console.log(`📊 Mapeamentos gerados:`);
console.log(`   DRK: ${Object.keys(drkMappings).length} handitems`);
console.log(`   CRR: ${Object.keys(crrMappings).length} handitems`);

// Atualizar o arquivo HanditemImageDiscovery.ts
const handitemDiscoveryFile = path.join(__dirname, 'src', 'services', 'HanditemImageDiscovery.ts');
let content = fs.readFileSync(handitemDiscoveryFile, 'utf8');

// Substituir o mapeamento hardcoded
const newDrkMappings = Object.entries(drkMappings)
  .map(([id, filename]) => `      ${id}: '${filename}'`)
  .join(',\n');

const newCrrMappings = Object.entries(crrMappings)
  .map(([id, filename]) => `      ${id}: '${filename}'`)
  .join(',\n');

// Atualizar DRK mappings
content = content.replace(
  /const mappings: \{ \[key: number\]: \{ drk: string; crr: string \} \} = \{[\s\S]*?\};/,
  `const mappings: { [key: number]: { drk: string; crr: string } } = {
${Object.entries(drkMappings).map(([id, drkFile]) => {
  const crrFile = crrMappings[id] || 'hblooza14_track_crr_icon.png';
  return `      ${id}: { drk: '${drkFile}', crr: '${crrFile}' }`;
}).join(',\n')}
    };`
);

fs.writeFileSync(handitemDiscoveryFile, content);

console.log(`\n💾 HanditemImageDiscovery.ts atualizado`);
console.log(`\n🔍 Exemplos de mapeamento atualizado:`);

// Mostrar alguns exemplos
Object.entries(drkMappings).slice(0, 5).forEach(([id, filename]) => {
  console.log(`   ID ${id}: ${filename}`);
});

console.log('\n🎉 Mapeamentos atualizados com sucesso!');
