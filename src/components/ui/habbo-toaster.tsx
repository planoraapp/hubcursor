import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { HabboToast } from './habbo-toast';

export function HabboToaster() {
  const { toasts } = useToast();

  const getVariant = (toast: any): 'success' | 'error' | 'warning' | 'info' => {
    // Verificar variant explícito
    if (toast.variant === 'destructive') {
      return 'error';
    }
    
    // Verificar por emojis ou palavras-chave no título
    const titleStr = toast.title?.toString() || '';
    
    if (titleStr.includes('✅') || titleStr.includes('Sucesso') || titleStr.includes('sucesso')) {
      return 'success';
    }
    if (titleStr.includes('❌') || titleStr.includes('Erro') || titleStr.includes('erro') || titleStr.includes('Falha')) {
      return 'error';
    }
    if (titleStr.includes('⚠️') || titleStr.includes('Aviso') || titleStr.includes('aviso') || titleStr.includes('Atenção')) {
      return 'warning';
    }
    
    // Verificar por emojis ou palavras-chave na descrição
    const descStr = toast.description?.toString() || '';
    if (descStr.includes('✅') || descStr.includes('sucesso')) {
      return 'success';
    }
    if (descStr.includes('❌') || descStr.includes('erro') || descStr.includes('falha')) {
      return 'error';
    }
    if (descStr.includes('⚠️') || descStr.includes('aviso') || descStr.includes('atenção')) {
      return 'warning';
    }
    
    return 'info';
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
      {toasts.map((toast) => {
        const variant = getVariant(toast);

        return (
          <div key={toast.id} className="pointer-events-auto w-full">
            <HabboToast
              id={toast.id}
              title={toast.title}
              description={toast.description}
              variant={variant}
              open={toast.open}
              onOpenChange={toast.onOpenChange}
              duration={5000}
            />
          </div>
        );
      })}
    </div>
  );
}

