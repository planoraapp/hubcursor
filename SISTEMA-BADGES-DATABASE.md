# 🏆 Sistema de Badges com Banco de Dados

Sistema completo para gerenciar emblemas do Habbo Hotel com banco de dados Supabase, verificação diária automática e interface moderna.

## 🚀 Funcionalidades

- **Banco de Dados**: Armazenamento completo de badges com categorias e países
- **Verificação Diária**: Sistema automático para detectar novos badges
- **Interface Moderna**: Modal responsivo com filtros e busca
- **Tooltips Informativos**: Exibição detalhada de cada badge
- **Logs e Relatórios**: Acompanhamento de atualizações
- **Performance**: Consultas otimizadas e paginação

## 📊 Estrutura do Banco

### Tabelas Principais

```sql
-- Tabela principal de badges
badges (
  id, code, name, description, hotel, image_url,
  created_at, updated_at, is_active
)

-- Categorias (many-to-many)
badge_categories (
  id, badge_id, category, created_at
)

-- Países (many-to-many)
badge_countries (
  id, badge_id, country, created_at
)
```

### Índices Otimizados
- `idx_badges_code` - Busca por código
- `idx_badges_hotel` - Filtro por hotel
- `idx_badges_created_at` - Ordenação por data
- `idx_badge_categories_category` - Filtro por categoria
- `idx_badge_countries_country` - Filtro por país

## 🛠️ Instalação

### 1. Instalar Dependências
```bash
npm run badge:install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar .env com suas credenciais do Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 3. Executar Migração
```bash
# No Supabase Dashboard, execute o arquivo:
supabase/migrations/20250121000001_create_badges_tables.sql
```

### 4. Popular Banco de Dados
```bash
npm run badge:populate
```

### 5. Configurar Monitoramento Diário
```bash
npm run badge:setup
```

## 📱 Uso

### Interface Principal
- **Modal de Badges**: Acesse via `/ferramentas`
- **Filtros**: Por país, categoria e busca textual
- **Scroll Infinito**: Carregamento automático
- **Tooltips**: Hover para detalhes completos

### Scripts Disponíveis

```bash
# Verificar novos badges manualmente
npm run badge:check

# Popular banco (primeira vez)
npm run badge:populate

# Configurar monitoramento automático
npm run badge:setup
```

## 🔄 Sistema de Verificação Diária

### Funcionamento
1. **Execução**: Diariamente às 09:00 (configurável)
2. **Fonte**: API HabboAssets (`https://www.habboassets.com/api/v1/badges`)
3. **Comparação**: Por data de criação/atualização
4. **Ações**: Inserir novos, atualizar existentes
5. **Logs**: Registro completo de operações

### Arquivos de Log
- `logs/badge-updates.log` - Log detalhado
- `logs/daily-report.json` - Relatório diário
- `logs/badge-monitor-config.json` - Configurações

### Relatório Diário
```json
{
  "timestamp": "2025-01-21T09:00:00.000Z",
  "newBadges": 5,
  "updatedBadges": 12,
  "totalApi": 25373,
  "totalDb": 25378,
  "newBadgeCodes": ["NEW01", "NEW02", ...],
  "updatedBadgeCodes": ["UPD01", "UPD02", ...]
}
```

## 🎯 API do Sistema

### Funções Principais

```typescript
// Buscar badges com filtros
getBadges(filters: BadgeFilters): Promise<Badge[]>

// Buscar badge específico
getBadgeByCode(code: string): Promise<Badge | null>

// Estatísticas
getBadgeStats(): Promise<BadgeStats>

// Listas disponíveis
getAvailableCategories(): Promise<string[]>
getAvailableCountries(): Promise<string[]>
getAvailableHotels(): Promise<string[]>
```

### Filtros Suportados
```typescript
interface BadgeFilters {
  search?: string;        // Busca textual
  country?: string;       // Filtro por país
  category?: string;      // Filtro por categoria
  hotel?: string;         // Filtro por hotel
  limit?: number;         // Paginação
  offset?: number;        // Paginação
}
```

## 📈 Performance

### Otimizações
- **Índices**: Consultas otimizadas
- **Paginação**: Carregamento em lotes
- **Cache**: Dados em memória
- **Lazy Loading**: Imagens sob demanda

### Métricas Esperadas
- **Tamanho Total**: ~30 MB
- **Tempo de Consulta**: <100ms
- **Badges por Página**: 50
- **Verificação Diária**: ~2-3 minutos

## 🔧 Manutenção

### Verificação Manual
```bash
# Testar sistema
node scripts/test-badge-monitoring.cjs

# Verificar logs
Get-Content logs/badge-updates.log -Tail 20

# Verificar relatório
Get-Content logs/daily-report.json | ConvertFrom-Json
```

### Troubleshooting

#### Erro de Conexão
- Verificar variáveis de ambiente
- Confirmar credenciais do Supabase
- Testar conectividade

#### Badges Não Aparecem
- Verificar se banco foi populado
- Confirmar migração executada
- Verificar logs de erro

#### Verificação Diária Não Funciona
- Verificar tarefa agendada
- Confirmar permissões
- Testar script manualmente

## 🎨 Personalização

### Categorias Personalizadas
Edite `scripts/populate-badges-database.cjs`:
```javascript
const getSpecialCategory = (code, description) => {
  // Sua lógica personalizada
  if (code.includes('CUSTOM')) return 'Minha Categoria';
  // ...
};
```

### Filtros Adicionais
Adicione em `src/lib/supabase-badges.ts`:
```typescript
// Novo filtro
if (filters.customFilter) {
  query = query.eq('custom_field', filters.customFilter);
}
```

## 📚 Estrutura de Arquivos

```
scripts/
├── populate-badges-database.cjs    # Popular banco
├── daily-badge-checker.cjs         # Verificação diária
├── install-badge-dependencies.cjs  # Instalação
└── setup-daily-badge-monitoring.ps1 # Configuração

src/
├── lib/supabase-badges.ts          # API do banco
├── components/tools/
│   ├── BadgeModal.tsx              # Modal principal
│   ├── BadgeTooltip.tsx            # Tooltip
│   └── SimpleBadgeImage.tsx        # Imagem

supabase/
└── migrations/
    └── 20250121000001_create_badges_tables.sql

logs/
├── badge-updates.log               # Log detalhado
├── daily-report.json               # Relatório diário
└── badge-monitor-config.json       # Configurações
```

## 🎉 Conclusão

Sistema completo e robusto para gerenciar emblemas do Habbo Hotel com:
- ✅ Banco de dados otimizado
- ✅ Verificação automática diária
- ✅ Interface moderna e responsiva
- ✅ Logs e relatórios detalhados
- ✅ Fácil manutenção e personalização

**Tamanho total**: ~30 MB (muito gerenciável!)
**Performance**: Consultas <100ms
**Atualização**: Automática diária
**Escalabilidade**: Suporta crescimento futuro
