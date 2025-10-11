# 🏨 Padronização de Hotéis - HabboHub

## 📋 Problema Identificado

Há inconsistência entre como armazenamos hotéis no banco e como usamos nas APIs.

### ❌ Antes (Inconsistente):
```
Banco de dados: hotel = 'br'
Hook useHabboHome: Busca com 'com.br'
Resultado: ❌ Usuário não encontrado
```

### ✅ Agora (Padronizado):
```
Banco de dados: hotel = 'br'
Hook useHabboHome: Busca com 'br'
URLs de API: Converte 'br' → 'com.br' quando necessário
```

---

## 🎯 Regra de Ouro

### **Armazenamento no Banco:**
```typescript
// SEMPRE usar códigos curtos
hotel: 'br'  // ✅ Correto
hotel: 'com' // ✅ Correto  
hotel: 'es'  // ✅ Correto
hotel: 'fi'  // ✅ Correto

// NUNCA usar domínios completos
hotel: 'com.br' // ❌ Errado
hotel: 'com.tr' // ❌ Errado
```

### **Buscas no Banco:**
```typescript
// SEMPRE buscar com código curto
.eq('hotel', 'br')  // ✅ Correto
.eq('hotel', 'com') // ✅ Correto

// NUNCA buscar com domínio
.eq('hotel', 'com.br') // ❌ Errado
```

### **URLs de API:**
```typescript
// CONVERTER código para domínio quando necessário
const apiDomain = hotel === 'br' ? 'com.br' : hotel;
const url = `https://www.habbo.${apiDomain}/api/public/users?name=${username}`;

// Exemplos:
'br' → 'com.br' → https://www.habbo.com.br/api/public/users
'com' → 'com' → https://www.habbo.com/api/public/users
'es' → 'es' → https://www.habbo.es/api/public/users
'tr' → 'com.tr' → https://www.habbo.com.tr/api/public/users
```

---

## 📦 Mapeamento de Hotéis

| Código (Banco) | Domínio (API) | URL Completa |
|----------------|---------------|--------------|
| `br` | `com.br` | `habbo.com.br` |
| `com` | `com` | `habbo.com` |
| `es` | `es` | `habbo.es` |
| `fr` | `fr` | `habbo.fr` |
| `de` | `de` | `habbo.de` |
| `it` | `it` | `habbo.it` |
| `fi` | `fi` | `habbo.fi` |
| `nl` | `nl` | `habbo.nl` |
| `tr` | `com.tr` | `habbo.com.tr` |

---

## 🔧 Funções Auxiliares

### **Já existe em `src/utils/usernameUtils.ts`:**

```typescript
export const HOTEL_CONFIGS: Record<string, HotelConfig> = {
  'br': {
    code: 'br',
    name: 'Brasil/Portugal',
    domain: 'ptbr',        // Para URLs internas (/home/ptbr-username)
    apiUrl: 'https://www.habbo.com.br/api/public',
    flag: '/flags/flagbrazil.png'
  },
  'com': {
    code: 'com',
    name: 'UK e .com',
    domain: 'com',
    apiUrl: 'https://www.habbo.com/api/public',
    flag: '/flags/flagcom.png'
  },
  // ... outros hotéis
};

// Obter configuração do hotel
export function getHotelConfig(hotel: string): HotelConfig {
  return HOTEL_CONFIGS[hotel] || HOTEL_CONFIGS['br'];
}
```

### **Nova função auxiliar necessária:**

```typescript
// src/utils/hotelUtils.ts

/**
 * Converte código do hotel para domínio de API
 * @param hotelCode - Código curto do hotel (br, com, es, etc)
 * @returns Domínio para usar em URLs de API
 */
export function getHotelApiDomain(hotelCode: string): string {
  const domainMap: Record<string, string> = {
    'br': 'com.br',
    'com': 'com',
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'fi': 'fi',
    'nl': 'nl',
    'tr': 'com.tr'
  };
  
  return domainMap[hotelCode] || 'com';
}

/**
 * Constrói URL completa da API do Habbo
 * @param hotelCode - Código do hotel (br, com, etc)
 * @param path - Caminho da API (ex: 'users?name=habbohub')
 */
export function getHabboApiUrl(hotelCode: string, path: string): string {
  const domain = getHotelApiDomain(hotelCode);
  return `https://www.habbo.${domain}/api/public/${path}`;
}
```

---

## ✅ Correções Aplicadas

### 1. **`src/hooks/useHabboHome.tsx`**
```typescript
// ❌ ANTES:
const normalizedHotel = hotel === 'br' ? 'com.br' : hotel;
.eq('hotel', normalizedHotel)

// ✅ DEPOIS:
.eq('hotel', hotel)  // Usa código diretamente
```

### 2. **Verificação de Proprietário**
```typescript
// ✅ Usa código do hotel diretamente
const currentUserIsOwner = 
  habboAccount?.habbo_name === username &&
  habboAccount?.hotel === hotel;  // 'br' === 'br' ✅
```

### 3. **Update de Background**
```typescript
// ✅ Envia código do hotel para edge function
body: JSON.stringify({
  action: 'update_background',
  habbo_name: username,
  background: {
    type: bgType,
    value: bgValue,
    hotel: hotel  // 'br', não 'com.br'
  }
})
```

---

## 📊 Dados das Contas no Banco

```sql
SELECT habbo_name, hotel, habbo_id FROM habbo_accounts;

-- Resultado:
habbohub  | br | hhbr-81b7220d11b7a21997226bf7cfcbad51
SkyFalls  | br | hhbr-skyfalls1759962432513
Beebop    | br | hhbr-00e6988dddeb5a1838658c854d62fe49
```

**Todos usam `hotel = 'br'`** ✅

---

## 🎯 Checklist de Implementação

- [x] `useHabboHome.tsx` - Remover normalização
- [x] Buscar com `hotel = 'br'` direto
- [x] Verificação de proprietário sem normalização
- [x] Update de background sem normalização
- [ ] Criar `hotelUtils.ts` com funções auxiliares
- [ ] Atualizar outros hooks que usam APIs
- [ ] Documentar em outros arquivos .md

---

## 🧪 Como Testar

```bash
# 1. Verificar dados no banco
node check-and-unify-accounts.cjs

# Deve mostrar: hotel: br (não com.br)

# 2. Acessar home
/home/ptbr-habbohub

# Console deve mostrar:
# 🔍 Buscando usuário: { username: "habbohub", hotel: "br" }
# ✅ Usuário encontrado
```

---

## 📝 Resumo

| Contexto | Formato | Exemplo |
|----------|---------|---------|
| **Banco de Dados** | Código curto | `br` |
| **Busca no Banco** | Código curto | `.eq('hotel', 'br')` |
| **URLs Internas** | Domínio prefixo | `/home/ptbr-habbohub` |
| **URLs de API** | Domínio completo | `habbo.com.br` |
| **Comparações** | Código curto | `hotel === 'br'` |

---

**Data**: 10/10/2025  
**Status**: ✅ Implementado  
**Importante**: SEMPRE usar códigos curtos no banco e nas buscas!

