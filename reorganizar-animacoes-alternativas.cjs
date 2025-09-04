const fs = require('fs');
const path = require('path');

// Script para reorganizar sprites usando animações alternativas
console.log('🎨 Reorganizando sprites com animações alternativas...');

const petsSpritesDir = './public/assets/pets-sprites';
const outputDir = './public/assets/pets-organized-alt';

// Pets principais que queremos organizar
const mainPets = ['monkey', 'dog', 'cat', 'bear', 'dragon'];

// Animações alternativas para tentar (em ordem de preferência)
const alternativeAnimations = [100, 200, 300, 400, 500, 600, 700, 800, 900];

// Criar pasta de saída
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Pasta criada:', outputDir);
}

// Função para organizar sprites de um pet com animações alternativas
function organizePetSpritesAlt(petName) {
    const petDir = path.join(petsSpritesDir, petName);
    const outputPetDir = path.join(outputDir, petName);
    
    if (!fs.existsSync(petDir)) {
        console.log(`❌ Pasta do pet ${petName} não encontrada`);
        return;
    }
    
    // Criar pasta do pet
    if (!fs.existsSync(outputPetDir)) {
        fs.mkdirSync(outputPetDir, { recursive: true });
    }
    
    const files = fs.readdirSync(petDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    
    console.log(`\n🐾 Organizando ${petName} com animações alternativas (${pngFiles.length} sprites encontrados)`);
    
    // Procurar por sprites de 64px com animações alternativas
    let bestAnimation = null;
    let bestSprites = {};
    
    for (const animation of alternativeAnimations) {
        const animationSprites = {};
        
        pngFiles.forEach(file => {
            // Padrão: pet_64_a_DIRECTION_ANIMATION.png (64px, direção, animação)
            const match = file.match(new RegExp(`${petName}_64_a_(\\d+)_${animation}\\.png`));
            if (match) {
                const direction = parseInt(match[1]);
                animationSprites[direction] = file;
            }
        });
        
        // Se encontrou sprites para esta animação
        if (Object.keys(animationSprites).length > 0) {
            console.log(`  🎬 Animação ${animation}: ${Object.keys(animationSprites).length} sprites encontrados`);
            
            // Verificar tamanho dos arquivos
            let totalSize = 0;
            Object.keys(animationSprites).forEach(direction => {
                const filePath = path.join(petDir, animationSprites[direction]);
                const stats = fs.statSync(filePath);
                totalSize += stats.size;
            });
            
            const avgSizeKB = Math.round(totalSize / Object.keys(animationSprites).length / 1024);
            console.log(`    📏 Tamanho médio: ${avgSizeKB}KB por sprite`);
            
            // Se esta animação tem mais sprites ou sprites maiores, usar ela
            if (Object.keys(animationSprites).length > Object.keys(bestSprites).length || 
                (Object.keys(animationSprites).length === Object.keys(bestSprites).length && avgSizeKB > 1)) {
                bestAnimation = animation;
                bestSprites = animationSprites;
            }
        }
    }
    
    if (Object.keys(bestSprites).length === 0) {
        console.log(`  ❌ Nenhuma animação alternativa encontrada para ${petName}`);
        return;
    }
    
    console.log(`  ✅ Usando animação ${bestAnimation} com ${Object.keys(bestSprites).length} sprites`);
    
    // Copiar sprites organizados
    const organizedSprites = {};
    Object.keys(bestSprites).forEach(direction => {
        const sourceFile = path.join(petDir, bestSprites[direction]);
        const targetFile = path.join(outputPetDir, `${petName}_idle_${direction}.png`);
        
        try {
            fs.copyFileSync(sourceFile, targetFile);
            organizedSprites[direction] = `${petName}_idle_${direction}.png`;
            
            // Verificar tamanho do arquivo
            const stats = fs.statSync(targetFile);
            const sizeKB = Math.round(stats.size / 1024);
            
            console.log(`  ✅ Direção ${direction}: ${bestSprites[direction]} → ${petName}_idle_${direction}.png (${sizeKB}KB)`);
        } catch (error) {
            console.log(`  ❌ Erro ao copiar direção ${direction}: ${error.message}`);
        }
    });
    
    // Criar arquivo de configuração
    const config = {
        name: petName,
        id: petName,
        sprites: {
            idle: organizedSprites
        },
        totalSprites: Object.keys(organizedSprites).length,
        animation: bestAnimation,
        status: 'organized_alt',
        timestamp: new Date().toISOString()
    };
    
    const configPath = path.join(outputPetDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`📄 Configuração salva: ${configPath}`);
    return config;
}

// Organizar todos os pets principais
const allConfigs = {};
mainPets.forEach(petName => {
    const config = organizePetSpritesAlt(petName);
    if (config) {
        allConfigs[petName] = config;
    }
});

// Criar arquivo de configuração geral
const generalConfig = {
    pets: allConfigs,
    totalPets: Object.keys(allConfigs).length,
    status: 'all_organized_alt',
    timestamp: new Date().toISOString()
};

const generalConfigPath = path.join(outputDir, 'pets-config.json');
fs.writeFileSync(generalConfigPath, JSON.stringify(generalConfig, null, 2));

console.log('\n🎉 Reorganização com animações alternativas concluída!');
console.log(`📊 Total de pets organizados: ${Object.keys(allConfigs).length}`);
console.log(`📁 Sprites organizados em: ${outputDir}`);
console.log(`📄 Configuração geral: ${generalConfigPath}`);

// Mostrar resumo
Object.keys(allConfigs).forEach(petName => {
    const config = allConfigs[petName];
    console.log(`  🐾 ${petName}: ${config.totalSprites} direções (animação ${config.animation})`);
});

console.log('\n📋 Próximos passos:');
console.log('1. Verificar se os sprites alternativos estão melhores');
console.log('2. Atualizar o Tamagotchi para usar sprites alternativos');
console.log('3. Testar se os sprites aparecem completos');
