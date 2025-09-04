const fs = require('fs');
const path = require('path');

// Script para investigar todas as animações disponíveis
console.log('🔍 Investigando todas as animações disponíveis...');

const petsSpritesDir = './public/assets/pets-sprites';
const mainPets = ['monkey', 'dog', 'cat', 'bear', 'dragon'];

// Função para investigar todas as animações de um pet
function investigateAllAnimations(petName) {
    const petDir = path.join(petsSpritesDir, petName);
    
    if (!fs.existsSync(petDir)) {
        console.log(`❌ Pasta do pet ${petName} não encontrada`);
        return;
    }
    
    const files = fs.readdirSync(petDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    
    console.log(`\n🐾 Investigando ${petName} - todas as animações (${pngFiles.length} sprites encontrados)`);
    
    // Agrupar por animação
    const animations = {};
    
    pngFiles.forEach(file => {
        // Padrão: pet_SIZE_a_DIRECTION_ANIMATION.png
        const match = file.match(new RegExp(`${petName}_64_a_(\\d+)_(\\d+)\\.png`));
        if (match) {
            const direction = parseInt(match[1]);
            const animation = match[2];
            
            if (!animations[animation]) {
                animations[animation] = {
                    directions: new Set(),
                    files: [],
                    totalSize: 0
                };
            }
            
            animations[animation].directions.add(direction);
            animations[animation].files.push(file);
            
            // Calcular tamanho total
            const filePath = path.join(petDir, file);
            const stats = fs.statSync(filePath);
            animations[animation].totalSize += stats.size;
        }
    });
    
    // Mostrar animações ordenadas por número de direções
    const sortedAnimations = Object.keys(animations).sort((a, b) => {
        const aDirections = animations[a].directions.size;
        const bDirections = animations[b].directions.size;
        if (aDirections !== bDirections) {
            return bDirections - aDirections; // Mais direções primeiro
        }
        // Se mesmo número de direções, ordenar por tamanho médio
        const aAvgSize = animations[a].totalSize / animations[a].files.length;
        const bAvgSize = animations[b].totalSize / animations[b].files.length;
        return bAvgSize - aAvgSize;
    });
    
    console.log(`📊 Animações encontradas: ${sortedAnimations.length}`);
    
    // Mostrar as melhores animações
    sortedAnimations.slice(0, 10).forEach(animation => {
        const anim = animations[animation];
        const directions = Array.from(anim.directions).sort();
        const avgSizeKB = Math.round(anim.totalSize / anim.files.length / 1024);
        
        console.log(`  🎬 Animação ${animation}: ${anim.directions.size} direções [${directions.join(', ')}] - ${avgSizeKB}KB médio`);
        
        // Mostrar direções específicas se tiver muitas
        if (anim.directions.size >= 5) {
            console.log(`    ✅ Boa candidata! Tem direções: ${directions.join(', ')}`);
        }
    });
    
    // Procurar por animações com direções específicas (0-7)
    console.log(`\n🔍 Procurando animações com direções específicas para ${petName}:`);
    
    const targetDirections = [0, 1, 2, 3, 4, 5, 6, 7];
    
    sortedAnimations.forEach(animation => {
        const anim = animations[animation];
        const directions = Array.from(anim.directions);
        
        // Verificar se tem muitas direções do target
        const matchingDirections = targetDirections.filter(d => anim.directions.has(d));
        
        if (matchingDirections.length >= 5) {
            console.log(`  🎯 Animação ${animation}: ${matchingDirections.length}/8 direções [${matchingDirections.join(', ')}]`);
        }
    });
    
    return animations;
}

// Investigar todos os pets
const allAnimations = {};
mainPets.forEach(petName => {
    const animations = investigateAllAnimations(petName);
    if (animations) {
        allAnimations[petName] = animations;
    }
});

console.log('\n🔍 Investigação concluída!');
console.log('\n💡 Resumo das melhores animações:');

mainPets.forEach(petName => {
    if (allAnimations[petName]) {
        const animations = allAnimations[petName];
        const sortedAnimations = Object.keys(animations).sort((a, b) => {
            return animations[b].directions.size - animations[a].directions.size;
        });
        
        const bestAnimation = sortedAnimations[0];
        const bestAnim = animations[bestAnimation];
        const directions = Array.from(bestAnim.directions).sort();
        
        console.log(`🐾 ${petName}: Animação ${bestAnimation} com ${bestAnim.directions.size} direções [${directions.join(', ')}]`);
    }
});

console.log('\n📋 Próximos passos:');
console.log('1. Escolher as melhores animações para cada pet');
console.log('2. Organizar sprites com as animações escolhidas');
console.log('3. Atualizar o Tamagotchi para usar as melhores animações');
