# Catálogo do Editor de Avatar — Como Está Construído

Este documento descreve **como o catálogo de roupas do editor de avatar** é montado: fontes oficiais (figuredata, figuremap), caminho dos dados, scripts de sincronização e exceções (ex.: sapatos).

---

## 1. Onde fica o editor

| Item | Caminho |
|------|---------|
| **Rota** | `/ferramentas/avatar-editor` (redireciona de `/avatar-editor`) |
| **Componente** | `src/components/tools/AvatarEditorOfficial.tsx` |
| **Serviço de dados** | `src/services/habboOfficialService.ts` |

---

## 2. Fontes oficiais (sites / URLs)

### 2.1 Figuredata (regras do catálogo)

**URL:** `https://www.habbo.com/gamedata/figuredata/1`

- Contém **categorias** (`settype`: hd, hr, ch, lg, sh, ha, he, ea, fa, cc, ca, cp, wa), **itens** (`set`: id, gender, club, colorable, selectable) e **paletas de cores**.
- Estrutura do XML: `figuredata` → `sets` → `settype` (ou, em versões antigas, `figuredata` → `settype`).
- É a **fonte da verdade** para:
  - Quais itens existem por categoria
  - Gênero (M, F, U)
  - HC (`club`), colorável (`colorable`), selecionável (`selectable`)

**Uso no projeto:** o script `sync-figuredata-to-mock.js` baixa esse XML, extrai os itens por categoria e atualiza o `complete_mock_data.json`.

### 2.2 Figuremap (mapeamento ID → lib)

**URL:** `https://www.habbo.com/gamedata/figuremap/1`

- Mapeia **IDs** (ex.: `hd-4268`) para **nomes de biblioteca** (ex.: `hat_U_arrowhat_nft`) usados em assets SWF.
- Usado **no editor** principalmente para:
  - Identificar itens **NFT** ou **LTD** (pelo sufixo `_nft`, `nft`, `_ltd`, `ltd` no lib)
  - Exibir badges (ícones) corretos no grid.

**Uso no projeto:** o mapeamento é mantido em `habbo_item_names.ts` / `habbo_item_names.json` (derivados do figuremap). O `AvatarEditorOfficial` usa isso para badges NFT/LTD.

### 2.3 API de imagens (Habbo Imaging)

**Base:** `https://www.habbo.com/habbo-imaging/avatarimage`

- Gera **miniaturas** e **preview** do avatar a partir da **figure string** (ex.: `hd-180-1.ch-210-66.lg-270-82...`).
- Parâmetros típicos: `figure`, `gender`, `size` (s/m/l), `headonly`, `direction`, `head_direction`.

---

## 3. Caminho dos dados no editor

```
Figuredata (gamedata/figuredata/1)
         │
         ▼
  sync-figuredata-to-mock.js
         │
         ▼
  complete_mock_data.json (public/)
         │
         ▼
  habboOfficialService.loadHabboData()
         │
         ├── categorias hd, hr, ch, lg, ha, he, ea, fa, cc, ca, cp, wa  ← do mock
         │
         └── categorias sh (sapatos)  ← lista canônica no próprio serviço (OFFICIAL_SHOES_CANONICAL)
```

- O **catálogo** exibido no grid vem de `habboOfficialService`, que:
  - Carrega `complete_mock_data.json` e usa suas categorias e itens.
  - **Substitui** sempre os itens da categoria **sapatos (sh)** pela lista canônica definida no serviço (figuremap/figuredata oficiais). O mock é ignorado para `sh`.

---

## 4. Estrutura do `complete_mock_data.json`

- **Local:** `public/complete_mock_data.json`
- **Formato:**

```json
{
  "categories": [
    {
      "id": "hd",
      "name": "hd",
      "displayName": "Cabeça",
      "paletteId": "1",
      "items": [
        {
          "id": "hd-180",
          "figureId": "180",
          "category": "hd",
          "gender": "M",
          "club": "0",
          "colorable": "0",
          "selectable": "1",
          "imageUrl": "https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-1&gender=M&size=m&headonly=0",
          "isSelectable": true,
          "isColorable": false
        }
      ]
    }
  ]
}
```

