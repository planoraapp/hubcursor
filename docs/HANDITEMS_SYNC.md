# 🔄 Sistema de Sincronização de Handitems

## 📋 Visão Geral

O sistema de sincronização de handitems busca automaticamente os nomes dos handitems de múltiplos hotéis Habbo (`.com`, `.com.br`, `.es`) e mantém traduções atualizadas em português, inglês e espanhol.

## 🎯 Funcionalidades

1. **Sincronização Multi-Hotel**: Busca `external_flash_texts` de `.com`, `.com.br` e `.es`
2. **Traduções Automáticas**: Mantém nomes traduzidos para cada idioma
3. **Detecção de Novos Itens**: Identifica automaticamente os 5 handitems mais recentes
4. **Badge "Novo"**: Marca visualmente os itens novos com a imagem `new.png`
5. **Cache Inteligente**: Sincroniza apenas uma vez por dia (24h)
6. **Fallback Local**: Usa arquivo local se a sincronização falhar

## 🚀 Como Usar

### Sincronização Manual

Execute o script de sincronização:

```bash
npm run handitems:sync
```

### Sincronização Automática (Recomendado)

Configure uma tarefa agendada para executar diariamente:

**Windows (Task Scheduler):**
```powershell
# Criar tarefa agendada para executar diariamente às 3:00 AM
schtasks /create /tn "Sync Handitems" /tr "npm run handitems:sync" /sc daily /st 03:00
```

**Linux/Mac (Cron):**
```bash
# Adicionar ao crontab (executa diariamente às 3:00 AM)
0 3 * * * cd /caminho/para/projeto && npm run handitems:sync
```

## 📁 Estrutura de Arquivos

```
public/
  handitems/
    handitems.json          # Formato simples (compatível)
    handitems-full.json     # Formato completo (com traduções)
```

## 🔧 Formato dos Dados

### Formato Simples (`handitems.json`)
```json
[
  {
    "id": 1,
    "name": "Cenoura"
  },
  {
    "id": 2,
    "name": "Suco"
  }
]
```

### Formato Completo (`handitems-full.json`)
```json
[
  {
    "id": 1,
    "name": "Cenoura",
    "names": {
      "pt": "Cenoura",
      "en": "Carrot",
      "es": "Zanahoria"
    },
    "isNew": false
  }
]
```

## 🌍 Suporte a Idiomas

O sistema detecta automaticamente o idioma do usuário e exibe os nomes traduzidos:

- **Português (pt)**: Usa nomes do `.com.br`
- **Inglês (en)**: Usa nomes do `.com`
- **Espanhol (es)**: Usa nomes do `.es`

## 🆕 Marcação de Novos Itens

Os 5 handitems mais recentes (com IDs maiores) são automaticamente marcados como "novos" e exibem o badge `new.png` no canto superior direito.

## 🔄 Fluxo de Sincronização

1. **Verificação de Cache**: Verifica se já sincronizou nas últimas 24h
2. **Busca Multi-Hotel**: Busca `external_flash_texts` de todos os hotéis
3. **Mesclagem de Traduções**: Combina traduções de todos os hotéis
4. **Detecção de Novos**: Compara com lista anterior e identifica novos
5. **Salvamento**: Salva em `handitems.json` e `handitems-full.json`
6. **Cache LocalStorage**: Armazena no navegador para uso offline

## 📊 Estatísticas

O script exibe estatísticas durante a execução:

```
📡 Buscando external_flash_texts de com...
✅ Encontrados 268 handitems em com
📡 Buscando external_flash_texts de com.br...
✅ Encontrados 268 handitems em com.br
📡 Buscando external_flash_texts de es...
✅ Encontrados 268 handitems em es

📊 Resumo:
   - .com: 268 handitems
   - .com.br: 268 handitems
   - .es: 268 handitems

✅ Total de handitems sincronizados: 268

🆕 Novos handitems encontrados (2):
   - ID 1117: Faca
   - ID 1116: Pato Rosa

💾 Handitems salvos em: public/handitems/handitems.json
💾 Formato completo salvo em: public/handitems/handitems-full.json
```

## 🐛 Troubleshooting

### Erro ao buscar external_flash_texts

**Problema**: Script não consegue buscar dos hotéis

**Solução**: 
- Verifique sua conexão com a internet
- Verifique se os URLs dos hotéis estão corretos
- O script usa fallback para arquivo local se falhar

### Handitems não aparecem como novos

**Problema**: Novos handitems não são marcados

**Solução**:
- Certifique-se de que existe um arquivo `handitems.json` anterior
- Execute o script novamente para comparar

### Traduções não aparecem

**Problema**: Nomes não mudam ao alterar idioma

**Solução**:
- Verifique se o `I18nContext` está configurado corretamente
- Certifique-se de que o componente está usando `syncedHanditems`

## 📝 Notas Importantes

1. **Frequência de Sincronização**: Recomendado executar diariamente
2. **Cache**: O sistema usa cache de 24h para evitar requisições excessivas
3. **Fallback**: Se a sincronização falhar, usa o arquivo local
4. **Novos Itens**: Apenas os 5 mais recentes são marcados como novos
5. **Ordenação**: Novos itens aparecem primeiro na lista

## 🔗 Arquivos Relacionados

- `src/services/HanditemSyncService.ts` - Serviço de sincronização
- `src/components/tools/UnifiedCatalog.tsx` - Componente que exibe handitems
- `scripts/sync-handitems-daily.cjs` - Script de sincronização
- `public/handitems/handitems.json` - Arquivo de dados
