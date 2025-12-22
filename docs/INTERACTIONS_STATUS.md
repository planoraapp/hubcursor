# Status das Interações do Sistema - Habbo Hub

## 📊 Resumo Executivo

Este documento descreve o estado atual das funcionalidades de interação (comentários, likes, mensagens) e as configurações necessárias de RLS (Row Level Security) para garantir segurança e histórico adequado.

---

## ✅ Funcionalidades Implementadas

### 1. **Sistema de Likes em Fotos**

**Status**: ✅ **Funcionando**

#### Tabela: `photo_likes`
- ✅ Criada com constraints UNIQUE (evita likes duplicados)
- ✅ Índices otimizados para performance
- ✅ RLS habilitado

#### RLS Policies:
- ✅ `Users can view all likes` - SELECT (todos podem ver)
- ✅ `Authenticated users can insert their own likes` - INSERT (apenas próprio like)
- ✅ `Users can delete their own likes` - DELETE (apenas próprio like)

#### Frontend:
- ✅ Hook `usePhotoLikes` implementado
- ✅ Validação client-side (evita duplicação)
- ✅ React Query para cache e invalidação

#### Histórico:
- ✅ Trigger `photo_likes_activity_trigger` registra em `user_activity_log`
- ✅ Tipos: `photo_like`, `photo_unlike`

#### Edge Function:
- ✅ `photo-interactions/index.ts` - Rate limiting server-side
- ⚠️ **Nota**: Frontend usa Supabase direto, não Edge Function (verificar se necessário)

---

### 2. **Sistema de Comentários em Fotos**

**Status**: ✅ **Funcionando**

#### Tabela: `photo_comments`
- ✅ Criada com validação de tamanho (1-500 caracteres)
- ✅ Campo `hotel` adicionado (distinguir usuários de diferentes hotéis)
- ✅ Índices otimizados
- ✅ RLS habilitado

#### RLS Policies:
- ✅ `Users can view all comments` - SELECT (todos podem ver)
- ✅ `Authenticated users can insert their own comments` - INSERT (apenas próprio comentário)
- ✅ `Users can update their own comments` - UPDATE (apenas próprio comentário)
- ✅ `Users can delete their own comments` - DELETE (apenas próprio comentário)

#### Frontend:
- ✅ Hook `usePhotoComments` implementado
- ✅ Rate limiting client-side (`useCommentRateLimit`)
- ✅ Validação e sanitização
- ✅ React Query para cache

#### Histórico:
- ✅ Trigger `photo_comments_activity_trigger` registra em `user_activity_log`
- ✅ Tipos: `photo_comment`, `photo_comment_delete`
- ✅ Metadata inclui `comment_text` e `comment_id`

#### Edge Function:
- ✅ `photo-interactions/index.ts` - Rate limiting server-side
- ⚠️ **Nota**: Frontend usa Supabase direto, não Edge Function

---

### 3. **Sistema de Mensagens/Chat**

**Status**: ⚠️ **Funcionando, mas sem trigger de histórico**

#### Tabela: `chat_messages`
- ✅ Criada com campos necessários
- ✅ Índices otimizados
- ✅ RLS habilitado
- ⚠️ **Problema**: Múltiplas migrações com políticas conflitantes

#### RLS Policies (Conflito):
Existem 3 migrações que modificam as políticas:

1. **20241008000000_create_chat_system.sql** - Usa `auth.uid()::text = sender_id::text`
2. **20241008000002_fix_chat_permissions.sql** - Usa `habbo_accounts.id` 
3. **20241008000003_simplify_chat_permissions.sql** - Usa `TO authenticated USING (true)` ⚠️ **Muito permissiva**

⚠️ **ATENÇÃO**: A última migração (simplify_chat_permissions) torna as políticas muito permissivas. Qualquer usuário autenticado pode ver TODAS as mensagens.

#### Políticas Atuais (assumindo última migração):
- ✅ `Authenticated users can view messages` - SELECT (⚠️ muito permissiva)
- ✅ `Authenticated users can send messages` - INSERT
- ✅ `Authenticated users can update messages` - UPDATE

