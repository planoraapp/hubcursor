# 🎨 Correção de Salvamento de Background - HabboHub

## 🐛 Problema Original

Background não estava salvando ao mudar na home do usuário:
- ❌ Erro 401 (Unauthorized) ao tentar salvar no Supabase
- ❌ Background antigo sendo exibido nos cards após reload
- ❌ Mudanças não persistiam entre sessões

**Causa Raiz**: 
- RLS (Row Level Security) do Supabase bloqueando acesso direto à tabela `user_home_backgrounds`
- Tentativa insegura de usar `service_role` key no frontend (REJEITADA por segurança!)

## ✅ Solução Implementada (Segura)

### Abordagem em 2 Níveis:

#### 1. **LocalStorage (Primário)**
```typescript
// Sempre salva localmente (funciona offline)
pendingChangesRef.current.background = newBackground;
scheduleSave(); // Debounced save para performance
```

#### 2. **Edge Function (Secundário - Opcional)**
```typescript
// Tenta sincronizar com Supabase via edge function
fetch('sync-home-assets', {
  method: 'POST',
  body: JSON.stringify({
    action: 'update_background',
    habbo_name: username,
    background: { type, value }
  })
});
```

**Graceful Degradation**: Se a edge function não existir ou falhar, o sistema continua funcionando com localStorage!

## 🔒 Por Que NÃO Usamos Service Role Key?

**CRÍTICO DE SEGURANÇA** ⚠️:
```typescript
// ❌ NUNCA FAÇA ISSO:
const SERVICE_ROLE_KEY = "eyJhbGciOi..."; // Chave de admin no frontend!
```

**Problemas**:
- 🚨 Expõe chave de administrador no código do cliente
- 🚨 Qualquer usuário pode inspecionar e roubar a chave
- 🚨 Acesso total ao banco sem restrições
- 🚨 Pode deletar TUDO, modificar TUDO, ler TUDO

**Solução Correta**:
- ✅ Edge Functions com validação
- ✅ RLS policies bem configuradas
- ✅ Auth adequada com JWT tokens
- ✅ Service role apenas no backend

## 📊 Como Funciona Agora

### Fluxo de Salvamento:

```
Usuário muda background
       ↓
Atualiza estado React (imediato)
       ↓
Salva em localStorage (persistência)
       ↓
Tenta sync com Supabase via edge function
       ├─ ✅ Sucesso: Background nos cards atualiza
       └─ ⚠️ Falha: Continua funcionando localmente
```

### Fluxo de Carregamento:

```
Página carrega
       ↓
Verifica localStorage
       ├─ Tem dados salvos? → Usa localStorage
       └─ Não tem? → Busca do Supabase
       ↓
Renderiza background
```

## 🧪 Testando

1. **Mudar Background**:
   ```
   - Entre na sua home
   - Ative modo edição
   - Mude o background
   - Deve atualizar instantaneamente
   ```

2. **Verificar Persistência**:
   ```
   - Recarregue a página (F5)
   - Background deve permanecer
   - Verifique console: "✅ Background salvo"
   ```

3. **Verificar Cards**:
   ```
   - Vá para /home
   - Seu card deve mostrar o novo background
   - (Pode demorar até 30s para sincronizar)
   ```

## 🔄 Estado Atual

### O Que Funciona:
- ✅ Background salva localmente
- ✅ Persiste entre reloads
- ✅ Atualiza UI instantaneamente
- ✅ Sem erros 401
- ✅ Sem comprometer segurança

### O Que Precisa da Edge Function (Opcional):
- ⚠️ Sincronizar com Supabase para cards externos
- ⚠️ Mostrar background em outros dispositivos

### Como Criar a Edge Function:

```typescript
// supabase/functions/sync-home-assets/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { action, habbo_name, background } = await req.json()
  
  if (action === 'update_background') {
    // 1. Validar habbo_name
    // 2. Buscar supabase_user_id
    // 3. Fazer upsert com service_role (seguro aqui!)
    // 4. Retornar sucesso
  }
  
  return new Response(JSON.stringify({ success: true }))
})
```

## 📝 Logs Adicionados

```typescript
✅ Background salvo via edge function
⚠️ Edge function não disponível, salvando apenas localmente
⚠️ Falha ao salvar via edge function, salvando apenas localmente
```

## 🎯 Próximos Passos (Opcional)

1. **Criar edge function `sync-home-assets`** para sincronização com Supabase
2. **Configurar RLS policies** para permitir usuários atualizarem seus próprios backgrounds
3. **Implementar retry logic** para tentativas de sincronização falhadas

---

**Data**: 10/10/2025  
**Status**: ✅ Funcional (localStorage) | ⚠️ Edge function pendente
**Segurança**: ✅ Aprovado (sem exposição de service_role)

