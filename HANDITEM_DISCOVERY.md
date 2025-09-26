# Sistema de Descoberta de Handitems do Habbo

Este sistema implementa a descoberta automática de handitems e mobílias do Habbo Hotel baseado no tutorial oficial da ViaJovem.

## 🚀 Funcionalidades

### 1. Descoberta Automática de Handitems
- **Busca em servidores oficiais**: Acessa `external_flash_texts` e `external_variables` do Habbo
- **Extração de dados**: Obtém informações de handitems diretamente dos arquivos XML
- **Verificação de existência**: Confirma se as imagens dos handitems existem
- **Categorização automática**: Separa handitems em "UseItem" (para beber) e "CarryItem" (para carregar)

### 2. Catálogo Unificado
- **Interface moderna**: Visualização organizada de handitems e mobílias
- **Filtros avançados**: Busca por nome, tipo e categoria
- **Estatísticas em tempo real**: Contadores e gráficos de descoberta
- **Integração completa**: Funciona com o sistema existente de handitems

### 3. Descoberta de Build Atual
- **Detecção automática**: Encontra a build atual do Habbo automaticamente
- **URLs dinâmicas**: Gera URLs corretas para imagens e recursos
- **Atualização em tempo real**: Sempre usa a versão mais recente

## 📁 Estrutura de Arquivos

```
src/
├── services/
│   └── habboApiService.ts          # Serviço principal para buscar dados
├── utils/
│   └── habboDataExtractor.ts       # Extrator de dados dos servidores
├── components/tools/
│   ├── UnifiedCatalog.tsx          # Catálogo unificado
│   ├── DiscoveryStats.tsx          # Estatísticas de descoberta
│   └── HanditemTool.tsx           # Ferramenta principal (atualizada)
```

## 🔧 Como Usar

### 1. Acessar o Catálogo Unificado
1. Vá para `/ferramentas/handitems`
2. Clique na aba "Catálogo Unificado"
3. Use o botão "Extrair do Servidor" para buscar dados atualizados

### 2. Explorar Handitems
- **Filtros**: Use as categorias "Para Beber" e "Para Carregar"
- **Busca**: Digite o nome ou ID do handitem
- **Seleção**: Clique em um handitem para mais detalhes

### 3. Ver Estatísticas
- **Total de handitems**: Quantidade descoberta
- **Distribuição por tipo**: Gráficos de UseItem vs CarryItem
- **Status da build**: Informações da versão atual do Habbo

## 🛠️ Implementação Técnica

### Serviços Principais

#### `habboApiService.ts`
```typescript
// Buscar build atual
const buildInfo = await habboApiService.getCurrentBuild();

// Buscar handitems dos textos
const handitems = await habboApiService.getHanditemsFromTexts();

// Buscar definições de ações
const actions = await habboApiService.getHanditemActions(buildInfo);
```

#### `habboDataExtractor.ts`
```typescript
// Extrair todos os dados de uma vez
const data = await habboDataExtractor.extractAllData();

// Gerar relatório
const report = habboDataExtractor.generateDiscoveryReport(data);
```

### Componentes

#### `UnifiedCatalog.tsx`
- Interface principal do catálogo
- Integração com serviços de descoberta
- Filtros e busca em tempo real

#### `DiscoveryStats.tsx`
- Estatísticas visuais
- Indicadores de progresso
- Status da build

## 📊 Dados Descobertos

### Handitems
- **ID**: Identificador único
- **Nome**: Nome traduzido do handitem
- **Tipo**: UseItem (para beber) ou CarryItem (para carregar)
- **Asset Prefix**: drk (UseItem) ou crr (CarryItem)
- **Estado**: usei (usar) ou cri (carregar)

### Mobílias
- **ID**: Identificador da mobília
- **Nome**: Nome da mobília
- **Handitems associados**: Lista de IDs de handitems
- **URLs de imagem**: Links para imagens da mobília

## 🔍 Processo de Descoberta

1. **Descoberta da Build**
   - Acessa `external_variables`
   - Extrai `flash.client.url`
   - Identifica build atual

2. **Extração de Handitems**
   - Busca em `external_flash_texts`
   - Extrai definições de `HabboAvatarActions.xml`
   - Verifica existência de imagens

3. **Validação**
   - Confirma URLs de imagem
   - Filtra handitems existentes
   - Gera relatório de descoberta

## 🎯 Baseado no Tutorial Oficial

Este sistema implementa exatamente o processo descrito no tutorial da ViaJovem:

> **Tutorial Original**: [Vida de Jornalete - Descobrindo Novos Handitems](https://viajovem.blogspot.com/2018/01/vida-de-jornalete-descobrindo-novos.html)

### Passos Implementados:
1. ✅ Acesso ao `external_flash_texts` para nomes
2. ✅ Descoberta da build atual via `external_variables`
3. ✅ Extração de `HabboAvatarActions.xml` para definições
4. ✅ Identificação de UseItem (drk) e CarryItem (crr)
5. ✅ Verificação de existência de imagens
6. ✅ Geração de relatórios de descoberta

## 🚀 Próximos Passos

- [ ] Implementar cache local para dados descobertos
- [ ] Adicionar exportação de dados em JSON/CSV
- [ ] Integrar com sistema de favoritos
- [ ] Adicionar preview de imagens dos handitems
- [ ] Implementar descoberta de mobílias com handitems

## 📝 Notas Importantes

- O sistema acessa servidores oficiais do Habbo
- Pode haver limitações de CORS em alguns navegadores
- Os dados são extraídos em tempo real
- Recomenda-se usar o botão "Extrair do Servidor" periodicamente

## 🤝 Contribuição

Para contribuir com melhorias:
1. Adicione novos tipos de handitems conhecidos
2. Implemente descoberta de mobílias adicionais
3. Melhore a interface de visualização
4. Adicione novos filtros e categorias
