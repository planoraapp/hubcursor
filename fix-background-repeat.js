const fs = require('fs');
const path = require('path');

// Lista de arquivos que precisam ser corrigidos
const filesToFix = [
  'src/pages/AltCodes.tsx',
  'src/pages/AvatarEditor.tsx',
  'src/pages/Catalogo.tsx',
  'src/pages/Emblemas.tsx',
  'src/pages/Eventos.tsx',
  'src/pages/HanditemCatalog.tsx',
  'src/pages/Mercado.tsx',
  'src/pages/Noticias.tsx',
  'src/pages/NotFound.tsx',
  'src/components/HabboHomeRedirect.tsx'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Padrão para encontrar bg-repeat com style inline
    const pattern = /className="([^"]*bg-repeat[^"]*)"\s+style=\{\{\s*backgroundImage:\s*['"]url\([^)]+\)['"]\s*\}\}/g;
    
    // Substituição com backgroundRepeat: 'repeat'
    const replacement = 'className="$1" style={{ \n        backgroundImage: \'url(/assets/bghabbohub.png)\',\n        backgroundRepeat: \'repeat\'\n      }}';
    
    const newContent = content.replace(pattern, replacement);
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Corrigido: ${filePath}`);
    } else {
      console.log(`ℹ️  Nenhuma mudança necessária: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

console.log('🔧 Iniciando correção automática dos backgrounds...\n');

filesToFix.forEach(fixFile);

console.log('\n✨ Correção concluída!');
console.log('💡 Execute "npm run build" para verificar se tudo está funcionando.');

