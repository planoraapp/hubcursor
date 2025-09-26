# Sistema de Notificações Centralizado

Este documento explica como usar o sistema de notificações implementado no HabboHub.

## Características

- **Posicionamento**: Notificações aparecem centralizadas no topo da tela
- **Layout**: Horizontal com ícone, título, mensagem e botões de ação
- **Tipos**: Sucesso, erro, aviso, informação e personalizada
- **Animações**: Entrada suave do topo e saída automática
- **Auto-remoção**: Configurável (padrão 5 segundos)
- **Ações**: Botões de ação opcionais
- **Múltiplas**: Suporte a múltiplas notificações empilhadas

## Como Usar

### 1. Hook Básico

```tsx
import { useNotification } from '@/hooks/useNotification';

function MyComponent() {
  const { addNotification, removeNotification, clearAllNotifications } = useNotification();

  const showNotification = () => {
    addNotification({
      type: 'success',
      title: 'Sucesso!',
      message: 'Operação realizada com sucesso.',
      duration: 5000, // 5 segundos (opcional)
    });
  };

  return <button onClick={showNotification}>Mostrar Notificação</button>;
}
```

### 2. Hook Rápido (Recomendado)

```tsx
import { useQuickNotification } from '@/hooks/useNotification';

function MyComponent() {
  const { success, error, warning, info, custom } = useQuickNotification();

  const handleClick = () => {
    success('Título', 'Mensagem opcional');
    // ou
    error('Erro!', 'Algo deu errado');
    // ou
    warning('Atenção!', 'Verifique os dados');
    // ou
    info('Informação', 'Dica importante');
    // ou
    custom('Personalizada', 'Com ícone customizado', {
      icon: <span>🎉</span>,
      duration: 0, // Não remove automaticamente
    });
  };

  return <button onClick={handleClick}>Mostrar Notificação</button>;
}
```

### 3. Com Ações

```tsx
const { success } = useQuickNotification();

const showWithAction = () => {
  success('Ação disponível', 'Clique para executar', {
    action: {
      label: 'Executar',
      onClick: () => {
        console.log('Ação executada!');
      },
    },
    duration: 0, // Não remove automaticamente
  });
};
```

### 4. Notificação Persistente

```tsx
const { custom } = useQuickNotification();

const showPersistent = () => {
  custom('Importante', 'Esta notificação não desaparece sozinha', {
    duration: 0, // 0 = não remove automaticamente
  });
};
```

## Tipos de Notificação

| Tipo | Ícone | Cor | Uso |
|------|-------|-----|-----|
| `success` | ✅ CheckCircle | Verde | Operações bem-sucedidas |
| `error` | ❌ AlertCircle | Vermelho | Erros e falhas |
| `warning` | ⚠️ AlertTriangle | Amarelo | Avisos e alertas |
| `info` | ℹ️ Info | Azul | Informações gerais |
| `custom` | 🔔 Bell | Cinza | Notificações personalizadas |

## Propriedades

### Notification

```typescript
interface Notification {
  id: string;                    // Gerado automaticamente
  type: 'success' | 'error' | 'warning' | 'info' | 'custom';
  title: string;                 // Título obrigatório
  message?: string;              // Mensagem opcional
  icon?: React.ReactNode;        // Ícone personalizado
  duration?: number;             // Duração em ms (0 = persistente)
  action?: {                     // Ação opcional
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;          // Callback ao fechar
}
```

## Exemplos Práticos

### Cópia de Código de Verificação
```tsx
const { success, error } = useQuickNotification();

const handleCopyCode = async () => {
  try {
    await navigator.clipboard.writeText(verificationCode);
    success('Código copiado!', 'Cole na sua motto do Habbo');
  } catch (err) {
    error('Erro ao copiar', 'Copie manualmente o código');
  }
};
```

### Login Bem-sucedido
```tsx
const { success } = useQuickNotification();
success('Login realizado!', 'Bem-vindo de volta!');
```

### Erro de Validação
```tsx
const { error } = useQuickNotification();
error('Dados inválidos', 'Verifique o formulário e tente novamente.');
```

### Aviso de Sistema
```tsx
const { warning } = useQuickNotification();
warning('Manutenção programada', 'O sistema ficará indisponível das 2h às 4h.');
```

### Notificação com Ação
```tsx
const { info } = useQuickNotification();
info('Nova versão disponível', 'Atualize para a versão mais recente.', {
  action: {
    label: 'Atualizar',
    onClick: () => window.location.reload(),
  },
});
```

## Estilização

As notificações usam classes Tailwind CSS e podem ser customizadas através das variáveis CSS:

- Cores de fundo e borda por tipo
- Animações de entrada e saída
- Layout responsivo
- Suporte a tema escuro

## Integração

O sistema já está integrado no `main.tsx` e disponível em toda a aplicação através dos hooks `useNotification` e `useQuickNotification`.
