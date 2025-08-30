import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, CheckCircle2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface LoginByMottoProps {
  onLoginSuccess?: () => void;
}

export const LoginByMotto: React.FC<LoginByMottoProps> = ({ onLoginSuccess }) => {
  const [habboName, setHabboName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompletingRegistration, setIsCompletingRegistration] = useState(false);
  const [step, setStep] = useState<'generate' | 'verify' | 'password'>('generate');
  const [habboData, setHabboData] = useState<any>(null);
  const [hotel, setHotel] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { loginWithPassword } = useUnifiedAuth();

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
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-and-register-via-motto', {
        body: {
          habbo_name: habboName.trim(),
          action: 'generate'
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setVerificationCode(data.verification_code);
      setHabboData(data.habbo_data);
      setHotel(data.hotel);
      setStep('verify');
      
      toast({
        title: "Código Gerado!",
        description: `Código de verificação: ${data.verification_code}`,
      });
    } catch (error: any) {
      console.error('❌ Error generating code:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar código. Verifique se o usuário Habbo existe.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Erro",
        description: "Digite o código de verificação",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      console.log('🔍 [VERIFY] Starting verification for:', habboName, 'with code:', verificationCode);
      
      const { data, error } = await supabase.functions.invoke('verify-and-register-via-motto', {
        body: {
          habbo_name: habboName.trim(),
          verification_code: verificationCode,
          action: 'verify'
        }
      });

      console.log('📡 [VERIFY] Edge function response:', { data, error });

      if (error) {
        console.error('❌ [VERIFY] Supabase function error:', error);
        let errorMessage = 'Erro ao verificar código';
        
        if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        throw new Error(errorMessage);
      }

      if (data.error) {
        console.log('❌ [VERIFY] Function returned error:', data.error);
        throw new Error(data.error);
      }

      if (data.verified || data.success) {
        console.log('✅ [VERIFY] Verification successful:', data);
        setStep('password');
        toast({
          title: "Código Verificado!",
          description: "Agora crie uma senha de 6 caracteres para sua conta.",
        });
      } else {
        throw new Error("Verificação falhou - resposta inesperada do servidor");
      }
    } catch (error: any) {
      console.error('❌ [VERIFY] Caught exception:', error);
      let errorMessage = error.message || 'Erro ao verificar código. Tente novamente.';
      
      if (error.message && error.message.includes('Edge Function returned a non-2xx status code')) {
        errorMessage = 'Erro no servidor. Verifique se o usuário Habbo existe e tente novamente.';
      } else if (error.message && error.message.includes('not found')) {
        errorMessage = 'Usuário Habbo não encontrado. Verifique o nome e tente novamente.';
      } else if (!error.message) {
        errorMessage = "Código não encontrado na missão. Verifique se colocou o código completo na sua missão no Hotel.";
      }
      
      toast({
        title: "Erro na Verificação",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (password.length !== 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter exatamente 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsCompletingRegistration(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-and-register-via-motto', {
        body: {
          habbo_name: habboName.trim(),
          verification_code: verificationCode,
          password: password,
          action: 'complete'
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: data.user_created ? "Conta Criada!" : "Senha Redefinida!",
        description: `${data.user_created ? 'Bem-vindo ao Habbo Hub' : 'Senha atualizada com sucesso'}! Fazendo login...`,
      });

      // Auto-login após registro/redefinição
      setTimeout(async () => {
        try {
          await loginWithPassword(habboName.trim(), password);
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        } catch (loginError: any) {
          console.error('❌ Auto-login error:', loginError);
          toast({
            title: "Conta criada com sucesso!",
            description: "Use a aba 'Por Senha' para fazer login com sua nova senha.",
          });
        }
      }, 1000);

    } catch (error: any) {
      console.error('❌ Error completing registration:', error);
      toast({
        title: "Erro no Registro",
        description: error.message || "Erro ao completar o registro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCompletingRegistration(false);
    }
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
    setPassword('');
    setHabboName('');
    setHabboData(null);
    setHotel('');
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
          disabled={step !== 'generate' || isGeneratingCode}
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
              
              <div className="text-sm text-primary volter-font space-y-2">
                <p className="font-bold">📋 INSTRUÇÕES:</p>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Copie o código acima</li>
                  <li>Vá para o Hotel Habbo</li>
                  <li>Mude seu <strong>motto/missão</strong> para: <code className="bg-primary/10 px-1 rounded">{verificationCode}</code></li>
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
          
          <div className="text-xs text-muted-foreground text-center volter-font">
            💡 O sistema verificará se o código está na sua missão no Hotel
          </div>
        </div>
      )}

      {step === 'password' && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-primary volter-font text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Criar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-primary volter-font space-y-2">
                <p>✅ Código verificado com sucesso!</p>
                <p>Agora crie uma senha de <strong>6 caracteres</strong> para sua conta:</p>
              </div>
              
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite 6 caracteres"
                  maxLength={6}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Senha: {password.length}/6 caracteres
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button 
              onClick={handleCompleteRegistration}
              className="flex-1 habbo-button-green volter-font"
              disabled={isCompletingRegistration || password.length !== 6}
            >
              {isCompletingRegistration ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando Conta...
                </>
              ) : (
                'Criar Conta & Login'
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={resetProcess}
              disabled={isCompletingRegistration}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center volter-font">
            🏠 Sua Habbo Home será criada automaticamente!
          </div>
        </div>
      )}
    </div>
  );
};