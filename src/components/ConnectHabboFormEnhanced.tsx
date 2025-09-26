import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuickNotification } from '@/hooks/useNotification';
import { useAuth } from '../hooks/useAuth';
import { getUserByName } from '../services/habboApi';

export const ConnectHabboFormEnhanced = () => {
  const [habboName, setHabboName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [habboData, setHabboData] = useState(null);
  
  const { user, habboAccount } = useAuth();
  const { success, error } = useQuickNotification();

  const generateVerificationCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `HUB-${code}`;
  };

  const handleGenerateCode = () => {
    const newCode = generateVerificationCode();
    setVerificationCode(newCode);
    setStep(2);
    
    toast({
      title: "Código Gerado",
      description: `Copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel.`
    });
  };

  const handleVerifyMotto = async () => {
    if (!habboName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu nome Habbo.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const habboUser = await getUserByName(habboName);
      
      if (!habboUser) {
        throw new Error('Usuário não encontrado ou perfil privado');
      }

      const motto = habboUser.motto || '';
      
      if (motto.toLowerCase().includes(verificationCode.toLowerCase())) {
        setHabboData(habboUser);
        setStep(3);
        toast({
          title: "Sucesso",
          description: "Código verificado com sucesso! Conta Habbo conectada."
        });
      } else {
        throw new Error(`Código não encontrado na motto. Motto atual: "${motto}"`);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || 'Erro ao verificar motto',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setHabboName('');
    setVerificationCode('');
    setHabboData(null);
  };

  if (habboAccount) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-green-600">
            Conta Habbo Conectada
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <img 
              src={`https://www.habbo.com/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&direction=2&head_direction=3&size=m`}
              alt={habboAccount.habbo_name}
              className="w-16 h-16"
            />
            <div>
              <p className="font-bold">{habboAccount.habbo_name}</p>
              {habboAccount.is_admin && (
                <Badge className="bg-yellow-500">Admin</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Sua conta Habbo está conectada com sucesso!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">
          {step === 1 && "Conectar Conta Habbo"}
          {step === 2 && "Verificar Motto"}
          {step === 3 && "Conexão Realizada"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome Habbo:
              </label>
              <Input
                type="text"
                value={habboName}
                onChange={(e) => setHabboName(e.target.value)}
                placeholder="Digite seu nome Habbo"
                className="w-full"
              />
            </div>
            <Button
              onClick={handleGenerateCode}
              className="w-full"
              disabled={!habboName.trim()}
            >
              Gerar Código de Verificação
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Copie este código para sua motto no Habbo Hotel:
              </p>
              <div 
                className="bg-gray-100 p-4 rounded-lg border cursor-pointer"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(verificationCode);
                    success('Código copiado!', 'Cole na sua motto do Habbo');
                  } catch (err) {
                    error('Erro ao copiar', 'Copie manualmente o código');
                  }
                }}
              >
                <p className="text-xl font-bold text-blue-600 select-all">
                  {verificationCode}
                </p>
                <span className="text-xs text-gray-500">Clique para copiar</span>
              </div>
              <p className="text-xs text-gray-500">
                Certifique-se de estar online no Habbo e com perfil público.
              </p>
            </div>
            <Button
              onClick={handleVerifyMotto}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Verificando...' : 'Verificar Motto'}
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              className="w-full"
            >
              Voltar
            </Button>
          </>
        )}

        {step === 3 && habboData && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <img 
                src={`https://www.habbo.com/habbo-imaging/avatarimage?user=${habboData.name}&direction=2&head_direction=3&size=m`}
                alt={habboData.name}
                className="w-16 h-16"
              />
              <div>
                <p className="font-bold">{habboData.name}</p>
                <p className="text-sm text-gray-600">{habboData.motto}</p>
              </div>
            </div>
            <Badge className="bg-green-500">Verificado</Badge>
            <p className="text-sm text-green-600">
              Conta Habbo conectada com sucesso!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
