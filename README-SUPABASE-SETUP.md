# 🏨 HabboHub - Configuração do Supabase

## 🎯 **Objetivo**
Configurar o Supabase para funcionar com o sistema de login atual do site, mantendo a mesma estética e funcionalidade.

## 📋 **Passos para Configurar o Supabase**

### **1. Acessar o Dashboard do Supabase**
```
https://supabase.com/dashboard/project/wueccgeizznjmjgmuscy
```

### **2. Executar a Migração SQL**
No **SQL Editor** do Supabase, execute o arquivo:
```sql
-- Copie e cole o conteúdo de: supabase/migrations/create_users_table.sql
```

### **3. Deploy da Edge Function**
No **Edge Functions** do Supabase:

#### **3.1. Criar nova função:**
- Nome: `verify-and-register-via-motto`
- Copiar o código de: `supabase/functions/verify-and-register-via-motto/index.ts`

#### **3.2. Configurar variáveis de ambiente:**
```bash
SUPABASE_URL=https://wueccgeizznjmjgmuscy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### **4. Testar a Configuração**
Abrir no navegador:
```
file:///C:/Users/roque/dev/habbo-hub/teste-supabase-login.html
```

## 🔧 **Como Funciona o Sistema**

### **Fluxo de Login:**
1. **Verificação**: Usuário digita username e motto
2. **Validação**: Sistema verifica no Habbo Hotel
3. **Autenticação**: Se válido, permite login com senha
4. **Sessão**: Cria sessão no Supabase

### **Fluxo de Cadastro:**
1. **Verificação**: Mesmo processo de validação
2. **Criação**: Sistema cria conta com senha
3. **Confirmação**: Usuário pode fazer login imediatamente

### **Fluxo de Alteração de Senha:**
1. **Verificação**: Confirma identidade via motto
2. **Atualização**: Altera senha no banco
3. **Confirmação**: Senha atualizada com sucesso

## 📊 **Estrutura da Tabela**

### **Tabela `users`:**
```sql
- id: UUID (chave primária)
- habbo_username: VARCHAR (único)
- habbo_motto: TEXT
- habbo_avatar: TEXT
- password_hash: VARCHAR
- email: VARCHAR (opcional)
- is_admin: BOOLEAN
- is_verified: BOOLEAN
- last_login: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🚀 **Comandos para o Supabase**

### **1. Criar Tabela:**
```sql
-- Execute no SQL Editor
-- Copie o conteúdo de create_users_table.sql
```

### **2. Deploy da Edge Function:**
```bash
# No terminal do Supabase CLI
supabase functions deploy verify-and-register-via-motto
```

### **3. Verificar Status:**
```bash
# Listar funções
supabase functions list

# Ver logs
supabase functions logs verify-and-register-via-motto
```

## 🔑 **Chaves Necessárias**

### **1. Service Role Key:**
- Vá em **Settings > API**
- Copie a **service_role** key
- Use na Edge Function

### **2. Anon Key:**
- Use a **anon** key no frontend
- Para testes locais

## 🧪 **Testes**

### **1. Teste de Verificação:**
```javascript
// Usar username: habbohub, motto: HUB-HA2VEA
// Deve retornar sucesso
```

### **2. Teste de Cadastro:**
```javascript
// Após verificação, criar senha
// Deve criar usuário no banco
```

### **3. Teste de Login:**
```javascript
// Usar credenciais cadastradas
// Deve fazer login com sucesso
```

## ⚠️ **Problemas Comuns**

### **1. Edge Function não responde:**
- Verificar variáveis de ambiente
- Verificar logs da função
- Confirmar deploy

### **2. Erro de CORS:**
- Verificar headers na Edge Function
- Confirmar configuração de CORS

### **3. Erro de autenticação:**
- Verificar Service Role Key
- Confirmar permissões da tabela

## 📞 **Suporte**

### **Para problemas:**
1. Verificar logs da Edge Function
2. Confirmar estrutura da tabela
3. Testar com usuário conhecido (habbohub)
4. Verificar variáveis de ambiente

### **Logs importantes:**
- Edge Function logs
- Database logs
- Network requests no navegador

---

**🎉 Após configurar, o login do site estará funcionando perfeitamente!**
