# 📁 Estrutura de Assets - HabboHub

## 📅 Atualizado em: 10/10/2025

---

## 🗂️ Estrutura Principal

```
public/
├── assets/              # Assets principais do site
├── flags/               # Bandeiras dos hotéis
├── fonts/               # Fontes (Volter, Ubuntu Habbo)
├── handitems/           # Itens de mão do Habbo (16k+ arquivos)
├── images/              # Imagens gerais
└── favicon.png          # Ícone do site
```

---

## 📦 Detalhamento dos Diretórios

### 1. **`/public/assets/`** - Assets Principais

#### **🏠 Home Assets** (`/assets/home/`)
```
home/
├── starrating.png           ⭐ Estrela para sistema de avaliação
├── backgrounds/             🎨 Backgrounds para homes
│   ├── images/             (Fundos com imagens)
│   ├── patterns/           (Padrões repetidos)
│   └── solid-colors/       (Cores sólidas)
├── furniture/              🪑 Móveis decorativos
│   ├── chairs/
│   ├── decorations/
│   ├── plants/
│   └── tables/
├── stickers/               🎭 Adesivos para homes
│   ├── decorative/
│   ├── emoticons/
│   └── text/
└── widgets/                🔧 Widgets para homes
    ├── decorations/
    └── icons/
```

#### **🎮 Console Assets** (`/assets/console/`)
```
console/
├── consoleon1.gif          (Console animado - versão 1)
├── consoleon2.gif          (Console animado - versão 2)
├── consoleon3.gif          (Console animado - versão 3)
├── consoleoff.gif          (Console desligado)
└── animatedconsole.gif     (Animação alternativa)
```

#### **📰 Journal/News** (`/assets/journal/`)
```
journal/
└── [12 arquivos .gif]      (Notícias e anúncios animados)
```

#### **🐾 Pets** (`/assets/pets*/`)
```
pets/                       (Pet único)
pets-organized/             (27 arquivos - organizados)
pets-organized-32px/        (26 arquivos - 32px)
pets-organized-alt/         (31 arquivos - alternativo)
pets-organized-complete/    (27 arquivos - completo)
pets-sprites/               (8.954 arquivos! - sprites completos)
    ├── 8.275 .png
    ├── 674 .xml
    └── 5 .json
```

#### **🎨 Site Assets** (`/assets/site/`)
```
site/
└── [Imagens do site]
```

#### **☁️ Supabase** (`/assets/supabase/`)
```
supabase/
└── [13 arquivos .png]      (Assets relacionados ao Supabase)
```

#### **📋 Ícones e UI** (`/assets/`)
```
Principais:
├── bghabbohub.png          🖼️  Background principal do site
├── habbohub.gif            🎬  Logo animado
├── hub.gif                 🌟  Ícone hub
├── favicon.png             📌  Favicon
├── ferramentas.png         🔧  Ícone ferramentas
├── news.png                📰  Ícone notícias
├── home.png                🏠  Ícone home
├── emblemas.png            🏆  Ícone emblemas
├── eventos.png             🎉  Ícone eventos
├── editorvisuais.png       👔  Editor de visuais
├── wireds.png              ⚡  Wireds
├── deletetrash.gif         🗑️  Lixeira
├── credits_icon.gif        💎  Créditos
├── online_status.gif       🟢  Status online
├── promo_star.gif          ⭐  Estrela promocional
└── modelocard.gif          🎴  Modelo de card
```

#### **👕 Roupas e Acessórios**
```
Categorias:
├── Cabelo1.png             💇  Cabelos
├── Rosto1.png              😊  Rostos
├── Camiseta1.png           👕  Camisetas
├── Casaco1.png             🧥  Casacos
├── Calca1.png              👖  Calças
├── Tenis.png               👟  Tênis
├── Bone1.png               🧢  Bonés
├── Oculos1.png             🕶️  Óculos
├── Acessorios1.png         💍  Acessórios
├── Colar1.png              📿  Colares
├── Cinto1.png              🔗  Cintos
└── Estampa1.png            🎨  Estampas
```

---

### 2. **`/public/flags/`** - Bandeiras dos Hotéis

```
flags/
├── flagbrazil.png          🇧🇷  Brasil
├── flagcom.png             🌍  Internacional (.com)
├── flagspain.png           🇪🇸  Espanha
├── flagfrance.png          🇫🇷  França
├── flagdeus.png            🇩🇪  Alemanha
├── flagitaly.png           🇮🇹  Itália
├── flafinland.png          🇫🇮  Finlândia
├── flagnetl.png            🇳🇱  Holanda
└── flagtrky.png            🇹🇷  Turquia
```

