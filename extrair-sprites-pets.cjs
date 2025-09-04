const fs = require('fs');
const path = require('path');

// Script para extrair sprites dos pets dos SWFs
console.log('🐾 Iniciando extração de sprites dos pets...');

const petsSwfDir = './pets-swf/gordon/flash-assets-PRODUCTION-202509011553-548761917';
const outputDir = './public/assets/pets-sprites';

// Criar pasta de saída
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Pasta criada:', outputDir);
}

// Lista dos pets principais que queremos extrair
const mainPets = [
    'monkey.swf',
    'dog.swf', 
    'cat.swf',
    'bear.swf',
    'dragon.swf'
];

// Verificar quais SWFs existem
const existingSwfs = fs.readdirSync(petsSwfDir).filter(file => file.endsWith('.swf'));
console.log('📋 SWFs encontrados:', existingSwfs.length);

// Filtrar apenas os pets principais que existem
const availablePets = mainPets.filter(pet => existingSwfs.includes(pet));
console.log('🎯 Pets principais disponíveis:', availablePets);

// Para cada pet, vamos criar um arquivo de configuração
availablePets.forEach(petFile => {
    const petName = petFile.replace('.swf', '');
    const swfPath = path.join(petsSwfDir, petFile);
    
    console.log(`\n🐾 Processando: ${petName}`);
    console.log(`📁 SWF: ${swfPath}`);
    
    // Criar pasta para o pet
    const petDir = path.join(outputDir, petName);
    if (!fs.existsSync(petDir)) {
        fs.mkdirSync(petDir, { recursive: true });
    }
    
    // Criar arquivo de configuração para o pet
    const config = {
        name: petName,
        swfFile: petFile,
        swfPath: swfPath,
        sprites: {
            // 8 direções (0-7) para cada animação
            idle: {
                0: `${petName}_idle_0.png`, // Frente
                1: `${petName}_idle_1.png`, // Frente-direita
                2: `${petName}_idle_2.png`, // Direita
                3: `${petName}_idle_3.png`, // Trás-direita
                4: `${petName}_idle_4.png`, // Trás
                5: `${petName}_idle_5.png`, // Trás-esquerda
                6: `${petName}_idle_6.png`, // Esquerda
                7: `${petName}_idle_7.png`  // Frente-esquerda
            }
        },
        extracted: false,
        timestamp: new Date().toISOString()
    };
    
    // Salvar configuração
    const configPath = path.join(petDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`✅ Configuração criada: ${configPath}`);
});

console.log('\n🎉 Configurações criadas!');
console.log('\n📋 Próximos passos:');
console.log('1. Use o JPEXS Free Flash Decompiler para abrir os SWFs');
console.log('2. Extraia os sprites de cada pet (8 direções)');
console.log('3. Salve as imagens PNG nas pastas correspondentes');
console.log('4. Execute o script de atualização do Tamagotchi');

// Criar script de instruções
const instructions = `
# 🐾 INSTRUÇÕES PARA EXTRAIR SPRITES DOS PETS

## 📋 Passo a Passo:

### 1. Instalar JPEXS Free Flash Decompiler
- Baixe: https://www.free-decompiler.com/flash/download/
- Instale o software

### 2. Extrair Sprites de Cada Pet

Para cada pet (monkey, dog, cat, bear, dragon):

1. **Abrir o SWF no JPEXS**
   - Abra o JPEXS
   - File > Open > Selecione o arquivo SWF do pet

2. **Encontrar os Sprites**
   - Vá para a aba "Sprites" ou "Images"
   - Procure por sprites do pet em diferentes direções
   - Normalmente há 8 direções (0-7) para cada animação

3. **Exportar as Imagens**
   - Selecione cada sprite
   - Clique com botão direito > Export
   - Salve como PNG na pasta correspondente:
     - public/assets/pets-sprites/monkey/monkey_idle_0.png
     - public/assets/pets-sprites/monkey/monkey_idle_1.png
     - ... (até monkey_idle_7.png)

### 3. Estrutura de Pastas Esperada:
\`\`\`
public/assets/pets-sprites/
├── monkey/
│   ├── config.json
│   ├── monkey_idle_0.png
│   ├── monkey_idle_1.png
│   ├── ...
│   └── monkey_idle_7.png
├── dog/
│   ├── config.json
│   ├── dog_idle_0.png
│   └── ...
└── ...
\`\`\`

### 4. Após Extrair Todos os Sprites:
Execute o script de atualização do Tamagotchi para usar os sprites reais.

## 🎯 Pets Disponíveis:
${availablePets.map(pet => `- ${pet.replace('.swf', '')}`).join('\n')}
`;

fs.writeFileSync('./INSTRUCOES-EXTRACAO-PETS.md', instructions);
console.log('\n📄 Instruções salvas em: INSTRUCOES-EXTRACAO-PETS.md');
