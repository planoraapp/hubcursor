# 📘 Documentação do Console - HabboHub

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Console](#arquitetura-do-console)
3. [Fontes de Dados](#fontes-de-dados)
4. [Hooks Principais](#hooks-principais)
5. [Edge Functions](#edge-functions)
6. [APIs do Habbo](#apis-do-habbo)
7. [Componentes Principais](#componentes-principais)
8. [Fluxo de Dados](#fluxo-de-dados)
9. [Estrutura de Dados](#estrutura-de-dados)

---

## 🎯 Visão Geral

O Console do HabboHub é o componente central que permite aos usuários visualizar e interagir com:
- **Perfis individuais** (próprio e de outros usuários)
- **Feed de fotos dos amigos** (ordem cronológica)
- **Feed global de fotos** (todas as fotos do hotel)
- **Chat** (mensagens entre usuários)
- **Fotos individuais** (visualização detalhada)

---

## 🏗️ Arquitetura do Console

```
FunctionalConsole.tsx (Componente Principal)
├── AccountTab (Aba: Minhas Informações)
├── FeedTab (Aba: Friends/Photos - Feed de Fotos)
├── ChatInterface (Aba: Chat)
└── Modais
    ├── BadgesModal
    ├── FriendsModal
    ├── GroupsModal
    ├── RoomsModal
    ├── PhotoCommentsModal
    └── PhotoLikesModal
```

---

## 📡 Fontes de Dados

### 1. **Perfis de Usuários**

#### Hook: `useCompleteProfile`
**Arquivo:** `src/hooks/useCompleteProfile.tsx`

**Fontes:**
- **API Habbo:** `https://www.habbo.{domain}/api/public/users?name={username}`
- **API Habbo (por ID):** `https://www.habbo.{domain}/api/public/users/{uniqueId}`
- **Perfil Completo:** `https://www.habbo.{domain}/api/public/users/{uniqueId}/profile`
- **Badges:** `https://www.habbo.{domain}/api/public/users/{uniqueId}/badges`
- **Friends:** `https://www.habbo.{domain}/api/public/users/{uniqueId}/friends`
- **Groups:** `https://www.habbo.{domain}/api/public/users/{uniqueId}/groups`
- **Rooms:** `https://www.habbo.{domain}/api/public/users/{uniqueId}/rooms`

**Serviço:** `src/services/habboApiMultiHotel.ts`
- `getUserByName(username, preferredDomain?)` - Busca usuário por nome
- `getUserById(uniqueId)` - Busca usuário por uniqueId (tenta múltiplos formatos)

**Estratégia de Busca:**
1. Prioriza busca por `username` (mais confiável)
2. Fallback para `uniqueId` se username falhar
3. Tenta múltiplos hotéis se necessário

**Dados Retornados:**
```typescript
interface CompleteProfile {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  lastAccessTime: string;
  memberSince: string;
  profileVisible: boolean;
  stats: {
    level: number;
    levelPercent: number;
    experience: number;
    starGems: number;
    badgesCount: number;
    friendsCount: number;
    groupsCount: number;
    roomsCount: number;
    photosCount: number;
  };
  data: {
    badges: any[];
    friends: any[];
    groups: any[];
    rooms: any[];
    photos: any[];
    selectedBadges: any[];
  };
  hotelDomain?: string;
  hotelCode?: string;
}
```

---

### 2. **Fotos de Usuários**

#### Hook: `useUnifiedPhotoSystem`
**Arquivo:** `src/hooks/useUnifiedPhotoSystem.tsx`

**Fonte:**
- **Edge Function:** `habbo-photos-scraper`
- **Parâmetros:**
  - `username`: Nome do usuário
  - `hotel`: Código do hotel (br, com, es, etc.)
  - `uniqueId`: (opcional) UniqueId do usuário para otimização
  - `forceRefresh`: (opcional) Forçar atualização

**Edge Function:** `supabase/functions/habbo-photos-scraper/index.ts`

**Dados Retornados:**
```typescript
interface UnifiedPhoto {
  id: string;
  photo_id: string;
  imageUrl: string;
  date: string;
  likes: number;
  timestamp?: number;
  roomName?: string;
  source: 'api';
}
```

**Cache:** 5 minutos (configurável)

---

### 3. **Feed de Fotos dos Amigos**

#### Hook: `useFriendsPhotos`
**Arquivo:** `src/hooks/useFriendsPhotos.tsx`

**Fonte:**
- **Edge Function:** `habbo-optimized-friends-photos`
- **Parâmetros:**
  - `username`: Nome do usuário logado
  - `hotel`: Código do hotel (br, com, es, etc.)
  - `uniqueId`: (opcional) UniqueId do usuário logado
  - `limit`: Limite de fotos (padrão: 300)
  - `offset`: Offset para paginação

**Edge Function:** `supabase/functions/habbo-optimized-friends-photos/index.ts`

**Processo:**
1. Busca dados do usuário por `username` para obter `uniqueId`
2. Busca perfil completo (`/profile`) para obter lista de amigos
3. Filtra apenas amigos com `profileVisible !== false`
4. Processa todos os amigos em batches (10 por vez)
5. Para cada amigo:
   - Busca fotos via API: `https://www.habbo.{domain}/api/public/users/{friendUniqueId}/photos`
   - Adiciona metadados (nome, avatar, uniqueId)
6. Ordena todas as fotos por timestamp (mais recente primeiro)
7. Aplica paginação

**Dados Retornados:**
```typescript
interface FriendPhoto {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
  userName: string;
  userUniqueId?: string;
  userAvatar: string;
  timestamp?: number;
  caption?: string;
  roomName?: string;
  roomId?: string | number;
}
```

**Cache:** Refetch on mount habilitado

---

### 4. **Feed Global de Fotos**

#### Hook: `useGlobalPhotoFeed`
**Arquivo:** `src/hooks/useGlobalPhotoFeed.tsx`

**Fonte:**
- **Edge Function:** `habbo-global-feed`
- **Parâmetros:**
  - `cursor`: Offset de página (0 = hoje, 1 = ontem, etc.)
  - `limit`: Número de fotos por página (padrão: 20)
  - `hotel`: Código do hotel ou 'all' para todos

**Edge Function:** `supabase/functions/habbo-global-feed/index.ts`

**Dados Retornados:**
```typescript
interface GlobalPhotoFeedData {
  photos: EnhancedPhoto[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
  cursor: string;
}
```

**Cache:** 30 minutos

---

### 5. **Informações de Quartos**

#### Componente: `RoomDetailsModal`
**Arquivo:** `src/components/console/modals/RoomDetailsModal.tsx`

**Fonte:**
- **API Habbo:** `https://www.habbo.{domain}/api/public/rooms/{roomId}`

**Dados Retornados:**
```typescript
interface RoomData {
  id: number;
  name: string;
  description: string;
  ownerName: string;
  ownerUniqueId: string;
  tags: string[];
  maximumVisitors: number;
  visitors: number;
  // ... outros campos
}
```

**Nota:** Alguns quartos podem retornar 404 se não existirem mais.

---

### 6. **Interações (Likes e Comentários)**

#### Hook: `usePhotoLikes`
**Arquivo:** `src/hooks/usePhotoLikes.tsx`

**Fonte:**
- **Supabase Table:** `photo_likes`
- **Query:** `SELECT * FROM photo_likes WHERE photo_id = {photoId}`

#### Hook: `usePhotoComments`
**Arquivo:** `src/hooks/usePhotoComments.tsx`

**Fonte:**
- **Supabase Table:** `photo_comments`
- **Query:** `SELECT id, user_id, habbo_name, comment_text, created_at FROM photo_comments WHERE photo_id = {photoId} ORDER BY created_at ASC`

**Nota:** A coluna `hotel` não existe na tabela `photo_comments` (migração não aplicada).

---

### 7. **Chat**

#### Hook: `useChat`
**Arquivo:** `src/hooks/useChat.tsx`

**Fonte:**
- **Supabase Table:** `chat_messages`
- **Realtime:** Subscription via Supabase Realtime
- **Query:** `SELECT * FROM chat_messages WHERE (sender_id = {userId} OR receiver_id = {userId}) ORDER BY created_at DESC`

---

## 🎣 Hooks Principais

### `useCompleteProfile`
Busca perfil completo de um usuário (badges, friends, groups, rooms).

**Uso:**
```typescript
const { data: completeProfile, isLoading, error } = useCompleteProfile(
  username,
  hotel,
  uniqueId // opcional
);
```

### `useUnifiedPhotoSystem`
Busca fotos de um usuário específico.

**Uso:**
```typescript
const { photos, isLoading, refetch } = useUnifiedPhotoSystem(
  username,
  hotel,
  { uniqueId, forceRefresh }
);
```

### `useFriendsPhotos`
Busca feed cronológico de fotos dos amigos do usuário logado.

**Uso:**
```typescript
const { photos, isLoading } = useFriendsPhotos(
  currentUserName,
  hotel,
  uniqueId // opcional
);
```

### `useGlobalPhotoFeed`
Busca feed global de fotos do hotel.

**Uso:**
```typescript
const { photos, loadMore, hasMore } = useGlobalPhotoFeed({
  hotel: 'all', // ou 'br', 'com', etc.
  limit: 20
});
```

### `useProfileNavigation`
Gerencia navegação entre perfis (histórico, estados).

**Uso:**
```typescript
const {
  state: { viewingUser, viewingUserUniqueId },
  navigateToProfile,
  navigateBackFromPhotos,
  clearProfile
} = useProfileNavigation();
```

---

## ⚡ Edge Functions

### `habbo-photos-scraper`
**Localização:** `supabase/functions/habbo-photos-scraper/index.ts`

**Função:** Busca fotos de um usuário específico.

**Parâmetros:**
```typescript
{
  username: string;
  hotel: string; // 'br', 'com', etc.
  forceRefresh?: boolean;
  uniqueId?: string;
}
```

**Retorno:** Array de fotos no formato `UnifiedPhoto[]`

---

### `habbo-optimized-friends-photos`
**Localização:** `supabase/functions/habbo-optimized-friends-photos/index.ts`

**Função:** Busca feed cronológico de fotos dos amigos.

**Parâmetros:**
```typescript
{
  username: string;
  hotel: string;
  limit?: number; // padrão: 300
  offset?: number; // padrão: 0
}
```

**Processo:**
1. Busca usuário por username → obtém uniqueId
2. Busca perfil completo → obtém lista de amigos
3. Filtra amigos públicos
4. Processa em batches (10 por vez)
5. Busca fotos de cada amigo
6. Ordena por timestamp (mais recente primeiro)
7. Aplica paginação

**Retorno:**
```typescript
{
  photos: FriendPhoto[];
  hasMore: boolean;
  nextOffset: number;
}
```

---

### `habbo-global-feed`
**Localização:** `supabase/functions/habbo-global-feed/index.ts`

**Função:** Busca feed global de fotos do hotel.

**Parâmetros:**
```typescript
{
  cursor: string; // offset de página (0 = hoje, 1 = ontem, etc.)
  limit: number; // padrão: 20
  hotel: string; // 'all', 'br', 'com', etc.
}
```

**Retorno:**
```typescript
{
  photos: EnhancedPhoto[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

---

## 🌐 APIs do Habbo

### Endpoints Utilizados

#### 1. Buscar Usuário por Nome
```
GET https://www.habbo.{domain}/api/public/users?name={username}
```

**Domínios suportados:**
- `com.br` (Brasil/Portugal)
- `com` (Internacional/US)
- `es` (Espanha)
- `fr` (França)
- `de` (Alemanha)
- `it` (Itália)
- `nl` (Holanda)
- `fi` (Finlândia)
- `com.tr` (Turquia)

#### 2. Buscar Usuário por ID
```
GET https://www.habbo.{domain}/api/public/users/{uniqueId}
```

**Formatos aceitos:**
- `hhbr-{hash}` (formato completo)
- `{hash}` (apenas hash)
- `hhcom-{hash}`, `hhes-{hash}`, etc.

#### 3. Perfil Completo
```
GET https://www.habbo.{domain}/api/public/users/{uniqueId}/profile
```

**Retorna:** Dados completos do perfil incluindo friends, groups, rooms, etc.

#### 4. Badges
```
GET https://www.habbo.{domain}/api/public/users/{uniqueId}/badges
```

#### 5. Friends
```
GET https://www.habbo.{domain}/api/public/users/{uniqueId}/friends
```

**Filtro:** Apenas amigos com `profileVisible !== false` são processados.

#### 6. Groups
```
GET https://www.habbo.{domain}/api/public/users/{uniqueId}/groups
```

#### 7. Rooms
```
GET https://www.habbo.{domain}/api/public/users/{uniqueId}/rooms
```

#### 8. Photos
```
GET https://www.habbo.{domain}/api/public/users/{uniqueId}/photos
```

#### 9. Room Details
```
GET https://www.habbo.{domain}/api/public/rooms/{roomId}
```

**Nota:** Pode retornar 404 se o quarto não existir mais.

---

## 🧩 Componentes Principais

### `FunctionalConsole`
**Arquivo:** `src/components/console/FunctionalConsole.tsx`

**Responsabilidades:**
- Gerenciar estado global do console
- Renderizar abas (Account, Friends, Chat, Photos)
- Gerenciar modais
- Navegação entre perfis
- Integração com hooks de dados

**Tabs:**
- `account`: Perfil individual (próprio ou de outro usuário)
- `friends`: Feed de fotos dos amigos
- `chat`: Interface de chat
- `photos`: Feed global de fotos

### `FeedTab`
**Arquivo:** `src/components/console/FunctionalConsole.tsx` (componente interno)

**Responsabilidades:**
- Exibir feed de fotos (friends ou global)
- Campo de busca de usuários
- Filtro por país/hotel
- Integração com `FriendsPhotoFeed` ou `GlobalPhotoFeedColumn`

### `FriendsPhotoFeed`
**Arquivo:** `src/components/console/FriendsPhotoFeed.tsx`

**Responsabilidades:**
- Exibir feed cronológico de fotos dos amigos
- Usa `useFriendsPhotos` para buscar dados
- Renderiza `EnhancedPhotoCard` para cada foto

### `EnhancedPhotoCard`
**Arquivo:** `src/components/console/EnhancedPhotoCard.tsx`

**Responsabilidades:**
- Exibir foto individual no feed
- Mostrar likes e comentários
- Botão de informações do quarto
- Navegação para perfil do autor
- Navegação para visualização individual da foto

### `IndividualPhotoView`
**Arquivo:** `src/components/console/IndividualPhotoView.tsx`

**Responsabilidades:**
- Visualização detalhada de uma foto
- Exibir comentários completos
- Exibir likes completos
- Informações do quarto
- Navegação de volta

---

## 🔄 Fluxo de Dados

### 1. Carregamento do Perfil Individual

```
User clicks on profile
  ↓
FunctionalConsole.navigateToProfile()
  ↓
useProfileNavigation.navigateToProfile()
  ↓
useCompleteProfile(username, hotel, uniqueId)
  ↓
habboApiMultiHotel.getUserByName() ou getUserById()
  ↓
API Habbo: /api/public/users?name={username}
  ↓
API Habbo: /api/public/users/{uniqueId}/profile
  ↓
API Habbo: /api/public/users/{uniqueId}/badges
  ↓
API Habbo: /api/public/users/{uniqueId}/friends
  ↓
API Habbo: /api/public/users/{uniqueId}/groups
  ↓
API Habbo: /api/public/users/{uniqueId}/rooms
  ↓
CompleteProfile data returned
  ↓
FunctionalConsole renders AccountTab
```

### 2. Carregamento do Feed de Amigos

```
User opens Friends tab
  ↓
FunctionalConsole renders FeedTab
  ↓
FeedTab renders FriendsPhotoFeed
  ↓
FriendsPhotoFeed uses useFriendsPhotos()
  ↓
Supabase Function: habbo-optimized-friends-photos
  ↓
Edge Function:
  1. Busca usuário por username → uniqueId
  2. Busca perfil → lista de amigos
  3. Filtra amigos públicos
  4. Processa em batches (10 por vez)
  5. Para cada amigo: busca fotos
  6. Ordena por timestamp
  7. Aplica paginação
  ↓
FriendPhoto[] returned
  ↓
FriendsPhotoFeed renders EnhancedPhotoCard for each photo
```

### 3. Carregamento do Feed Global

```
User opens Photos tab
  ↓
FunctionalConsole renders FeedTab
  ↓
FeedTab renders GlobalPhotoFeedColumn
  ↓
GlobalPhotoFeedColumn uses useGlobalPhotoFeed()
  ↓
Supabase Function: habbo-global-feed
  ↓
Edge Function busca fotos globais do dia
  ↓
GlobalPhotoFeedData returned
  ↓
GlobalPhotoFeedColumn renders EnhancedPhotoCard for each photo
```

### 4. Interações (Like/Comentário)

```
User clicks like/comment button
  ↓
EnhancedPhotoCard calls usePhotoInteractions()
  ↓
usePhotoLikes.toggleLike() ou usePhotoComments.addComment()
  ↓
Supabase: INSERT/UPDATE/DELETE em photo_likes ou photo_comments
  ↓
React Query invalida cache
  ↓
UI atualiza automaticamente
```

---

## 📊 Estrutura de Dados

### CompleteProfile
```typescript
interface CompleteProfile {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  lastAccessTime: string;
  memberSince: string;
  profileVisible: boolean;
  stats: CompleteProfileStats;
  data: CompleteProfileData;
  hotelDomain?: string;
  hotelCode?: string;
}
```

### FriendPhoto
```typescript
interface FriendPhoto {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
  userName: string;
  userUniqueId?: string;
  userAvatar: string;
  timestamp?: number;
  caption?: string;
  roomName?: string;
  roomId?: string | number;
}
```

### EnhancedPhoto
```typescript
interface EnhancedPhoto {
  id: string;
  photo_id: string;
  imageUrl: string;
  date: string;
  likes: number;
  timestamp?: number;
  roomName?: string;
  userName?: string;
  userUniqueId?: string;
  hotel?: string;
  hotelDomain?: string;
  caption?: string;
  source: 'api' | 'cache';
}
```

---

## 🔧 Configurações e Cache

### Cache Times
- **useCompleteProfile:** 5 minutos
- **useUnifiedPhotoSystem:** 5 minutos (configurável)
- **useFriendsPhotos:** Refetch on mount
- **useGlobalPhotoFeed:** 30 minutos

### Retry Policies
- **useCompleteProfile:** 2 tentativas
- **useUnifiedPhotoSystem:** 2 tentativas
- **useFriendsPhotos:** 2 tentativas
- **useGlobalPhotoFeed:** 2 tentativas

---

## ⚠️ Notas Importantes

1. **UniqueId vs Username:**
   - Priorizar `username` para busca (mais confiável)
   - Usar `uniqueId` como fallback ou para otimização

2. **Perfis Privados:**
   - Apenas amigos com `profileVisible !== false` são processados
   - Perfis privados não aparecem no feed de amigos

3. **Quartos Inexistentes:**
   - Alguns quartos podem retornar 404 (quarto deletado)
   - Tratar graciosamente com fallback

4. **Coluna `hotel` em `photo_comments`:**
   - A coluna não existe na tabela (migração não aplicada)
   - Não usar `hotel` em queries de comentários

5. **Multi-Hotel Support:**
   - Sempre normalizar hotel codes: 'ptbr' → 'br', 'us' → 'com'
   - Tentar múltiplos hotéis se busca inicial falhar

---

## 📝 Changelog

### 2025-01-XX
- Adicionada documentação completa do console
- Documentadas todas as fontes de dados
- Documentados todos os hooks e Edge Functions
- Adicionado fluxo de dados detalhado

---

## 🔗 Referências

- [API Habbo Documentation](https://www.habbo.com/api/public)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [React Query Documentation](https://tanstack.com/query/latest)

