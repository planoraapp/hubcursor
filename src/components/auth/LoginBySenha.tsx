
import React, { useState } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const LoginBySenha = () => {
  const [habboName, setHabboName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUnifiedAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habboName.trim() || !password.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(habboName, password);
      toast({
        title: "Sucesso",
        description: `Bem-vindo, ${habboName}!`
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || 'Erro no login',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="habbo-name">Nome Habbo</Label>
        <Input
          id="habbo-name"
          type="text"
          value={habboName}
          onChange={(e) => setHabboName(e.target.value)}
          placeholder="Seu nome no Habbo"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar com Senha'}
      </Button>
    </form>
  );
};
