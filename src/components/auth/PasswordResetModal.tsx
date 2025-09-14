
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Info, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [habboName, setHabboName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateVerificationCode = () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    setVerificationCode(`HUB-${code}`);
    setStep(2);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Código copiado!",
        description: "Cole na sua motto do Habbo"
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Copie manualmente o código",
        variant: "destructive"
      });
    }
  };

  const handleResetPassword = async () => {
    if (!habboName.trim() || !newPassword.trim() || !verificationCode.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('reset-password-via-motto', {
        body: {
          habboName: habboName.trim(),
          verificationCode: verificationCode.trim(),
          newPassword: newPassword
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro na requisição');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Sucesso!",
        description: data.message || "Senha redefinida com sucesso!"
      });

      setStep(3);
    } catch (error: any) {
            toast({
        title: "Erro",
        description: error.message || 'Erro ao redefinir senha',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setHabboName('');
    setNewPassword('');
    setVerificationCode('');
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Redefinir Senha"}
            {step === 2 && "Verificar Motto"}
            {step === 3 && "Senha Redefinida"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome Habbo</label>
                <Input
                  type="text"
                  placeholder="Digite seu nome Habbo"
                  value={habboName}
                  onChange={(e) => setHabboName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nova Senha</label>
                <Input
                  type="password"
                  placeholder="Digite sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Para redefinir sua senha, você precisará verificar sua identidade através da sua motto no Habbo.
                </AlertDescription>
              </Alert>

              <Button
                onClick={generateVerificationCode}
                className="w-full"
                disabled={!habboName.trim() || !newPassword.trim()}
              >
                Gerar Código de Verificação
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium">Código de Verificação</label>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={generateVerificationCode}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Gerar Novo
                  </Button>
                  {verificationCode && (
                    <Button
                      type="button"
                      onClick={handleCopyCode}
                      variant="outline"
                      className="px-3"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  )}
                </div>

                {verificationCode && (
                  <Badge variant="secondary" className="w-full justify-center p-2 font-mono text-lg">
                    {verificationCode}
                  </Badge>
                )}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    1. Copie o código acima<br/>
                    2. Vá ao Habbo Hotel e cole na sua motto<br/>
                    3. Clique em "Redefinir Senha" abaixo
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleResetPassword}
                  className="w-full"
                  disabled={isLoading || !verificationCode}
                >
                  {isLoading ? 'Verificando...' : 'Redefinir Senha'}
                </Button>
                
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="w-full"
                >
                  Voltar
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="text-green-600 text-lg font-semibold">
                ✅ Senha redefinida com sucesso!
              </div>
              <p className="text-sm text-gray-600">
                Sua senha foi atualizada. Agora você pode fazer login com a nova senha.
              </p>
              <Button onClick={resetModal} className="w-full">
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
