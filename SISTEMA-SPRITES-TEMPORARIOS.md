
# 🐾 SISTEMA DE SPRITES TEMPORÁRIOS PARA PETS

## 📋 Status Atual:
- ✅ SWFs dos pets baixados com sucesso
- ✅ Estrutura de pastas criada
- ✅ Configurações JSON criadas
- ✅ Gerador HTML criado

## 🎯 Como Usar o Gerador:

### 1. Abrir o Gerador
- Abra o arquivo `gerador-sprites-pets.html` no seu navegador
- Você verá 5 pets com 8 direções cada

### 2. Gerar Sprites
- Clique em cada direção (0-7) para gerar o sprite
- O arquivo PNG será baixado automaticamente
- Salve cada arquivo na pasta correspondente:
  - `public/assets/pets-sprites/monkey/monkey_idle_0.png`
  - `public/assets/pets-sprites/monkey/monkey_idle_1.png`
  - ... (até monkey_idle_7.png)

### 3. Estrutura Final Esperada:
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

### 4. Ativar Sprites no Tamagotchi
Após gerar todos os sprites, atualize o Tamagotchi:
- Mude `useEmoji: true` para `useEmoji: false` no código
- Os sprites reais serão carregados automaticamente

## 🎮 Pets Disponíveis:
- 🐒 Macaco (monkey)
- 🐕 Cachorro (dog)
- 🐱 Gato (cat)
- 🐻 Urso (bear)
- 🐉 Dragão (dragon)

## 🔄 Próxima Fase:
Depois de testar com sprites temporários, podemos extrair os sprites reais dos SWFs usando JPEXS ou outras ferramentas.
