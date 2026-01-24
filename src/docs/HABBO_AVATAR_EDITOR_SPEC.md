# Especificação Técnica: Construindo um Habbo Avatar Editor (Imager)

Este documento serve como um guia mestre para Inteligências Artificiais e Desenvolvedores criarem um editor de avatares Habbo completo, utilizando as fontes de dados oficiais e a lógica correta de renderização.

## 1. Fonte da Verdade (Data Source)

Para obter os IDs de roupas, cores e regras, não adivinhe números. Você deve ler o arquivo XML de dados de figura (Figure Data).

### Onde encontrar:
Acesse as variáveis externas: `https://www.habbo.com.br/gamedata/external_variables/1`

Encontre a chave: `flash.client.url` (Ex: `https://images.habbo.com/gordon/PRODUCTION-202X.../`)

Monte a URL do Figure Data: Adicione `figuredata.xml` ao final da URL base.

**URL Exemplo Real:** `https://images.habbo.com/gordon/flash-assets-PRODUCTION-202601121522-867048149/figuredata.xml` (Esta URL muda a cada atualização do jogo).

**Nota Importante:** O arquivo `figuremap.xml` serve apenas para mapear IDs para arquivos .swf (Flash). Para um editor web moderno, o `figuredata.xml` é muito mais importante, pois contém as regras de negócio (gênero, cores, categorias).

## 2. Decodificando o figuredata.xml

A IA deve ser instruída a fazer o parse deste XML. A estrutura funciona assim:

### A. Categorias (settype)
O XML é dividido em tipos de conjuntos.
```xml
<settype type="hr" paletteid="1"> -> Cabelos
<settype type="ch" paletteid="3"> -> Camisas
```

### Mapeamento Obrigatório de Categorias:
| Sigla XML | Nome da Categoria | Grupo Sugerido |
|-----------|------------------|----------------|
| hr | Hair (Cabelo) | Cabeça |
| ha | Hat (Chapéu) | Cabeça |
| he | Head Acc. (Acess. Cabeça) | Cabeça |
| ea | Eye Acc. (Óculos) | Cabeça (ou Rosto) |
| fa | Face Acc. (Acess. Rosto/Barba) | Cabeça (ou Rosto) |
| hd | Head (Formato Rosto) | Corpo |
| ch | Chest (Camisa) | Tronco |
| cc | Chest Coat (Jaqueta/Casaco) | Tronco |
| cp | Chest Print (Estampa) | Tronco |
| ca | Chest Acc. (Colar/Cachecol) | Tronco |
| lg | Legs (Calça) | Pernas |
| sh | Shoes (Sapatos) | Pernas |
| wa | Waist (Cinto) | Pernas |

### B. Os Itens (set)
Dentro de cada settype, existem vários set. Cada um é uma roupa.

**Exemplo XML:**
```xml
<set id="3032" gender="M" club="2" colorable="1" selectable="1" preselectable="0"/>
```

**Regras de Filtragem para o Grid:**
- **ID (id):** O número que vai na URL da imagem.
- **Gênero (gender):**
  - `M`: Mostrar apenas na aba Masculino.
  - `F`: Mostrar apenas na aba Feminino.
  - `U`: Unissex (Mostrar em ambas).
- **Habbo Club (club):**
  - `0`: Grátis/Padrão.
  - `1` ou `2`: HC (Habbo Club). Deve exibir um ícone de "HC" ou diamante sobre a imagem.
- **Colorível (colorable):**
  - `1`: O usuário pode mudar a cor.
  - `0`: A roupa tem cor fixa (não exibir paleta de cores).
- **Selecionável (selectable):**
  - Se for `0`, ignore/esconda este item. Geralmente são roupas de NPC ou invisíveis que quebram o editor.

### C. As Cores (palette)
No final do XML ou referenciado pelo paletteid, existem as definições de cores.

**Exemplo:**
```xml
<color id="61" index="61" club="0" selectable="1">2D2D2D</color>
```

- **id/index:** O número usado na URL (ex: `-61`).
- **Conteúdo (text):** O código HEX da cor (ex: `2D2D2D`). Use isso para pintar o botão da paleta.
- **club:** Se `1` ou `2`, é uma cor exclusiva HC.

## 3. Construção da Imagem (The Imaging API)

Não tente renderizar SWFs. Use a API de imagem oficial do Habbo que converte a "Figure String" em PNG.

**Endpoint Base:** `https://www.habbo.com/habbo-imaging/avatarimage`

### A Lógica da Figure String
A string é composta por partes separadas por pontos (.).

**Formato de uma parte:** `tipo-id-cor1-cor2`

**Exemplo Completo:**
```
figure=hr-100-61.hd-180-1.ch-210-66.lg-270-82.sh-290-80
```

- `hr-100-61`: Cabelo (hr), ID 100, Cor 61.
- `hd-180-1`: Rosto (hd), ID 180, Cor 1 (Pele).
- `ch-210-66`: Camisa (ch), ID 210, Cor 66.

### Parâmetros da API para o Grid (Miniaturas)
Para gerar as imagens dos botões de seleção de roupa:
```
?figure={TIPO}-{ID}-{COR_PADRAO}&size=m&headonly={0 ou 1}
```

- **size:** Use `m` (medium) ou `s` (small). `b` (big) é muito pesado para grids.
- **headonly:**
  - Use `1` para itens de cabeça (`hr`, `ha`, `he`, `ea`, `fa`, `hd`).
  - Use `0` para itens de corpo (`ch`, `cc`, `lg`, `sh`, etc).

