# 🔐 Configuração de Variáveis de Ambiente

## 📋 Setup Inicial

1. Copie o arquivo `env.example` para `.env`:
```bash
cp env.example .env
```

2. Preencha as variáveis com seus valores reais.

## 🔑 Variáveis Obrigatórias

### Supabase (Frontend)
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

**Como obter:**
1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em Settings > API
4. Copie a URL e a chave `anon` (public)

### Supabase (Backend - Scripts)
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

**⚠️ IMPORTANTE:**
- A `SERVICE_ROLE_KEY` dá acesso completo ao banco
- NUNCA exponha esta chave no frontend
- Use apenas em scripts Node.js do backend

## 🌐 Variáveis Opcionais

### Cloudflare R2 Storage
```env
VITE_CLOUDFLARE_R2_ACCESS_KEY_ID=sua-access-key
VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY=sua-secret-key
VITE_CLOUDFLARE_R2_PUBLIC_URL=https://seu-bucket.r2.dev
```

**Usado para:**
- Upload de imagens e assets
- CDN de conteúdo estático

**Como obter:**
1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vá em R2 > Create Bucket
3. Gere API Tokens em Manage R2 API Tokens

### Vercel Analytics
```env
VITE_VERCEL_ANALYTICS_ID=seu-analytics-id
```

**Usado para:**
- Tracking de pageviews
- Métricas de performance
- Analytics de usuários

## 🔒 Segurança

### ✅ Boas Práticas

1. **NUNCA** commite o arquivo `.env`
2. Sempre use `env.example` como template
3. Rotacione chaves periodicamente
4. Use chaves diferentes para dev/prod
5. Limite permissões das chaves ao mínimo necessário

### 🚫 Chaves Expostas

Se você acidentalmente expôs uma chave:
1. **Revogue imediatamente** no dashboard do serviço
2. Gere uma nova chave
3. Atualize todos os ambientes
4. Investigue o histórico do Git

## 🧪 Ambientes

### Development
```bash
npm run dev
```
- Usa variáveis do `.env`
- Logs habilitados
- HMR ativo

### Production
```bash
npm run build
npm run preview
```
- Configure variáveis no Vercel Dashboard
- Logs desabilitados automaticamente
- Assets otimizados

## 📝 Checklist de Setup

- [ ] Copiei `env.example` para `.env`
- [ ] Configurei VITE_SUPABASE_URL
- [ ] Configurei VITE_SUPABASE_ANON_KEY
- [ ] Adicionei `.env` no `.gitignore`
- [ ] (Opcional) Configurei Cloudflare R2
- [ ] (Opcional) Configurei Vercel Analytics
- [ ] Testei o projeto localmente

## 🆘 Troubleshooting

### Erro: "Invalid Supabase URL"
- Verifique se a URL está no formato correto
- Não adicione `/` no final da URL

### Erro: "Invalid API key"
- Confirme que copiou a chave correta (anon vs service_role)
- Regenere a chave se necessário

### Erro: "Environment variable not found"
- Reinicie o servidor de desenvolvimento
- Verifique se o nome da variável está correto
- Confirme que começa com `VITE_` para variáveis frontend

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)

