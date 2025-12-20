# Normalização de Dados e Comunicação

## 📋 Visão Geral

Este documento descreve a padronização da linguagem comum entre APIs, páginas e perfis do sistema HabboHub. As funções utilitárias garantem consistência na comunicação de dados.

## 🔧 Utilitários Criados

### 1. `photoNormalizer.ts`

Normaliza dados de fotos para o formato padrão `EnhancedPhoto`.

**Funções:**
- `normalizePhoto(photo: any): EnhancedPhoto` - Normaliza um objeto de foto
- `normalizePhotos(photos: any[]): EnhancedPhoto[]` - Normaliza um array de fotos
- `getPhotoId(photo: any): string` - Extrai photo_id de forma consistente
- `getPhotoUserName(photo: any): string` - Extrai userName de forma consistente

**Uso:**
```typescript
import { getPhotoId, normalizePhoto } from '@/utils/photoNormalizer';

const photoId = getPhotoId(photo); // Funciona com photo.photo_id, photo.id, etc.
const normalized = normalizePhoto(photoFromApi); // Converte para EnhancedPhoto
```

### 2. `userNormalizer.ts`

Normaliza dados de usuários para formato padrão.

**Funções:**
- `getUserName(user: any): string` - Extrai nome do usuário (prioridade: userName > habbo_name > name)
- `getUserHotel(user: any): string` - Extrai código do hotel
- `normalizeUser(user: any)` - Normaliza objeto de usuário completo

**Uso:**
```typescript
import { getUserName, getUserHotel } from '@/utils/userNormalizer';

const userName = getUserName(user); // Funciona com qualquer formato
const hotel = getUserHotel(user);
```

### 3. `avatarHelpers.ts`

Centraliza a geração de URLs de avatar com suporte multi-hotel.

**Funções:**
- `getAvatarUrl(userName?, hotel?, figureString?, options?)` - Gera URL completa do avatar
- `getAvatarHeadUrl(userName, hotel, figureString?, size?)` - Gera URL apenas da cabeça
- `getAvatarFallbackUrl(userName, size?)` - URL de fallback (S3)

**Uso:**
```typescript
import { getAvatarHeadUrl, getAvatarFallbackUrl } from '@/utils/avatarHelpers';

// Avatar apenas da cabeça
const avatarUrl = getAvatarHeadUrl('Beebop', 'br', undefined, 'm');

// Fallback em caso de erro
<img 
  src={getAvatarHeadUrl(userName, hotel)} 
  onError={(e) => e.target.src = getAvatarFallbackUrl(userName)}
/>
```

## 📊 Padronização de Campos

### Campos de Foto

| Campo Padrão | Variações Aceitas | Prioridade |
|-------------|-------------------|------------|
| `photo_id` | `photo_id`, `photoId`, `id` | `photo_id` > `id` |
| `userName` | `userName`, `habbo_name`, `user_name`, `user` | `userName` > `habbo_name` |
| `imageUrl` | `imageUrl`, `s3_url`, `preview_url`, `url` | `imageUrl` > `s3_url` |
| `roomName` | `roomName`, `room_name` | `roomName` > `room_name` |
| `roomId` | `roomId`, `room_id` | `roomId` > `room_id` |

### Campos de Usuário

| Campo Padrão | Variações Aceitas | Prioridade |
|-------------|-------------------|------------|
| `userName` | `userName`, `habbo_name`, `habboName`, `user_name`, `name`, `user` | `userName` > `habbo_name` > `name` |
| `hotel` | `hotel`, `hotelDomain`, `hotel_domain` | `hotel` > `hotelDomain` |
| `figureString` | `figureString`, `figure_string`, `figure` | `figureString` > `figure_string` |

## 🔄 Migração de Código

### Antes (Inconsistente)
```typescript
// Diferentes formas de acessar o mesmo dado
const photoId = photo.photo_id || photo.id;
const userName = photo.userName || photo.habbo_name;
const avatarUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${userName}&size=m`;
```

### Depois (Padronizado)
```typescript
import { getPhotoId } from '@/utils/photoNormalizer';
import { getAvatarHeadUrl } from '@/utils/avatarHelpers';

const photoId = getPhotoId(photo); // Sempre funciona
const avatarUrl = getAvatarHeadUrl(photo.userName, photo.hotel, undefined, 'm');
```

## ✅ Benefícios

1. **Consistência**: Todos os componentes usam a mesma lógica
2. **Manutenibilidade**: Mudanças centralizadas em um único lugar
3. **Robustez**: Suporta múltiplos formatos de entrada
4. **Type Safety**: TypeScript garante tipos corretos
5. **Reutilização**: Código DRY (Don't Repeat Yourself)

## 📝 Checklist de Aplicação

- [x] Criar `photoNormalizer.ts`
- [x] Criar `userNormalizer.ts`
- [x] Criar `avatarHelpers.ts`
- [x] Atualizar `EnhancedPhotoCard.tsx`
- [x] Atualizar `FriendsPhotoFeed.tsx`
- [ ] Atualizar outros componentes conforme necessário
- [ ] Documentar padrões de uso

## 🎯 Próximos Passos

1. Aplicar normalização em outros componentes do console
2. Padronizar APIs do backend para retornar formato unificado
3. Criar tipos TypeScript mais específicos para cada contexto
4. Adicionar testes unitários para funções de normalização

