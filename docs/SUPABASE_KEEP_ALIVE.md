# 🔄 Sistema de Keep-Alive do Supabase

## 📋 Problema

No **plano gratuito do Supabase**, projetos que ficam **7 dias sem atividade** são pausados automaticamente. Quando pausados:
- ❌ O banco de dados fica inacessível
- ❌ Edge Functions param de funcionar
- ❌ Usuários não conseguem acessar o site
- ✅ Você pode reativar manualmente no dashboard

## ✅ Solução Implementada: Vercel Cron Jobs

### O que foi implementado?

Criamos um **Cron Job automatizado** que roda **diariamente** para manter o Supabase sempre ativo.

### 📁 Arquivos

```
api/
└── supabase_start.js    # Função serverless do Vercel

vercel.json              # Configuração do cron
```

### ⚙️ Como funciona?

1. **Todos os dias às 3:00 AM UTC**, o Vercel executa automaticamente o arquivo `api/supabase_start.js`
2. A função faz **4 verificações**:
   - ✅ Ping no banco de dados (query simples)
   - ✅ Ping na Edge Function de feed global
   - ✅ Ping na Edge Function de perfil
   - ✅ Verificação do sistema de autenticação
3. Todas as requisições são registradas em logs
4. O Supabase detecta atividade e **reseta o contador de 7 dias**

### 🎯 Benefícios

- ✅ **100% Automático** - Não precisa fazer nada manualmente
- ✅ **Gratuito** - Incluído no plano Hobby da Vercel
- ✅ **Confiável** - Gerenciado pela infraestrutura da Vercel
- ✅ **Logs completos** - Você pode monitorar no Vercel Dashboard

### 📊 Monitoramento

#### Ver logs no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Deployments**
4. Clique em **Functions** (aba lateral)
5. Selecione `cron-keep-alive`
6. Visualize os logs de execução

#### Exemplo de log bem-sucedido:

```json
{
  "success": true,
  "message": "✅ Supabase keep-alive completed successfully",
  "results": {
    "timestamp": "2024-01-15T03:00:00.000Z",
    "success": true,
    "checks": [
      {
        "service": "database",
        "status": "healthy",
        "statusCode": 200
      },
      {
        "service": "edge-function-feed",
        "status": "healthy",
        "statusCode": 200
      },
      {
        "service": "edge-function-profile",
        "status": "healthy",
        "statusCode": 200
      },
      {
        "service": "auth-system",
        "status": "healthy",
        "statusCode": 200
      }
    ]
  },
      "nextRun": "Tomorrow at 3:00 AM UTC"
}
```

### 🚀 Como ativar?

Após fazer o commit e push dessas mudanças:

1. Faça o deploy no Vercel:
   ```bash
   git add .
   git commit -m "feat: add Supabase keep-alive cron job"
   git push origin main
   ```

2. O Vercel irá detectar automaticamente a configuração de `crons` no `vercel.json`

3. Verifique no dashboard:
   - Vá em **Settings** > **Cron Jobs**
   - Você verá: `supabase_start` agendado para `0 3 * * *`

### ⏰ Frequência do Cron

**Schedule atual**: `0 3 * * *`

Tradução: **Todos os dias, às 3:00 AM UTC**

#### Por que diariamente?

- Supabase pausa após **7 dias**
- Executar **diariamente** garante **máxima margem de segurança**
- Mantém o banco sempre aquecido e responsivo

#### Alterar frequência (se necessário)

Edite o `schedule` em `vercel.json` e `api/cron-keep-alive.js`:

```javascript
// Exemplos de frequências:

"0 3 * * *"      // Todo dia às 3 AM UTC (atual)
"0 0 * * *"      // Todo dia à meia-noite UTC
"0 3 */2 * *"    // A cada 2 dias às 3 AM UTC
"0 12 * * 0"     // Todo domingo ao meio-dia UTC
"0 */6 * * *"    // A cada 6 horas
```

**Sintaxe Cron**: `minuto hora dia mês dia-da-semana`

## 🔧 Soluções Alternativas

### **Opção 2: GitHub Actions** (Se não quiser usar Vercel Cron)

Crie `.github/workflows/keep-alive.yml`:

