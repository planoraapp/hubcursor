# Tutorial: Como Extrair Roupas do Habbo

Este tutorial explica como encontrar e extrair novas roupas do jogo Habbo utilizando os arquivos de dados disponíveis.

## 📋 Índice

1. [Acessando os Dados do Jogo](#acessando-os-dados-do-jogo)
2. [Entendendo o Figuremap.xml](#entendendo-o-figuremapxml)
3. [Códigos Científicos](#códigos-científicos)
4. [Visualizando as Roupas](#visualizando-as-roupas)
5. [Categorias de Roupas](#categorias-de-roupas)

---

## 1. Acessando os Dados do Jogo

### Passo 1: Obter a Build Atual

Acesse uma das seguintes URLs para obter a build atual do Habbo:

**Sandbox (versões mais recentes):**
```
https://sandbox.habbo.com/gamedata/external_variables/1
```

**Hotel Brasileiro (versões já lançadas):**
```
https://www.habbo.com.br/gamedata/external_variables/1
```

⚠️ **Importante:** O link da build sempre será atualizado pelo Habbo. Versões antigas serão descontinuadas com o lançamento de novas atualizações.

### Passo 2: Extrair a URL da Build

No arquivo retornado, procure pela linha `flash.client.url`. Ela deve ser semelhante a:

```
flash.client.url=https://images.habbo.com/gordon/flash-assets-PRODUCTION-202601191856-235928807/
```

**Build Atual (Janeiro 2025):**
```
https://images.habbo.com/gordon/flash-assets-PRODUCTION-202601191856-235928807/
```

### Passo 3: Acessar o Figuremap.xml

Com a URL da build, adicione `figuremap.xml` ao final:

```
https://images.habbo.com/gordon/flash-assets-PRODUCTION-202601191856-235928807/figuremap.xml
```

Este arquivo contém **todos os códigos de roupas existentes no jogo**, organizados por categorias.

---

## 2. Entendendo o Figuremap.xml

### Estrutura do Arquivo

O `figuremap.xml` contém informações sobre as partes das roupas. Cada roupa é identificada por um **código científico** e possui **partes** que definem sua categoria.

### Exemplo: Cabelo Arco-íris

```xml
<lib id="hair_U_rainbowhair" revision="71377">
  <part id="3413" type="hr"/>
  <part id="3413" type="hrb"/>
</lib>
```

**Campos importantes:**
- `id`: Código científico da roupa (ex: `hair_U_rainbowhair`)
- `revision`: Número de revisão do asset
- `part id`: ID numérico da parte
- `part type`: Tipo/categoria da parte (ex: `hr` = cabelo)

### Tipos de Partes (Categories)

O Habbo utiliza os seguintes tipos para categorizar as roupas:

#### Categorias Principais (Exibidas no Grid)

| Tipo | Nome | Descrição |
|------|------|-----------|
| `hd` | Rostos | Rostos e corpos do avatar |
| `hr` | Cabelos | Cabelos e penteados |
| `ch` | Camisetas | Camisas, blusas e tops |
| `cc` | Casacos | Casacos, vestidos e jaquetas |
| `lg` | Calças | Calças, saias e shorts |
| `sh` | Sapatos | Sapatos e calçados |
| `ha` | Chapéus | Chapéus e bonés |
| `he` | Acess. Cabeça | Acessórios de cabeça (bandanas, etc.) |
| `ea` | Óculos | Óculos e acessórios de olhos |
| `fa` | Acess. Rosto | Acessórios faciais (máscaras, etc.) |
| `ca` | Acess. Peito | Acessórios do peito (colares, etc.) |
| `wa` | Cintos | Cintos e acessórios de cintura |
| `cp` | Estampas | Estampas e impressões |

#### Tipos Auxiliares (Não Exibidos Diretamente)

Estes tipos são partes de outras categorias e não devem ser exibidos como categorias separadas:

| Tipo | Pertence a | Descrição |
|------|------------|-----------|
| `hrb` | `hr` | Parte traseira do cabelo |
| `ls`, `rs` | `ch` | Mangas esquerda/direita de camisetas |
| `lc`, `rc` | `cc` | Mangas esquerda/direita de casacos |
| `fc`, `ey` | `hd` | Face e olhos (partes do rosto) |

---

## 3. Códigos Científicos

### Formato dos Códigos

Os códigos científicos seguem um padrão específico:

```
[categoria]_[gênero]_[nome]
```

**Exemplos:**
- `hair_U_rainbowhair` - Cabelo unissex arco-íris
- `shirt_M_ukraine` - Camiseta masculina Ucrânia
- `jacket_F_winter_coat_long` - Casaco feminino longo de inverno
- `acc_eye_U_masq` - Óculos unissex máscara

### Prefixos de Categoria

| Prefixo | Categoria | Tipo |
|---------|-----------|------|
| `hair_` | Cabelos | `hr` |
| `shirt_` | Camisetas | `ch` |
| `jacket_` | Casacos | `cc` |
| `trousers_` | Calças | `lg` |
| `shoes_` | Sapatos | `sh` |
| `hat_` | Chapéus | `ha` |
| `acc_head_` | Acess. Cabeça | `he` |
| `acc_eye_` | Óculos | `ea` |
| `acc_face_` | Acess. Rosto | `fa` |
| `acc_chest_` | Acess. Peito | `ca` |
| `acc_waist_` | Cintos | `wa` |
| `acc_print_` | Estampas | `cp` |
| `face_` | Rostos | `hd` |

### Gêneros

- `M` = Masculino
- `F` = Feminino
- `U` = Unissex (ambos os gêneros)

---

## 4. Visualizando as Roupas

### URL do SWF

Para visualizar uma roupa em ação, você pode acessar o link da versão SWF:

```
https://images.habbo.com/gordon/flash-assets-PRODUCTION-202601191856-235928807/[código_científico].swf
```

**Exemplo:**
```
https://images.habbo.com/gordon/flash-assets-PRODUCTION-202601191856-235928807/hair_U_rainbowhair.swf
```

### URL da Imagem do Avatar

Para gerar uma imagem do avatar com a roupa, use a API oficial do Habbo:

```
https://www.habbo.com/habbo-imaging/avatarimage?figure=[figure_string]&gender=[M|F]&direction=2&head_direction=2&size=[s|m|l]&img_format=png
```

**Exemplo:**
```
https://www.habbo.com/habbo-imaging/avatarimage?figure=hr-3413-7&gender=M&direction=2&head_direction=2&size=m&img_format=png
```

---

## 5. Categorias de Roupas

### Mapeamento Correto

Ao processar o `figuremap.xml`, é importante **agrupar tipos auxiliares com suas categorias principais**:

```typescript
const FIGUREMAP_TYPE_TO_CATEGORY = {
  // Categorias principais
  'hd': 'hd',  // Rostos
  'hr': 'hr',  // Cabelos
  'hrb': 'hr', // Parte traseira do cabelo → agrupar com hr
  'ch': 'ch',  // Camisetas
  'ls': 'ch',  // Manga esquerda → agrupar com ch
  'rs': 'ch',  // Manga direita → agrupar com ch
  'cc': 'cc',  // Casacos
  'lc': 'cc',  // Manga esquerda casaco → agrupar com cc
  'rc': 'cc',  // Manga direita casaco → agrupar com cc
  'lg': 'lg',  // Calças
  'sh': 'sh',  // Sapatos
  'ha': 'ha',  // Chapéus
  'he': 'he',  // Acessórios de Cabeça
  'ea': 'ea',  // Óculos
  'fa': 'fa',  // Acessórios Faciais
  'ca': 'ca',  // Acessórios de Peito
  'wa': 'wa',  // Cintos
  'cp': 'cp',  // Estampas
  // Tipos auxiliares do rosto → agrupar com hd
  'fc': 'hd',  // Face
  'ey': 'hd',  // Olhos
};
```

### Filtragem no Grid

Ao exibir roupas no grid do editor de avatar:

1. **Filtrar apenas por categorias principais** (`hd`, `hr`, `ch`, `cc`, `lg`, `sh`, `ha`, `he`, `ea`, `fa`, `ca`, `wa`, `cp`)
2. **Agrupar tipos auxiliares** com suas categorias principais
3. **Evitar duplicatas** quando um item possui múltiplas partes (ex: camiseta com mangas)

---

## 📝 Notas Importantes

1. **Build Atualizada:** Sempre verifique a build mais recente no sandbox para encontrar novidades
2. **Hotel Local:** O hotel brasileiro (`habbo.com.br`) contém apenas roupas já lançadas
3. **Códigos Científicos:** Use os códigos científicos para identificar e buscar roupas específicas
4. **Categorias:** Agrupe tipos auxiliares corretamente para evitar duplicatas no grid

---

## 🔗 Referências

- **Tutorial Original:** [HabboNews - Como Encontrar Novas Roupas](https://habbonews.com)
- **Build Atual:** `https://sandbox.habbo.com/gamedata/external_variables/1`
- **Figuremap.xml:** `https://images.habbo.com/gordon/flash-assets-PRODUCTION-202601191856-235928807/figuremap.xml`

---

**Última Atualização:** Janeiro 2025  
**Build Atual:** `PRODUCTION-202601191856-235928807`
