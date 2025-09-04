const fs = require('fs');
const path = require('path');

// Script para verificar se os sprites estão corretos
console.log('🔍 Verificando sprites dos pets...');

const petsDir = './public/assets/pets-organized';
const mainPets = ['monkey', 'dog', 'cat', 'bear', 'dragon'];

// Função para verificar sprites de um pet
function verifyPetSprites(petName) {
    const petDir = path.join(petsDir, petName);
    
    if (!fs.existsSync(petDir)) {
        console.log(`❌ Pasta do pet ${petName} não encontrada`);
        return;
    }
    
    const files = fs.readdirSync(petDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    
    console.log(`\n🐾 Verificando ${petName}:`);
    console.log(`  📁 Arquivos PNG encontrados: ${pngFiles.length}`);
    
    pngFiles.forEach(file => {
        const filePath = path.join(petDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        
        console.log(`  📄 ${file}: ${sizeKB}KB`);
        
        // Verificar se o arquivo é muito pequeno (pode indicar problema)
        if (sizeKB < 1) {
            console.log(`    ⚠️  Arquivo muito pequeno - pode estar corrompido`);
        }
    });
    
    // Verificar configuração
    const configPath = path.join(petDir, 'config.json');
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(`  📋 Configuração: ${config.totalSprites} sprites organizados`);
    }
}

// Verificar todos os pets
mainPets.forEach(verifyPetSprites);

console.log('\n🔍 Verificação concluída!');
console.log('\n💡 Possíveis problemas:');
console.log('1. Sprites muito pequenos podem estar corrompidos');
console.log('2. Sprites podem estar incompletos (sem cabeça)');
console.log('3. Pode ser necessário usar sprites de tamanho diferente');
console.log('4. Pode ser necessário usar sprites de animação diferente');

// Verificar se há sprites alternativos
console.log('\n🔍 Verificando sprites alternativos...');
const originalSpritesDir = './public/assets/pets-sprites';

mainPets.forEach(petName => {
    const petDir = path.join(originalSpritesDir, petName);
    if (fs.existsSync(petDir)) {
        const files = fs.readdirSync(petDir);
        const pngFiles = files.filter(file => file.endsWith('.png'));
        
        // Procurar por sprites de tamanhos diferentes
        const sizes = new Set();
        pngFiles.forEach(file => {
            const match = file.match(/_(\d+)_/);
            if (match) {
                sizes.add(match[1]);
            }
        });
        
        console.log(`🐾 ${petName}: Tamanhos disponíveis: ${Array.from(sizes).sort().join(', ')}px`);
    }
});
