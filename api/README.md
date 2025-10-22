# 📁 API - Serverless Functions (Vercel)

Esta pasta contém **Serverless Functions** que rodam na infraestrutura da Vercel.

## 📋 Funções Disponíveis

### 🚀 `supabase_start.js`

**Propósito**: Mantém o Supabase ativo para evitar pausa por inatividade (7 dias).

**Tipo**: Cron Job automático

**Schedule**: Diariamente às 3:00 AM UTC (`0 3 * * *`)

**O que faz:**
1. Faz ping no banco de dados
2. Executa Edge Functions principais
3. Verifica sistema de autenticação
4. Registra logs de saúde do sistema

**Como monitorar:**
- Vercel Dashboard > Functions > supabase_start
- Logs completos de cada execução
- Status de cada check

**Acesso manual:**
- Produção: `https://seu-dominio.com/api/supabase_start`
- Local: `http://localhost:3000/api/supabase_start`

## 🧪 Testando Localmente

Para testar o funcionamento antes de fazer deploy:

```bash
npm run test:keep-alive
```

Ou diretamente:

```bash
node scripts/test-keep-alive.js
```

## 📚 Documentação Completa

Veja: `docs/SUPABASE_KEEP_ALIVE.md`

## 🔐 Variáveis de Ambiente

As chaves do Supabase estão **hardcoded** no arquivo pois:
- São chaves públicas (`anon key`)
- Já estão expostas no frontend
- Não há risco de segurança (são read-only para a maioria das operações)

Se precisar usar a `SERVICE_ROLE_KEY`, adicione como **Environment Variable** no Vercel Dashboard.

## 📝 Adicionando Novas Funções

Para criar uma nova serverless function:

1. Crie um arquivo em `api/nome-da-funcao.js`
2. Exporte um handler padrão:

```javascript
export default async function handler(req, res) {
  // Sua lógica aqui
  return res.status(200).json({ success: true });
}
```

3. Acesse via: `https://seu-dominio.com/api/nome-da-funcao`

**Cron Jobs:**

```javascript
export const config = {
  schedule: '0 0 * * *' // Todo dia à meia-noite
};

export default async function handler(req, res) {
  // Sua lógica de cron
}
```

**Documentação:** [Vercel Serverless Functions](https://vercel.com/docs/functions)

