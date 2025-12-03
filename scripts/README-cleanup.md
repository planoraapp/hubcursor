# Scripts de Limpeza do Banco de Dados

## 📋 Visão Geral

Estes scripts foram criados para limpar dados antigos do banco de dados Supabase e liberar espaço. Os principais objetos que ocupam espaço são:

1. **net._http_response** (221.24 MB - 46.24%)
   - Armazena respostas HTTP de webhooks/requisições
   - Geralmente não é necessário manter histórico extenso

2. **cron.job_run_details** (163.2 MB - 34.11%)
   - Histórico de execuções de jobs agendados
   - Útil para monitoramento, mas não precisa de meses de histórico

3. **storage.objects** (47.98 MB - 10.03%)
   - Metadados de arquivos no Storage
   - Revisar manualmente arquivos órfãos

4. **public.habbo_activities** (8.78 MB - 1.84%)
   - Atividades detectadas dos usuários
   - Implementar retenção de 90 dias

## 🚀 Como Usar

### ⚠️ IMPORTANTE: Certifique-se de estar no projeto correto!

**Projeto HabboHub:** `wueccgeizznjmjgmuscy` (https://wueccgeizznjmjgmuscy.supabase.co)

### Opção 1: Executar SQL Diretamente (Recomendado)

1. Acesse o **Supabase Dashboard** do projeto HabboHub
2. Verifique se está no projeto correto (URL deve conter `wueccgeizznjmjgmuscy`)
3. Vá em **SQL Editor**
4. Copie e cole o conteúdo de `scripts/cleanup-habbohub-database.sql`
5. Execute o script

O script irá:
- ✅ Verificar estatísticas antes da limpeza
- ✅ Limpar registros antigos automaticamente
- ✅ Criar job automático para limpeza futura (se pg_cron estiver instalado)
- ✅ Executar VACUUM para recuperar espaço
- ✅ Mostrar estatísticas após a limpeza

### Opção 2: Usar Script Node.js

```bash
# Executar o script Node.js
node scripts/cleanup-database.cjs
```

**Nota:** O script Node.js pode ter limitações dependendo das permissões da API REST do Supabase. É recomendado usar o SQL direto.

## 📊 Resultados Esperados

Após a execução, você deve ver:

- **net._http_response**: Redução de ~221 MB para alguns KB
- **cron.job_run_details**: Redução de ~163 MB para ~5-10 MB (mantendo 30 dias)
- **habbo_activities**: Redução proporcional baseada na retenção de 90 dias

**Total estimado liberado: ~370 MB**

## ⚠️ Avisos Importantes

1. **Backup**: Faça backup antes de executar (se possível)
2. **Teste**: Teste primeiro em ambiente de desenvolvimento
3. **Monitoramento**: Verifique se não há dependências críticas nos dados antigos
4. **VACUUM**: O script executa VACUUM automaticamente, mas pode demorar em bancos grandes

## 🔄 Limpeza Automática

O script cria um job automático (se pg_cron estiver instalado) que executa limpeza todo domingo às 2h da manhã, mantendo apenas:
- **cron.job_run_details**: Últimos 30 dias
- **net._http_response**: Últimos 7 dias (se necessário)

## 📝 Notas Técnicas

- **net._http_response**: Usa coluna `created` (não `created_at`)
- **cron.job_run_details**: Requer extensão `pg_cron` instalada
- **habbo_activities**: Pode não existir se o sistema de atividades não estiver ativo
- **Snapshots**: Mantém apenas o snapshot mais recente por usuário

## 🐛 Troubleshooting

### Erro: "relation does not exist"
- A tabela pode não existir no seu projeto
- O script verifica automaticamente e pula tabelas inexistentes

### Erro: "permission denied"
- Certifique-se de usar a **service_role key** ou ter permissões de administrador
- Execute no SQL Editor do Supabase Dashboard (tem permissões completas)

### Job automático não criado
- Verifique se a extensão `pg_cron` está instalada:
  ```sql
  SELECT * FROM pg_extension WHERE extname = 'pg_cron';
  ```
- Se não estiver, instale:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  ```

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs do Supabase Dashboard
2. Permissões do usuário
3. Extensões instaladas
4. Estrutura das tabelas (podem variar entre projetos)

