-- ========================================
-- SCRIPT DE VERIFICAÇÃO DAS MIGRAÇÕES
-- ========================================
-- Execute este script no Supabase SQL Editor para verificar
-- se as migrações foram aplicadas corretamente

-- ========================================
-- 1. VERIFICAR POLÍTICAS RLS DE chat_messages
-- ========================================
SELECT 
  policyname as "Nome da Política",
  cmd as "Comando",
  CASE 
    WHEN qual IS NOT NULL THEN 'Definido'
    ELSE 'Não definido'
  END as "Qual (USING)",
  CASE 
    WHEN with_check IS NOT NULL THEN 'Definido'
    ELSE 'Não definido'
  END as "With Check"
FROM pg_policies 
WHERE tablename = 'chat_messages'
ORDER BY policyname;

-- Políticas esperadas:
-- ✅ "Users can view their own messages" (SELECT)
-- ✅ "Users can send messages" (INSERT)
-- ✅ "Users can update their own messages" (UPDATE)

-- ========================================
-- 2. VERIFICAR POLÍTICAS RLS DE user_blocks
-- ========================================
SELECT 
  policyname as "Nome da Política",
  cmd as "Comando"
FROM pg_policies 
WHERE tablename = 'user_blocks'
ORDER BY policyname;

-- Políticas esperadas:
-- ✅ "Users can view their own blocks" (SELECT)
-- ✅ "Users can create their own blocks" (INSERT)
-- ✅ "Users can delete their own blocks" (DELETE)

-- ========================================
-- 3. VERIFICAR POLÍTICAS RLS DE message_reports
-- ========================================
SELECT 
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

-- ========================================
-- 4. VERIFICAR FUNÇÃO log_chat_message_activity
-- ========================================
SELECT 
  proname as "Nome da Função",
  prosrc as "Código Fonte",
  CASE 
    WHEN proname = 'log_chat_message_activity' THEN '✅ Função encontrada'
    ELSE '❌ Função não encontrada'
  END as "Status"
FROM pg_proc 
WHERE proname = 'log_chat_message_activity';

-- ========================================
-- 5. VERIFICAR TRIGGER chat_messages_activity_trigger
-- ========================================
SELECT 
  tgname as "Nome do Trigger",
  CASE 
    WHEN tgenabled = 'O' THEN '✅ Habilitado'
    WHEN tgenabled = 'D' THEN '⚠️  Desabilitado'
    ELSE '❓ Estado desconhecido'
  END as "Status",
  pg_get_triggerdef(oid) as "Definição"
FROM pg_trigger 
WHERE tgname = 'chat_messages_activity_trigger';

-- ========================================
-- 6. VERIFICAR SE TRIGGER ESTÁ VINCULADO À TABELA
-- ========================================
SELECT 
  t.tgname as "Nome do Trigger",
  c.relname as "Tabela",
  p.proname as "Função",
  CASE 
    WHEN t.tgenabled = 'O' THEN '✅ Ativo'
    ELSE '⚠️  Inativo'
  END as "Status"
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'chat_messages_activity_trigger';

-- ========================================
-- 7. VERIFICAR ESTRUTURA DA TABELA user_activity_log
-- ========================================
SELECT 
  column_name as "Coluna",
  data_type as "Tipo",
  is_nullable as "Permite NULL"
FROM information_schema.columns
WHERE table_name = 'user_activity_log'
ORDER BY ordinal_position;

-- ========================================
-- 8. TESTE: Verificar se há registros de chat_message no log
-- ========================================
SELECT 
  COUNT(*) as "Total de mensagens de chat registradas",
  MAX(created_at) as "Última mensagem registrada"
FROM user_activity_log
WHERE activity_type = 'chat_message';

-- ========================================
-- RESUMO DA VERIFICAÇÃO
-- ========================================
-- Execute todas as queries acima e verifique:
-- 
-- ✅ chat_messages deve ter 3 políticas (view, send, update)
-- ✅ user_blocks deve ter 3 políticas (view, create, delete)
-- ✅ message_reports deve ter 4 políticas (2 user + 2 admin)
-- ✅ Função log_chat_message_activity deve existir
-- ✅ Trigger chat_messages_activity_trigger deve existir e estar ativo
-- ✅ Trigger deve estar vinculado à tabela chat_messages
-- ✅ user_activity_log deve ter estrutura correta
-- ✅ Se houver mensagens de chat, devem aparecer no log