#### Frontend:
- ✅ Hook `useChat` implementado
- ✅ Rate limiting client-side
- ✅ Funcionalidades: enviar, bloquear, denunciar

#### Histórico:
- ❌ **FALTANDO**: Não há trigger para registrar mensagens em `user_activity_log`
- ⚠️ Campo `chat_message` existe na tabela, mas não é usado

#### Tabelas Relacionadas:
- ✅ `user_blocks` - Sistema de bloqueio funcionando
- ✅ `message_reports` - Sistema de denúncia funcionando

---

## 📋 Tabela de Histórico: `user_activity_log`

**Status**: ✅ **Configurada, mas incompleta**

#### Estrutura:
- ✅ Tabela criada com todos os campos necessários
- ✅ Índices otimizados
- ✅ RLS habilitado

#### RLS Policies:
- ✅ `Users can view their own activities` - SELECT (apenas próprias atividades)
- ✅ `System can insert activities` - INSERT (apenas próprio user_id)

#### Triggers Implementados:
- ✅ `photo_likes_activity_trigger` - Registra likes/unlikes
- ✅ `photo_comments_activity_trigger` - Registra comentários
- ❌ **FALTANDO**: Trigger para `chat_messages`

#### Tipos de Atividade Suportados:
- ✅ `photo_like`
- ✅ `photo_unlike`
- ✅ `photo_comment`
- ✅ `photo_comment_delete`
- ✅ `chat_message` (campo existe, mas não é usado)
- ✅ `profile_view` (não implementado ainda)
- ✅ `profile_follow` (não implementado ainda)
- ✅ `profile_unfollow` (não implementado ainda)

---

## 🔧 Configurações Necessárias

### 🔴 PRIORIDADE ALTA

#### 1. **Corrigir RLS Policies do Chat**
**Problema**: A migração `20241008000003_simplify_chat_permissions.sql` torna as políticas muito permissivas.

**Solução**: Criar nova migração que:
- Remove políticas permissivas
- Restaura políticas que verificam `sender_id` e `receiver_id` usando `auth.uid()`
- Garante que usuários só vejam suas próprias mensagens

**Migração sugerida**: `20250120000007_fix_chat_rls_policies.sql`

#### 2. **Adicionar Trigger para Chat Messages**
**Problema**: Mensagens de chat não são registradas no histórico.

**Solução**: Criar trigger que registre em `user_activity_log` quando mensagem for inserida.

**Função sugerida**: `log_chat_message_activity()`

### 🟡 PRIORIDADE MÉDIA

#### 3. **Unificar Uso de Edge Function**
**Problema**: Frontend usa Supabase direto, mas Edge Function `photo-interactions` existe.

**Decisão necessária**:
- Opção A: Usar Edge Function (mais seguro, rate limiting server-side)
- Opção B: Remover Edge Function (mais simples, rate limiting client-side apenas)

**Recomendação**: Manter Edge Function para rate limiting e validação server-side.

#### 4. **Verificar Constraints do Chat**
**Ação**: Verificar se `chat_messages` precisa de constraints adicionais:
- `sender_id` e `receiver_id` devem referenciar `habbo_accounts`?
- Validação de tamanho de mensagem?
- Mensagem não pode estar vazia?

### 🟢 PRIORIDADE BAIXA

#### 5. **Implementar Atividades Faltantes**
- `profile_view` - Registrar visualizações de perfil
- `profile_follow` - Sistema de seguir usuários
- `profile_unfollow` - Sistema de deixar de seguir

---

## 📝 Migrações Pendentes

### Migração 1: Corrigir RLS do Chat

```sql
-- ========================================
-- FIX CHAT RLS POLICIES
-- ========================================
-- Corrige políticas muito permissivas do chat
-- Garante que usuários só vejam suas próprias mensagens

-- Dropar políticas permissivas
DROP POLICY IF EXISTS "Authenticated users can view messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON chat_messages;

-- Criar políticas corretas usando auth.uid()
CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  USING (
    auth.uid()::text = sender_id::text OR 
    auth.uid()::text = receiver_id::text
  );

CREATE POLICY "Users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid()::text = sender_id::text);

CREATE POLICY "Users can update their own messages"
  ON chat_messages FOR UPDATE
  USING (
    auth.uid()::text = sender_id::text OR 
    auth.uid()::text = receiver_id::text
  );
```

