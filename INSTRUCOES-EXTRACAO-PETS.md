
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
```
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
```

### 4. Após Extrair Todos os Sprites:
Execute o script de atualização do Tamagotchi para usar os sprites reais.

## 🎯 Pets Disponíveis:
- monkey
- dog
- cat
- bear
- dragon
