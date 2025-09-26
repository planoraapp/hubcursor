import React from 'react';
import { useQuickNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';

export const NotificationExample: React.FC = () => {
  const { success, error, warning, info, custom } = useQuickNotification();

  const handleSuccess = () => {
    success('Sucesso!', 'Operação realizada com sucesso.');
  };

  const handleError = () => {
    error('Erro!', 'Algo deu errado. Tente novamente.');
  };

  const handleWarning = () => {
    warning('Atenção!', 'Verifique os dados antes de continuar.');
  };

  const handleInfo = () => {
    info('Informação', 'Esta é uma notificação informativa.');
  };

  const handleCustom = () => {
    custom('Personalizada', 'Notificação com ícone personalizado.', {
      icon: <span className="text-2xl">🎉</span>,
      duration: 0, // Não remove automaticamente
    });
  };

  const handleWithAction = () => {
    success('Ação disponível', 'Clique no botão para executar uma ação.', {
      action: {
        label: 'Executar',
        onClick: () => {
          alert('Ação executada!');
        },
      },
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Exemplos de Notificações</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Button onClick={handleSuccess} className="bg-green-500 hover:bg-green-600">
          Sucesso
        </Button>
        
        <Button onClick={handleError} className="bg-red-500 hover:bg-red-600">
          Erro
        </Button>
        
        <Button onClick={handleWarning} className="bg-yellow-500 hover:bg-yellow-600">
          Aviso
        </Button>
        
        <Button onClick={handleInfo} className="bg-blue-500 hover:bg-blue-600">
          Informação
        </Button>
        
        <Button onClick={handleCustom} className="bg-purple-500 hover:bg-purple-600">
          Personalizada
        </Button>
        
        <Button onClick={handleWithAction} className="bg-indigo-500 hover:bg-indigo-600">
          Com Ação
        </Button>
      </div>
    </div>
  );
};
