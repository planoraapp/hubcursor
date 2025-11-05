# Guia Técnico: Sistema de Animação e Movimentação de Avatares Habbo Hotel

## Índice
1. [Fundamentos da Estrutura do Avatar](#fundamentos)
2. [Ambiente Isométrico e Física de Movimentação](#ambiente-isometrico)
3. [Decodificação de Animações e Ações](#animacoes-acoes)
4. [Engenharia de Renderização Customizada](#renderizacao-customizada)
5. [Estratégia de Implementação](#estrategia-implementacao)

---

## 1. Fundamentos da Estrutura do Avatar {#fundamentos}

### 1.1. Anatomia da FigureString (DNA Visual do Avatar)

A **figureString** é o identificador único que define completamente a aparência visual de um avatar. É uma string compacta composta por múltiplos segmentos separados por pontos (`.`).

#### Estrutura de Segmento
Cada segmento segue o padrão: `[PartType]-[ID]-[ColorID]`

- **PartType**: Identifica a categoria da peça
  - `hd`: Cabeça/corpo base (cor da pele)
  - `hr`: Cabelo
  - `ch`: Camisa (peça superior)
  - `lg`: Calças/saia (peça inferior)
  - `sh`: Sapatos

- **ID**: Identificador numérico do modelo/estilo da peça
- **ColorID**: Cor aplicada ao item

#### Exemplo de FigureString
```
hd-180-1.hr-110-61.ch-210-66.lg-280-110.sh-305-62
```

Esta string define:
- Corpo base: `hd-180-1` (tipo 180, cor 1)
- Cabelo: `hr-110-61` (tipo 110, cor 61)
- Camisa: `ch-210-66` (tipo 210, cor 66)
- Calças: `lg-280-110` (tipo 280, cor 110)
- Sapatos: `sh-305-62` (tipo 305, cor 62)

### 1.2. Mapeamento de Assets e o FigureMap

A figureString é uma referência abstrata. Para renderização, é necessário um arquivo de mapeamento (**figuremap.json**) que traduz os IDs numéricos para nomes de bibliotecas de sprites.

#### Estrutura do FigureMap
O figuremap.json contém:
- **libs**: Lista de bibliotecas de sprites disponíveis
- **parts**: Dicionário que associa PartType + ID a um índice na lista de bibliotecas

#### Processo de Mapeamento
1. Acessa o partset (ex: `hr` para cabelo)
2. Usa o ID da peça para encontrar o índice
3. Usa o índice para buscar o nome da biblioteca (ex: `hh_human_hair`)

Esta arquitetura modular permite adicionar novos itens apenas atualizando o figuremap, sem alterar a lógica do motor de renderização.

### 1.3. Parâmetros do Imager

O renderizador Habbo (Imager) aceita parâmetros via URL para gerar imagens estáticas:

- **look**: A figureString completa
- **direction**: Direção do corpo (0-7)
- **head_direction**: Direção da cabeça (0-7, independente do corpo)
- **action**: Comportamento contínuo (ex: `mv`, `sit`, `dance`)
- **gesture**: Gesto ou expressão pontual (ex: `wave`, `sit`)

---

## 2. Ambiente Isométrico e Física de Movimentação {#ambiente-isometrico}

### 2.1. O Grid Isométrico e Coordenadas (X, Y, Z)

O Habbo Hotel utiliza uma **projeção isométrica 2.5D** que cria ilusão de profundidade a partir de um grid 2D subjacente.

#### Características Principais
- **Grid 2D (X, Y)**: Base lógica para pathfinding e posicionamento
- **Eixo Z**: Adiciona altura para móveis empilhados ou barras
- **Perspectiva Isométrica**: Apenas camada visual, não afeta a lógica interna

#### Pathfinding
O sistema de busca de caminho opera no grid 2D:
- Verifica tiles adjacentes
- Identifica tiles impassíveis ou ocupados
- A rotação isométrica não afeta a lógica, apenas a visualização

### 2.2. Sistema Octogonal de Direção (0 a 7)

A movimentação e pose do avatar são limitadas a **8 direções fixas**, codificadas numericamente de 0 a 7.

| Código | Nome | Ângulo | Movimento na Tela | Uso no Imager |
|--------|------|--------|-------------------|---------------|
| 0 | Sul | ~180° | Para baixo | `direction=0` |
| 1 | Sudeste | ~135° | Diagonal inferior direita | `direction=1` |
| 2 | Leste (Padrão) | ~90° | Horizontal para a direita | `direction=2` |
| 3 | Nordeste | ~45° | Diagonal superior direita | `direction=3` |
| 4 | Norte | ~0° | Para cima | `direction=4` |
| 5 | Noroeste | ~315° | Diagonal superior esquerda | `direction=5` |
| 6 | Oeste | ~270° | Horizontal para a esquerda | `direction=6` |
| 7 | Sudoeste | ~225° | Diagonal inferior esquerda | `direction=7` |

#### Independência de Direções
- **direction**: Direção do corpo
- **head_direction**: Direção da cabeça (pode ser diferente do corpo)

Exemplo: Avatar caminha para Leste (2) mas olha para Norte (4).

### 2.3. Sequenciamento de Frames de Movimento

A caminhada é uma **animação repetitiva** (ciclo de caminhada) ativada quando `action=mv`.

#### Processo de Animação
- Estado interno: `mv` → mapeado para prefixo `wlk` (walk)
- Ciclos típicos: 4 ou 8 frames para otimização e fluidez
- A cada tick de movimento para próxima célula:
  - Seleciona direção correta (0-7)
  - Avança para próximo frame do ciclo
  - Mantém FPS consistente com velocidade de deslocamento

#### Complexidade
A principal complexidade reside em:
- Gerenciamento da ordem de desenho (Z-ordering)
- Seleção correta do sprite direcional e temporal

---

## 3. Decodificação de Animações e Ações {#animacoes-acoes}

### 3.1. Animações de Estado Único (Poses e Gestures)

Interações que são poses fixas ou transições rápidas que se resolvem em um único frame (Frame 0).

#### Comandos de Chat e Emoticons
- `:O` ou `:o`: Surpresa
- `:D`: Riso (gargalhada para não-HC, riso para HC)
- `_b` ou `_B`: Polegar para cima

#### Poses Físicas
- `:sit`: Sentar (gesture=sit)
- `:stand`: Ficar em pé
- `:sign [0-17]`: Sinais (ex: 11 = coração, 12 = caveira)

### 3.2. Animações de Sequência Contínua (Actions Dinâmicas)

Ações que requerem iteração por múltiplos frames para criar movimento cíclico ou sequencial.

#### Mapeamento Action → Asset
O motor deve mapear o comando de alto nível (action) para o prefixo do arquivo de sprite.

| Ação/Comando | Action/Gesture na API | Nome do Asset | Natureza | Frames |
|--------------|----------------------|---------------|----------|--------|
| Posição Padrão | `std` / Padrão | `std` | Estática | 1 (Frame 0) |
| Caminhada | `mv` | `wlk` | Ciclo Contínuo | Múltiplos (4 ou 8) |
| Acenar | `wave` | `wave` | Sequencial (Não Loop) | Múltiplos (3-5) |
| Sentado | `sit` | `sit` | Estática | 1 (Frame 0) |
| Dança Padrão | `dance` (ID 1) | `dance` | Ciclo Contínuo | Múltiplos (Looping) |

#### Exemplos de Animações
- **Acenar (wave)**: Sequência de múltiplos frames, executa uma vez ou em loop
- **Danças**: 
  - Padrão (não-HC)
  - Exclusivas HC (Pogo Mogo, Duck Funk)
  - Identificadas por `dance id` (0 a 4)
  - Comando `:habnam` ativa dança específica

---

## 4. Engenharia de Renderização Customizada {#renderizacao-customizada}

### 4.1. Desacoplamento e Asset Sequencial

A animação Habbo pode ser **totalmente desacoplada** da lógica do cliente através de:
- Controle de três parâmetros externos: `action`, `direction`, `frame`
- Assets estáticos processados sequencialmente
- Renderização server-side ou local (como Nitro-Imager)

#### Animation State Machine
O motor funciona como uma máquina de estados:
1. Estado desejado (ex: `mv`) → traduz para prefixo (`wlk`)
2. Solicita sprites iterativamente
3. Altera apenas: índice do frame e direção
4. Gera sequência de frames estáticos
5. Compila em animação (GIF, WebM, MP4)

### 4.2. Estrutura de Nomenclatura de Arquivos de Sprites

**Esta é a camada técnica mais crítica para implementação.**

#### Fórmula de Nomenclatura
```
[Library Name]_[Size]_[Action]_[Figure Part]_[ID]_[Direction]_[Frame]
```

#### Componentes da Nomenclatura

| Variável | Exemplo | Origem | Ajustável? |
|----------|---------|--------|------------|
| Library Name | `hh_human_hair` | figuremap.json (via figureString) | Não (Fixo) |
| Size | `h` ou `sh` | Cliente (Zoom) | Não (Fixo) |
| Action | `wlk` ou `wave` | Mapeamento interno (mv → wlk) | **Sim** (Controla estado) |
| Figure Part | `hr` ou `ch` | figureString | Não (Fixo) |
| Direction | `0` a `7` | Lógica de Movimentação/Input | **Sim** (Controla rotação) |
| Frame | `0`, `1`, `2`, ... | Looping do Renderizador | **Sim** (Chave da Animação) |

#### Exemplo de Construção
Para renderizar cabelo (`hr`) caminhando (`wlk`) na direção 4 (Norte), frame 0:
- Busca asset: `hh_human_hair_h_wlk_hr_110_4_0`

### 4.3. Algoritmo de Sequenciamento e Composição (Z-Ordering)

O segredo para gerar animações é processar uma série de frames estáticos e concatená-los.

#### Algoritmo de Geração de Animação (Exemplo: Caminhada)

```
1. ITERAÇÃO TEMPORAL
   - Inicia loop de tempo pela duração da animação (ex: 8 frames)
   
2. SELEÇÃO DE ASSETS POR FRAME
   - Para Frame F, percorre cada peça P da figureString
   
3. CONSTRUÇÃO DO CAMINHO
   - Para cada peça, calcula nome exato do arquivo:
     - Ação: wlk
     - Direção: 0-7
     - Frame: F
   
4. COMPOSIÇÃO (Z-ORDERING)
   - Combina todos os sprites respeitando ordem de profundidade:
     - Camadas distantes primeiro (cabelo traseiro, pernas)
     - Camadas próximas depois (rosto, cabelo frontal, acessórios)
   
5. EXPORTAÇÃO
   - Gera frame único (PNG)
   
6. MONTAGEM FINAL
   - Compila todos os frames em animação (GIF, WebM, MP4)
```

#### Ordem de Desenho (Z-Ordering)
Pense como uma "boneca de papel física":
- **Primeiro**: Partes distantes (cabelo traseiro, pernas, corpo)
- **Depois**: Partes próximas (rosto, cabelo frontal, acessórios)

Esta ordem garante que elementos sobrepostos sejam renderizados corretamente.

---

## 5. Estratégia de Implementação {#estrategia-implementacao}

### 5.1. Componentes Necessários

#### 1. Parser de FigureString
- Decodificar figureString em componentes
- Extrair PartType, ID, ColorID para cada peça

#### 2. Gerenciador de FigureMap
- Carregar e manter figuremap.json atualizado
- Mapear IDs para nomes de bibliotecas
- Garantir compatibilidade com novos itens

#### 3. Construtor de Nomes de Assets
- Implementar fórmula de nomenclatura
- Gerar caminhos corretos para cada sprite
- Suportar todas as variáveis (action, direction, frame)

#### 4. Motor de Animação
- Animation State Machine
- Controle de frames e sequências
- Gerenciamento de loops e transições

#### 5. Compositor de Sprites
- Sistema de Z-ordering
- Composição de múltiplas camadas
- Exportação de frames individuais

#### 6. Gerador de Animações
- Compilação de frames em GIF/WebM/MP4
- Controle de FPS e duração
- Otimização de tamanho de arquivo

### 5.2. Fluxo de Trabalho Típico

```
1. INPUT
   - Recebe figureString do usuário
   - Recebe parâmetros: action, direction, duration
   
2. DECODIFICAÇÃO
   - Parse da figureString
   - Mapeamento via figuremap para bibliotecas
   
3. CONFIGURAÇÃO DE ANIMAÇÃO
   - action → prefixo de asset (ex: mv → wlk)
   - Determina número de frames do ciclo
   - Configura direção inicial
   
4. GERAÇÃO DE FRAMES
   - Loop: Frame 0 → Frame N
   - Para cada frame:
     a. Para cada peça da figureString:
        - Constrói nome do arquivo
        - Carrega sprite
     b. Aplica Z-ordering
     c. Compõe frame final
     d. Salva como PNG
   
5. COMPILAÇÃO
   - Concatena frames em animação
   - Aplica FPS desejado
   - Exporta formato final
```

### 5.3. Considerações Técnicas

#### Performance
- Cache de sprites carregados
- Processamento assíncrono de frames
- Otimização de memória para animações longas

#### Compatibilidade
- Manter figuremap.json atualizado
- Suportar diferentes versões de assets
- Tratar missing sprites graciosamente

#### APIs Públicas Disponíveis
- **Endpoint de usuários**: `https://www.habbo.es/api/public/users?name={username}`
- Retorna figureString de qualquer usuário conhecido
- Essencial para entrada de dados no sistema

### 5.4. Limitações e Considerações Legais

#### Propriedade Intelectual
- Assets de sprite são propriedade da Sulake
- Uso comercial requer revisão de ToS
- Focar valor no serviço/tecnologia, não nos assets

#### Dados e Estatísticas
- APIs oficiais limitadas em escopo
- Não há APIs públicas para estatísticas profundas
- Foco deve ser em renderização, não em coleta de dados

---

## 6. Exemplos Práticos

### 6.1. Exemplo: Caminhada em Loop

```javascript
// Configuração
const figureString = "hd-180-1.hr-110-61.ch-210-66.lg-280-110.sh-305-62";
const action = "mv"; // → wlk
const direction = 2; // Leste
const frames = 8; // Ciclo completo

// Loop de geração
for (let frame = 0; frame < frames; frame++) {
  const sprites = [];
  
  // Para cada peça na figureString
  for (const part of decodeFigureString(figureString)) {
    const library = figureMap.getLibrary(part.type, part.id);
    const filename = `${library}_h_wlk_${part.type}_${part.id}_${direction}_${frame}`;
    sprites.push(loadSprite(filename));
  }
  
  // Aplica Z-ordering e compõe
  const composedFrame = composeWithZOrder(sprites);
  saveFrame(composedFrame, frame);
}

// Compila animação
compileAnimation(frames, fps: 12, format: 'gif');
```

### 6.2. Exemplo: Sequência de Gestos

```javascript
// Sequência: padrão → acenar → padrão
const sequence = [
  { action: "std", frames: 1 },
  { action: "wave", frames: 5 },
  { action: "std", frames: 1 }
];

for (const step of sequence) {
  for (let frame = 0; frame < step.frames; frame++) {
    // Gera frame conforme algoritmo
  }
}
```

---

## 7. Referências e Recursos

### Ferramentas Existentes
- **Nitro-Imager**: Renderizador server-side open-source
- **wiredsnippets.com**: Exemplo de geração de animações customizadas

### Arquivos Necessários
- `figuremap.json`: Mapeamento de IDs para bibliotecas
- Assets de sprites: Bibliotecas de imagens do Habbo
- Habbo-downloader: Ferramenta para extração de assets

### APIs Públicas
- Endpoint de usuários: `https://www.habbo.es/api/public/users?name={username}`
- Retorna: figureString, informações básicas do perfil

---

## Conclusão

Este guia documenta o sistema completo de animação e renderização de avatares Habbo Hotel. A implementação bem-sucedida requer:

1. **Compreensão da figureString** como DNA visual
2. **Mapeamento correto via figuremap.json**
3. **Construção precisa de nomes de assets**
4. **Respeito ao Z-ordering** na composição
5. **Controle sequencial de frames** para animação

O sistema é totalmente viável e pode ser implementado de forma independente do cliente oficial do jogo, permitindo geração de animações customizadas para uso em plataformas web.

