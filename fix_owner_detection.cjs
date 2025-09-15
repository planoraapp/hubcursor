const fs = require('fs');
const path = require('path');

// Caminho para o arquivo
const filePath = path.join(__dirname, 'src', 'hooks', 'useHabboHomeV2.tsx');

// Ler o arquivo
let content = fs.readFileSync(filePath, 'utf8');

// Substituir todas as ocorrências de habbo_username por habbo_name
content = content.replace(/habboAccount\?\.habbo_username/g, 'habboAccount?.habbo_name');

// Salvar o arquivo corrigido
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Arquivo corrigido! Todas as referências habbo_username foram alteradas para habbo_name.');