---

### 3. **`/public/fonts/`** - Fontes

```
fonts/
├── volter/                 (Fonte principal)
│   ├── volter.ttf
│   ├── volter.woff2
│   └── volter.css
├── UbuntuHabbo.woff        (Fonte alternativa)
└── UbuntuHabbo.woff2
```

---

### 4. **`/public/handitems/`** - Itens de Mão (16k+ arquivos!)

```
handitems/
├── dcr/                    (28.640 arquivos!)
│   ├── 16.391 .png
│   └── 12.249 .swf
├── images/                 (16.513 arquivos!)
│   ├── 16.391 .png
│   ├── 120 .svg
│   ├── preview/           (Previews dos itens)
│   └── icons/             (Ícones)
├── gamedata/               (13 arquivos de dados)
│   ├── 6 .txt
│   ├── 5 .xml
│   └── 2 .json
├── gordon/                 (3 arquivos)
└── handitems.json          (Arquivo de configuração)
```

**Categorias de Handitems:**
- 🍺 Bebidas
- 🍔 Comidas
- 🎮 Games
- 📱 Eletrônicos
- 🎵 Música
- 🎨 Arte
- 🏆 Troféus
- 🎉 Festas
- E muito mais...

---

### 5. **`/public/images/`** - Imagens Gerais

```
images/
└── [36 arquivos]
    ├── 35 .png
    └── 1 .md (documentação)
```

---

## 📊 Estatísticas de Assets

| Categoria | Total de Arquivos |
|-----------|-------------------|
| **Handitems (DCR)** | 28.640 arquivos |
| **Handitems (Images)** | 16.513 arquivos |
| **Pets Sprites** | 8.954 arquivos |
| **Assets Principais** | ~200 arquivos |
| **Flags** | 9 arquivos |
| **Fonts** | 11 arquivos |
| **TOTAL** | **~54.327 arquivos** |

---

## 🎯 Assets Mais Importantes

### **Para o Sistema de Homes:**
1. ✅ `/assets/home/starrating.png` - Estrela de avaliação
2. ✅ `/assets/home/backgrounds/*` - Fundos para homes
3. ✅ `/assets/home/stickers/*` - Adesivos decorativos
4. ✅ `/assets/home/widgets/*` - Widgets
5. ✅ `/assets/home/furniture/*` - Móveis decorativos

### **Para a Interface:**
1. ✅ `/assets/bghabbohub.png` - Background principal
2. ✅ `/assets/habbohub.gif` - Logo animado
3. ✅ `/assets/console/consoleon*.gif` - Animações console
4. ✅ `/flags/*` - Bandeiras dos hotéis
5. ✅ `/fonts/volter/*` - Fonte Volter

### **Para o Editor:**
1. ✅ `/assets/Cabelo1.png` - Cabelos
2. ✅ `/assets/Rosto1.png` - Rostos
3. ✅ `/assets/Camiseta1.png` - Roupas
4. ✅ `/handitems/images/preview/*` - Previews de itens
5. ✅ `/handitems/gamedata/*` - Dados dos itens

---

## 🔍 Como Acessar

### **Via URL:**
```
https://seu-site.com/assets/home/starrating.png
https://seu-site.com/flags/flagbrazil.png
https://seu-site.com/handitems/images/preview/item.png
```

### **No código:**
```typescript
// Assets públicos
<img src="/assets/home/starrating.png" />
<img src="/flags/flagbrazil.png" />
<img src="/handitems/images/preview/item.png" />
```

---

## 📝 Notas Importantes

1. **Handitems**: Maior volume de assets (45k+ arquivos)
2. **Pets**: 8.954 sprites de pets organizados
3. **Pixel Art**: Usar `imageRendering: 'pixelated'` para todos os assets do Habbo
4. **Otimização**: Assets estão organizados por categoria
5. **Backup**: Todos os assets estão versionados no Git

---

## 🚀 Próximos Assets a Adicionar

- [ ] Mais backgrounds para homes
- [ ] Mais stickers decorativos
- [ ] Ícones de badges
- [ ] Animações de eventos
- [ ] Temas de cores
- [ ] Widgets personalizados

---

**📦 Total de Assets: ~54.327 arquivos organizados!**

---

**Data**: 10/10/2025  
**Status**: ✅ Documentado  
**Desenvolvedor**: Claude + Matheus

