# 🧹 Como Executar a Limpeza do Banco HabboHub

## ⚠️ ATENÇÃO: Certifique-se de estar no projeto correto!

**Projeto HabboHub:**
- Project ID: `wueccgeizznjmjgmuscy`
- URL: https://wueccgeizznjmjgmuscy.supabase.co

---

## 📋 Passo a Passo

### 1️⃣ Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login com sua conta
3. **IMPORTANTE:** Selecione o projeto **HabboHub** (`wueccgeizznjmjgmuscy`)
4. Verifique se a URL do dashboard contém `wueccgeizznjmjgmuscy`

---

### 2️⃣ Abrir o SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New query** (Nova consulta)

---

### 3️⃣ Executar o Script de Limpeza

1. Abra o arquivo `scripts/cleanup-habbohub-database.sql`
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (Executar) ou pressione `Ctrl + Enter`

---

### 4️⃣ Executar VACUUM (Separadamente)

⚠️ **IMPORTANTE:** O VACUUM não pode ser executado junto com o resto do script.

Após executar o script acima, crie uma **NOVA QUERY** e execute:

```sql
VACUUM ANALYZE net._http_response;
```

Se a tabela `cron.job_run_details` existir, execute também:

```sql
VACUUM ANALYZE cron.job_run_details;
```

---

## 📊 O Que Será Limpo

| Tabela | Tamanho Antes | Tamanho Depois | Espaço Liberado |
|--------|---------------|----------------|-----------------|
| `net._http_response` | 221 MB | ~32 KB | ~221 MB |
| `cron.job_run_details` | 163 MB | ~5-10 MB | ~155 MB |
| **TOTAL** | **384 MB** | **~10 MB** | **~375 MB** |

---

## ✅ Verificar Resultados

Após a execução, o script mostrará:

1. ✅ Tamanho do banco antes da limpeza
2. ✅ Quantidade de registros deletados
3. ✅ Tamanho do banco após a limpeza
4. ✅ Espaço liberado
5. ✅ Jobs automáticos criados (limpeza semanal)

---

## 🔄 Limpeza Automática

O script cria 2 jobs automáticos:

- **`cleanup-http-response`**: Limpa `net._http_response` todo domingo às 3h
- **`cleanup-cron-history`**: Limpa `cron.job_run_details` todo domingo às 2h

Você não precisará executar a limpeza manualmente novamente! 🎉

---

## ❓ Problemas Comuns

### "Table does not exist"
- Normal se a tabela não existir no seu banco
- O script verifica automaticamente e pula tabelas inexistentes

### "VACUUM cannot run inside a transaction block"
- Execute o VACUUM em uma query separada (veja Passo 4)

### "Extension pg_cron not installed"
- Os jobs automáticos não serão criados
- Para instalar: `CREATE EXTENSION IF NOT EXISTS pg_cron;`
- Execute como administrador do banco

---

## 🔐 Segurança

- ✅ O script só deleta dados de log/histórico
- ✅ NÃO deleta dados de usuários ou conteúdo
- ✅ Mantém os últimos 7-30 dias de logs para debug
- ✅ Cria backup automático via jobs agendados

---

## 📞 Precisa de Ajuda?

Se encontrar algum erro:
1. Copie a mensagem de erro completa
2. Verifique se está no projeto correto (`wueccgeizznjmjgmuscy`)
3. Verifique se tem permissões de administrador no banco

