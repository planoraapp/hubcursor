# Editor de Visuais Habbo - Flash Assets

Um editor de visuais completo para Habbo Hotel, inspirado no design do [HabboTemplarios](https://habbotemplarios.com/generador-de-habbos), que permite aos usuários criar e personalizar avatares usando assets SWF organizados por categoria.

## 🎯 Características

- **Interface Intuitiva**: Design similar ao HabboTemplarios com layout responsivo
- **Organização por Categoria**: Roupas organizadas em cabeça, cabelo, chapéus, camisas, calças, sapatos e acessórios
- **Sistema de Cores**: Paleta completa de cores do Habbo com 60+ opções
- **Expressões e Ações**: 7 expressões faciais e 7 ações diferentes
- **Controles de Direção**: Rotação da cabeça e corpo do avatar
- **Múltiplos Tamanhos**: Cabeça, mini, normal e grande
- **Seleção de Gênero**: Masculino e feminino
- **Download**: Salvar avatar como imagem PNG
- **Responsivo**: Funciona em desktop, tablet e mobile

## 🚀 Como Usar

### 1. Abrir o Editor
- Abra o arquivo `index.html` em qualquer navegador moderno
- O editor carregará automaticamente com um avatar padrão

### 2. Navegar pelas Categorias
- **Cabeça**: Diferentes tipos de cabeça
- **Cabelo**: Estilos de cabelo variados
- **Chapéus**: Acessórios para a cabeça
- **Camisas**: Tops e camisetas
- **Calças**: Calças e shorts
- **Sapatos**: Calçados diversos
- **Acessórios**: Óculos e outros itens

### 3. Personalizar o Avatar
- Clique em qualquer item de roupa para selecioná-lo
- Use a paleta de cores para mudar as cores
- Ajuste as expressões faciais (normal, feliz, triste, etc.)
- Escolha ações (normal, andando, sentado, etc.)
- Use os controles de direção para rotacionar o avatar

### 4. Configurações Adicionais
- **Tamanho**: Escolha entre cabeça, mini, normal ou grande
- **Gênero**: Alternar entre masculino e feminino
- **Nome**: Digite o nome do seu Habbo
- **Hotel**: Selecione o servidor do Habbo

### 5. Download
- Clique no botão "Baixar" para salvar o avatar como imagem PNG
- O arquivo será salvo automaticamente no seu computador

## 🎨 Sistema de Cores

O editor inclui uma paleta completa de cores do Habbo:
- **Cores Básicas**: Tons de pele e cores naturais
- **Cores Club**: Cores especiais para membros VIP
- **Cores Vibrantes**: Tons brilhantes e chamativos
- **Cores Neutras**: Tons suaves e elegantes

## 📱 Responsividade

O editor é totalmente responsivo e funciona em:
- **Desktop**: Layout em 3 colunas (350px | 1fr | 300px)
- **Tablet**: Layout adaptativo com reorganização automática
- **Mobile**: Layout em coluna única para melhor usabilidade

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e moderna
- **CSS3**: Grid layout, flexbox, animações e gradientes
- **JavaScript ES6+**: Classes, módulos e funcionalidades avançadas
- **Font Awesome**: Ícones vetoriais
- **API Habbo**: Sistema de geração de avatares

## 📁 Estrutura de Arquivos

```
habbo-editor/
├── index.html          # Arquivo principal HTML
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
├── README.md           # Este arquivo
└── assets/             # Pasta para assets (opcional)
    └── swf/           # Arquivos SWF do Habbo
```

## 🎮 Integração com Assets SWF

O editor está preparado para integrar com seus arquivos SWF do Habbo:

### Categorias Suportadas
- **hd**: Cabeças (head)
- **hr**: Cabelos (hair)
- **ha**: Chapéus (hats)
- **ch**: Camisas (chest)
- **lg**: Calças (legs)
- **sh**: Sapatos (shoes)
- **ea**: Acessórios dos olhos
- **fa**: Acessórios do rosto
- **ca**: Acessórios do peito
- **wa**: Acessórios da cintura

### Como Adicionar Novas Roupas
1. Adicione os arquivos SWF na pasta `assets/swf/`
2. Atualize o objeto `clothingData` no arquivo `script.js`
3. Organize por categoria e raridade
4. O editor carregará automaticamente as novas opções

## 🌟 Funcionalidades Avançadas

### Sistema de Raridade
- **Common**: Itens básicos (borda padrão)
- **Rare**: Itens raros (borda azul)
- **Legendary**: Itens lendários (borda dourada)
- **NFT**: Itens especiais (borda vermelha)

### Controles de Direção
- **Cabeça**: 8 direções (0-7)
- **Corpo**: 8 direções (0-7)
- Controles intuitivos com setas

### Expressões Faciais
- Normal, Feliz, Triste, Enojado
- Surpreso, Dormindo, Falando

### Ações
- Normal, Andando, Deitado
- Sentado, Acenando, Carregando, Bebendo

## 🔄 Atualizações e Manutenção

### Para Adicionar Novas Funcionalidades
1. Edite o arquivo `script.js`
2. Adicione novos métodos à classe `HabboAvatarEditor`
3. Atualize o HTML se necessário
4. Teste em diferentes dispositivos

### Para Personalizar o Visual
1. Edite o arquivo `styles.css`
2. Modifique cores, fontes e layouts
3. Ajuste breakpoints responsivos
4. Adicione novas animações

## 📞 Suporte

Se você encontrar problemas ou tiver sugestões:
1. Verifique o console do navegador para erros
2. Confirme que todos os arquivos estão na mesma pasta
3. Teste em diferentes navegadores
4. Verifique se o JavaScript está habilitado

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais e pessoais.

## 🙏 Créditos

- **Inspiração**: [HabboTemplarios](https://habbotemplarios.com/generador-de-habbos)
- **API**: Habbo Hotel Avatar Imaging Service
- **Ícones**: Font Awesome
- **Design**: Interface moderna e responsiva

---

**Divirta-se criando seu avatar personalizado do Habbo!** 🎉
