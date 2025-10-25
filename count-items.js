const fs = require('fs');
const path = require('path');

// Ler o figuredata.xml
const figuredataPath = path.join(__dirname, 'public/handitems/gamedata/figuredata.xml');

if (!fs.existsSync(figuredataPath)) {
  console.log('❌ figuredata.xml não encontrado');
  process.exit(1);
}

const xmlContent = fs.readFileSync(figuredataPath, 'utf8');

// Contar sets por tipo
const setMatches = xmlContent.match(/<set[^>]*>/g) || [];
console.log(`📊 Total de sets encontrados: ${setMatches.length}`);

// Contar por tipo
const typeCounts = {};
setMatches.forEach(set => {
  const typeMatch = set.match(/type="([^"]+)"/);
  if (typeMatch) {
    const type = typeMatch[1];
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }
});

// Mapear tipos para nomes amigáveis
const typeNames = {
  'hd': 'Rostos',
  'hr': 'Cabelos', 
  'ha': 'Chapéus',
  'he': 'Acessórios de Cabeça',
  'ea': 'Óculos',
  'fa': 'Máscaras',
  'ch': 'Camisetas',
  'cc': 'Casacos/Vestidos',
  'cp': 'Estampas',
  'ca': 'Acessórios do Peito',
  'lg': 'Calças',
  'sh': 'Sapatos',
  'wa': 'Cintos'
};

console.log('\n📋 Itens por categoria:');
Object.entries(typeCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    const name = typeNames[type] || type;
    console.log(`  ${type} (${name}): ${count} itens`);
  });

// Focar na categoria lg (calças)
if (typeCounts['lg']) {
  console.log(`\n🎯 CALÇAS (lg): ${typeCounts['lg']} itens`);
} else {
  console.log('\n❌ Nenhuma calça encontrada na categoria lg');
}
