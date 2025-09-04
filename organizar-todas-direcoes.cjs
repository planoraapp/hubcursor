const fs = require('fs');
const path = require('path');

// Script para organizar todas as direções de 0 a 7 dos sprites
console.log('🎨 Organizando todas as direções de 0 a 7...');

const petsSpritesDir = './public/assets/pets-sprites';
const outputDir = './public/assets/pets-organized-complete';

// Pets principais que queremos organizar
const mainPets = ['monkey', 'dog', 'cat', 'bear', 'dragon'];

// Criar pasta de saída
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Pasta criada:', outputDir);
}

// Função para organizar todas as direções de um pet
function organizeAllDirections(petName) {
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
    
    console.log(`\n🐾 Organizando ${petName} - todas as direções (${pngFiles.length} sprites encontrados)`);
    
    // Procurar por sprites de 64px com todas as direções
    const allDirections = {};
    const directionsFound = new Set();
    
    // Primeiro, tentar animação 100 (que parece ter sprites maiores)
    pngFiles.forEach(file => {
        const match = file.match(new RegExp(`${petName}_64_a_(\\d+)_100\\.png`));
        if (match) {
            const direction = parseInt(match[1]);
            allDirections[direction] = file;
            directionsFound.add(direction);
        }
    });
    
    // Se não encontrou animação 100, tentar outras animações
    if (Object.keys(allDirections).length === 0) {
        [200, 300, 400, 500, 600, 700, 800, 900].forEach(animation => {
            pngFiles.forEach(file => {
                const match = file.match(new RegExp(`${petName}_64_a_(\\d+)_${animation}\\.png`));
                if (match) {
                    const direction = parseInt(match[1]);
                    if (!allDirections[direction]) {
                        allDirections[direction] = file;
                        directionsFound.add(direction);
                    }
                }
            });
        });
    }
    
    // Se ainda não encontrou, tentar animação 0
    if (Object.keys(allDirections).length === 0) {
        pngFiles.forEach(file => {
            const match = file.match(new RegExp(`${petName}_64_a_(\\d+)_0\\.png`));
            if (match) {
                const direction = parseInt(match[1]);
                allDirections[direction] = file;
                directionsFound.add(direction);
            }
        });
    }
    
    console.log(`✅ Encontradas direções: ${Array.from(directionsFound).sort().join(', ')}`);
    
    // Copiar sprites organizados
    const organizedSprites = {};
    Object.keys(allDirections).forEach(direction => {
        const sourceFile = path.join(petDir, allDirections[direction]);
        const targetFile = path.join(outputPetDir, `${petName}_idle_${direction}.png`);
        
        try {
            fs.copyFileSync(sourceFile, targetFile);
            organizedSprites[direction] = `${petName}_idle_${direction}.png`;
            
            // Verificar tamanho do arquivo
            const stats = fs.statSync(targetFile);
            const sizeKB = Math.round(stats.size / 1024);
            
            console.log(`  ✅ Direção ${direction}: ${allDirections[direction]} → ${petName}_idle_${direction}.png (${sizeKB}KB)`);
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
        directions: Array.from(directionsFound).sort(),
        status: 'organized_complete',
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
    const config = organizeAllDirections(petName);
    if (config) {
        allConfigs[petName] = config;
    }
});

// Criar arquivo de configuração geral
const generalConfig = {
    pets: allConfigs,
    totalPets: Object.keys(allConfigs).length,
    status: 'all_organized_complete',
    timestamp: new Date().toISOString()
};

const generalConfigPath = path.join(outputDir, 'pets-config.json');
fs.writeFileSync(generalConfigPath, JSON.stringify(generalConfig, null, 2));

console.log('\n🎉 Organização completa concluída!');
console.log(`📊 Total de pets organizados: ${Object.keys(allConfigs).length}`);
console.log(`📁 Sprites organizados em: ${outputDir}`);
console.log(`📄 Configuração geral: ${generalConfigPath}`);

// Mostrar resumo
Object.keys(allConfigs).forEach(petName => {
    const config = allConfigs[petName];
    console.log(`  🐾 ${petName}: ${config.totalSprites} direções [${config.directions.join(', ')}]`);
});

console.log('\n📋 Próximos passos:');
console.log('1. Verificar se todas as direções estão disponíveis');
console.log('2. Atualizar o Tamagotchi para usar todas as direções');
console.log('3. Testar a rotação completa de 0 a 7');
