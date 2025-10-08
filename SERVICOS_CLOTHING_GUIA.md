# 🎨 Guia de Serviços de Clothing - HabboHub

## ⚠️ IMPORTANTE: Múltiplos Serviços Disponíveis

O HabboHub possui vários serviços para gerenciar roupas do Habbo. Este guia explica qual usar em cada situação.

---

## 📚 Serviços Disponíveis

### **1. `useHybridClothingDataV2.tsx` ✅ RECOMENDADO**
**Status**: Ativo e mantido  
**Descrição**: Sistema híbrido mais recente que combina múltiplas fontes  
**Quando usar**: Para editor de avatar e catálogo de roupas  
**Fontes**: Combina dados oficiais + assets locais + cache

```typescript
import { useHybridClothingDataV2 } from '@/hooks/useHybridClothingDataV2';

const { categories, isLoading } = useHybridClothingDataV2();
```

---

### **2. `useUnifiedHabboClothing.tsx` ✅ ALTERNATIVA**
**Status**: Ativo  
**Descrição**: Sistema unificado com Edge Function dedicada  
**Quando usar**: Quando precisa de dados sempre atualizados da API  
**Fontes**: Edge Function `unified-clothing-api`

```typescript
import { useUnifiedHabboClothing } from '@/hooks/useUnifiedHabboClothing';

const { clothingData, isLoading } = useUnifiedHabboClothing('br');
```

---

### **3. `useOfficialHabboClothing.tsx` 📦 LEGADO**
**Status**: Mantido para compatibilidade  
**Descrição**: Acessa diretamente dados oficiais do Habbo  
**Quando usar**: Apenas se precisar de dados oficiais puros  
**Fontes**: API oficial do Habbo.com

---

### **4. `useHabboWidgetsClothing.tsx` 🔧 ESPECÍFICO**
**Status**: Ativo  
**Descrição**: Dados de roupas via widgets  
**Quando usar**: Para widgets e homes  
**Fontes**: Edge Function `habbo-widgets-clothing`

---

### **5. `useEnhancedFlashAssetsV2.tsx` 🖼️ ASSETS**
**Status**: Ativo  
**Descrição**: Carrega imagens de roupas otimizadas  
**Quando usar**: Para renderizar thumbnails de roupas  
**Fontes**: Assets locais + fallbacks

---

### **6. Outros Serviços (Legados)**
- `useHybridClothingSystem.tsx` - V1 do híbrido
- `useHybridClothingData.tsx` - V1 original
- `useFlashAssetsViaJovem.tsx` - Específico ViaJovem
- `useOfficialClothingData.tsx` - Wrapper oficial
- `useOfficialClothingIndex.tsx` - Índice oficial
- `useEnhancedFlashAssets.tsx` - V1 de assets

**Status**: Mantidos para compatibilidade, mas não recomendados para novos projetos

---

## 🎯 Recomendações de Uso

### **Editor de Avatar**
```typescript
// Use: useHybridClothingDataV2
const { categories, getClothingById } = useHybridClothingDataV2();
```

### **Catálogo de Roupas**
```typescript
// Use: useHybridClothingDataV2 ou useUnifiedHabboClothing
const { clothingData } = useUnifiedHabboClothing('br');
```

### **Thumbnails/Imagens**
```typescript
// Use: useEnhancedFlashAssetsV2
const { getAssetUrl } = useEnhancedFlashAssetsV2();
```

### **Widgets de Home**
```typescript
// Use: useHabboWidgetsClothing
const { widgetClothing } = useHabboWidgetsClothing();
```

---

## 🔄 Migração Futura

### **Plano de Consolidação** (Pós-Beta)

1. **Curto Prazo**:
   - Padronizar uso de `useHybridClothingDataV2`
   - Remover importações de serviços V1

2. **Médio Prazo**:
   - Criar `useClothingSystem.tsx` único
   - Deprecar serviços legados
   - Migrar componentes existentes

3. **Longo Prazo**:
   - Deletar arquivos V1/legados
   - Manter apenas sistema unificado
   - Documentar API final

---

## ⚠️ Não Deletar Ainda

Todos os serviços estão sendo usados em algum lugar do código. Antes de deletar:

1. Buscar todas as importações: `grep -r "import.*useXXX" src/`
2. Migrar componentes para serviço recomendado
3. Testar extensivamente
4. Só então deletar arquivo

---

## 📝 Conclusão

**Para novos desenvolvimentos**: Use sempre `useHybridClothingDataV2`  
**Para manutenção**: Mantenha serviço atual até migração planejada  
**Para produção**: Todos os serviços funcionam, consolidação é otimização futura

---

**Última atualização**: 08/01/2025  
**Status**: 🟡 Documentado, consolidação planejada para pós-beta

