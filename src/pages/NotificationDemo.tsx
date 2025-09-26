import React from 'react';
import { useQuickNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';
import { TestHomesData } from '@/components/TestHomesData';

const NotificationDemo: React.FC = () => {
  const { success, error, warning, info, custom } = useQuickNotification();

  const handleCopyCode = async () => {
    const verificationCode = 'HUB-ABC123';
    try {
      await navigator.clipboard.writeText(verificationCode);
      success('Código copiado!', 'Cole na sua motto do Habbo');
    } catch (err) {
      error('Erro ao copiar', 'Copie manualmente o código');
    }
  };

  const handleSuccess = () => {
    success('Login realizado!', 'Bem-vindo de volta ao HabboHub!');
  };

  const handleError = () => {
    error('Erro de validação', 'Verifique o formulário e tente novamente.');
  };

  const handleWarning = () => {
    warning('Manutenção programada', 'O sistema ficará indisponível das 2h às 4h.');
  };

  const handleInfo = () => {
    info('Nova versão disponível', 'Atualize para a versão mais recente.');
  };

  const handleCustom = () => {
    custom('Notificação personalizada', 'Com ícone e estilo customizado.', {
      icon: <span className="text-2xl">🎉</span>,
      duration: 0, // Não remove automaticamente
    });
  };

  const handleWithAction = () => {
    success('Ação disponível', 'Clique no botão para executar uma ação.', {
      action: {
        label: 'Executar',
        onClick: () => {
          alert('Ação executada com sucesso!');
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url(/assets/bghabbohub.png)', backgroundRepeat: 'repeat' }}>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🎯 Sistema de Notificações - Demonstração
            </CardTitle>
            <p className="text-center text-gray-600">
              Teste o novo sistema de notificações centralizadas
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Seção de cópia de código */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                <Copy className="w-5 h-5 mr-2" />
                Cópia de Código de Verificação
              </h3>
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 px-4 py-2 rounded border font-mono text-lg font-bold">
                  HUB-ABC123
                </div>
                <Button onClick={handleCopyCode} className="bg-yellow-600 hover:bg-yellow-700">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Código
                </Button>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Este é o exemplo de notificação que aparece quando você copia um código de verificação.
              </p>
            </div>

            {/* Grid de exemplos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="space-y-3">
                <h4 className="font-semibold text-green-700 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Sucesso
                </h4>
                <Button onClick={handleSuccess} className="w-full bg-green-500 hover:bg-green-600">
                  Testar Sucesso
                </Button>
                <p className="text-xs text-gray-600">
                  Para operações bem-sucedidas, login, cadastro, etc.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-red-700 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Erro
                </h4>
                <Button onClick={handleError} className="w-full bg-red-500 hover:bg-red-600">
                  Testar Erro
                </Button>
                <p className="text-xs text-gray-600">
                  Para erros de validação, falhas de conexão, etc.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-yellow-700 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Aviso
                </h4>
                <Button onClick={handleWarning} className="w-full bg-yellow-500 hover:bg-yellow-600">
                  Testar Aviso
                </Button>
                <p className="text-xs text-gray-600">
                  Para avisos importantes, manutenções, etc.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-blue-700 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Informação
                </h4>
                <Button onClick={handleInfo} className="w-full bg-blue-500 hover:bg-blue-600">
                  Testar Info
                </Button>
                <p className="text-xs text-gray-600">
                  Para informações gerais, dicas, novidades.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-purple-700 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Personalizada
                </h4>
                <Button onClick={handleCustom} className="w-full bg-purple-500 hover:bg-purple-600">
                  Testar Custom
                </Button>
                <p className="text-xs text-gray-600">
                  Para notificações com ícone e estilo personalizado.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-indigo-700 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Com Ação
                </h4>
                <Button onClick={handleWithAction} className="w-full bg-indigo-500 hover:bg-indigo-600">
                  Testar Ação
                </Button>
                <p className="text-xs text-gray-600">
                  Para notificações com botão de ação opcional.
                </p>
              </div>

            </div>

            {/* Informações sobre o sistema */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">ℹ️ Sobre o Sistema</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Posicionamento:</strong> Centralizado no topo da tela</li>
                <li>• <strong>Layout:</strong> Horizontal com ícone, título e mensagem</li>
                <li>• <strong>Auto-remoção:</strong> 5 segundos (configurável)</li>
                <li>• <strong>Animações:</strong> Entrada suave do topo</li>
                <li>• <strong>Múltiplas:</strong> Suporte a várias notificações empilhadas</li>
                <li>• <strong>Ações:</strong> Botões de ação opcionais</li>
              </ul>
            </div>

          </CardContent>
        </Card>

        {/* Debug das Homes */}
        <TestHomesData />
      </div>
    </div>
  );
};

export default NotificationDemo;
