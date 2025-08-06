
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { useNavigate } from 'react-router-dom';

export const SimplifiedLoginForm = () => {
  const [habboName, setHabboName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { simpleLogin } = useSimplifiedAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habboName.trim() || !password) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu nome Habbo e senha.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await simpleLogin(habboName.trim(), password);
      
      toast({
        title: "Sucesso",
        description: `Bem-vindo, ${habboName}!`
      });
      
      navigate('/');
      
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique suas credenciais",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-repeat bg-cover flex items-center justify-center p-4"
         style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <Card className="w-full max-w-md bg-white border-2 border-gray-900 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-center volter-font text-xl">
            Login Habbo Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="habboName" className="block text-sm font-medium text-gray-700 mb-2 volter-font">
                Nome Habbo:
              </label>
              <Input
                id="habboName"
                type="text"
                value={habboName}
                onChange={(e) => setHabboName(e.target.value)}
                placeholder="Digite seu nome Habbo"
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 volter-font">
                Senha:
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 volter-font mb-2">Conta de Teste:</h3>
            <p className="text-sm text-blue-700">
              <strong>Nome:</strong> Beebop<br />
              <strong>Senha:</strong> 290684
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
