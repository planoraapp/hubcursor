# Sistema Oficial de Dados do Habbo Avatar Editor

## 🎯 Problema Resolvido

O editor anterior estava gerando IDs incorretos de roupas (ex: `ch-2050`, `ch-2624`), resultando em imagens quebradas. Agora usamos apenas IDs validados diretamente do `figuremap.xml` oficial do Habbo.

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

1. **`src/services/HabboData.ts`** - Dataset oficial com IDs validados
2. **`src/hooks/useHabboData.ts`** - Hook para acessar dados oficiais
3. **`src/hooks/useHabboDataComplete.ts`** - Hook compatível com sistema antigo
4. **`src/components/examples/OfficialHabboEditor.tsx`** - Exemplo de uso

### Arquivos Modificados

1. **`src/components/HabboHub/HabboHubClothingGrid.tsx`** - Atualizado para usar dados oficiais
2. **`src/components/HabboHub/RarityBadge.tsx`** - Adicionado suporte para badge "CLUB"

## 🔧 Como Usar

### 1. Usando o Hook Oficial

```typescript
import { useHabboData } from '@/hooks/useHabboData';

const MyComponent = () => {
  const { categories, selectedCategoryData, filteredSets, generateImageUrl } = useHabboData({
    selectedCategory: 'hr', // Tipo da categoria (hr, ha, ch, etc.)
    selectedGender: 'all', // 'M', 'F', 'U', ou 'all'
    showClubOnly: false // true para mostrar apenas itens HC
  });

  return (
    <div>
      {filteredSets.map(item => (
        <img
          key={item.id}
          src={generateImageUrl(item.id)}
          alt={`Item ${item.id}`}
        />
      ))}
    </div>
  );
};
```

### 2. Usando o Componente Grid Atualizado

```typescript
import { HabboHubClothingGrid } from '@/components/HabboHub/HabboHubClothingGrid';

const MyEditor = () => {
  const [activeCategory, setActiveCategory] = useState('hr');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U' | 'all'>('all');
  const [selectedColor, setSelectedColor] = useState('7');

  return (
    <HabboHubClothingGrid
      activeCategory={activeCategory} // ⚠️ Mudou de selectedCategory para activeCategory
      selectedGender={selectedGender}
      selectedColor={selectedColor}
      onItemSelect={(itemId) => console.log('Item selecionado:', itemId)}
      selectedItem="100" // ID do item selecionado
    />
  );
};
```

#### ✨ Funcionalidades do Grid

- **Hover com Nome**: Passe o mouse sobre qualquer item para ver o nome do visual (ex: "shirt_F_trippyshirt_hearts_nft")
- **Badge HC**: Itens do Habbo Club mostram um ícone de coroa dourada
- **Seleção Visual**: Item selecionado fica destacado com borda amarela

### 3. Exemplo Completo

Veja o arquivo `src/components/examples/OfficialHabboEditor.tsx` para um exemplo completo de editor funcional.

## 📊 Estrutura dos Dados

```typescript
interface HabboClothingCategory {
  type: string;    // 'hr', 'ha', 'ch', etc.
  label: string;   // 'Cabelo', 'Chapéus', 'Camisas', etc.
  sets: HabboClothingSet[];
}

interface HabboClothingSet {
  id: number;           // ID oficial do item (ex: 100, 1010, 210)
  gender: 'M' | 'F' | 'U'; // M=Masculino, F=Feminino, U=Unissex
  club?: boolean;       // true se é item do Habbo Club
}
```

## 🎨 Geração de URLs

### Função Oficial

```typescript
import { generateHabboImageUrl } from '@/services/HabboData';

const url = generateHabboImageUrl('hr', 100, '61', 'M', 's');
// Resultado: https://www.habbo.com/habbo-imaging/avatarimage?figure=hr-100-61&gender=M&direction=2&head_direction=2&size=s&headonly=1&img_format=png
```

### Regras da URL

- **Base**: `https://www.habbo.com/habbo-imaging/avatarimage`
- **Figure**: `{categoria}-{id}-{cor}` (ex: `hr-100-61`)
- **Gênero**: `gender=M|F|U`
- **Direção**: `direction=2&head_direction=2`
- **Tamanho**: `size=s|m|l`
- **Head-only**: `&headonly=1` para categorias `hr`, `hd`, `fa`
- **Duotone**: Para camisetas (`ch`), usar `66-61` como cores padrão

### Regras Específicas para Grid de Miniaturas

Para exibir miniaturas no grid de roupas, usar sempre:
- **PART**: Sempre `ch` (camiseta) para consistência visual
- **ID**: ID do item do dataset
- **COLOR**: Cor fixa `1408` (cinza claro)
- **Size**: Sempre `s` (small)

**Exemplo**: `https://www.habbo.com/habbo-imaging/avatarimage?figure=ch-210-1408&size=s`

### Regras Específicas para Estampas (cp)

Itens da categoria `cp` (chest prints/estampas) têm formato especial:
- **Figure**: `cp-{ID}--` (dois hífens, sem cor especificada)
- **Motivo**: Estampas são consideradas "duotone" mas usam formato diferente

**Exemplo**: `https://www.habbo.com/habbo-imaging/avatarimage?figure=cp-3119--&gender=M`

## ⚠️ Mudanças Importantes

### Props do Componente Grid

| Antes | Agora |
|-------|-------|
| `selectedCategory` | `activeCategory` |
| - | Adicionado suporte para itens HC |

### Lógica de Miniaturas no Grid

- **Miniaturas**: Sempre usam `ch-{ID}-1408&size=s` para consistência visual
- **Cor padrão**: `1408` (cinza claro) fixo para todas as miniaturas
- **Tamanho**: Sempre `s` (small) para performance
- **Aplicação real**: A cor selecionada é aplicada quando o item é usado no avatar

### Dados

- **Antes**: IDs sequenciais gerados automaticamente (incorretos)
- **Agora**: IDs validados do `figuremap.xml` oficial

### URLs

- **Antes**: URLs geradas com IDs incorretos
- **Agora**: URLs usando apenas IDs oficiais validados

## 🔍 Validação

### Como Verificar se um ID é Válido

1. Verifique se existe no array `HABBO_CLOTHING_SETS`
2. Teste a URL gerada no navegador
3. Compare com o `figuremap.xml` oficial

### Fonte Oficial

```
https://images.habbo.com/gordon/flash-assets-PRODUCTION-202601121522-867048149/figuremap.xml
```

## 📊 Estatísticas do Dataset

- **4,824 itens** validados no dataset oficial
- **825 itens HC** identificados (todos com badge dourado)
- **26 estampas** corretas (IDs oficiais do Habbo)
- **7,440 nomes** de visuais mapeados para hover
- **13 categorias** completamente cobertas

## 🚀 Benefícios

✅ **IDs Validados**: Apenas IDs oficiais do Habbo
✅ **Imagens Válidas**: Nunca mais imagens quebradas
✅ **Performance**: Dataset otimizado e cacheado
✅ **Compatibilidade**: Mantém compatibilidade com sistema antigo
✅ **HC Support**: Suporte completo para itens do Habbo Club
✅ **Hover com Nomes**: Veja o nome do visual ao passar o mouse sobre itens

## 📞 Suporte

Para dúvidas sobre o novo sistema, consulte:
- Este documento
- O arquivo `src/components/examples/OfficialHabboEditor.tsx`
- O `figuremap.xml` oficial do Habbo