```yaml
name: Supabase Keep-Alive

on:
  schedule:
    # Executa todos os dias às 3 AM UTC
    - cron: '0 3 * * *'
  workflow_dispatch: # Permite execução manual

jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase Database
        run: |
          curl -X GET "https://wueccgeizznjmjgmuscy.supabase.co/rest/v1/habbo_accounts?limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
      
      - name: Ping Edge Functions
        run: |
          curl -X POST "https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-global-feed" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"hotel":"br","limit":5}'
```

**Adicione o secret:**
1. GitHub > Settings > Secrets and variables > Actions
2. New repository secret: `SUPABASE_ANON_KEY`

### **Opção 3: Serviços Externos de Ping**

Use serviços gratuitos de monitoramento:

#### **UptimeRobot** (Recomendado)
- 🌐 [uptimerobot.com](https://uptimerobot.com)
- ✅ Gratuito até 50 monitores
- ⚙️ Configure para pingar seu banco a cada 5 minutos

**Como configurar:**
1. Cadastre-se no UptimeRobot
2. Create Monitor > HTTP(s)
3. URL: `https://wueccgeizznjmjgmuscy.supabase.co/rest/v1/habbo_accounts?limit=1`
4. Monitoring Interval: 5 minutes
5. Adicione header: `apikey: sua-chave-anon`

#### **Outros serviços:**
- **BetterUptime** - [betteruptime.com](https://betteruptime.com)
- **Pingdom** - [pingdom.com](https://pingdom.com)
- **Freshping** - [freshping.io](https://freshping.io)

### **Opção 4: Upgrade para Plano Pago** 💰

Se o projeto crescer, considere o **Supabase Pro** ($25/mês):
- ✅ **Sem pausa por inatividade**
- ✅ Mais recursos computacionais
- ✅ Backups automáticos diários
- ✅ Suporte prioritário

## 📊 Comparação das Soluções

| Solução | Custo | Facilidade | Confiabilidade | Recomendação |
|---------|-------|------------|----------------|--------------|
| **Vercel Cron** | Grátis | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Melhor |
| GitHub Actions | Grátis | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 👍 Boa |
| UptimeRobot | Grátis | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 👍 Boa |
| Supabase Pro | $25/mês | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 💰 Se escalar |

## ✅ Checklist de Implementação

- [x] Arquivo `api/cron-keep-alive.js` criado
- [x] `vercel.json` atualizado com configuração de crons
- [ ] Fazer commit e push para o repositório
- [ ] Verificar deploy no Vercel Dashboard
- [ ] Confirmar que o cron job aparece em Settings > Cron Jobs
- [ ] Testar manualmente via Vercel Functions (opcional)
- [ ] Aguardar primeira execução (em 3 dias ou menos)
- [ ] Verificar logs após primeira execução

## 🆘 Troubleshooting

### ❌ "Cron job não aparece no Vercel Dashboard"

**Solução:**
1. Confirme que o `vercel.json` está na raiz do projeto
2. Verifique a sintaxe do JSON (sem vírgulas extras)
3. Faça um novo deploy: `vercel --prod`
4. O plano Hobby da Vercel suporta crons (verifique seu plano)

### ❌ "Função retorna erro 500"

**Solução:**
1. Verifique os logs no Vercel Dashboard
2. Confirme que as URLs do Supabase estão corretas
3. Teste a chave `SUPABASE_ANON_KEY` manualmente com curl:
   ```bash
   curl -X GET "https://wueccgeizznjmjgmuscy.supabase.co/rest/v1/habbo_accounts?limit=1" \
     -H "apikey: SUA_CHAVE_AQUI"
   ```

### ❌ "Supabase ainda pausou"

**Causas possíveis:**
1. Cron job não está rodando (verifique os logs)
2. Todas as requisições falharam (erro de rede/API)
3. Você está em um período de teste (primeiros 7 dias)

**Solução:**
- Reative manualmente no Supabase Dashboard
- Verifique os logs do cron job
- Considere reduzir a frequência para a cada 2 dias

## 📚 Recursos Adicionais

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Supabase Free Plan Limits](https://supabase.com/docs/guides/platform/org-based-billing#free-plan)
- [Cron Syntax Explained](https://crontab.guru/)

---

## 🎉 Resumo

Com o **Vercel Cron Job** implementado, seu projeto Supabase **nunca mais pausará por inatividade**! 

A solução é:
- ✅ 100% automática
- ✅ Gratuita
- ✅ Confiável
- ✅ Fácil de monitorar

Se tiver dúvidas, verifique os logs no Vercel Dashboard ou teste manualmente acessando `/api/cron-keep-alive` no seu domínio.

