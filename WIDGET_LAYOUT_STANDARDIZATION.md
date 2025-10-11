# 📐 Padronização Completa de Layout dos Widgets

## 📅 Data: 10/10/2025

## ✅ Objetivo

Garantir que todos os widgets em todas as homes tenham **layout uniforme e consistente**.

---

## 📏 Dimensões Padronizadas

### **Widgets de Perfil** (Profile/Avatar/Usercard)
```
Tamanho: 400px × 200px
```

**Estrutura:**
```
┌─────────────────────────────────────────┐
│ 🇧🇷 Username                     [Avatar]│
│ "Motto com até duas linhas        96px  │
│  permitidas aqui"                 tall  │
│ 🟢 Online                               │
│ Membro desde: DD/MM/AAAA                │
└─────────────────────────────────────────┘
        400px × 200px
```

**Elementos:**
- ✅ Bandeira (36px × 24px)
- ✅ Nome (text-xl, truncate)
- ✅ Motto (2 linhas, line-clamp-2, leading-tight)
- ✅ Status online/offline (GIF 64px × 16px)
- ✅ Data de membro (text-[10px])
- ✅ Avatar (96px × 128px, lado direito)

**Espaçamento:**
- Padding: `24px` (p-6)
- Gap entre seções: `8px` (space-y-2)
- Gap entre textos: `8px` (gap-2)

---

### **Widget Guestbook**
```
Tamanho: 400px × 450px
```

**Estrutura:**
```
┌─────────────────────────────────────────┐
│ Guestbook (5)                        × │ ← Header (48px)
├─────────────────────────────────────────┤
│ 👤 SkyFalls        08/10 18:30         │
│ "Oi, legal sua home!"                  │
├─────────────────────────────────────────┤
│ 👤 Beebop          08/10 17:15         │  300px
│ "Show!"                                 │  scroll
├─────────────────────────────────────────┤
│ [scroll automático - até 15 msgs]      │
│                                         │
├─────────────────────────────────────────┤
│ Seu comentário:                         │
│ [_______________]  [Enviar]             │ ← Form (100px)
└─────────────────────────────────────────┘
        400px × 450px
```

**Elementos:**
- ✅ Header com contador (48px)
- ✅ Lista de mensagens (300px, scroll)
- ✅ Máximo 15 mensagens visíveis
- ✅ Avatar autor (24px × 24px, headonly)
- ✅ Nome do autor (clicável)
- ✅ Data/hora (DD/MM HH:MM)
- ✅ Formulário de novo comentário (100px)

---

### **Widget Rating**
```
Tamanho: 300px × 250px
```

**Estrutura:**
```
┌───────────────────────────────┐
│ AVALIAÇÕES                   │ ← Header
├───────────────────────────────┤
│           4.5                 │
│        ⭐⭐⭐⭐⭐            │
│      12 avaliações            │
├───────────────────────────────┤
│    Avaliar esta home:         │
│      ⭐⭐⭐⭐⭐             │
└───────────────────────────────┘
     300px × 250px
```

---

### **Widgets Futuros** (planejados)

```typescript
badges:  300px × 200px   // Grid de badges favoritos
friends: 300px × 300px   // Lista de amigos online
photos:  400px × 300px   // Galeria de fotos
groups:  350px × 250px   // Grupos que participa
rooms:   350px × 250px   // Quartos favoritos
```

---

## 🎨 Padronização de Elementos

### **1. Avatares**

| Contexto | Tamanho | Pose | Renderização |
|----------|---------|------|--------------|
| **Widget Profile** | 96px × 128px | direction=4, head=4 | pixelated |
| **Guestbook Entry** | 24px × 24px | headonly=1, direction=2 | pixelated |
| **Banner da Home** | Variável | direction=2, head=2 | pixelated |

### **2. Textos**

