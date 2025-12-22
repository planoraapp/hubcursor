# 🔧 Configuração do MCP para Supabase

## Sobre MCP e Supabase

Atualmente, não existe um servidor MCP nativo oficial do Supabase. Os servidores MCP disponíveis são principalmente para:
- Vercel (já configurado)
- GitHub
- Outros serviços específicos

## Alternativas para Executar SQL no Supabase

### Opção 1: Supabase CLI (Recomendado)
O Supabase CLI permite aplicar migrações diretamente:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login

# Vincular projeto
supabase link --project-ref wueccgeizznjmjgmuscy

# Aplicar migrações
supabase db push
```

### Opção 2: SQL Editor no Dashboard
Use o SQL Editor do Supabase Dashboard (método atual):
- https://supabase.com/dashboard/project/wueccgeizznjmjgmuscy/sql/new

### Opção 3: API REST do Supabase
Podemos criar um script Node.js que usa a service_role key para executar SQL, mas o Supabase não expõe execução direta de SQL via REST API por segurança.

## Recomendação

Para aplicar migrações, use:
1. **Supabase CLI** (melhor opção para automação)
2. **SQL Editor no Dashboard** (mais simples para execução manual)

## Próximos Passos

1. Execute a migração `20250120000009_remove_duplicate_policies.sql` para remover políticas duplicadas
2. Configure o Supabase CLI se quiser automatizar migrações no futuro

