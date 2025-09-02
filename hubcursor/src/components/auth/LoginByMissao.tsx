
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Info, RefreshCw, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getUserByName } from '@/services/habboApiMultiHotel';

export const LoginByMissao: React.FC = () => {
  const [habboName, setHabboName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentMotto, setCurrentMotto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMotto, setIsLoadingMotto] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateVerificationCode = () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    setVerificationCode(`HUB-${code}`);
  };

  const handleCopyCode = async () => {
    if (!verificationCode) return;
    
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

  const fetchCurrentMotto = async () => {
    if (!habboName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome Habbo primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingMotto(true);
    try {
      const habboUser = await getUserByName(habboName);
      if (habboUser && habboUser.motto) {
        setCurrentMotto(habboUser.motto);
        toast({
          title: "Motto encontrada!",
          description: `Motto atual: "${habboUser.motto}"`
        });
      } else {
        toast({
          title: "Erro",
          description: "Usuário não encontrado ou perfil privado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar motto:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar motto atual",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMotto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habboName.trim() || !verificationCode.trim() || !newPassword.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('register-or-reset-via-motto', {
        body: {
          habboName: habboName.trim(),
          verificationCode: verificationCode.trim(),
          newPassword: newPassword,
          hotel: 'br'
        }
      });

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || 'Erro na requisição');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Sucesso!",
        description: data?.message || "Operação realizada com sucesso!"
      });

      // Reset form
      setHabboName('');
      setNewPassword('');
      setVerificationCode('');
      setCurrentMotto('');

    } catch (error: any) {
      console.error('Motto verification error:', error);
      
      let errorMessage = error.message || 'Erro na verificação';
      
      // Handle specific error cases
      if (errorMessage.includes('não encontrado')) {
        errorMessage = 'Usuário não encontrado no Habbo Hotel';
      } else if (errorMessage.includes('altere sua missão')) {
        errorMessage = `Altere sua missão no Habbo para incluir: ${verificationCode}`;
      } else if (errorMessage.includes('código não encontrado')) {
        errorMessage = `Código ${verificationCode} não encontrado na sua missão. Verifique se você copiou corretamente.`;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="missao-habbo" className="text-sm font-medium">
          Nome Habbo
        </label>
        <div className="flex gap-2">
          <Input
            id="missao-habbo"
            type="text"
            placeholder="Digite seu nome Habbo"
            value={habboName}
            onChange={(e) => setHabboName(e.target.value)}
            className="border-2 border-gray-300 focus:border-blue-500"
            disabled={isLoading}
          />
          <Button
            type="button"
            onClick={fetchCurrentMotto}
            variant="outline"
            disabled={isLoadingMotto || !habboName.trim() || isLoading}
          >
            {isLoadingMotto ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        </div>
        {currentMotto && (
          <div className="text-xs text-gray-600 mt-1">
            <strong>Motto atual:</strong> "{currentMotto}"
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="missao-password" className="text-sm font-medium">
          Nova Senha
        </label>
        <Input
          id="missao-password"
          type="password"
          placeholder="Defina uma nova senha (mín. 6 caracteres)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border-2 border-gray-300 focus:border-blue-500"
          minLength={6}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">Código de Verificação</label>
        
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={generateVerificationCode}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {verificationCode ? 'Gerar Novo' : 'Gerar Código'}
          </Button>
          {verificationCode && (
            <Button
              type="button"
              onClick={handleCopyCode}
              variant="outline"
              className="px-3"
              disabled={isLoading}
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
            1. Gere um código de verificação<br/>
            2. Copie e cole na sua motto do Habbo<br/>
            3. Defina uma nova senha (mínimo 6 caracteres)<br/>
            4. Clique em "Confirmar" para cadastrar/redefinir senha
          </AlertDescription>
        </Alert>
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2"
        disabled={isLoading || !verificationCode || !newPassword || !habboName || newPassword.length < 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          'Confirmar'
        )}
      </Button>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Esta função serve tanto para <strong>cadastrar novos usuários</strong> quanto para <strong>redefinir senhas</strong> de usuários existentes.
        </AlertDescription>
      </Alert>
    </form>
  );
};
