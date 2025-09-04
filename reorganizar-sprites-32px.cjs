const fs = require('fs');
const path = require('path');

// Script para reorganizar sprites usando 32px em vez de 64px
console.log('🎨 Reorganizando sprites com 32px...');

const petsSpritesDir = './public/assets/pets-sprites';
const outputDir = './public/assets/pets-organized-32px';

// Pets principais que queremos organizar
const mainPets = ['monkey', 'dog', 'cat', 'bear', 'dragon'];

// Criar pasta de saída
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Pasta criada:', outputDir);
}

// Função para organizar sprites de um pet com 32px
function organizePetSprites32px(petName) {
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
    
    console.log(`\n🐾 Organizando ${petName} com 32px (${pngFiles.length} sprites encontrados)`);
    
    // Procurar por sprites de 32px na posição idle (animação 0)
    const idleSprites = {};
    
    pngFiles.forEach(file => {
        // Padrão: pet_32_a_DIRECTION_0.png (32px, direção, animação 0)
        const match = file.match(new RegExp(`${petName}_32_a_(\\d+)_0\\.png`));
        if (match) {
            const direction = parseInt(match[1]);
            idleSprites[direction] = file;
        }
    });
    
    console.log(`✅ Encontrados sprites 32px para direções: ${Object.keys(idleSprites).sort().join(', ')}`);
    
    // Copiar sprites organizados
    const organizedSprites = {};
    Object.keys(idleSprites).forEach(direction => {
        const sourceFile = path.join(petDir, idleSprites[direction]);
        const targetFile = path.join(outputPetDir, `${petName}_idle_${direction}.png`);
        
        try {
            fs.copyFileSync(sourceFile, targetFile);
            organizedSprites[direction] = `${petName}_idle_${direction}.png`;
            
            // Verificar tamanho do arquivo
            const stats = fs.statSync(targetFile);
            const sizeKB = Math.round(stats.size / 1024);
            
            console.log(`  ✅ Direção ${direction}: ${idleSprites[direction]} → ${petName}_idle_${direction}.png (${sizeKB}KB)`);
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
        size: '32px',
        status: 'organized_32px',
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
    const config = organizePetSprites32px(petName);
    if (config) {
        allConfigs[petName] = config;
    }
});

// Criar arquivo de configuração geral
const generalConfig = {
    pets: allConfigs,
    totalPets: Object.keys(allConfigs).length,
    size: '32px',
    status: 'all_organized_32px',
    timestamp: new Date().toISOString()
};

const generalConfigPath = path.join(outputDir, 'pets-config.json');
fs.writeFileSync(generalConfigPath, JSON.stringify(generalConfig, null, 2));

console.log('\n🎉 Reorganização com 32px concluída!');
console.log(`📊 Total de pets organizados: ${Object.keys(allConfigs).length}`);
console.log(`📁 Sprites organizados em: ${outputDir}`);
console.log(`📄 Configuração geral: ${generalConfigPath}`);

// Mostrar resumo
Object.keys(allConfigs).forEach(petName => {
    const config = allConfigs[petName];
    console.log(`  🐾 ${petName}: ${config.totalSprites} direções (32px)`);
});

console.log('\n📋 Próximos passos:');
console.log('1. Verificar se os sprites 32px estão melhores');
console.log('2. Atualizar o Tamagotchi para usar sprites 32px');
console.log('3. Testar se os sprites aparecem completos');
