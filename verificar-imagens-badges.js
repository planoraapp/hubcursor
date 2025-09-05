const fs = require('fs');
const path = require('path');

// Verificar se as imagens existem
const badgesDir = path.join(__dirname, 'public', 'badges', 'c_images', 'album1584');

console.log('🔍 Verificando imagens de badges...');
console.log('📁 Diretório:', badgesDir);

// Listar alguns arquivos para verificar
const files = fs.readdirSync(badgesDir);
console.log(`📊 Total de arquivos: ${files.length}`);

// Verificar alguns códigos específicos
const testCodes = [
  'ACH_Ad1', 'ACH_AI1', 'ACH_Al1', 'ACH_Ba1', 'ACH_Ca1',
  'BR1', 'BR2', 'BR3', 'BR4', 'BR5',
  'BRA01', 'BRA02', 'BRA03', 'BRA04', 'BRA05',
  'BRB01', 'BRB02', 'BRB03', 'BRB04', 'BRB05'
];

console.log('\n🧪 Testando códigos específicos:');
testCodes.forEach(code => {
  const filePath = path.join(badgesDir, `${code}.gif`);
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${code}.gif`);
});

// Verificar se há arquivos com nomes similares
console.log('\n🔍 Procurando arquivos similares:');
const brFiles = files.filter(f => f.startsWith('BR') && f.endsWith('.gif'));
console.log(`📊 Arquivos BR encontrados: ${brFiles.length}`);
console.log('📋 Primeiros 10:', brFiles.slice(0, 10));

const achFiles = files.filter(f => f.startsWith('ACH_') && f.endsWith('.gif'));
console.log(`📊 Arquivos ACH_ encontrados: ${achFiles.length}`);
console.log('📋 Primeiros 10:', achFiles.slice(0, 10));

// Verificar se há problemas com nomes de arquivos
console.log('\n🔍 Verificando problemas de nomenclatura:');
const problematicFiles = files.filter(f => f.includes(' ') || f.includes('..'));
if (problematicFiles.length > 0) {
  console.log('⚠️ Arquivos com problemas:', problematicFiles);
} else {
  console.log('✅ Nenhum problema de nomenclatura encontrado');
}
