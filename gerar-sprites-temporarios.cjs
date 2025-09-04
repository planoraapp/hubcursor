const fs = require('fs');
const path = require('path');

// Script para gerar sprites temporários baseados em emojis
console.log('🎨 Gerando sprites temporários para os pets...');

const outputDir = './public/assets/pets-sprites';

// Pets com emojis e rotações
const pets = [
    { id: 'monkey', emoji: '🐒', name: 'Macaco' },
    { id: 'dog', emoji: '🐕', name: 'Cachorro' },
    { id: 'cat', emoji: '🐱', name: 'Gato' },
    { id: 'bear', emoji: '🐻', name: 'Urso' },
    { id: 'dragon', emoji: '🐉', name: 'Dragão' }
];

// Função para criar um arquivo HTML que gera sprites
function createSpriteGenerator() {
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerador de Sprites de Pets</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f0f0f0;
        }
        .pet-container {
            display: inline-block;
            margin: 20px;
            text-align: center;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .pet-emoji {
            font-size: 64px;
            margin: 10px;
            display: block;
        }
        .directions {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-top: 20px;
        }
        .direction {
            width: 80px;
            height: 80px;
            background: #e0e0e0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .direction:hover {
            transform: scale(1.1);
            background: #d0d0d0;
        }
        .download-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px;
        }
        .download-btn:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <h1>🐾 Gerador de Sprites de Pets do Habbo</h1>
    <p>Clique em cada direção para gerar o sprite correspondente</p>
    
    ${pets.map(pet => `
    <div class="pet-container">
        <h3>${pet.name}</h3>
        <div class="pet-emoji">${pet.emoji}</div>
        <div class="directions">
            ${[0,1,2,3,4,5,6,7].map(dir => `
                <div class="direction" onclick="generateSprite('${pet.id}', ${dir})">
                    ${pet.emoji}
                </div>
            `).join('')}
        </div>
        <button class="download-btn" onclick="downloadAllSprites('${pet.id}')">
            Baixar Todos os Sprites
        </button>
    </div>
    `).join('')}

    <script>
        function generateSprite(petId, direction) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            // Fundo transparente
            ctx.clearRect(0, 0, 64, 64);
            
            // Emoji do pet
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Rotacionar baseado na direção
            ctx.save();
            ctx.translate(32, 32);
            ctx.rotate((direction * 45) * Math.PI / 180);
            ctx.fillText('${pets.find(p => p.id === 'monkey').emoji}', 0, 0);
            ctx.restore();
            
            // Download
            const link = document.createElement('a');
            link.download = \`\${petId}_idle_\${direction}.png\`;
            link.href = canvas.toDataURL();
            link.click();
        }
        
        function downloadAllSprites(petId) {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => generateSprite(petId, i), i * 100);
            }
        }
    </script>
</body>
</html>`;

    fs.writeFileSync('./gerador-sprites-pets.html', htmlContent);
    console.log('📄 Gerador HTML criado: gerador-sprites-pets.html');
}

// Criar arquivos de configuração para cada pet
pets.forEach(pet => {
    const petDir = path.join(outputDir, pet.id);
    if (!fs.existsSync(petDir)) {
        fs.mkdirSync(petDir, { recursive: true });
    }
    
    const config = {
        name: pet.name,
        emoji: pet.emoji,
        id: pet.id,
        sprites: {
            idle: {}
        },
        status: 'temporary_emoji_based',
        instructions: 'Use o gerador HTML para criar sprites reais'
    };
    
    // Adicionar as 8 direções
    for (let i = 0; i < 8; i++) {
        config.sprites.idle[i] = `${pet.id}_idle_${i}.png`;
    }
    
    const configPath = path.join(petDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`✅ Configuração criada para ${pet.name}: ${configPath}`);
});

// Criar o gerador HTML
createSpriteGenerator();

console.log('\n🎉 Sistema de sprites temporários criado!');
console.log('\n📋 Próximos passos:');
console.log('1. Abra o arquivo "gerador-sprites-pets.html" no navegador');
console.log('2. Clique em cada direção para gerar os sprites');
console.log('3. Salve os arquivos PNG nas pastas correspondentes');
console.log('4. Atualize o Tamagotchi para usar os sprites reais');

// Criar instruções detalhadas
const instructions = `
# 🐾 SISTEMA DE SPRITES TEMPORÁRIOS PARA PETS

## 📋 Status Atual:
- ✅ SWFs dos pets baixados com sucesso
- ✅ Estrutura de pastas criada
- ✅ Configurações JSON criadas
- ✅ Gerador HTML criado

## 🎯 Como Usar o Gerador:

### 1. Abrir o Gerador
- Abra o arquivo \`gerador-sprites-pets.html\` no seu navegador
- Você verá 5 pets com 8 direções cada

### 2. Gerar Sprites
- Clique em cada direção (0-7) para gerar o sprite
- O arquivo PNG será baixado automaticamente
- Salve cada arquivo na pasta correspondente:
  - \`public/assets/pets-sprites/monkey/monkey_idle_0.png\`
  - \`public/assets/pets-sprites/monkey/monkey_idle_1.png\`
  - ... (até monkey_idle_7.png)

### 3. Estrutura Final Esperada:
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

### 4. Ativar Sprites no Tamagotchi
Após gerar todos os sprites, atualize o Tamagotchi:
- Mude \`useEmoji: true\` para \`useEmoji: false\` no código
- Os sprites reais serão carregados automaticamente

## 🎮 Pets Disponíveis:
${pets.map(pet => `- ${pet.emoji} ${pet.name} (${pet.id})`).join('\n')}

## 🔄 Próxima Fase:
Depois de testar com sprites temporários, podemos extrair os sprites reais dos SWFs usando JPEXS ou outras ferramentas.
`;

fs.writeFileSync('./SISTEMA-SPRITES-TEMPORARIOS.md', instructions);
console.log('\n📄 Instruções salvas em: SISTEMA-SPRITES-TEMPORARIOS.md');
