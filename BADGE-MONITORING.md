# Monitoramento Automático de Badges

Este sistema verifica automaticamente novos badges do Habbo Hotel diariamente.

## Como usar

### 1. Configuração Inicial
```bash
node scripts/setup-badge-monitoring.cjs
```

### 2. Execução Manual
```bash
node scripts/check-new-badges.cjs
```

### 3. Agendamento no Windows
```powershell
# Executar como Administrador
.\scripts\agendar-verificacao-badges.ps1 -CriarTarefa
```

### 4. Executar Agora
```powershell
.\scripts\agendar-verificacao-badges.ps1 -ExecutarAgora
```

## Arquivos Criados

- `src/data/badge-codes.json` - Lista de códigos de badges
- `src/data/badge-categories.json` - Categorias de badges
- `public/assets/badges/` - Imagens dos badges
- `badge-update.log` - Log de atualizações
- `.last-badge-check` - Timestamp da última verificação

## Logs

Os logs são salvos em `badge-update.log` com timestamp de cada operação.

## Backup

O sistema cria backups automáticos dos arquivos de dados em `backups/`.

## Troubleshooting

Se houver problemas:
1. Verifique os logs em `badge-update.log`
2. Execute manualmente: `node scripts/check-new-badges.cjs`
3. Verifique se o `habbo-downloader` está funcionando
