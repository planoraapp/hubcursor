# 🔑 GUIA: Obter API Key do Supabase

## ❌ Problema Atual
- A chave fornecida não é uma API key válida do Supabase
- Sistema retorna erro 401 (Unauthorized)
- Home não carrega devido ao erro de autenticação

## ✅ Solução

### 1. 🌐 Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard/project/wueccgeizznjmjgmuscy
- Faça login na sua conta

### 2. ⚙️ Navegue para as Configurações
- No menu lateral esquerdo, clique em **"Settings"**
- Clique em **"API"**

### 3. 🔑 Copie a API Key Correta
- Na seção **"Project API keys"**, procure por:
  - **"anon public"** ← Esta é a chave que precisamos!
  - **NÃO use** "service_role" (muito perigosa)

### 4. ✅ Verifique se a Chave Está Correta
A API key deve:
- Começar com **"eyJ"**
- Conter pontos (.) separando as seções
- Ser um JWT token longo
- Exemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2VpenpqbWpnbXVzY3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNzI0NTQ4MCwiZXhwIjoyMDUyODIxNDgwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq`

### 5. 📝 Me Informe a Chave
- Cole a chave que começa com "eyJ"
- Vou atualizar o sistema automaticamente
- A home voltará a funcionar imediatamente

## 🧪 Teste Rápido
Execute este SQL no Supabase Dashboard para verificar se o usuário existe:

```sql
-- Verificar usuário habbohub
SELECT habbo_username, hotel, is_active 
FROM public.hub_users 
WHERE habbo_username = 'habbohub';
```

## 📋 Arquivos SQL para Executar
1. `verificar-usuario-habbohub.sql` - Verificar e criar usuário
2. `criar-usuario-habbohub.sql` - Criar usuário se necessário

## 🎯 Próximos Passos
1. ✅ Execute o SQL `verificar-usuario-habbohub.sql`
2. 🔑 Obtenha a API key JWT do Supabase Dashboard
3. 📝 Me informe a API key correta
4. 🚀 Sistema será corrigido automaticamente