| Elemento | Font | Tamanho | Estilo |
|----------|------|---------|--------|
| **Nome** | volter | text-xl (20px) | bold, truncate |
| **Motto** | volter | text-sm (14px) | italic, line-clamp-2 |
| **Status** | volter | text-xs (12px) | medium |
| **Data** | volter | text-[10px] | normal |

### **3. Cores**

| Elemento | Cor | Uso |
|----------|-----|-----|
| **Nome** | `text-gray-900` | Destaque principal |
| **Motto** | `text-gray-600` | Texto secundário |
| **Status Online** | `text-green-600` | Positivo |
| **Status Offline** | `text-gray-500` | Neutro |
| **Data** | `text-gray-600` | Informação |

### **4. Espaçamentos**

| Elemento | Valor | Classe |
|----------|-------|--------|
| **Padding widget** | 24px | `p-6` |
| **Gap entre elementos** | 8px | `gap-2`, `space-y-2` |
| **Gap horizontal** | 16px | `gap-4` |
| **Margin bottom** | 4px | `mb-1` |

---

## 🔧 Código Padronizado

### **Profile Widget:**

```typescript
// Estrutura HTML limpa e padronizada
<div className="widget w_skin_defaultskin" style={{ width: '400px', height: '200px' }}>
  <div className="widget-body w-full h-full">
    <div className="widget-content flex items-center gap-4 p-6">
      
      {/* Lado Esquerdo - Informações */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Bandeira + Nome */}
        <div className="flex items-center gap-2">
          <img src={flagUrl} className="w-9 h-6" />
          <h3 className="text-xl font-bold truncate volter-font">
            {habboData.habbo_name}
          </h3>
        </div>
        
        {/* Motto (2 linhas) */}
        <p className="text-sm italic volter-font line-clamp-2 leading-tight">
          "{habboData.motto}"
        </p>
        
        {/* Status */}
        <img src={onlineGif} className="w-16 h-4" />
        
        {/* Data */}
        <p className="text-[10px] volter-font">
          Membro desde: {date}
        </p>
      </div>
      
      {/* Lado Direito - Avatar */}
      <div className="flex-shrink-0">
        <img src={avatarUrl} className="w-24 h-32" />
      </div>
      
    </div>
  </div>
</div>
```

### **Guestbook Widget:**

```typescript
<div className="widget w_skin_defaultskin" style={{ width: '400px', height: '450px' }}>
  {/* Header */}
  <div className="widget-corner">
    <div className="widget-headline px-3 py-2">
      <h3 className="volter-font font-bold text-sm">
        Guestbook ({count})
      </h3>
    </div>
  </div>
  
  {/* Corpo */}
  <div className="widget-body">
    {/* Lista (300px, scroll) */}
    <div style={{ height: '300px', overflowY: 'auto' }}>
      {entries.map(entry => (
        <div className="p-2 border-b">
          <img src={headAvatar} className="w-6 h-6" />
          <div>
            <a href={profileLink}>{authorName}</a>
            <span>{date}</span>
          </div>
          <p>{message}</p>
        </div>
      ))}
    </div>
    
    {/* Form (100px) */}
    <form style={{ height: '100px' }}>
      <textarea />
      <button>Enviar</button>
    </form>
  </div>
</div>
```

---

## 📊 Widgets no Banco de Dados

### **Antes da Padronização:**

| Tipo | Quantidade | Tamanhos | Status |
|------|------------|----------|--------|
| **profile** | 1 | 200×100 | ❌ Despadronizado |
| **avatar** | 4 | 300×150, 480×160, 520×180 | ❌ Variado |
| **guestbook** | 5 | 350×400, 420×380, 500×300 | ❌ Variado |
| **welcome** | 2 | Variado | ⚠️ Legado |
| **rating** | 5 | Variado | ⚠️ Legado |

### **Depois da Padronização:**

