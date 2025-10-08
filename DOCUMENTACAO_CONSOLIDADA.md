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

#### **Tabelas Principais**

**habbo_accounts** - Contas de usuários
```typescript
{
  id: UUID,
  supabase_user_id: UUID, // Foreign Key para auth.users
  habbo_id: string,        // Formato: hhbr-{timestamp}
  habbo_name: string,      // Nome no Habbo
  figure_string: string,   // Visual do avatar
  motto: string,           // Frase do perfil
  hotel: string,           // Hotel (br, com, es, etc)
  is_admin: boolean,
  is_online: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

**chat_messages** - Sistema de mensagens ✨ NOVO
```typescript
{
  id: UUID,
  sender_id: UUID,         // supabase_user_id do remetente
  receiver_id: UUID,       // supabase_user_id do destinatário
  message: text,
  created_at: timestamp,
  read_at: timestamp,
  deleted_by_sender: boolean,
  deleted_by_receiver: boolean,
  is_reported: boolean
}
```

**user_blocks** - Bloqueios de usuários
```typescript
{
  id: UUID,
  blocker_id: UUID,
  blocked_id: UUID,
  created_at: timestamp
}
```

**message_reports** - Denúncias de mensagens
```typescript
{
  id: UUID,
  message_id: UUID,
  reporter_id: UUID,
  reason: text,
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
  created_at: timestamp,
  reviewed_at: timestamp,
  reviewed_by: UUID,
  admin_notes: text
}
```

**Outras Tabelas**:
- **user_home_layouts**: Layouts personalizados das homes
- **user_home_backgrounds**: Backgrounds das homes
- **habbo_photos**: Fotos dos usuários
- **habbo_badges**: Sistema de badges
- **console_profile_comments/likes/follows**: Interações sociais
- **daily_friend_activities**: Atividades de amigos
- **forum_posts/comments**: Sistema de fórum (futuro)

## 🚀 Funcionalidades Principais

### **1. Sistema de Console**

O Console é o coração do HabboHub, oferecendo um hub central para interações sociais.

#### **Abas do Console**

**📱 Feed** - Atividades sociais em tempo real
- Mostra atividades dos amigos do Habbo
- Fotos postadas recentemente
- Mudanças de visual (figure string)
- Novos badges conquistados
- Grupos e quartos criados
- Atualização automática via Edge Functions

**💬 Chat** - Sistema de mensagens ✨
- Conversas privadas entre usuários cadastrados
- Interface estilo Habbo com balões de fala brancos
- Avatares animados com gesture de fala (`spk/nrm`)
- **Funcionalidades**:
  - Enviar e receber mensagens em tempo real (Supabase Realtime)
  - Ver histórico completo de conversas
  - Bloqueio de usuários indesejados
  - Denúncia de mensagens impróprias
  - Exclusão de conversas (hard delete apenas para admins)
  - Marcação automática de lidas (`read_at`)
  - Soft delete (mensagem some apenas para quem deletou)
- **Design**:
  - Heads dos usuários: `headonly=1` com rotação `direction=2/4`
  - Animação de fala ao enviar mensagem (2 segundos)
  - Divisores tracejados entre conversas (`border-dashed`)
  - Balões com triângulo apontando para o avatar
  - Aviso de segurança sobre registro de mensagens

**👥 Amigos** - Lista de amizades
- Busca de usuários do Habbo por nome
- Lista de amigos do hotel
- Status online/offline
- Acesso rápido aos perfis
- Botão "Enviar Mensagem" que abre o chat

**📸 Fotos** - Galeria de fotos
- Grid de fotos do usuário
- Sincronização com fotos do Habbo.com
- Sistema de curtidas e comentários
- Modal de visualização ampliada

**🏆 Conquistas** - Sistema de gamificação (futuro)
- Badges especiais do HabboHub
- Marcos de atividade
- Recompensas por participação

#### **Padrões Visuais**
- **Layout**: Duas colunas para otimização de espaço
- **Modais**: Headers amarelos (`bg-[#FFD700]`) com texto marrom (`#2B2300`)
- **Fotos**: Grid de 3 colunas sem espaçamento
- **Avatares**: `image-rendering: pixelated` para estilo retrô
- **Divisores**: Linhas tracejadas brancas com opacidade (`border-white/20`)

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

## 💻 Detalhes Técnicos do Chat

### **Hook Principal: `useChat.tsx`**

**Funções Disponíveis**:
```typescript
fetchConversations()              // Busca todas conversas do usuário
fetchMessages(otherUserId)        // Busca mensagens de conversa específica
sendMessage(receiverId, message)  // Envia nova mensagem
deleteConversation(otherUserId)   // Deleta conversa inteira (hard delete)
blockUser(userId)                 // Bloqueia usuário
unblockUser(userId)               // Desbloqueia usuário
reportMessage(messageId, reason)  // Denuncia mensagem
findUserByName(habboName)         // Busca usuário por nome Habbo
```

### **Sistema Real-time**
- Supabase Realtime Channels para novas mensagens
- Atualização incremental (não recarrega tudo)
- Marcação automática de lidas ao visualizar
- Contador de mensagens não lidas por conversa

### **Otimizações Implementadas**
- ✅ Lazy loading de usuários bloqueados
- ✅ Subscription incremental (atualiza só o necessário)
- ✅ Memoização de conversas
- ✅ Cache local de figure_strings
- ✅ Filtro por `supabase_user_id` válido (evita conversas órfãs)
- ✅ Pré-população de conversas novas

### **Parâmetros da Habbo Imaging API**
```
user={habbo_name}         - Buscar por nome
figure={figure_string}    - Usar figure string específica
size=l                    - Tamanho (s, m, l)
direction=2/4             - Direção do corpo (0-7)
head_direction=2/4        - Direção da cabeça (0-7)
headonly=1                - Apenas cabeça (usado no chat)
gesture=spk/nrm           - Gesto de fala (spk=falando, nrm=normal)
action=std                - Ação (std, wlk, sit, wav)
```

### **Animação de Fala**
```typescript
// Alternar entre spk e nrm a cada 300ms por 2 segundos
setInterval(() => {
  setCurrentGesture(prev => prev === 'spk' ? 'nrm' : 'spk');
}, 300);

setTimeout(() => {
  clearInterval(interval);
  setCurrentGesture('nrm');
}, 2000);
```

## 📊 Status Atual

### **✅ Funcionando (Beta Ready)**
- ✅ Sistema de autenticação completo
- ✅ Console de usuários com todas as abas funcionais
- ✅ **Chat completo com real-time, bloqueios e denúncias**
- ✅ Sistema de homes funcional
- ✅ Ferramentas básicas operacionais
- ✅ APIs integradas e funcionais
- ✅ Animações de avatar (gesture system)

### **🔄 Em Desenvolvimento**
- TraxMachine (editor de música)
- Sistema de notificações push
- Dashboard de moderação para denúncias
- Analytics de uso

### **📋 Próximos Passos (Pré-Produção)**
- ⚠️ Reabilitar RLS em `habbo_accounts` com políticas corretas
- ⚠️ Implementar rate limiting no chat (anti-spam)
- ⚠️ Sistema de logging condicional (remover console.logs)
- ⚠️ Consolidar serviços duplicados de clothing/habbo data
- 📝 Adicionar backup automático de mensagens
- 📝 Implementar sistema de moderação automática
- 📝 Criar página de status do sistema

## 🚨 Troubleshooting

### **Problemas Comuns**

#### **Geral**
1. **Imagens não carregam**: Verificar fallbacks e APIs
2. **Console não funciona**: Verificar autenticação e dados do usuário
3. **Homes não carregam**: Verificar configuração do Supabase

#### **Chat Específico**
1. **Conversas não aparecem**:
   - Verificar se `supabase_user_id` existe em `auth.users`
   - Checar RLS policies em `chat_messages`
   - Confirmar que `fetchConversations` está filtrando por IDs válidos

2. **Mensagens não chegam em real-time**:
   - Verificar conexão do Realtime Channel
   - Checar se subscription está ativa no console
   - Confirmar que `receiver_id` está correto

3. **Avatares não aparecem no chat**:
   - Verificar se `figure_string` está salvo no banco
   - Testar URL da Habbo Imaging API diretamente
   - Confirmar parâmetros: `headonly=1`, `direction=2/4`

4. **Erro 403 Forbidden em habbo_accounts**:
   - Verificar se RLS está configurado corretamente
   - Confirmar que usuário está autenticado
   - Checar se está usando anon key (não service role key)

5. **Animação de fala não funciona**:
   - Verificar se `gesture=spk/nrm` está na URL
   - Confirmar que `setInterval` está rodando
   - Checar se `speakingAvatar` state está sendo atualizado

6. **"Carregando..." ao abrir chat**:
   - Verificar se conversa foi adicionada ao state `conversations`
   - Confirmar que `fetchMessages` está sendo chamado
   - Checar se `selectedConversation` tem todos os dados

### **Logs e Debug**
- Console do navegador para erros frontend
- Supabase logs para problemas de banco
- Vercel logs para problemas de deploy
- Network tab para verificar requisições da API

### **Comandos Úteis**
```bash
# Verificar tipos do Supabase
npx supabase gen types typescript --project-id wueccgeizznjmjgmuscy

# Limpar cache do build
rm -rf dist/ node_modules/.vite

# Resetar banco local (desenvolvimento)
npx supabase db reset
```

---

## 📝 Histórico de Atualizações

### **v3.0 - Sistema de Chat Completo** (Janeiro 2025)
- ✅ Implementado sistema de chat com real-time
- ✅ Animações de avatar com gesture system
- ✅ Sistema de bloqueio e denúncia
- ✅ Exclusão de conversas
- ✅ Otimizações de performance
- ✅ Correção de bugs de UUID e autenticação
- ✅ Removido `useBeebopAccountInitializer` obsoleto
- ✅ Implementado filtro de conversas válidas

### **v2.0 - Sistema Consolidado** (2024)
- Sistema de autenticação via motto
- Console com perfis personalizáveis
- Homes customizáveis
- Editor de avatar e ferramentas

---

**Última atualização**: 08/01/2025 20:30
**Versão**: 3.0 (Chat System + Beta Ready)
**Status**: 🟢 Pronto para Beta Fechado
