import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, CheckCircle2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginByMottoProps {
  onLoginSuccess?: () => void;
}

export const LoginByMotto: React.FC<LoginByMottoProps> = ({ onLoginSuccess }) => {
  const [habboName, setHabboName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'generate' | 'verify'>('generate');
  const { toast } = useToast();

  const generateVerificationCode = () => {
    const randomNum = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `HUB-${randomNum}`;
  };

  const handleGenerateCode = async () => {
    if (!habboName.trim()) {
      toast({
        title: "Erro",
        description: "Digite seu nome de usuário Habbo primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingCode(true);
    
    // Simular delay de processamento
    setTimeout(() => {
      const code = generateVerificationCode();
      setVerificationCode(code);
      setStep('verify');
      setIsGeneratingCode(false);
      
      toast({
        title: "Código Gerado!",
        description: `Código de verificação: ${code}`,
      });
    }, 1500);
  };

  const handleVerifyCode = async () => {
    setIsVerifying(true);
    
    // Simular verificação (aqui seria implementada a lógica real)
    setTimeout(() => {
      setIsVerifying(false);
      
      toast({
        title: "Verificação Concluída!",
        description: `Login realizado com sucesso via motto!`,
      });
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationCode);
    toast({
      title: "Código Copiado!",
      description: "O código foi copiado para a área de transferência",
    });
  };

  const resetProcess = () => {
    setStep('generate');
    setVerificationCode('');
    setHabboName('');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="habboNameMotto" className="volter-font text-gray-700">
          Nome de usuário Habbo
        </Label>
        <Input
          id="habboNameMotto"
          type="text"
          value={habboName}
          onChange={(e) => setHabboName(e.target.value)}
          placeholder="Digite seu nome Habbo"
          className="mt-1"
          disabled={step === 'verify' || isGeneratingCode}
        />
      </div>

      {step === 'generate' && (
        <Button 
          onClick={handleGenerateCode}
          className="w-full habbo-button-green volter-font"
          disabled={isGeneratingCode || !habboName.trim()}
        >
          {isGeneratingCode ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando Código...
            </>
          ) : (
            'Gerar Código de Verificação'
          )}
        </Button>
      )}

      {step === 'verify' && verificationCode && (
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-800 volter-font text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Código de Verificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={verificationCode}
                  readOnly
                  className="font-mono text-lg text-center bg-white border-blue-300"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="px-3"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-sm text-blue-700 volter-font space-y-2">
                <p className="font-bold">📋 INSTRUÇÕES:</p>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Copie o código acima</li>
                  <li>Vá para o Hotel Habbo</li>
                  <li>Mude seu <strong>motto/missão</strong> para: <code className="bg-blue-100 px-1 rounded">{verificationCode}</code></li>
                  <li>Clique em "Verificar Login" abaixo</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button 
              onClick={handleVerifyCode}
              className="flex-1 habbo-button-blue volter-font"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Login'
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={resetProcess}
              disabled={isVerifying}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center volter-font">
            💡 O sistema verificará se o código está na sua missão no Hotel
          </div>
        </div>
      )}
    </div>
  );
};