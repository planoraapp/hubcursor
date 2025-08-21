
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Key, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { LoginByMotto } from '@/components/auth/LoginByMotto';

const Login = () => {
  const [habboName, setHabboName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('password');
  const { loginWithPassword } = useAuth();
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

    if (!password.trim()) {
      toast({
        title: "Erro", 
        description: "Digite sua senha",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await loginWithPassword(habboName.trim(), password.trim());
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

  const handleMottoLoginSuccess = () => {
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8 bg-repeat min-h-screen" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
            <div className="max-w-md mx-auto mt-20">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <img 
                    src="/assets/habbohub.gif" 
                    alt="Habbo Hub" 
                    className="h-16 w-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/assets/habbohub.png";
                    }}
                  />
                </div>
                <p className="text-lg text-white/90 volter-font drop-shadow">
                  Entre com sua conta Habbo
                </p>
              </div>
              
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
                <CardHeader>
                  <CardTitle className="volter-font text-2xl text-gray-900 text-center">
                    Entrar na Conta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="password" className="volter-font flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Por Senha
                      </TabsTrigger>
                      <TabsTrigger value="motto" className="volter-font flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Por Motto
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="password" className="mt-4">
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
                        <div>
                          <Label htmlFor="password" className="volter-font text-gray-700">
                            Senha
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha"
                            className="mt-1"
                            disabled={isLoading}
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full habbo-button-blue volter-font"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Entrando...' : 'Entrar com Senha'}
                        </Button>
                      </form>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 volter-font">
                          Use suas credenciais Habbo para fazer login.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="motto" className="mt-4">
                      <LoginByMotto onLoginSuccess={handleMottoLoginSuccess} />
                      <div className="mt-4 text-center">
                        <p className="text-sm text-muted-foreground volter-font">
                          Login seguro via verificação de motto no Hotel. Para novos usuários.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
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
