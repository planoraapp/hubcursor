
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [habboName, setHabboName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { connectHabboAccount } = useSimpleAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habboName.trim()) {
      toast({
        title: "Erro",
        description: "Digite seu nome de usuário Habbo",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await connectHabboAccount(habboName.trim());
      toast({
        title: "Sucesso!",
        description: "Login realizado com sucesso!"
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Erro ao fazer login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8 bg-repeat min-h-screen" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
            <div className="max-w-md mx-auto mt-20">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <User className="w-8 h-8 text-white" />
                  <h1 className="text-4xl font-bold text-white volter-font"
                      style={{
                        textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                      }}>
                    🔐 Login
                  </h1>
                </div>
                <p className="text-lg text-white/90 volter-font drop-shadow">
                  Conecte sua conta Habbo ao HabboHub
                </p>
              </div>
              
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
                <CardHeader>
                  <CardTitle className="volter-font text-2xl text-gray-900 text-center">
                    Conectar Conta Habbo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="habboName" className="volter-font text-gray-700">
                        Nome de usuário Habbo
                      </Label>
                      <Input
                        id="habboName"
                        type="text"
                        value={habboName}
                        onChange={(e) => setHabboName(e.target.value)}
                        placeholder="Digite seu nome Habbo"
                        className="mt-1"
                        disabled={isLoading}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full habbo-button-blue volter-font"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Conectando...' : 'Conectar'}
                    </Button>
                  </form>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 volter-font">
                      Digite apenas seu nome de usuário Habbo para conectar sua conta.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Login;
