const fs = require('fs');
const path = require('path');

console.log('🔄 Atualizando mapeamento de handitems...');

const filePath = path.join(__dirname, 'src', 'components', 'tools', 'UnifiedCatalog.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ler o mapeamento completo
const mappingContent = fs.readFileSync('handitem-mapping-complete.js', 'utf8');
const realImagesMatch = mappingContent.match(/const realImages = \{[\s\S]*?\};/);
if (!realImagesMatch) {
  console.error('❌ Não foi possível extrair o mapeamento');
  process.exit(1);
}

const newMapping = realImagesMatch[0].replace('const realImages = ', '');

// Substituir o mapeamento antigo
const oldMappingRegex = /const realImages: \{ \[key: number\]: string \} = \{[\s\S]*?\};/;
content = content.replace(oldMappingRegex, `const realImages: { [key: number]: string } = ${newMapping}`);

// Remover a API do Habbo e usar apenas placeholder como fallback
const apiRegex = /\/\/ Usar imagem real se disponível[\s\S]*?return '\/assets\/handitem_placeholder\.png';/;
const newFallback = `// Usar imagem real se disponível
    if (realImages[handitem.id]) {
      return realImages[handitem.id];
    }
    
    // Fallback: placeholder local
    return '/assets/handitem_placeholder.png';`;

content = content.replace(apiRegex, newFallback);

fs.writeFileSync(filePath, content);

console.log('✅ Mapeamento atualizado com sucesso!');
console.log('🎯 Agora usa apenas imagens reais da ViaJovem + placeholder');
