# Plano de Extração de Imagens de Handitems

## Objetivo
Criar um sistema completo para extrair, descobrir e exibir imagens de handitems do Habbo, baseado no tutorial ViaJovem e fontes reais disponíveis.

## Fontes de Imagens Identificadas

### 1. Imgur (Fonte Principal)
- **URLs conhecidas:**
  - `https://i.imgur.com/sMTSwiG.png` (handitem específico)
  - `https://i.imgur.com/2xypAeW.png` (handitem específico)
- **Padrão:** `https://i.imgur.com/{slug}.png`
- **Vantagem:** Imagens hospedadas, estáveis
- **Desvantagem:** Precisa descobrir os slugs corretos

### 2. HabboTemplarios
- **URLs conhecidas:**
  - `https://images.habbotemplarios.com/web/avatargen/hand_icecream.png`
- **Padrão:** `https://images.habbotemplarios.com/web/avatargen/hand_{item_name}.png`
- **Vantagem:** Nomenclatura previsível
- **Desvantagem:** Pode não ter todos os itens

### 3. Habbo Imaging API (Oficial)
- **URLs:** `https://www.habbo.com/habbo-imaging/avatarimage?figure={figureString}&action=crr{id}`
- **Vantagem:** Oficial, sempre atualizado
- **Desvantagem:** Requer figureString válido

## Estratégia de Extração

### Fase 1: Descoberta de Imagens Existentes
1. **Buscar em HabboTemplarios** usando padrão de nomenclatura
2. **Verificar Imgur** para handitems conhecidos
3. **Testar Habbo Imaging API** com avatares padrão

### Fase 2: Extração Manual (Tutorial ViaJovem)
1. **Descobrir build atual** do Habbo
2. **Baixar hh_human_item.swf** da build
3. **Extrair imagens** usando JPEXS Free Flash Decompiler
4. **Organizar por tipo** (drk/crr) e ID

### Fase 3: Sistema de Fallback
1. **Prioridade 1:** Imagens extraídas localmente
2. **Prioridade 2:** HabboTemplarios
3. **Prioridade 3:** Imgur
4. **Prioridade 4:** Habbo Imaging API
5. **Fallback:** Placeholder com ícone

## Implementação Técnica

### 1. Serviço de Descoberta de Imagens
```typescript
class HanditemImageDiscovery {
  async discoverImage(handitem: Handitem): Promise<string | null> {
    // Tentar múltiplas fontes em ordem de prioridade
  }
}
```

### 2. Sistema de Cache
- Cache local das URLs descobertas
- Verificação periódica de disponibilidade
- Atualização automática quando necessário

### 3. Interface de Extração Manual
- Botão para extrair build atual
- Processo guiado para extração
- Upload de imagens extraídas

## Cronograma de Implementação

### Semana 1: Base
- [ ] Implementar sistema de descoberta básico
- [ ] Criar fallbacks para fontes conhecidas
- [ ] Testar com handitems existentes

### Semana 2: Extração
- [ ] Implementar extração automática da build
- [ ] Criar interface para extração manual
- [ ] Sistema de upload e organização

### Semana 3: Otimização
- [ ] Sistema de cache inteligente
- [ ] Verificação automática de disponibilidade
- [ ] Interface de gerenciamento

## Ferramentas Necessárias

### 1. Scripts de Descoberta
- `discover-habbo-templarios.js`
- `discover-imgur-handitems.js`
- `test-habbo-imaging.js`

### 2. Scripts de Extração
- `extract-current-build.js`
- `process-swf-images.js`
- `organize-handitem-images.js`

### 3. Interface Web
- Página de descoberta de imagens
- Interface de extração manual
- Gerenciador de cache de imagens

## Dados de Entrada

### Handitems Conhecidos (267 itens)
- Lista completa em `src/data/realHanditems.ts`
- IDs de 0 a 266
- Nomes em português brasileiro

### Mobis que Dão Handitems (~500)
- Lista em `src/data/mobisData.ts`
- Associações handitem-mobília
- URLs de imagens das mobílias

## Resultado Esperado

### Interface do Usuário
- Exibição de todas as 267 imagens de handitems
- Sistema de busca e filtros
- Cópia de IDs para uso
- Visualização de mobílias associadas

### Performance
- Carregamento rápido com cache
- Fallbacks para imagens indisponíveis
- Atualização automática quando possível

### Manutenibilidade
- Sistema de descoberta automática
- Interface para adicionar novas fontes
- Logs de descoberta e erros
