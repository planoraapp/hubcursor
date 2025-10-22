# 🌍 Sistema de Internacionalização (i18n)

## 📋 **Visão Geral**

O Habbo Hub agora possui um sistema completo de internacionalização que permite traduzir toda a interface em **3 idiomas**:
- 🇧🇷 **Português** (pt)
- 🇬🇧 **Inglês** (en)
- 🇪🇸 **Espanhol** (es)

## 🎯 **Características**

### ✨ **Funcionalidades Principais**

1. **Seleção Manual**: Usuário escolhe idioma no painel de configurações
2. **Detecção Automática**: Sistema detecta idioma baseado no hotel do usuário
3. **Persistência**: Preferência salva no localStorage (e futuramente no Supabase)
4. **Atualização em Tempo Real**: Todas as páginas atualizam instantaneamente
5. **Fallback Inteligente**: Se tradução não existir, mostra a chave original

### 🔄 **Fluxo de Funcionamento**

```
Usuário Acessa → Carrega Preferência → Se não existe → Detecta Hotel → Define Idioma → Salva
     ↓                                                                              ↓
Muda Idioma ← Clica em Português/Inglês/Espanhol ← Abre Configurações ← Usa Site
     ↓
Salva no localStorage + Supabase → Atualiza Todas as Páginas
```

## 🛠️ **Como Usar**

### 1. **Importar o Hook**

```typescript
import { useI18n } from '@/contexts/I18nContext';

const MyComponent = () => {
  const { t, language, setLanguage } = useI18n();
  
  return (
    <div>
      <h1>{t('pages.home.title')}</h1>
      <p>Idioma atual: {language}</p>
      <button onClick={() => setLanguage('pt')}>Português</button>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('es')}>Español</button>
    </div>
  );
};
```

### 2. **Usar Traduções**

```typescript
// Tradução simples
{t('nav.home')} // → "Início" (pt) | "Home" (en) | "Inicio" (es)

// Tradução com parâmetros
{t('time.minutesAgo', { minutes: 5 })} // → "5 minutos atrás"
```

### 3. **Adicionar Novas Traduções**

Edite `src/contexts/I18nContext.tsx`:

```typescript
const translations = {
  pt: {
    'minha.chave': 'Meu Texto em Português',
  },
  en: {
    'minha.chave': 'My Text in English',
  },
  es: {
    'minha.chave': 'Mi Texto en Español',
  }
};
```

## 📝 **Estrutura de Chaves**

### **Convenção de Nomenclatura**

```
categoria.subcategoria.elemento
```

### **Categorias Disponíveis**

| Categoria | Descrição | Exemplo |
|-----------|-----------|---------|
| `nav.*` | Navegação | `nav.home`, `nav.console` |
| `sidebar.*` | Sidebar | `sidebar.userPanel.logout` |
| `pages.*` | Páginas | `pages.home.title` |
| `buttons.*` | Botões | `buttons.save`, `buttons.cancel` |
| `messages.*` | Mensagens | `messages.loading`, `messages.error` |
| `forms.*` | Formulários | `forms.username`, `forms.password` |
| `validation.*` | Validações | `validation.required` |
| `status.*` | Status | `status.online`, `status.offline` |
| `time.*` | Tempo | `time.hoursAgo`, `time.daysAgo` |

## 🔍 **Traduções Disponíveis**

### **Navegação**
- `nav.home` → Início / Home / Inicio
- `nav.console` → Console / Console / Consola
- `nav.homes` → Homes / Homes / Homes
- `nav.journal` → Jornal / Journal / Periódico
- `nav.tools` → Ferramentas / Tools / Herramientas
- `nav.login` → Conectar Conta Habbo / Connect Habbo Account / Conectar Cuenta Habbo
- `nav.logout` → Sair / Logout / Cerrar Sesión
- `nav.admin` → Admin / Admin / Admin

### **Painel do Usuário**
- `sidebar.userPanel.monthlyXP` → XP Mensal / Monthly XP / XP Mensual
- `sidebar.userPanel.hubHome` → Hub Home / Hub Home / Hub Home
- `sidebar.userPanel.settings` → Configurações / Settings / Configuración
- `sidebar.userPanel.logout` → Sair / Logout / Salir
- `sidebar.userPanel.status` → Status no Site / Site Status / Estado del Sitio
- `sidebar.userPanel.notifications` → Notificações / Notifications / Notificaciones
- `sidebar.userPanel.language` → Idioma / Language / Idioma
- `sidebar.userPanel.online` → Online / Online / En Línea
- `sidebar.userPanel.offline` → Offline / Offline / Desconectado
- `sidebar.userPanel.portuguese` → Português / Portuguese / Portugués
- `sidebar.userPanel.english` → Inglês / English / Inglés
- `sidebar.userPanel.spanish` → Espanhol / Spanish / Español

### **Páginas - Home**
- `pages.home.title` → Bem-vindo ao Habbo Hub / Welcome to Habbo Hub / Bienvenido a Habbo Hub
- `pages.home.subtitle` → A plataforma definitiva... / The ultimate platform... / La plataforma definitiva...
- `pages.home.console.title` → Console Social / Social Console / Consola Social
- `pages.home.console.description` → Acesse o console... / Access the console... / Accede a la consola...
- `pages.home.console.button` → Acessar Console / Access Console / Acceder a Consola
- `pages.home.homes.title` → Habbo Homes / Habbo Homes / Habbo Homes
- `pages.home.homes.description` → Explore os homes... / Explore user homes... / Explora los homes...
- `pages.home.homes.button` → Ver Homes / View Homes / Ver Homes
- `pages.home.tools.title` → Ferramentas / Tools / Herramientas
- `pages.home.tools.description` → Acesse ferramentas... / Access exclusive tools... / Accede a herramientas...
- `pages.home.tools.button` → Ver Ferramentas / View Tools / Ver Herramientas

