# 🚀 Aplicar Migrações - Chat RLS e Activity Log

## 📋 Migrações a Aplicar

Duas migrações foram criadas para corrigir problemas identificados no sistema de chat e histórico:

1. **20250120000007_fix_chat_rls_policies.sql** - Corrige políticas RLS do chat
2. **20250120000008_add_chat_message_activity_trigger.sql** - Adiciona trigger para logar mensagens

---

## 🔧 Como Aplicar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/wueccgeizznJmjgmuscy/sql/new

2. Copie e cole o conteúdo de cada migração (abaixo) no SQL Editor

3. Execute cada migração individualmente (clicar em "Run")

4. Verifique se não houve erros

### Opção 2: Via Supabase CLI (se disponível)

```bash
# Se você tiver o Supabase CLI instalado
supabase db push
```

---

## 📄 Migração 1: Fix Chat RLS Policies

**Arquivo**: `supabase/migrations/20250120000007_fix_chat_rls_policies.sql`

```sql
-- ========================================
-- FIX CHAT RLS POLICIES
-- ========================================
-- Corrige políticas muito permissivas do chat
-- Garante que usuários só vejam suas próprias mensagens
-- e que bloqueios e denúncias sigam o mesmo padrão

-- Dropar políticas permissivas do chat
DROP POLICY IF EXISTS "Authenticated users can view messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON chat_messages;

-- Criar políticas corretas usando auth.uid()
-- Usuários só podem ver mensagens onde são sender ou receiver
CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  USING (
    auth.uid()::text = sender_id::text OR 
    auth.uid()::text = receiver_id::text
  );

-- Usuários só podem enviar mensagens como sender_id próprio
CREATE POLICY "Users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid()::text = sender_id::text);

-- Usuários só podem atualizar mensagens onde são sender ou receiver
CREATE POLICY "Users can update their own messages"
  ON chat_messages FOR UPDATE
  USING (
    auth.uid()::text = sender_id::text OR 
    auth.uid()::text = receiver_id::text
  );

-- Corrigir políticas de user_blocks (usuários só veem seus próprios bloqueios)
DROP POLICY IF EXISTS "Authenticated users can view blocks" ON user_blocks;
DROP POLICY IF EXISTS "Authenticated users can create blocks" ON user_blocks;
DROP POLICY IF EXISTS "Authenticated users can delete blocks" ON user_blocks;

CREATE POLICY "Users can view their own blocks"
  ON user_blocks FOR SELECT
  USING (auth.uid()::text = blocker_id::text);

CREATE POLICY "Users can create their own blocks"
  ON user_blocks FOR INSERT
  WITH CHECK (auth.uid()::text = blocker_id::text);

CREATE POLICY "Users can delete their own blocks"
  ON user_blocks FOR DELETE
  USING (auth.uid()::text = blocker_id::text);

-- Corrigir políticas de message_reports (usuários só veem suas próprias denúncias)
DROP POLICY IF EXISTS "Authenticated users can view reports" ON message_reports;
DROP POLICY IF EXISTS "Authenticated users can create reports" ON message_reports;
DROP POLICY IF EXISTS "Authenticated users can update reports" ON message_reports;

CREATE POLICY "Users can view their own reports"
  ON message_reports FOR SELECT
  USING (auth.uid()::text = reporter_id::text);

CREATE POLICY "Users can create their own reports"
  ON message_reports FOR INSERT
  WITH CHECK (auth.uid()::text = reporter_id::text);

-- Admins podem ver todas as denúncias (para moderação)
CREATE POLICY "Admins can view all reports"
  ON message_reports FOR SELECT
  USING (true);

-- Admins podem atualizar denúncias (para moderação)
CREATE POLICY "Admins can update all reports"
  ON message_reports FOR UPDATE
  USING (true);

-- Comentários
COMMENT ON POLICY "Users can view their own messages" ON chat_messages IS 'Usuários só podem ver mensagens onde são sender ou receiver';
COMMENT ON POLICY "Users can send messages" ON chat_messages IS 'Usuários só podem enviar mensagens como sender_id próprio';
COMMENT ON POLICY "Users can view their own blocks" ON user_blocks IS 'Usuários só podem ver seus próprios bloqueios';
```

