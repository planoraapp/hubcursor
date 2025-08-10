
import React, { useState } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const LoginByMissao = () => {
  const [habboName, setHabboName] = useState('');
  const [mission, setMission] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUnifiedAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habboName.trim() || !mission.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // For mission login, we use the mission as password
      await login(habboName, mission);
      toast({
        title: "Sucesso",
        description: `Bem-vindo, ${habboName}!`
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || 'Erro no login por missão',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="habbo-name-mission">Nome Habbo</Label>
        <Input
          id="habbo-name-mission"
          type="text"
          value={habboName}
          onChange={(e) => setHabboName(e.target.value)}
          placeholder="Seu nome no Habbo"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="mission">Missão Temporária</Label>
        <Input
          id="mission"
          type="text"
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          placeholder="Digite sua missão temporária"
          required
        />
      </div>
      
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
        <p><strong>Como funciona:</strong></p>
        <p>1. Coloque esta missão no seu perfil Habbo temporariamente</p>
        <p>2. Clique em "Verificar Login"</p>
        <p>3. Remova a missão após o login</p>
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Verificando...' : 'Verificar Login por Missão'}
      </Button>
    </form>
  );
};