### **Botões**
- `buttons.save` → Salvar / Save / Guardar
- `buttons.cancel` → Cancelar / Cancel / Cancelar
- `buttons.edit` → Editar / Edit / Editar
- `buttons.delete` → Excluir / Delete / Eliminar
- `buttons.confirm` → Confirmar / Confirm / Confirmar
- `buttons.close` → Fechar / Close / Cerrar
- `buttons.back` → Voltar / Back / Volver
- `buttons.loading` → Carregando... / Loading... / Cargando...

### **Mensagens**
- `messages.loading` → Carregando... / Loading... / Cargando...
- `messages.error` → Erro ao carregar dados / Error loading data / Error al cargar datos
- `messages.success` → Operação realizada com sucesso / Operation completed successfully / Operación completada con éxito
- `messages.noData` → Nenhum dado encontrado / No data found / No se encontraron datos

## 🎨 **Onde Está Traduzido**

### ✅ **Componentes**
- [x] HabboUserPanel (Painel do usuário)
- [x] CollapsibleAppSidebar (Menu de navegação)
- [x] Home (Página inicial)

### 📋 **Próximos a Traduzir**
- [ ] Console
- [ ] Journal
- [ ] Tools
- [ ] Login
- [ ] Profile
- [ ] Admin Panel

## 🔧 **Configuração Técnica**

### **Arquivos Principais**

```
src/
├── contexts/
│   └── I18nContext.tsx          # Contexto de tradução
├── main.tsx                      # Provider integrado
├── components/
│   ├── HabboUserPanel.tsx       # ✅ Traduzido
│   └── CollapsibleAppSidebar.tsx # ✅ Traduzido
└── pages/
    └── Home.tsx                  # ✅ Traduzido
```

### **Provider Hierarchy**

```typescript
<QueryClientProvider>
  <AuthProvider>
    <I18nProvider>         // ← Sistema de tradução
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </I18nProvider>
  </AuthProvider>
</QueryClientProvider>
```

## 📊 **Detecção Automática de Idioma**

O sistema detecta automaticamente o idioma baseado no hotel do usuário:

| Hotel | Idioma |
|-------|--------|
| br | Português (pt) |
| com | Inglês (en) |
| es | Espanhol (es) |
| fr, de, it, nl, fi, tr | Inglês (en) - fallback |

## 💾 **Persistência**

### **Atual**
- ✅ localStorage: `habbo-hub-language`

### **Futuro**
- [ ] Supabase: Salvar no perfil do usuário
- [ ] Sincronizar entre dispositivos

## 🐛 **Troubleshooting**

### **Tradução não aparece**

1. **Verificar chave**: A chave existe no `translations` object?
2. **Verificar idioma**: O idioma atual é válido? (pt, en, es)
3. **Console**: Procurar por avisos "Translation missing for key: ..."

### **Idioma não muda**

1. **Limpar cache**: `localStorage.removeItem('habbo-hub-language')`
2. **Recarregar página**: F5 ou Ctrl+Shift+R
3. **Verificar console**: Procurar por erros

### **Idioma volta ao padrão**

1. **Verificar localStorage**: Abrir DevTools → Application → Local Storage
2. **Verificar valor salvo**: Deve ser 'pt', 'en' ou 'es'
3. **Re-selecionar idioma**: Abrir configurações e escolher novamente

## 📚 **Exemplos Práticos**

### **Exemplo 1: Botão Simples**

```typescript
<button>{t('buttons.save')}</button>
// Português: "Salvar"
// English: "Save"
// Español: "Guardar"
```

### **Exemplo 2: Título com Parâmetros**

```typescript
<h1>{t('messages.welcome', { name: 'João' })}</h1>
// Português: "Bem-vindo, João!"
// English: "Welcome, João!"
// Español: "¡Bienvenido, João!"
```

### **Exemplo 3: Menu de Navegação**

```typescript
const menuItems = [
  { nameKey: 'nav.home', path: '/' },
  { nameKey: 'nav.console', path: '/console' },
  { nameKey: 'nav.tools', path: '/tools' },
];

menuItems.map(item => (
  <Link to={item.path}>{t(item.nameKey)}</Link>
));
```

## 🚀 **Próximos Passos**

1. **Traduzir mais páginas**: Console, Journal, Tools, etc.
2. **Integrar com Supabase**: Salvar preferência no banco de dados
3. **Adicionar mais idiomas**: Francês, Alemão, etc.
4. **Melhorar detecção**: Usar navegador do usuário como fallback
5. **Adicionar testes**: Garantir que todas as traduções existem

## 📖 **Referências**

- [React Context API](https://react.dev/reference/react/createContext)
- [i18next (alternativa)](https://www.i18next.com/)
- [React i18n Best Practices](https://phrase.com/blog/posts/react-i18n-best-practices/)

---

**Última atualização**: 21/10/2025
**Versão**: 1.0.0
**Autor**: Habbo Hub Team
