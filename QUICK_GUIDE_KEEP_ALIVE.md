# 🚀 Guia Rápido - Sistema Keep-Alive do Supabase

## ⚡ Em 3 minutos, seu Supabase nunca mais pausará!

### ✅ O que foi implementado?

Sistema automático de **Vercel Cron Jobs** que mantém seu Supabase ativo 24/7.

---

## 📦 Arquivos Criados

```
✨ NOVOS ARQUIVOS:
├── api/
│   ├── supabase_start.js           # Função do cron job
│   └── README.md                   # Documentação da pasta api
├── scripts/
│   └── test-keep-alive.js          # Script de teste
├── docs/
│   └── SUPABASE_KEEP_ALIVE.md      # Documentação completa
├── .github/workflows/
│   └── keep-alive.yml.example      # Alternativa com GitHub Actions
└── QUICK_GUIDE_KEEP_ALIVE.md       # Este guia

📝 ARQUIVOS MODIFICADOS:
├── vercel.json                      # Adicionada config de crons
└── package.json                     # Adicionado script test:keep-alive
```

---

## 🎯 Como Ativar (3 passos)

### **Passo 1: Testar Localmente** ✅

```bash
npm run test:keep-alive
```

**Resultado esperado:**
```
✅ SUCESSO! Todos os testes passaram.
🎉 O sistema de keep-alive está funcionando perfeitamente!
```

**✔️ Teste realizado:** Tudo funcionando! ✅

---

### **Passo 2: Commit & Push**

```bash
git add .
git commit -m "feat: add Supabase keep-alive system with Vercel Cron Jobs"
git push origin main
```

---

### **Passo 3: Verificar no Vercel Dashboard**

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **Cron Jobs**
4. Confirme que aparece: `supabase_start` com schedule `0 3 * * *`

✅ **Pronto! Seu sistema está ativo.**

---

## 📅 Frequência de Execução

**Schedule configurado:** `0 3 * * *`

Significa: **Todos os dias às 3:00 AM UTC**

### Por que diariamente?

| Evento | Frequência |
|--------|------------|
| Supabase pausa após | 7 dias |
| Cron executa | Diariamente |
| **Margem de segurança** | **Máxima** ✅ |

---

## 🔍 Como Monitorar

### Ver logs de execução:

1. **Vercel Dashboard** > Seu projeto > **Functions**
2. Clique em **supabase_start**
3. Veja todos os logs de execução

### Testar manualmente:

Acesse no navegador:
```
https://seu-dominio.vercel.app/api/supabase_start
```

Ou via terminal:
```bash
curl https://seu-dominio.vercel.app/api/supabase_start
```

---

## ✅ Checklist de Ativação

- [x] ✅ Script de teste executado com sucesso
- [ ] Fazer commit e push para o repositório
- [ ] Verificar Cron Job no Vercel Dashboard
- [ ] (Opcional) Testar execução manual via URL
- [ ] Aguardar primeira execução automática

---

## 🎉 Resumo

### O que acontece agora?

1. **Todos os dias às 3:00 AM UTC**, automaticamente:
   - Vercel executa `api/supabase_start.js`
   - Script faz 4 verificações no Supabase
   - Logs são registrados
   - Supabase detecta atividade e reseta contador de 7 dias

2. **Você não precisa fazer nada:**
   - ✅ Totalmente automático
   - ✅ Gratuito
   - ✅ Confiável
   - ✅ Logs completos

3. **Seu Supabase nunca mais pausará! 🎊**

---

## 🆘 Troubleshooting

### ❌ Erro: "Cron job não aparece no Vercel"

**Solução:**
```bash
# Verificar sintaxe do vercel.json
npm run build  # Se passar, o JSON está correto

# Fazer um novo deploy forçado
vercel --prod
```

### ❌ Erro ao executar teste local

**Solução:**
1. Verifique sua conexão com a internet
2. Confirme que o Supabase está ativo
3. Teste acessar: https://wueccgeizznjmjgmuscy.supabase.co/

### ❌ Supabase ainda pausou

**Causas possíveis:**
- Primeira execução ainda não ocorreu (aguarde até 3 AM UTC)
- Erro na execução (verifique logs no Vercel)
- Precisa fazer o deploy da atualização

**Solução:**
1. Reative manualmente no Supabase Dashboard
2. Verifique se fez commit + push
3. Confirme que o cron está ativo no Vercel
4. Teste manualmente: `/api/supabase_start`

---

## 📚 Documentação Completa

Para mais detalhes, alternativas e configurações avançadas:

➡️ **Leia:** `docs/SUPABASE_KEEP_ALIVE.md`

---

## 🎁 Bônus: Alternativas

Se não quiser usar Vercel Cron:

### **Opção 1: GitHub Actions**
```bash
# Renomear arquivo de exemplo
mv .github/workflows/keep-alive.yml.example .github/workflows/keep-alive.yml

# Adicionar secret no GitHub
# Settings > Secrets > New: SUPABASE_ANON_KEY
```

### **Opção 2: UptimeRobot**
1. Cadastre-se: https://uptimerobot.com
2. Create Monitor > HTTP(s)
3. URL: `https://wueccgeizznjmjgmuscy.supabase.co/rest/v1/habbo_accounts?limit=1`
4. Interval: 5 minutes

---

## 💬 Suporte

Dúvidas ou problemas?

1. Leia a documentação completa: `docs/SUPABASE_KEEP_ALIVE.md`
2. Teste localmente: `npm run test:keep-alive`
3. Verifique logs no Vercel Dashboard

---

**🎉 Parabéns! Seu Supabase agora está protegido contra pausa por inatividade!**

