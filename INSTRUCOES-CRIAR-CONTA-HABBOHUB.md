# 🔐 Criar Conta habbohub - Instruções

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard
- URL: https://supabase.com/dashboard/project/wueccgeizznjmjgmuscy
- Faça login com suas credenciais

### 2. Execute o SQL
- Vá em **SQL Editor** (no menu lateral)
- Clique em **New Query**
- Cole o SQL abaixo:

```sql
-- ========================================
-- CRIAR CONTA HABBOHUB COM SENHA 151092
-- ========================================

-- Inserir usuário na tabela habbo_accounts
INSERT INTO public.habbo_accounts (
  id,
  habbo_name,
  hotel,
  figure_string,
  motto,
  is_admin,
  is_online,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'habbohub',
  'br',
  'hd-180-1.ch-255-66.lg-280-110.sh-290-62.ha-1012-110.hr-100-61',
  'Sistema HabboHub - Administrador',
  true,
  false,
  now(),
  now()
) ON CONFLICT (habbo_name, hotel) DO UPDATE SET
  is_admin = true,
  updated_at = now();

-- Verificar se a conta foi criada
SELECT 
  habbo_name,
  hotel,
  is_admin,
  created_at
FROM public.habbo_accounts 
WHERE habbo_name = 'habbohub' AND hotel = 'br';
```

### 3. Execute o Comando
- Clique em **Run** ou pressione **Ctrl+Enter**
- Verifique se apareceu a mensagem de sucesso

### 4. Verifique se Foi Criada
- Execute esta query para confirmar:
```sql
SELECT * FROM habbo_accounts WHERE habbo_name = 'habbohub';
```

## 🔑 Credenciais da Conta

- **Usuário**: `habbohub`
- **Senha**: `151092`
- **Hotel**: Brasil (br)
- **Admin**: Sim
- **Status**: Ativo

## ✅ Teste o Login

1. Acesse a página de login do HabboHub
2. Digite: `habbohub`
3. Digite a senha: `151092`
4. Selecione: Brasil (br)
5. Clique em "Verificar Usuário"
6. A conta deve ser encontrada e permitir login

## 🚨 Se Ainda Não Funcionar

1. Verifique se a tabela `habbo_accounts` existe
2. Verifique se o usuário foi inserido corretamente
3. Verifique se o hotel está como 'br' (não 'brazil')
4. Verifique se `is_admin` está como `true`

## 📞 Suporte

Se precisar de ajuda, verifique:
- Console do navegador (F12) para erros
- Logs do Supabase
- Estrutura da tabela `habbo_accounts`
