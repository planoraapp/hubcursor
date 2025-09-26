const fs = require('fs');

console.log('🔍 Analisando handitems.json...');

try {
  const handitems = JSON.parse(fs.readFileSync('public/handitems.json', 'utf8'));
  
  console.log('Total de itens:', handitems.length);

  // Verificar duplicatas
  const ids = handitems.map(item => item.id);
  const uniqueIds = [...new Set(ids)];
  console.log('IDs únicos:', uniqueIds.length);
  console.log('Duplicatas encontradas:', ids.length - uniqueIds.length);

  if (ids.length !== uniqueIds.length) {
    console.log('❌ Duplicatas encontradas!');
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    console.log('IDs duplicados:', [...new Set(duplicates)]);
    
    // Mostrar exemplos de duplicatas
    const duplicateIds = [...new Set(duplicates)];
    duplicateIds.slice(0, 5).forEach(dupId => {
      const items = handitems.filter(item => item.id === dupId);
      console.log(`ID ${dupId}:`, items.map(item => item.name));
    });
  } else {
    console.log('✅ Nenhuma duplicata encontrada');
  }

  // Verificar alguns exemplos
  console.log('\n📋 Primeiros 10 itens:');
  handitems.slice(0, 10).forEach(item => {
    console.log(`ID: ${item.id} - ${item.name}`);
  });

} catch (error) {
  console.error('❌ Erro:', error.message);
}
