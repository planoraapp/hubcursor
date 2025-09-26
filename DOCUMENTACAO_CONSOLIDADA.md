# 📚 Documentação Consolidada - HabboHub

## 🎯 Visão Geral do Projeto

O **HabboHub** é uma plataforma completa para usuários do Habbo Hotel, oferecendo:

- **Console de Usuários**: Perfis personalizáveis com fotos, badges, quartos e grupos
- **Sistema de Autenticação**: Login via verificação de motto no hotel
- **Homes Personalizáveis**: Backgrounds e widgets customizáveis
- **Ferramentas**: Editor de avatar, catálogo de roupas, handitems
- **Sistema de Badges**: Monitoramento automático de novos badges
- **APIs Integradas**: Conexão com APIs oficiais do Habbo

## 🏗️ Arquitetura Técnica

### **Frontend**
- **React + TypeScript**: Interface moderna e responsiva
- **Tailwind CSS**: Estilização consistente
- **Vite**: Build tool otimizado
- **Shadcn/ui**: Componentes de interface

### **Backend**
- **Supabase**: Banco de dados PostgreSQL + Edge Functions
- **Autenticação**: Sistema próprio via verificação de motto
- **APIs**: Integração com APIs oficiais do Habbo

### **Deploy**
- **Vercel**: Hospedagem da aplicação
- **Cloudflare R2**: Armazenamento de assets
- **GitHub**: Controle de versão (branches main/develop)

## 🔧 Configuração do Sistema

### **Variáveis de Ambiente Necessárias**
```bash
# Supabase
VITE_SUPABASE_URL=https://wueccgeizznjmjgmuscy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudflare (opcional)
VITE_CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
VITE_CLOUDFLARE_WORKERS_AI_KEY=your_key_here
```

### **Estrutura do Banco de Dados**
- **habbo_accounts**: Contas de usuários principais
- **user_home_layouts**: Layouts personalizados das homes
- **user_home_backgrounds**: Backgrounds das homes
- **habbo_photos**: Fotos dos usuários
- **habbo_badges**: Sistema de badges
- **forum_posts/comments**: Sistema de fórum

## 🚀 Funcionalidades Principais

### **1. Sistema de Console**
- Perfis de usuários com fotos dinâmicas
- Modais para badges, quartos, grupos e amigos
- Layout em duas colunas para otimização de espaço
- Headers amarelos com texto marrom (#2B2300)

### **2. Sistema de Autenticação**
- Login via verificação de motto (HUB-XXXXX)
- Filtragem por país
- Senha de 6 caracteres para acesso futuro
- Contas admin: habbohub, Beebop

### **3. Sistema de Homes**
- Backgrounds personalizáveis
- Widgets arrastáveis
- Stickers e decorações
- Sistema de avaliações

### **4. Ferramentas**
- **Editor de Avatar**: Criação de avatares com roupas reais
- **Catálogo de Roupas**: +2,000 itens do Habbo
- **Handitems**: 268 itens com imagens funcionais
- **TraxMachine**: Editor de música (em desenvolvimento)

## 📁 Estrutura de Arquivos Importantes

### **Componentes Principais**
```
src/components/
├── console/           # Sistema de console
├── auth/             # Autenticação
├── home/             # Sistema de homes
├── tools/            # Ferramentas
└── ui/               # Componentes de interface
```

### **Hooks e Serviços**
```
src/hooks/            # Hooks customizados
src/services/         # Serviços de API
src/integrations/     # Integrações externas
```

### **Dados e Assets**
```
public/
├── assets/           # Imagens e recursos
├── flags/            # Bandeiras de países
└── handitems.json    # Dados de handitems
```

## 🔄 Padrões Estabelecidos

### **Console de Usuários**
- **Fotos**: Grid de 3 colunas sem espaçamento
- **Modais**: Layout em 2 colunas, header amarelo
- **Visibilidade**: Amigos online apenas para o dono do console
- **APIs**: Uso de APIs públicas do Habbo para dados

### **Sistema de Imagens**
- **Fallbacks**: Sistema robusto de fallback para imagens
- **APIs**: Integração com habbo-imaging e APIs oficiais
- **Cache**: Sistema de cache para performance

### **Cores e Temas**
- **Header Console**: bg-yellow-400, texto #2B2300
- **Background**: bghabbohub.png com repeat
- **Bandeiras**: Uso de imagens de assets, não emojis

## 🛠️ Scripts e Ferramentas

### **Scripts de Desenvolvimento**
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview       # Preview do build
```

### **Scripts de Banco de Dados**
- **Migrações**: Arquivos SQL consolidados
- **Backup**: Sistema automático de backup
- **Limpeza**: Scripts de limpeza de dados obsoletos

## 📊 Status Atual

### **✅ Funcionando**
- Sistema de autenticação completo
- Console de usuários com padrão estabelecido
- Sistema de homes funcional
- Ferramentas básicas operacionais
- APIs integradas e funcionais

### **🔄 Em Desenvolvimento**
- TraxMachine (editor de música)
- Sistema de notificações
- Melhorias de performance

### **📋 Próximos Passos**
- Otimização de performance
- Novas funcionalidades baseadas no padrão estabelecido
- Expansão do sistema de ferramentas

## 🚨 Troubleshooting

### **Problemas Comuns**
1. **Imagens não carregam**: Verificar fallbacks e APIs
2. **Console não funciona**: Verificar autenticação e dados do usuário
3. **Homes não carregam**: Verificar configuração do Supabase

### **Logs e Debug**
- Console do navegador para erros frontend
- Supabase logs para problemas de banco
- Vercel logs para problemas de deploy

---

**Última atualização**: $(Get-Date -Format "dd/MM/yyyy HH:mm")
**Versão**: 2.0 (Sistema Consolidado)
