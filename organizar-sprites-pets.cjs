const fs = require('fs');
const path = require('path');

// Script para organizar os sprites dos pets extraídos
console.log('🎨 Organizando sprites dos pets...');

const petsSpritesDir = './public/assets/pets-sprites';
const outputDir = './public/assets/pets-organized';

// Pets principais que queremos organizar
const mainPets = ['monkey', 'dog', 'cat', 'bear', 'dragon'];

// Criar pasta de saída
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Pasta criada:', outputDir);
}

// Função para organizar sprites de um pet
function organizePetSprites(petName) {
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
    
    console.log(`\n🐾 Organizando ${petName} (${pngFiles.length} sprites encontrados)`);
    
    // Procurar por sprites de 64px na posição idle (animação 0)
    const idleSprites = {};
    
    pngFiles.forEach(file => {
        // Padrão: pet_64_a_DIRECTION_0.png (64px, direção, animação 0)
        const match = file.match(new RegExp(`${petName}_64_a_(\\d+)_0\\.png`));
        if (match) {
            const direction = parseInt(match[1]);
            idleSprites[direction] = file;
        }
    });
    
    // Se não encontrou sprites de 64px, tentar 32px
    if (Object.keys(idleSprites).length === 0) {
        pngFiles.forEach(file => {
            const match = file.match(new RegExp(`${petName}_32_a_(\\d+)_0\\.png`));
            if (match) {
                const direction = parseInt(match[1]);
                idleSprites[direction] = file;
            }
        });
    }
    
    console.log(`✅ Encontrados sprites para direções: ${Object.keys(idleSprites).sort().join(', ')}`);
    
    // Copiar sprites organizados
    const organizedSprites = {};
    Object.keys(idleSprites).forEach(direction => {
        const sourceFile = path.join(petDir, idleSprites[direction]);
        const targetFile = path.join(outputPetDir, `${petName}_idle_${direction}.png`);
        
        try {
            fs.copyFileSync(sourceFile, targetFile);
            organizedSprites[direction] = `${petName}_idle_${direction}.png`;
            console.log(`  ✅ Direção ${direction}: ${idleSprites[direction]} → ${petName}_idle_${direction}.png`);
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
        status: 'organized',
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
    const config = organizePetSprites(petName);
    if (config) {
        allConfigs[petName] = config;
    }
});

// Criar arquivo de configuração geral
const generalConfig = {
    pets: allConfigs,
    totalPets: Object.keys(allConfigs).length,
    status: 'all_organized',
    timestamp: new Date().toISOString()
};

const generalConfigPath = path.join(outputDir, 'pets-config.json');
fs.writeFileSync(generalConfigPath, JSON.stringify(generalConfig, null, 2));

console.log('\n🎉 Organização concluída!');
console.log(`📊 Total de pets organizados: ${Object.keys(allConfigs).length}`);
console.log(`📁 Sprites organizados em: ${outputDir}`);
console.log(`📄 Configuração geral: ${generalConfigPath}`);

// Mostrar resumo
Object.keys(allConfigs).forEach(petName => {
    const config = allConfigs[petName];
    console.log(`  🐾 ${petName}: ${config.totalSprites} direções`);
});

console.log('\n📋 Próximos passos:');
console.log('1. Verificar se os sprites estão corretos');
console.log('2. Atualizar o Tamagotchi para usar os sprites reais');
console.log('3. Testar a rotação com sprites reais');
