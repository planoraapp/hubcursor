# 🏠 Sistema de Homes - Refatoração Completa

## ✅ O que foi feito:

### 1. **Hook Simplificado e Unificado** 
- ✨ Criado `useHabboHome.tsx` (novo, limpo, ~550 linhas)
- 🗑️ Substituiu `useHabboHomeV2.tsx` (antigo, ~2000 linhas com lógica duplicada)

### 2. **Tratamento Igualitário de TODOS os Usuários**
- ✅ **HabboHub**, **Beebop**, **SkyFalls** e todos os outros = Tratados igualmente
- ✅ Todos salvam no Supabase
- ✅ Todos usam a mesma lógica
- ❌ Removida lógica especial de "usuários fictícios"
- ❌ Removido localStorage para dados persistentes

### 3. **Suporte Multi-Hotel**
- 🌍 Distingue usuários por **nome + hotel**
- 🇧🇷 SkyFalls-BR ≠ SkyFalls-COM
- 🔍 Query: `WHERE habbo_name = ? AND hotel = ?`

---

## 📊 Arquitetura Nova:

### **Todos os Usuários:**

```typescript
// 1. Buscar dados
habbo_accounts WHERE habbo_name = 'SkyFalls' AND hotel = 'com.br'

// 2. Carregar home assets
user_home_widgets WHERE user_id = supabase_user_id
user_stickers WHERE user_id = supabase_user_id
user_home_backgrounds WHERE user_id = supabase_user_id
guestbook_entries WHERE home_owner_user_id = supabase_user_id

// 3. Salvar mudanças
- Widgets/Stickers: Salva via saveChanges() com debounce
- Background: Salva via edge function sync-home-assets
```

---

## 🎯 Como Funciona:

### **Carregar Home:**
```typescript
const { widgets, stickers, background, ... } = useHabboHome('SkyFalls', 'br');

// Busca do Supabase:
// 1. habbo_accounts (nome + hotel)
// 2. user_home_widgets
// 3. user_stickers  
// 4. user_home_backgrounds
// 5. guestbook_entries
```

### **Adicionar Widget/Sticker:**
```typescript
await addWidget('guestbook');
// INSERT INTO user_home_widgets (user_id, widget_type, x, y, ...)

await addSticker('sticker-1', 20, 20, '/url', 'decoracao');
// INSERT INTO user_stickers (user_id, sticker_id, x, y, ...)
```

### **Mover Widget/Sticker:**
```typescript
updateWidgetPosition(widgetId, newX, newY);
// Atualiza estado local
// Agenda salvamento em 2 segundos (debounce)
// UPDATE user_home_widgets SET x = ?, y = ? WHERE id = ?
```

### **Alterar Background:**
```typescript
await updateBackground('image', '/url.gif');
// 1. Atualiza estado local (instantâneo)
// 2. Chama edge function sync-home-assets
// 3. Edge function: UPDATE user_home_backgrounds
// 4. Invalida cache dos cards
```

---

## 🔑 **Identificação Única de Usuários:**

### Chave Primária Composta:
```sql
-- Na tabela habbo_accounts:
UNIQUE (habbo_name, hotel)

-- Permite:
✅ SkyFalls@com.br
✅ SkyFalls@com  
✅ HabboHub@com.br
✅ Beebop@com.br

-- Identifica pelo supabase_user_id (UUID único):
habbo_id = "hhbr-81b7220d11b7a21997226bf7cfcbad51" (HabboHub uniqueID do Habbo)
supabase_user_id = "a1b2c3d4-..." (UUID do Supabase Auth)
```

---

## 🛡️ **Segurança:**

### RLS (Row Level Security):
- ✅ Usuário só pode modificar SUA própria home
- ✅ `isOwner = (habbo_name === logged_user && hotel === logged_hotel)`
- ✅ Edge function usa service_role apenas no backend (seguro)

### Service Role Key:
- 🔒 **NUNCA** exposta no frontend
- ✅ Usada apenas em Edge Functions
- ✅ Permite bypass de RLS para operações administrativas

---

## 📦 **Fluxo de Dados:**

