const fs = require('fs');
const path = require('path');

// Script para investigar sprites e encontrar alternativas mais completas
console.log('🔍 Investigando sprites dos pets...');

const petsSpritesDir = './public/assets/pets-sprites';
const mainPets = ['monkey', 'dog', 'cat', 'bear', 'dragon'];

// Função para investigar sprites de um pet
function investigatePetSprites(petName) {
    const petDir = path.join(petsSpritesDir, petName);
    
    if (!fs.existsSync(petDir)) {
        console.log(`❌ Pasta do pet ${petName} não encontrada`);
        return;
    }
    
    const files = fs.readdirSync(petDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    
    console.log(`\n🐾 Investigando ${petName} (${pngFiles.length} sprites encontrados)`);
    
    // Agrupar por tamanho e animação
    const spritesBySize = {};
    const spritesByAnimation = {};
    
    pngFiles.forEach(file => {
        // Padrão: pet_SIZE_a_DIRECTION_ANIMATION.png
        const match = file.match(new RegExp(`${petName}_(\\d+)_a_(\\d+)_(\\d+)\\.png`));
        if (match) {
            const size = match[1];
            const direction = match[2];
            const animation = match[3];
            
            if (!spritesBySize[size]) spritesBySize[size] = [];
            if (!spritesByAnimation[animation]) spritesByAnimation[animation] = [];
            
            spritesBySize[size].push(file);
            spritesByAnimation[animation].push(file);
        }
    });
    
    // Mostrar sprites por tamanho
    Object.keys(spritesBySize).sort().forEach(size => {
        const files = spritesBySize[size];
        console.log(`  📏 Tamanho ${size}px: ${files.length} sprites`);
        
        // Verificar tamanhos dos arquivos
        const fileSizes = {};
        files.forEach(file => {
            const filePath = path.join(petDir, file);
            const stats = fs.statSync(filePath);
            const sizeKB = Math.round(stats.size / 1024);
            
            if (!fileSizes[sizeKB]) fileSizes[sizeKB] = [];
            fileSizes[sizeKB].push(file);
        });
        
        Object.keys(fileSizes).sort((a, b) => parseInt(a) - parseInt(b)).forEach(sizeKB => {
            console.log(`    📄 ${sizeKB}KB: ${fileSizes[sizeKB].length} arquivos`);
        });
    });
    
    // Mostrar sprites por animação
    Object.keys(spritesByAnimation).sort().forEach(animation => {
        const files = spritesByAnimation[animation];
        console.log(`  🎬 Animação ${animation}: ${files.length} sprites`);
    });
    
    // Procurar por sprites que podem estar mais completos
    console.log(`\n🔍 Procurando sprites alternativos para ${petName}:`);
    
    // Tentar diferentes animações (não apenas 0)
    [1, 2, 3, 4, 5].forEach(animation => {
        const animationSprites = pngFiles.filter(file => {
            const match = file.match(new RegExp(`${petName}_64_a_(\\d+)_${animation}\\.png`));
            return match;
        });
        
        if (animationSprites.length > 0) {
            console.log(`  🎬 Animação ${animation}: ${animationSprites.length} sprites encontrados`);
            
            // Verificar tamanho dos arquivos
            animationSprites.forEach(file => {
                const filePath = path.join(petDir, file);
                const stats = fs.statSync(filePath);
                const sizeKB = Math.round(stats.size / 1024);
                console.log(`    📄 ${file}: ${sizeKB}KB`);
            });
        }
    });
}

// Investigar todos os pets
mainPets.forEach(investigatePetSprites);

console.log('\n🔍 Investigação concluída!');
console.log('\n💡 Possíveis soluções:');
console.log('1. Usar animações diferentes (não apenas 0)');
console.log('2. Usar sprites de tamanho diferente');
console.log('3. Verificar se há sprites com melhor qualidade');
console.log('4. Ajustar CSS para melhor renderização');