| Tipo | Quantidade | Tamanhos | Status |
|------|------------|----------|--------|
| **profile** | 1 | 400×200 | ✅ Padronizado |
| **avatar** | 4 | 400×200 | ✅ Padronizado |
| **guestbook** | 5 | 400×450 | ✅ Padronizado |
| **welcome** | 2 | - | ⚠️ Tipo antigo |
| **rating** | 5 | - | ⚠️ Tipo antigo |

---

## 🎯 Consistência Visual

### **Todos os Widgets Profile:**
- ✅ Mesma largura (400px)
- ✅ Mesma altura (200px)
- ✅ Avatar na mesma posição (direita)
- ✅ Textos no mesmo tamanho
- ✅ Espaçamento uniforme

### **Todos os Widgets Guestbook:**
- ✅ Mesma largura (400px)
- ✅ Mesma altura (450px)
- ✅ Lista com scroll em 300px
- ✅ Form no rodapé consistente

---

## 📝 Função getWidgetSize()

Agora centralizada e padronizada:

```typescript
const standardSizes = {
  profile: { width: '400px', height: '200px' },
  avatar: { width: '400px', height: '200px' },
  usercard: { width: '400px', height: '200px' },
  guestbook: { width: '400px', height: '450px' },
  rating: { width: '300px', height: '250px' },
  badges: { width: '300px', height: '200px' },
  friends: { width: '300px', height: '300px' }
};
```

**Vantagens:**
- ✅ Tamanhos centralizados em um só lugar
- ✅ Fácil ajustar todos de uma vez
- ✅ Novos tipos já têm tamanho definido
- ✅ Fallback para tamanhos customizados

---

## 🧪 Teste de Consistência

### **Verificar em 3 Homes:**

1. **Home habbohub:**
   ```
   /home/ptbr-habbohub
   ```
   - ✅ Profile widget: 400×200
   - ✅ Avatar alinhado à direita
   - ✅ Motto com 2 linhas

2. **Home SkyFalls:**
   ```
   /home/ptbr-SkyFalls
   ```
   - ✅ Profile widget: 400×200
   - ✅ Layout idêntico ao habbohub
   - ✅ Guestbook: 400×450

3. **Home Beebop:**
   ```
   /home/ptbr-Beebop
   ```
   - ✅ Profile widget: 400×200
   - ✅ Layout idêntico aos outros
   - ✅ Guestbook: 400×450

---

## ✅ Checklist de Padronização

### **Estrutura HTML:**
- [x] Div wrapper com classe `widget w_skin_defaultskin`
- [x] Widget body com `widget-body`
- [x] Widget content com classes consistentes
- [x] Dimensões definidas via style

### **Profile Widget:**
- [x] Largura: 400px (todos)
- [x] Altura: 200px (todos)
- [x] Avatar: 96px × 128px (todos)
- [x] Motto: 2 linhas máximo (todos)
- [x] Spacing: 8px entre elementos (todos)

### **Guestbook Widget:**
- [x] Largura: 400px (todos)
- [x] Altura: 450px (todos)
- [x] Lista: 300px scroll (todos)
- [x] Form: 100px fixo (todos)
- [x] Máximo 15 mensagens (todos)

### **Função getWidgetSize:**
- [x] Tamanhos padronizados por tipo
- [x] Fallback para widgets customizados
- [x] Centralizada em um só lugar

---

## 📊 Antes vs Depois

### **Profile Widgets:**

| Home | Antes | Depois | Avatar | Motto |
|------|-------|--------|--------|-------|
| **habbohub** | 200×100 | 400×200 | ✅ Direita | ✅ 2 linhas |
| **SkyFalls** | 480×160 | 400×200 | ✅ Direita | ✅ 2 linhas |
| **Beebop** | 300×150 | 400×200 | ✅ Direita | ✅ 2 linhas |

### **Guestbook Widgets:**

| Home | Antes | Depois | Lista | Form |
|------|-------|--------|-------|------|
| **habbohub** | 350×400 | 400×450 | ✅ 300px | ✅ 100px |
| **SkyFalls** | 420×380 | 400×450 | ✅ 300px | ✅ 100px |
| **Beebop** | 500×300 | 400×450 | ✅ 300px | ✅ 100px |

