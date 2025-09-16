const fs = require('fs');

console.log('🔧 Corrigindo duplicatas no handitems.json...');

try {
  const handitems = JSON.parse(fs.readFileSync('public/handitems.json', 'utf8'));
  
  console.log('Total de itens antes:', handitems.length);

  // Remover duplicatas mantendo o primeiro
  const seen = new Set();
  const uniqueHanditems = handitems.filter(item => {
    if (seen.has(item.id)) {
      console.log(`❌ Removendo duplicata: ID ${item.id} - ${item.name}`);
      return false;
    }
    seen.add(item.id);
    return true;
  });

  console.log('Total de itens depois:', uniqueHanditems.length);
  console.log('Duplicatas removidas:', handitems.length - uniqueHanditems.length);

  // Salvar arquivo corrigido
  fs.writeFileSync('public/handitems.json', JSON.stringify(uniqueHanditems, null, 2));
  
  console.log('✅ Arquivo corrigido salvo!');

} catch (error) {
  console.error('❌ Erro:', error.message);
}
