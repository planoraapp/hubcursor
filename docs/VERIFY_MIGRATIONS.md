# 🔍 Verificação das Migrações Aplicadas

## Instruções

Execute o script SQL abaixo no **Supabase SQL Editor** para verificar se as migrações foram aplicadas corretamente:

🔗 **Link direto**: https://supabase.com/dashboard/project/wueccgeizznJmjgmuscy/sql/new

---

## Script de Verificação Completo

```sql
-- ========================================
-- VERIFICAÇÃO DAS MIGRAÇÕES APLICADAS
-- ========================================

-- 1. VERIFICAR POLÍTICAS RLS DE chat_messages
SELECT 
  'chat_messages' as "Tabela",
  policyname as "Nome da Política",
  cmd as "Comando",
  CASE 
    WHEN qual IS NOT NULL THEN '✅ Definido'
    ELSE '❌ Não definido'
  END as "Qual (USING)"
FROM pg_policies 
WHERE tablename = 'chat_messages'
ORDER BY policyname;

-- Políticas esperadas:
-- ✅ "Users can view their own messages" (SELECT)
-- ✅ "Users can send messages" (INSERT)
-- ✅ "Users can update their own messages" (UPDATE)

-- 2. VERIFICAR POLÍTICAS RLS DE user_blocks
SELECT 
  'user_blocks' as "Tabela",
  policyname as "Nome da Política",
  cmd as "Comando"
FROM pg_policies 
WHERE tablename = 'user_blocks'
ORDER BY policyname;

-- Políticas esperadas:
-- ✅ "Users can view their own blocks" (SELECT)
-- ✅ "Users can create their own blocks" (INSERT)
-- ✅ "Users can delete their own blocks" (DELETE)

-- 3. VERIFICAR POLÍTICAS RLS DE message_reports
SELECT 
  'message_reports' as "Tabela",
  policyname as "Nome da Política",
  cmd as "Comando"
FROM pg_policies 
WHERE tablename = 'message_reports'
ORDER BY policyname;

-- Políticas esperadas:
-- ✅ "Users can view their own reports" (SELECT)
-- ✅ "Users can create their own reports" (INSERT)
-- ✅ "Admins can view all reports" (SELECT)
-- ✅ "Admins can update all reports" (UPDATE)

-- 4. VERIFICAR FUNÇÃO log_chat_message_activity
SELECT 
  proname as "Nome da Função",
  CASE 
    WHEN proname = 'log_chat_message_activity' THEN '✅ Função encontrada'
    ELSE '❌ Função não encontrada'
  END as "Status"
FROM pg_proc 
WHERE proname = 'log_chat_message_activity';

-- 5. VERIFICAR TRIGGER chat_messages_activity_trigger
SELECT 
  tgname as "Nome do Trigger",
  c.relname as "Tabela Vinculada",
  p.proname as "Função Executada",
  CASE 
    WHEN t.tgenabled = 'O' THEN '✅ Habilitado'
    WHEN t.tgenabled = 'D' THEN '⚠️  Desabilitado'
    ELSE '❓ Estado desconhecido'
  END as "Status"
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'chat_messages_activity_trigger';

-- 6. VERIFICAR SE POLÍTICAS PERMISSIVAS FORAM REMOVIDAS
SELECT 
  'chat_messages' as "Tabela",
  policyname as "Política Encontrada",
  CASE 
    WHEN policyname LIKE '%Authenticated users can%' THEN '⚠️  Política permissiva ainda existe!'
    ELSE '✅ OK'
  END as "Status"
FROM pg_policies 
WHERE tablename = 'chat_messages'
  AND policyname LIKE '%Authenticated users can%';

-- Deve retornar 0 linhas (nenhuma política permissiva)

-- 7. TESTE FUNCIONAL: Verificar registros no log (se houver mensagens)
SELECT 
  COUNT(*) as "Total de mensagens de chat registradas",
  MAX(created_at) as "Última mensagem registrada"
FROM user_activity_log
WHERE activity_type = 'chat_message';
```

---

## ✅ Checklist de Verificação

Após executar o script, verifique:

### Migração 1: Fix Chat RLS Policies

- [ ] **chat_messages** tem 3 políticas:
  - [ ] "Users can view their own messages" (SELECT)
  - [ ] "Users can send messages" (INSERT)
  - [ ] "Users can update their own messages" (UPDATE)

- [ ] **user_blocks** tem 3 políticas:
  - [ ] "Users can view their own blocks" (SELECT)
  - [ ] "Users can create their own blocks" (INSERT)
  - [ ] "Users can delete their own blocks" (DELETE)

- [ ] **message_reports** tem 4 políticas:
  - [ ] "Users can view their own reports" (SELECT)
  - [ ] "Users can create their own reports" (INSERT)
  - [ ] "Admins can view all reports" (SELECT)
  - [ ] "Admins can update all reports" (UPDATE)

- [ ] **Nenhuma política permissiva** ("Authenticated users can...") existe mais

### Migração 2: Add Chat Message Activity Trigger

- [ ] Função `log_chat_message_activity` existe
- [ ] Trigger `chat_messages_activity_trigger` existe
- [ ] Trigger está vinculado à tabela `chat_messages`
- [ ] Trigger está **habilitado** (Status = "✅ Habilitado")
- [ ] Trigger executa a função `log_chat_message_activity`

---

## 🧪 Teste Funcional

Para testar se o trigger está funcionando:

1. **Envie uma mensagem de chat** pelo sistema
2. **Execute esta query** para verificar se foi registrada:

```sql
SELECT 
  id,
  habbo_name,
  activity_type,
  target_id as "Receiver ID",
  metadata->>'message_preview' as "Preview da Mensagem",
  created_at
FROM user_activity_log
WHERE activity_type = 'chat_message'
ORDER BY created_at DESC
LIMIT 5;
```

Se aparecer a mensagem que você acabou de enviar, significa que o trigger está funcionando! ✅

---

## ❌ Problemas Comuns

### Se as políticas não aparecerem:

1. Verifique se executou a migração completa
2. Verifique se não houve erros durante a execução
3. Certifique-se de executar todas as linhas do SQL

### Se o trigger não aparecer:

1. Verifique se a função foi criada primeiro
2. Verifique se não houve erro ao criar o trigger
3. O trigger pode estar desabilitado - verifique o campo `tgenabled`

### Se o trigger não funcionar:

1. Verifique se a função está correta
2. Teste enviando uma mensagem e verifique o log
3. Verifique os logs do Supabase para erros

---

**Criado em**: 20/01/2025