---

## 🎨 Guia de Design

### **Hierarquia Visual:**

1. **Nome** - Mais proeminente (text-xl, bold)
2. **Motto** - Secundário (text-sm, italic, 2 linhas)
3. **Status** - Informativo (GIF animado)
4. **Data** - Detalhe (text-[10px])
5. **Avatar** - Visual principal (direita, 96×128)

### **Alinhamento:**

```
┌─────────────────────────────────┐
│ 🇧🇷 Nome                  [🧍] │ ← Topo alinhado
│ "Motto linha 1                 │
│  Motto linha 2"                │
│ 🟢 Online                      │ ← Centro vertical
│ Membro desde: 2024             │
└─────────────────────────────────┘
         Avatar alinhado
         ao topo direito
```

### **Responsividade:**

| Elemento | Comportamento |
|----------|---------------|
| **Nome** | `truncate` (... se muito longo) |
| **Motto** | `line-clamp-2` (corta na 2ª linha) |
| **Avatar** | `flex-shrink-0` (nunca diminui) |
| **Container** | Largura fixa (não responsivo) |

---

## 🔧 Arquivos Modificados

### **1. HomeWidget.tsx**
```
✅ Profile widget: HTML reorganizado
✅ Guestbook widget: Dimensões fixas
✅ getWidgetSize(): Tamanhos padronizados
✅ Estrutura HTML limpa
✅ Espaçamentos consistentes
```

### **2. useHabboHome.tsx**
```
✅ Widget padrão: 400×200
✅ widgetDimensions: Mapa completo
✅ Criação de novos widgets já padronizados
```

---

## 🧪 Como Validar

### **Teste Visual:**

1. Abra 3 homes lado a lado:
   - `/home/ptbr-habbohub`
   - `/home/ptbr-SkyFalls`
   - `/home/ptbr-Beebop`

2. Compare os profile widgets:
   - ✅ Mesma largura?
   - ✅ Mesma altura?
   - ✅ Avatar na mesma posição?
   - ✅ Motto com mesmo espaçamento?

3. Compare os guestbooks:
   - ✅ Mesma largura?
   - ✅ Mesma altura?
   - ✅ Lista com scroll igual?

### **Teste de Criação:**

1. Entre em modo de edição
2. Adicione novo widget profile
3. ✅ Deve ter 400×200px automaticamente

---

## ⚠️ Widgets Legados

### **Tipos Antigos no Banco:**

- `welcome` (2 widgets) - Tipo descontinuado
- `rating` (5 widgets antigos) - Substituir por novo

**Ação Recomendada:**
- Manter por compatibilidade
- Mostrar mensagem: "Widget legado"
- Permitir remover
- Criar novos com tipos padronizados

---

## ✅ Status Final

### **Padronização Completa:**
- ✅ Profile: 400×200 (uniforme)
- ✅ Avatar: 96×128 (direita, sempre)
- ✅ Motto: 2 linhas (line-clamp-2)
- ✅ Guestbook: 400×450 (uniforme)
- ✅ Espaçamentos: Consistentes (8px, 16px, 24px)
- ✅ Cores: Padronizadas
- ✅ Fontes: Volter em todos

### **Funcionalidade:**
- ✅ Homes carregando
- ✅ Widgets visualmente consistentes
- ✅ Modo de edição funcional
- ✅ Arrastar e soltar preserva tamanhos

---

**🎨 Layout 100% Padronizado em Todas as Homes!**

Agora todos os widgets têm dimensões e posicionamentos uniformes, proporcionando uma experiência visual consistente independente da home visitada.

---

**Data**: 10/10/2025  
**Status**: ✅ Implementado  
**Visual**: 🎨 Uniforme em todas as homes  
**Desenvolvedor**: Claude + Matheus