### Parâmetros da API para o Preview (Avatar Grande)
```
?figure={STRING_COMPLETA}&size=l&action={acao}&gesture={gesto}&direction={dir}&head_direction={h_dir}
```

## 4. Instruções Lógicas para a IA (Prompt de Programação)

Ao pedir para a IA programar, use esta lógica:

### Inicialização:
- Crie um objeto de estado chamado `avatarState`.
- Ele deve ter chaves para todas as categorias obrigatórias (`hd`, `hr`, `ch`, `lg`, `sh`) e opcionais (`he`, `ha`, `ea`, `fa`, `cc`, `cp`, `ca`, `wa`).
- Defina valores padrão (ex: `hd-180-1` para meninos).

### Gerenciamento de Dependências (Z-Index Lógico):
A API do Habbo resolve a ordem das camadas (roupa por cima da calça) automaticamente. O programador só precisa garantir que a string contenha todas as partes selecionadas.

### Lógica de Seleção:
- **Ao clicar numa roupa:** Atualize o ID da categoria correspondente no `avatarState`.
- **Ao clicar numa cor:** Atualize a cor da categoria atualmente ativa (ex: se a aba "Cabelo" está aberta, mude a cor do `hr`).

### Remoção:
- Itens como Rosto (`hd`), Cabelo (`hr`), Tronco (`ch`), Pernas (`lg`) e Sapatos (`sh`) não devem ter botão de remover (o avatar não pode ficar invisível/nu).
- Acessórios (`ha`, `ea`, `cc`, etc.) devem ter um botão para "limpar" o ID (remover da string).

### Tratamento de Gênero:
- Crie um switch Masculino/Feminino.
- Ao trocar, filtre o JSON de roupas.
- **Importante:** Se o usuário estiver usando uma roupa "M" e trocar para "F", verifique se aquela roupa é `gender="U"`. Se não for, resete aquela parte para um padrão feminino para evitar erros na imagem.

## 5. Resumo da Estrutura de Dados JSON

Para que o editor funcione perfeitamente, o JSON interno da aplicação deve ser montado assim (convertido do XML):

```javascript
const HABBO_DATA = {
  categories: {
    "hr": {
      id: "hr",
      name: "Cabelo",
      items: [
        { id: 100, gender: "M", club: false, colorable: true },
        { id: 500, gender: "F", club: false, colorable: true },
        // ... todos os itens do figuredata.xml
      ]
    },
    "ch": {
      // ... dados de camisas
    }
    // ... outras categorias
  },
  palettes: {
    "1": [ // Paleta de Cabelo/Pele
      { id: 1, hex: "FFCB98" },
      { id: 2, hex: "E3AE7D" }
    ],
    "3": [ // Paleta de Roupas
      { id: 66, hex: "E7B027" }
    ]
  }
}
```

Ao seguir estritamente o `figuredata.xml` para popular este JSON, todos os erros de "roupa quebrada" ou "IDs incorretos" desaparecerão.

## 6. Implementação no Código

### Interfaces TypeScript
```typescript
interface HabboPalette {
  id: string;
  colors: Array<{
    id: string;
    index: string;
    club: string;
    selectable: string;
    hex: string;
  }>;
}

interface HabboSet {
  id: string;
  gender: 'M' | 'F' | 'U';
  club: string;
  colorable: string;
  selectable: string;
  preselectable: string;
  sellable: string;
}

interface HabboCategory {
  id: string;
  name: string;
  displayName: string;
  paletteId: string;
  items: HabboClothingItem[];
  colors: string[];
}

interface HabboClothingItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  club: string;
  colorable: string;
  selectable: string;
  imageUrl: string;
  isSelectable: boolean;
  isColorable: boolean;
}
```

### Estado do Avatar
```typescript
interface AvatarState {
  hr: string; // hr-100-61
  hd: string; // hd-180-1
  ch: string; // ch-210-66
  lg: string; // lg-270-82
  sh: string; // sh-290-80
  // Opcionais
  ha?: string;
  he?: string;
  ea?: string;
  fa?: string;
  cc?: string;
  cp?: string;
  ca?: string;
  wa?: string;
}
```

### Funções de Utilitários
```typescript
// Converte estado para figure string
function stateToFigureString(state: AvatarState): string {
  return Object.entries(state)
    .filter(([_, value]) => value && value.trim() !== '')
    .map(([key, value]) => `${key}-${value}`)
    .join('.');
}

// Gera URL de preview
function generateAvatarUrl(state: AvatarState): string {
  const figureString = stateToFigureString(state);
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=l&direction=2&head_direction=2&action=std&gesture=std`;
}

// Gera URL de miniatura para grid
function generateThumbnailUrl(type: string, id: string, color: string): string {
  const headOnly = ['hr', 'ha', 'he', 'ea', 'fa', 'hd'].includes(type) ? '1' : '0';
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${type}-${id}-${color}&size=m&headonly=${headOnly}`;
}
```

## 7. Documentação do catálogo (implementação atual)

Para detalhes de **como o catálogo do editor é construído** na base de código atual — fontes (figuredata, figuremap), sync com `complete_mock_data.json`, sapatos canônicos e badges — ver **`docs/AVATAR_EDITOR_CATALOG.md`**.