- **Categorias** presentes: `hd`, `hr`, `ha`, `he`, `ea`, `fa`, `ch`, `lg`, `sh`, `cc`, `ca`, `cp`, `wa`.
- **`sh`**: os `items` do mock são **ignorados**; o editor usa somente a lista canônica do `habboOfficialService`.

---

## 5. Script de sincronização: `figuredata` → `complete_mock_data`

### 5.1 Comando

```bash
npm run figuredata:sync
```

- Executa: `node scripts/sync-figuredata-to-mock.js`

### 5.2 O que o script faz

1. **Busca** o figuredata em `https://www.habbo.com/gamedata/figuredata/1`.
2. **Interpreta** o XML (`figuredata.sets.settype` ou `figuredata.settype`), agrupa sets por `(type, id)` e mescla gênero:
   - Se o mesmo `id` existe para **M e F** ou **U** → usa **gender `U`** (aparece em masculino e feminino).
3. **Compara** com `complete_mock_data.json`:
   - Adiciona itens **faltantes** por categoria (apenas `selectable="1"`).
   - **Atualiza** o `gender` dos itens já existentes para `U` quando o figuredata indica U (ou M+F).
4. **Ignora** a categoria **`sh`** (sapatos); essa categoria não é alterada pelo script.

### 5.3 Categorias afetadas

- Todas as do mock **exceto** `sh`: hd, hr, ha, he, ea, fa, ch, lg, cc, ca, cp, wa.

---

## 6. Sapatos (sh) — lista canônica

- Os itens de **sapatos** não vêm do `complete_mock_data.json`.
- São definidos no `habboOfficialService` em **`OFFICIAL_SHOES_CANONICAL`** (por gênero M/F e por tier: nonhc, hc, sell, nft, ltd).
- Essa lista foi extraída do figuremap/figuredata oficiais e é mantida manualmente no código.
- O `sync-figuredata-to-mock.js` **não** modifica `sh`.

---

## 7. Badges (HC, vendáveis, NFT, LTD)

- **HC:** `club === '2'` (ou `'1'`) no figuredata → ícone `icon_HC_wardrobe.png`.
- **Vendáveis:** para sapatos, tier `sell` na lista canônica → `icon_sellable_wardrobe.png`.
- **NFT / LTD:** identificados pelo **lib** no figuremap (ex.: `_nft`, `_ltd` em `habbo_item_names`). O editor usa `habbo_item_names` para resolver `category-figureId` → lib e aplica:
  - `icon_wardrobe_nft_on.png` para NFT
  - `icon_LTD_habbo.png` para LTD  
  em todas as categorias que tiverem itens NFT/LTD.

---

## 8. Paletas de cores

- Definas em `habboOfficialService.getOfficialPalettes()` (baseadas no figuredata oficial).
- Mapeamento canônico por categoria:
  - **hd, cc, ca, cp, wa:** paleta `1` (pele).
  - **hr:** paleta `2` (cabelo).
  - **ch, lg, sh, ha, he, ea, fa:** paleta `3` (roupas).

---

## 9. Resumo rápido

| O quê | Onde / Como |
|-------|-------------|
| **Figuredata** | `https://www.habbo.com/gamedata/figuredata/1` |
| **Figuremap** | `https://www.habbo.com/gamedata/figuremap/1` → refletido em `habbo_item_names` |
| **Catálogo (exceto sapatos)** | `complete_mock_data.json` ← atualizado por `npm run figuredata:sync` |
| **Sapatos** | Lista canônica no `habboOfficialService` |
| **Imagens** | `https://www.habbo.com/habbo-imaging/avatarimage` |
| **Editor** | Rota `/ferramentas/avatar-editor`, `AvatarEditorOfficial` + `habboOfficialService` |

---

## 10. Documentos relacionados

- **Especificação técnica do editor:** `src/docs/HABBO_AVATAR_EDITOR_SPEC.md`
- **Dados oficiais / figuremap:** `README_Official_Habbo_Data.md`
- **Extração de roupas (figuremap):** `docs/TUTORIAL_EXTRACAO_ROUPAS.md`
