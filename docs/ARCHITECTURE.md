# Arquitetura do Sistema HabboHub Console

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
3. [Sistema de Interações](#sistema-de-interações)
4. [Rate Limiting](#rate-limiting)
5. [Estatísticas e Analytics](#estatísticas-e-analytics)
6. [Edge Functions](#edge-functions)
7. [Hooks e Estado](#hooks-e-estado)
8. [Performance e Otimizações](#performance-e-otimizações)

---

## Visão Geral

O HabboHub Console é um sistema social para jogadores do Habbo Hotel, permitindo interações entre usuários através de:
- **Likes em fotos**
- **Comentários em fotos**
- **Chat privado**
- **Seguimento de perfis**
- **Histórico de atividades**

### Stack Tecnológica
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **State Management**: React Query + Context API
- **UI**: Tailwind CSS + Radix UI

---

## Estrutura do Banco de Dados

### Tabelas Principais

#### `photo_likes`
Armazena os likes dados pelos usuários nas fotos.

```sql
CREATE TABLE photo_likes (
  id UUID PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT photo_likes_user_photo_unique UNIQUE (photo_id, user_id)
);
```

**Características**:
- Constraint `UNIQUE (photo_id, user_id)` previne likes duplicados
- Índices em `photo_id`, `user_id`, `created_at`, e composto `(photo_id, user_id)`
- RLS habilitado para segurança

#### `photo_comments`
Armazena comentários nas fotos.

```sql
CREATE TABLE photo_comments (
  id UUID PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  comment_text TEXT NOT NULL CHECK (length(comment_text) >= 1 AND length(comment_text) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Características**:
- Validação de comprimento (1-500 caracteres)
- Índices para performance
- Triggers para atualizar `updated_at` automaticamente

#### `user_activity_log`
Registra todas as atividades dos usuários para análise e histórico.

```sql
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'photo_like', 'photo_unlike', 'photo_comment', 'photo_comment_delete',
    'chat_message', 'profile_view', 'profile_follow', 'profile_unfollow'
  )),
  target_type TEXT,
  target_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Uso**:
- Análise de comportamento
- Histórico de atividades do usuário
- Métricas de engajamento
- Detecção de padrões suspeitos

---

## Sistema de Interações

### Fluxo de Like

1. **Frontend**: Usuário clica no botão de like
2. **Hook**: `usePhotoLikes` verifica se já curtiu (cache local)
3. **Mutation**: Chama `toggleLike()`
4. **Supabase**: Insere/deleta na tabela `photo_likes`
5. **Trigger**: `log_photo_like_activity()` registra em `user_activity_log`
6. **Cache**: React Query invalida e refaz query

### Fluxo de Comentário

1. **Frontend**: Usuário digita e envia comentário
2. **Validação Client-side**: 
   - Rate limiting local (`useCommentRateLimit`)
   - Validação de tamanho (`validateComment`)
   - Sanitização (`sanitizeComment`)
3. **Hook**: `usePhotoComments.addComment()`
4. **Supabase**: Insere na tabela `photo_comments`
5. **Trigger**: `log_photo_comment_activity()` registra atividade
6. **Cache**: React Query invalida queries relacionadas

---

## Rate Limiting

### Camadas de Rate Limiting

#### 1. Client-side (Frontend)
- **Localização**: `useCommentRateLimit` hook
- **Função**: Previne spam imediato, melhora UX
- **Limites**:
  - 1 comentário por foto a cada 30 segundos
  - 3 comentários por foto em 10 minutos → bloqueio de 1 hora
  - 3+ fotos bloqueadas → bloqueio global de 6 horas
- **Armazenamento**: `localStorage` (pode ser burlado)

#### 2. Server-side (Edge Function)
- **Localização**: `supabase/functions/photo-interactions`
- **Função**: Validação real, impossível de burlar
- **Limites**:
  - **Likes**: 1 like por foto a cada 10 segundos
  - **Comentários**: 
    - 3 comentários por foto a cada 10 minutos
    - 30 segundos entre comentários na mesma foto
    - 20 comentários totais por minuto

### Implementação

```typescript
// Edge Function valida antes de inserir
const rateLimitCheck = await checkCommentRateLimit(supabase, userId, photoId);
if (!rateLimitCheck.canProceed) {
  return Response({ error: rateLimitCheck.error }, { status: 429 });
}
```

**Nota**: Client-side e server-side trabalham em conjunto:
- Client-side: feedback imediato, melhor UX
- Server-side: segurança real, impossível de burlar

---

## Estatísticas e Analytics

### Materialized View: `admin_stats`

View materializada que agrega todas as estatísticas do sistema.

```sql
CREATE MATERIALIZED VIEW admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM habbo_accounts) as total_users,
  (SELECT COUNT(*) FROM photo_likes) as total_photo_likes,
  -- ... outras estatísticas
  NOW() as last_updated;
```

**Vantagens**:
- **Performance**: Uma única query em vez de múltiplas
- **Cache**: Dados pré-calculados
- **Escalabilidade**: Não sobrecarrega o banco

**Atualização**:
- Manual: `REFRESH MATERIALIZED VIEW admin_stats;`
- Automática: Via cron job (recomendado a cada 5 minutos)

### AdminDashboard

O `AdminDashboard` tenta buscar da materialized view primeiro:

```typescript
const { data } = await supabase.from('admin_stats').select('*').single();
```

**Fallback**: Se a view não existir, usa queries individuais.

---

## Edge Functions

### `photo-interactions`

**Endpoint**: `/functions/v1/photo-interactions`

**Ações**:
- `like`: Curtir uma foto
- `unlike`: Descurtir uma foto
- `comment`: Comentar em uma foto

**Features**:
- ✅ Autenticação via JWT
- ✅ Rate limiting server-side
- ✅ Validação de dados
- ✅ Tratamento de erros
- ✅ CORS configurado

**Exemplo de uso**:
```typescript
const response = await supabase.functions.invoke('photo-interactions', {
  body: {
    action: 'like',
    photoId: 'photo-123',
    habboName: 'Beebop'
  }
});
```

---

## Hooks e Estado

### `usePhotoLikes`
Gerencia likes de uma foto específica.

**Retorna**:
- `likes`: Array de likes
- `likesCount`: Número total de likes
- `userLiked`: Se o usuário atual curtiu
- `toggleLike()`: Função para curtir/descurtir
- `isToggling`: Estado de loading

**Cache**: React Query cacheia por `photoId`

### `usePhotoComments`
Gerencia comentários de uma foto específica.

**Retorna**:
- `comments`: Array de comentários
- `commentsCount`: Número total
- `addComment()`: Adicionar comentário
- `deleteComment()`: Deletar comentário
- `isAddingComment`: Estado de loading

### `useCommentRateLimit`
Rate limiting client-side.

**Features**:
- Persistência em `localStorage`
- Múltiplas camadas de proteção
- Detecção de spam

---

## Performance e Otimizações

### Índices de Banco de Dados

#### `photo_likes`
- `photo_id` (buscar likes de uma foto)
- `user_id` (buscar likes de um usuário)
- `created_at DESC` (ordenação)
- `(photo_id, user_id)` composto (verificar se curtiu)

#### `photo_comments`
- `photo_id` (buscar comentários de uma foto)
- `user_id` (buscar comentários de um usuário)
- `created_at` (ordenação)
- `(photo_id, user_id)` composto
- `(photo_id, created_at)` composto (queries ordenadas)

#### `user_activity_log`
- `user_id` (histórico do usuário)
- `activity_type` (filtrar por tipo)
- `(target_type, target_id)` (buscar atividades de um recurso)
- `(user_id, activity_type, created_at DESC)` (histórico ordenado)

### React Query

**Stale Time**: Dados ficam "frescos" por 30 segundos (evita queries desnecessárias)

**Cache Time**: Dados ficam em cache por 5 minutos (evita refetch em navegação rápida)

**Invalidation**: Queries são invalidadas após mutations

### Paginação

Comentários e likes são carregados completos (não paginados) por enquanto. Para escalar:

1. Implementar paginação com `limit` e `offset`
2. Usar cursor-based pagination para melhor performance
3. Virtual scrolling no frontend para grandes listas

---

## Próximos Passos

### Melhorias Sugeridas

1. **Real-time**: Usar Supabase Realtime para atualizações instantâneas
2. **Notificações**: Sistema de notificações quando alguém curte/comenta
3. **Moderação**: Sistema de denúncias e moderação de conteúdo
4. **Analytics**: Dashboard mais avançado com gráficos e tendências
5. **Cache Redis**: Para rate limiting distribuído (se necessário)
6. **CDN**: Para assets estáticos (fotos, avatares)

---

## Documentação Adicional

- [Migrations](./migrations/): Histórico de mudanças no banco
- [Edge Functions](./functions/): Documentação das funções serverless
- [Hooks](./hooks/): Documentação dos hooks React