---

## 📄 Migração 2: Add Chat Message Activity Trigger

**Arquivo**: `supabase/migrations/20250120000008_add_chat_message_activity_trigger.sql`

```sql
-- ========================================
-- TRIGGER PARA LOGAR MENSAGENS DE CHAT
-- ========================================
-- Registra automaticamente mensagens de chat no user_activity_log
-- quando uma nova mensagem é inserida

-- Função para registrar atividades de chat
CREATE OR REPLACE FUNCTION log_chat_message_activity()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  -- Buscar habbo_name do sender através de habbo_accounts
  SELECT habbo_name INTO sender_name
  FROM habbo_accounts
  WHERE supabase_user_id = NEW.sender_id
  LIMIT 1;

  -- Se não encontrar, usar 'unknown' (não deve acontecer, mas previne erro)
  sender_name := COALESCE(sender_name, 'unknown');

  -- Registrar atividade no log
  INSERT INTO user_activity_log (
    user_id, 
    habbo_name, 
    activity_type, 
    target_type, 
    target_id, 
    metadata
  )
  VALUES (
    NEW.sender_id,
    sender_name,
    'chat_message',
    'chat',
    NEW.receiver_id::text,
    jsonb_build_object(
      'message_id', NEW.id,
      'message_preview', left(NEW.message, 50), -- Primeiros 50 caracteres
      'receiver_id', NEW.receiver_id,
      'created_at', NEW.created_at
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger (só para INSERT, pois mensagens não são deletadas, apenas marcadas)
CREATE TRIGGER chat_messages_activity_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION log_chat_message_activity();

-- Comentários
COMMENT ON FUNCTION log_chat_message_activity() IS 'Registra automaticamente atividades de mensagens de chat no user_activity_log';
COMMENT ON TRIGGER chat_messages_activity_trigger ON chat_messages IS 'Trigger que registra cada nova mensagem de chat no log de atividades';
```

---

## ✅ Verificação Pós-Aplicação

Após aplicar as migrações, verifique:

### 1. Verificar Políticas RLS do Chat

```sql
-- Verificar políticas de chat_messages
SELECT * FROM pg_policies WHERE tablename = 'chat_messages';

-- Deve mostrar:
-- - "Users can view their own messages"
-- - "Users can send messages"
-- - "Users can update their own messages"
```

### 2. Verificar Trigger de Chat

```sql
-- Verificar se o trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'chat_messages_activity_trigger';

-- Verificar se a função existe
SELECT * FROM pg_proc WHERE proname = 'log_chat_message_activity';
```

### 3. Testar Funcionalidade

1. Enviar uma mensagem de chat
2. Verificar se foi registrada em `user_activity_log`:
   ```sql
   SELECT * FROM user_activity_log 
   WHERE activity_type = 'chat_message' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

---

## 🎯 O Que Essas Migrações Fazem

### Migração 1: Fix Chat RLS Policies
- ✅ Remove políticas muito permissivas que permitiam qualquer usuário autenticado ver todas as mensagens
- ✅ Restaura políticas que garantem privacidade (usuários só veem suas próprias mensagens)
- ✅ Corrige políticas de `user_blocks` e `message_reports` também

### Migração 2: Add Chat Message Activity Trigger
- ✅ Cria função `log_chat_message_activity()` que registra mensagens no histórico
- ✅ Cria trigger que executa automaticamente quando uma mensagem é inserida
- ✅ Busca `habbo_name` automaticamente de `habbo_accounts`
- ✅ Registra metadata com preview da mensagem

---

## 📚 Documentação Relacionada

- [Status das Interações](./INTERACTIONS_STATUS.md) - Documento completo sobre o estado atual
- [Arquitetura](./ARCHITECTURE.md) - Visão geral da arquitetura do sistema

---

**Data de Criação**: 20/01/2025
**Status**: ⚠️ Pendente de Aplicação