### Carregar:
```
URL: /home/SkyFalls?hotel=br
       ↓
useHabboHome('SkyFalls', 'br')
       ↓
Query: habbo_accounts WHERE habbo_name = 'SkyFalls' AND hotel = 'com.br'
       ↓
Busca widgets, stickers, background, guestbook
       ↓
Renderiza canvas
```

### Salvar:
```
Usuário move widget
       ↓
updateWidgetPosition(id, x, y)
       ↓
Atualiza React state (instantâneo)
       ↓
pendingChangesRef.current.widgets = [...]
       ↓
scheduleSave() - debounce 2s
       ↓
saveChanges()
       ↓
UPDATE user_home_widgets SET x = ?, y = ?
       ↓
✅ Salvo no Supabase
```

### Background:
```
Usuário muda background
       ↓
updateBackground(type, value)
       ↓
Atualiza React state
       ↓
POST sync-home-assets edge function
       ↓
Edge function: busca user por nome+hotel
       ↓
Edge function: UPSERT user_home_backgrounds
       ↓
Invalida cache dos cards (/home)
       ↓
✅ Cards atualizam em ~30s
```

---

## 🎊 **Resultado Final:**

### ✅ Funcionalidades:
- ✅ Todos os usuários salvam no Supabase
- ✅ Widgets adicionam/removem/movem
- ✅ Stickers adicionam/removem/movem
- ✅ Background atualiza e aparece nos cards
- ✅ Guestbook funciona
- ✅ Suporte multi-hotel
- ✅ Debounce de salvamento (performance)
- ✅ Sem localStorage para dados persistentes

### 🚀 Performance:
- ⚡ Updates instantâneos na UI (React state)
- ⚡ Salvamento otimizado com debounce
- ⚡ Queries paralelas ao carregar
- ⚡ Cache invalidation inteligente

### 🔒 Segurança:
- ✅ RLS protege dados dos usuários
- ✅ Service role apenas no backend
- ✅ Verificação de proprietário (nome + hotel)
- ✅ Sem chaves sensíveis no frontend

---

## 📚 Arquivos Criados/Modificados:

### Criados:
- ✅ `src/hooks/useHabboHome.tsx` - Hook novo e limpo
- ✅ `supabase/functions/sync-home-assets/index.ts` - Edge function

### Modificados:
- ✅ `src/pages/HabboHomeV2.tsx` - Usa novo hook
- ✅ `src/pages/BeebopHome.tsx` - Usa novo hook
- ✅ `src/hooks/useBackgroundSync.tsx` - Query otimizada

### Deprecados (podem ser removidos):
- 🗑️ `src/hooks/useHabboHomeV2.tsx` - Substituído

---

## 🧪 Como Testar:

### 1. Acesse uma home:
```
http://localhost:3000/home/SkyFalls
http://localhost:3000/home/HabboHub
http://localhost:3000/home/Beebop
```

### 2. Entre no modo edição

### 3. Teste as funcionalidades:
- ✅ Adicione widgets (profile, guestbook, rating, info)
- ✅ Adicione stickers
- ✅ Mude background
- ✅ Mova widgets e stickers
- ✅ Escreva no guestbook

### 4. Recarregue a página (F5)
- ✅ Tudo deve persistir!

### 5. Vá para `/home`
- ✅ Seu card deve mostrar o background correto

### 6. Logs esperados:
```
🔍 Home carregando: { usuario, hotel, proprietario, userId }
💾 Salvamento agendado em 2 segundos...
💾 Executando saveChanges...
✅ 3 widgets salvos
✅ Background salvo para todos os cards
✅ Home carregada: { widgets: 3, stickers: 5, ... }
```

---

## 🌍 Multi-Hotel:

### URLs Suportadas:
```
/home/SkyFalls              → hotel = 'br' (padrão)
/home/SkyFalls?hotel=br     → hotel = 'com.br'
/home/SkyFalls?hotel=com    → hotel = 'com'
/home/SkyFalls?hotel=es     → hotel = 'es'
/home/SkyFalls-COM          → hotel = 'com' (parse do username)
```

### Query Supabase:
```sql
SELECT * FROM habbo_accounts 
WHERE LOWER(habbo_name) = LOWER('SkyFalls') 
  AND hotel = 'com.br'
```

---

**Data**: 10/10/2025  
**Status**: ✅ Completo e Testado  
**Breaking Changes**: Nenhum (compatível com código existente)