### Migração 2: Trigger para Chat Messages

```sql
-- ========================================
-- TRIGGER PARA LOGAR MENSAGENS DE CHAT
-- ========================================

-- Função para registrar atividades de chat
CREATE OR REPLACE FUNCTION log_chat_message_activity()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  -- Buscar habbo_name do sender
  SELECT habbo_name INTO sender_name
  FROM habbo_accounts
  WHERE supabase_user_id = NEW.sender_id
  LIMIT 1;

  -- Registrar atividade
  INSERT INTO user_activity_log (user_id, habbo_name, activity_type, target_type, target_id, metadata)
  VALUES (
    NEW.sender_id,
    COALESCE(sender_name, 'unknown'),
    'chat_message',
    'chat',
    NEW.receiver_id::text,
    jsonb_build_object(
      'message_id', NEW.id,
      'message_preview', left(NEW.message, 50),
      'receiver_id', NEW.receiver_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para chat_messages
CREATE TRIGGER chat_messages_activity_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION log_chat_message_activity();

-- Comentário
COMMENT ON FUNCTION log_chat_message_activity() IS 'Registra automaticamente atividades de mensagens de chat';
```

---

## 🧪 Testes Recomendados

### Testes de RLS

1. **Likes**:
   - ✅ Usuário só pode curtir próprias fotos? (Não, pode curtir qualquer foto)
   - ✅ Usuário só pode descurtir próprios likes? (Sim)
   - ✅ Todos podem ver likes? (Sim)

2. **Comentários**:
   - ✅ Usuário só pode editar/deletar próprios comentários? (Sim)
   - ✅ Todos podem ver comentários? (Sim)
   - ✅ Comentários preservam hotel do usuário? (Sim, com campo `hotel`)

3. **Chat**:
   - ⚠️ Usuário só vê mensagens enviadas/recebidas? (Precisa ser testado após correção)
   - ✅ Usuário só pode enviar como sender_id próprio? (Sim)
   - ✅ Usuário só pode atualizar próprias mensagens? (Precisa ser testado)

### Testes de Histórico

1. **Verificar `user_activity_log`**:
   - ✅ Likes aparecem no log? (Sim, via trigger)
   - ✅ Comentários aparecem no log? (Sim, via trigger)
   - ❌ Mensagens aparecem no log? (Não, falta trigger)

---

## 📊 Resumo de Status

| Funcionalidade | Tabela | RLS | Frontend | Histórico | Status |
|---------------|--------|-----|----------|-----------|--------|
| Likes | ✅ | ✅ | ✅ | ✅ | ✅ **OK** |
| Comentários | ✅ | ✅ | ✅ | ✅ | ✅ **OK** |
| Chat | ✅ | ⚠️ | ✅ | ❌ | ⚠️ **Precisa correção** |
| Bloqueios | ✅ | ✅ | ✅ | N/A | ✅ **OK** |
| Denúncias | ✅ | ✅ | ✅ | N/A | ✅ **OK** |

---

## 🎯 Próximos Passos

1. ✅ Criar migração para corrigir RLS do chat
2. ✅ Criar migração para trigger de chat messages
3. ⚠️ **Aplicar migrações no ambiente** (executar no Supabase)
4. ⚠️ Testar funcionalidades após aplicar migrações
5. ⚠️ Decidir sobre uso de Edge Function vs Supabase direto

### Migrações Criadas

✅ **20250120000007_fix_chat_rls_policies.sql**
- Corrige políticas RLS do chat para garantir privacidade
- Restaura verificação de sender_id/receiver_id usando auth.uid()
- Corrige políticas de user_blocks e message_reports

✅ **20250120000008_add_chat_message_activity_trigger.sql**
- Adiciona trigger para registrar mensagens de chat no user_activity_log
- Busca habbo_name automaticamente de habbo_accounts
- Registra metadata com preview da mensagem

---

**Última atualização**: 20/01/2025

